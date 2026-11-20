import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import {
  loadSyntheticEntries,
  SYNTHETIC_ENTRIES_PATH,
  type FetchLike,
} from './synthetic-catalog-client';
import {
  ERROR_VIEW,
  LOADING_VIEW,
  SYNTHETIC_DEMO_BADGE,
  viewForEntries,
} from './synthetic-catalog-view';
import { parseSyntheticEntryList, SyntheticCatalogClientError } from './synthetic-entry';

const PRODUCT_ID = 'prd_01ARZ3NDEKTSV4RRFFQ69G5FAV';
const OTHER_PRODUCT_ID = 'prd_01ARZ3NDEKTSV4RRFFQ69G5FAW';
const SECRET = `${'x'.repeat(80)}secret-looking`;

test('loading and error views stay fixed and empty becomes a list', () => {
  assert.equal(LOADING_VIEW.status, 'loading');
  assert.equal(ERROR_VIEW.status, 'error');
  assert.equal(SYNTHETIC_DEMO_BADGE, 'Synthetic demo, no commercial data');
  assert.deepEqual(viewForEntries([]), { status: 'empty' });
  const entries = parseSyntheticEntryList({
    entries: [{ productId: PRODUCT_ID, syntheticLabel: 'synthetic-entry-a', revision: 1 }],
  });
  assert.deepEqual(viewForEntries(entries), { status: 'list', entries });
});

test('accepts a synthetic list and rejects commercial or extra fields without echoing them', () => {
  const parsed = parseSyntheticEntryList({
    entries: [
      { productId: PRODUCT_ID, syntheticLabel: 'synthetic-entry-a', revision: 1 },
      { productId: OTHER_PRODUCT_ID, syntheticLabel: 'synthetic-entry-b', revision: 2 },
    ],
  });
  assert.equal(parsed.length, 2);
  assert.equal(Object.isFrozen(parsed[0]), true);

  const samples: unknown[] = [
    {
      entries: [
        { productId: PRODUCT_ID, syntheticLabel: 'synthetic-entry-a', revision: 1, price: 10 },
      ],
    },
    {
      entries: [
        { productId: PRODUCT_ID, syntheticLabel: 'synthetic-entry-a', revision: 1, sku: SECRET },
      ],
    },
    {
      entries: [
        { productId: PRODUCT_ID, syntheticLabel: 'synthetic-entry-a', revision: 1, stock: 4 },
      ],
    },
    {
      entries: [
        { productId: PRODUCT_ID, syntheticLabel: 'synthetic-entry-a', revision: 1, offer: SECRET },
      ],
    },
    {
      entries: [
        { productId: PRODUCT_ID, syntheticLabel: 'synthetic-entry-a', revision: 1, note: SECRET },
      ],
    },
    { entries: [{ productId: SECRET, syntheticLabel: 'synthetic-entry-a', revision: 1 }] },
    { entries: [{ productId: PRODUCT_ID, syntheticLabel: 'NOT-A-LABEL', revision: 1 }] },
    { price: 12 },
    { entries: 'nope' },
  ];
  for (const sample of samples) {
    assert.throws(
      () => parseSyntheticEntryList(sample),
      (error: unknown) => {
        assert.ok(error instanceof SyntheticCatalogClientError);
        assert.equal(error.message, 'Synthetic catalog response rejected.');
        assert.equal(error.message.includes(SECRET), false);
        assert.equal(error.message.includes('price'), false);
        assert.equal(error.message.includes('sku'), false);
        assert.equal(JSON.stringify(error).includes(SECRET), false);
        return true;
      },
    );
  }
});

test('loads the relative list and rejects another host or a failed response', async () => {
  const calls: string[] = [];
  const fetchImpl: FetchLike = (requestPath) => {
    calls.push(requestPath);
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          entries: [{ productId: PRODUCT_ID, syntheticLabel: 'synthetic-entry-a', revision: 1 }],
        }),
    });
  };
  const entries = await loadSyntheticEntries(fetchImpl);
  assert.deepEqual(calls, [SYNTHETIC_ENTRIES_PATH]);
  assert.equal(viewForEntries(entries).status, 'list');
  assert.equal(viewForEntries([]).status, 'empty');

  const failing: FetchLike = () => Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
  await assert.rejects(loadSyntheticEntries(failing), (error: unknown) => {
    assert.ok(error instanceof SyntheticCatalogClientError);
    assert.equal(error.reason, 'http');
    return true;
  });
  await assert.rejects(
    loadSyntheticEntries(fetchImpl, `https://example.invalid${SYNTHETIC_ENTRIES_PATH}`),
    (error: unknown) => {
      assert.ok(error instanceof SyntheticCatalogClientError);
      assert.equal(error.reason, 'path');
      assert.equal(error.message.includes('example.invalid'), false);
      return true;
    },
  );
  await assert.rejects(
    loadSyntheticEntries(() => Promise.reject(new Error(SECRET))),
    (error: unknown) => {
      assert.ok(error instanceof SyntheticCatalogClientError);
      assert.equal(error.reason, 'http');
      assert.equal(error.message.includes(SECRET), false);
      return true;
    },
  );
});

test('eGame sources do not import the API, domain, or a remote host', () => {
  const sourceRoot = path.join(process.cwd(), 'apps/egame-web/src');
  const forbiddenImport =
    /@nestjs|['"]stripe['"]|['"]mongodb['"]|['"]mongoose['"]|commercecloud|commercecore-api|catalog\/domain|identity\/domain/;
  const files = listFiles(sourceRoot).filter((file) => !file.endsWith('.spec.ts'));
  assert.ok(files.length > 0);
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    assert.equal(/https?:\/\//.test(text), false, file);
    for (const line of text.split('\n')) {
      if (/^\s*(import|export)\b/.test(line)) {
        assert.equal(forbiddenImport.test(line), false, `${file}: ${line}`);
      }
    }
  }
  const component = readFileSync(path.join(sourceRoot, 'app.component.ts'), 'utf8');
  assert.equal(component.includes(SYNTHETIC_DEMO_BADGE), false);
  assert.match(component, /SYNTHETIC_DEMO_BADGE/);
  assert.match(component, /status === 'loading'/);
  assert.match(component, /status === 'empty'/);
  assert.match(component, /status === 'error'/);
  assert.match(component, /status === 'list'/);

  const proxy = JSON.parse(
    readFileSync(path.join(process.cwd(), 'apps/egame-web/proxy.conf.json'), 'utf8'),
  ) as { readonly '/catalog': { readonly target: string } };
  assert.deepEqual(Object.keys(proxy), ['/catalog']);
  assert.equal(proxy['/catalog'].target, 'http://127.0.0.1:3000');
});

function listFiles(directory: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(directory)) {
    const fullPath = path.join(directory, entry);
    if (statSync(fullPath).isDirectory()) {
      files.push(...listFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}
