export class InvalidSyntheticLabelError extends Error {
  readonly code = 'LABEL_INVALID';
  readonly reason = 'format';

  constructor() {
    super('SyntheticLabel rejected: format');
    this.name = 'InvalidSyntheticLabelError';
    this.reason = 'format';
  }
}
