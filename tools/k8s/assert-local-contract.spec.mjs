import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  assertDefaultRender,
  assertDockerfile,
  assertRejectedOverride,
  renderChart,
} from './assert-local-contract.mjs';
import {
  assertHealthBody,
  assertHealthProbes,
  assertReplicaCount,
  assertRollbackGuard,
  assertSelectorsAligned,
  assessCluster,
} from './two-replica-contract.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const twoReplicaValues = path.join(root, 'deploy/helm/commercecore-api/values-two-replica.yaml');

test('the image pins Node and leaves the listen host to the chart', () => {
  assert.doesNotThrow(() => assertDockerfile());
});

test('the default chart is a local ClusterIP health workload', () => {
  const result = renderChart();
  assert.equal(result.status, 0, result.stderr);
  assert.doesNotThrow(() => assertDefaultRender(result.stdout));
  assert.doesNotThrow(() => assertReplicaCount(result.stdout, 1));
  assert.doesNotThrow(() => assertSelectorsAligned(result.stdout));
  assert.doesNotThrow(() => assertHealthProbes(result.stdout));
  assert.doesNotThrow(() => assertRollbackGuard(result.stdout));
});

test('the chart rejects public exposure and replica counts other than 1 or 2', () => {
  assert.doesNotThrow(() => assertRejectedOverride(['--set', 'service.type=NodePort']));
  assert.doesNotThrow(() => assertRejectedOverride(['--set', 'service.type=LoadBalancer']));
  assert.doesNotThrow(() => assertRejectedOverride(['--set', 'image.pullPolicy=Always']));
  assert.doesNotThrow(() => assertRejectedOverride(['--set', 'replicaCount=0']));
  assert.doesNotThrow(() => assertRejectedOverride(['--set', 'replicaCount=3']));
  assert.doesNotThrow(() => assertRejectedOverride(['--set', 'ingress.enabled=true']));
  assert.doesNotThrow(() => assertRejectedOverride(['--set', 'enableServiceLinks=true']));
});

test('two replicas stay on ClusterIP with aligned selectors and a rollback guard', () => {
  const result = renderChart(['--values', twoReplicaValues]);
  assert.equal(result.status, 0, result.stderr);
  assert.doesNotThrow(() => assertDefaultRender(result.stdout));
  assert.doesNotThrow(() => assertReplicaCount(result.stdout, 2));
  assert.doesNotThrow(() => assertSelectorsAligned(result.stdout));
  assert.doesNotThrow(() => assertHealthProbes(result.stdout));
  assert.doesNotThrow(() => assertRollbackGuard(result.stdout));
  assert.throws(
    () =>
      assertSelectorsAligned(
        result.stdout.replace(
          '  selector:\n    app.kubernetes.io/name: commercecore-api\n',
          '  selector:\n    app.kubernetes.io/name: other\n',
        ),
      ),
    /differ/,
  );
  assert.throws(
    () => assertHealthProbes(result.stdout.replace('          readinessProbe:\n', '')),
    /missing readinessProbe/,
  );
  assert.throws(
    () => assertRollbackGuard(result.stdout.replace('maxUnavailable: 0', 'maxUnavailable: 1')),
    /maxUnavailable: 0/,
  );
});

test('the balance oracle requires both ready pods on one server', () => {
  const report = balancedReport();
  assert.doesNotThrow(() => assessCluster(report));
  assert.throws(() => assessCluster({ ...report, nodes: { items: [{}, {}] } }), /1 k3d server/);
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
        endpoints: {
          subsets: [
            {
              addresses: [{ ip: '10.0.0.1' }, { ip: '10.0.0.2' }],
              notReadyAddresses: [{ ip: '10.0.0.3' }],
            },
          ],
        },
      }),
    /unready/,
  );
  const mismatched = balancedReport();
  mismatched.service.spec.selector['app.kubernetes.io/name'] = 'other';
  assert.throws(() => assessCluster(mismatched), /ready pods/);
  assert.throws(() => assertHealthBody('{"status":"live","pod":"api-0"}'), /unexpected fields/);
});

test('the two-replica smoke stays off mongo volumes and the one-replica cluster', () => {
  const script = readFileSync(path.join(root, 'tools/k8s/k3d-two-replica-smoke.sh'), 'utf8');
  assert.match(script, /CLUSTER_NAME=commercecore-two-replica/);
  assert.match(script, /--servers 1/);
  assert.match(script, /--agents 0/);
  assert.match(script, /--disable=traefik@server:0/);
  assert.match(script, /g5: NOT_CLAIMED/);
  assert.match(script, /ha: NOT_CLAIMED/);
  assert.match(script, /ingress: NOT_INSTALLED/);
  assert.doesNotMatch(script, /commercecore-local/);
  assert.doesNotMatch(script, /commercecore-mongo/);
  assert.doesNotMatch(script, /volume rm|down -v|--fresh/);
});

function balancedReport() {
  const labels = {
    'app.kubernetes.io/name': 'commercecore-api',
    'app.kubernetes.io/instance': 'commercecore-api',
  };
  const pod = (name, ip) => ({
    metadata: { name, labels: { ...labels } },
    status: { podIP: ip, conditions: [{ type: 'Ready', status: 'True' }] },
  });
  return {
    nodes: { items: [{}] },
    pods: { items: [pod('api-0', '10.0.0.1'), pod('api-1', '10.0.0.2')] },
    endpoints: {
      subsets: [{ addresses: [{ ip: '10.0.0.1' }, { ip: '10.0.0.2' }], notReadyAddresses: [] }],
    },
    service: { spec: { type: 'ClusterIP', selector: { ...labels } } },
    serviceCurls: 8,
    podCurls: 2,
  };
}

test('the deployment renders service links disabled exactly once', () => {
  const result = renderChart();
  assert.equal(result.status, 0, result.stderr);
  const matches = result.stdout.match(/^ {6}enableServiceLinks: false$/gm) ?? [];
  assert.equal(matches.length, 1);
});
