import { spawn } from 'node:child_process';
import { createServer } from 'node:net';

/**
 * Process helpers for the local eGame stack.
 * Stop calls signal only the process group this module spawned.
 */
export function spawnGroup(command, args, options = {}) {
  const stdio = options.stdio ?? ['ignore', 'pipe', 'pipe'];
  const child = spawn(command, args, {
    cwd: options.cwd,
    env: options.env,
    detached: true,
    stdio,
  });
  let output = '';
  let spawnFailed = false;
  child.on('error', (error) => {
    spawnFailed = true;
    output += `spawn-error:${error.code ?? 'error'}\n`;
  });
  if (child.stdout) {
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      output += chunk;
    });
  }
  if (child.stderr) {
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk) => {
      output += chunk;
    });
  }
  return {
    child,
    output() {
      return output;
    },
    exited() {
      return spawnFailed || child.exitCode !== null || child.signalCode !== null;
    },
  };
}

export function apiEnv(port, environment = 'test') {
  return {
    PATH: process.env.PATH ?? '',
    COMMERCECORE_ENV: environment,
    COMMERCECORE_HTTP_HOST: '127.0.0.1',
    COMMERCECORE_HTTP_PORT: String(port),
    COMMERCECORE_LOG_LEVEL: 'info',
    COMMERCECORE_SERVICE_VERSION: '0.0.0',
  };
}

export function startApi(root, port, environment = 'test') {
  return spawnGroup(process.execPath, ['dist/apps/commercecore-api/main.js'], {
    cwd: root,
    env: apiEnv(port, environment),
  });
}

export async function stopGroup(record, timeoutMs = 2000) {
  const child = record?.child;
  if (!child || child.pid === undefined) {
    return;
  }
  const pid = child.pid;
  if (!hasExited(child)) {
    signalGroup(pid, 'SIGTERM');
    await waitExit(child, timeoutMs);
  }
  // The group leader can exit while a descendant, such as the Angular
  // dev server, still holds the listen socket. Signal that group only.
  signalOne(-pid, 'SIGKILL');
  if (!hasExited(child)) {
    await waitExit(child, 1000);
  }
}

export function pidAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export function portBusy(port) {
  return new Promise((resolve) => {
    const server = createServer();
    server.once('error', () => resolve(true));
    server.listen(port, '127.0.0.1', () => {
      server.close(() => resolve(false));
    });
  });
}

export function freePort() {
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

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function hasExited(child) {
  return child.exitCode !== null || child.signalCode !== null;
}

function signalGroup(pid, signal) {
  signalOne(-pid, signal);
  signalOne(pid, signal);
}

function signalOne(pid, signal) {
  try {
    process.kill(pid, signal);
  } catch (error) {
    if (error?.code !== 'ESRCH') {
      throw error;
    }
  }
}

function waitExit(child, timeoutMs) {
  if (hasExited(child)) {
    return Promise.resolve(true);
  }
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      child.removeListener('exit', onExit);
      resolve(hasExited(child));
    }, timeoutMs);
    const onExit = () => {
      clearTimeout(timer);
      resolve(true);
    };
    child.once('exit', onExit);
  });
}
