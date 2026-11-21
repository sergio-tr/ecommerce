/**
 * Fast fullstack smoke for the process-local synthetic catalog.
 * It starts one API on an ephemeral loopback port and calls GET, POST, and PATCH
 * through the same /catalog prefix as apps/egame-web/proxy.conf.json.
 * Chrome UI coverage runs only when a local browser and the web build exist.
 * Otherwise the browser line is NOT_RUN. This pass is not G5 and not AC-CAT-08.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runBrowserSmoke } from './browser.mjs';
import { freePort, startApi, stopGroup } from './children.mjs';
import { isCatalogPath, loadCatalogProxyRule, startCatalogProxy } from './proxy.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const apiEntry = path.join(root, 'dist/apps/commercecore-api/main.js');
const fixturePath = path.join(root, 'tools/local-egame-fullstack/synthetic-input.json');
const lines = [];
const COMMERCIAL_KEYS = new Set([
  'currency',
  'license',
  'money',
  'offer',
  'price',
  'quote',
  'sku',
  'stock',
  'stripe',
  'tax',
  'tenant',
  'tenantId',
  'variant',
  'variantId',
]);

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
    'rejectedLabel',
    'rejectedExtra',
  ]) {
    if (typeof fixture[key] !== 'string' || fixture[key].length === 0) {
      fail('fixture is missing a required string');
    }
  }
  if (fixture.staleRevision !== 9) {
    fail('fixture stale revision must stay 9');
  }
  return fixture;
}

async function request(port, method, pathname, body) {
  const response = await fetch(`http://127.0.0.1:${port}${pathname}`, {
    method,
    headers:
      body === undefined
        ? { accept: 'application/json' }
        : {
            accept: 'application/json',
            'content-type': 'application/json',
          },
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
  if (hasCommercialKey(parsed)) {
    fail('response included a commercial field');
  }
  return { status: response.status, text, body: parsed };
}

function hasCommercialKey(value) {
  if (Array.isArray(value)) {
    return value.some((item) => hasCommercialKey(item));
  }
  if (value !== null && typeof value === 'object') {
    return Object.entries(value).some(
      ([key, item]) => COMMERCIAL_KEYS.has(key) || hasCommercialKey(item),
    );
  }
  return false;
}

function entryShape(body, fixture, label, revision) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return false;
  }
  const keys = Object.keys(body).sort();
  return (
    keys.length === 3 &&
    keys[0] === 'productId' &&
    keys[1] === 'revision' &&
    keys[2] === 'syntheticLabel' &&
    body.productId === fixture.productId &&
    body.syntheticLabel === label &&
    body.revision === revision
  );
}

async function waitLive(port, child) {
  const deadline = Date.now() + 8000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      fail('server exited before liveness');
    }
    try {
      const response = await fetch(`http://127.0.0.1:${port}/health/live`, {
        signal: AbortSignal.timeout(500),
      });
      if (response.status === 200) {
        const body = await response.json();
        if (
          body.status === 'live' &&
          body.service === 'commercecore-api' &&
          body.dependenciesChecked === false
        ) {
          return;
        }
      }
    } catch {
      // The listener is not open yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  fail('timed out waiting for liveness');
}

async function main() {
  if (!existsSync(apiEntry)) {
    fail('build missing; run the nx build before this smoke');
  }
  const fixture = loadFixture();
  const rule = loadCatalogProxyRule(root);
  if (!isCatalogPath('/catalog/synthetic-entries')) {
    fail('catalog prefix check failed');
  }
  lines.push(
    'local-egame-fullstack-smoke: boundary=process-local financial=false provider=none persistence=memory',
  );
  lines.push(`proxy: prefix=${rule.prefix} target=127.0.0.1`);
  const apiPort = await freePort();
  const api = startApi(root, apiPort);
  let proxy = null;
  try {
    await waitLive(apiPort, api.child);
    lines.push('health: http=200 status=live');
    proxy = await startCatalogProxy(apiPort);
    const hidden = await request(proxy.port, 'GET', '/health/live');
    if (hidden.status !== 404 || hidden.body?.code !== 'NOT_PROXIED') {
      fail('non-catalog path was proxied');
    }
    lines.push('unproxied: http=404 code=NOT_PROXIED');

    const empty = await request(proxy.port, 'GET', '/catalog/synthetic-entries');
    if (empty.status !== 200 || empty.body?.entries?.length !== 0) {
      fail('empty list was not empty');
    }
    lines.push('list-empty: http=200 count=0');

    const created = await request(proxy.port, 'POST', '/catalog/synthetic-entries', {
      productId: fixture.productId,
      syntheticLabel: fixture.syntheticLabel,
    });
    if (created.status !== 201 || !entryShape(created.body, fixture, fixture.syntheticLabel, 1)) {
      fail('create did not return revision 1');
    }
    lines.push('create: http=201 revision=1');

    const listed = await request(proxy.port, 'GET', '/catalog/synthetic-entries');
    if (listed.status !== 200 || listed.body?.entries?.length !== 1) {
      fail('list did not return the created entry');
    }
    if (!entryShape(listed.body.entries[0], fixture, fixture.syntheticLabel, 1)) {
      fail('listed entry did not match revision 1');
    }
    lines.push('list: http=200 count=1 revision=1');

    const updated = await request(
      proxy.port,
      'PATCH',
      `/catalog/synthetic-entries/${fixture.productId}`,
      {
        syntheticLabel: fixture.updatedLabel,
        expectedRevision: 1,
      },
    );
    if (updated.status !== 200 || !entryShape(updated.body, fixture, fixture.updatedLabel, 2)) {
      fail('update did not return revision 2');
    }
    lines.push('update: http=200 revision=2');

    const stale = await request(
      proxy.port,
      'PATCH',
      `/catalog/synthetic-entries/${fixture.productId}`,
      {
        syntheticLabel: fixture.updatedLabel,
        expectedRevision: fixture.staleRevision,
      },
    );
    const afterStale = await request(
      proxy.port,
      'GET',
      `/catalog/synthetic-entries/${fixture.productId}`,
    );
    if (
      stale.status !== 409 ||
      stale.body?.code !== 'REVISION_CONFLICT' ||
      !entryShape(afterStale.body, fixture, fixture.updatedLabel, 2)
    ) {
      fail('stale revision changed the entry');
    }
    lines.push('stale: http=409 code=REVISION_CONFLICT unchanged=true');

    const duplicate = await request(proxy.port, 'POST', '/catalog/synthetic-entries', {
      productId: fixture.productId,
      syntheticLabel: fixture.syntheticLabel,
    });
    if (duplicate.status !== 409 || duplicate.body?.code !== 'DUPLICATE_PRODUCT_ID') {
      fail('duplicate create was not rejected');
    }
    lines.push('duplicate: http=409 code=DUPLICATE_PRODUCT_ID');

    const invalidLabel = await request(proxy.port, 'POST', '/catalog/synthetic-entries', {
      productId: fixture.otherProductId,
      syntheticLabel: fixture.rejectedLabel,
    });
    if (
      invalidLabel.status !== 400 ||
      invalidLabel.body?.code !== 'LABEL_INVALID' ||
      invalidLabel.text.includes(fixture.rejectedLabel) ||
      api.output().includes(fixture.rejectedLabel)
    ) {
      fail('invalid label was echoed');
    }
    lines.push('invalid-label: http=400 code=LABEL_INVALID echoed=false');

    const invalidId = await request(
      proxy.port,
      'GET',
      `/catalog/synthetic-entries/${fixture.rejectedProductId}`,
    );
    if (
      invalidId.status !== 400 ||
      invalidId.body?.code !== 'PRODUCT_ID_INVALID' ||
      invalidId.text.includes(fixture.rejectedProductId) ||
      api.output().includes(fixture.rejectedProductId)
    ) {
      fail('invalid id was echoed');
    }
    lines.push('invalid-id: http=400 code=PRODUCT_ID_INVALID echoed=false');

    const extra = await request(proxy.port, 'POST', '/catalog/synthetic-entries', {
      productId: fixture.otherProductId,
      syntheticLabel: fixture.syntheticLabel,
      price: fixture.rejectedExtra,
    });
    if (
      extra.status !== 400 ||
      extra.body?.code !== 'BODY_INVALID' ||
      extra.text.includes(fixture.rejectedExtra) ||
      api.output().includes(fixture.rejectedExtra)
    ) {
      fail('extra field was echoed');
    }
    lines.push('extra-field: http=400 code=BODY_INVALID echoed=false');
    lines.push('commercial: absent=true');

    await stopGroup(api);
    const down = await request(proxy.port, 'GET', '/catalog/synthetic-entries');
    if (
      down.status !== 502 ||
      down.body?.code !== 'UPSTREAM_UNAVAILABLE' ||
      down.text.includes(fixture.rejectedLabel) ||
      down.text.includes(fixture.rejectedProductId) ||
      down.text.includes(fixture.rejectedExtra)
    ) {
      fail('stopped api was not a closed upstream failure');
    }
    lines.push('upstream-down: http=502 code=UPSTREAM_UNAVAILABLE echoed=false');
  } finally {
    if (proxy) {
      await proxy.close();
    }
    await stopGroup(api);
  }

  let browser;
  try {
    browser = await runBrowserSmoke({
      root,
      fixture,
      screenshotDir: process.env.EGAME_SCREENSHOT_DIR,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    fail(/^[a-z][a-z -]{0,60}$/.test(message) ? message : 'browser smoke failed');
  }
  if (browser.status === 'NOT_RUN') {
    lines.push(`browser-smoke: NOT_RUN reason=${browser.reason}`);
  } else {
    lines.push(
      `browser-smoke: PASS empty=shown list=shown error=shown duplicate-alert=shown stale-alert=shown commercial=absent loading=${browser.loading}`,
    );
  }
  lines.push('scope: g5=NOT_CLAIMED ac-cat-08=WAIT_OWNER_SMOKE k3d-two-replica=WAIT_OWNER_LOCAL');
  lines.push('local-egame-fullstack-smoke: pass');
  process.stdout.write(`${lines.join('\n')}\n`);
}

main().catch((error) => {
  const reason = error instanceof SmokeFailure ? error.message : 'unexpected';
  lines.push('local-egame-fullstack-smoke: fail');
  process.stdout.write(`${lines.join('\n')}\n`);
  process.stderr.write(`local-egame-fullstack-smoke: ${reason}\n`);
  process.exit(1);
});
