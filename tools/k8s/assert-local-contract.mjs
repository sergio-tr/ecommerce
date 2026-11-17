import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const chart = path.join(root, 'deploy/helm/commercecore-api');
const nodeDigest = 'sha256:01d566e8d94d8c619591d78652babfccd3c6992a3dffa9ed5ab39e11cf6c70e9';

export function assertDockerfile() {
  const text = readFileSync(path.join(root, 'Dockerfile'), 'utf8');
  const fromLines = text.split('\n').filter((line) => line.startsWith('FROM '));
  if (fromLines.length !== 2) {
    throw new Error(`expected two FROM lines, found ${fromLines.length}`);
  }
  for (const line of fromLines) {
    if (!line.includes(`@${nodeDigest}`)) {
      throw new Error(`FROM is not pinned to the recorded Node digest: ${line}`);
    }
  }
  if (!text.includes('\nUSER node\n')) {
    throw new Error('runtime stage does not switch to the node user');
  }
  if (/^ENV\s+COMMERCECORE_HTTP_HOST=/m.test(text)) {
    throw new Error('the image must not choose the listen host; the chart does');
  }
  const ignored = readFileSync(path.join(root, '.dockerignore'), 'utf8');
  if (!ignored.includes('**/.env') || !ignored.includes('node_modules')) {
    throw new Error('.dockerignore does not exclude env files and node_modules');
  }
}

export function renderChart(extraArgs = []) {
  const helm = process.env.HELM_BIN ?? 'helm';
  return spawnSync(helm, ['template', 'commercecore-api', chart, ...extraArgs], {
    encoding: 'utf8',
  });
}

export function assertDefaultRender(rendered) {
  const documents = rendered
    .split(/^---$/m)
    .map((document) => document.trim())
    .filter((document) => document.length > 0);
  const kinds = documents.map((document) => {
    const match = document.match(/^kind:\s*(\S+)/m);
    return match ? match[1] : '';
  });
  for (const forbidden of ['Ingress', 'Secret', 'NetworkPolicy']) {
    if (kinds.includes(forbidden)) {
      throw new Error(`rendered chart includes ${forbidden}`);
    }
  }
  for (const required of ['Deployment', 'Service', 'ServiceAccount']) {
    if (!kinds.includes(required)) {
      throw new Error(`rendered chart is missing ${required}`);
    }
  }
  const requiredLines = [
    'type: ClusterIP',
    'value: "0.0.0.0"',
    'path: /health/live',
    'runAsNonRoot: true',
    'runAsUser: 1000',
    'readOnlyRootFilesystem: true',
    'allowPrivilegeEscalation: false',
    'automountServiceAccountToken: false',
    'imagePullPolicy: Never',
    'image: "commercecore-api:local"',
  ];
  for (const line of requiredLines) {
    if (!rendered.includes(line)) {
      throw new Error(`rendered chart is missing ${line}`);
    }
  }
  if ((rendered.match(/path: \/health\/live/g) ?? []).length !== 2) {
    throw new Error('expected liveness and readiness probes on /health/live');
  }
  for (const forbidden of [
    'hostPort',
    'NodePort',
    'LoadBalancer',
    'hostNetwork: true',
    'sk_live_',
    'sk_test_',
  ]) {
    if (rendered.includes(forbidden)) {
      throw new Error(`rendered chart includes ${forbidden}`);
    }
  }
}

export function assertRejectedOverride(args) {
  const result = renderChart(args);
  if (result.status === 0) {
    throw new Error(`helm accepted a forbidden override: ${args.join(' ')}`);
  }
}
