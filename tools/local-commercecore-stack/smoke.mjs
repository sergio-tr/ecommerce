/**
 * Isolated loopback smoke for the three local apps.
 * Core and CommerceCloud listen on ephemeral ports, not 3000, 4200, or 3100.
 * Catalog GET, POST, and PATCH go through the same /catalog proxy prefix as
 * apps/egame-web/proxy.conf.json. Chrome is not launched.
 * This pass is not G5 and not AC-CAT-08. One API process is not multi-pod HA.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { freePort, portBusy, startApi, stopGroup } from '../local-egame-fullstack/children.mjs';
import { startCloud } from '../local-commercecloud-shell/smoke.mjs';
import {
  isCatalogPath,
  loadCatalogProxyRule,
  startCatalogProxy,
} from '../local-egame-fullstack/proxy.mjs';
import { CLOUD_PORT, STACK_PORTS } from './ports.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const apiEntry = path.join(root, 'dist/apps/commercecore-api/main.js');
const cloudEntry = path.join(root, 'dist/apps/commercecloud-api/main.js');
const fixturePath = path.join(root, 'tools/local-egame-fullstack/synthetic-input.json');
const HIDDEN_HEADER = 'header-value-not-authoritative';
const RESERVED = new Set(STACK_PORTS);

class SmokeFailure extends Error {}

function fail(reason) {
  throw new SmokeFailure(reason);
}

export async function runSmoke() {
  const lines = [];
  const owned = [];
  let proxy = null;
  let corePort = 0;
  let cloudPort = 0;
  try {
    if (!existsSync(apiEntry) || !existsSync(cloudEntry)) {
      fail('build missing; run the nx build before this smoke');
    }
    const fixture = loadFixture();
    const rule = loadCatalogProxyRule(root);
    if (!isCatalogPath('/catalog/synthetic-entries') || rule.target !== 'http://127.0.0.1:3000') {
      fail('catalog proxy rule changed');
    }
    lines.push(
      'local-commercecore-stack-smoke: boundary=process-local financial=false provider=none persistence=memory',
    );
    lines.push('local-commercecore-stack-smoke: two pods do not share entries');

    corePort = await isolatedPort();
    cloudPort = await isolatedPort(corePort);
    if ((await portBusy(corePort)) || (await portBusy(cloudPort))) {
      fail('isolated port was busy before start');
    }
    const core = startApi(root, corePort);
    owned.push(core);
    const cloud = startCloud(cloudPort);
    owned.push(cloud);
    await waitLive(core, corePort, 'commercecore-api');
    await waitLive(cloud, cloudPort, 'commercecloud-api');
    assertLive(await readLive(corePort), 'commercecore-api');
    assertLive(await readLive(cloudPort), 'commercecloud-api');
    lines.push(
      `local-commercecore-stack-smoke: core-live service=commercecore-api host=127.0.0.1 port=${corePort}`,
    );
    lines.push(
      `local-commercecore-stack-smoke: cloud-live service=commercecloud-api host=127.0.0.1 port=${cloudPort}`,
    );

    await assertClosedSurface(cloudPort);
    lines.push('local-commercecore-stack-smoke: admin-absent status=404');
    lines.push('local-commercecore-stack-smoke: stores-absent status=404');
    lines.push('local-commercecore-stack-smoke: ready-absent status=404');
    lines.push('local-commercecore-stack-smoke: tenant-header-ignored');

    proxy = await startCatalogProxy(corePort);
    await exerciseCatalog(proxy.port, core, fixture, lines);

    await stopGroup(cloud);
    await assertPortFree(cloudPort);
    const kept = await request(
      proxy.port,
      'GET',
      `/catalog/synthetic-entries/${fixture.productId}`,
    );
    if (
      kept.status !== 200 ||
      kept.body?.revision !== 2 ||
      kept.body?.syntheticLabel !== fixture.updatedLabel
    ) {
      fail('core catalog changed after cloud stopped');
    }
    lines.push('local-commercecore-stack-smoke: core-isolated-after-cloud-stop');

    const cloudAgain = startCloud(cloudPort);
    owned.push(cloudAgain);
    await waitLive(cloudAgain, cloudPort, 'commercecloud-api');
    await stopGroup(core);
    await assertPortFree(corePort);
    assertLive(await readLive(cloudPort), 'commercecloud-api');
    lines.push('local-commercecore-stack-smoke: cloud-isolated-after-core-stop');

    const closed = await request(proxy.port, 'GET', '/catalog/synthetic-entries');
    if (
      closed.status !== 502 ||
      closed.body?.code !== 'UPSTREAM_UNAVAILABLE' ||
      closed.text.includes(fixture.rejectedLabel) ||
      closed.text.includes(fixture.rejectedProductId) ||
      closed.text.includes(fixture.rejectedExtra)
    ) {
      fail('proxy did not fail closed after core stopped');
    }
    lines.push('local-commercecore-stack-smoke: proxy-closed-after-core-stop http=502');

    await stopGroup(cloudAgain);
    if (!cloudAgain.exited() || cloudAgain.child.exitCode !== 0) {
      fail('cloud shutdown did not exit 0');
    }
    await assertPortFree(cloudPort);
    for (const record of owned) {
      if (!record.exited()) {
        fail('a child was still running');
      }
    }
    lines.push('local-commercecore-stack-smoke: children-stopped');
    lines.push('browser-smoke: NOT_RUN reason=isolated-catalog-proxy');
    lines.push('g5: NOT_CLAIMED');
    lines.push('local-commercecore-stack-smoke: pass');
    return { lines, corePort, cloudPort };
  } finally {
    if (proxy) {
      await proxy.close();
    }
    for (const record of owned) {
      await stopGroup(record);
    }
  }
}

function loadFixture() {
  const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'));
  if (
    fixture.boundary !== 'process-local' ||
    fixture.financial !== false ||
    fixture.provider !== 'none' ||
    fixture.persistence !== 'memory' ||
    fixture.staleRevision !== 9
  ) {
    fail('fixture must stay a process-local nonfinancial memory smoke');
  }
  return fixture;
}

async function exerciseCatalog(port, core, fixture, lines) {
  const empty = await request(port, 'GET', '/catalog/synthetic-entries');
  if (empty.status !== 200 || empty.body?.entries?.length !== 0) {
    fail('empty list was not empty');
  }
  lines.push('local-commercecore-stack-smoke: list-empty http=200 count=0');

  const created = await request(port, 'POST', '/catalog/synthetic-entries', {
    productId: fixture.productId,
    syntheticLabel: fixture.syntheticLabel,
  });
  if (created.status !== 201 || created.body?.revision !== 1) {
    fail('create did not return revision 1');
  }
  lines.push('local-commercecore-stack-smoke: create http=201 revision=1');

  const updated = await request(port, 'PATCH', `/catalog/synthetic-entries/${fixture.productId}`, {
    syntheticLabel: fixture.updatedLabel,
    expectedRevision: 1,
  });
  if (updated.status !== 200 || updated.body?.revision !== 2) {
    fail('update did not return revision 2');
  }
  lines.push('local-commercecore-stack-smoke: update http=200 revision=2');

  const stale = await request(port, 'PATCH', `/catalog/synthetic-entries/${fixture.productId}`, {
    syntheticLabel: fixture.updatedLabel,
    expectedRevision: fixture.staleRevision,
  });
  const afterStale = await request(port, 'GET', `/catalog/synthetic-entries/${fixture.productId}`);
  if (
    stale.status !== 409 ||
    stale.body?.code !== 'REVISION_CONFLICT' ||
    afterStale.body?.revision !== 2
  ) {
    fail('stale revision changed the entry');
  }
  lines.push('local-commercecore-stack-smoke: stale http=409 unchanged=true');

  const duplicate = await request(port, 'POST', '/catalog/synthetic-entries', {
    productId: fixture.productId,
    syntheticLabel: fixture.syntheticLabel,
  });
  if (duplicate.status !== 409 || duplicate.body?.code !== 'DUPLICATE_PRODUCT_ID') {
    fail('duplicate create was not rejected');
  }
  lines.push('local-commercecore-stack-smoke: duplicate http=409');

  const invalidLabel = await request(port, 'POST', '/catalog/synthetic-entries', {
    productId: fixture.otherProductId,
    syntheticLabel: fixture.rejectedLabel,
  });
  if (
    invalidLabel.status !== 400 ||
    invalidLabel.body?.code !== 'LABEL_INVALID' ||
    invalidLabel.text.includes(fixture.rejectedLabel) ||
    core.output().includes(fixture.rejectedLabel)
  ) {
    fail('invalid label was echoed');
  }
  lines.push('local-commercecore-stack-smoke: invalid-label http=400 echoed=false');
}

async function isolatedPort(avoid = 0) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const port = await freePort();
    if (!RESERVED.has(port) && port !== avoid && port !== CLOUD_PORT && !(await portBusy(port))) {
      return port;
    }
  }
  fail('could not allocate a free loopback port');
  return 0;
}

async function waitLive(record, port, service) {
  const deadline = Date.now() + 8000;
  while (Date.now() < deadline) {
    if (record.exited()) {
      fail(`${service} exited before liveness`);
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
    signal: AbortSignal.timeout(1000),
  });
  if (response.status !== 200) {
    fail('liveness was not http 200');
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
  const serialized = JSON.stringify(body);
  for (const key of ['price', 'sku', 'stock', 'stripe', 'tenant', 'tenantId']) {
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
      signal: AbortSignal.timeout(1000),
    });
    const text = await response.text();
    if (response.status !== 404 || text.includes(HIDDEN_HEADER)) {
      fail('closed commercecloud route was not absent');
    }
  }
  const live = await fetch(`http://127.0.0.1:${port}/health/live`, {
    headers: { accept: 'application/json', 'x-tenant-id': HIDDEN_HEADER },
    signal: AbortSignal.timeout(1000),
  });
  const text = await live.text();
  if (live.status !== 200 || text.includes(HIDDEN_HEADER)) {
    fail('liveness echoed the tenant header');
  }
}

async function request(port, method, pathname, body) {
  const response = await fetch(`http://127.0.0.1:${port}${pathname}`, {
    method,
    headers:
      body === undefined
        ? { accept: 'application/json' }
        : { accept: 'application/json', 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(3000),
  });
  const text = await response.text();
  let parsed = null;
  try {
    parsed = text.length === 0 ? null : JSON.parse(text);
  } catch {
    fail('response was not json');
  }
  return { status: response.status, text, body: parsed };
}

async function assertPortFree(port) {
  const deadline = Date.now() + 2000;
  while (Date.now() < deadline) {
    if (!(await portBusy(port))) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  fail('a stack port stayed bound');
}

async function main() {
  try {
    const result = await runSmoke();
    for (const line of result.lines) {
      process.stdout.write(`${line}\n`);
    }
  } catch (error) {
    const reason = error instanceof SmokeFailure ? error.message : 'smoke failed';
    process.stderr.write(`local-commercecore-stack-smoke: FAIL reason=${reason}\n`);
    process.exitCode = 1;
  }
}

const entry = process.argv[1] ? pathToFileURL(process.argv[1]).href : '';
if (import.meta.url === entry) {
  await main();
}
