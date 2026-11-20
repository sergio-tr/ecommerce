import { BoundaryId } from './boundary-id';
import { BoundaryRejection } from './boundary-rejection';
import { TrustedPrincipal } from './trusted-principal';

export type BoundaryDenialReason =
  | 'malformed-request'
  | 'malformed-id'
  | 'malformed-action'
  | 'client-supplied-authority'
  | 'missing-tenant'
  | 'missing-actor'
  | 'missing-resource'
  | 'missing-action'
  | 'missing-store'
  | 'store-mismatch'
  | 'actor-mismatch'
  | 'cross-tenant'
  | 'unrecognized-field'
  | 'unratified-delegation';

export type BoundaryDecision = {
  readonly outcome: 'denied' | 'scope-consistent';
  readonly permission: 'not-granted';
  readonly reason?: BoundaryDenialReason;
};

const REQUEST_KEYS = new Set(['tenant', 'actor', 'resource', 'action', 'store']);
const CLIENT_AUTHORITY_KEYS = [
  'x-tenant-id',
  'x-store-id',
  'x-actor-id',
  'tenantId',
  'storeId',
  'actorId',
  'clientSupplied',
  'header',
  'body',
  'source',
] as const;
const ACTION_TOKEN = /^[a-z][a-z0-9-]{0,62}$/;

/**
 * Compares a verified principal with a resource scope.
 * `scope-consistent` means the references match. It is not an authorization grant.
 */
export function evaluateScopedBoundary(
  principal: TrustedPrincipal,
  request: unknown,
): BoundaryDecision {
  const record = requestRecord(request);
  if (record === null) {
    return deny('malformed-request');
  }
  if (hasClientAuthorityKey(record)) {
    return deny('client-supplied-authority');
  }
  for (const key of Object.keys(record)) {
    if (!REQUEST_KEYS.has(key)) {
      return deny('unrecognized-field');
    }
  }
  if (!Object.hasOwn(record, 'tenant')) {
    return deny('missing-tenant');
  }
  if (!Object.hasOwn(record, 'actor')) {
    return deny('missing-actor');
  }
  if (!Object.hasOwn(record, 'resource')) {
    return deny('missing-resource');
  }
  if (!Object.hasOwn(record, 'action')) {
    return deny('missing-action');
  }

  const tenant = readId('tenant', record.tenant);
  const actor = readId('actor', record.actor);
  const resource = readId('resource', record.resource);
  if (tenant === null || actor === null || resource === null) {
    return deny('malformed-id');
  }
  if (typeof record.action !== 'string' || !ACTION_TOKEN.test(record.action)) {
    return deny('malformed-action');
  }

  const requestHasStore = Object.hasOwn(record, 'store');
  const requestStore = requestHasStore ? readId('store', record.store) : undefined;
  if (requestHasStore && requestStore === null) {
    return deny('malformed-id');
  }
  if (requestHasStore && principal.store === undefined) {
    return deny('store-mismatch');
  }
  if (!requestHasStore && principal.store !== undefined) {
    return deny('missing-store');
  }

  if (!tenant.equals(principal.tenant)) {
    return deny('cross-tenant');
  }
  if (!actor.equals(principal.actor)) {
    return deny('actor-mismatch');
  }
  if (requestStore && principal.store && !requestStore.equals(principal.store)) {
    return deny('store-mismatch');
  }

  return Object.freeze({
    outcome: 'scope-consistent',
    permission: 'not-granted',
  });
}

/**
 * A client header or body is never an authority, including when its fields are well formed.
 */
export function rejectClientSuppliedAuthority(input: unknown): BoundaryDecision {
  void input;
  return deny('client-supplied-authority');
}

/**
 * Delegated permissions are not ratified. Every claim fails closed and grants nothing.
 */
export function rejectDelegatedPermission(claim: unknown): BoundaryDecision {
  void claim;
  return deny('unratified-delegation');
}

function deny(reason: BoundaryDenialReason): BoundaryDecision {
  return Object.freeze({
    outcome: 'denied',
    permission: 'not-granted',
    reason,
  });
}

function requestRecord(input: unknown): Record<string, unknown> | null {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    return null;
  }
  const prototype = Object.getPrototypeOf(input);
  if (prototype !== Object.prototype && prototype !== null) {
    return null;
  }
  return input as Record<string, unknown>;
}

function hasClientAuthorityKey(record: Record<string, unknown>): boolean {
  return CLIENT_AUTHORITY_KEYS.some((key) => Object.hasOwn(record, key));
}

function readId(
  role: 'tenant' | 'store' | 'actor' | 'resource',
  value: unknown,
): BoundaryId | null {
  try {
    return BoundaryId.create(role, value);
  } catch (error) {
    if (error instanceof BoundaryRejection && error.reason === 'malformed-id') {
      return null;
    }
    throw error;
  }
}
