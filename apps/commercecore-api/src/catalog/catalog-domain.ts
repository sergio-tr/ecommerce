import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const domainRequire = createRequire(__filename);

export interface CatalogProductId {
  readonly value: string;
  equals(other: CatalogProductId): boolean;
}

export interface CatalogSyntheticLabel {
  readonly value: string;
  equals(other: CatalogSyntheticLabel): boolean;
}

export interface CatalogProductIdError extends Error {
  readonly code: 'PRODUCT_ID_INVALID';
  readonly reason: 'type' | 'format';
}

export interface CatalogLabelError extends Error {
  readonly code: 'LABEL_INVALID';
  readonly reason: 'format';
}

interface DomainModule {
  readonly ProductId: { create(input: unknown): CatalogProductId };
  readonly InvalidProductIdError: new (reason: 'type' | 'format') => CatalogProductIdError;
  readonly SyntheticLabel: { create(input: unknown): CatalogSyntheticLabel };
  readonly InvalidSyntheticLabelError: new () => CatalogLabelError;
}

let loaded: DomainModule | undefined;

export function loadCatalogDomain(): DomainModule {
  loaded ??= domainRequire(domainEntry()) as DomainModule;
  return loaded;
}

function domainEntry(): string {
  const fromWorkspace = path.join(process.cwd(), 'dist/libs/commercecore/catalog/domain/index.js');
  if (existsSync(fromWorkspace)) {
    return fromWorkspace;
  }
  return path.resolve(path.dirname(__filename), '../../libs/commercecore/catalog/domain/index.js');
}
