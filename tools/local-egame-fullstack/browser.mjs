import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { delay, freePort, spawnGroup, startApi, stopGroup } from './children.mjs';
import { startStaticProxy } from './proxy.mjs';

const COMMERCIAL_TEXT = ['Stripe', 'Add to cart', 'In stock', 'SKU', 'Checkout'];
const STARTUP_FAILURES = new Set([
  'chrome exited',
  'chrome debugger timed out',
  'chrome socket failed',
  'cdp timed out',
  'cdp call failed',
]);

export function isBrowserStartupFailure(error) {
  return error instanceof Error && STARTUP_FAILURES.has(error.message);
}

export function findChrome() {
  const names = ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser'];
  const directories = (process.env.PATH ?? '')
    .split(path.delimiter)
    .filter((entry) => entry.length > 0);
  for (const name of names) {
    for (const directory of directories) {
      const candidate = path.join(directory, name);
      if (existsSync(candidate)) {
        return candidate;
      }
    }
  }
  return null;
}

export function webBrowserRoot(root) {
  const candidates = [
    path.join(root, 'dist/apps/egame-web/browser'),
    path.join(root, 'dist/apps/egame-web'),
  ];
  for (const candidate of candidates) {
    if (existsSync(path.join(candidate, 'index.html'))) {
      return candidate;
    }
  }
  return null;
}

export function browserSkipReason(root) {
  if (!findChrome()) {
    return 'chrome-missing';
  }
  if (!webBrowserRoot(root)) {
    return 'web-build-missing';
  }
  return null;
}

/**
 * One real Chrome pass against the built eGame page and the process-local API.
 * Returns NOT_RUN when Chrome or the web build is absent, or when Chrome does
 * not expose a debugger after one retry. It does not claim G5.
 */
export async function runBrowserSmoke(options) {
  const reason = browserSkipReason(options.root);
  if (reason) {
    return { status: 'NOT_RUN', reason };
  }
  try {
    return await runBrowserOnce(options);
  } catch (error) {
    if (!isBrowserStartupFailure(error)) {
      throw error;
    }
  }
  try {
    return await runBrowserOnce(options);
  } catch (error) {
    if (isBrowserStartupFailure(error)) {
      return { status: 'NOT_RUN', reason: 'chrome-unavailable' };
    }
    throw error;
  }
}

