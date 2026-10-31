/**
 * This portal's configuration: the only file a fork needs to edit.
 * What each field means: src/config.ts. Generate one with `npm run setup`;
 * check it against the live API with `npm run check`.
 *
 * This default is a worked example: the Province of Bohol. Its three DPWH
 * district engineering offices bring in every DPWH line listed under them;
 * the place name brings in lines from all four programs whose title names
 * Bohol (Central Office projects, farm-to-market roads, health facilities,
 * irrigation). More examples in examples/.
 */
import { defineConfig } from './src/config';

export default defineConfig({
  id: 'bohol-province',
  kind: 'province',
  name: 'Province of Bohol',
  shortName: 'Bohol',
  operator: { name: 'BetterGov.ph', url: 'https://bettergov.ph' },
  // Where this example is deployed. Change it (or remove it) in your fork.
  siteUrl: 'https://transparency-portal.bettergov.workers.dev',
  scope: {
    offices: [
      'Bohol 1st District Engineering Office',
      'Bohol 2nd District Engineering Office',
      'Bohol 3rd District Engineering Office',
    ],
    places: [{ label: 'Bohol', region: 'VII' }],
    districts: ['leg:bohol:1st', 'leg:bohol:2nd', 'leg:bohol:3rd'],
    exclude: [],
  },
  reporting: { enabled: false },
});
