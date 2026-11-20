import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { CatalogContractRejection } from './catalog-contract-rejection';
import { parseCatalogIdentity } from './catalog-identity';
import {
  acceptReadOnlyCatalogPort,
  catalogIdentityFixture,
  type CatalogIdentityReader,
} from './catalog-identity-port';
import { CatalogRevision, requireForwardRevision } from './catalog-revision';
import { InvalidProductIdError } from './invalid-product-id.error';
import { ProductId } from './product-id';
import { rejectUnratifiedVariantIdentity } from './unratified-variant-identity';

const PRODUCT_ID = 'prd_01ARZ3NDEKTSV4RRFFQ69G5FAV';
const OTHER_PRODUCT_ID = 'prd_01ARZ3NDEKTSV4RRFFQ69G5FAW';
const SECRET = `${'x'.repeat(80)}secret-looking`;

type ReaderExtra = Exclude<keyof CatalogIdentityReader, 'read'>;
const readerHasNoWrite: ReaderExtra extends never ? true : never = true;

test('freezes a revision and rejects a regression without echoing values', () => {
  const first = CatalogRevision.create(1);
  const again = CatalogRevision.create(1);
  const third = CatalogRevision.create(3);
  assert.equal(first.value, 1);
  assert.equal(first.equals(again), true);
  assert.equal(first.equals(third), false);
  assert.equal(Object.isFrozen(first), true);
  assert.equal(first.next().equals(CatalogRevision.create(2)), true);
  assert.equal(requireForwardRevision(first, third).value, 3);
  assert.equal(readerHasNoWrite, true);
  assert.throws(() => {
    (first as { value: number }).value = 9;
  }, TypeError);

  for (const proposed of [first, again]) {
    assert.throws(
      () => requireForwardRevision(third, proposed),
      (error: unknown) => {
        assert.ok(error instanceof CatalogContractRejection);
        assert.equal(error.reason, 'regression');
        assert.equal(error.message.includes('3'), false);
        assert.equal(error.message.includes('1'), false);
        return true;
      },
    );
  }
});

test('rejects malformed revisions without echoing the input', () => {
  const samples: unknown[] = [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, '1', SECRET, null];
  for (const sample of samples) {
    assert.throws(
      () => CatalogRevision.create(sample),
      (error: unknown) => {
        assert.ok(error instanceof CatalogContractRejection);
        assert.equal(error.code, 'CATALOG_CONTRACT_REJECTED');
        assert.equal(error.reason, typeof sample === 'number' ? 'format' : 'type');
        assert.match(error.message, /^Catalog contract rejected: (type|format)$/);
        if (typeof sample === 'string' && sample.length > 0) {
          assert.equal(error.message.includes(sample), false);
        }
        return true;
      },
    );
  }
  assert.throws(
    () => CatalogRevision.create(Number.MAX_SAFE_INTEGER).next(),
    (error: unknown) => {
      assert.ok(error instanceof CatalogContractRejection);
      assert.equal(error.reason, 'overflow');
      return true;
    },
  );
});

test('parses a product id and revision and rejects prohibited fields', () => {
  const identity = parseCatalogIdentity({ productId: PRODUCT_ID, revision: 1 });
  assert.equal(identity.productId.value, PRODUCT_ID);
  assert.equal(identity.revision.value, 1);
  assert.equal(Object.isFrozen(identity), true);
  assert.equal(identity.equals(parseCatalogIdentity({ productId: PRODUCT_ID, revision: 1 })), true);
  assert.equal(
    identity.equals(parseCatalogIdentity({ productId: OTHER_PRODUCT_ID, revision: 1 })),
    false,
  );

  const prohibited: unknown[] = [
    { productId: PRODUCT_ID, revision: 1, sku: SECRET },
    { productId: PRODUCT_ID, revision: 1, price: 10 },
    { productId: PRODUCT_ID, revision: 1, stock: 4 },
    { productId: PRODUCT_ID, revision: 1, offer: SECRET },
    { productId: PRODUCT_ID, revision: 1, quote: SECRET },
    { productId: PRODUCT_ID, revision: 1, tax: SECRET },
    { productId: PRODUCT_ID, revision: 1, tenantId: SECRET },
    { productId: PRODUCT_ID, revision: 1, variantId: SECRET },
    { productId: PRODUCT_ID, revision: 1, syntheticLabel: 'synthetic-entry-a' },
  ];
  for (const sample of prohibited) {
    assert.throws(
      () => parseCatalogIdentity(sample),
      (error: unknown) => {
        assert.ok(error instanceof CatalogContractRejection);
        assert.equal(error.reason, 'prohibited-field');
        assert.equal(error.message.includes(SECRET), false);
        assert.equal(error.message.includes('sku'), false);
        assert.equal(error.message.includes('synthetic-entry-a'), false);
        assert.equal(JSON.stringify(error).includes(SECRET), false);
        return true;
      },
    );
  }
});

