import assert from 'node:assert/strict';
import { spawn, type ChildProcess } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:net';
import path from 'node:path';
import { test } from 'node:test';

const mainJs = path.join(process.cwd(), 'dist/apps/commercecore-api/main.js');
const FIRST = 'prd_01ARZ3NDEKTSV4RRFFQ69G5FAV';
const SECOND = 'prd_01ARZ3NDEKTSV4RRFFQ69G5FAW';
const COMMERCIAL = ['price', 'sku', 'stock', 'currency', 'stripe', 'offer', 'quote', 'license'];

test('HTTP create, list, get, and update stay inside the synthetic entry', async () => {
  const server = await start();
  try {
    const created = await send(server, 'POST', '/catalog/synthetic-entries', {
      productId: FIRST,
      syntheticLabel: 'synthetic-entry-a',
    });
    assert.equal(created.status, 201);
    assert.deepEqual(created.body, {
      productId: FIRST,
      syntheticLabel: 'synthetic-entry-a',
      revision: 1,
    });

    const second = await send(server, 'POST', '/catalog/synthetic-entries', {
      productId: SECOND,
      syntheticLabel: 'synthetic-entry-b',
    });
    assert.equal(second.status, 201);

    const list = await send(server, 'GET', '/catalog/synthetic-entries');
    assert.equal(list.status, 200);
    assert.deepEqual(list.body, {
      entries: [
        { productId: FIRST, syntheticLabel: 'synthetic-entry-a', revision: 1 },
        { productId: SECOND, syntheticLabel: 'synthetic-entry-b', revision: 1 },
      ],
    });

    const got = await send(server, 'GET', `/catalog/synthetic-entries/${FIRST}`);
    assert.equal(got.status, 200);
    assert.deepEqual(got.body, {
      productId: FIRST,
      syntheticLabel: 'synthetic-entry-a',
      revision: 1,
    });

    const updated = await send(server, 'PATCH', `/catalog/synthetic-entries/${FIRST}`, {
      syntheticLabel: 'synthetic-entry-b',
      expectedRevision: 1,
    });
    assert.equal(updated.status, 200);
    assert.deepEqual(updated.body, {
      productId: FIRST,
      syntheticLabel: 'synthetic-entry-b',
      revision: 2,
    });
    assertCommercialFree([created.body, second.body, list.body, got.body, updated.body]);
  } finally {
    await stop(server.child);
  }
});

test('HTTP negatives reject invalid input, unknown ids, stale revisions, and extra fields', async () => {
  const server = await start();
  const fixture = loadFixture();
  try {
    const created = await send(server, 'POST', '/catalog/synthetic-entries', {
      productId: FIRST,
      syntheticLabel: 'synthetic-entry-a',
    });
    assert.equal(created.status, 201);

    const invalidId = await send(
      server,
      'GET',
      `/catalog/synthetic-entries/${fixture.rejectedProductId}`,
    );
    assert.equal(invalidId.status, 400);
    assert.deepEqual(invalidId.body, { code: 'PRODUCT_ID_INVALID', reason: 'format' });
    assert.equal(JSON.stringify(invalidId.body).includes(fixture.rejectedProductId), false);
    assert.equal(server.output().includes(fixture.rejectedProductId), false);

    const invalidLabel = await send(server, 'POST', '/catalog/synthetic-entries', {
      productId: SECOND,
      syntheticLabel: 'NOT-A-LABEL',
    });
    assert.equal(invalidLabel.status, 400);
    assert.deepEqual(invalidLabel.body, { code: 'LABEL_INVALID', reason: 'format' });
    assert.equal(JSON.stringify(invalidLabel.body).includes('NOT-A-LABEL'), false);

    const missing = await send(server, 'GET', `/catalog/synthetic-entries/${SECOND}`);
    assert.equal(missing.status, 404);
    assert.deepEqual(missing.body, { code: 'NOT_FOUND', reason: 'missing' });
    assert.equal(JSON.stringify(missing.body).includes(SECOND), false);

    const stale = await send(server, 'PATCH', `/catalog/synthetic-entries/${FIRST}`, {
      syntheticLabel: 'synthetic-entry-b',
      expectedRevision: 9,
    });
    assert.equal(stale.status, 409);
    assert.deepEqual(stale.body, { code: 'REVISION_CONFLICT', reason: 'mismatch' });
    const current = await send(server, 'GET', `/catalog/synthetic-entries/${FIRST}`);
    assert.deepEqual(current.body, {
      productId: FIRST,
      syntheticLabel: 'synthetic-entry-a',
      revision: 1,
    });

    const extra = await send(server, 'POST', '/catalog/synthetic-entries', {
      productId: SECOND,
      syntheticLabel: 'synthetic-entry-a',
      price: 'hidden',
    });
    assert.equal(extra.status, 400);
    assert.deepEqual(extra.body, { code: 'BODY_INVALID', reason: 'shape' });
    assert.equal(JSON.stringify(extra.body).includes('price'), false);
    assert.equal(JSON.stringify(extra.body).includes('hidden'), false);
    assertCommercialFree([invalidId.body, invalidLabel.body, missing.body, stale.body, extra.body]);
  } finally {
    await stop(server.child);
  }
});

