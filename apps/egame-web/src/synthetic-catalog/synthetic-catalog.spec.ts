import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import {
  alertFor,
  loadSyntheticEntries,
  SYNTHETIC_ENTRIES_PATH,
  WRITE_REJECTION_MESSAGE,
  type FetchLike,
  type MutationFetch,
  type MutationInit,
  type MutationResponse,
  type WriteRejection,
} from './synthetic-catalog-client';
import { refreshAfterWrite, SyntheticCatalogEditor } from './synthetic-catalog-editor';
import { recoveryStatusText, SyntheticRevisionRecovery } from './synthetic-catalog-recovery';
import {
  discoverEntries,
  NO_MATCH_TEXT,
  normalizeDiscoveryQuery,
} from './synthetic-catalog-discovery';
import {
  ERROR_VIEW,
  LOADING_VIEW,
  SYNTHETIC_DEMO_BADGE,
  viewForEntries,
} from './synthetic-catalog-view';
import {
  parseSyntheticEntryList,
  SyntheticCatalogClientError,
  type SyntheticEntry,
} from './synthetic-entry';

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
  assert.match(component, /id="catalog-search"/);
  assert.match(component, /id="catalog-sort"/);
  assert.match(component, /Clear search/);
  assert.match(component, /showing \{\{ summary\.shown \}\} of \{\{ summary\.total \}\}/);
  assert.match(component, /No matching synthetic entries\./);
  assert.equal(component.includes('summary.query'), false);
  assert.equal(component.includes('searchQuery.set'), true);
  assert.match(component, /id="create-product-id"/);
  assert.match(component, /id="create-label"/);
  assert.match(component, /id="update-label"/);
  assert.match(component, /id="update-revision"/);
  assert.match(component, /id="recover-revision"/);
  assert.match(component, /Recover latest revision/);
  assert.match(component, /id="recovery-status"/);
  assert.match(component, /role="status"/);
  assert.match(component, /SyntheticRevisionRecovery/);
  assert.equal(component.includes('id="update-product-id"'), false);
  const recoverBody = component.slice(
    component.indexOf('recoverRevision()'),
    component.indexOf('private write'),
  );
  assert.equal(recoverBody.includes('submitUpdate'), false);
  assert.equal(recoverBody.includes('submitCreate'), false);
  assert.equal(recoverBody.includes('PATCH'), false);
  assert.match(component, /\[disabled\]="busy\(\)"/);
  assert.match(component, /shouldRefreshList|refreshAfterWrite/);
  assert.match(component, /Two API pods do not share/);
  assert.match(component, /not high availability/);
  assert.equal(/\b(price|sku|stock|stripe|tenant)\b/i.test(component), false);

  const proxy = JSON.parse(
    readFileSync(path.join(process.cwd(), 'apps/egame-web/proxy.conf.json'), 'utf8'),
  ) as { readonly '/catalog': { readonly target: string } };
  assert.deepEqual(Object.keys(proxy), ['/catalog']);
  assert.equal(proxy['/catalog'].target, 'http://127.0.0.1:3000');
});

test('creates and updates a synthetic entry, then refreshes only after success', async () => {
  const created = entry(1);
  const updated = entry(2, 'synthetic-entry-b');
  const calls: Array<{ path: string; init: MutationInit }> = [];
  const fetchImpl: MutationFetch = (path, init) => {
    calls.push({ path, init });
    const body = init.method === 'POST' ? created : updated;
    const status = init.method === 'POST' ? 201 : 200;
    return Promise.resolve(jsonResponse(status, body));
  };
  const editor = new SyntheticCatalogEditor(fetchImpl);
  editor.createProductId = PRODUCT_ID;
  editor.createLabel = 'synthetic-entry-a';
  const createdOutcome = await editor.submitCreate();
  assert.equal(createdOutcome.kind, 'success');
  assert.equal(calls.length, 1);
  assert.equal(calls[0]?.path, SYNTHETIC_ENTRIES_PATH);
  assert.equal(calls[0]?.init.method, 'POST');
  assert.equal(
    calls[0]?.init.body,
    JSON.stringify({ productId: PRODUCT_ID, syntheticLabel: 'synthetic-entry-a' }),
  );
  assert.deepEqual(calls[0]?.init.headers, {
    accept: 'application/json',
    'content-type': 'application/json',
  });
  assert.equal(editor.createProductId, '');
  assert.equal(editor.createLabel, '');
  assert.equal(alertFor(createdOutcome), null);

  let reloads = 0;
  const refreshed = await refreshAfterWrite(createdOutcome, async () => {
    reloads += 1;
    return [created];
  });
  assert.equal(reloads, 1);
  assert.equal(refreshed?.length, 1);

  editor.beginEdit(created);
  editor.updateLabel = 'synthetic-entry-b';
  const updatedOutcome = await editor.submitUpdate();
  assert.equal(updatedOutcome.kind, 'success');
  if (updatedOutcome.kind === 'success') {
    assert.equal(updatedOutcome.entry.revision, 2);
    assert.equal(updatedOutcome.entry.syntheticLabel, 'synthetic-entry-b');
  }
  assert.equal(calls[1]?.path, `${SYNTHETIC_ENTRIES_PATH}/${PRODUCT_ID}`);
  assert.equal(calls[1]?.init.method, 'PATCH');
  assert.equal(
    calls[1]?.init.body,
    JSON.stringify({ syntheticLabel: 'synthetic-entry-b', expectedRevision: 1 }),
  );
  assert.equal(editor.updateProductId, PRODUCT_ID);
  assert.equal(editor.updateLabel, 'synthetic-entry-b');
  assert.equal(editor.updateRevision, '2');
  assert.equal(editor.canRecoverRevision, false);
  const skipped = await refreshAfterWrite({ kind: 'rejected', rejection: 'stale' }, async () => {
    reloads += 1;
    return [];
  });
  assert.equal(skipped, null);
  assert.equal(reloads, 1);
});

