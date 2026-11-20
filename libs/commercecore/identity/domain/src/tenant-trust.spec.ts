import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { BoundaryRejection } from './boundary-rejection';
import {
  evaluateScopedBoundary,
  rejectClientSuppliedAuthority,
  rejectDelegatedPermission,
} from './boundary-decision';
import { TrustedPrincipal } from './trusted-principal';

const TENANT = 'tnt_01ARZ3NDEKTSV4RRFFQ69G5FAV';
const OTHER_TENANT = 'tnt_01ARZ3NDEKTSV4RRFFQ69G5FAW';
const STORE = 'str_01ARZ3NDEKTSV4RRFFQ69G5FAV';
const OTHER_STORE = 'str_01ARZ3NDEKTSV4RRFFQ69G5FAW';
const ACTOR = 'act_01ARZ3NDEKTSV4RRFFQ69G5FAV';
const OTHER_ACTOR = 'act_01ARZ3NDEKTSV4RRFFQ69G5FAW';
const RESOURCE = 'res_01ARZ3NDEKTSV4RRFFQ69G5FAV';
const OTHER_RESOURCE = 'res_01ARZ3NDEKTSV4RRFFQ69G5FAW';

test('establishes a frozen verified principal without granting access', () => {
  const principal = TrustedPrincipal.establish({
    source: 'verified-principal',
    assurance: 'authenticated',
    tenant: TENANT,
    actor: ACTOR,
    store: STORE,
  });
  const decision = evaluateScopedBoundary(principal, {
    tenant: TENANT,
    actor: ACTOR,
    store: STORE,
    resource: RESOURCE,
    action: 'read-boundary',
  });
  const otherResource = evaluateScopedBoundary(principal, {
    tenant: TENANT,
    actor: ACTOR,
    store: STORE,
    resource: OTHER_RESOURCE,
    action: 'read-boundary',
  });

  assert.equal(principal.source, 'verified-principal');
  assert.equal(Object.isFrozen(principal), true);
  assert.equal(Object.isFrozen(principal.tenant), true);
  assert.equal(decision.outcome, 'scope-consistent');
  assert.equal(decision.permission, 'not-granted');
  assert.equal(decision.reason, undefined);
  assert.equal(otherResource.outcome, 'scope-consistent');
  assert.equal(otherResource.permission, 'not-granted');
  assert.throws(() => {
    (principal as { tenant: unknown }).tenant = TENANT;
  }, TypeError);
});

test('rejects malformed ids and wrong roles without echoing the input', () => {
  const secret = `${'x'.repeat(80)}secret-looking`;
  const samples: unknown[] = [
    '',
    'tnt_',
    'tnt_01arz3ndektsv4rrffq69g5fav',
    STORE,
    ACTOR,
    secret,
    12,
    null,
  ];

  for (const sample of samples) {
    assert.throws(
      () =>
        TrustedPrincipal.establish({
          source: 'verified-principal',
          assurance: 'verified',
          tenant: sample,
          actor: ACTOR,
        }),
      (error: unknown) => {
        assert.ok(error instanceof BoundaryRejection);
        assert.equal(error.reason, 'malformed-id');
        assert.match(error.message, /^Boundary rejected: malformed-id$/);
        if (typeof sample === 'string' && sample.length > 0) {
          assert.equal(error.message.includes(sample), false);
        }
        return true;
      },
    );
  }
});

test('fails closed on guest and uncertain actors', () => {
  const assurances: unknown[] = ['guest', 'uncertain', 'unverified', 'anonymous', '', null, 1];
  for (const assurance of assurances) {
    assert.throws(
      () =>
        TrustedPrincipal.establish({
          source: 'verified-principal',
          assurance,
          tenant: TENANT,
          actor: ACTOR,
        }),
      (error: unknown) => {
        assert.ok(error instanceof BoundaryRejection);
        assert.equal(error.reason, 'uncertain-actor');
        assert.equal(error.message.includes('guest'), false);
        return true;
      },
    );
  }

  assert.throws(
    () =>
      TrustedPrincipal.establish({
        source: 'verified-principal',
        assurance: 'authenticated',
        tenant: TENANT,
      }),
    (error: unknown) => error instanceof BoundaryRejection && error.reason === 'missing-actor',
  );
});

test('does not treat a client header or body as authority', () => {
  const header = {
    source: 'client-supplied',
    'x-tenant-id': TENANT,
    'x-actor-id': ACTOR,
    body: { tenantId: OTHER_TENANT },
  };
  assert.throws(
    () => TrustedPrincipal.establish(header),
    (error: unknown) => {
      assert.ok(error instanceof BoundaryRejection);
      assert.equal(error.reason, 'client-supplied-authority');
      assert.equal(error.message.includes(TENANT), false);
      assert.equal(error.message.includes(OTHER_TENANT), false);
      return true;
    },
  );

  const forged = rejectClientSuppliedAuthority(header);
  assert.equal(forged.outcome, 'denied');
  assert.equal(forged.reason, 'client-supplied-authority');
  assert.equal(forged.permission, 'not-granted');
  assert.equal(JSON.stringify(forged).includes(TENANT), false);

  const verifiedLooking = rejectClientSuppliedAuthority({
    source: 'verified-principal',
    assurance: 'authenticated',
    tenant: TENANT,
    actor: ACTOR,
  });
  assert.equal(verifiedLooking.outcome, 'denied');
  assert.equal(verifiedLooking.permission, 'not-granted');
});

