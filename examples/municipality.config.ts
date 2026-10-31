/**
 * Example: a municipality. Copy over portal.config.ts.
 * "Carmen" is a town in several provinces, so the search asks for both words
 * ("Carmen" and "Bohol") and stays in Region VII. Titles that do not spell out
 * the province are missed this way; `npm run check` shows both counts.
 */
import { defineConfig } from '../src/config';

export default defineConfig({
  id: 'carmen-bohol',
  kind: 'municipality',
  name: 'Municipality of Carmen, Bohol',
  shortName: 'Carmen',
  operator: { name: 'Your organisation' },
  scope: {
    places: [{ label: 'Carmen', q: 'Carmen Bohol', region: 'VII' }],
    districts: ['leg:bohol:2nd'],
  },
  reporting: { enabled: false },
});
