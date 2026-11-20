/**
 * Owner-local smoke for the process-local synthetic catalog routes.
 * It binds 127.0.0.1 only. It does not print the rejected product id.
 */
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createServer } from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const apiEntry = path.join(root, 'dist/apps/commercecore-api/main.js');
const domainEntry = path.join(root, 'dist/libs/commercecore/catalog/domain/index.js');
const fixturePath = path.join(root, 'tools/local-catalog-synthetic-smoke/synthetic-input.json');
const lines = [];

class SmokeFailure extends Error {}

function fail(reason) {
  throw new SmokeFailure(reason);
}

function loadFixture() {
  const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'));
  if (
    fixture.boundary !== 'process-local' ||
    fixture.financial !== false ||
    fixture.provider !== 'none' ||
    fixture.persistence !== 'memory'
  ) {
    fail('fixture must stay a process-local nonfinancial memory smoke');
  }
  for (const key of [
    'productId',
    'otherProductId',
    'syntheticLabel',
    'updatedLabel',
    'rejectedProductId',
  ]) {
    if (typeof fixture[key] !== 'string' || fixture[key].length === 0) {
      fail('fixture is missing a required string');
    }
  }
  return fixture;
}

function freePort() {
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

async function request(port, method, pathname, body) {
  const response = await fetch(`http://127.0.0.1:${port}${pathname}`, {
    method,
    headers: body === undefined ? {} : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let parsed = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    fail('response was not json');
  }
  return { status: response.status, text, body: parsed };
}

async function main() {
  if (!existsSync(apiEntry) || !existsSync(domainEntry)) {
    fail('build missing; run the nx build commands before this smoke');
  }
  const fixture = loadFixture();
  const port = await freePort();
  const child = spawn(process.execPath, [apiEntry], {
    cwd: root,
    env: {
      PATH: process.env.PATH ?? '',
      COMMERCECORE_ENV: 'test',
      COMMERCECORE_HTTP_HOST: '127.0.0.1',
      COMMERCECORE_HTTP_PORT: String(port),
      COMMERCECORE_LOG_LEVEL: 'info',
      COMMERCECORE_SERVICE_VERSION: '0.0.0',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout?.setEncoding('utf8');
  child.stderr?.setEncoding('utf8');
  child.stdout?.on('data', (chunk) => {
    output += chunk;
  });
  child.stderr?.on('data', (chunk) => {
    output += chunk;
  });

  const deadline = Date.now() + 8000;
  try {
    let live = false;
    while (Date.now() < deadline) {
      if (child.exitCode !== null) {
        fail('server exited before liveness');
      }
      try {
        const response = await fetch(`http://127.0.0.1:${port}/health/live`);
        if (response.status === 200) {
          live = true;
          break;
        }
      } catch {
        // The listener is not open yet.
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    if (!live) {
      fail('timed out waiting for liveness');
    }

    lines.push(
      'local-catalog-synthetic-smoke: boundary=process-local financial=false provider=none persistence=memory',
    );
    const created = await request(port, 'POST', '/catalog/synthetic-entries', {
      productId: fixture.productId,
      syntheticLabel: fixture.syntheticLabel,
    });
    if (
      created.status !== 201 ||
      created.body?.productId !== fixture.productId ||
      created.body?.revision !== 1
    ) {
      fail('create did not return the fixture entry at revision 1');
    }
    lines.push(`create: http=201 productId=${fixture.productId} revision=1`);

    const list = await request(port, 'GET', '/catalog/synthetic-entries');
    const first = Array.isArray(list.body?.entries) ? list.body.entries[0]?.productId : undefined;
    if (list.status !== 200 || list.body?.entries?.length !== 1 || first !== fixture.productId) {
      fail('list did not return the one created entry');
    }
    lines.push(`list: http=200 count=1 first=${fixture.productId}`);

    const got = await request(port, 'GET', `/catalog/synthetic-entries/${fixture.productId}`);
    if (got.status !== 200 || got.body?.revision !== 1) {
      fail('get did not return revision 1');
    }
    lines.push('get: http=200 revision=1');

    const updated = await request(
      port,
      'PATCH',
      `/catalog/synthetic-entries/${fixture.productId}`,
      {
        syntheticLabel: fixture.updatedLabel,
        expectedRevision: 1,
      },
    );
    if (updated.status !== 200 || updated.body?.revision !== 2) {
      fail('update did not return revision 2');
    }
    lines.push('update: http=200 revision=2');

    const missing = await request(
      port,
      'GET',
      `/catalog/synthetic-entries/${fixture.otherProductId}`,
    );
    if (missing.status !== 404 || missing.body?.code !== 'NOT_FOUND') {
      fail('missing id was not NOT_FOUND');
    }
    lines.push('missing: http=404 code=NOT_FOUND');

    const invalid = await request(
      port,
      'GET',
      `/catalog/synthetic-entries/${fixture.rejectedProductId}`,
    );
    const echoed =
      invalid.text.includes(fixture.rejectedProductId) ||
      output.includes(fixture.rejectedProductId);
    if (
      invalid.status !== 400 ||
      invalid.body?.code !== 'PRODUCT_ID_INVALID' ||
      invalid.body?.reason !== 'format' ||
      echoed
    ) {
      fail('invalid id was not rejected without an echo');
    }
    lines.push('invalid: http=400 code=PRODUCT_ID_INVALID reason=format echoed=false');
    lines.push('local-catalog-synthetic-smoke: pass');
    process.stdout.write(`${lines.join('\n')}\n`);
  } finally {
    if (child.exitCode === null) {
      child.kill('SIGTERM');
      await new Promise((resolve) => {
        const timer = setTimeout(() => {
          child.kill('SIGKILL');
          resolve();
        }, 2000);
        child.once('exit', () => {
          clearTimeout(timer);
          resolve();
        });
      });
    }
  }
}

main().catch((error) => {
  const reason = error instanceof SmokeFailure ? error.message : 'unexpected';
  lines.push('local-catalog-synthetic-smoke: fail');
  process.stdout.write(`${lines.join('\n')}\n`);
  process.stderr.write(`local-catalog-synthetic-smoke: ${reason}\n`);
  process.exit(1);
});
