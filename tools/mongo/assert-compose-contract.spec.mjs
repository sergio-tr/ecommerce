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
  'compose.t01-isolated.yaml',
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
  'assert-isolated-config.js',
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

function isolatedConfig(overrides = {}) {
  const config = {
    name: 'commercecore-mongo-t01',
    services: {
      mongo: {
        hostname: 'mongo',
        image: pinnedImage,
        container_name: 'commercecore-mongo-t01',
        ports: [{ host_ip: '127.0.0.1', published: '27018', target: 27017, protocol: 'tcp' }],
        environment: { MONGO_INITDB_ROOT_PASSWORD: 'isolated-test-credential' },
      },
    },
    networks: { private: { name: 'commercecore-mongo-t01', internal: false } },
    volumes: { 'commercecore-mongo-data': { name: 'commercecore-mongo-t01-data' } },
  };
  return {
    ...config,
    ...overrides,
    services: { ...config.services, ...(overrides.services ?? {}) },
  };
}

function checkIsolatedConfig(config) {
  return spawnSync(process.execPath, [path.join(here, 'assert-isolated-config.js')], {
    input: JSON.stringify(config),
    encoding: 'utf8',
  });
}

test('the isolated config checker accepts only the separate loopback project', () => {
  const marker = 'isolated-test-credential';
  const accepted = checkIsolatedConfig(isolatedConfig());
  if (accepted.status !== 0) {
    throw new Error(`valid config exited ${accepted.status}\n${accepted.stderr}`);
  }
  if (
    !accepted.stdout.includes('volume=commercecore-mongo-t01-data') ||
    !accepted.stdout.includes('port=127.0.0.1:27018') ||
    accepted.stdout.includes(marker) ||
    accepted.stderr.includes(marker)
  ) {
    throw new Error(`checker printed a secret or the wrong summary\n${accepted.stdout}`);
  }
  const shortPort = isolatedConfig();
  shortPort.services.mongo.ports = ['127.0.0.1:27018:27017'];
  if (checkIsolatedConfig(shortPort).status !== 0) {
    throw new Error('short loopback port syntax was rejected');
  }
  const numeric = isolatedConfig();
  numeric.services.mongo.ports = [{ host_ip: '127.0.0.1', published: 27018, target: 27017 }];
  if (checkIsolatedConfig(numeric).status !== 0) {
    throw new Error('numeric published port was rejected');
  }
  const cases = [
    [
      'owner volume',
      { volumes: { 'commercecore-mongo-data': { name: 'commercecore-mongo-data' } } },
    ],
    [
      'published owner port',
      {
        services: {
          mongo: {
            ...isolatedConfig().services.mongo,
            ports: [{ host_ip: '127.0.0.1', published: '27017', target: 27017 }],
          },
        },
      },
    ],
    [
      'public bind',
      {
        services: {
          mongo: {
            ...isolatedConfig().services.mongo,
            ports: [{ host_ip: '0.0.0.0', published: '27018', target: 27017 }],
          },
        },
      },
    ],
    [
      'second port',
      {
        services: {
          mongo: {
            ...isolatedConfig().services.mongo,
            ports: [
              { host_ip: '127.0.0.1', published: '27018', target: 27017 },
              { host_ip: '127.0.0.1', published: '27019', target: 27017 },
            ],
          },
        },
      },
    ],
    ['owner project', { name: 'commercecore-mongo' }],
    [
      'owner container',
      {
        services: {
          mongo: { ...isolatedConfig().services.mongo, container_name: 'commercecore-mongo' },
        },
      },
    ],
    [
      'internal network',
      { networks: { private: { name: 'commercecore-mongo-t01', internal: true } } },
    ],
    [
      'wrong image',
      {
        services: {
          mongo: { ...isolatedConfig().services.mongo, image: 'docker.io/library/mongo:8' },
        },
      },
    ],
  ];
  for (const [label, overrides] of cases) {
    const result = checkIsolatedConfig(isolatedConfig(overrides));
    if (result.status === 0 || result.stdout.includes(marker) || result.stderr.includes(marker)) {
      throw new Error(
        `${label} was accepted or printed a secret\n${result.stdout}${result.stderr}`,
      );
    }
  }
});

