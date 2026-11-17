import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadPublicConfig, PublicConfigError } from './public-config';

const validEnv = {
  COMMERCECORE_ENV: 'test',
  COMMERCECORE_HTTP_PORT: '3000',
};

test('loads the public nonsecret defaults', () => {
  const config = loadPublicConfig(validEnv);
  assert.deepEqual(config, {
    environment: 'test',
    host: '127.0.0.1',
    port: 3000,
    logLevel: 'info',
    serviceVersion: '0.0.0',
  });
  assert.equal(Object.isFrozen(config), true);
});

test('rejects missing public configuration without a credential', () => {
  assert.throws(
    () => loadPublicConfig({}),
    (error: unknown) => {
      assert.ok(error instanceof PublicConfigError);
      assert.equal(error.field, 'COMMERCECORE_ENV');
      assert.equal(error.reason, 'missing');
      assert.match(error.message, /^Invalid public configuration for COMMERCECORE_ENV: missing$/);
      return true;
    },
  );
});

test('accepts the loopback default and the explicit pod-network host', () => {
  const loopback = loadPublicConfig({
    ...validEnv,
    COMMERCECORE_HTTP_HOST: '127.0.0.1',
  });
  assert.equal(loopback.host, '127.0.0.1');

  const podNetwork = loadPublicConfig({
    ...validEnv,
    COMMERCECORE_HTTP_HOST: '0.0.0.0',
  });
  assert.equal(podNetwork.host, '0.0.0.0');
});

test('rejects invalid port and host without echoing the value', () => {
  assert.throws(
    () =>
      loadPublicConfig({
        ...validEnv,
        COMMERCECORE_HTTP_PORT: 'not-a-port',
      }),
    (error: unknown) => {
      assert.ok(error instanceof PublicConfigError);
      assert.equal(error.field, 'COMMERCECORE_HTTP_PORT');
      assert.equal(error.reason, 'invalid');
      assert.equal(error.message.includes('not-a-port'), false);
      return true;
    },
  );

  for (const host of ['10.1.2.3', 'localhost', '::1']) {
    assert.throws(
      () =>
        loadPublicConfig({
          ...validEnv,
          COMMERCECORE_HTTP_HOST: host,
        }),
      (error: unknown) => {
        assert.ok(error instanceof PublicConfigError);
        assert.equal(error.field, 'COMMERCECORE_HTTP_HOST');
        assert.equal(error.reason, 'invalid');
        assert.equal(error.message.includes(host), false);
        return true;
      },
    );
  }

  assert.throws(
    () =>
      loadPublicConfig({
        ...validEnv,
        COMMERCECORE_HTTP_HOST: '',
      }),
    (error: unknown) => {
      assert.ok(error instanceof PublicConfigError);
      assert.equal(error.field, 'COMMERCECORE_HTTP_HOST');
      assert.equal(error.reason, 'invalid');
      assert.equal(
        error.message,
        'Invalid public configuration for COMMERCECORE_HTTP_HOST: invalid',
      );
      return true;
    },
  );
});

test('rejects secret-like public values without copying them into the error', () => {
  const secret = ['sk', 'test', '51EXAMPLE'].join('_');
  assert.throws(
    () =>
      loadPublicConfig({
        ...validEnv,
        COMMERCECORE_ENV: secret,
      }),
    (error: unknown) => {
      assert.ok(error instanceof PublicConfigError);
      assert.equal(error.field, 'COMMERCECORE_ENV');
      assert.equal(error.reason, 'forbidden');
      assert.equal(error.message.includes(secret), false);
      assert.equal(error.message.includes('51EXAMPLE'), false);
      return true;
    },
  );
});

test('rejects unsupported commerce configuration keys', () => {
  assert.throws(
    () =>
      loadPublicConfig({
        ...validEnv,
        COMMERCECORE_UNRELATED: '1',
      }),
    (error: unknown) => {
      assert.ok(error instanceof PublicConfigError);
      assert.equal(error.field, 'COMMERCECORE_UNRELATED');
      assert.equal(error.reason, 'unsupported');
      return true;
    },
  );
});