test('rejects a malformed product id and a missing field without echoing input', () => {
  assert.throws(
    () => parseCatalogIdentity({ productId: SECRET, revision: 1 }),
    (error: unknown) => {
      assert.ok(error instanceof InvalidProductIdError);
      assert.equal(error.code, 'PRODUCT_ID_INVALID');
      assert.equal(error.message.includes(SECRET), false);
      return true;
    },
  );
  assert.throws(
    () => parseCatalogIdentity({ productId: PRODUCT_ID }),
    (error: unknown) => {
      assert.ok(error instanceof CatalogContractRejection);
      assert.equal(error.reason, 'missing-field');
      assert.equal(error.message.includes(PRODUCT_ID), false);
      return true;
    },
  );
  assert.throws(
    () => parseCatalogIdentity([PRODUCT_ID]),
    (error: unknown) => {
      assert.ok(error instanceof CatalogContractRejection);
      assert.equal(error.reason, 'type');
      return true;
    },
  );
});

test('a fixture reader is frozen, duplicate-safe, and refuses mutation', () => {
  const first = parseCatalogIdentity({ productId: PRODUCT_ID, revision: 2 });
  const entries = [first];
  const reader = catalogIdentityFixture(entries);
  entries.push(parseCatalogIdentity({ productId: OTHER_PRODUCT_ID, revision: 1 }));
  assert.equal(Object.isFrozen(reader), true);
  assert.deepEqual(Object.keys(reader), ['read']);
  assert.equal(reader.read(ProductId.create(PRODUCT_ID))?.equals(first), true);
  assert.equal(reader.read(ProductId.create(OTHER_PRODUCT_ID)), undefined);
  assert.throws(
    () =>
      catalogIdentityFixture([first, parseCatalogIdentity({ productId: PRODUCT_ID, revision: 4 })]),
    (error: unknown) => {
      assert.ok(error instanceof CatalogContractRejection);
      assert.equal(error.reason, 'duplicate');
      assert.equal(error.message.includes(PRODUCT_ID), false);
      return true;
    },
  );

  const writer = {
    read: (productId: ProductId) => (productId.equals(first.productId) ? first : undefined),
    save: (secret: string) => secret,
  };
  assert.throws(
    () => acceptReadOnlyCatalogPort(writer),
    (error: unknown) => {
      assert.ok(error instanceof CatalogContractRejection);
      assert.equal(error.reason, 'mutation');
      assert.equal(error.message.includes('save'), false);
      assert.equal(error.message.includes(SECRET), false);
      return true;
    },
  );
});

test('refuses an unratified variant identity without echoing the payload', () => {
  const payload = { variantId: SECRET, sku: 'SKU-1', price: 12, stock: 3 };
  assert.throws(
    () => rejectUnratifiedVariantIdentity(payload),
    (error: unknown) => {
      assert.ok(error instanceof CatalogContractRejection);
      assert.equal(error.reason, 'variant-unratified');
      assert.equal(error.message.includes(SECRET), false);
      assert.equal(error.message.includes('SKU-1'), false);
      assert.equal(JSON.stringify(error).includes('variantId'), false);
      return true;
    },
  );
});

test('committed catalog sources do not import other contexts', () => {
  const sourceRoot = path.join(process.cwd(), 'libs/commercecore/catalog/domain/src');
  const forbidden =
    /@nestjs|['"]stripe['"]|['"]mongodb['"]|['"]mongoose['"]|commercecloud|identity\/domain|synthetic-catalog/;
  for (const file of listTypeScript(sourceRoot)) {
    if (file.endsWith('.spec.ts')) {
      continue;
    }
    const text = readFileSync(file, 'utf8');
    assert.equal(forbidden.test(text), false, file);
  }
});

function listTypeScript(directory: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(directory)) {
    const fullPath = path.join(directory, entry);
    if (statSync(fullPath).isDirectory()) {
      files.push(...listTypeScript(fullPath));
    } else if (entry.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}
