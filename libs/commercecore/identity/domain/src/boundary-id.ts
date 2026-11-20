import { BoundaryRejection } from './boundary-rejection';

/**
 * Local discriminator for a scope reference inside this unratified boundary.
 * The prefix is not a TenantId, StoreId, ActorId, or resource schema.
 */
export type BoundaryRole = 'tenant' | 'store' | 'actor' | 'resource';

const ROLE_PREFIX: Record<BoundaryRole, string> = {
  tenant: 'tnt_',
  store: 'str_',
  actor: 'act_',
  resource: 'res_',
};

const BOUNDARY_BODY = /^[0-9A-HJKMNP-TV-Z]{26}$/;

export class BoundaryId {
  readonly role: BoundaryRole;
  readonly value: string;

  private constructor(role: BoundaryRole, value: string) {
    this.role = role;
    this.value = value;
    Object.freeze(this);
  }

  static create(role: BoundaryRole, input: unknown): BoundaryId {
    if (typeof input !== 'string' || !isBoundaryValue(role, input)) {
      throw new BoundaryRejection('malformed-id');
    }
    return new BoundaryId(role, input);
  }

  equals(other: BoundaryId): boolean {
    return this.role === other.role && this.value === other.value;
  }
}

function isBoundaryValue(role: BoundaryRole, input: string): boolean {
  const prefix = ROLE_PREFIX[role];
  const body = input.startsWith(prefix) ? input.slice(prefix.length) : undefined;
  return body !== undefined && input.length === prefix.length + 26 && BOUNDARY_BODY.test(body);
}
