import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { assertProjectGraph } from './assert-project-graph.mjs';

const script = fileURLToPath(new URL('./assert-project-graph.mjs', import.meta.url));

function node(name, type) {
  return { type, data: { projectType: type === 'app' ? 'application' : 'library' } };
}

function approvedGraph(extra = {}) {
  return {
    graph: {
      nodes: {
        'commercecore-api': node('commercecore-api', 'app'),
        'commercecore-catalog-domain': node('commercecore-catalog-domain', 'lib'),
        'commercecore-identity-domain': node('commercecore-identity-domain', 'lib'),
        'egame-web': node('egame-web', 'app'),
        ecommerce: node('ecommerce', 'lib'),
        ...extra.nodes,
      },
      dependencies: {
        'commercecore-api': [{ source: 'commercecore-api', target: 'commercecore-catalog-domain' }],
        'commercecore-catalog-domain': [],
        'commercecore-identity-domain': [],
        'egame-web': [],
        ecommerce: [],
        ...extra.dependencies,
      },
    },
  };
}

test('accepts the API and eGame apps and rejects a third app or CommerceCloud', () => {
  const lines = assertProjectGraph(approvedGraph());
  assert.match(lines.join('\n'), /apps are commercecore-api and egame-web/);
  assert.throws(
    () =>
      assertProjectGraph(approvedGraph({ nodes: { 'store-admin': node('store-admin', 'app') } })),
    /Expected apps/,
  );
  assert.throws(
    () =>
      assertProjectGraph(
        approvedGraph({ nodes: { 'commercecloud-api': node('commercecloud-api', 'app') } }),
      ),
    /CommerceCloud/,
  );
  const missing = approvedGraph();
  delete missing.graph.nodes['egame-web'];
  assert.throws(() => assertProjectGraph(missing), /missing egame-web/);
});

test('rejects an eGame dependency on the API, domain, or another project', () => {
  assert.throws(
    () =>
      assertProjectGraph(
        approvedGraph({
          dependencies: {
            'egame-web': [{ source: 'egame-web', target: 'commercecore-catalog-domain' }],
          },
        }),
      ),
    /egame-web must not depend/,
  );
  assert.throws(
    () =>
      assertProjectGraph(
        approvedGraph({
          dependencies: {
            'commercecore-catalog-domain': [
              { source: 'commercecore-catalog-domain', target: 'commercecore-api' },
            ],
          },
        }),
      ),
    /commercecore-catalog-domain has dependencies/,
  );
});

test('the CLI prints the approved app lines and fails closed', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'egame-graph-'));
  const good = path.join(directory, 'good.json');
  const bad = path.join(directory, 'bad.json');
  writeFileSync(good, JSON.stringify(approvedGraph()));
  writeFileSync(bad, JSON.stringify({ graph: { nodes: {}, dependencies: {} } }));

  const passed = spawnSync(process.execPath, [script, good], { encoding: 'utf8' });
  assert.equal(passed.status, 0);
  assert.match(passed.stdout, /egame-web has no project dependencies/);

  const failed = spawnSync(process.execPath, [script, bad], { encoding: 'utf8' });
  assert.equal(failed.status, 1);
});
