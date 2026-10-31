import { createContext, useContext } from 'react';
import type { PortalConfig } from '../config';
import type { Client } from '../api/client';
import type { DistrictCard, Envelope, Overview } from '../api/types';
import type { ScopeResult } from './scope';

export type Async<T> =
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'ready'; value: T };

export interface PortalState {
  config: PortalConfig;
  client: Client;
  overview: Async<Envelope<Overview>>;
  scope: Async<ScopeResult>;
  districts: Async<Envelope<DistrictCard>[]>;
  retry(): void;
}

export const PortalContext = createContext<PortalState | null>(null);

export function usePortal(): PortalState {
  const state = useContext(PortalContext);
  if (!state) throw new Error('usePortal() outside <PortalProvider>');
  return state;
}
