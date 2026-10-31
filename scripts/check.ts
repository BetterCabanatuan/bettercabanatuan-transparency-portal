/**
 * `npm run check` — runs portal.config.ts against the live API and prints what
 * the portal will show: every query, its count, and the totals. Exits non-zero
 * when the config cannot work (an office name the API does not know, an
 * exclusion that matches nothing, a query too broad to be one place), so it
 * can gate a deploy in CI.
 *
 *   npm run check                                   portal.config.ts
 *   npm run check -- --config=examples/deo.config.ts
 *   npm run check -- --verbose                      list lines to review
 */
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { argv, cwd, env, exit } from 'node:process';
import type { PortalConfig } from '../src/config.ts';
import { createClient } from '../src/api/client.ts';
import { configProblems, DEFAULT_API } from '../src/config.ts';
import { resolveScope, summarise } from '../src/lib/scope.ts';
import { count, php } from '../src/lib/format.ts';

const verbose = argv.includes('--verbose');
// --config=examples/deo.config.ts checks another file; default portal.config.ts.
const configPath = resolve(cwd(), argv.find((a) => a.startsWith('--config='))?.slice('--config='.length) ?? 'portal.config.ts');

async function main() {
  const config = ((await import(pathToFileURL(configPath).href)) as { default: PortalConfig }).default;
  const problems = configProblems(config);
  const warnings: string[] = [];
  const api = createClient(env.VITE_API_BASE || config.api || DEFAULT_API);
  console.log(`${config.name} (${config.kind}) · API ${api.base}\n`);

  const scope = await resolveScope(api, config);

  console.log('Queries');
  for (const q of scope.queries) {
    const what = q.kind === 'office' ? `office "${q.label}"` : `title names "${q.label}" (q=${q.params.q})`;
    const kept = q.region ? ` · ${count(q.kept)} kept in region ${q.region} or giving no region` : '';
    console.log(`  ${q.dataset.padEnd(5)} ${what}: ${count(q.total)}${kept}`);
    if (q.kind === 'office') {
      if (q.total === 0) problems.push(`office "${q.label}" matches no DPWH line. Use the name as published: npm run setup -- --list-offices`);
      const lens = q.officeLens;
      if (lens?.offices.length) {
        for (const o of lens.offices) {
          console.log(`        ${o.tier_text}; districts: ${o.districts.map((d) => d.label).join('; ')}`);
        }
      }
    }
    if (q.truncated) problems.push(`"${q.label}" on ${q.dataset} matches ${count(q.total)} lines, too many for one place. Add a region or more words to q.`);
  }

  for (const { exclusion, project } of scope.excluded) {
    if (!project) problems.push(`exclusion ${exclusion.key} matches no line in the portal; remove it.`);
  }

  // Lines found only by name, under a DPWH office outside the scope: often right
  // (a Central Office project in the place), sometimes a namesake elsewhere.
  const offices = new Set(config.scope.offices ?? []);
  const nameOnly = scope.projects.filter(
    (p) => p.dataset === 'dpwh' && p.office && !offices.has(p.office) && p.office_kind?.startsWith('District') && p.reasons.every((r) => r.kind === 'place'),
  );
  if (nameOnly.length) {
    warnings.push(`${nameOnly.length} DPWH line(s) are here only because the title names the place, but the documents list them under a district office this portal does not include. Review them (--verbose) and exclude any namesakes.`);
    if (verbose) for (const p of nameOnly) console.log(`    ${p.key}  [${p.office}]  ${p.title}`);
  }

  const s = summarise(scope.projects);
  console.log(`\nIn the portal: ${count(s.rows)} lines (${count(scope.excluded.length)} excluded by hand)`);
  console.log(`  NEP:        ${php(s.nep.php)} on ${count(s.nep.rows)} lines`);
  console.log(`  House bill: ${php(s.house.php)} on ${count(s.house.rows)} lines`);
  console.log('  Compared, never added.');
  for (const [g, c] of Object.entries(s.groups)) if (c.rows) console.log(`  ${g.padEnd(13)} ${count(c.rows)}`);
  for (const [d, c] of Object.entries(s.byDataset)) console.log(`  program ${d.padEnd(5)} ${count(c.rows)}`);

  for (const id of config.scope.districts ?? []) {
    try {
      const d = await api.district(id);
      console.log(`  district ${d.data.label} · ${d.data.attribution.label}`);
    } catch {
      problems.push(`district "${id}" is not in the API. List them: npm run setup -- --list-districts`);
    }
  }

  for (const w of warnings) console.log(`\nwarning: ${w}`);
  for (const p of problems) console.log(`\nproblem: ${p}`);
  if (problems.length) exit(1);
  console.log('\nOK');
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  exit(1);
});
