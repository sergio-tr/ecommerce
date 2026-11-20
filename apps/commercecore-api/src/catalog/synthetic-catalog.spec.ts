import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  InMemorySyntheticCatalog,
  SYNTHETIC_CATALOG_CAPACITY,
  isCatalogError,
} from './synthetic-catalog';

const FIRST = 'prd_01ARZ3NDEKTSV4RRFFQ69G5FAV';
const SECOND = 'prd_01ARZ3NDEKTSV4RRFFQ69G5FAW';

test('creates, rejects a duplicate, lists in id order, and reads one entry', () => {
  const catalog = new InMemorySyntheticCatalog();
  const later = catalog.create(SECOND, 'synthetic-entry-b');
  const earlier = catalog.create(FIRST, 'synthetic-entry-a');
  assert.equal(isCatalogError(later), false);
  assert.equal(isCatalogError(earlier), false);
  assert.deepEqual(catalog.list().entries, [
    { productId: FIRST, syntheticLabel: 'synthetic-entry-a', revision: 1 },
    { productId: SECOND, syntheticLabel: 'synthetic-entry-b', revision: 1 },
  ]);
  assert.deepEqual(catalog.get(FIRST), {
    productId: FIRST,
    syntheticLabel: 'synthetic-entry-a',
    revision: 1,
  });
  assert.deepEqual(catalog.create(FIRST, 'synthetic-entry-a'), {
    code: 'DUPLICATE_PRODUCT_ID',
    reason: 'exists',
  });
});

test('updates a label, keeps the same label, and rejects a stale revision', () => {
  const catalog = new InMemorySyntheticCatalog();
  assert.equal(isCatalogError(catalog.create(FIRST, 'synthetic-entry-a')), false);
  assert.deepEqual(catalog.update(FIRST, 'synthetic-entry-b', 1), {
    productId: FIRST,
    syntheticLabel: 'synthetic-entry-b',
    revision: 2,
  });
  assert.deepEqual(catalog.update(FIRST, 'synthetic-entry-b', 2), {
    productId: FIRST,
    syntheticLabel: 'synthetic-entry-b',
    revision: 2,
  });
  assert.deepEqual(catalog.update(FIRST, 'synthetic-entry-a', 1), {
    code: 'REVISION_CONFLICT',
    reason: 'mismatch',
  });
  assert.deepEqual(catalog.get(FIRST), {
    productId: FIRST,
    syntheticLabel: 'synthetic-entry-b',
    revision: 2,
  });
});

test('returns not found, invalid id, and invalid label without the input', () => {
  const catalog = new InMemorySyntheticCatalog();
  const missing = catalog.get(SECOND);
  const invalidId = catalog.get('prd_lowercase-is-rejected');
  const invalidLabel = catalog.create(FIRST, 'NOT-A-LABEL');
  assert.deepEqual(missing, { code: 'NOT_FOUND', reason: 'missing' });
  assert.deepEqual(invalidId, { code: 'PRODUCT_ID_INVALID', reason: 'format' });
  assert.deepEqual(invalidLabel, { code: 'LABEL_INVALID', reason: 'format' });
  const rendered = JSON.stringify([missing, invalidId, invalidLabel]);
  assert.equal(rendered.includes(SECOND), false);
  assert.equal(rendered.includes('prd_lowercase-is-rejected'), false);
  assert.equal(rendered.includes('NOT-A-LABEL'), false);
});

test('stops at eight entries and a new adapter is empty', () => {
  const catalog = new InMemorySyntheticCatalog();
  for (let index = 0; index < SYNTHETIC_CATALOG_CAPACITY; index += 1) {
    const created = catalog.create(productId(index), 'synthetic-entry-a');
    assert.equal(isCatalogError(created), false);
  }
  assert.deepEqual(catalog.create(productId(SYNTHETIC_CATALOG_CAPACITY), 'synthetic-entry-b'), {
    code: 'CAPACITY_EXCEEDED',
    reason: 'limit',
  });
  assert.deepEqual(catalog.create(productId(0), 'synthetic-entry-a'), {
    code: 'DUPLICATE_PRODUCT_ID',
    reason: 'exists',
  });
  assert.equal(catalog.list().entries.length, SYNTHETIC_CATALOG_CAPACITY);
  assert.deepEqual(new InMemorySyntheticCatalog().list(), { entries: [] });
});

test('rejects a non-integer revision without changing the entry', () => {
  const catalog = new InMemorySyntheticCatalog();
  assert.equal(isCatalogError(catalog.create(FIRST, 'synthetic-entry-a')), false);
  assert.deepEqual(catalog.update(FIRST, 'synthetic-entry-b', 1.5), {
    code: 'BODY_INVALID',
    reason: 'shape',
  });
  assert.equal(catalog.get(FIRST) && !isCatalogError(catalog.get(FIRST)), true);
  const current = catalog.get(FIRST);
  assert.equal(isCatalogError(current), false);
  if (!isCatalogError(current)) {
    assert.equal(current.revision, 1);
  }
});

function productId(index: number): string {
  const suffix = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'[index];
  if (suffix === undefined) {
    throw new Error('fixture index is outside the pedagogical alphabet');
  }
  return `prd_01ARZ3NDEKTSV4RRFFQ69G5FA${suffix}`;
}