test('denies a forged tenant field on an otherwise matching scope', () => {
  const principal = TrustedPrincipal.establish({
    source: 'verified-principal',
    assurance: 'authenticated',
    tenant: TENANT,
    actor: ACTOR,
    store: STORE,
  });
  const decision = evaluateScopedBoundary(principal, {
    tenant: TENANT,
    actor: ACTOR,
    store: STORE,
    resource: RESOURCE,
    action: 'read-boundary',
    'x-tenant-id': OTHER_TENANT,
  });
  assert.equal(decision.outcome, 'denied');
  assert.equal(decision.reason, 'client-supplied-authority');
  assert.equal(decision.permission, 'not-granted');
  assert.equal(JSON.stringify(decision).includes(OTHER_TENANT), false);
});

test('denies cross-tenant, actor, and store scope mismatches', () => {
  const principal = TrustedPrincipal.establish({
    source: 'verified-principal',
    assurance: 'verified',
    tenant: TENANT,
    actor: ACTOR,
    store: STORE,
  });

  const crossTenant = evaluateScopedBoundary(principal, {
    tenant: OTHER_TENANT,
    actor: ACTOR,
    store: STORE,
    resource: RESOURCE,
    action: 'read-boundary',
  });
  const otherActor = evaluateScopedBoundary(principal, {
    tenant: TENANT,
    actor: OTHER_ACTOR,
    store: STORE,
    resource: RESOURCE,
    action: 'read-boundary',
  });
  const otherStore = evaluateScopedBoundary(principal, {
    tenant: TENANT,
    actor: ACTOR,
    store: OTHER_STORE,
    resource: RESOURCE,
    action: 'read-boundary',
  });
  const missingStore = evaluateScopedBoundary(principal, {
    tenant: TENANT,
    actor: ACTOR,
    resource: RESOURCE,
    action: 'read-boundary',
  });

  assert.equal(crossTenant.reason, 'cross-tenant');
  assert.equal(otherActor.reason, 'actor-mismatch');
  assert.equal(otherStore.reason, 'store-mismatch');
  assert.equal(missingStore.reason, 'missing-store');
  for (const decision of [crossTenant, otherActor, otherStore, missingStore]) {
    assert.equal(decision.outcome, 'denied');
    assert.equal(decision.permission, 'not-granted');
  }
});

test('fails closed on missing scope and malformed actions', () => {
  const principal = TrustedPrincipal.establish({
    source: 'verified-principal',
    assurance: 'authenticated',
    tenant: TENANT,
    actor: ACTOR,
  });
  const widened = evaluateScopedBoundary(principal, {
    tenant: TENANT,
    actor: ACTOR,
    store: STORE,
    resource: RESOURCE,
    action: 'read-boundary',
  });
  const missingAction = evaluateScopedBoundary(principal, {
    tenant: TENANT,
    actor: ACTOR,
    resource: RESOURCE,
  });
  const badAction = evaluateScopedBoundary(principal, {
    tenant: TENANT,
    actor: ACTOR,
    resource: RESOURCE,
    action: 'Grant Admin',
  });

  assert.equal(widened.reason, 'store-mismatch');
  assert.equal(missingAction.reason, 'missing-action');
  assert.equal(badAction.reason, 'malformed-action');
  assert.equal(JSON.stringify(badAction).includes('Grant'), false);
});

test('does not grant a delegated permission', () => {
  const secret = 'delegated-secret-do-not-echo';
  const decision = rejectDelegatedPermission({
    source: 'verified-principal',
    tenant: TENANT,
    actor: ACTOR,
    resource: RESOURCE,
    action: 'tenant-admin',
    delegated: true,
    note: secret,
  });
  assert.deepEqual(decision, {
    outcome: 'denied',
    permission: 'not-granted',
    reason: 'unratified-delegation',
  });
  assert.equal(JSON.stringify(decision).includes(secret), false);
  assert.equal(JSON.stringify(decision).includes('tenant-admin'), false);
});

test('committed identity sources do not import frameworks or other contexts', () => {
  const sourceRoot = path.join(process.cwd(), 'libs/commercecore/identity/domain/src');
  const forbidden =
    /@nestjs|['"]stripe['"]|['"]mongodb['"]|['"]mongoose['"]|commercecloud|catalog\/domain/;
  for (const file of listTypeScript(sourceRoot)) {
    if (file.endsWith('.spec.ts')) {
      continue;
    }
    const text = readFileSync(file, 'utf8');
    assert.equal(forbidden.test(text), false, file);
  }
});

function listTypeScript(directory: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(directory)) {
    const fullPath = path.join(directory, entry);
    if (statSync(fullPath).isDirectory()) {
      files.push(...listTypeScript(fullPath));
    } else if (entry.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}
