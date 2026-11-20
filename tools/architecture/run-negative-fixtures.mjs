import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const domainRelative = process.argv[2] ?? 'libs/commercecore/catalog/domain';
if (
  !/^libs\/commercecore\/[a-z0-9-]+\/domain$/.test(domainRelative) ||
  domainRelative.includes('..')
) {
  throw new Error(`refusing unexpected domain path: ${domainRelative}`);
}
const fixtureDirectory = path.join(root, domainRelative, 'src/__negative__');
const nestFixture = path.join(fixtureDirectory, 'nestjs-import.fixture.ts');
const crossContextFixture = path.join(fixtureDirectory, 'commercecloud-import.fixture.ts');

let restored = false;

function restore() {
  rmSync(fixtureDirectory, { recursive: true, force: true });
  restored = true;
}

process.on('exit', () => {
  if (!restored) {
    rmSync(fixtureDirectory, { recursive: true, force: true });
  }
});

try {
  assertCommittedDomainIsClean();

  mkdirSync(fixtureDirectory, { recursive: true });
  writeFileSync(
    nestFixture,
    "import { Injectable } from '@nestjs/common';\n\nexport const forbiddenNestImport = Injectable;\n",
  );
  const nestResult = runEslint(nestFixture);
  assertFailure(nestResult, '@nestjs/common', 'NestJS fixture');
  restore();

  mkdirSync(fixtureDirectory, { recursive: true });
  writeFileSync(
    crossContextFixture,
    "import { COMMERCECLOUD_PRIVATE_ADAPTER } from '../../../../../../tools/architecture-fixtures/commercecloud-private-adapter';\n\nexport const forbiddenCrossContext = COMMERCECLOUD_PRIVATE_ADAPTER;\n",
  );
  const crossContextResult = runEslint(crossContextFixture);
  assertFailure(crossContextResult, 'commercecloud', 'CommerceCloud fixture');
  restore();

  const clean = runEslint(path.join(root, domainRelative));
  if (clean.status !== 0) {
    process.stderr.write(clean.stdout);
    process.stderr.write(clean.stderr);
    throw new Error('Restored domain lint did not pass');
  }

  const status = spawnSync(
    'git',
    ['status', '--porcelain', '--', path.posix.join(domainRelative, 'src/__negative__')],
    { cwd: root, encoding: 'utf8' },
  );
  if (status.status !== 0 || status.stdout.trim() !== '') {
    throw new Error(`Negative fixture was not removed:\n${status.stdout}`);
  }

  process.stdout.write(
    'architecture: NestJS fixture failed as expected; mocked CommerceCloud private-adapter fixture failed as expected; restored domain lint passed\n',
  );
} catch (error) {
  restore();
  throw error;
}

function runEslint(target) {
  return spawnSync('pnpm', ['exec', 'eslint', target, '--no-ignore', '--max-warnings=0'], {
    cwd: root,
    encoding: 'utf8',
  });
}

function assertFailure(result, needle, label) {
  const output = `${result.stdout}\n${result.stderr}`;
  if (result.status === 0 || !output.includes(needle)) {
    process.stderr.write(output);
    throw new Error(`${label} did not fail the architecture check`);
  }
  process.stdout.write(`${label} exit=${result.status}\n`);
}

function assertCommittedDomainIsClean() {
  const check = spawnSync('pnpm', ['exec', 'eslint', domainRelative, '--max-warnings=0'], {
    cwd: root,
    encoding: 'utf8',
  });
  if (check.status !== 0) {
    process.stderr.write(check.stdout);
    process.stderr.write(check.stderr);
    throw new Error('Committed domain lint failed before the negative fixtures');
  }
}
