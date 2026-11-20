import { Component, signal } from '@angular/core';
import { loadSyntheticEntries } from './synthetic-catalog/synthetic-catalog-client';
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
        Process-local fixture list. Restarting the API clears it. This is not a product catalog.
      </p>
      @if (view().status === 'loading') {
        <p role="status">Loading synthetic entries.</p>
      }
      @if (view().status === 'empty') {
        <p>No synthetic entries.</p>
      }
      @if (view().status === 'error') {
        <p role="alert">The synthetic list could not be loaded.</p>
      }
      @if (view().status === 'list') {
        <ul>
          @for (entry of entries(); track entry.productId) {
            <li>
              <span class="id">{{ entry.productId }}</span>
              <span>{{ entry.syntheticLabel }}</span>
              <span class="rev">rev {{ entry.revision }}</span>
            </li>
          }
        </ul>
      }
      <button type="button" (click)="reload()">Reload</button>
    </main>
  `,
})
export class AppComponent {
  protected readonly badge = SYNTHETIC_DEMO_BADGE;
  protected readonly view = signal<SyntheticCatalogView>(LOADING_VIEW);

  constructor() {
    void this.reload();
  }

  protected reload(): Promise<void> {
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
}
