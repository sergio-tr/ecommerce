import { InvalidProductIdError } from './invalid-product-id.error';

/**
 * Pedagogical value object for M01-BOOTSTRAP-01.
 * This is not an approved Product aggregate, Offer, Quote, or catalog model.
 *
 * Shape: `prd_` plus 26 Crockford base32 characters. The prefix is a teaching
 * example only and does not reserve a production identifier scheme.
 */
const PRODUCT_ID_BODY = /^[0-9A-HJKMNP-TV-Z]{26}$/;

export class ProductId {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
    Object.freeze(this);
  }

  static create(input: unknown): ProductId {
    if (typeof input !== 'string' || !isProductIdValue(input)) {
      throw new InvalidProductIdError(typeof input === 'string' ? 'format' : 'type');
    }
    return new ProductId(input);
  }

  equals(other: ProductId): boolean {
    return this.value === other.value;
  }
}

function isProductIdValue(input: string): boolean {
  const body = input.startsWith('prd_') ? input.slice(4) : undefined;
  return body !== undefined && input.length === 30 && PRODUCT_ID_BODY.test(body);
}