test('keeps rejected input out of validation and API errors', async () => {
  let calls = 0;
  const editor = new SyntheticCatalogEditor(() => {
    calls += 1;
    return Promise.resolve(jsonResponse(201, entry(1)));
  });
  editor.createProductId = SECRET;
  editor.createLabel = 'synthetic-entry-a';
  const idOutcome = await editor.submitCreate();
  assert.deepEqual(idOutcome, { kind: 'rejected', rejection: 'product-id' });
  assert.equal(alertFor(idOutcome), WRITE_REJECTION_MESSAGE['product-id']);
  assert.equal(alertFor(idOutcome)?.includes(SECRET), false);
  assert.equal(JSON.stringify(idOutcome).includes(SECRET), false);
  assert.equal(editor.createProductId, SECRET);
  assert.equal(calls, 0);

  editor.createProductId = PRODUCT_ID;
  editor.createLabel = 'NOT-A-LABEL';
  const labelOutcome = await editor.submitCreate();
  assert.deepEqual(labelOutcome, { kind: 'rejected', rejection: 'label' });
  assert.equal(alertFor(labelOutcome)?.includes('NOT-A-LABEL'), false);
  assert.equal(calls, 0);

  const leaked = new SyntheticCatalogEditor(() =>
    Promise.resolve(
      jsonResponse(400, {
        code: 'LABEL_INVALID',
        reason: 'format',
        syntheticLabel: 'NOT-A-LABEL',
        note: SECRET,
      }),
    ),
  );
  leaked.createProductId = PRODUCT_ID;
  leaked.createLabel = 'synthetic-entry-a';
  const echoed = await leaked.submitCreate();
  assert.deepEqual(echoed, { kind: 'rejected', rejection: 'label' });
  assert.equal(alertFor(echoed)?.includes(SECRET), false);
  assert.equal(alertFor(echoed)?.includes('NOT-A-LABEL'), false);
  assert.equal(JSON.stringify(echoed).includes(SECRET), false);
  assert.equal(leaked.createLabel, 'synthetic-entry-a');
});

test('reports duplicate, capacity, stale revision, and a missing entry without changing the draft', async () => {
  const samples: Array<{ status: number; code: string; rejection: WriteRejection }> = [
    { status: 409, code: 'DUPLICATE_PRODUCT_ID', rejection: 'duplicate' },
    { status: 409, code: 'CAPACITY_EXCEEDED', rejection: 'capacity' },
    { status: 409, code: 'REVISION_CONFLICT', rejection: 'stale' },
    { status: 404, code: 'NOT_FOUND', rejection: 'missing' },
  ];
  for (const sample of samples) {
    const editor = new SyntheticCatalogEditor(() =>
      Promise.resolve(
        jsonResponse(sample.status, {
          code: sample.code,
          reason: 'fixed',
          syntheticLabel: SECRET,
        }),
      ),
    );
    editor.beginEdit(entry(1));
    editor.updateLabel = 'synthetic-entry-b';
    editor.updateRevision = '9';
    const outcome = await editor.submitUpdate();
    assert.deepEqual(outcome, { kind: 'rejected', rejection: sample.rejection });
    const message = alertFor(outcome);
    assert.equal(message, WRITE_REJECTION_MESSAGE[sample.rejection]);
    assert.equal(message?.includes(SECRET), false);
    assert.equal(message?.includes('synthetic-entry-b'), false);
    assert.equal(JSON.stringify(outcome).includes(SECRET), false);
    assert.equal(editor.updateProductId, PRODUCT_ID);
    assert.equal(editor.updateLabel, 'synthetic-entry-b');
    assert.equal(editor.updateRevision, '9');
    assert.equal(editor.canRecoverRevision, sample.rejection === 'stale');
  }
});

