import { CatalogContractRejection } from './catalog-contract-rejection';
import { CatalogIdentity } from './catalog-identity';
import { ProductId } from './product-id';

/**
 * Read-only lookup. Absence is `undefined`. This port has no write, and a
 * matching read does not grant permission to mutate another context.
 */
export type CatalogIdentityReader = {
  readonly read: (productId: ProductId) => CatalogIdentity | undefined;
};

export function acceptReadOnlyCatalogPort(port: unknown): CatalogIdentityReader {
  if (!isRecord(port)) {
    throw new CatalogContractRejection('type');
  }
  const keys = callableKeys(port);
  if (keys.length !== 1 || keys[0] !== 'read' || typeof port.read !== 'function') {
    throw new CatalogContractRejection('mutation');
  }
  const read = port.read as CatalogIdentityReader['read'];
  return Object.freeze({
    read(productId: ProductId): CatalogIdentity | undefined {
      if (!(productId instanceof ProductId)) {
        throw new CatalogContractRejection('type');
      }
      const found = read(productId);
      if (found === undefined) {
        return undefined;
      }
      if (!(found instanceof CatalogIdentity)) {
        throw new CatalogContractRejection('type');
      }
      return found;
    },
  });
}

export function catalogIdentityFixture(entries: readonly CatalogIdentity[]): CatalogIdentityReader {
  if (!Array.isArray(entries)) {
    throw new CatalogContractRejection('type');
  }
  const byId = new Map<string, CatalogIdentity>();
  for (const entry of entries) {
    if (!(entry instanceof CatalogIdentity)) {
      throw new CatalogContractRejection('type');
    }
    if (byId.has(entry.productId.value)) {
      throw new CatalogContractRejection('duplicate');
    }
    byId.set(entry.productId.value, entry);
  }
  return acceptReadOnlyCatalogPort({
    read(productId: ProductId): CatalogIdentity | undefined {
      return byId.get(productId.value);
    },
  });
}

function callableKeys(value: object): string[] {
  const keys = new Set<string>();
  let current: object | null = value;
  while (current !== null && current !== Object.prototype) {
    for (const key of Object.getOwnPropertyNames(current)) {
      if (key !== 'constructor') {
        keys.add(key);
      }
    }
    current = Object.getPrototypeOf(current) as object | null;
  }
  return [...keys];
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return input !== null && typeof input === 'object' && !Array.isArray(input);
}
