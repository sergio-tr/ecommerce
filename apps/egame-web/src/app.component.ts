import { Component, signal } from '@angular/core';
import {
  loadSyntheticEntries,
  type WriteOutcome,
} from './synthetic-catalog/synthetic-catalog-client';
import {
  alertFor,
  refreshAfterWrite,
  SyntheticCatalogEditor,
} from './synthetic-catalog/synthetic-catalog-editor';
import type { SyntheticEntry } from './synthetic-catalog/synthetic-entry';
import {
  ERROR_VIEW,
  LOADING_VIEW,
  SYNTHETIC_DEMO_BADGE,
  viewForEntries,
  type SyntheticCatalogView,
} from './synthetic-catalog/synthetic-catalog-view';

@Component({
  selector: 'egame-root',
  template: `
    <main>
      <p class="badge">{{ badge }}</p>
      <h1>Synthetic catalog</h1>
      <p class="note">
        Process-local fixture list. Restarting the API clears it. Two API pods do not share these
        entries. This is not high availability and it is not a product catalog.
      </p>
      <form (submit)="createEntry($event)">
        <h2>Create a synthetic entry</h2>
        <label for="create-product-id">Product id</label>
        <input
          id="create-product-id"
          name="productId"
          [value]="createProductId()"
          (input)="onCreateProductId($event)"
          [disabled]="busy()"
          autocomplete="off"
          spellcheck="false"
          [attr.aria-describedby]="createAlert() ? 'create-alert' : null"
        />
        <label for="create-label">Synthetic label</label>
        <input
          id="create-label"
          name="syntheticLabel"
          [value]="createLabel()"
          (input)="onCreateLabel($event)"
          [disabled]="busy()"
          autocomplete="off"
          spellcheck="false"
        />
        <button type="submit" [disabled]="busy()">Create synthetic entry</button>
        @if (createAlert(); as alert) {
          <p id="create-alert" class="alert" role="alert">{{ alert }}</p>
        }
      </form>
      @if (view().status === 'loading') {
        <p role="status">Loading synthetic entries.</p>
      }
      @if (view().status === 'empty') {
        <p>No synthetic entries.</p>
      }
      @if (view().status === 'error') {
        <p role="alert">The synthetic list could not be loaded.</p>
        <button type="button" (click)="reload()" [disabled]="busy()">Retry</button>
      }
      @if (view().status === 'list') {
        <ul>
          @for (entry of entries(); track entry.productId) {
            <li>
              <span class="id">{{ entry.productId }}</span>
              <span>{{ entry.syntheticLabel }}</span>
              <span class="rev">rev {{ entry.revision }}</span>
              <button type="button" (click)="edit(entry)" [disabled]="busy()">Edit</button>
            </li>
          }
        </ul>
      }
      <form (submit)="updateEntry($event)">
        <h2>Update a synthetic entry</h2>
        @if (updateProductId()) {
          <p>
            Product id <span class="id">{{ updateProductId() }}</span> stays unchanged.
          </p>
        } @else {
          <p>Choose an entry to edit. Only the label and the expected revision are sent.</p>
        }
        <label for="update-label">Synthetic label</label>
        <input
          id="update-label"
          name="syntheticLabel"
          [value]="updateLabel()"
          (input)="onUpdateLabel($event)"
          [disabled]="busy()"
          autocomplete="off"
          spellcheck="false"
          [attr.aria-describedby]="updateAlert() ? 'update-alert' : null"
        />
        <label for="update-revision">Expected revision</label>
        <input
          id="update-revision"
          name="expectedRevision"
          [value]="updateRevision()"
          (input)="onUpdateRevision($event)"
          [disabled]="busy()"
          inputmode="numeric"
          autocomplete="off"
          spellcheck="false"
        />
        <button type="submit" [disabled]="busy()">Save synthetic label</button>
        @if (updateAlert(); as alert) {
          <p id="update-alert" class="alert" role="alert">{{ alert }}</p>
        }
      </form>
      <button type="button" (click)="reload()" [disabled]="busy()">Reload</button>
    </main>
  `,
})
export class AppComponent {
  protected readonly badge = SYNTHETIC_DEMO_BADGE;
  protected readonly view = signal<SyntheticCatalogView>(LOADING_VIEW);
  protected readonly busy = signal(false);
  protected readonly createProductId = signal('');
  protected readonly createLabel = signal('');
  protected readonly createAlert = signal<string | null>(null);
  protected readonly updateProductId = signal('');
  protected readonly updateLabel = signal('');
  protected readonly updateRevision = signal('');
  protected readonly updateAlert = signal<string | null>(null);
  private readonly editor = new SyntheticCatalogEditor((path, init) =>
    globalThis.fetch(path, init),
  );

