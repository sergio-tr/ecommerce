import { CatalogContractRejection } from './catalog-contract-rejection';
import { CatalogRevision } from './catalog-revision';
import { ProductId } from './product-id';

/**
 * Read-only reference of an existing pedagogical ProductId at one revision.
 * This is not a Product aggregate, a synthetic catalog entry, or a Variant.
 */
export class CatalogIdentity {
  readonly productId: ProductId;
  readonly revision: CatalogRevision;

  private constructor(productId: ProductId, revision: CatalogRevision) {
    this.productId = productId;
    this.revision = revision;
    Object.freeze(this);
  }

  static create(productId: ProductId, revision: CatalogRevision): CatalogIdentity {
    if (!(productId instanceof ProductId) || !(revision instanceof CatalogRevision)) {
      throw new CatalogContractRejection('type');
    }
    return new CatalogIdentity(productId, revision);
  }

  equals(other: CatalogIdentity): boolean {
    return this.productId.equals(other.productId) && this.revision.equals(other.revision);
  }
}

export function parseCatalogIdentity(input: unknown): CatalogIdentity {
  if (!isRecord(input)) {
    throw new CatalogContractRejection('type');
  }
  for (const key of Object.keys(input)) {
    if (key !== 'productId' && key !== 'revision') {
      throw new CatalogContractRejection('prohibited-field');
    }
  }
  if (!Object.hasOwn(input, 'productId') || !Object.hasOwn(input, 'revision')) {
    throw new CatalogContractRejection('missing-field');
  }
  return CatalogIdentity.create(
    ProductId.create(input.productId),
    CatalogRevision.create(input.revision),
  );
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return input !== null && typeof input === 'object' && !Array.isArray(input);
}
