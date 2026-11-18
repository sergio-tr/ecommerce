import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const pinnedImage =
  'docker.io/library/mongo:8.0.38-noble@sha256:76a93cc399d05709baeea4e55385749657aa0085ad5b497c851380778eccea2c';
const implementationFiles = [
  'compose.yaml',
  'lib.sh',
  'entrypoint.sh',
  'bootstrap.sh',
  'bootstrap.js',
  'probe-write.js',
  'probe-read.js',
  'mongo-up.sh',
  'mongo-down.sh',
  'mongo-smoke.sh',
];

function read(name) {
  return readFileSync(path.join(here, name), 'utf8');
}

function run(script, args = [], env = {}) {
  return spawnSync('bash', [path.join(here, script), ...args], {
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
}

function writeEnv(contents) {
  const dir = mkdtempSync(path.join(tmpdir(), 'mongo-env-'));
  const file = path.join(dir, 'env');
  writeFileSync(file, contents);
  return { dir, file };
}

function fakeDocker() {
  const dir = mkdtempSync(path.join(tmpdir(), 'mongo-no-docker-'));
  const log = path.join(dir, 'log');
  const bin = path.join(dir, 'docker');
  writeFileSync(log, '');
  writeFileSync(bin, `#!/bin/sh\nprintf '%s\\n' "$*" >> '${log}'\nexit 1\n`, { mode: 0o755 });
  return { dir, log, bin };
}

test('the compose file pins the OCI index and the loopback publish', () => {
  const compose = read('compose.yaml');
  const images = compose.match(/image:\s*(\S+)/g) ?? [];
  if (images.length !== 1 || images[0] !== `image: ${pinnedImage}`) {
    throw new Error(`compose image is not the pinned index: ${images.join(', ')}`);
  }
  if (!compose.includes('127.0.0.1:${MONGO_PUBLISH_PORT:-27017}:27017')) {
    throw new Error('compose does not publish through 127.0.0.1');
  }
  if (!compose.includes('name: commercecore-mongo-data')) {
    throw new Error('compose does not pin the named volume');
  }
  if (!compose.includes('internal: true')) {
    throw new Error('compose network is not internal');
  }
  for (const required of ['--replSet', 'rs0', '--auth', '--keyFile', 'hostname: mongo']) {
    if (!compose.includes(required)) {
      throw new Error(`compose is missing ${required}`);
    }
  }
});

test('tracked mongo files do not carry forbidden runtime choices', () => {
  const forbidden = [
    'commercecore_dev',
    'commercecloud_dev',
    'directConnection',
    '0.0.0.0',
    'sk_live_',
    'sk_test_',
    'latest',
  ];
  for (const name of implementationFiles) {
    const text = read(name);
    for (const needle of forbidden) {
      if (text.includes(needle)) {
        throw new Error(`${name} contains ${needle}`);
      }
    }
  }
});

test('shell scripts parse', () => {
  for (const name of [
    'lib.sh',
    'entrypoint.sh',
    'bootstrap.sh',
    'mongo-up.sh',
    'mongo-down.sh',
    'mongo-smoke.sh',
  ]) {
    const result = spawnSync('bash', ['-n', path.join(here, name)], { encoding: 'utf8' });
    if (result.status !== 0) {
      throw new Error(`${name} failed bash -n\n${result.stderr}`);
    }
  }
});

test('missing or empty credentials fail before docker', () => {
  const docker = fakeDocker();
  const runtime = mkdtempSync(path.join(tmpdir(), 'mongo-runtime-'));
  try {
    const missing = run('mongo-up.sh', [], {
      MONGO_ENV_FILE: path.join(runtime, 'missing.env'),
      MONGO_DOCKER_BIN: docker.bin,
      MONGO_RUNTIME_DIR: runtime,
    });
    if (missing.status !== 1) {
      throw new Error(`missing env exited ${missing.status}\n${missing.stderr}`);
    }
    const empty = writeEnv(
      'MONGO_INITDB_ROOT_USERNAME="local-operator"\nMONGO_INITDB_ROOT_PASSWORD=""\n',
    );
    try {
      const result = run('mongo-up.sh', [], {
        MONGO_ENV_FILE: empty.file,
        MONGO_DOCKER_BIN: docker.bin,
        MONGO_RUNTIME_DIR: runtime,
      });
      if (result.status !== 1) {
        throw new Error(`empty password exited ${result.status}\n${result.stderr}`);
      }
    } finally {
      rmSync(empty.dir, { recursive: true, force: true });
    }
    if (readFileSync(docker.log, 'utf8').trim() !== '') {
      throw new Error(
        `docker was called for a credential failure:\n${readFileSync(docker.log, 'utf8')}`,
      );
    }
  } finally {
    rmSync(docker.dir, { recursive: true, force: true });
    rmSync(runtime, { recursive: true, force: true });
  }
});

test('a present credential file without docker is WAITING_OWNER_LOCAL', () => {
  const docker = fakeDocker();
  const env = writeEnv(
    'MONGO_INITDB_ROOT_USERNAME="local-operator"\nMONGO_INITDB_ROOT_PASSWORD="local-test-credential"\n',
  );
  const runtime = mkdtempSync(path.join(tmpdir(), 'mongo-runtime-'));
  try {
    const result = run('mongo-up.sh', [], {
      MONGO_ENV_FILE: env.file,
      MONGO_DOCKER_BIN: docker.bin,
      MONGO_RUNTIME_DIR: runtime,
    });
    if (result.status !== 2 || !result.stdout.includes('WAITING_OWNER_LOCAL')) {
      throw new Error(`expected exit 2, got ${result.status}\n${result.stdout}\n${result.stderr}`);
    }
    const smoke = run('mongo-smoke.sh', ['--fresh'], {
      MONGO_ENV_FILE: env.file,
      MONGO_DOCKER_BIN: docker.bin,
      MONGO_RUNTIME_DIR: runtime,
    });
    if (smoke.status !== 2 || !smoke.stdout.includes('WAITING_OWNER_LOCAL')) {
      throw new Error(
        `smoke expected exit 2, got ${smoke.status}\n${smoke.stdout}\n${smoke.stderr}`,
      );
    }
    const log = readFileSync(docker.log, 'utf8');
    if (log.includes('down') || log.includes('volume')) {
      throw new Error(`smoke called docker past the daemon check:\n${log}`);
    }
  } finally {
    rmSync(docker.dir, { recursive: true, force: true });
    rmSync(env.dir, { recursive: true, force: true });
    rmSync(runtime, { recursive: true, force: true });
  }
});

test('teardown keeps the volume unless the destructive flag is explicit', () => {
  const kept = run('mongo-down.sh', [], { MONGO_DOWN_PLAN_ONLY: '1' });
  if (kept.status !== 0 || kept.stdout.trim() !== 'down') {
    throw new Error(`default plan was ${kept.stdout.trim()} (${kept.status})`);
  }
  const removed = run('mongo-down.sh', ['--destroy-volume'], { MONGO_DOWN_PLAN_ONLY: '1' });
  if (removed.status !== 0 || removed.stdout.trim() !== 'down-volume') {
    throw new Error(`destroy plan was ${removed.stdout.trim()} (${removed.status})`);
  }
  const rejected = run('mongo-down.sh', ['--volume'], { MONGO_DOWN_PLAN_ONLY: '1' });
  if (rejected.status !== 1) {
    throw new Error('an unknown teardown flag was accepted');
  }
  const down = read('mongo-down.sh');
  if (!down.includes('mongo_compose down -v') || !down.includes('mongo_compose down\n')) {
    throw new Error('down script does not separate volume removal from the default stop');
  }
  const smoke = read('mongo-smoke.sh');
  const destructiveCalls = smoke.split('\n').filter((line) => line.includes('--destroy-volume'));
  if (destructiveCalls.length !== 1 || !smoke.includes('if [[ "$fresh" -eq 1 ]]; then')) {
    throw new Error('smoke can remove the volume without --fresh');
  }
});