test('a transport failure and a second click do not send another request', async () => {
  const thrown = new SyntheticCatalogEditor(() => Promise.reject(new Error(SECRET)));
  thrown.createProductId = PRODUCT_ID;
  thrown.createLabel = 'synthetic-entry-a';
  const transport = await thrown.submitCreate();
  assert.deepEqual(transport, { kind: 'rejected', rejection: 'http' });
  assert.equal(alertFor(transport)?.includes(SECRET), false);
  assert.equal(thrown.createProductId, PRODUCT_ID);
  assert.equal(thrown.createLabel, 'synthetic-entry-a');

  let calls = 0;
  let release: (response: MutationResponse) => void = () => undefined;
  const pending = new Promise<MutationResponse>((resolve) => {
    release = resolve;
  });
  const editor = new SyntheticCatalogEditor(() => {
    calls += 1;
    return pending;
  });
  editor.createProductId = PRODUCT_ID;
  editor.createLabel = 'synthetic-entry-a';
  const first = editor.submitCreate();
  const second = await editor.submitCreate();
  assert.deepEqual(second, { kind: 'busy' });
  assert.equal(calls, 1);
  assert.equal(editor.busy, true);
  editor.beginEdit(entry(4, 'synthetic-entry-b'));
  assert.equal(editor.updateProductId, '');
  release(jsonResponse(201, entry(1)));
  const done = await first;
  assert.equal(done.kind, 'success');
  assert.equal(editor.busy, false);
  assert.equal(editor.createProductId, '');
});

test('normalizes a discovery query without locale ordering', () => {
  assert.equal(normalizeDiscoveryQuery('  SYNTHETIC-ENTRY-A  '), 'synthetic-entry-a');
  assert.equal(normalizeDiscoveryQuery('synthetic\u00a0entry-a'), 'synthetic entry-a');
  assert.equal(normalizeDiscoveryQuery('\uFF21'), 'a');
  assert.equal(normalizeDiscoveryQuery('   '), '');
  assert.equal(NO_MATCH_TEXT.includes('NOT-A-LABEL'), false);
  assert.equal(NO_MATCH_TEXT.includes(SECRET), false);
});

test('filters and sorts the loaded list without mutating it or echoing the query', () => {
  const first = entry(2, 'synthetic-entry-b');
  const second = { ...entry(1, 'synthetic-entry-a'), productId: OTHER_PRODUCT_ID };
  const tied = { ...entry(1, 'synthetic-entry-a'), productId: PRODUCT_ID };
  const original = [first, second];
  const before = original.map((item) => item.productId);

  const all = discoverEntries(original, '   ', 'id-asc');
  assert.deepEqual(
    all.entries.map((item) => item.productId),
    [PRODUCT_ID, OTHER_PRODUCT_ID],
  );
  assert.equal(all.emptyData, false);
  assert.equal(all.noMatches, false);
  assert.equal(all.shown, 2);
  assert.equal(all.total, 2);
  assert.deepEqual(
    original.map((item) => item.productId),
    before,
  );

  const byLabel = discoverEntries(original, '  ENTRY-A ', 'label-desc');
  assert.deepEqual(
    byLabel.entries.map((item) => item.productId),
    [OTHER_PRODUCT_ID],
  );
  const byId = discoverEntries(original, 'q69g5fav', 'id-asc');
  assert.deepEqual(
    byId.entries.map((item) => item.productId),
    [PRODUCT_ID],
  );
  const none = discoverEntries(original, 'missing-label', 'id-asc');
  assert.equal(none.noMatches, true);
  assert.equal(none.emptyData, false);
  assert.equal(none.shown, 0);
  assert.equal(none.total, 2);
  assert.equal(JSON.stringify(none).includes('missing-label'), false);

  const empty = discoverEntries([], 'entry', 'id-asc');
  assert.equal(empty.emptyData, true);
  assert.equal(empty.noMatches, false);
  assert.equal(empty.shown, 0);
  assert.equal(empty.total, 0);

  const sameLabel = discoverEntries([second, tied], '', 'label-desc');
  assert.deepEqual(
    sameLabel.entries.map((item) => item.productId),
    [PRODUCT_ID, OTHER_PRODUCT_ID],
  );
  const codePointOrder = discoverEntries(
    [
      { productId: OTHER_PRODUCT_ID, syntheticLabel: 'a-2', revision: 1 },
      { productId: PRODUCT_ID, syntheticLabel: 'a-10', revision: 1 },
    ],
    '',
    'label-asc',
  );
  assert.deepEqual(
    codePointOrder.entries.map((item) => item.syntheticLabel),
    ['a-10', 'a-2'],
  );
});

