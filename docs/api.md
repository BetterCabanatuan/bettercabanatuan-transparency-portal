# The API this portal reads

Everything comes from the public, read-only, CORS-open BetterGov.ph Budget API
(`https://budget.bettergov.ph/api/v1`), FY 2027 House bill section. Reference:
<https://budget.bettergov.ph/docs>; OpenAPI: `/api/v1/openapi.json`.

| Request | Used for |
| --- | --- |
| `GET /api/v1/hgab/2027` | Program names, status wording (label, sub, help), plain terms, the version names, the document list |
| `GET /api/v1/hgab/2027/datasets/dpwh/projects?office=…` | Every DPWH line under one office, plus the office's tier and the districts it serves (`office_lens`) |
| `GET /api/v1/hgab/2027/datasets/{program}/projects?q=…` | Every line in a program whose title names a place |
| `GET /api/v1/hgab/2027/datasets/{program}/projects/{id}` | One project: every version's amount and PDF page, match and reading labels, notes |
| `GET /api/v1/hgab/2027/districts/{id}` | A district card: representative, offices, tiers, 2027 figures |
| `GET /api/v1/hgab/2027/districts` | `npm run setup` only: every district and office, to find names and ids |

Lists are paged at 200 rows; the client fetches every page (`allProjects` in
`src/api/client.ts`), four at a time. A query that matches more than 4,000 rows is cut
there and `npm run check` fails, since no single place should match that many.

Every response carries `meta` (with `notice`, the source commit and build date) and
`disclaimers`. The portal prints both as they come.

## Details worth knowing

- The `office` filter matches the office **as the documents publish it**
  ("Bohol 1st District Engineering Office"), not the short card name ("Bohol 1st DEO").
  `npm run setup -- --list-offices` prints the published names; they come from each
  office's FY 2027 `matched_label` on its district page.
- The irrigation list gives no region, so the API's `region` filter would drop every
  irrigation line. The portal applies a place's region itself and keeps lines with no
  region.
- `house_php` is the House bill amount the comparison uses: third reading for DPWH,
  second reading for the other three programs (their lists are the same at both
  readings).
- `delta_php` is null when one version has no such line.

## Gaps

What a portal would use if the API had it, in order of value:

1. **Where a project is, by city or municipality.** The source workbench's location lens
   places each DPWH line by the place its title names (PSGC), falling back to the office.
   It is imported on the `hgab-project-locations` branch of budget.bettergov.ph, by
   legislative district, but it is not in the API and it does not expose the
   city/municipality code per line. With
   `GET /api/v1/hgab/2027/places/{psgc}/projects` (or `?psgc=` on the projects list), a
   municipality scope would stop depending on title text.
2. **A list of offices.** There is no `/offices` route; setup builds the list from
   `/districts` and reads the published name from each district page (one request per
   office).
3. **The citizen reporting service.** See [reporting.md](reporting.md).
