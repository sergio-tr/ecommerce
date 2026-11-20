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
 * is in flight does not start another request.
 */
export class SyntheticCatalogEditor {
  createProductId = '';
  createLabel = '';
  updateProductId = '';
  updateLabel = '';
  updateRevision = '';
  private pending = false;

  constructor(private readonly fetchImpl: MutationFetch) {}

  get busy(): boolean {
    return this.pending;
  }

  beginEdit(entry: SyntheticEntry): void {
    if (this.pending) {
      return;
    }
    this.updateProductId = entry.productId;
    this.updateLabel = entry.syntheticLabel;
    this.updateRevision = String(entry.revision);
  }

  submitCreate(): Promise<WriteOutcome> {
    return this.run(
      () =>
        createSyntheticEntry(this.fetchImpl, {
          productId: this.createProductId,
          syntheticLabel: this.createLabel,
        }),
      () => {
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
        if (outcome.kind !== 'success') {
          return;
        }
        this.updateLabel = outcome.entry.syntheticLabel;
        this.updateRevision = String(outcome.entry.revision);
      },
    );
  }

  private async run(
    action: () => Promise<WriteOutcome>,
    accept: (outcome: WriteOutcome) => void,
  ): Promise<WriteOutcome> {
    if (this.pending) {
      return { kind: 'busy' };
    }
    this.pending = true;
    try {
      const outcome = await action();
      if (outcome.kind === 'success') {
        accept(outcome);
      }
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
