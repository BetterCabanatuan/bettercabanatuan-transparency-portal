/**
 * `npm run snapshot` — saves every API response the portal needs to
 * public/snapshot/, so visitors read stored JSON and never call the API.
 * Runs the portal's own loaders and records what they fetch. Any failure
 * stops before the old snapshot is touched.
 */
import { strict as assert } from 'node:assert';
import { createHash } from 'node:crypto';
import { mkdir, rename, rm, writeFile } from 'node:fs/promises';
import { env, exit } from 'node:process';
import config from '../portal.config.ts';
import { createClient } from '../src/api/client.ts';
import { DEFAULT_API } from '../src/config.ts';
import { resolveGaa } from '../src/lib/gaa.ts';
import { districtIds, resolveScope } from '../src/lib/scope.ts';
import type { DatasetKey } from '../src/config.ts';

const DIR = 'public/snapshot';
const TMP = 'public/.snapshot-tmp';

async function main() {
  const stored = new Map<string, string>();
  const live = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const res = await live(input, init);
    if (res.ok) stored.set(String(input), await res.clone().text());
    return res;
  };

  const api = createClient(env.VITE_API_BASE || config.api || DEFAULT_API);
  await api.overview();
  const scope = await resolveScope(api, config);
  await Promise.all(districtIds(scope, config.scope.districts ?? []).map((id) => api.district(id)));
  await resolveGaa(api, config);
  // A few at a time, as the client does for pages: kind to the API.
  for (let i = 0; i < scope.projects.length; i += 4) {
    await Promise.all(scope.projects.slice(i, i + 4).map((p) => api.project(p.dataset as DatasetKey, p.id)));
  }

  assert(stored.has(api.href('')), 'the overview was not stored');
  for (const p of scope.projects) assert(stored.has(api.href(`/datasets/${p.dataset}/projects/${encodeURIComponent(p.id)}`)), `no detail for ${p.key}`);

  await rm(TMP, { recursive: true, force: true });
  await mkdir(TMP, { recursive: true });
  const manifest: Record<string, string> = {};
  for (const [url, body] of stored) {
    // Named by URL, not position: a tab holding an older manifest must never open another request's file.
    const file = `${createHash('sha256').update(url).digest('hex').slice(0, 16)}.json`;
    manifest[url] = file;
    await writeFile(`${TMP}/${file}`, body);
  }
  await writeFile(`${TMP}/manifest.json`, JSON.stringify(manifest, null, 2));
  await rm(DIR, { recursive: true, force: true });
  await rename(TMP, DIR);
  console.log(`Stored ${stored.size} API responses in ${DIR}: ${scope.projects.length} projects.`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  exit(1);
});
