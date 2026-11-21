import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { portBusy } from '../local-egame-fullstack/children.mjs';
import { STACK_PORTS } from './ports.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

test('the three-app smoke keeps catalog state off CommerceCloud', { timeout: 120000 }, async () => {
  const fixture = JSON.parse(
    readFileSync(path.join(root, 'tools/local-egame-fullstack/synthetic-input.json'), 'utf8'),
  );
  const result = spawnSync(process.execPath, ['tools/local-commercecore-stack/smoke.mjs'], {
    cwd: root,
    encoding: 'utf8',
    timeout: 110000,
    env: { PATH: process.env.PATH ?? '' },
  });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.equal(result.stderr, '');
  for (const line of [
    'local-commercecore-stack-smoke: boundary=process-local financial=false provider=none persistence=memory',
    'local-commercecore-stack-smoke: two pods do not share entries',
    'local-commercecore-stack-smoke: admin-absent status=404',
    'local-commercecore-stack-smoke: stores-absent status=404',
    'local-commercecore-stack-smoke: ready-absent status=404',
    'local-commercecore-stack-smoke: tenant-header-ignored',
    'local-commercecore-stack-smoke: list-empty http=200 count=0',
    'local-commercecore-stack-smoke: create http=201 revision=1',
    'local-commercecore-stack-smoke: update http=200 revision=2',
    'local-commercecore-stack-smoke: stale http=409 unchanged=true',
    'local-commercecore-stack-smoke: duplicate http=409',
    'local-commercecore-stack-smoke: invalid-label http=400 echoed=false',
    'local-commercecore-stack-smoke: core-isolated-after-cloud-stop',
    'local-commercecore-stack-smoke: cloud-isolated-after-core-stop',
    'local-commercecore-stack-smoke: proxy-closed-after-core-stop http=502',
    'local-commercecore-stack-smoke: children-stopped',
    'browser-smoke: NOT_RUN reason=isolated-catalog-proxy',
    'g5: NOT_CLAIMED',
    'local-commercecore-stack-smoke: pass',
  ]) {
    assert.equal(result.stdout.includes(line), true, line);
  }
  assert.match(result.stdout, /core-live service=commercecore-api host=127\.0\.0\.1 port=\d+/);
  assert.match(result.stdout, /cloud-live service=commercecloud-api host=127\.0\.0\.1 port=\d+/);
  assert.equal(result.stdout.includes('browser-smoke: PASS'), false);
  assert.equal(result.stdout.includes('0.0.0.0'), false);
  const ports = [...result.stdout.matchAll(/port=(\d+)/g)].map((match) => Number(match[1]));
  assert.equal(ports.length >= 2, true);
  for (const port of ports) {
    assert.equal(STACK_PORTS.includes(port), false, String(port));
    assert.equal(await portBusy(port), false, String(port));
  }
  for (const secret of [fixture.rejectedProductId, fixture.rejectedLabel, fixture.rejectedExtra]) {
    assert.equal(result.stdout.includes(secret), false);
    assert.equal(result.stderr.includes(secret), false);
  }
});
