import type { SyntheticEntry } from './synthetic-entry';

/**
 * Reads the already loaded synthetic list after a stale write.
 * It never sends POST or PATCH. A selection change during the read
 * drops the result instead of rewriting the draft.
 */

export type RecoveryResult =
  | { readonly kind: 'ignored' }
  | { readonly kind: 'moved' }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'missing'; readonly entries: readonly SyntheticEntry[] }
  | {
      readonly kind: 'ready';
      readonly revision: number;
      readonly storedLabel: string;
      readonly entries: readonly SyntheticEntry[];
    };

export function recoveryStatusText(result: RecoveryResult): string | null {
  if (result.kind === 'ready') {
    return (
      `Latest stored revision is ${result.revision}. ` +
      `Stored label ${result.storedLabel}. ` +
      'The label you typed stays. Save again to send it.'
    );
  }
  if (result.kind === 'missing') {
    return 'That synthetic entry is no longer in the list. The draft was kept.';
  }
  if (result.kind === 'unavailable') {
    return 'The latest revision could not be read. The draft was kept.';
  }
  return null;
}

export class SyntheticRevisionRecovery {
  private generation = 0;
  private pending = false;

  constructor(private readonly load: () => Promise<readonly SyntheticEntry[]>) {}

  get busy(): boolean {
    return this.pending;
  }

  moveSelection(): void {
    this.generation += 1;
    this.pending = false;
  }

  async recover(productId: string, offered: boolean): Promise<RecoveryResult> {
    if (!offered || this.pending || productId.length === 0) {
      return { kind: 'ignored' };
    }
    const generation = this.generation;
    this.pending = true;
    try {
      const loaded = await this.load();
      if (generation !== this.generation) {
        return { kind: 'moved' };
      }
      const entries = Object.freeze([...loaded]);
      const match = entries.find((item) => item.productId === productId);
      if (!match) {
        return { kind: 'missing', entries };
      }
      return {
        kind: 'ready',
        revision: match.revision,
        storedLabel: match.syntheticLabel,
        entries,
      };
    } catch {
      if (generation !== this.generation) {
        return { kind: 'moved' };
      }
      return { kind: 'unavailable' };
    } finally {
      if (generation === this.generation) {
        this.pending = false;
      }
    }
  }
}