test('the isolated override does not retarget the canonical compose names', () => {
  const compose = read('compose.yaml');
  const override = read('compose.t01-isolated.yaml');
  const isolated = read('mongo-t01-isolated.sh');
  if (compose.includes('commercecore-mongo-t01')) {
    throw new Error('canonical compose contains an isolated name');
  }
  if (
    !compose.includes('name: commercecore-mongo-data') ||
    !compose.includes('container_name: commercecore-mongo')
  ) {
    throw new Error('canonical compose lost the owner resource names');
  }
  if (
    !override.includes('name: commercecore-mongo-t01-data') ||
    override.includes('name: commercecore-mongo-data') ||
    override.includes('27017') ||
    override.includes('internal: true')
  ) {
    throw new Error('isolated override publishes the owner port or names the owner volume');
  }
  const removals = isolated.split('\n').filter((line) => line.includes('down -v'));
  if (removals.length !== 1 || !removals[0].includes('t01_compose down -v')) {
    throw new Error('isolated teardown is not the single compose down for that project');
  }
  for (const forbidden of [
    'volume rm',
    'mongo-down.sh',
    'mongo-up.sh',
    'mongo-smoke.sh',
    '--destroy-volume',
    'mongo_load_credentials',
    'mongo_prepare_runtime',
  ]) {
    if (isolated.includes(forbidden)) {
      throw new Error(`isolated script contains ${forbidden}`);
    }
  }
  if (isolated.includes('mongo-infra-smoke: PASS') || !isolated.includes('t01=ISOLATED_PASS')) {
    throw new Error('isolated script can be read as a matrix pass');
  }
  if (
    read('mongo-smoke.sh').includes('mongo-t01-isolated') ||
    read('lib.sh').includes('commercecore-mongo-t01')
  ) {
    throw new Error('the owner smoke path gained the isolated project');
  }
  const downAt = isolated.indexOf('t01_compose down -v');
  const checkAt = isolated.indexOf('assert-isolated-config.js');
  if (checkAt < 0 || downAt < checkAt) {
    throw new Error('isolated teardown can run before the rendered-config check');
  }
});

function writeIsolatedDocker(mode) {
  const dir = mkdtempSync(path.join(tmpdir(), 'mongo-t01-docker-'));
  const log = path.join(dir, 'log');
  const bin = path.join(dir, 'docker');
  const fixture = path.join(dir, 'config.json');
  writeFileSync(log, '');
  writeFileSync(fixture, JSON.stringify(isolatedConfig(), null, 2));
  const success = mode === 'success';
  const failure = mode === 'failure';
  const collision = mode === 'collision';
  const lines = [
    '#!/bin/sh',
    `printf '%s\\n' "$*" >> '${log}'`,
    'case "$*" in',
    '  info) exit 0 ;;',
    '  "compose version") exit 0 ;;',
  ];
  if (collision) {
    lines.push('  "volume inspect commercecore-mongo-t01-data") exit 0 ;;');
  }
  if (success || failure) {
    lines.push(`  *"config --format json"*) cat '${fixture}'; exit 0 ;;`);
    lines.push('  *"up -d"*) exit 0 ;;');
    lines.push('  "ps -a --format {{.Names}} {{.Ports}}") exit 0 ;;');
  }
  if (failure) {
    lines.push('  *"bootstrap.sh"*) exit 10 ;;');
  }
  if (success) {
    lines.push('  *"probe-anonymous.js"*) printf \'AUTH_REJECTED\\n\'; exit 13 ;;');
    lines.push('  *"probe-write.js"*) exit 0 ;;');
    lines.push('  *"bootstrap.sh"*) exit 0 ;;');
    lines.push('  *"mongod --version"*) printf \'db version v8.0.38\\n\'; exit 0 ;;');
    lines.push(
      '  "port commercecore-mongo-t01 27017/tcp") printf \'127.0.0.1:27018\\n\'; exit 0 ;;',
    );
    lines.push('  *"down -v"*) exit 0 ;;');
  }
  lines.push('  *) exit 1 ;;', 'esac');
  writeFileSync(bin, `${lines.join('\n')}\n`, { mode: 0o755 });
  return { dir, log, bin };
}

test('isolated T01 refuses arguments and a missing daemon without deleting a volume', () => {
  const docker = fakeDocker();
  try {
    const fresh = run('mongo-t01-isolated.sh', ['--fresh'], { MONGO_DOCKER_BIN: docker.bin });
    if (fresh.status !== 1 || !fresh.stderr.includes('nothing was deleted')) {
      throw new Error(`--fresh exited ${fresh.status}\n${fresh.stderr}`);
    }
    const missing = run('mongo-t01-isolated.sh', [], { MONGO_DOCKER_BIN: docker.bin });
    if (missing.status !== 2 || !missing.stdout.includes('WAITING_OWNER_LOCAL')) {
      throw new Error(
        `missing daemon exited ${missing.status}\n${missing.stdout}\n${missing.stderr}`,
      );
    }
    const log = readFileSync(docker.log, 'utf8');
    if (log.includes('volume') || log.includes('down') || log.includes('up -d')) {
      throw new Error(`docker was used past the daemon check:\n${log}`);
    }
  } finally {
    rmSync(docker.dir, { recursive: true, force: true });
  }
});

