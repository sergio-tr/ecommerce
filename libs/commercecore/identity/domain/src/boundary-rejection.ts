export type BoundaryRejectionReason =
  | 'type'
  | 'malformed-id'
  | 'uncertain-actor'
  | 'client-supplied-authority'
  | 'missing-tenant'
  | 'missing-actor'
  | 'unrecognized-field';

/**
 * Fail-closed boundary error. The message is a fixed reason and never includes
 * the rejected input.
 */
export class BoundaryRejection extends Error {
  readonly code = 'BOUNDARY_REJECTED';
  readonly reason: BoundaryRejectionReason;

  constructor(reason: BoundaryRejectionReason) {
    super(`Boundary rejected: ${reason}`);
    this.name = 'BoundaryRejection';
    this.reason = reason;
  }
}
