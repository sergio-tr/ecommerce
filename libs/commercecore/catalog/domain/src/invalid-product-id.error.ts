export type ProductIdRejection = 'type' | 'format';

export class InvalidProductIdError extends Error {
  readonly code = 'PRODUCT_ID_INVALID';
  readonly reason: ProductIdRejection;

  constructor(reason: ProductIdRejection) {
    super(`ProductId rejected: ${reason}`);
    this.name = 'InvalidProductIdError';
    this.reason = reason;
  }
}
