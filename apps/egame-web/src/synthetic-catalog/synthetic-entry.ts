/**
 * Browser DTO for one process-local synthetic catalog entry.
 * The shape matches the accepted GET /catalog/synthetic-entries contract.
 * This file does not import the API or the catalog domain library.
 */

const PRODUCT_ID_BODY = /^[0-9A-HJKMNP-TV-Z]{26}$/;
const SYNTHETIC_LABEL = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;
const ENTRY_KEYS = ['productId', 'syntheticLabel', 'revision'] as const;
const COMMERCIAL_KEYS = new Set([
  'currency',
  'license',
  'money',
  'offer',
  'price',
  'quote',
  'sku',
  'stock',
  'stripe',
  'tax',
  'tenant',
  'tenantId',
  'variant',
  'variantId',
]);

export type SyntheticCatalogRejection = 'commercial-field' | 'http' | 'path' | 'shape' | 'type';

export class SyntheticCatalogClientError extends Error {
  readonly code = 'SYNTHETIC_CATALOG_REJECTED';
  readonly reason: SyntheticCatalogRejection;

  constructor(reason: SyntheticCatalogRejection) {
    super('Synthetic catalog response rejected.');
    this.name = 'SyntheticCatalogClientError';
    this.reason = reason;
  }
}

export interface SyntheticEntry {
  readonly productId: string;
  readonly syntheticLabel: string;
  readonly revision: number;
}

export function parseSyntheticEntryList(input: unknown): readonly SyntheticEntry[] {
  if (!isRecord(input) || !Object.hasOwn(input, 'entries') || Object.keys(input).length !== 1) {
    throw new SyntheticCatalogClientError('type');
  }
  const entries = input['entries'];
  if (!Array.isArray(entries)) {
    throw new SyntheticCatalogClientError('type');
  }
  const seen = new Set<string>();
  const parsed: SyntheticEntry[] = [];
  for (const entry of entries) {
    const next = parseEntry(entry);
    if (seen.has(next.productId)) {
      throw new SyntheticCatalogClientError('shape');
    }
    seen.add(next.productId);
    parsed.push(next);
  }
  return Object.freeze(parsed);
}

export function readSyntheticEntry(input: unknown): SyntheticEntry {
  return parseEntry(input);
}

export function isPedagogicalProductId(input: string): boolean {
  return isProductId(input);
}

export function isSyntheticLabel(input: string): boolean {
  return isLabel(input);
}

/** Positive integer text. Leading zeros are rejected so the wire value stays exact. */
export function parseExpectedRevision(input: string): number | null {
  if (!/^[1-9][0-9]*$/.test(input)) {
    return null;
  }
  const value = Number(input);
  if (!isRevision(value)) {
    return null;
  }
  return value;
}

function parseEntry(input: unknown): SyntheticEntry {
  if (!isRecord(input)) {
    throw new SyntheticCatalogClientError('type');
  }
  for (const key of Object.keys(input)) {
    if (COMMERCIAL_KEYS.has(key)) {
      throw new SyntheticCatalogClientError('commercial-field');
    }
    if (!ENTRY_KEYS.includes(key as (typeof ENTRY_KEYS)[number])) {
      throw new SyntheticCatalogClientError('shape');
    }
  }
  for (const key of ENTRY_KEYS) {
    if (!Object.hasOwn(input, key)) {
      throw new SyntheticCatalogClientError('shape');
    }
  }
  const productId = input['productId'];
  const syntheticLabel = input['syntheticLabel'];
  const revision = input['revision'];
  if (!isProductId(productId) || !isLabel(syntheticLabel) || !isRevision(revision)) {
    throw new SyntheticCatalogClientError('shape');
  }
  return Object.freeze({ productId, syntheticLabel, revision });
}

function isProductId(input: unknown): input is string {
  if (typeof input !== 'string' || input.length !== 30 || !input.startsWith('prd_')) {
    return false;
  }
  return PRODUCT_ID_BODY.test(input.slice(4));
}

function isLabel(input: unknown): input is string {
  return typeof input === 'string' && SYNTHETIC_LABEL.test(input);
}

function isRevision(input: unknown): input is number {
  return typeof input === 'number' && Number.isSafeInteger(input) && input >= 1;
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return input !== null && typeof input === 'object' && !Array.isArray(input);
}
