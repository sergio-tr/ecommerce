import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { chmodSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  assertHealthBody,
  assertHealthProbes,
  assertProbeLog,
  assessCluster,
  clusterIsListed,
  clusterTargets,
  probePodManifest,
} from './two-replica-contract.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const script = path.join(root, 'tools/k8s/k3d-two-replica-smoke.sh');
const probe = path.join(root, 'tools/k8s/two-replica-probe.mjs');
const nodeDir = path.dirname(process.execPath);
const healthBody = JSON.stringify({
  dependenciesChecked: false,
  probe: 'liveness',
  service: 'commercecore-api',
  status: 'live',
  version: '0.0.0',
});

function labels() {
  return {
    'app.kubernetes.io/name': 'commercecore-api',
    'app.kubernetes.io/instance': 'commercecore-api',
  };
}

function pod(name, ip, ready = true) {
  return {
    metadata: { name, labels: labels() },
    status: {
      podIP: ip,
      conditions: [{ type: 'Ready', status: ready ? 'True' : 'False' }],
    },
  };
}

function liveService() {
  return {
    spec: {
      type: 'ClusterIP',
      clusterIP: '10.43.0.10',
      ports: [{ port: 3000 }],
      selector: labels(),
    },
  };
}

function balancedReport() {
  return {
    nodes: { items: [{}] },
    pods: { items: [pod('api-0', '10.0.0.1'), pod('api-1', '10.0.0.2')] },
    endpoints: {
      subsets: [{ addresses: [{ ip: '10.0.0.1' }, { ip: '10.0.0.2' }], notReadyAddresses: [] }],
    },
    service: liveService(),
    serviceCurls: 8,
    podCurls: 2,
  };
}

function writeShim(dir, name, body) {
  const file = path.join(dir, name);
  writeFileSync(file, body);
  chmodSync(file, 0o755);
}

function runScript(bin, extra = {}) {
  const log = path.join(bin, 'calls.log');
  writeFileSync(log, '');
  const result = spawnSync('bash', [script], {
    encoding: 'utf8',
    env: {
      ...process.env,
      PATH: `${bin}${path.delimiter}${nodeDir}${path.delimiter}/usr/bin`,
      HOME: process.env.HOME,
      ...extra,
    },
  });
  return { ...result, calls: readFileSync(log, 'utf8') };
}

test('the harness source refuses a preexisting cluster and stays on loopback', () => {
  const source = readFileSync(script, 'utf8');
  assert.match(source, /CLUSTER_NAME=commercecore-two-replica/);
  assert.match(source, /--servers 1/);
  assert.match(source, /--agents 0/);
  assert.match(source, /--disable=traefik@server:0/);
  assert.match(source, /--api-port "127\.0\.0\.1:/);
  assert.match(source, /--kubeconfig-update-default=false/);
  assert.match(source, /--kubeconfig-switch-context=false/);
  assert.match(source, /kubectl --context "\$\{CONTEXT\}"/);
  assert.match(source, /k3d-two-replica-smoke: PASS/);
  assert.match(source, /G5: NOT_CLAIMED/);
  assert.match(source, /balance: NOT_PROVEN/);
  assert.match(source, /if \[\[ "\$\{CREATED\}" == 1 \]\]/);
  assert.doesNotMatch(source, /0\.0\.0\.0/);
  assert.doesNotMatch(source, /port-forward/);
  assert.doesNotMatch(source, /commercecore-local/);
  assert.doesNotMatch(source, /commercecore-mongo/);
  assert.doesNotMatch(source, /volume rm|down -v|--fresh/);
  assert.doesNotMatch(source, /config use-context/);
});

test('missing docker stays pending and does not call k3d', () => {
  const bin = mkdtempSync(path.join(tmpdir(), 'k3d-shim-'));
  const tools = mkdtempSync(path.join(tmpdir(), 'k3d-tools-'));
  for (const name of ['bash', 'mktemp', 'rm', 'chmod', 'git']) {
    const found = spawnSync('/usr/bin/bash', ['-lc', `command -v ${name}`], {
      encoding: 'utf8',
    }).stdout.trim();
    symlinkSync(found, path.join(tools, name));
  }
  writeShim(bin, 'k3d', '#!/bin/sh\necho "k3d $*" >> "$(dirname "$0")/calls.log"\nexit 0\n');
  writeFileSync(path.join(bin, 'calls.log'), '');
  const result = spawnSync(path.join(tools, 'bash'), [script], {
    encoding: 'utf8',
    env: {
      PATH: `${bin}${path.delimiter}${tools}${path.delimiter}${nodeDir}`,
      HOME: process.env.HOME,
    },
  });
  assert.equal(result.status, 2);
  assert.match(result.stdout, /k3d-two-replica-smoke: PENDING_OWNER_LOCAL/);
  assert.match(result.stdout, /G5: NOT_CLAIMED/);
  assert.match(result.stdout, /runtime: NOT_RUN/);
  assert.doesNotMatch(`${result.stdout}\n${result.stderr}`, /k3d-two-replica-smoke: PASS/);
  assert.equal(readFileSync(path.join(bin, 'calls.log'), 'utf8'), '');
});

test('an unreachable docker daemon stays pending', () => {
  const bin = mkdtempSync(path.join(tmpdir(), 'k3d-shim-'));
  writeShim(
    bin,
    'docker',
    '#!/bin/sh\necho "docker $*" >> "$(dirname "$0")/calls.log"\n[ "$1" = info ] && exit 1\nexit 0\n',
  );
  writeShim(bin, 'k3d', '#!/bin/sh\necho "k3d $*" >> "$(dirname "$0")/calls.log"\nexit 0\n');
  const result = runScript(bin);
  assert.equal(result.status, 2);
  assert.match(result.stdout, /PENDING_OWNER_LOCAL/);
  assert.match(result.stdout, /runtime: NOT_RUN/);
  assert.doesNotMatch(result.calls, /k3d cluster create/);
  assert.doesNotMatch(result.calls, /k3d cluster delete/);
  assert.doesNotMatch(result.stdout, /k3d-two-replica-smoke: PASS/);
});

test('an existing cluster name fails closed without create or delete', () => {
  const bin = mkdtempSync(path.join(tmpdir(), 'k3d-shim-'));
  writeShim(bin, 'docker', '#!/bin/sh\necho "docker $*" >> "$(dirname "$0")/calls.log"\nexit 0\n');
  writeShim(
    bin,
    'k3d',
    [
      '#!/bin/sh',
      'echo "k3d $*" >> "$(dirname "$0")/calls.log"',
      'if [ "$1" = cluster ] && [ "$2" = list ]; then',
      '  printf \'%s\\n\' \'[{"name":"commercecore-two-replica"}]\'',
      'fi',
      'exit 0',
      '',
    ].join('\n'),
  );
  for (const name of ['kubectl', 'helm']) {
    writeShim(bin, name, '#!/bin/sh\necho "$0 $*" >> "$(dirname "$0")/calls.log"\nexit 0\n');
  }
  const result = runScript(bin);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /cluster commercecore-two-replica already exists/);
  assert.match(result.stderr, /k3d-two-replica-smoke: FAIL/);
  assert.match(result.stderr, /runtime: NOT_RUN/);
  assert.match(result.stderr, /G5: NOT_CLAIMED/);
  assert.doesNotMatch(result.calls, /cluster create/);
  assert.doesNotMatch(result.calls, /cluster delete/);
  assert.doesNotMatch(result.calls, /docker build/);
  assert.doesNotMatch(`${result.stdout}\n${result.stderr}`, /k3d-two-replica-smoke: PASS/);
});

