import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const sourceRoot = path.join(root, 'apps/commercecloud-api/src');
const productionFiles = walk(sourceRoot).filter((file) => !file.endsWith('.spec.ts'));

test('CommerceCloud production sources stay inside the liveness shell', () => {
  assert.ok(productionFiles.length > 0);
  const controllers = [];
  for (const file of productionFiles) {
    const text = readFileSync(file, 'utf8');
    const relative = path.relative(root, file);
    for (const specifier of importSpecifiers(text)) {
      assert.equal(isAllowedImport(file, specifier), true, `${relative} imports ${specifier}`);
    }
    assert.equal(/@(?:Post|Put|Patch|Delete|All)\b/.test(text), false, relative);
    for (const match of text.matchAll(/@Controller\(\s*['"]([^'"]*)['"]\s*\)/g)) {
      controllers.push(match[1]);
    }
  }
  assert.deepEqual(controllers, ['health']);
});

test('the CommerceCloud project does not depend on another Nx project', () => {
  const project = JSON.parse(
    readFileSync(path.join(root, 'apps/commercecloud-api/project.json'), 'utf8'),
  );
  assert.equal(project.name, 'commercecloud-api');
  assert.equal(project.implicitDependencies, undefined);
  assert.deepEqual(project.tags, [
    'scope:commercecloud',
    'context:control-plane',
    'layer:app',
    'runtime:node',
  ]);
});

function walk(directory) {
  const files = [];
  for (const entry of readdirSync(directory)) {
    const fullPath = path.join(directory, entry);
    if (statSync(fullPath).isDirectory()) {
      files.push(...walk(fullPath));
    } else if (entry.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

function importSpecifiers(text) {
  const specifiers = [];
  const pattern =
    /(?:import|export)\s+(?:type\s+)?(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g;
  for (const match of text.matchAll(pattern)) {
    specifiers.push(match[1] ?? match[2]);
  }
  return specifiers;
}

function isAllowedImport(file, specifier) {
  if (
    specifier.startsWith('node:') ||
    specifier.startsWith('@nestjs/') ||
    specifier === 'reflect-metadata' ||
    specifier === 'rxjs'
  ) {
    return true;
  }
  if (!specifier.startsWith('.')) {
    return false;
  }
  const resolved = path.resolve(path.dirname(file), specifier);
  const prefix = sourceRoot.endsWith(path.sep) ? sourceRoot : `${sourceRoot}${path.sep}`;
  return resolved === sourceRoot || resolved.startsWith(prefix);
}
