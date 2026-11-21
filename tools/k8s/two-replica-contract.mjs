import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const expectedHealthKeys = ['dependenciesChecked', 'probe', 'service', 'status', 'version'];

function documents(rendered) {
  return rendered
    .split(/^---$/m)
    .map((document) => document.trim())
    .filter((document) => document.length > 0);
}

function documentByKind(rendered, kind) {
  const found = documents(rendered).filter((document) => {
    const match = document.match(/^kind:\s*(\S+)/m);
    return match?.[1] === kind;
  });
  if (found.length !== 1) {
    throw new Error(`expected one ${kind}, found ${found.length}`);
  }
  return found[0];
}

function labelBlock(document, header) {
  const lines = document.split('\n');
  const start = lines.findIndex((line) => header.test(line));
  if (start < 0) {
    throw new Error(`missing label block ${header}`);
  }
  const indent = lines[start].match(/^ */)?.[0].length ?? 0;
  const labels = {};
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.trim() === '') {
      continue;
    }
    const lineIndent = line.match(/^ */)?.[0].length ?? 0;
    if (lineIndent <= indent) {
      break;
    }
    const match = line.trim().match(/^([A-Za-z0-9./-]+):\s*(.+)$/);
    if (!match) {
      throw new Error(`unexpected label line: ${line.trim()}`);
    }
    labels[match[1]] = match[2].replaceAll('"', '');
  }
  if (Object.keys(labels).length === 0) {
    throw new Error(`empty label block ${header}`);
  }
  return labels;
}

function sameMap(left, right) {
  const leftKeys = Object.keys(left).sort();
  const rightKeys = Object.keys(right).sort();
  if (leftKeys.length !== rightKeys.length) {
    return false;
  }
  return leftKeys.every((key, index) => key === rightKeys[index] && left[key] === right[key]);
}

export function assertReplicaCount(rendered, count) {
  const deployment = documentByKind(rendered, 'Deployment');
  const matches = deployment.match(/^ {2}replicas: (\d+)$/gm) ?? [];
  if (matches.length !== 1 || matches[0] !== `  replicas: ${count}`) {
    throw new Error(`expected replicas: ${count}`);
  }
}

export function assertSelectorsAligned(rendered) {
  const deployment = documentByKind(rendered, 'Deployment');
  const service = documentByKind(rendered, 'Service');
  const selector = labelBlock(deployment, /^ {4}matchLabels:$/);
  const podLabels = labelBlock(deployment, /^ {6}labels:$/);
  const serviceSelector = labelBlock(service, /^ {2}selector:$/);
  if (!sameMap(selector, podLabels) || !sameMap(selector, serviceSelector)) {
    throw new Error('deployment selector, pod labels, and service selector differ');
  }
  if (selector['app.kubernetes.io/name'] !== 'commercecore-api') {
    throw new Error('service selector does not name commercecore-api');
  }
  if (!selector['app.kubernetes.io/instance']) {
    throw new Error('service selector is missing the release instance');
  }
}

export function assertHealthProbes(rendered) {
  const deployment = documentByKind(rendered, 'Deployment');
  if (!deployment.includes('\n          readinessProbe:\n')) {
    throw new Error('missing readinessProbe');
  }
  if (!deployment.includes('\n          livenessProbe:\n')) {
    throw new Error('missing livenessProbe');
  }
  const paths = deployment.match(/path: \/health\/live/g) ?? [];
  if (paths.length !== 2) {
    throw new Error('expected readiness and liveness on /health/live');
  }
}

export function assertRollbackGuard(rendered) {
  const deployment = documentByKind(rendered, 'Deployment');
  if (!deployment.includes('\n    type: RollingUpdate\n')) {
    throw new Error('expected RollingUpdate');
  }
  if (!deployment.includes('\n      maxSurge: 1\n')) {
    throw new Error('expected maxSurge: 1');
  }
  if (!deployment.includes('\n      maxUnavailable: 0\n')) {
    throw new Error('expected maxUnavailable: 0');
  }
  if (deployment.includes('podAntiAffinity')) {
    throw new Error('podAntiAffinity would block two pods on one server');
  }
}

