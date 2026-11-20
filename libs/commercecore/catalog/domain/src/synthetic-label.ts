import { InvalidSyntheticLabelError } from './invalid-synthetic-label.error';

/**
 * Opaque fixture token for one process-local synthetic catalog entry.
 * This is not a commercial name, SKU, description, or price.
 *
 * Shape: one leading alphanumeric, then up to 62 alphanumeric or hyphen
 * characters, then one trailing alphanumeric. A single alphanumeric is valid.
 */
const SYNTHETIC_LABEL = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;

export class SyntheticLabel {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
    Object.freeze(this);
  }

  static create(input: unknown): SyntheticLabel {
    if (typeof input !== 'string' || !SYNTHETIC_LABEL.test(input)) {
      throw new InvalidSyntheticLabelError();
    }
    return new SyntheticLabel(input);
  }

  equals(other: SyntheticLabel): boolean {
    return this.value === other.value;
  }
}