test('an existing isolated volume stops the clean T01 before compose up', () => {
  const docker = writeIsolatedDocker('collision');
  const runtime = mkdtempSync(path.join(tmpdir(), 'mongo-t01-runtime-'));
  try {
    const result = run('mongo-t01-isolated.sh', [], {
      MONGO_DOCKER_BIN: docker.bin,
      MONGO_T01_RUNTIME_DIR: runtime,
    });
    if (
      result.status !== 1 ||
      !result.stderr.includes('already exists') ||
      !result.stderr.includes('was not deleted')
    ) {
      throw new Error(`collision exited ${result.status}\n${result.stdout}\n${result.stderr}`);
    }
    const log = readFileSync(docker.log, 'utf8');
    if (log.includes('up -d') || log.includes('down -v') || log.includes('volume rm')) {
      throw new Error(`collision mutated docker:\n${log}`);
    }
  } finally {
    rmSync(docker.dir, { recursive: true, force: true });
    rmSync(runtime, { recursive: true, force: true });
  }
});

test('a failed isolated bootstrap does not remove the project it started', () => {
  const docker = writeIsolatedDocker('failure');
  const runtime = mkdtempSync(path.join(tmpdir(), 'mongo-t01-runtime-'));
  try {
    const result = run('mongo-t01-isolated.sh', [], {
      MONGO_DOCKER_BIN: docker.bin,
      MONGO_T01_RUNTIME_DIR: runtime,
      MONGO_T01_BOOTSTRAP_ATTEMPTS: '1',
      MONGO_T01_MONGOSH_ATTEMPTS: '1',
    });
    if (
      result.status !== 1 ||
      !result.stderr.includes('bootstrap rejected the replica set shape') ||
      !result.stderr.includes('were not deleted')
    ) {
      throw new Error(
        `failed bootstrap exited ${result.status}\n${result.stdout}\n${result.stderr}`,
      );
    }
    const log = readFileSync(docker.log, 'utf8');
    if (!log.includes('up -d') || log.includes('down -v') || log.includes('volume rm')) {
      throw new Error(`failed bootstrap removed or skipped the project:\n${log}`);
    }
    if (
      result.stdout.includes('isolated-test-credential') ||
      result.stderr.includes('isolated-test-credential')
    ) {
      throw new Error('failed bootstrap printed the rendered credential');
    }
  } finally {
    rmSync(docker.dir, { recursive: true, force: true });
    rmSync(runtime, { recursive: true, force: true });
  }
});

test('a fake isolated T01 passes only its own project and removes only that project', () => {
  const docker = writeIsolatedDocker('success');
  const runtime = mkdtempSync(path.join(tmpdir(), 'mongo-t01-runtime-'));
  const ownerEnv = path.join(here, '..', '..', '.env.local');
  const ownerKey = path.join(here, '..', '..', 'tmp', 'mongo', 'keyfile');
  const ownerEnvBefore = exists(ownerEnv);
  const ownerKeyBefore = exists(ownerKey);
  try {
    const result = run('mongo-t01-isolated.sh', [], {
      MONGO_DOCKER_BIN: docker.bin,
      MONGO_T01_RUNTIME_DIR: runtime,
      MONGO_T01_BOOTSTRAP_ATTEMPTS: '1',
      MONGO_T01_MONGOSH_ATTEMPTS: '1',
    });
    if (result.status !== 0) {
      throw new Error(`isolated pass exited ${result.status}\n${result.stdout}\n${result.stderr}`);
    }
    for (const token of [
      't01=ISOLATED_PASS',
      't02-t09=NOT_RUN',
      'matrix=NOT_CLAIMED',
      'g5: NOT_CLAIMED',
      'owner volume unchanged',
      'isolated volume removed',
      'port 127.0.0.1:27018',
      'v8.0.38',
    ]) {
      if (!result.stdout.includes(token)) {
        throw new Error(`missing ${token}\n${result.stdout}`);
      }
    }
    if (
      result.stdout.includes('mongo-infra-smoke: PASS') ||
      result.stdout.includes('isolated-test-credential') ||
      result.stderr.includes('isolated-test-credential') ||
      result.stderr.includes('owner resources changed') ||
      result.stderr.includes('were not deleted')
    ) {
      throw new Error(
        `isolated pass claimed too much or leaked a secret\n${result.stdout}\n${result.stderr}`,
      );
    }
    const downs = readFileSync(docker.log, 'utf8')
      .split('\n')
      .filter((line) => line.includes('down -v'));
    if (downs.length !== 1 || downs[0].includes('commercecore-mongo-data')) {
      throw new Error(`teardown log was not the isolated project:\n${downs.join('\n')}`);
    }
    if (exists(path.join(runtime, 'runtime.env')) || exists(path.join(runtime, 'keyfile'))) {
      throw new Error('isolated runtime secrets were left behind');
    }
    if (exists(ownerEnv) !== ownerEnvBefore || exists(ownerKey) !== ownerKeyBefore) {
      throw new Error('owner credential files changed');
    }
  } finally {
    rmSync(docker.dir, { recursive: true, force: true });
    rmSync(runtime, { recursive: true, force: true });
  }
});

function exists(file) {
  try {
    readFileSync(file);
    return true;
  } catch {
    return false;
  }
}