export function assertHealthBody(body) {
  const value = typeof body === 'string' ? JSON.parse(body) : body;
  const keys = Object.keys(value).sort();
  if (keys.join(',') !== expectedHealthKeys.join(',')) {
    throw new Error('health body has unexpected fields');
  }
  if (
    value.status !== 'live' ||
    value.service !== 'commercecore-api' ||
    value.probe !== 'liveness' ||
    value.dependenciesChecked !== false ||
    typeof value.version !== 'string' ||
    value.version.length === 0
  ) {
    throw new Error('health body is not the liveness payload');
  }
}

function isReady(pod) {
  return (pod.status?.conditions ?? []).some(
    (condition) => condition.type === 'Ready' && condition.status === 'True',
  );
}

function labelsMatch(labels, selector) {
  return Object.entries(selector).every(([key, value]) => labels?.[key] === value);
}

export function assessCluster({ nodes, pods, endpoints, service, serviceCurls, podCurls }) {
  const serverCount = nodes.items?.length ?? 0;
  if (serverCount !== 1) {
    throw new Error(`expected 1 k3d server, found ${serverCount}`);
  }
  if (service.spec?.type !== 'ClusterIP') {
    throw new Error('service is not ClusterIP');
  }
  const selector = service.spec?.selector ?? {};
  const selected = (pods.items ?? []).filter((pod) => labelsMatch(pod.metadata?.labels, selector));
  const ready = selected.filter((pod) => isReady(pod));
  const notReady = selected.filter((pod) => !isReady(pod));
  const addresses = (endpoints.subsets ?? []).flatMap((subset) => subset.addresses ?? []);
  const notReadyAddresses = (endpoints.subsets ?? []).flatMap(
    (subset) => subset.notReadyAddresses ?? [],
  );
  if (ready.length !== 2) {
    throw new Error(`expected 2 ready pods, found ${ready.length}`);
  }
  if (notReady.length !== 0) {
    throw new Error(`expected no unready selected pods, found ${notReady.length}`);
  }
  if (addresses.length !== 2 || notReadyAddresses.length !== 0) {
    throw new Error(
      `expected 2 ready endpoints and no unready endpoints, found ${addresses.length} ready and ${notReadyAddresses.length} unready`,
    );
  }
  const readyIps = new Set(ready.map((pod) => pod.status?.podIP));
  const addressIps = new Set(addresses.map((address) => address.ip));
  for (const ip of readyIps) {
    if (!addressIps.has(ip)) {
      throw new Error(`ready pod ${ip} is missing from service endpoints`);
    }
  }
  for (const ip of addressIps) {
    if (!readyIps.has(ip)) {
      throw new Error(`endpoint ${ip} is not a ready selected pod`);
    }
  }
  if (serviceCurls < 8) {
    throw new Error(`expected at least 8 ClusterIP probes, found ${serviceCurls}`);
  }
  if (podCurls !== 2) {
    throw new Error(`expected one probe on each ready pod, found ${podCurls}`);
  }
}

const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/;
const healthUrlPattern =
  /^http:\/\/(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d):3000\/health\/live$/;

export function clusterIsListed(payload, name) {
  const items = Array.isArray(payload) ? payload : payload?.clusters;
  if (!Array.isArray(items)) {
    throw new Error('k3d cluster list was not a list');
  }
  return items.some((item) => item?.name === name);
}

export function clusterTargets({ pods, service }) {
  if (service.spec?.type !== 'ClusterIP') {
    throw new Error('service is not ClusterIP');
  }
  const port = service.spec?.ports?.[0]?.port;
  if (port !== 3000) {
    throw new Error('service port is not 3000');
  }
  const clusterIP = service.spec?.clusterIP;
  if (typeof clusterIP !== 'string' || !ipv4Pattern.test(clusterIP)) {
    throw new Error('service clusterIP is not an IPv4 address');
  }
  const selector = service.spec?.selector ?? {};
  const selected = (pods.items ?? []).filter((pod) => labelsMatch(pod.metadata?.labels, selector));
  const ready = selected.filter((pod) => isReady(pod));
  if (ready.length !== 2) {
    throw new Error(`expected 2 ready pods, found ${ready.length}`);
  }
  const podUrls = ready.map((pod) => {
    const ip = pod.status?.podIP;
    if (typeof ip !== 'string' || !ipv4Pattern.test(ip)) {
      throw new Error('ready pod has no IPv4 address');
    }
    return `http://${ip}:3000/health/live`;
  });
  return {
    serviceUrl: `http://${clusterIP}:3000/health/live`,
    podUrls,
  };
}

