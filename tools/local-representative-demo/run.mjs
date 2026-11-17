/**
 * Sandbox runner for behaviors already accepted by M01-BOOTSTRAP-01.
 * It checks the pedagogical ProductId and GET /health/live.
 * It is not a catalog, checkout, payment, inventory, or provider API.
 */
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createServer } from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const require = createRequire(import.meta.url);
const domainEntry = path.join(root, 'dist/libs/commercecore/catalog/domain/index.js');
const apiEntry = path.join(root, 'dist/apps/commercecore-api/main.js');
const fixturePath = path.join(root, 'tools/local-representative-demo/synthetic-input.json');

const lines = [];

function fail(reason) {
  lines.push('local-representative-demo: fail');
  process.stdout.write(`${lines.join('\n')}\n`);
  process.stderr.write(`local-representative-demo: ${reason}\n`);
  process.exit(1);
}

function loadFixture() {
  const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'));
  if (fixture.boundary !== 'sandbox' || fixture.financial !== false) {
    fail('fixture must stay a nonfinancial sandbox');
  }
  if (!Array.isArray(fixture.cases) || fixture.cases.length !== 2) {
    fail('fixture must contain the two synthetic cases');
  }
  return fixture;
}

function evaluateDomain(fixture) {
  if (!existsSync(domainEntry) || !existsSync(apiEntry)) {
    fail('build missing; run the nx build commands in LOCAL_REPRESENTATIVE_DEMO.md');
  }
  const { InvalidProductIdError, ProductId } = require(domainEntry);
  let ok = true;
  for (const item of fixture.cases) {
    if (item.expect !== 'accepted' && item.expect !== 'rejected') {
      ok = false;
      lines.push(`domain: case=${item.name} result=invalid-fixture`);
      continue;
    }
    try {
      const created = ProductId.create(item.input);
      const again = ProductId.create(item.input);
      const accepted =
        item.expect === 'accepted' &&
        created.value === item.input &&
        Object.isFrozen(created) &&
        created.equals(again);
      if (!accepted) {
        ok = false;
        lines.push(`domain: case=${item.name} result=unexpected-accept`);
        continue;
      }
      lines.push(
        `domain: case=${item.name} result=accepted value=${created.value} frozen=true equalToSynthetic=true`,
      );
    } catch (error) {
      const echoed =
        typeof item.input === 'string' &&
        error instanceof Error &&
        item.input.length > 0 &&
        error.message.includes(item.input);
      const rejected =
        item.expect === 'rejected' &&
        error instanceof InvalidProductIdError &&
        error.code === 'PRODUCT_ID_INVALID' &&
        error.reason === 'format' &&
        !echoed;
      if (!rejected) {
        ok = false;
      }
      const code = error instanceof InvalidProductIdError ? error.code : 'unexpected';
      const reason = error instanceof InvalidProductIdError ? error.reason : 'unexpected';
      lines.push(
        `domain: case=${item.name} result=rejected code=${code} reason=${reason} echoed=${echoed}`,
      );
    }
  }
  return ok;
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

async function probeHealth() {
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
  let stdout = '';
  let stderr = '';
  child.stdout?.setEncoding('utf8');
  child.stderr?.setEncoding('utf8');
  child.stdout?.on('data', (chunk) => {
    stdout += chunk;
  });
  child.stderr?.on('data', (chunk) => {
    stderr += chunk;
  });

  const deadline = Date.now() + 8000;
  let status = 0;
  let body = null;
  try {
    while (Date.now() < deadline) {
      if (child.exitCode !== null) {
        throw new Error(`server exited ${child.exitCode}`);
      }
      try {
        const response = await fetch(`http://127.0.0.1:${port}/health/live`);
        status = response.status;
        body = await response.json();
        if (status === 200) {
          break;
        }
      } catch {
        // The listener is not open yet.
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  } finally {
    if (child.exitCode === null) {
      child.kill('SIGTERM');
      await new Promise((resolve) => {
        const timer = setTimeout(() => {
          child.kill('SIGKILL');
        }, 2000);
        child.once('exit', () => {
          clearTimeout(timer);
          resolve(undefined);
        });
      });
    }
  }

  if (status !== 200 || body === null) {
    fail(`health probe did not return HTTP 200\n${stdout}\n${stderr}`);
  }
  const expected = {
    status: 'live',
    service: 'commercecore-api',
    version: '0.0.0',
    probe: 'liveness',
    dependenciesChecked: false,
  };
  const same =
    body.status === expected.status &&
    body.service === expected.service &&
    body.version === expected.version &&
    body.probe === expected.probe &&
    body.dependenciesChecked === expected.dependenciesChecked;
  if (!same || /sk_|mongodb:\/\//i.test(stdout + stderr)) {
    fail('health payload or server logs did not match the liveness contract');
  }
  lines.push(
    'api: GET /health/live http=200 status=live service=commercecore-api version=0.0.0 probe=liveness dependenciesChecked=false host=127.0.0.1',
  );
  return true;
}

try {
  const fixture = loadFixture();
  lines.push('local-representative-demo: boundary=sandbox financial=false provider=none');
  const domainOk = evaluateDomain(fixture);
  if (!domainOk) {
    fail('domain validation did not match the synthetic cases');
  }
  await probeHealth();
  lines.push('local-representative-demo: pass');
  process.stdout.write(`${lines.join('\n')}\n`);
} catch (error) {
  const reason = error instanceof Error ? error.name : 'UnknownError';
  fail(reason);
}
