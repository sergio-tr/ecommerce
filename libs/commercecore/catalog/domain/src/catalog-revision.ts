import { CatalogContractRejection } from './catalog-contract-rejection';

/**
 * Technical monotonic revision for a catalog identity reference.
 * This is not a synthetic-entry revision, a product version, or a sellable state.
 * A forward step may skip values. Going back or staying put is a regression.
 */
export class CatalogRevision {
  readonly value: number;

  private constructor(value: number) {
    this.value = value;
    Object.freeze(this);
  }

  static create(input: unknown): CatalogRevision {
    if (typeof input !== 'number' || !Number.isSafeInteger(input) || input < 1) {
      throw new CatalogContractRejection(typeof input === 'number' ? 'format' : 'type');
    }
    return new CatalogRevision(input);
  }

  equals(other: CatalogRevision): boolean {
    return this.value === other.value;
  }

  next(): CatalogRevision {
    if (this.value === Number.MAX_SAFE_INTEGER) {
      throw new CatalogContractRejection('overflow');
    }
    return new CatalogRevision(this.value + 1);
  }
}

export function requireForwardRevision(
  current: CatalogRevision,
  proposed: CatalogRevision,
): CatalogRevision {
  if (!(current instanceof CatalogRevision) || !(proposed instanceof CatalogRevision)) {
    throw new CatalogContractRejection('type');
  }
  if (proposed.value <= current.value) {
    throw new CatalogContractRejection('regression');
  }
  return proposed;
}