export function probePodManifest(targets) {
  const urls = [...Array.from({ length: 8 }, () => targets.serviceUrl), ...targets.podUrls];
  if (targets.podUrls?.length !== 2 || urls.length !== 10) {
    throw new Error('expected 8 service probes and 2 pod probes');
  }
  if (urls.some((url) => !healthUrlPattern.test(url))) {
    throw new Error('probe url is not an in-cluster health address');
  }
  return {
    apiVersion: 'v1',
    kind: 'Pod',
    metadata: {
      name: 'commercecore-two-replica-probe',
      namespace: 'commerce-apps',
      labels: {
        'app.kubernetes.io/component': 'two-replica-probe',
      },
    },
    spec: {
      restartPolicy: 'Never',
      automountServiceAccountToken: false,
      hostNetwork: false,
      containers: [
        {
          name: 'probe',
          image: 'commercecore-api:local',
          imagePullPolicy: 'Never',
          command: ['node', '/probe/two-replica-probe.mjs'],
          args: urls,
          env: [{ name: 'HOME', value: '/tmp' }],
          securityContext: {
            runAsNonRoot: true,
            runAsUser: 1000,
            runAsGroup: 1000,
            allowPrivilegeEscalation: false,
            readOnlyRootFilesystem: true,
            capabilities: { drop: ['ALL'] },
          },
          volumeMounts: [
            { name: 'probe', mountPath: '/probe', readOnly: true },
            { name: 'tmp', mountPath: '/tmp' },
          ],
        },
      ],
      volumes: [
        {
          name: 'probe',
          configMap: { name: 'commercecore-two-replica-probe' },
        },
        { name: 'tmp', emptyDir: {} },
      ],
    },
  };
}

export function assertProbeLog(log, targets) {
  const lines = log.split('\n').filter((line) => line.length > 0);
  const urls = [...Array.from({ length: 8 }, () => targets.serviceUrl), ...targets.podUrls];
  if (lines.length !== urls.length) {
    throw new Error(`expected ${urls.length} probe lines, found ${lines.length}`);
  }
  for (const line of lines) {
    const tab = line.indexOf('\t');
    if (tab < 0) {
      throw new Error('probe line has no status');
    }
    const status = line.slice(0, tab);
    const body = line.slice(tab + 1);
    if (status !== '200') {
      throw new Error(`probe status is not 200`);
    }
    if (urls.some((url) => body.includes(url))) {
      throw new Error('probe body echoes a target url');
    }
    assertHealthBody(body);
  }
}

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

function runCli(argv) {
  const [command, ...args] = argv;
  if (command === 'check-health') {
    assertHealthBody(readFileSync(args[0], 'utf8'));
    return;
  }
  if (command === 'check-cluster') {
    const [nodes, pods, endpoints, service, serviceCurls, podCurls] = args;
    assessCluster({
      nodes: readJson(nodes),
      pods: readJson(pods),
      endpoints: readJson(endpoints),
      service: readJson(service),
      serviceCurls: Number(serviceCurls),
      podCurls: Number(podCurls),
    });
    return;
  }
  if (command === 'cluster-exists') {
    const listed = clusterIsListed(readJson(args[1]), args[0]);
    process.exit(listed ? 0 : 2);
  }
  if (command === 'print-targets') {
    process.stdout.write(
      `${JSON.stringify(clusterTargets({ pods: readJson(args[0]), service: readJson(args[1]) }))}\n`,
    );
    return;
  }
  if (command === 'write-probe-pod') {
    process.stdout.write(`${JSON.stringify(probePodManifest(readJson(args[0])))}\n`);
    return;
  }
  if (command === 'check-probe-log') {
    assertProbeLog(readFileSync(args[0], 'utf8'), readJson(args[1]));
    return;
  }
  throw new Error(
    'usage: two-replica-contract.mjs check-health <file> | check-cluster <nodes> <pods> <endpoints> <service> <serviceCurls> <podCurls> | cluster-exists <name> <file> | print-targets <pods> <service> | write-probe-pod <targets> | check-probe-log <log> <targets>',
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    runCli(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  }
}
