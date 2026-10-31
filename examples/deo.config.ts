/**
 * Example: one DPWH district engineering office. Copy over portal.config.ts.
 * Every DPWH line the documents list under the office; the district card for
 * each legislative district it serves (a shared office's figures are never split).
 */
import { defineConfig } from '../src/config';

export default defineConfig({
  id: 'bohol-1st-deo',
  kind: 'deo',
  name: 'Bohol 1st District Engineering Office',
  shortName: 'Bohol 1st DEO',
  operator: { name: 'Your organisation' },
  scope: {
    offices: ['Bohol 1st District Engineering Office'],
    districts: ['leg:bohol:1st'],
  },
  reporting: { enabled: false },
});
