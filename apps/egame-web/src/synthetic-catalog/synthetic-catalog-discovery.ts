import type { SyntheticEntry } from './synthetic-entry';

/**
 * Client-side discovery over an already loaded synthetic list.
 * Case folding uses the locale-independent Unicode default mapping.
 * Ordering compares code points, with product id as the tie-break.
 */

export const DISCOVERY_SORTS = ['id-asc', 'id-desc', 'label-asc', 'label-desc'] as const;

export type DiscoverySort = (typeof DISCOVERY_SORTS)[number];

export const DEFAULT_DISCOVERY_SORT: DiscoverySort = 'id-asc';

export const NO_MATCH_TEXT = 'No matching synthetic entries.';

export interface DiscoverySummary {
  readonly shown: number;
  readonly total: number;
  readonly entries: readonly SyntheticEntry[];
  readonly emptyData: boolean;
  readonly noMatches: boolean;
}

export function isDiscoverySort(value: string): value is DiscoverySort {
  return (DISCOVERY_SORTS as readonly string[]).includes(value);
}

export function normalizeDiscoveryQuery(input: string): string {
  return input.normalize('NFKC').replace(/\s+/gu, ' ').trim().toLowerCase();
}

export function discoverEntries(
  entries: readonly SyntheticEntry[],
  query: string,
  sort: DiscoverySort,
): DiscoverySummary {
  const normalized = normalizeDiscoveryQuery(query);
  const matched = entries.filter((entry) => matches(entry, normalized));
  const ordered = [...matched].sort((left, right) => compareEntries(sort, left, right));
  return Object.freeze({
    shown: ordered.length,
    total: entries.length,
    entries: Object.freeze(ordered),
    emptyData: entries.length === 0,
    noMatches: entries.length > 0 && ordered.length === 0,
  });
}

function matches(entry: SyntheticEntry, query: string): boolean {
  if (query.length === 0) {
    return true;
  }
  const productId = normalizeDiscoveryQuery(entry.productId);
  const syntheticLabel = normalizeDiscoveryQuery(entry.syntheticLabel);
  return productId.includes(query) || syntheticLabel.includes(query);
}

function compareEntries(sort: DiscoverySort, left: SyntheticEntry, right: SyntheticEntry): number {
  if (sort === 'id-asc' || sort === 'id-desc') {
    const byId = compareCodePoints(left.productId, right.productId);
    return sort === 'id-asc' ? byId : -byId;
  }
  const byLabel = compareCodePoints(left.syntheticLabel, right.syntheticLabel);
  if (byLabel !== 0) {
    return sort === 'label-asc' ? byLabel : -byLabel;
  }
  return compareCodePoints(left.productId, right.productId);
}

function compareCodePoints(left: string, right: string): number {
  const leftPoints = Array.from(left);
  const rightPoints = Array.from(right);
  const length = Math.min(leftPoints.length, rightPoints.length);
  for (let index = 0; index < length; index += 1) {
    const delta = codePoint(leftPoints[index]) - codePoint(rightPoints[index]);
    if (delta !== 0) {
      return delta < 0 ? -1 : 1;
    }
  }
  if (leftPoints.length === rightPoints.length) {
    return 0;
  }
  return leftPoints.length < rightPoints.length ? -1 : 1;
}

function codePoint(value: string | undefined): number {
  return value?.codePointAt(0) ?? 0;
}
