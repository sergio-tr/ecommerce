import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { classifyAnonymousRead } = require('./probe-anonymous.js');

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
  'probe-anonymous.js',
  'mongo-up.sh',
  'mongo-down.sh',
  'mongo-smoke.sh',
  'mongo-t01-isolated.sh',
  'compose.t01.yaml',
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
  const network = compose.slice(compose.lastIndexOf('networks:'));
  if (!network.includes('name: commercecore-mongo\n') || network.includes('internal: true')) {
    throw new Error('compose network is not the dedicated non-internal bridge');
  }
  if (!network.includes('internal: false')) {
    throw new Error('compose does not record that the bridge is not internal');
  }
  const publishedPorts = [...compose.matchAll(/^\s+-\s+'([^']+)'\s*$/gm)].map((match) => match[1]);
  if (
    publishedPorts.length !== 1 ||
    publishedPorts[0] !== '127.0.0.1:${MONGO_PUBLISH_PORT:-27017}:27017'
  ) {
    throw new Error(
      `published ports are not the single loopback bind: ${publishedPorts.join(', ')}`,
    );
  }
  if (compose.includes('0.0.0.0')) {
    throw new Error('compose publishes on every interface');
  }
  for (const required of ['--replSet', 'rs0', '--auth', '--keyFile', 'hostname: mongo']) {
    if (!compose.includes(required)) {
      throw new Error(`compose is missing ${required}`);
    }
  }
  if (!compose.includes('./probe-anonymous.js:/bootstrap/probe-anonymous.js:ro')) {
    throw new Error('compose does not mount the unauthenticated read');
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
    'mongo-t01-isolated.sh',
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
    for (const args of [['--fresh'], ['--resume']]) {
      const smoke = run('mongo-smoke.sh', args, {
        MONGO_ENV_FILE: env.file,
        MONGO_DOCKER_BIN: docker.bin,
        MONGO_RUNTIME_DIR: runtime,
      });
      if (smoke.status !== 2 || !smoke.stdout.includes('WAITING_OWNER_LOCAL')) {
        throw new Error(
          `smoke ${args.join(' ')} expected exit 2, got ${smoke.status}\n${smoke.stdout}\n${smoke.stderr}`,
        );
      }
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
  if (destructiveCalls.length !== 1 || !smoke.includes('if [[ "$mode" == "fresh" ]]; then')) {
    throw new Error('smoke can remove the volume without --fresh');
  }
  const resumeStart = smoke.indexOf('# resume-only-start');
  const resumeEnd = smoke.indexOf('# resume-only-end');
  const resume = smoke.slice(resumeStart, resumeEnd);
  if (resumeStart < 0 || resumeEnd < resumeStart) {
    throw new Error('resume path markers are missing');
  }
  for (const forbidden of ['--destroy-volume', '--fresh', 'probe-write.js', 'PASS']) {
    if (resume.includes(forbidden)) {
      throw new Error(`resume path contains ${forbidden}`);
    }
  }
  if (!resume.includes('t01=NOT_CLAIMED') || !resume.includes('REVALIDATION_ONLY')) {
    throw new Error('resume path can be read as a T01 or matrix pass');
  }
  if (resume.includes('mongo-infra-smoke: PASS')) {
    throw new Error('resume path prints the full smoke pass token');
  }
});

test('anonymous infra_probe read is the authorization oracle', () => {
  const smoke = read('mongo-smoke.sh');
  const probe = read('probe-anonymous.js');
  const probeCode = probe.replace(/\/\/.*$/gm, '');
  if (smoke.includes('anonymous_ping_fails') || probeCode.includes('ping')) {
    throw new Error('the authorization oracle still uses ping');
  }
  for (const required of [
    'probe-anonymous.js',
    '--norc',
    'unset MONGO_INITDB_ROOT_USERNAME MONGO_INITDB_ROOT_PASSWORD MONGODB_URI',
    'AUTH_REJECTED',
    'anonymous infra_probe read succeeded',
    'failed before authorization',
  ]) {
    if (!smoke.includes(required)) {
      throw new Error(`smoke is missing ${required}`);
    }
  }
  if (smoke.split('probe-write.js').length !== 2) {
    throw new Error('probe write is not limited to the clean T01 path');
  }
  const kept = smoke
    .split('\n')
    .find((line) => line.includes('volume commercecore-mongo-data already exists'));
  if (
    !kept ||
    kept.includes('--fresh') ||
    !kept.includes('--resume') ||
    !kept.includes('not deleted')
  ) {
    throw new Error('an existing volume is not kept behind --resume');
  }
  const unauthorized = classifyAnonymousRead(
    {
      code: 13,
      codeName: 'Unauthorized',
      name: 'MongoServerError',
      message: 'Command find requires authentication',
    },
    null,
  );
  if (unauthorized !== 13) {
    throw new Error(`unauthorized read classified as ${unauthorized}`);
  }
  const bypass = classifyAnonymousRead(null, {
    ok: 1,
    cursor: { firstBatch: [{ probe: 'mongo-infra' }] },
  });
  if (bypass !== 0) {
    throw new Error(`accepted read classified as ${bypass}`);
  }
  const emptyAuthorized = classifyAnonymousRead(null, { ok: 1, cursor: { firstBatch: [] } });
  if (emptyAuthorized !== 0) {
    throw new Error(`authorized empty read classified as ${emptyAuthorized}`);
  }
  const reported = classifyAnonymousRead(null, {
    ok: 0,
    code: 13,
    codeName: 'Unauthorized',
    message: 'command find requires authentication',
  });
  if (reported !== 13) {
    throw new Error(`ok:0 unauthorized result classified as ${reported}`);
  }
  const network = classifyAnonymousRead(
    {
      code: 13,
      codeName: 'Unauthorized',
      name: 'MongoNetworkError',
      message: 'connect ECONNREFUSED 127.0.0.1:27017',
    },
    null,
  );
  if (network !== 4) {
    throw new Error(`network error classified as ${network}`);
  }
  const timeout = classifyAnonymousRead(
    { name: 'MongoServerSelectionError', message: 'Server selection timed out' },
    null,
  );
  if (timeout !== 4) {
    throw new Error(`selection timeout classified as ${timeout}`);
  }
  const wrongCredentials = classifyAnonymousRead(
    { code: 18, codeName: 'AuthenticationFailed', message: 'Authentication failed.' },
    null,
  );
  if (wrongCredentials !== 5) {
    throw new Error(`presented credentials classified as ${wrongCredentials}`);
  }
  if (probe.includes('MONGO_INITDB_ROOT_PASSWORD') || probe.includes('print(result')) {
    throw new Error('anonymous probe can print a credential or the read result');
  }
});