async function runBrowserOnce({ root, fixture, screenshotDir }) {
  const webRoot = webBrowserRoot(root);
  const chrome = findChrome();
  const apiPort = await freePort();
  const api = startApi(root, apiPort);
  let web = null;
  let chromeRecord = null;
  let profile = null;
  try {
    await waitLive(apiPort, api.child);
    web = await startStaticProxy({ apiPort, webRoot });
    profile = await mkdtemp(path.join(tmpdir(), 'egame-chrome-'));
    const debugPort = await freePort();
    chromeRecord = spawnGroup(
      chrome,
      [
        '--headless=new',
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-extensions',
        '--disable-sync',
        '--disable-background-networking',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        `--user-data-dir=${profile}`,
        `--remote-debugging-port=${debugPort}`,
        '--remote-debugging-address=127.0.0.1',
        '--remote-allow-origins=*',
        '--window-size=1280,900',
        'about:blank',
      ],
      {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
          PATH: process.env.PATH ?? '',
          HOME: profile,
          TMPDIR: tmpdir(),
          LANG: 'C.UTF-8',
          DBUS_SESSION_BUS_ADDRESS: '/dev/null',
        },
      },
    );
    const version = await waitForDebugger(debugPort, chromeRecord.child, profile);
    const session = await openPage(version.webSocketDebuggerUrl, `http://127.0.0.1:${web.port}/`);
    try {
      const sawLoading = await sawText(session, 'Loading synthetic entries.', 1500);
      const empty = await waitForText(session, 'No synthetic entries.', 15000);
      if (empty === null || !empty.includes('Synthetic demo, no commercial data')) {
        throw new Error('empty state missing');
      }
      if (!empty.includes('This is not high availability and it is not a product catalog.')) {
        throw new Error('process-local note missing');
      }
      if (COMMERCIAL_TEXT.some((phrase) => empty.includes(phrase))) {
        throw new Error('commercial text present');
      }
      const title = await evaluate(session, 'document.title');
      if (title !== 'eGame synthetic demo') {
        throw new Error('document title mismatch');
      }
      if (!(await fill(session, 'create-product-id', fixture.productId))) {
        throw new Error('create id field missing');
      }
      if (!(await fill(session, 'create-label', fixture.syntheticLabel))) {
        throw new Error('create label field missing');
      }
      if (!(await clickButton(session, 'Create synthetic entry'))) {
        throw new Error('create button missing');
      }
      const listed = await waitForText(session, 'rev 1', 10000);
      if (listed === null || !listed.includes(fixture.productId)) {
        throw new Error('created entry missing');
      }
      if (!(await fill(session, 'create-product-id', fixture.productId))) {
        throw new Error('create id field missing');
      }
      if (!(await fill(session, 'create-label', fixture.syntheticLabel))) {
        throw new Error('create label field missing');
      }
      if (!(await clickButton(session, 'Create synthetic entry'))) {
        throw new Error('create button missing');
      }
      const duplicate = await waitForText(session, 'That product id is already stored.', 10000);
      if (duplicate === null) {
        throw new Error('duplicate alert missing');
      }
      if ((await inputValue(session, 'create-product-id')) !== fixture.productId) {
        throw new Error('duplicate cleared the product id');
      }
      if (!(await clickButton(session, 'Edit'))) {
        throw new Error('edit button missing');
      }
      if ((await inputValue(session, 'update-revision')) !== '1') {
        throw new Error('edit did not load revision 1');
      }
      if (!(await fill(session, 'update-label', fixture.updatedLabel))) {
        throw new Error('update label field missing');
      }
      if (!(await clickButton(session, 'Save synthetic label'))) {
        throw new Error('save button missing');
      }
      const updated = await waitForText(session, 'rev 2', 10000);
      if (updated === null || !updated.includes(fixture.updatedLabel)) {
        throw new Error('updated entry missing');
      }
      if (!(await fill(session, 'update-revision', String(fixture.staleRevision)))) {
        throw new Error('revision field missing');
      }
      if (!(await clickButton(session, 'Save synthetic label'))) {
        throw new Error('save button missing');
      }
      const stale = await waitForText(
        session,
        'The revision is stale. The entry was not changed.',
        10000,
      );
      if (stale === null) {
        throw new Error('stale alert missing');
      }
      if ((await inputValue(session, 'update-revision')) !== String(fixture.staleRevision)) {
        throw new Error('stale revision was cleared');
      }
      if (COMMERCIAL_TEXT.some((phrase) => stale.includes(phrase))) {
        throw new Error('commercial text present');
      }
      await capture(session, screenshotDir, 'egame-fullstack-create.png');
      await stopGroup(api);
      if (!(await clickButton(session, 'Reload'))) {
        throw new Error('reload button missing');
      }
      const failed = await waitForText(session, 'The synthetic list could not be loaded.', 10000);
      if (failed === null) {
        throw new Error('reload error missing');
      }
      const alert = await evaluate(
        session,
        `[...document.querySelectorAll('[role="alert"]')].map((item) => item.textContent ?? '').join('\\n')`,
      );
      if (typeof alert !== 'string' || !alert.includes('The synthetic list could not be loaded.')) {
        throw new Error('error alert missing');
      }
      await capture(session, screenshotDir, 'egame-fullstack-error.png');
      return {
        status: 'PASS',
        loading: sawLoading ? 'shown' : 'not-observed',
      };
    } finally {
      await session.close();
    }
  } finally {
    if (chromeRecord) {
      await stopGroup(chromeRecord);
    }
    if (web) {
      await web.close();
    }
    await stopGroup(api);
    if (profile) {
      await rm(profile, { recursive: true, force: true });
    }
  }
}

async function waitLive(port, child) {
  const deadline = Date.now() + 8000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error('api exited before the browser smoke');
    }
    try {
      const response = await fetch(`http://127.0.0.1:${port}/health/live`, {
        signal: AbortSignal.timeout(500),
      });
      if (response.status === 200) {
        return;
      }
    } catch {
      // The listener is not open yet.
    }
    await delay(50);
  }
  throw new Error('api liveness timed out');
}

async function waitForDebugger(port, child, profile) {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null || child.signalCode !== null) {
      throw new Error('chrome exited');
    }
    const ports = [port];
    const announced = readDebugPort(profile);
    if (announced !== null && announced !== port) {
      ports.push(announced);
    }
    for (const candidate of ports) {
      try {
        const response = await fetch(`http://127.0.0.1:${candidate}/json/version`, {
          signal: AbortSignal.timeout(500),
        });
        if (response.ok) {
          return await response.json();
        }
      } catch {
        // The debugger is not open yet.
      }
    }
    await delay(50);
  }
  throw new Error('chrome debugger timed out');
}

