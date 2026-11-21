import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { browserSkipReason } from './browser.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

test('local egame fullstack smoke exercises the catalog proxy', { timeout: 180000 }, () => {
  const fixture = JSON.parse(
    readFileSync(path.join(root, 'tools/local-egame-fullstack/synthetic-input.json'), 'utf8'),
  );
  const result = spawnSync(process.execPath, ['tools/local-egame-fullstack/smoke.mjs'], {
    cwd: root,
    encoding: 'utf8',
    timeout: 170000,
    env: {
      PATH: process.env.PATH ?? '',
      EGAME_SCREENSHOT_DIR: process.env.EGAME_SCREENSHOT_DIR,
    },
  });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.equal(result.stderr, '');
  for (const line of [
    'local-egame-fullstack-smoke: boundary=process-local financial=false provider=none persistence=memory',
    'proxy: prefix=/catalog target=127.0.0.1',
    'health: http=200 status=live',
    'unproxied: http=404 code=NOT_PROXIED',
    'list-empty: http=200 count=0',
    'create: http=201 revision=1',
    'list: http=200 count=1 revision=1',
    'update: http=200 revision=2',
    'stale: http=409 code=REVISION_CONFLICT unchanged=true',
    'duplicate: http=409 code=DUPLICATE_PRODUCT_ID',
    'invalid-label: http=400 code=LABEL_INVALID echoed=false',
    'invalid-id: http=400 code=PRODUCT_ID_INVALID echoed=false',
    'extra-field: http=400 code=BODY_INVALID echoed=false',
    'commercial: absent=true',
    'upstream-down: http=502 code=UPSTREAM_UNAVAILABLE echoed=false',
    'scope: g5=NOT_CLAIMED ac-cat-08=WAIT_OWNER_SMOKE k3d-two-replica=WAIT_OWNER_LOCAL',
    'local-egame-fullstack-smoke: pass',
  ]) {
    assert.equal(result.stdout.includes(line), true, line);
  }
  const skip = browserSkipReason(root);
  if (skip === null) {
    assert.match(
      result.stdout,
      /browser-smoke: PASS empty=shown list=shown error=shown duplicate-alert=shown stale-alert=shown commercial=absent loading=(?:shown|not-observed)/,
    );
  } else {
    assert.equal(result.stdout.includes(`browser-smoke: NOT_RUN reason=${skip}`), true);
  }
  for (const secret of [fixture.rejectedProductId, fixture.rejectedLabel, fixture.rejectedExtra]) {
    assert.equal(result.stdout.includes(secret), false);
    assert.equal(result.stderr.includes(secret), false);
  }
  assert.equal(/sk_|mongodb:\/\//i.test(result.stdout), false);
});
