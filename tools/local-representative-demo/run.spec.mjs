import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const expected = [
  'local-representative-demo: boundary=sandbox financial=false provider=none',
  'domain: case=accepted result=accepted value=prd_01ARZ3NDEKTSV4RRFFQ69G5FAV frozen=true equalToSynthetic=true',
  'domain: case=rejected result=rejected code=PRODUCT_ID_INVALID reason=format echoed=false',
  'api: GET /health/live http=200 status=live service=commercecore-api version=0.0.0 probe=liveness dependenciesChecked=false host=127.0.0.1',
  'local-representative-demo: pass',
  '',
].join('\n');

test('local representative demo prints the sandbox result', () => {
  const fixture = JSON.parse(
    readFileSync(path.join(root, 'tools/local-representative-demo/synthetic-input.json'), 'utf8'),
  );
  const rejected = fixture.cases.find((item) => item.expect === 'rejected');
  const result = spawnSync(process.execPath, ['tools/local-representative-demo/run.mjs'], {
    cwd: root,
    encoding: 'utf8',
    env: { PATH: process.env.PATH ?? '' },
  });

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.equal(result.stderr, '');
  assert.equal(result.stdout, expected);
  assert.equal(typeof rejected?.input, 'string');
  assert.equal(result.stdout.includes(rejected.input), false);
  assert.equal(/sk_|mongodb:\/\//i.test(result.stdout), false);
});
