import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { InvalidProductIdError } from './invalid-product-id.error';
import { ProductId } from './product-id';

const VALID_ID = 'prd_01ARZ3NDEKTSV4RRFFQ69G5FAV';

test('accepts a pedagogical product id and freezes it', () => {
  const id = ProductId.create(VALID_ID);
  const again = ProductId.create(VALID_ID);
  assert.equal(id.value, VALID_ID);
  assert.equal(id.equals(again), true);
  assert.equal(Object.isFrozen(id), true);
  assert.throws(() => {
    (id as { value: string }).value = 'prd_00000000000000000000000000';
  }, TypeError);
});

test('rejects a different valid id as not equal', () => {
  const left = ProductId.create(VALID_ID);
  const right = ProductId.create('prd_01ARZ3NDEKTSV4RRFFQ69G5FAW');
  assert.equal(left.equals(right), false);
});

test('rejects invalid product ids without echoing the input', () => {
  const samples: unknown[] = [
    '',
    'prd_',
    'prd_01arz3ndektsv4rrffq69g5fav',
    'PRD_01ARZ3NDEKTSV4RRFFQ69G5FAV',
    'sku_01ARZ3NDEKTSV4RRFFQ69G5FAV',
    `prd_${'I'.repeat(26)}`,
    `${'x'.repeat(200)}secret-looking`,
    12,
    null,
    undefined,
  ];

  for (const sample of samples) {
    assert.throws(
      () => ProductId.create(sample),
      (error: unknown) => {
        assert.ok(error instanceof InvalidProductIdError);
        assert.equal(error.code, 'PRODUCT_ID_INVALID');
        assert.match(error.message, /^ProductId rejected: (type|format)$/);
        if (typeof sample === 'string' && sample.length > 0) {
          assert.equal(error.message.includes(sample), false);
        }
        return true;
      },
    );
  }
});

test('committed domain sources do not import frameworks or other contexts', () => {
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
