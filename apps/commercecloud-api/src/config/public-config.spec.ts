import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadPublicConfig, PublicConfigError } from './public-config';

const validEnv = {
  COMMERCECLOUD_ENV: 'test',
  COMMERCECLOUD_HTTP_PORT: '3100',
};

test('loads the loopback public defaults', () => {
  const config = loadPublicConfig(validEnv);
  assert.deepEqual(config, {
    environment: 'test',
    host: '127.0.0.1',
    port: 3100,
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
      assert.equal(error.field, 'COMMERCECLOUD_ENV');
      assert.equal(error.reason, 'missing');
      assert.match(error.message, /^Invalid public configuration for COMMERCECLOUD_ENV: missing$/);
      return true;
    },
  );
});

test('rejects the pod-network host and the CommerceCore and eGame ports', () => {
  const podHost = ['0', '0', '0', '0'].join('.');
  assert.throws(
    () =>
      loadPublicConfig({
        ...validEnv,
        COMMERCECLOUD_HTTP_HOST: podHost,
      }),
    (error: unknown) => {
      assert.ok(error instanceof PublicConfigError);
      assert.equal(error.field, 'COMMERCECLOUD_HTTP_HOST');
      assert.equal(error.reason, 'invalid');
      assert.equal(error.message.includes(podHost), false);
      return true;
    },
  );

  for (const port of ['3000', '4200', '0', '65536', 'not-a-port']) {
    assert.throws(
      () =>
        loadPublicConfig({
          ...validEnv,
          COMMERCECLOUD_HTTP_PORT: port,
        }),
      (error: unknown) => {
        assert.ok(error instanceof PublicConfigError);
        assert.equal(error.field, 'COMMERCECLOUD_HTTP_PORT');
        assert.equal(error.reason, 'invalid');
        assert.equal(error.message.includes(port), false);
        return true;
      },
    );
  }
});

test('rejects tenant, database, and other unknown cloud keys without echoing the value', () => {
  const tenantValue = 'tenant-not-a-permission';
  for (const field of [
    'COMMERCECLOUD_TENANT_ID',
    'COMMERCECLOUD_DATABASE_URL',
    'COMMERCECLOUD_AUTH_SECRET',
  ]) {
    assert.throws(
      () =>
        loadPublicConfig({
          ...validEnv,
          [field]: tenantValue,
        }),
      (error: unknown) => {
        assert.ok(error instanceof PublicConfigError);
        assert.equal(error.field, field);
        assert.equal(error.reason, 'unsupported');
        assert.equal(error.message.includes(tenantValue), false);
        return true;
      },
    );
  }
});

test('rejects secret-like public values without copying them into the error', () => {
  const secret = ['sk', 'test', '51EXAMPLE'].join('_');
  assert.throws(
    () =>
      loadPublicConfig({
        ...validEnv,
        COMMERCECLOUD_ENV: secret,
      }),
    (error: unknown) => {
      assert.ok(error instanceof PublicConfigError);
      assert.equal(error.field, 'COMMERCECLOUD_ENV');
      assert.equal(error.reason, 'forbidden');
      assert.equal(error.message.includes(secret), false);
      assert.equal(error.message.includes('51EXAMPLE'), false);
      return true;
    },
  );
});
