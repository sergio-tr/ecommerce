import {
  alertFor,
  createSyntheticEntry,
  shouldRefreshList,
  updateSyntheticEntry,
  type MutationFetch,
  type WriteOutcome,
} from './synthetic-catalog-client';
import type { SyntheticEntry } from './synthetic-entry';

/**
 * Create and update drafts for the process-local synthetic catalog.
 * A rejection leaves the typed fields in place. A second call while a request
 * is in flight does not start another request. A stale rejection only offers
 * a later explicit revision recovery; it does not write again.
 */
export class SyntheticCatalogEditor {
  createProductId = '';
  createLabel = '';
  updateProductId = '';
  updateLabel = '';
  updateRevision = '';
  private pending = false;
  private stale = false;

  constructor(private readonly fetchImpl: MutationFetch) {}

  get busy(): boolean {
    return this.pending;
  }

  get canRecoverRevision(): boolean {
    return this.stale && !this.pending && this.updateProductId.length > 0;
  }

  beginEdit(entry: SyntheticEntry): void {
    if (this.pending) {
      return;
    }
    this.stale = false;
    this.updateProductId = entry.productId;
    this.updateLabel = entry.syntheticLabel;
    this.updateRevision = String(entry.revision);
  }

  applyRecoveredRevision(productId: string, revision: number): boolean {
    if (this.pending || !this.stale || productId !== this.updateProductId) {
      return false;
    }
    if (!Number.isSafeInteger(revision) || revision < 1) {
      return false;
    }
    this.updateRevision = String(revision);
    return true;
  }

  submitCreate(): Promise<WriteOutcome> {
    return this.run(
      () =>
        createSyntheticEntry(this.fetchImpl, {
          productId: this.createProductId,
          syntheticLabel: this.createLabel,
        }),
      (outcome) => {
        if (outcome.kind !== 'success') {
          return;
        }
        this.createProductId = '';
        this.createLabel = '';
      },
    );
  }

  submitUpdate(): Promise<WriteOutcome> {
    return this.run(
      () =>
        updateSyntheticEntry(this.fetchImpl, {
          productId: this.updateProductId,
          syntheticLabel: this.updateLabel,
          expectedRevision: this.updateRevision,
        }),
      (outcome) => {
        if (outcome.kind === 'success') {
          this.updateLabel = outcome.entry.syntheticLabel;
          this.updateRevision = String(outcome.entry.revision);
          this.stale = false;
          return;
        }
        if (outcome.kind === 'rejected' && outcome.rejection === 'stale') {
          this.stale = true;
        }
      },
    );
  }

  private async run(
    action: () => Promise<WriteOutcome>,
    settle: (outcome: WriteOutcome) => void,
  ): Promise<WriteOutcome> {
    if (this.pending) {
      return { kind: 'busy' };
    }
    this.pending = true;
    try {
      const outcome = await action();
      settle(outcome);
      return outcome;
    } finally {
      this.pending = false;
    }
  }
}

export async function refreshAfterWrite(
  outcome: WriteOutcome,
  reload: () => Promise<readonly SyntheticEntry[]>,
): Promise<readonly SyntheticEntry[] | null> {
  if (!shouldRefreshList(outcome)) {
    return null;
  }
  return reload();
}

export { alertFor };
