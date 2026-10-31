/**
 * Example: a highly urbanised city with its own legislative districts.
 * Copy over portal.config.ts. Quezon City's two DPWH offices serve its six districts
 * (the 1st serves four, the 2nd two: Tier B), so their figures are shown
 * whole, never split.
 */
import { defineConfig } from '../src/config';

export default defineConfig({
  id: 'quezon-city',
  kind: 'city',
  name: 'Quezon City',
  operator: { name: 'Your organisation' },
  scope: {
    offices: [
      'Quezon City 1st District Engineering Office',
      'Quezon City 2nd District Engineering Office',
    ],
    places: [{ label: 'Quezon City', region: 'NCR' }],
    districts: [
      'leg:quezon-city:1st', 'leg:quezon-city:2nd', 'leg:quezon-city:3rd',
      'leg:quezon-city:4th', 'leg:quezon-city:5th', 'leg:quezon-city:6th',
    ],
  },
  reporting: { enabled: false },
});
