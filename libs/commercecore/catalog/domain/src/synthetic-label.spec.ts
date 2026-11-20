import assert from 'node:assert/strict';
import { test } from 'node:test';
import { InvalidSyntheticLabelError } from './invalid-synthetic-label.error';
import { SyntheticLabel } from './synthetic-label';

test('accepts the synthetic fixture labels and freezes them', () => {
  const label = SyntheticLabel.create('synthetic-entry-a');
  const again = SyntheticLabel.create('synthetic-entry-a');
  assert.equal(label.value, 'synthetic-entry-a');
  assert.equal(label.equals(again), true);
  assert.equal(SyntheticLabel.create('synthetic-entry-b').equals(label), false);
  assert.equal(SyntheticLabel.create('a').value, 'a');
  assert.equal(SyntheticLabel.create('a-b').value, 'a-b');
  assert.equal(Object.isFrozen(label), true);
});

test('accepts a 64-character label and rejects a longer one', () => {
  const max = `a${'b'.repeat(62)}c`;
  assert.equal(max.length, 64);
  assert.equal(SyntheticLabel.create(max).value, max);
  const over = `${max}d`;
  assert.throws(
    () => SyntheticLabel.create(over),
    (error: unknown) => {
      assert.ok(error instanceof InvalidSyntheticLabelError);
      assert.equal(error.message.includes(over), false);
      return true;
    },
  );
});

test('rejects invalid synthetic labels without echoing the input', () => {
  const samples: unknown[] = ['', 'A', 'synthetic-entry-A', 'a-', '-a', '--', 12, null, undefined];

  for (const sample of samples) {
    assert.throws(
      () => SyntheticLabel.create(sample),
      (error: unknown) => {
        assert.ok(error instanceof InvalidSyntheticLabelError);
        assert.equal(error.code, 'LABEL_INVALID');
        assert.equal(error.reason, 'format');
        assert.match(error.message, /^SyntheticLabel rejected: format$/);
        if (typeof sample === 'string' && sample.length > 0) {
          assert.equal(error.message.includes(sample), false);
        }
        return true;
      },
    );
  }
});