test('keeps the same search when a later list edits the matching label', () => {
  const query = 'ENTRY-A';
  const sort = 'label-asc' as const;
  const before = discoverEntries(
    [entry(2, 'synthetic-entry-b'), { ...entry(1), productId: OTHER_PRODUCT_ID }],
    query,
    sort,
  );
  assert.deepEqual(
    before.entries.map((item) => item.productId),
    [OTHER_PRODUCT_ID],
  );
  const afterEdit = discoverEntries(
    [
      entry(2, 'synthetic-entry-b'),
      { productId: OTHER_PRODUCT_ID, syntheticLabel: 'synthetic-entry-c', revision: 2 },
    ],
    query,
    sort,
  );
  assert.equal(afterEdit.noMatches, true);
  assert.equal(afterEdit.shown, 0);
  assert.equal(afterEdit.total, 2);
  assert.equal(JSON.stringify(afterEdit).includes(query), false);
  const widened = discoverEntries(
    [
      entry(2, 'synthetic-entry-b'),
      { productId: OTHER_PRODUCT_ID, syntheticLabel: 'synthetic-entry-c', revision: 2 },
    ],
    'entry',
    'id-desc',
  );
  assert.deepEqual(
    widened.entries.map((item) => item.productId),
    [OTHER_PRODUCT_ID, PRODUCT_ID],
  );
});

test('a stale rejection recovers the stored revision without a patch and keeps the draft', async () => {
  const calls: Array<{ path: string; init: MutationInit }> = [];
  const editor = new SyntheticCatalogEditor((path, init) => {
    calls.push({ path, init });
    if (init.body.includes('"expectedRevision":9')) {
      return Promise.resolve(jsonResponse(409, { code: 'REVISION_CONFLICT', note: SECRET }));
    }
    return Promise.resolve(jsonResponse(200, entry(3, 'synthetic-entry-c')));
  });
  editor.beginEdit(entry(2));
  editor.updateLabel = 'synthetic-entry-c';
  editor.updateRevision = '9';
  const stale = await editor.submitUpdate();
  assert.deepEqual(stale, { kind: 'rejected', rejection: 'stale' });
  assert.equal(editor.canRecoverRevision, true);
  assert.equal(editor.updateLabel, 'synthetic-entry-c');
  assert.equal(editor.updateRevision, '9');
  assert.equal(calls.length, 1);
  assert.equal(calls[0]?.path, `${SYNTHETIC_ENTRIES_PATH}/${PRODUCT_ID}`);

  let reads = 0;
  const recovery = new SyntheticRevisionRecovery(async () => {
    reads += 1;
    return [entry(2, 'synthetic-entry-a')];
  });
  const ignored = await recovery.recover(PRODUCT_ID, false);
  assert.deepEqual(ignored, { kind: 'ignored' });
  assert.equal(reads, 0);

  const ready = await recovery.recover(PRODUCT_ID, editor.canRecoverRevision);
  assert.equal(reads, 1);
  assert.equal(ready.kind, 'ready');
  if (ready.kind !== 'ready') {
    return;
  }
  const status = recoveryStatusText(ready);
  assert.match(status ?? '', /^Latest stored revision is 2\. Stored label synthetic-entry-a\. /);
  assert.equal(status?.includes('synthetic-entry-c'), false);
  assert.equal(status?.includes(SECRET), false);
  assert.equal(status?.includes('9'), false);
  assert.equal(calls.length, 1);
  assert.equal(editor.applyRecoveredRevision(PRODUCT_ID, ready.revision), true);
  assert.equal(editor.updateRevision, '2');
  assert.equal(editor.updateLabel, 'synthetic-entry-c');
  assert.equal(editor.canRecoverRevision, true);

  editor.updateProductId = OTHER_PRODUCT_ID;
  assert.equal(editor.applyRecoveredRevision(PRODUCT_ID, 4), false);
  editor.updateProductId = PRODUCT_ID;
  assert.equal(editor.updateRevision, '2');

  const saved = await editor.submitUpdate();
  assert.equal(saved.kind, 'success');
  assert.equal(calls.length, 2);
  assert.equal(calls[1]?.init.method, 'PATCH');
  assert.equal(
    calls[1]?.init.body,
    JSON.stringify({ syntheticLabel: 'synthetic-entry-c', expectedRevision: 2 }),
  );
  assert.equal(editor.updateRevision, '3');
  assert.equal(editor.updateLabel, 'synthetic-entry-c');
  assert.equal(editor.canRecoverRevision, false);

  editor.beginEdit(entry(2));
  editor.updateRevision = '9';
  const again = await editor.submitUpdate();
  assert.equal(again.kind, 'rejected');
  editor.beginEdit(entry(2, 'synthetic-entry-a'));
  assert.equal(editor.canRecoverRevision, false);
  assert.equal(editor.updateLabel, 'synthetic-entry-a');
  assert.equal(editor.updateRevision, '2');
});

