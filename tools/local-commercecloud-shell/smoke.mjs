/**
 * Local loopback smoke for the CommerceCloud liveness shell.
 * Starts CommerceCore and CommerceCloud as separate processes, checks that
 * each stays live when the other stops, and rejects a pod-network bind.
 * It does not deploy Kubernetes, claim high availability, or open an admin route.
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  freePort,
  portBusy,
  spawnGroup,
  startApi,
  stopGroup,
} from '../local-egame-fullstack/children.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const cloudEntry = path.join(root, 'dist/apps/commercecloud-api/main.js');
const HIDDEN_HEADER = 'header-value-not-authoritative';
const COMMERCIAL_KEYS = [
  'currency',
  'license',
  'money',
  'offer',
  'price',
  'sku',
  'stock',
  'stripe',
  'tenant',
  'tenantId',
];

class SmokeFailure extends Error {}

function fail(reason) {
  throw new SmokeFailure(reason);
}

export function startCloud(port, environment = 'test') {
  return spawnGroup(process.execPath, [cloudEntry], {
    cwd: root,
    env: cloudEnv(port, environment),
  });
}

export function cloudEnv(port, environment = 'test') {
  return {
    PATH: process.env.PATH ?? '',
    COMMERCECLOUD_ENV: environment,
    COMMERCECLOUD_HTTP_HOST: '127.0.0.1',
    COMMERCECLOUD_HTTP_PORT: String(port),
    COMMERCECLOUD_LOG_LEVEL: 'info',
    COMMERCECLOUD_SERVICE_VERSION: '0.0.0',
  };
}

export async function runSmoke() {
  const lines = [];
  const owned = [];
  let corePort = 0;
  let cloudPort = 0;
  try {
    ensureBuilt();
    corePort = await usablePort();
    cloudPort = await usablePort(corePort);
    const core = startApi(root, corePort);
    owned.push(core);
    const cloud = startCloud(cloudPort);
    owned.push(cloud);

    await waitLive(core, corePort, 'commercecore-api');
    await waitLive(cloud, cloudPort, 'commercecloud-api');
    const coreBody = await readLive(corePort);
    const cloudBody = await readLive(cloudPort);
    assertLive(coreBody, 'commercecore-api');
    assertLive(cloudBody, 'commercecloud-api');
    assertNoCommercialFields(coreBody);
    assertNoCommercialFields(cloudBody);
    if (!cloud.output().includes('"host":"127.0.0.1"')) {
      fail('cloud listener did not record loopback');
    }
    lines.push(
      `commercecloud-shell: core-live service=commercecore-api host=127.0.0.1 port=${corePort}`,
    );
    lines.push(
      `commercecloud-shell: cloud-live service=commercecloud-api host=127.0.0.1 port=${cloudPort}`,
    );

    await assertClosedSurface(cloudPort);
    lines.push('commercecloud-shell: admin-absent status=404');
    lines.push('commercecloud-shell: ready-absent status=404');
    lines.push('commercecloud-shell: tenant-header-ignored');

    await stopGroup(cloud);
    await assertPortFree(cloudPort);
    assertLive(await readLive(corePort), 'commercecore-api');
    lines.push('commercecloud-shell: core-isolated-after-cloud-stop');

    const cloudAgain = startCloud(cloudPort);
    owned.push(cloudAgain);
    await waitLive(cloudAgain, cloudPort, 'commercecloud-api');
    await stopGroup(core);
    await assertPortFree(corePort);
    assertLive(await readLive(cloudPort), 'commercecloud-api');
    lines.push('commercecloud-shell: cloud-isolated-after-core-stop');
    await stopGroup(cloudAgain);
    if (cloudAgain.child.exitCode !== 0) {
      fail(`cloud shutdown exit=${cloudAgain.child.exitCode ?? 'null'}`);
    }

    assertRejectedConfig(
      { COMMERCECLOUD_HTTP_HOST: ['0', '0', '0', '0'].join('.'), COMMERCECLOUD_HTTP_PORT: '3100' },
      'COMMERCECLOUD_HTTP_HOST',
      'invalid',
      ['0', '0', '0', '0'].join('.'),
    );
    lines.push('commercecloud-shell: pod-host-rejected');
    for (const port of ['3000', '4200']) {
      assertRejectedConfig(
        { COMMERCECLOUD_HTTP_PORT: port },
        'COMMERCECLOUD_HTTP_PORT',
        'invalid',
        port,
      );
    }
    lines.push('commercecloud-shell: reserved-port-rejected');
    assertRejectedConfig(
      { COMMERCECLOUD_HTTP_PORT: '3100', COMMERCECLOUD_TENANT_ID: 'tenant-not-a-permission' },
      'COMMERCECLOUD_TENANT_ID',
      'unsupported',
      'tenant-not-a-permission',
    );
    lines.push('commercecloud-shell: tenant-key-rejected');

    await assertPortFree(corePort);
    await assertPortFree(cloudPort);
    lines.push('commercecloud-shell: children-stopped');
    lines.push('commercecloud-shell: PASS');
    lines.push('g5: NOT_CLAIMED');
    return { lines, corePort, cloudPort };
  } finally {
    for (const record of owned) {
      await stopGroup(record);
    }
  }
}

function ensureBuilt() {
  const result = spawnSync(
    'pnpm',
    [
      'exec',
      'nx',
      'run-many',
      '-t',
      'build',
      '-p',
      'commercecore-api,commercecloud-api',
      '--output-style=static',
    ],
    {
      cwd: root,
      encoding: 'utf8',
      env: { ...process.env, NX_DAEMON: 'false', NX_NO_CLOUD: 'true' },
    },
  );
  if (result.status !== 0) {
    process.stderr.write(result.stdout ?? '');
    process.stderr.write(result.stderr ?? '');
    fail('build failed before the shell smoke');
  }
}

async function usablePort(avoid = 0) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const port = await freePort();
    if (port !== 3000 && port !== 4200 && port !== avoid) {
      return port;
    }
  }
  fail('could not allocate a free loopback port');
  return 0;
}

async function waitLive(record, port, service) {
  const deadline = Date.now() + 8000;
  while (Date.now() < deadline) {
    if (record.child.exitCode !== null) {
      fail(`${service} exited ${record.child.exitCode} before liveness`);
    }
    try {
      const body = await readLive(port);
      if (body.service === service && body.status === 'live') {
        return;
      }
    } catch {
      // The listener is not open yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  fail(`${service} liveness timed out`);
}

async function readLive(port) {
  const response = await fetch(`http://127.0.0.1:${port}/health/live`, {
    headers: { accept: 'application/json' },
  });
  if (response.status !== 200) {
    fail(`liveness http=${response.status}`);
  }
  return response.json();
}

function assertLive(body, service) {
  if (
    body?.status !== 'live' ||
    body?.service !== service ||
    body?.probe !== 'liveness' ||
    body?.dependenciesChecked !== false ||
    body?.version !== '0.0.0'
  ) {
    fail(`unexpected liveness payload for ${service}`);
  }
}

function assertNoCommercialFields(body) {
  const serialized = JSON.stringify(body);
  for (const key of COMMERCIAL_KEYS) {
    if (Object.prototype.hasOwnProperty.call(body, key) || serialized.includes(`"${key}"`)) {
      fail('liveness payload included a commercial field');
    }
  }
}

async function assertClosedSurface(port) {
  for (const [method, pathname] of [
    ['GET', '/admin'],
    ['POST', '/stores'],
    ['GET', '/health/ready'],
  ]) {
    const response = await fetch(`http://127.0.0.1:${port}${pathname}`, {
      method,
      headers: { accept: 'application/json', 'x-tenant-id': HIDDEN_HEADER },
    });
    if (response.status !== 404) {
      fail(`${method} ${pathname} http=${response.status}`);
    }
    const text = await response.text();
    if (text.includes(HIDDEN_HEADER)) {
      fail('closed route echoed the tenant header');
    }
  }
  const live = await fetch(`http://127.0.0.1:${port}/health/live`, {
    headers: { accept: 'application/json', 'x-tenant-id': HIDDEN_HEADER },
  });
  const text = await live.text();
  if (live.status !== 200 || text.includes(HIDDEN_HEADER)) {
    fail('liveness echoed the tenant header');
  }
}

function assertRejectedConfig(extra, field, reason, hidden) {
  const result = spawnSync(process.execPath, [cloudEntry], {
    cwd: root,
    encoding: 'utf8',
    env: {
      PATH: process.env.PATH ?? '',
      COMMERCECLOUD_ENV: 'test',
      ...extra,
    },
  });
  const output = `${result.stdout}\n${result.stderr}`;
  if (result.status !== 1) {
    fail(`expected config rejection exit 1 for ${field}, got ${result.status}`);
  }
  if (!output.includes(`"field":"${field}"`) || !output.includes(`"reason":"${reason}"`)) {
    fail(`config rejection for ${field} did not name the field and reason`);
  }
  if (output.includes(hidden) || output.includes('http.listening')) {
    fail(`config rejection for ${field} listened or echoed the value`);
  }
}

async function assertPortFree(port) {
  const deadline = Date.now() + 2000;
  while (Date.now() < deadline) {
    if (!(await portBusy(port))) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  fail(`port ${port} stayed bound`);
}

async function main() {
  try {
    const result = await runSmoke();
    for (const line of result.lines) {
      process.stdout.write(`${line}\n`);
    }
  } catch (error) {
    const reason = error instanceof SmokeFailure ? error.message : 'smoke failed';
    process.stderr.write(`commercecloud-shell: FAIL reason=${reason}\n`);
    process.exitCode = 1;
  }
}

const entry = process.argv[1] ? pathToFileURL(process.argv[1]).href : '';
if (import.meta.url === entry) {
  await main();
}
