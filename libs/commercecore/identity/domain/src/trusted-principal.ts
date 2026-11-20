import { BoundaryId } from './boundary-id';
import { BoundaryRejection } from './boundary-rejection';

/**
 * Assurance labels are not a guest, OIDC, or Keycloak contract.
 * `verified` means an upstream boundary already checked the caller.
 * This library does not perform that check and does not grant access.
 */
export type ActorAssurance = 'authenticated' | 'verified';

const ASSURANCES = new Set<ActorAssurance>(['authenticated', 'verified']);
const ESTABLISH_KEYS = new Set(['source', 'assurance', 'tenant', 'actor', 'store']);
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
] as const;

export class TrustedPrincipal {
  readonly source = 'verified-principal' as const;
  readonly assurance: ActorAssurance;
  readonly tenant: BoundaryId;
  readonly actor: BoundaryId;
  readonly store?: BoundaryId;

  private constructor(
    assurance: ActorAssurance,
    tenant: BoundaryId,
    actor: BoundaryId,
    store: BoundaryId | undefined,
  ) {
    this.assurance = assurance;
    this.tenant = tenant;
    this.actor = actor;
    if (store !== undefined) {
      this.store = store;
    }
    Object.freeze(this);
  }

  static establish(input: unknown): TrustedPrincipal {
    const record = plainRecord(input);
    rejectClientAuthorityKeys(record);
    rejectUnknownKeys(record, ESTABLISH_KEYS);

    if (record.source !== 'verified-principal') {
      throw new BoundaryRejection('client-supplied-authority');
    }

    if (!isAssurance(record.assurance)) {
      throw new BoundaryRejection('uncertain-actor');
    }

    if (!Object.hasOwn(record, 'tenant')) {
      throw new BoundaryRejection('missing-tenant');
    }
    if (!Object.hasOwn(record, 'actor')) {
      throw new BoundaryRejection('missing-actor');
    }

    const tenant = BoundaryId.create('tenant', record.tenant);
    const actor = BoundaryId.create('actor', record.actor);
    const store = Object.hasOwn(record, 'store')
      ? BoundaryId.create('store', record.store)
      : undefined;
    return new TrustedPrincipal(record.assurance, tenant, actor, store);
  }
}

function isAssurance(value: unknown): value is ActorAssurance {
  return typeof value === 'string' && ASSURANCES.has(value as ActorAssurance);
}

function plainRecord(input: unknown): Record<string, unknown> {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    throw new BoundaryRejection('type');
  }
  const prototype = Object.getPrototypeOf(input);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new BoundaryRejection('type');
  }
  return input as Record<string, unknown>;
}

function rejectClientAuthorityKeys(record: Record<string, unknown>): void {
  for (const key of CLIENT_AUTHORITY_KEYS) {
    if (Object.hasOwn(record, key)) {
      throw new BoundaryRejection('client-supplied-authority');
    }
  }
}

function rejectUnknownKeys(record: Record<string, unknown>, allowed: ReadonlySet<string>): void {
  for (const key of Object.keys(record)) {
    if (!allowed.has(key)) {
      throw new BoundaryRejection('unrecognized-field');
    }
  }
}
