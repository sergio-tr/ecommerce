/**
 * Required Chrome pass for the local three-app stack.
 * Core, CommerceCloud, and the built eGame page listen on ephemeral loopback
 * ports. A missing browser or web build is FAIL, not a pass. The HTTP smoke
 * stays separate and may still report its own skip. This pass is not G5.
 * Stopping signals only the process groups this file spawned.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  browserSkipReason,
  exerciseReloadFailure,
  exerciseSyntheticCatalog,
  isBrowserStartupFailure,
  openChromePage,
  webBrowserRoot,
} from '../local-egame-fullstack/browser.mjs';
import {
  delay,
  freePort,
  portBusy,
  startApi,
  stopGroup,
} from '../local-egame-fullstack/children.mjs';
import { startStaticProxy } from '../local-egame-fullstack/proxy.mjs';
import { startCloud } from '../local-commercecloud-shell/smoke.mjs';
import { classifyBrowserFailure, preflightFrom, requiredBrowserLine } from './browser-outcome.mjs';
import { STACK_PORTS } from './ports.mjs';
import { createSupervisor } from './supervisor.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const apiEntry = path.join(root, 'dist/apps/commercecore-api/main.js');
const cloudEntry = path.join(root, 'dist/apps/commercecloud-api/main.js');
const fixturePath = path.join(root, 'tools/local-egame-fullstack/synthetic-input.json');
const HIDDEN_HEADER = 'header-value-not-authoritative';
const COMMERCIAL_KEYS = ['price', 'sku', 'stock', 'stripe', 'tenant', 'tenantId'];

let passed = false;
let release = async () => {};
let shutdownTask = null;

export function preflightBrowser() {
  const skip = browserSkipReason(root);
  return preflightFrom({
    apiBuilt: existsSync(apiEntry),
    cloudBuilt: existsSync(cloudEntry),
    chrome: skip !== 'chrome-missing',
    webBuilt: Boolean(webBrowserRoot(root)),
  });
}

async function runOnce(fixture, screenshotDir) {
  const supervisor = createSupervisor();
  let proxy = null;
  let chrome = null;
  const ports = [];
  const records = [];
  const releaseOnce = async () => {
    if (chrome) {
      const current = chrome;
      chrome = null;
      ports.push(current.debugPort);
      await current.close();
    }
    if (proxy) {
      const current = proxy;
      proxy = null;
      await current.close();
    }
    await supervisor.stopOwned();
  };
  release = releaseOnce;
  let failure = null;
  try {
    const corePort = await isolatedPort();
    const cloudPort = await isolatedPort([corePort]);
    ports.push(corePort, cloudPort);
    const core = supervisor.own(startApi(root, corePort));
    const cloud = supervisor.own(startCloud(cloudPort));
    records.push(core, cloud);
    await waitLive(core, corePort, 'commercecore-api', 'core liveness timed out', 'core exited');
    await waitLive(
      cloud,
      cloudPort,
      'commercecloud-api',
      'cloud liveness timed out',
      'cloud exited',
    );
    await assertCloudLive(cloudPort, 'cloud down before core stop');
    await assertClosedSurface(cloudPort);
    proxy = await startStaticProxy({
      apiPort: corePort,
      webRoot: webBrowserRoot(root),
    });
    if (STACK_PORTS.includes(proxy.port)) {
      throw new Error('port unavailable');
    }
    ports.push(proxy.port);
    chrome = await openChromePage(`http://127.0.0.1:${proxy.port}/`);
    if (STACK_PORTS.includes(chrome.debugPort)) {
      throw new Error('port unavailable');
    }
    const loading = await exerciseSyntheticCatalog(
      chrome.session,
      fixture,
      screenshotDir,
      'three-app-browser-create.png',
      { rejectLabel: true },
    );
    await assertCloudLive(cloudPort, 'cloud down before core stop');
    await stopGroup(core);
    await assertPortsFree([corePort]);
    await assertCloudLive(cloudPort, 'cloud down after core stop');
    await assertClosedSurface(cloudPort);
    await exerciseReloadFailure(chrome.session, screenshotDir, 'three-app-browser-error.png');
    return { status: 'PASS', loading };
  } catch (error) {
    failure = error;
    throw error;
  } finally {
    await releaseOnce();
    if (!failure) {
      if (records.some((record) => !record.exited())) {
        throw new Error('child still running');
      }
      await assertPortsFree(ports);
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
    throw new Error('fixture rejected');
  }
  return fixture;
}

async function isolatedPort(avoid = []) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const port = await freePort();
    if (!STACK_PORTS.includes(port) && !avoid.includes(port) && !(await portBusy(port))) {
      return port;
    }
  }
  throw new Error('port unavailable');
}

async function waitLive(record, port, service, timeoutMessage, exitedMessage) {
  const deadline = Date.now() + 8000;
  while (Date.now() < deadline) {
    if (record.exited()) {
      throw new Error(exitedMessage);
    }
    try {
      const response = await fetch(`http://127.0.0.1:${port}/health/live`, {
        headers: { accept: 'application/json' },
        signal: AbortSignal.timeout(500),
      });
      if (response.status === 200) {
        const body = await response.json();
        if (body?.service === service && body?.status === 'live' && body?.probe === 'liveness') {
          assertNoCommercial(body);
          return;
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'commercial field present') {
        throw error;
      }
    }
    await delay(50);
  }
  throw new Error(timeoutMessage);
}

async function assertCloudLive(port, failureMessage) {
  const response = await fetch(`http://127.0.0.1:${port}/health/live`, {
    headers: { accept: 'application/json', 'x-tenant-id': HIDDEN_HEADER },
    signal: AbortSignal.timeout(1000),
  });
  const text = await response.text();
  if (text.includes(HIDDEN_HEADER)) {
    throw new Error('tenant header echoed');
  }
  let body = null;
  try {
    body = JSON.parse(text);
  } catch {
    throw new Error(failureMessage);
  }
  if (
    response.status !== 200 ||
    body?.service !== 'commercecloud-api' ||
    body?.status !== 'live' ||
    body?.probe !== 'liveness'
  ) {
    throw new Error(failureMessage);
  }
  assertNoCommercial(body);
}

function assertNoCommercial(body) {
  const serialized = JSON.stringify(body);
  for (const key of COMMERCIAL_KEYS) {
    if (Object.prototype.hasOwnProperty.call(body, key) || serialized.includes(`"${key}"`)) {
      throw new Error('commercial field present');
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
    if (text.includes(HIDDEN_HEADER)) {
      throw new Error('tenant header echoed');
    }
    if (response.status !== 404) {
      throw new Error('closed route present');
    }
  }
}

async function assertPortsFree(ports) {
  const deadline = Date.now() + 2000;
  while (Date.now() < deadline) {
    let busy = false;
    for (const port of ports) {
      if (await portBusy(port)) {
        busy = true;
        break;
      }
    }
    if (!busy) {
      return;
    }
    await delay(50);
  }
  throw new Error('port stayed bound');
}

function report(result) {
  const formatted = requiredBrowserLine(result);
  process.stdout.write(`${formatted.line}\n`);
  process.stdout.write('g5: NOT_CLAIMED\n');
  if (formatted.exitCode === 0) {
    process.stdout.write('local-commercecore-stack-browser: pass\n');
    return;
  }
  process.stderr.write(`${formatted.line}\n`);
  process.stdout.write('local-commercecore-stack-browser: fail\n');
  process.exitCode = 1;
}

function requestShutdown(code) {
  if (shutdownTask) {
    return shutdownTask;
  }
  const exitCode = passed ? 0 : code;
  shutdownTask = (async () => {
    await release();
    process.exit(exitCode);
  })();
  return shutdownTask;
}

async function main() {
  const blocked = preflightBrowser();
  if (blocked) {
    report(blocked);
    return;
  }
  const fixture = loadFixture();
  const screenshotDir = process.env.COMMERCECORE_STACK_BROWSER_SCREENSHOT_DIR;
  let result;
  try {
    result = await runOnce(fixture, screenshotDir);
  } catch (error) {
    if (!isBrowserStartupFailure(error)) {
      report(classifyBrowserFailure(error));
      return;
    }
  }
  if (!result) {
    try {
      result = await runOnce(fixture, screenshotDir);
    } catch (error) {
      report(classifyBrowserFailure(error));
      return;
    }
  }
  passed = result.status === 'PASS';
  report(result);
}

const entry = process.argv[1] ? pathToFileURL(process.argv[1]).href : '';
if (import.meta.url === entry) {
  process.on('SIGINT', () => {
    void requestShutdown(1);
  });
  process.on('SIGTERM', () => {
    void requestShutdown(1);
  });
  main().catch((error) => {
    report(classifyBrowserFailure(error));
  });
}
