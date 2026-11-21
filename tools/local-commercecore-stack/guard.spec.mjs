import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  delay,
  pidAlive,
  portBusy,
  spawnGroup,
  stopGroup,
} from '../local-egame-fullstack/children.mjs';
import { CLOUD_PORT, STACK_PORTS } from './ports.mjs';
import { createSupervisor } from './supervisor.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const upScript = path.join(root, 'tools/local-commercecore-stack/up.mjs');

test('stack scripts do not kill by name, bind publicly, or delete volumes', () => {
  const names = ['ports.mjs', 'supervisor.mjs', 'up.mjs', 'smoke.mjs'];
  const combined = names
    .map((name) => readFileSync(path.join(root, 'tools/local-commercecore-stack', name), 'utf8'))
    .join('\n');
  assert.equal(
    /pkill|killall|docker volume|volume rm|down -v|--fresh|0\.0\.0\.0/.test(combined),
    false,
  );
  const up = readFileSync(upScript, 'utf8');
  const preflight = up.indexOf('await busyStackPort()');
  const launch = up.indexOf('supervisor.own(');
  assert.ok(preflight > 0 && launch > preflight);
  const approved = readFileSync(
    path.join(root, 'apps/commercecloud-api/src/config/public-config.spec.ts'),
    'utf8',
  );
  assert.equal(approved.includes(`COMMERCECLOUD_HTTP_PORT: '${CLOUD_PORT}'`), true);
  assert.deepEqual(STACK_PORTS, [3000, 4200, CLOUD_PORT]);
});

test('a missing command is marked exited and is not left running', async () => {
  const missing = spawnGroup('pnpm-not-a-command-for-stack', ['serve']);
  await new Promise((resolve) => setTimeout(resolve, 50));
  assert.equal(missing.exited(), true);
  assert.match(missing.output(), /spawn-error:ENOENT/);
  assert.equal(missing.child.pid !== undefined && pidAlive(missing.child.pid), false);
});

test('cancel stops only the owned process group', async () => {
  const supervisor = createSupervisor();
  const owned = supervisor.own(
    spawnGroup(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { stdio: 'ignore' }),
  );
  const bystander = spawnGroup(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], {
    stdio: 'ignore',
  });
  try {
    await new Promise((resolve) => setTimeout(resolve, 100));
    assert.equal(pidAlive(owned.child.pid), true);
    assert.equal(pidAlive(bystander.child.pid), true);
    await supervisor.stopOwned();
    assert.equal(pidAlive(owned.child.pid), false);
    assert.equal(owned.exited(), true);
    assert.equal(pidAlive(bystander.child.pid), true);
  } finally {
    await stopGroup(owned);
    await stopGroup(bystander);
  }
});

test('occupied ports, failed startup, and cancel leave the stack ports free', async () => {
  for (const port of STACK_PORTS) {
    await assertRefusal(port);
  }
  await assertCleanup({ signal: false, status: 1 });
  await assertCleanup({ signal: true });
  await assertDoubleSignal();
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
  } finally {
    await new Promise((resolve) => server.close(() => resolve(undefined)));
  }
  for (const other of STACK_PORTS) {
    if (other !== port) {
      assert.equal(await portBusy(other), false, String(other));
    }
  }
}

async function assertCleanup({ signal, status }) {
  const bystander = spawnGroup(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], {
    stdio: 'ignore',
  });
  const empty = mkdtempSync(path.join(tmpdir(), 'commercecore-stack-'));
  const child = spawn(process.execPath, [upScript], {
    cwd: root,
    env: { PATH: empty },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stdout = '';
  let stderr = '';
  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');
  child.stdout.on('data', (chunk) => {
    stdout += chunk;
  });
  child.stderr.on('data', (chunk) => {
    stderr += chunk;
  });
  try {
    if (signal) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      if (child.exitCode === null) {
        child.kill('SIGTERM');
      }
    }
    const code = await waitClose(child, 20000);
    if (status !== undefined) {
      assert.equal(code, status, `${stdout}\n${stderr}`);
      assert.match(stderr, /a child exited before readiness/);
    } else {
      assert.equal(code === 0 || code === 1, true, `${stdout}\n${stderr}`);
    }
    assert.equal(stdout.includes('local-commercecore-stack: running'), false);
    for (const port of STACK_PORTS) {
      assert.equal(await portBusy(port), false, String(port));
    }
    assert.equal(pidAlive(bystander.child.pid), true);
  } finally {
    if (child.exitCode === null) {
      child.kill('SIGKILL');
    }
    await stopGroup(bystander);
    rmSync(empty, { recursive: true, force: true });
  }
}

async function assertDoubleSignal() {
  const bystander = spawnGroup(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], {
    stdio: 'ignore',
  });
  const child = spawn(process.execPath, [upScript], {
    cwd: root,
    env: { ...process.env, NX_DAEMON: 'false', NX_NO_CLOUD: 'true' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stdout = '';
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (chunk) => {
    stdout += chunk;
  });
  try {
    const started = await waitFor(
      child,
      () => stdout.includes('local-commercecore-stack: running'),
      30000,
    );
    assert.equal(started, true, stdout);
    child.kill('SIGINT');
    child.kill('SIGINT');
    const code = await waitClose(child, 15000);
    assert.equal(code, 0, stdout);
    assert.equal(stdout.includes('local-commercecore-stack: stopped'), true);
    await assertPortsReleased();
    assert.equal(pidAlive(bystander.child.pid), true);
  } finally {
    if (child.exitCode === null) {
      child.kill('SIGKILL');
    }
    await stopGroup(bystander);
  }
}

async function assertPortsReleased() {
  const deadline = Date.now() + 2000;
  let busy = null;
  do {
    busy = null;
    for (const port of STACK_PORTS) {
      if (await portBusy(port)) {
        busy = port;
        break;
      }
    }
    if (busy === null) {
      return;
    }
    await delay(50);
  } while (Date.now() < deadline);
  assert.equal(await portBusy(busy), false, String(busy));
}

function waitFor(child, ready, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const timer = setInterval(() => {
      if (ready()) {
        clearInterval(timer);
        resolve(true);
        return;
      }
      if (child.exitCode !== null || Date.now() > deadline) {
        clearInterval(timer);
        resolve(false);
      }
    }, 50);
    child.once('error', (error) => {
      clearInterval(timer);
      reject(error);
    });
  });
}

function waitClose(child, timeoutMs) {
  if (child.exitCode !== null) {
    return Promise.resolve(child.exitCode);
  }
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error('stack launcher timed out'));
    }, timeoutMs);
    child.once('exit', (code) => {
      clearTimeout(timer);
      resolve(code);
    });
  });
}
