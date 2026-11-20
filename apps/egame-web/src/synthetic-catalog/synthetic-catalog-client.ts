import {
  isPedagogicalProductId,
  isSyntheticLabel,
  parseExpectedRevision,
  parseSyntheticEntryList,
  readSyntheticEntry,
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

export const WRITE_REJECTION_MESSAGE = {
  'product-id': 'The product id is not a pedagogical id.',
  label: 'The synthetic label is not allowed.',
  revision: 'The expected revision is not a positive integer.',
  duplicate: 'That product id is already stored.',
  capacity: 'The synthetic list already holds 8 entries.',
  stale: 'The revision is stale. The entry was not changed.',
  missing: 'That synthetic entry is missing.',
  unselected: 'Choose a synthetic entry before saving.',
  invalid: 'The synthetic request was rejected.',
  conflict: 'The synthetic entry was not changed.',
  http: 'The synthetic request could not be completed.',
} as const;

export type WriteRejection = keyof typeof WRITE_REJECTION_MESSAGE;

export type WriteOutcome =
  | { readonly kind: 'success'; readonly entry: SyntheticEntry }
  | { readonly kind: 'rejected'; readonly rejection: WriteRejection }
  | { readonly kind: 'busy' };

export interface MutationResponse {
  readonly status: number;
  json(): Promise<unknown>;
}

export interface MutationInit {
  readonly method: 'POST' | 'PATCH';
  readonly headers: {
    readonly accept: 'application/json';
    readonly 'content-type': 'application/json';
  };
  readonly body: string;
}

export interface MutationFetch {
  (path: string, init: MutationInit): Promise<MutationResponse>;
}

const MUTATION_HEADERS = {
  accept: 'application/json',
  'content-type': 'application/json',
} as const;

export function alertFor(outcome: WriteOutcome): string | null {
  if (outcome.kind !== 'rejected') {
    return null;
  }
  return WRITE_REJECTION_MESSAGE[outcome.rejection];
}

export function shouldRefreshList(outcome: WriteOutcome): boolean {
  return outcome.kind === 'success';
}

export interface CreateDraft {
  readonly productId: string;
  readonly syntheticLabel: string;
}

export interface UpdateDraft {
  readonly productId: string;
  readonly syntheticLabel: string;
  readonly expectedRevision: string;
}

export async function createSyntheticEntry(
  fetchImpl: MutationFetch,
  draft: CreateDraft,
): Promise<WriteOutcome> {
  if (!isPedagogicalProductId(draft.productId)) {
    return rejected('product-id');
  }
  if (!isSyntheticLabel(draft.syntheticLabel)) {
    return rejected('label');
  }
  return send(
    fetchImpl,
    SYNTHETIC_ENTRIES_PATH,
    'POST',
    JSON.stringify({ productId: draft.productId, syntheticLabel: draft.syntheticLabel }),
    201,
  );
}

export async function updateSyntheticEntry(
  fetchImpl: MutationFetch,
  draft: UpdateDraft,
): Promise<WriteOutcome> {
  if (draft.productId.length === 0) {
    return rejected('unselected');
  }
  if (!isPedagogicalProductId(draft.productId)) {
    return rejected('product-id');
  }
  if (!isSyntheticLabel(draft.syntheticLabel)) {
    return rejected('label');
  }
  const expectedRevision = parseExpectedRevision(draft.expectedRevision);
  if (expectedRevision === null) {
    return rejected('revision');
  }
  return send(
    fetchImpl,
    `${SYNTHETIC_ENTRIES_PATH}/${draft.productId}`,
    'PATCH',
    JSON.stringify({ syntheticLabel: draft.syntheticLabel, expectedRevision }),
    200,
  );
}

function rejected(rejection: WriteRejection): WriteOutcome {
  return { kind: 'rejected', rejection };
}

async function send(
  fetchImpl: MutationFetch,
  path: string,
  method: 'POST' | 'PATCH',
  body: string,
  successStatus: number,
): Promise<WriteOutcome> {
  if (!isAllowedMutationPath(path)) {
    return rejected('http');
  }
  let response: MutationResponse;
  try {
    response = await fetchImpl(path, { method, headers: MUTATION_HEADERS, body });
  } catch {
    return rejected('http');
  }
  const payload = await readJson(response);
  if (response.status === successStatus) {
    try {
      return { kind: 'success', entry: readSyntheticEntry(payload) };
    } catch {
      return rejected('http');
    }
  }
  return rejected(rejectionFor(response.status, payload));
}

async function readJson(response: MutationResponse): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function isAllowedMutationPath(path: string): boolean {
  if (path === SYNTHETIC_ENTRIES_PATH) {
    return true;
  }
  const prefix = `${SYNTHETIC_ENTRIES_PATH}/`;
  if (!path.startsWith(prefix)) {
    return false;
  }
  return isPedagogicalProductId(path.slice(prefix.length));
}

function rejectionFor(status: number, payload: unknown): WriteRejection {
  const coded = rejectionForCode(payload);
  if (coded !== null) {
    return coded;
  }
  if (status === 400) {
    return 'invalid';
  }
  if (status === 404) {
    return 'missing';
  }
  if (status === 409) {
    return 'conflict';
  }
  return 'http';
}

function rejectionForCode(payload: unknown): WriteRejection | null {
  if (!isRecord(payload) || typeof payload['code'] !== 'string') {
    return null;
  }
  switch (payload['code']) {
    case 'PRODUCT_ID_INVALID':
      return 'product-id';
    case 'LABEL_INVALID':
      return 'label';
    case 'BODY_INVALID':
      return 'invalid';
    case 'NOT_FOUND':
      return 'missing';
    case 'DUPLICATE_PRODUCT_ID':
      return 'duplicate';
    case 'CAPACITY_EXCEEDED':
      return 'capacity';
    case 'REVISION_CONFLICT':
      return 'stale';
    default:
      return null;
  }
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return input !== null && typeof input === 'object' && !Array.isArray(input);
}
