import type { SyntheticEntry } from './synthetic-entry';

export const SYNTHETIC_DEMO_BADGE = 'Synthetic demo, no commercial data';

export type SyntheticCatalogView =
  | { readonly status: 'loading' }
  | { readonly status: 'empty' }
  | { readonly status: 'error' }
  | { readonly status: 'list'; readonly entries: readonly SyntheticEntry[] };

export const LOADING_VIEW: SyntheticCatalogView = { status: 'loading' };
export const ERROR_VIEW: SyntheticCatalogView = { status: 'error' };

export function viewForEntries(entries: readonly SyntheticEntry[]): SyntheticCatalogView {
  if (entries.length === 0) {
    return { status: 'empty' };
  }
  return { status: 'list', entries };
}
