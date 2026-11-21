import assert from 'node:assert/strict';
import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { createServer } from 'node:net';
import path from 'node:path';
import { test } from 'node:test';

const mainJs = path.join(process.cwd(), 'dist/apps/commercecloud-api/main.js');
const hiddenHeader = 'header-value-not-authoritative';

test('GET /health/live returns HTTP 200 with a nonsecret liveness payload', async () => {
  const port = await freePort();
  const child = start(port);
  try {
    await waitForLive(child, port);
    const response = await fetch(`http://127.0.0.1:${port}/health/live`, {
      headers: { 'x-tenant-id': hiddenHeader, accept: 'application/json' },
    });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type')?.includes('application/json'), true);
    const body: unknown = await response.json();
    assert.deepEqual(body, {
      status: 'live',
      service: 'commercecloud-api',
      version: '0.0.0',
      probe: 'liveness',
      dependenciesChecked: false,
    });
    assert.equal(JSON.stringify(body).includes(hiddenHeader), false);
  } finally {
    await stop(child);
  }
});

test('unknown management routes stay absent and do not echo a tenant header', async () => {
  const port = await freePort();
  const child = start(port);
  try {
    await waitForLive(child, port);
    for (const [method, pathname] of [
      ['GET', '/admin'],
      ['POST', '/stores'],
      ['GET', '/health/ready'],
      ['GET', '/'],
    ] as const) {
      const response = await fetch(`http://127.0.0.1:${port}${pathname}`, {
        method,
        headers: { 'x-tenant-id': hiddenHeader, accept: 'application/json' },
      });
      assert.equal(response.status, 404);
      const text = await response.text();
      assert.equal(text.includes(hiddenHeader), false);
    }
  } finally {
    await stop(child);
  }
});

test('SIGTERM closes only this process', async () => {
  const port = await freePort();
  const child = start(port);
  try {
    await waitForLive(child, port);
    const exited = waitExit(child);
    child.kill('SIGTERM');
    const code = await exited;
    assert.equal(code, 0);
    await assert.rejects(fetch(`http://127.0.0.1:${port}/health/live`));
  } finally {
    await stop(child);
  }
});

test('missing public configuration fails before listen and does not print credentials', () => {
  const result = spawnSync(process.execPath, [mainJs], {
    env: { PATH: process.env.PATH ?? '' },
    encoding: 'utf8',
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /"field":"COMMERCECLOUD_ENV"/);
  assert.match(result.stderr, /"reason":"missing"/);
  assert.equal(/sk_|password|mongodb:\/\//i.test(result.stderr), false);
  assert.equal(result.stdout.includes('http.listening'), false);
});

test('a pod-network host and the reserved local ports exit before serving probes', () => {
  const host = ['0', '0', '0', '0'].join('.');
  const pod = spawnSync(process.execPath, [mainJs], {
    env: {
      PATH: process.env.PATH ?? '',
      COMMERCECLOUD_ENV: 'test',
      COMMERCECLOUD_HTTP_HOST: host,
      COMMERCECLOUD_HTTP_PORT: '3100',
    },
    encoding: 'utf8',
  });
  assert.equal(pod.status, 1);
  assert.match(pod.stderr, /"field":"COMMERCECLOUD_HTTP_HOST"/);
  assert.match(pod.stderr, /"reason":"invalid"/);
  assert.equal(pod.stderr.includes(host), false);
  assert.equal(pod.stdout.includes('http.listening'), false);

  for (const port of ['3000', '4200']) {
    const reserved = spawnSync(process.execPath, [mainJs], {
      env: {
        PATH: process.env.PATH ?? '',
        COMMERCECLOUD_ENV: 'test',
        COMMERCECLOUD_HTTP_PORT: port,
      },
      encoding: 'utf8',
    });
    assert.equal(reserved.status, 1);
    assert.match(reserved.stderr, /"field":"COMMERCECLOUD_HTTP_PORT"/);
    assert.match(reserved.stderr, /"reason":"invalid"/);
    assert.equal(reserved.stderr.includes(port), false);
    assert.equal(reserved.stdout.includes('http.listening'), false);
  }
});

test('an unsupported tenant key is rejected without disclosure', () => {
  const tenantValue = 'tenant-not-a-permission';
  const result = spawnSync(process.execPath, [mainJs], {
    env: {
      PATH: process.env.PATH ?? '',
      COMMERCECLOUD_ENV: 'test',
      COMMERCECLOUD_HTTP_PORT: '3100',
      COMMERCECLOUD_TENANT_ID: tenantValue,
    },
    encoding: 'utf8',
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /"field":"COMMERCECLOUD_TENANT_ID"/);
  assert.match(result.stderr, /"reason":"unsupported"/);
  assert.equal(result.stderr.includes(tenantValue), false);
  assert.equal(result.stdout.includes('http.listening'), false);
});

function start(port: number): ChildProcess {
  return spawn(process.execPath, [mainJs], {
    env: {
      PATH: process.env.PATH ?? '',
      COMMERCECLOUD_ENV: 'test',
      COMMERCECLOUD_HTTP_HOST: '127.0.0.1',
      COMMERCECLOUD_HTTP_PORT: String(port),
      COMMERCECLOUD_SERVICE_VERSION: '0.0.0',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (address === null || typeof address === 'string') {
        reject(new Error('Could not allocate a loopback port'));
        return;
      }
      const { port } = address;
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        if (port === 3000 || port === 4200) {
          resolve(freePort());
          return;
        }
        resolve(port);
      });
    });
  });
}

async function waitForLive(child: ChildProcess, port: number): Promise<void> {
  const deadline = Date.now() + 8000;
  let stdout = '';
  let stderr = '';
  child.stdout?.setEncoding('utf8');
  child.stderr?.setEncoding('utf8');
  child.stdout?.on('data', (chunk: string) => {
    stdout += chunk;
  });
  child.stderr?.on('data', (chunk: string) => {
    stderr += chunk;
  });
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`server exited ${child.exitCode}\n${stdout}\n${stderr}`);
    }
    try {
      const response = await fetch(`http://127.0.0.1:${port}/health/live`);
      if (response.status === 200) {
        return;
      }
    } catch {
      // The listener is not open yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`timed out waiting for liveness\n${stdout}\n${stderr}`);
}

function waitExit(child: ChildProcess): Promise<number | null> {
  if (child.exitCode !== null) {
    return Promise.resolve(child.exitCode);
  }
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(child.exitCode), 2000);
    child.once('exit', (code) => {
      clearTimeout(timer);
      resolve(code);
    });
  });
}

async function stop(child: ChildProcess): Promise<void> {
  if (child.exitCode !== null) {
    return;
  }
  child.kill('SIGTERM');
  await waitExit(child);
  if (child.exitCode === null) {
    child.kill('SIGKILL');
    await waitExit(child);
  }
}
