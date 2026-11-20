export type CatalogContractReason =
  | 'type'
  | 'format'
  | 'regression'
  | 'overflow'
  | 'prohibited-field'
  | 'missing-field'
  | 'mutation'
  | 'duplicate'
  | 'variant-unratified';

/**
 * Fail-closed catalog contract error. The message is a fixed reason and never
 * includes the rejected input, field name, or identifier.
 */
export class CatalogContractRejection extends Error {
  readonly code = 'CATALOG_CONTRACT_REJECTED';
  readonly reason: CatalogContractReason;

  constructor(reason: CatalogContractReason) {
    super(`Catalog contract rejected: ${reason}`);
    this.name = 'CatalogContractRejection';
    this.reason = reason;
  }
}
