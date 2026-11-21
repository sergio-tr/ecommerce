/**
 * Start the local synthetic catalog on loopback and stop only those children.
 *
 *   pnpm run local-egame-fullstack
 *
 * API: http://127.0.0.1:3000
 * Web: http://127.0.0.1:4200
 * The web server uses apps/egame-web/proxy.conf.json for /catalog.
 * Health is GET /health/live. Readiness is that probe plus the proxied list.
 * If either port is already in use, this exits 2 and does not kill it.
 * One API process does not share entries with a second pod. Restart clears them.
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { delay, portBusy, spawnGroup, stopGroup } from './children.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const apiEntry = path.join(root, 'dist/apps/commercecore-api/main.js');
const API_PORT = 3000;
const WEB_PORT = 4200;
const children = [];
let stopping = false;

async function main() {
  const apiBusy = await portBusy(API_PORT);
  const webBusy = await portBusy(WEB_PORT);
  if (apiBusy || webBusy) {
    const port = apiBusy ? API_PORT : WEB_PORT;
    process.stderr.write(`local-egame-fullstack: port 127.0.0.1:${port} is already in use\n`);
    process.exit(2);
  }
  if (!existsSync(apiEntry)) {
    const build = spawnSync(
      'pnpm',
      ['exec', 'nx', 'run', 'commercecore-api:build', '--output-style=static'],
      { cwd: root, stdio: 'inherit', env: process.env },
    );
    if (build.status !== 0 || !existsSync(apiEntry)) {
      process.stderr.write('local-egame-fullstack: api build failed\n');
      process.exit(1);
    }
  }

  const api = spawnGroup(process.execPath, [apiEntry], {
    cwd: root,
    env: {
      PATH: process.env.PATH ?? '',
      COMMERCECORE_ENV: 'local',
      COMMERCECORE_HTTP_HOST: '127.0.0.1',
      COMMERCECORE_HTTP_PORT: String(API_PORT),
      COMMERCECORE_LOG_LEVEL: 'info',
      COMMERCECORE_SERVICE_VERSION: '0.0.0',
    },
    stdio: 'inherit',
  });
  children.push(api);
  const web = spawnGroup(
    'pnpm',
    ['exec', 'ng', 'serve', 'egame-web', '--host', '127.0.0.1', '--port', String(WEB_PORT)],
    {
      cwd: root,
      env: { ...process.env, NX_DAEMON: 'false', NX_NO_CLOUD: 'true' },
      stdio: 'inherit',
    },
  );
  children.push(web);

  const ready = await waitReady(api.child, web.child);
  if (!ready) {
    await shutdown(1);
    return;
  }
  process.stdout.write(
    `local-egame-fullstack: api=http://127.0.0.1:${API_PORT} web=http://127.0.0.1:${WEB_PORT}\n`,
  );
  process.stdout.write('local-egame-fullstack: health=200 catalog-proxy=200\n');
  process.stdout.write(
    'local-egame-fullstack: one API process; restart clears entries; two pods do not share them\n',
  );
  process.stdout.write('local-egame-fullstack: running\n');
  await new Promise(() => {});
}

async function waitReady(apiChild, webChild) {
  const deadline = Date.now() + 120000;
  while (Date.now() < deadline) {
    if (apiChild.exitCode !== null || webChild.exitCode !== null) {
      process.stderr.write('local-egame-fullstack: a child exited before readiness\n');
      return false;
    }
    try {
      const health = await fetch(`http://127.0.0.1:${API_PORT}/health/live`, {
        signal: AbortSignal.timeout(500),
      });
      const page = await fetch(`http://127.0.0.1:${WEB_PORT}/`, {
        signal: AbortSignal.timeout(500),
      });
      const pageText = page.status === 200 ? await page.text() : '';
      const list = await fetch(`http://127.0.0.1:${WEB_PORT}/catalog/synthetic-entries`, {
        headers: { accept: 'application/json' },
        signal: AbortSignal.timeout(1000),
      });
      const body = list.status === 200 ? await list.json() : null;
      if (
        health.status === 200 &&
        pageText.includes('<egame-root>') &&
        body !== null &&
        Array.isArray(body.entries)
      ) {
        return true;
      }
    } catch {
      // Either listener is still starting.
    }
    await delay(200);
  }
  process.stderr.write('local-egame-fullstack: timed out waiting for readiness\n');
  return false;
}

async function shutdown(code) {
  if (stopping) {
    return;
  }
  stopping = true;
  for (const child of children) {
    await stopGroup(child);
  }
  if (code === 0) {
    process.stdout.write('local-egame-fullstack: stopped\n');
  }
  process.exit(code);
}

process.on('SIGINT', () => {
  void shutdown(0);
});
process.on('SIGTERM', () => {
  void shutdown(0);
});
process.on('SIGHUP', () => {
  void shutdown(0);
});

main().catch(() => {
  void shutdown(1);
});