test('recovery misses, fails, and drops a read when the selection moves', async () => {
  const editor = new SyntheticCatalogEditor(() => {
    throw new Error('patch');
  });
  editor.beginEdit(entry(1));
  editor.updateLabel = 'synthetic-entry-c';
  editor.updateRevision = '9';
  editor.applyRecoveredRevision(PRODUCT_ID, 2);
  assert.equal(editor.updateRevision, '9');

  const missing = await new SyntheticRevisionRecovery(async () => [
    { productId: OTHER_PRODUCT_ID, syntheticLabel: 'synthetic-entry-a', revision: 1 },
  ]).recover(PRODUCT_ID, true);
  assert.equal(missing.kind, 'missing');
  assert.equal(recoveryStatusText(missing)?.includes('synthetic-entry-c'), false);
  assert.equal(recoveryStatusText(missing)?.includes(SECRET), false);
  assert.equal(editor.updateRevision, '9');
  assert.equal(editor.updateLabel, 'synthetic-entry-c');

  const broken = await new SyntheticRevisionRecovery(async () => {
    parseSyntheticEntryList({
      entries: [
        { productId: PRODUCT_ID, syntheticLabel: 'synthetic-entry-a', revision: 2, price: 4 },
      ],
    });
    return [];
  }).recover(PRODUCT_ID, true);
  assert.deepEqual(broken, { kind: 'unavailable' });
  const unavailable = recoveryStatusText(broken);
  assert.equal(unavailable, 'The latest revision could not be read. The draft was kept.');
  assert.equal(unavailable?.includes('price'), false);
  assert.equal(unavailable?.includes(SECRET), false);

  const skipped = await new SyntheticRevisionRecovery(() =>
    Promise.reject(new Error(SECRET)),
  ).recover('', true);
  assert.deepEqual(skipped, { kind: 'ignored' });
  const closed = await new SyntheticRevisionRecovery(() =>
    Promise.reject(new Error(SECRET)),
  ).recover(PRODUCT_ID, true);
  assert.deepEqual(closed, { kind: 'unavailable' });
  assert.equal(JSON.stringify(closed).includes(SECRET), false);

  let reads = 0;
  let release: (entries: readonly SyntheticEntry[]) => void = () => undefined;
  const pending = new Promise<readonly SyntheticEntry[]>((resolve) => {
    release = resolve;
  });
  const recovery = new SyntheticRevisionRecovery(() => {
    reads += 1;
    return pending;
  });
  const first = recovery.recover(PRODUCT_ID, true);
  const second = await recovery.recover(PRODUCT_ID, true);
  assert.deepEqual(second, { kind: 'ignored' });
  assert.equal(reads, 1);
  recovery.moveSelection();
  release([entry(4, 'synthetic-entry-a')]);
  const moved = await first;
  assert.deepEqual(moved, { kind: 'moved' });
  assert.equal(recoveryStatusText(moved), null);
  assert.equal(editor.updateRevision, '9');
  assert.equal(editor.updateLabel, 'synthetic-entry-c');
  assert.equal(editor.applyRecoveredRevision(PRODUCT_ID, 4), false);
});

function entry(revision: number, syntheticLabel = 'synthetic-entry-a'): SyntheticEntry {
  return { productId: PRODUCT_ID, syntheticLabel, revision };
}

function jsonResponse(status: number, body: unknown): MutationResponse {
  return { status, json: () => Promise.resolve(body) };
}

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
