/**
 * Citizen reports are collected in one place, on budget.bettergov.ph, for
 * every portal. A portal does not take reports itself: it links to the
 * central form with the project's reference, and the central service looks
 * the project up in the API (so a portal cannot change what is reported on).
 *
 * The link contract (docs/reporting.md):
 *   GET {reporting.url}?portal={config.id}&dataset={dataset}&project={id}&from={page URL}
 *
 * The central form is not built yet; until it is, `reporting.enabled` stays
 * false and the portal says so instead of linking.
 */
import { DEFAULT_REPORT_URL, type PortalConfig } from '../config';
import type { ProjectRow } from '../api/types';

export function reportingEnabled(config: PortalConfig): boolean {
  return Boolean(config.reporting?.enabled);
}

export function reportHref(config: PortalConfig, project: Pick<ProjectRow, 'dataset' | 'id'>, from: string): string | null {
  if (!reportingEnabled(config)) return null;
  const url = new URL(config.reporting?.url || DEFAULT_REPORT_URL);
  url.searchParams.set('portal', config.id);
  url.searchParams.set('dataset', project.dataset);
  url.searchParams.set('project', project.id);
  url.searchParams.set('from', from);
  return url.toString();
}
