import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { isBrowserStartupFailure } from '../local-egame-fullstack/browser.mjs';
import {
  delay,
  freePort,
  pidAlive,
  portBusy,
  spawnGroup,
  stopGroup,
} from '../local-egame-fullstack/children.mjs';
import { classifyBrowserFailure, preflightFrom, requiredBrowserLine } from './browser-outcome.mjs';
import { STACK_PORTS } from './ports.mjs';
import { createSupervisor } from './supervisor.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const browserSource = readFileSync(
  path.join(root, 'tools/local-commercecore-stack/browser-smoke.mjs'),
  'utf8',
);
const httpSmoke = readFileSync(path.join(root, 'tools/local-commercecore-stack/smoke.mjs'), 'utf8');

test('a required browser skip is a failure and cannot pass', () => {
  const skipped = requiredBrowserLine({ status: 'NOT_RUN', reason: 'chrome-unavailable' });
  assert.equal(skipped.exitCode, 1);
  assert.equal(skipped.line, 'browser-smoke: FAIL stage=unknown reason=unclassified');
  assert.equal(skipped.line.includes('NOT_RUN'), false);
  assert.equal(skipped.line.includes('PASS'), false);

  const missing = requiredBrowserLine({
    status: 'FAIL',
    stage: 'preflight',
    reason: 'chrome-missing',
  });
  assert.equal(missing.exitCode, 1);
  assert.equal(missing.line, 'browser-smoke: FAIL stage=preflight reason=chrome-missing');

  const leaked = requiredBrowserLine(
    classifyBrowserFailure(new Error('http://127.0.0.1:9/NOT-A-LABEL')),
  );
  assert.equal(leaked.line, 'browser-smoke: FAIL stage=unknown reason=unclassified');
  assert.equal(leaked.line.includes('NOT-A-LABEL'), false);
  assert.equal(leaked.line.includes('127.0.0.1'), false);

  const page = classifyBrowserFailure(new Error('empty state missing'));
  assert.deepEqual(page, { status: 'FAIL', stage: 'page', reason: 'empty-state-missing' });
  assert.equal(isBrowserStartupFailure(new Error('empty state missing')), false);
  assert.equal(isBrowserStartupFailure(new Error('chrome debugger timed out')), true);
  assert.deepEqual(classifyBrowserFailure(new Error('chrome debugger timed out')), {
    status: 'FAIL',
    stage: 'debugger',
    reason: 'chrome-debugger-timed-out',
  });
});

test('a required browser pass names the checks and no payload', () => {
  const incomplete = requiredBrowserLine({ status: 'PASS', loading: 'shown' });
  assert.equal(incomplete.exitCode, 1);
  assert.equal(incomplete.line, 'browser-smoke: FAIL stage=page reason=discovery-missing');
  const passed = requiredBrowserLine({
    status: 'PASS',
    loading: 'shown',
    search: 'shown',
    sort: 'shown',
    recover: 'shown',
  });
  assert.equal(passed.exitCode, 0);
  assert.match(
    passed.line,
    /^browser-smoke: PASS empty=shown list=shown error=shown duplicate-alert=shown stale-alert=shown rejected-echo=absent commercial=absent cloud-before=live cloud-after=live loading=shown search=shown sort=shown recover=shown$/,
  );
  const withoutRecover = requiredBrowserLine({
    status: 'PASS',
    loading: 'shown',
    search: 'shown',
    sort: 'shown',
  });
  assert.equal(withoutRecover.exitCode, 1);
  assert.equal(withoutRecover.line, 'browser-smoke: FAIL stage=page reason=recover-missing');
  const unseen = requiredBrowserLine({
    status: 'PASS',
    loading: 'maybe',
    search: 'shown',
    sort: 'shown',
    recover: 'shown',
  });
  assert.match(unseen.line, /loading=not-observed search=shown sort=shown recover=shown$/);
  assert.equal(/prd_|NOT-A-LABEL|127\.0\.0\.1|missing-label/.test(passed.line), false);
});

test('preflight fails closed before chrome, the web build, or the APIs exist', () => {
  assert.deepEqual(
    preflightFrom({ apiBuilt: false, cloudBuilt: true, chrome: true, webBuilt: true }),
    {
      status: 'FAIL',
      stage: 'preflight',
      reason: 'build-missing',
    },
  );
  assert.deepEqual(
    preflightFrom({ apiBuilt: true, cloudBuilt: true, chrome: false, webBuilt: true }),
    {
      status: 'FAIL',
      stage: 'preflight',
      reason: 'chrome-missing',
    },
  );
  assert.deepEqual(
    preflightFrom({ apiBuilt: true, cloudBuilt: true, chrome: true, webBuilt: false }),
    { status: 'FAIL', stage: 'preflight', reason: 'web-build-missing' },
  );
  assert.equal(
    preflightFrom({ apiBuilt: true, cloudBuilt: true, chrome: true, webBuilt: true }),
    null,
  );
});

test('the required browser command stays separate from the HTTP skip', () => {
  assert.equal(browserSource.includes('NOT_RUN'), false);
  assert.equal(
    /pkill|killall|docker volume|volume rm|down -v|--fresh|0\.0\.0\.0/.test(browserSource),
    false,
  );
  assert.match(browserSource, /requestShutdown\(1\)/);
  assert.equal(browserSource.includes('requestShutdown(0)'), false);
  assert.match(browserSource, /createSupervisor\(/);
  assert.match(browserSource, /stopOwned\(/);
  assert.match(httpSmoke, /browser-smoke: NOT_RUN reason=isolated-catalog-proxy/);
  const writes = [
    ...browserSource.matchAll(/process\.(?:stdout|stderr)\.write\((?:`([^`]*)`|'([^']*)')\)/g),
  ].map((match) => match[1] ?? match[2]);
  assert.deepEqual(writes, [
    '${formatted.line}\\n',
    'g5: NOT_CLAIMED\\n',
    'local-commercecore-stack-browser: pass\\n',
    '${formatted.line}\\n',
    'local-commercecore-stack-browser: fail\\n',
  ]);
});

test('owned cleanup releases the listener and leaves another process', async () => {
  const supervisor = createSupervisor();
  const bystander = spawnGroup(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], {
    stdio: 'ignore',
  });
  const port = await ephemeralPort();
  const owned = supervisor.own(
    spawnGroup(
      process.execPath,
      [
        '-e',
        `const { createServer } = require('node:net');
         const { spawn } = require('node:child_process');
         const server = createServer();
         server.listen(${port}, '127.0.0.1');
         spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { stdio: 'ignore' });
         setInterval(() => {}, 1000);`,
      ],
      { stdio: 'ignore' },
    ),
  );
  try {
    const opened = await waitUntil(() => portBusy(port), 3000);
    assert.equal(opened, true);
    assert.equal(pidAlive(bystander.child.pid), true);
    await supervisor.stopOwned();
    assert.equal(owned.exited(), true);
    assert.equal(pidAlive(owned.child.pid), false);
    assert.equal(await waitUntil(async () => !(await portBusy(port)), 2000), true);
    assert.equal(pidAlive(bystander.child.pid), true);
  } finally {
    await stopGroup(owned);
    await stopGroup(bystander);
  }
});

async function ephemeralPort() {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const port = await freePort();
    if (!STACK_PORTS.includes(port)) {
      return port;
    }
  }
  throw new Error('port unavailable');
}

async function waitUntil(ready, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await ready()) {
      return true;
    }
    await delay(50);
  }
  return false;
}
