import { useEffect, useMemo, useState, type ReactNode } from 'react';
import portalConfig from '../../portal.config';
import { createClient } from '../api/client';
import { DEFAULT_API } from '../config';
import { PortalContext, type Async, type PortalState } from '../lib/portal-context';
import { resolveScope, type ScopeResult } from '../lib/scope';

const toError = (e: unknown) => (e instanceof Error ? e : new Error(String(e)));

/** The settled state of `promise`; "loading" until it settles. */
function useSettled<T>(promise: Promise<T>): Async<T> {
  const [state, setState] = useState<{ promise: Promise<T>; value: Async<T> } | null>(null);
  useEffect(() => {
    let live = true;
    promise.then(
      (value) => live && setState({ promise, value: { status: 'ready', value } }),
      (error) => live && setState({ promise, value: { status: 'error', error: toError(error) } }),
    );
    return () => {
      live = false;
    };
  }, [promise]);
  return state?.promise === promise ? state.value : { status: 'loading' };
}

/**
 * The districts to show: every district an in-scope DPWH office serves (so an
 * office is always shown with all of its districts), plus any the config names
 * (a place-only portal, such as a municipality, names its own).
 */
function districtIds(scope: ScopeResult, configured: string[]): string[] {
  const ids = new Set(configured);
  for (const q of scope.queries) for (const o of q.officeLens?.offices ?? []) for (const d of o.districts) ids.add(d.id);
  return [...ids];
}

export default function PortalProvider({ children }: { children: ReactNode }) {
  const config = portalConfig;
  const client = useMemo(() => createClient(import.meta.env.VITE_API_BASE || config.api || DEFAULT_API), [config.api]);
  const [attempt, setAttempt] = useState(0);

  // One set of requests per attempt; "Try again" makes a new set (failed requests are not cached).
  const loads = useMemo(() => {
    const scope = resolveScope(client, config);
    return {
      attempt,
      overview: client.overview(),
      scope,
      districts: scope.then((s) => Promise.all(districtIds(s, config.scope.districts ?? []).map((id) => client.district(id)))),
    };
  }, [client, config, attempt]);

  const overview = useSettled(loads.overview);
  const scope = useSettled(loads.scope);
  const districts = useSettled(loads.districts);

  const value: PortalState = { config, client, overview, scope, districts, retry: () => setAttempt((n) => n + 1) };
  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
}
