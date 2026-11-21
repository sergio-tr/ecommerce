import assert from 'node:assert/strict';
import { test } from 'node:test';
import { portBusy } from '../local-egame-fullstack/children.mjs';
import { runSmoke } from './smoke.mjs';

test('the local shell keeps CommerceCore and CommerceCloud independent', async () => {
  const result = await runSmoke();
  const text = result.lines.join('\n');
  assert.match(text, /commercecloud-shell: core-live service=commercecore-api host=127\.0\.0\.1/);
  assert.match(text, /commercecloud-shell: cloud-live service=commercecloud-api host=127\.0\.0\.1/);
  assert.match(text, /commercecloud-shell: core-isolated-after-cloud-stop/);
  assert.match(text, /commercecloud-shell: cloud-isolated-after-core-stop/);
  assert.match(text, /commercecloud-shell: pod-host-rejected/);
  assert.match(text, /commercecloud-shell: reserved-port-rejected/);
  assert.match(text, /commercecloud-shell: tenant-key-rejected/);
  assert.match(text, /commercecloud-shell: PASS/);
  assert.match(text, /g5: NOT_CLAIMED/);
  assert.equal(text.includes('0.0.0.0'), false);
  assert.equal(await portBusy(result.corePort), false);
  assert.equal(await portBusy(result.cloudPort), false);
});