function readDebugPort(profile) {
  try {
    const [line] = readFileSync(path.join(profile, 'DevToolsActivePort'), 'utf8').split(/\r?\n/, 1);
    if (!/^\d+$/.test(line ?? '')) {
      return null;
    }
    const value = Number(line);
    return value >= 1 && value <= 65535 ? value : null;
  } catch {
    return null;
  }
}

async function openPage(webSocketUrl, pageUrl) {
  const socket = new WebSocket(webSocketUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', () => resolve(undefined), { once: true });
    socket.addEventListener('error', () => reject(new Error('chrome socket failed')), {
      once: true,
    });
  });
  const cdp = createCdp(socket);
  const created = await cdp.call('Target.createTarget', { url: 'about:blank' });
  const attached = await cdp.call('Target.attachToTarget', {
    targetId: created.targetId,
    flatten: true,
  });
  const sessionId = attached.sessionId;
  await cdp.call('Page.enable', {}, sessionId);
  await cdp.call('Runtime.enable', {}, sessionId);
  await cdp.call('Page.navigate', { url: pageUrl }, sessionId);
  return {
    async close() {
      socket.close();
    },
    cdp,
    sessionId,
  };
}

function createCdp(socket) {
  let next = 0;
  const pending = new Map();
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(String(event.data));
    if (typeof message.id !== 'number') {
      return;
    }
    const waiter = pending.get(message.id);
    if (!waiter) {
      return;
    }
    pending.delete(message.id);
    if (message.error) {
      waiter.reject(new Error('cdp call failed'));
    } else {
      waiter.resolve(message.result ?? {});
    }
  });
  return {
    call(method, params = {}, sessionId) {
      const id = ++next;
      return withTimeout(
        new Promise((resolve, reject) => {
          pending.set(id, { resolve, reject });
          const payload = { id, method, params };
          if (sessionId) {
            payload.sessionId = sessionId;
          }
          socket.send(JSON.stringify(payload));
        }),
        10000,
      );
    },
  };
}

async function evaluate(session, expression) {
  const result = await session.cdp.call(
    'Runtime.evaluate',
    { expression, returnByValue: true, awaitPromise: true },
    session.sessionId,
  );
  if (result.exceptionDetails) {
    throw new Error('page script failed');
  }
  return result.result?.value;
}

async function pageText(session) {
  const text = await evaluate(session, 'document.body ? document.body.innerText : ""');
  return typeof text === 'string' ? text : '';
}

async function sawText(session, needle, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if ((await pageText(session)).includes(needle)) {
      return true;
    }
    await delay(50);
  }
  return false;
}

async function waitForText(session, needle, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const text = await pageText(session);
    if (text.includes(needle)) {
      return text;
    }
    await delay(100);
  }
  return null;
}

async function fill(session, id, value) {
  const filled = await evaluate(
    session,
    `(() => {
      const field = document.getElementById(${JSON.stringify(id)});
      if (!(field instanceof HTMLInputElement) || field.disabled) return false;
      field.focus();
      field.value = ${JSON.stringify(value)};
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
      return field.value === ${JSON.stringify(value)};
    })()`,
  );
  return filled === true;
}

async function inputValue(session, id) {
  return evaluate(
    session,
    `(() => {
      const field = document.getElementById(${JSON.stringify(id)});
      return field instanceof HTMLInputElement ? field.value : null;
    })()`,
  );
}

async function clickButton(session, label) {
  const clicked = await evaluate(
    session,
    `(() => {
      const button = [...document.querySelectorAll('button')].find(
        (item) => item.textContent.trim() === ${JSON.stringify(label)},
      );
      if (!(button instanceof HTMLButtonElement) || button.disabled) return false;
      button.click();
      return true;
    })()`,
  );
  return clicked === true;
}

async function capture(session, screenshotDir, name) {
  if (!screenshotDir) {
    return;
  }
  const shot = await session.cdp.call(
    'Page.captureScreenshot',
    { format: 'png' },
    session.sessionId,
  );
  if (typeof shot.data !== 'string') {
    return;
  }
  await mkdir(screenshotDir, { recursive: true });
  await writeFile(path.join(screenshotDir, name), Buffer.from(shot.data, 'base64'));
}

function withTimeout(promise, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('cdp timed out')), timeoutMs);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}
