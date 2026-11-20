import { CatalogContractRejection } from './catalog-contract-rejection';

/**
 * Variant identity, SKU, and sellable attributes are not ratified.
 * Every construction attempt fails closed and drops the input.
 */
export function rejectUnratifiedVariantIdentity(_input: unknown): never {
  throw new CatalogContractRejection('variant-unratified');
}
