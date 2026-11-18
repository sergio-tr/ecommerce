#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const logicalKeyName = 't01-data';
const physicalName = 'commercecore-mongo-t01-data';
const liveName = 'commercecore-mongo-data';

export function readIsolatedVolume(document, logicalKey, physicalVolume, liveVolume) {
  if (
    logicalKey !== logicalKeyName ||
    physicalVolume !== physicalName ||
    liveVolume !== liveName ||
    logicalKey === physicalVolume ||
    physicalVolume === liveVolume
  ) {
    throw new Error('isolated volume assertion arguments are invalid');
  }
  if (!document || typeof document !== 'object' || Array.isArray(document)) {
    throw new Error('isolated compose config is not an object');
  }
  const volumes = document.volumes;
  if (!volumes || typeof volumes !== 'object' || Array.isArray(volumes)) {
    throw new Error('isolated compose volumes are missing');
  }
  const keys = Object.keys(volumes);
  if (keys.length !== 1 || keys[0] !== logicalKey) {
    throw new Error('isolated compose volume key is not the expected logical key');
  }
  const entry = volumes[logicalKey];
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
    throw new Error('isolated compose volume entry is not an object');
  }
  if (typeof entry.name !== 'string' || entry.name !== physicalVolume) {
    throw new Error('isolated compose volume name is not the expected physical name');
  }
  return entry.name;
}

function main() {
  let document;
  try {
    document = JSON.parse(readFileSync(0, 'utf8'));
  } catch {
    process.stderr.write('isolated compose config is not json\n');
    process.exit(2);
  }
  try {
    process.stdout.write(
      readIsolatedVolume(document, process.argv[2], process.argv[3], process.argv[4]),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'isolated compose volume check failed';
    process.stderr.write(`${message}\n`);
    process.exit(1);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