test('one ready endpoint, an unready pod, a wrong selector, and a bad body fail', () => {
  const report = balancedReport();
  assert.throws(
    () =>
      assessCluster({
        ...report,
        endpoints: { subsets: [{ addresses: [{ ip: '10.0.0.1' }], notReadyAddresses: [] }] },
      }),
    /2 ready endpoints/,
  );
  assert.throws(
    () =>
      assessCluster({
        ...report,
        pods: { items: [pod('api-0', '10.0.0.1'), pod('api-1', '10.0.0.2', false)] },
      }),
    /expected 2 ready pods, found 1/,
  );
  const mismatched = balancedReport();
  mismatched.service.spec.selector['app.kubernetes.io/name'] = 'other';
  assert.throws(() => assessCluster(mismatched), /expected 2 ready pods, found 0/);
  assert.throws(() => clusterTargets(mismatched), /expected 2 ready pods, found 0/);
  assert.throws(() => assertHealthBody('{"status":"live","pod":"api-0"}'), /unexpected fields/);
  assert.throws(() => assertHealthProbes('kind: Deployment\n'), /missing readinessProbe/);
});

test('targets and the probe manifest stay on the in-cluster health port', () => {
  const targets = clusterTargets({
    pods: { items: [pod('api-0', '10.0.0.1'), pod('api-1', '10.0.0.2')] },
    service: liveService(),
  });
  assert.deepEqual(targets.podUrls, [
    'http://10.0.0.1:3000/health/live',
    'http://10.0.0.2:3000/health/live',
  ]);
  const manifest = probePodManifest(targets);
  assert.equal(manifest.spec.hostNetwork, false);
  assert.equal(manifest.spec.automountServiceAccountToken, false);
  assert.equal(manifest.spec.containers[0].imagePullPolicy, 'Never');
  assert.equal(manifest.spec.containers[0].securityContext.privileged, undefined);
  assert.deepEqual(
    manifest.spec.containers[0].env.map((item) => item.name),
    ['HOME'],
  );
  assert.equal(manifest.spec.containers[0].args.length, 10);
  assert.equal(
    manifest.spec.containers[0].args.filter((url) => url === targets.serviceUrl).length,
    8,
  );
  assert.equal(manifest.metadata.labels['app.kubernetes.io/name'], undefined);
  const log = `${Array.from({ length: 10 }, () => `200\t${healthBody}`).join('\n')}\n`;
  assert.doesNotThrow(() => assertProbeLog(log, targets));
  assert.throws(() => assertProbeLog(`500\t${healthBody}\n`, targets), /probe lines/);
  assert.equal(
    clusterIsListed([{ name: 'commercecore-local' }], 'commercecore-two-replica'),
    false,
  );
  assert.equal(
    clusterIsListed([{ name: 'commercecore-two-replica' }], 'commercecore-two-replica'),
    true,
  );
});

test('the probe accepts only its health url and does not echo a rejected target', async () => {
  const rejected = spawnSync(process.execPath, [probe, 'http://example.test/health/live'], {
    encoding: 'utf8',
  });
  assert.equal(rejected.status, 1);
  assert.match(rejected.stdout, /^0\trejected-url\n$/);
  assert.doesNotMatch(rejected.stdout, /example\.test/);

  const server = createServer((request, response) => {
    if (request.url === '/health/live') {
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end(healthBody);
      return;
    }
    response.writeHead(404);
    response.end('missing');
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const child = spawn(process.execPath, [probe, `http://127.0.0.1:${address.port}/health/live`], {
    env: { ...process.env, COMMERCECORE_PROBE_PORT: String(address.port) },
  });
  let stdout = '';
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (chunk) => {
    stdout += chunk;
  });
  const status = await new Promise((resolve) => child.on('close', resolve));
  server.close();
  assert.equal(status, 0);
  assert.equal(stdout, `200\t${healthBody}\n`);
});
