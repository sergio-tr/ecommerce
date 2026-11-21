/**
 * Start the three local loopback apps and stop only those children.
 *
 *   pnpm run local-commercecore-stack
 *
 * API:  http://127.0.0.1:3000
 * Web:  http://127.0.0.1:4200  (/catalog proxies to the API)
 * Cloud: http://127.0.0.1:3100
 * CommerceCloud has no /health/ready route. One API process does not share
 * catalog entries with a second pod. Restart clears them. This is not HA.
 * If any of the three ports is already in use, this exits 2 and starts nothing.
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { apiEnv, delay, spawnGroup } from '../local-egame-fullstack/children.mjs';
import { cloudEnv } from '../local-commercecloud-shell/smoke.mjs';
import { API_PORT, CLOUD_PORT, WEB_PORT, busyStackPort } from './ports.mjs';
import { createSupervisor } from './supervisor.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const apiEntry = path.join(root, 'dist/apps/commercecore-api/main.js');
const cloudEntry = path.join(root, 'dist/apps/commercecloud-api/main.js');
const supervisor = createSupervisor();
let shutdownTask = null;

async function main() {
  const busy = await busyStackPort();
  if (busy !== null) {
    process.stderr.write(`local-commercecore-stack: port 127.0.0.1:${busy} is already in use\n`);
    process.exit(2);
  }
  ensureBuilt();

  supervisor.own(
    spawnGroup(process.execPath, [apiEntry], {
      cwd: root,
      env: apiEnv(API_PORT, 'local'),
      stdio: 'inherit',
    }),
  );
  supervisor.own(
    spawnGroup(
      'pnpm',
      ['exec', 'ng', 'serve', 'egame-web', '--host', '127.0.0.1', '--port', String(WEB_PORT)],
      {
        cwd: root,
        env: { ...process.env, NX_DAEMON: 'false', NX_NO_CLOUD: 'true' },
        stdio: 'inherit',
      },
    ),
  );
  supervisor.own(
    spawnGroup(process.execPath, [cloudEntry], {
      cwd: root,
      env: cloudEnv(CLOUD_PORT, 'local'),
      stdio: 'inherit',
    }),
  );

  const ready = await waitReady();
  if (!ready) {
    await requestShutdown(1);
    return;
  }
  process.stdout.write(
    `local-commercecore-stack: api=http://127.0.0.1:${API_PORT} web=http://127.0.0.1:${WEB_PORT} cloud=http://127.0.0.1:${CLOUD_PORT}\n`,
  );
  process.stdout.write(
    'local-commercecore-stack: health=200 catalog-proxy=200 cloud-live=200 cloud-ready-route=absent\n',
  );
  process.stdout.write(
    'local-commercecore-stack: one API process; restart clears entries; two pods do not share them\n',
  );
  process.stdout.write('local-commercecore-stack: running\n');
  await new Promise(() => {});
}

function ensureBuilt() {
  if (existsSync(apiEntry) && existsSync(cloudEntry)) {
    return;
  }
  const build = spawnSync(
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
    { cwd: root, stdio: 'inherit', env: process.env },
  );
  if (build.status !== 0 || !existsSync(apiEntry) || !existsSync(cloudEntry)) {
    process.stderr.write('local-commercecore-stack: api build failed\n');
    process.exit(1);
  }
}

async function waitReady() {
  const deadline = Date.now() + 120000;
  while (Date.now() < deadline) {
    if (supervisor.anyExited()) {
      process.stderr.write('local-commercecore-stack: a child exited before readiness\n');
      return false;
    }
    try {
      const health = await readText(`http://127.0.0.1:${API_PORT}/health/live`, 'application/json');
      const cloudLive = await readText(
        `http://127.0.0.1:${CLOUD_PORT}/health/live`,
        'application/json',
      );
      const cloudReady = await readText(`http://127.0.0.1:${CLOUD_PORT}/health/ready`);
      const page = await readText(`http://127.0.0.1:${WEB_PORT}/`);
      const list = await readText(
        `http://127.0.0.1:${WEB_PORT}/catalog/synthetic-entries`,
        'application/json',
      );
      const cloudBody = cloudLive.status === 200 ? JSON.parse(cloudLive.text) : null;
      const body = list.status === 200 ? JSON.parse(list.text) : null;
      if (
        health.status === 200 &&
        cloudBody?.service === 'commercecloud-api' &&
        cloudBody?.status === 'live' &&
        cloudReady.status === 404 &&
        page.text.includes('<egame-root>') &&
        body !== null &&
        Array.isArray(body.entries)
      ) {
        return true;
      }
    } catch {
      // A listener is still starting.
    }
    await delay(200);
  }
  process.stderr.write('local-commercecore-stack: timed out waiting for readiness\n');
  return false;
}

function readText(url, accept) {
  return fetch(url, {
    headers: accept === undefined ? undefined : { accept },
    signal: AbortSignal.timeout(1000),
  }).then(async (response) => ({ status: response.status, text: await response.text() }));
}

function requestShutdown(code) {
  if (!shutdownTask) {
    shutdownTask = shutdown(code);
  }
  return shutdownTask;
}

async function shutdown(code) {
  await supervisor.stopOwned();
  if (code === 0) {
    process.stdout.write('local-commercecore-stack: stopped\n');
  }
  process.exit(code);
}

const entry = process.argv[1] ? pathToFileURL(process.argv[1]).href : '';
if (import.meta.url === entry) {
  process.on('SIGINT', () => {
    void requestShutdown(0);
  });
  process.on('SIGTERM', () => {
    void requestShutdown(0);
  });
  process.on('SIGHUP', () => {
    void requestShutdown(0);
  });
  main().catch(() => {
    void requestShutdown(1);
  });
}
