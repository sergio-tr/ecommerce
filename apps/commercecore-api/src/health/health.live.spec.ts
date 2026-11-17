import assert from 'node:assert/strict';
import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { createServer } from 'node:net';
import path from 'node:path';
import { test } from 'node:test';

const mainJs = path.join(process.cwd(), 'dist/apps/commercecore-api/main.js');

test('GET /health/live returns HTTP 200 with a nonsecret liveness payload', async () => {
  const port = await freePort();
  const child = spawn(process.execPath, [mainJs], {
    env: {
      PATH: process.env.PATH ?? '',
      COMMERCECORE_ENV: 'test',
      COMMERCECORE_HTTP_PORT: String(port),
      COMMERCECORE_SERVICE_VERSION: '0.0.0',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stdout = '';
  let stderr = '';
  const childStdout = child.stdout;
  const childStderr = child.stderr;
  if (childStdout === null || childStderr === null) {
    throw new Error('expected piped stdout and stderr');
  }
  childStdout.setEncoding('utf8');
  childStderr.setEncoding('utf8');
  childStdout.on('data', (chunk: string) => {
    stdout += chunk;
  });
  childStderr.on('data', (chunk: string) => {
    stderr += chunk;
  });

  try {
    await waitForLive(
      child,
      port,
      () => stdout,
      () => stderr,
    );
    const response = await fetch(`http://127.0.0.1:${port}/health/live`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type')?.includes('application/json'), true);
    assert.deepEqual(await response.json(), {
      status: 'live',
      service: 'commercecore-api',
      version: '0.0.0',
      probe: 'liveness',
      dependenciesChecked: false,
    });
    assert.equal(/sk_|mongodb:\/\//i.test(stdout + stderr), false);
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
  assert.match(result.stderr, /"field":"COMMERCECORE_ENV"/);
  assert.match(result.stderr, /"reason":"missing"/);
  assert.equal(/sk_|password|mongodb:\/\//i.test(result.stderr), false);
  assert.equal(result.stdout.includes('http.listening'), false);
});

test('a secret-like environment value is rejected without disclosure', () => {
  const secret = ['sk', 'live', '51HIDDEN'].join('_');
  const result = spawnSync(process.execPath, [mainJs], {
    env: {
      PATH: process.env.PATH ?? '',
      COMMERCECORE_ENV: 'test',
      COMMERCECORE_HTTP_PORT: secret,
    },
    encoding: 'utf8',
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /"field":"COMMERCECORE_HTTP_PORT"/);
  assert.match(result.stderr, /"reason":"forbidden"/);
  assert.equal(result.stderr.includes(secret), false);
  assert.equal(result.stderr.includes('51HIDDEN'), false);
});

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
        resolve(port);
      });
    });
  });
}

async function waitForLive(
  child: ChildProcess,
  port: number,
  stdout: () => string,
  stderr: () => string,
): Promise<void> {
  const deadline = Date.now() + 8000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`server exited ${child.exitCode}\n${stdout()}\n${stderr()}`);
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
  throw new Error(`timed out waiting for liveness\n${stdout()}\n${stderr()}`);
}

async function stop(child: ChildProcess): Promise<void> {
  if (child.exitCode !== null) {
    return;
  }
  child.kill('SIGTERM');
  await new Promise<void>((resolve) => {
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
    }, 2000);
    child.once('exit', () => {
      clearTimeout(timer);
      resolve();
    });
  });
}
