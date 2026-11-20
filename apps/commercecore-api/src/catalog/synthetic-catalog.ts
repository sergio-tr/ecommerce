import { Injectable } from '@nestjs/common';
import {
  loadCatalogDomain,
  type CatalogLabelError,
  type CatalogProductId,
  type CatalogProductIdError,
  type CatalogSyntheticLabel,
} from './catalog-domain';

export const SYNTHETIC_CATALOG_CAPACITY = 8;

export type CatalogErrorCode =
  | 'PRODUCT_ID_INVALID'
  | 'LABEL_INVALID'
  | 'BODY_INVALID'
  | 'NOT_FOUND'
  | 'DUPLICATE_PRODUCT_ID'
  | 'REVISION_CONFLICT'
  | 'CAPACITY_EXCEEDED';

export interface CatalogErrorBody {
  readonly code: CatalogErrorCode;
  readonly reason: string;
}

export interface SyntheticEntry {
  readonly productId: string;
  readonly syntheticLabel: string;
  readonly revision: number;
}

export interface SyntheticEntryList {
  readonly entries: readonly SyntheticEntry[];
}

interface StoredEntry {
  readonly label: string;
  readonly revision: number;
}

const domain = loadCatalogDomain();

@Injectable()
export class InMemorySyntheticCatalog {
  private readonly entries = new Map<string, StoredEntry>();

  create(productId: unknown, syntheticLabel: unknown): SyntheticEntry | CatalogErrorBody {
    const id = parseId(productId);
    if (isCatalogError(id)) {
      return id;
    }
    const label = parseLabel(syntheticLabel);
    if (isCatalogError(label)) {
      return label;
    }
    if (this.entries.has(id.value)) {
      return { code: 'DUPLICATE_PRODUCT_ID', reason: 'exists' };
    }
    if (this.entries.size >= SYNTHETIC_CATALOG_CAPACITY) {
      return { code: 'CAPACITY_EXCEEDED', reason: 'limit' };
    }
    const stored: StoredEntry = { label: label.value, revision: 1 };
    this.entries.set(id.value, stored);
    return toEntry(id.value, stored);
  }

  list(): SyntheticEntryList {
    const entries = [...this.entries.entries()]
      .sort((left, right) => compareIds(left[0], right[0]))
      .map(([productId, stored]) => toEntry(productId, stored));
    return { entries };
  }

  get(productId: unknown): SyntheticEntry | CatalogErrorBody {
    const id = parseId(productId);
    if (isCatalogError(id)) {
      return id;
    }
    const stored = this.entries.get(id.value);
    if (stored === undefined) {
      return { code: 'NOT_FOUND', reason: 'missing' };
    }
    return toEntry(id.value, stored);
  }

  update(
    productId: unknown,
    syntheticLabel: unknown,
    expectedRevision: unknown,
  ): SyntheticEntry | CatalogErrorBody {
    const id = parseId(productId);
    if (isCatalogError(id)) {
      return id;
    }
    const label = parseLabel(syntheticLabel);
    if (isCatalogError(label)) {
      return label;
    }
    if (!isRevision(expectedRevision)) {
      return { code: 'BODY_INVALID', reason: 'shape' };
    }
    const stored = this.entries.get(id.value);
    if (stored === undefined) {
      return { code: 'NOT_FOUND', reason: 'missing' };
    }
    if (stored.revision !== expectedRevision) {
      return { code: 'REVISION_CONFLICT', reason: 'mismatch' };
    }
    if (stored.label === label.value) {
      return toEntry(id.value, stored);
    }
    const next: StoredEntry = { label: label.value, revision: stored.revision + 1 };
    this.entries.set(id.value, next);
    return toEntry(id.value, next);
  }
}

export function isCatalogError(value: object): value is CatalogErrorBody {
  return 'code' in value && 'reason' in value && !('revision' in value) && !('entries' in value);
}

export function readCreateBody(
  input: unknown,
): { readonly productId: unknown; readonly syntheticLabel: unknown } | CatalogErrorBody {
  const record = allowKeys(input, ['productId', 'syntheticLabel']);
  if (isCatalogError(record)) {
    return record;
  }
  return { productId: record['productId'], syntheticLabel: record['syntheticLabel'] };
}

export function readUpdateBody(
  input: unknown,
): { readonly syntheticLabel: unknown; readonly expectedRevision: unknown } | CatalogErrorBody {
  const record = allowKeys(input, ['syntheticLabel', 'expectedRevision']);
  if (isCatalogError(record)) {
    return record;
  }
  return {
    syntheticLabel: record['syntheticLabel'],
    expectedRevision: record['expectedRevision'],
  };
}

export function statusFor(code: CatalogErrorCode): number {
  switch (code) {
    case 'NOT_FOUND':
      return 404;
    case 'DUPLICATE_PRODUCT_ID':
    case 'REVISION_CONFLICT':
    case 'CAPACITY_EXCEEDED':
      return 409;
    case 'PRODUCT_ID_INVALID':
    case 'LABEL_INVALID':
    case 'BODY_INVALID':
      return 400;
    default: {
      const unexpected: never = code;
      return unexpected;
    }
  }
}

function allowKeys(
  input: unknown,
  allowed: readonly string[],
): Record<string, unknown> | CatalogErrorBody {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    return { code: 'BODY_INVALID', reason: 'shape' };
  }
  const record = input as Record<string, unknown>;
  const keys = Object.keys(record);
  if (keys.length !== allowed.length || keys.some((key) => !allowed.includes(key))) {
    return { code: 'BODY_INVALID', reason: 'shape' };
  }
  return record;
}

function parseId(input: unknown): CatalogProductId | CatalogErrorBody {
  try {
    return domain.ProductId.create(input);
  } catch (error) {
    if (error instanceof domain.InvalidProductIdError) {
      return productIdError(error);
    }
    throw error;
  }
}

function parseLabel(input: unknown): CatalogSyntheticLabel | CatalogErrorBody {
  try {
    return domain.SyntheticLabel.create(input);
  } catch (error) {
    if (error instanceof domain.InvalidSyntheticLabelError) {
      return labelError(error);
    }
    throw error;
  }
}

function productIdError(error: CatalogProductIdError): CatalogErrorBody {
  return { code: error.code, reason: error.reason };
}

function labelError(error: CatalogLabelError): CatalogErrorBody {
  return { code: error.code, reason: error.reason };
}

function isRevision(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value);
}

function toEntry(productId: string, stored: StoredEntry): SyntheticEntry {
  return Object.freeze({
    productId,
    syntheticLabel: stored.label,
    revision: stored.revision,
  });
}

function compareIds(left: string, right: string): number {
  if (left < right) {
    return -1;
  }
  if (left > right) {
    return 1;
  }
  return 0;
}