test('isolated T01 uses distinct names and does not remove the live volume', () => {
  const compose = read('compose.t01.yaml');
  const script = read('mongo-t01-isolated.sh');
  if (
    compose.includes('commercecore-mongo-data') ||
    compose.includes('container_name: commercecore-mongo\n')
  ) {
    throw new Error('isolated compose names the live volume or container');
  }
  if (!compose.includes('name: commercecore-mongo-t01-data')) {
    throw new Error('isolated compose does not pin its own volume');
  }
  if (!compose.includes('container_name: commercecore-mongo-t01')) {
    throw new Error('isolated compose does not pin its own container');
  }
  if (!compose.includes('name: commercecore-mongo-t01\n') || compose.includes('internal: true')) {
    throw new Error('isolated network is not the dedicated non-internal bridge');
  }
  if (!compose.includes('127.0.0.1:${MONGO_T01_PUBLISH_PORT:-27018}:27017')) {
    throw new Error('isolated publish is not loopback port 27018');
  }
  for (const forbidden of ['--fresh', 'mongo-smoke.sh', 'mongo-up.sh', 'mongo-down.sh']) {
    if (script.includes(forbidden)) {
      throw new Error(`isolated script references ${forbidden}`);
    }
  }
  if (!script.includes('LIVE_VOLUME=commercecore-mongo-data')) {
    throw new Error('isolated script does not name the live volume as protected');
  }
  const plan = run('mongo-t01-isolated.sh', [], { MONGO_T01_PLAN_ONLY: '1' });
  if (plan.status !== 0) {
    throw new Error(`plan exited ${plan.status}\n${plan.stderr}`);
  }
  for (const line of [
    'volume=commercecore-mongo-t01-data',
    'container=commercecore-mongo-t01',
    'network=commercecore-mongo-t01',
    'port=27018',
    'project=commercecore-mongo-t01',
  ]) {
    if (!plan.stdout.includes(line)) {
      throw new Error(`plan missing ${line}\n${plan.stdout}`);
    }
  }
  if (plan.stdout.includes('runtime=') && plan.stdout.includes('/tmp/mongo\n')) {
    throw new Error(`plan uses the live runtime directory\n${plan.stdout}`);
  }
  const livePort = run('mongo-t01-isolated.sh', [], {
    MONGO_T01_PLAN_ONLY: '1',
    MONGO_T01_PUBLISH_PORT: '27017',
  });
  if (livePort.status !== 1) {
    throw new Error('isolated T01 accepted the live port');
  }
  const liveRuntime = run('mongo-t01-isolated.sh', [], {
    MONGO_T01_PLAN_ONLY: '1',
    MONGO_T01_RUNTIME_DIR: path.resolve(here, '../../tmp/mongo'),
  });
  if (liveRuntime.status !== 1) {
    throw new Error('isolated T01 accepted the live runtime directory');
  }
  const docker = fakeDocker();
  const env = writeEnv(
    'MONGO_INITDB_ROOT_USERNAME="local-operator"\nMONGO_INITDB_ROOT_PASSWORD="local-test-credential"\n',
  );
  const runtime = mkdtempSync(path.join(tmpdir(), 'mongo-t01-runtime-'));
  try {
    const result = run('mongo-t01-isolated.sh', [], {
      MONGO_ENV_FILE: env.file,
      MONGO_DOCKER_BIN: docker.bin,
      MONGO_T01_RUNTIME_DIR: runtime,
    });
    if (result.status !== 2 || !result.stdout.includes('WAITING_OWNER_LOCAL')) {
      throw new Error(
        `isolated T01 expected exit 2, got ${result.status}\n${result.stdout}\n${result.stderr}`,
      );
    }
    const log = readFileSync(docker.log, 'utf8');
    if (log.includes('down') || log.includes('volume') || log.includes('rm')) {
      throw new Error(`isolated T01 called docker past the daemon check:\n${log}`);
    }
  } finally {
    rmSync(docker.dir, { recursive: true, force: true });
    rmSync(env.dir, { recursive: true, force: true });
    rmSync(runtime, { recursive: true, force: true });
  }
});
