import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:net';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { isBrowserStartupFailure } from './browser.mjs';
import { pidAlive, spawnGroup, stopGroup } from './children.mjs';
import { loadCatalogProxyRule, startCatalogProxy } from './proxy.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const upScript = path.join(root, 'tools/local-egame-fullstack/up.mjs');

test('browser startup failures stay distinct from a missing page', () => {
  assert.equal(isBrowserStartupFailure(new Error('chrome debugger timed out')), true);
  assert.equal(isBrowserStartupFailure(new Error('chrome exited')), true);
  assert.equal(isBrowserStartupFailure(new Error('empty state missing')), false);
  assert.equal(isBrowserStartupFailure(new Error('created entry missing')), false);
});

test('catalog proxy rule stays on loopback', () => {
  assert.deepEqual(loadCatalogProxyRule(root), {
    prefix: '/catalog',
    target: 'http://127.0.0.1:3000',
  });
});

test('proxy failure stays closed and does not echo the request', async () => {
  const proxy = await startCatalogProxy(1);
  try {
    const hidden = await fetch(`http://127.0.0.1:${proxy.port}/health/live`);
    assert.equal(hidden.status, 404);
    assert.deepEqual(await hidden.json(), { code: 'NOT_PROXIED' });

    const down = await fetch(`http://127.0.0.1:${proxy.port}/catalog/synthetic-entries`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ syntheticLabel: 'NOT-A-LABEL' }),
    });
    const text = await down.text();
    assert.equal(down.status, 502);
    assert.equal(text, '{"code":"UPSTREAM_UNAVAILABLE"}');
    assert.equal(text.includes('NOT-A-LABEL'), false);
  } finally {
    await proxy.close();
  }
});

test('stopGroup kills only the recorded process group', async () => {
  const first = spawnGroup(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], {
    stdio: 'ignore',
  });
  const second = spawnGroup(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], {
    stdio: 'ignore',
  });
  try {
    await new Promise((resolve) => setTimeout(resolve, 100));
    assert.equal(pidAlive(first.child.pid), true);
    assert.equal(pidAlive(second.child.pid), true);
    await stopGroup(first);
    assert.equal(pidAlive(first.child.pid), false);
    assert.equal(first.child.exitCode !== null || first.child.signalCode !== null, true);
    assert.equal(pidAlive(second.child.pid), true);
  } finally {
    await stopGroup(first);
    await stopGroup(second);
  }
});

test('up refuses a busy loopback port without taking the other one', async () => {
  await assertRefusal(3000);
  await assertRefusal(4200);
});

test('fullstack scripts do not kill by name or delete volumes', () => {
  const sources = ['children.mjs', 'proxy.mjs', 'browser.mjs', 'smoke.mjs', 'up.mjs'].map((name) =>
    readFileSync(path.join(root, 'tools/local-egame-fullstack', name), 'utf8'),
  );
  const combined = sources.join('\n');
  assert.equal(/pkill|killall|docker volume|volume rm|down -v|--fresh/.test(combined), false);
});

async function assertRefusal(port) {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => resolve(undefined));
  });
  try {
    const result = spawnSync(process.execPath, [upScript], {
      cwd: root,
      encoding: 'utf8',
      timeout: 15000,
      env: { PATH: process.env.PATH ?? '' },
    });
    assert.equal(result.status, 2, `${result.stdout}\n${result.stderr}`);
    assert.match(result.stderr, new RegExp(`port 127\\.0\\.0\\.1:${port} is already in use`));
    assert.equal(result.stdout ?? '', '');
    await listenBriefly(port === 3000 ? 4200 : 3000);
  } finally {
    await new Promise((resolve) => server.close(() => resolve(undefined)));
  }
}

function listenBriefly(port) {
  const server = createServer();
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => {
      server.close(() => resolve(undefined));
    });
  });
}
