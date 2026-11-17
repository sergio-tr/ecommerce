import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  assertDefaultRender,
  assertDockerfile,
  assertRejectedOverride,
  renderChart,
} from './assert-local-contract.mjs';

test('the image pins Node and leaves the listen host to the chart', () => {
  assert.doesNotThrow(() => assertDockerfile());
});

test('the default chart is a local ClusterIP health workload', () => {
  const result = renderChart();
  assert.equal(result.status, 0, result.stderr);
  assert.doesNotThrow(() => assertDefaultRender(result.stdout));
});

test('the chart rejects public exposure and a second replica', () => {
  assert.doesNotThrow(() => assertRejectedOverride(['--set', 'service.type=NodePort']));
  assert.doesNotThrow(() => assertRejectedOverride(['--set', 'service.type=LoadBalancer']));
  assert.doesNotThrow(() => assertRejectedOverride(['--set', 'image.pullPolicy=Always']));
  assert.doesNotThrow(() => assertRejectedOverride(['--set', 'replicaCount=2']));
  assert.doesNotThrow(() => assertRejectedOverride(['--set', 'ingress.enabled=true']));
  assert.doesNotThrow(() => assertRejectedOverride(['--set', 'enableServiceLinks=true']));
});

test('the deployment renders service links disabled exactly once', () => {
  const result = renderChart();
  assert.equal(result.status, 0, result.stderr);
  const matches = result.stdout.match(/^ {6}enableServiceLinks: false$/gm) ?? [];
  assert.equal(matches.length, 1);
});