test('HTTP capacity and a restarted process both keep the map process-local', async () => {
  const server = await start();
  try {
    for (let index = 0; index < 8; index += 1) {
      const created = await send(server, 'POST', '/catalog/synthetic-entries', {
        productId: productId(index),
        syntheticLabel: 'synthetic-entry-a',
      });
      assert.equal(created.status, 201);
    }
    const overflow = await send(server, 'POST', '/catalog/synthetic-entries', {
      productId: productId(8),
      syntheticLabel: 'synthetic-entry-b',
    });
    assert.equal(overflow.status, 409);
    assert.deepEqual(overflow.body, { code: 'CAPACITY_EXCEEDED', reason: 'limit' });
    const duplicate = await send(server, 'POST', '/catalog/synthetic-entries', {
      productId: productId(0),
      syntheticLabel: 'synthetic-entry-a',
    });
    assert.equal(duplicate.status, 409);
    assert.deepEqual(duplicate.body, { code: 'DUPLICATE_PRODUCT_ID', reason: 'exists' });
  } finally {
    await stop(server.child);
  }

  const restarted = await start();
  try {
    const list = await send(restarted, 'GET', '/catalog/synthetic-entries');
    assert.equal(list.status, 200);
    assert.deepEqual(list.body, { entries: [] });
  } finally {
    await stop(restarted.child);
  }
});

interface RunningServer {
  readonly child: ChildProcess;
  readonly port: number;
  output(): string;
}

async function start(): Promise<RunningServer> {
  const port = await freePort();
  const child = spawn(process.execPath, [mainJs], {
    env: {
      PATH: process.env.PATH ?? '',
      COMMERCECORE_ENV: 'test',
      COMMERCECORE_HTTP_HOST: '127.0.0.1',
      COMMERCECORE_HTTP_PORT: String(port),
      COMMERCECORE_SERVICE_VERSION: '0.0.0',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  const stdout = child.stdout;
  const stderr = child.stderr;
  if (stdout === null || stderr === null) {
    throw new Error('expected piped stdout and stderr');
  }
  stdout.setEncoding('utf8');
  stderr.setEncoding('utf8');
  stdout.on('data', (chunk: string) => {
    output += chunk;
  });
  stderr.on('data', (chunk: string) => {
    output += chunk;
  });
  await waitForLive(child, port, () => output);
  return { child, port, output: () => output };
}

async function send(
  server: RunningServer,
  method: string,
  pathname: string,
  body?: unknown,
): Promise<{ status: number; body: unknown }> {
  const init: RequestInit = { method };
  if (body !== undefined) {
    init.headers = { 'content-type': 'application/json' };
    init.body = JSON.stringify(body);
  }
  const response = await fetch(`http://127.0.0.1:${server.port}${pathname}`, init);
  assert.equal(response.headers.get('content-type')?.includes('application/json'), true);
  return { status: response.status, body: await response.json() };
}

function loadFixture(): { rejectedProductId: string } {
  const fixture = JSON.parse(
    readFileSync(
      path.join(process.cwd(), 'tools/local-catalog-synthetic-smoke/synthetic-input.json'),
      'utf8',
    ),
  ) as { rejectedProductId?: unknown };
  if (typeof fixture.rejectedProductId !== 'string') {
    throw new Error('synthetic fixture is missing the rejected id');
  }
  return { rejectedProductId: fixture.rejectedProductId };
}

function assertCommercialFree(bodies: unknown[]): void {
  const rendered = JSON.stringify(bodies).toLowerCase();
  for (const word of COMMERCIAL) {
    assert.equal(rendered.includes(word), false, word);
  }
}

function productId(index: number): string {
  const suffix = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'[index];
  if (suffix === undefined) {
    throw new Error('fixture index is outside the pedagogical alphabet');
  }
  return `prd_01ARZ3NDEKTSV4RRFFQ69G5FA${suffix}`;
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
        resolve(port);
      });
    });
  });
}

async function waitForLive(child: ChildProcess, port: number, output: () => string): Promise<void> {
  const deadline = Date.now() + 8000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`server exited ${child.exitCode}\n${output()}`);
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
  throw new Error(`timed out waiting for liveness\n${output()}`);
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
