import {
  parseSyntheticEntryList,
  SyntheticCatalogClientError,
  type SyntheticEntry,
} from './synthetic-entry';

/** Same-origin path. The dev server proxies this prefix to loopback; production must not embed a host. */
export const SYNTHETIC_ENTRIES_PATH = '/catalog/synthetic-entries';

export interface FetchResponse {
  readonly ok: boolean;
  json(): Promise<unknown>;
}

export interface FetchLike {
  (path: string, init: { readonly headers: { readonly accept: string } }): Promise<FetchResponse>;
}

export async function loadSyntheticEntries(
  fetchImpl: FetchLike,
  path: string = SYNTHETIC_ENTRIES_PATH,
): Promise<readonly SyntheticEntry[]> {
  if (path !== SYNTHETIC_ENTRIES_PATH) {
    throw new SyntheticCatalogClientError('path');
  }
  let response: FetchResponse;
  try {
    response = await fetchImpl(path, { headers: { accept: 'application/json' } });
  } catch {
    throw new SyntheticCatalogClientError('http');
  }
  if (!response.ok) {
    throw new SyntheticCatalogClientError('http');
  }
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new SyntheticCatalogClientError('type');
  }
  return parseSyntheticEntryList(body);
}