  constructor() {
    void this.reload();
  }

  protected reload(): Promise<void> {
    if (this.busy()) {
      return Promise.resolve();
    }
    this.view.set(LOADING_VIEW);
    return loadSyntheticEntries((path, init) => globalThis.fetch(path, init))
      .then((entries) => {
        this.view.set(viewForEntries(entries));
      })
      .catch(() => {
        this.view.set(ERROR_VIEW);
      });
  }

  protected entries(): readonly SyntheticEntry[] {
    const current = this.view();
    return current.status === 'list' ? current.entries : [];
  }

  protected edit(entry: SyntheticEntry): void {
    if (this.busy()) {
      return;
    }
    this.editor.beginEdit(entry);
    this.syncUpdateFields();
    this.updateAlert.set(null);
  }

  protected createEntry(event: Event): Promise<void> {
    event.preventDefault();
    return this.write('create');
  }

  protected updateEntry(event: Event): Promise<void> {
    event.preventDefault();
    return this.write('update');
  }

  protected onCreateProductId(event: Event): void {
    this.editor.createProductId = inputValue(event);
    this.createProductId.set(this.editor.createProductId);
  }

  protected onCreateLabel(event: Event): void {
    this.editor.createLabel = inputValue(event);
    this.createLabel.set(this.editor.createLabel);
  }

  protected onUpdateLabel(event: Event): void {
    this.editor.updateLabel = inputValue(event);
    this.updateLabel.set(this.editor.updateLabel);
  }

  protected onUpdateRevision(event: Event): void {
    this.editor.updateRevision = inputValue(event);
    this.updateRevision.set(this.editor.updateRevision);
  }

  private write(which: 'create' | 'update'): Promise<void> {
    if (this.busy()) {
      return Promise.resolve();
    }
    this.busy.set(true);
    const pending = which === 'create' ? this.editor.submitCreate() : this.editor.submitUpdate();
    return pending
      .then(async (outcome) => {
        this.record(which, outcome);
        await refreshAfterWrite(outcome, () => this.reloadAfterWrite());
      })
      .finally(() => {
        this.busy.set(false);
      });
  }

  private record(which: 'create' | 'update', outcome: WriteOutcome): void {
    const alert = outcome.kind === 'busy' ? null : alertFor(outcome);
    if (which === 'create') {
      this.syncCreateFields();
      if (outcome.kind !== 'busy') {
        this.createAlert.set(alert);
      }
      return;
    }
    this.syncUpdateFields();
    if (outcome.kind !== 'busy') {
      this.updateAlert.set(alert);
    }
  }

  private reloadAfterWrite(): Promise<readonly SyntheticEntry[]> {
    return loadSyntheticEntries((path, init) => globalThis.fetch(path, init)).then(
      (entries) => {
        this.view.set(viewForEntries(entries));
        return entries;
      },
      () => {
        this.view.set(ERROR_VIEW);
        return [];
      },
    );
  }

  private syncCreateFields(): void {
    this.createProductId.set(this.editor.createProductId);
    this.createLabel.set(this.editor.createLabel);
  }

  private syncUpdateFields(): void {
    this.updateProductId.set(this.editor.updateProductId);
    this.updateLabel.set(this.editor.updateLabel);
    this.updateRevision.set(this.editor.updateRevision);
  }
}

function inputValue(event: Event): string {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) {
    return '';
  }
  return target.value;
}
