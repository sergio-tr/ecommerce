import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const script = path.join(here, 'resolve-nx-format-range.sh');
const workflowPath = path.join(root, '.github/workflows/pr-validation.yml');
const ZERO_SHA = '0000000000000000000000000000000000000000';

function git(cwd, args) {
  const result = spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    env: process.env,
  });
  if (result.status !== 0) {
    throw new Error(`git ${args.join(' ')} failed in ${cwd}\n${result.stdout}\n${result.stderr}`);
  }
  return result.stdout.trim();
}

function run(cwd, env) {
  const outputFile = path.join(cwd, 'github-output.txt');
  writeFileSync(outputFile, '');
  const result = spawnSync('bash', [script], {
    cwd,
    encoding: 'utf8',
    env: {
      ...process.env,
      GITHUB_OUTPUT: outputFile,
      ...env,
    },
  });
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
    output: readFileSync(outputFile, 'utf8'),
  };
}

function initWork(dir) {
  const origin = path.join(dir, 'origin.git');
  const work = path.join(dir, 'work');
  git(dir, ['init', '--bare', '-b', 'main', origin]);
  git(origin, ['config', 'uploadpack.allowReachableSHA1InWant', 'true']);
  git(dir, ['init', '-b', 'main', work]);
  git(work, ['config', 'user.name', 'Range Test']);
  git(work, ['config', 'user.email', 'range-test@example.com']);
  git(work, ['config', 'protocol.file.allow', 'always']);
  writeFileSync(path.join(work, 'note.txt'), 'one\n');
  git(work, ['add', 'note.txt']);
  git(work, ['commit', '-m', 'base']);
  const base = git(work, ['rev-parse', 'HEAD']);
  git(work, ['remote', 'add', 'origin', origin]);
  git(work, ['push', 'origin', 'main']);
  return { origin, work, base };
}

test('pull_request compares the fetched base ref with HEAD', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'nx-format-pr-'));
  try {
    const { work, base } = initWork(dir);
    writeFileSync(path.join(work, 'note.txt'), 'two\n');
    git(work, ['commit', '-am', 'change']);
    const head = git(work, ['rev-parse', 'HEAD']);
    const result = run(work, {
      GITHUB_EVENT_NAME: 'pull_request',
      GITHUB_SHA: head,
      PR_BASE_REF: 'main',
    });

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.output, new RegExp(`^base=${base}$`, 'm'));
    assert.match(result.output, new RegExp(`^head=${head}$`, 'm'));
    assert.match(result.stdout, new RegExp(`files=1`));
    assert.equal(result.stdout.includes('--all'), false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('push fetches the previous commit instead of comparing main to itself', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'nx-format-push-'));
  try {
    const { origin, work, base } = initWork(dir);
    writeFileSync(path.join(work, 'note.txt'), 'two\n');
    git(work, ['commit', '-am', 'change']);
    const head = git(work, ['rev-parse', 'HEAD']);
    git(work, ['push', 'origin', 'main']);
    const shallow = path.join(dir, 'shallow');
    git(dir, ['clone', '--no-local', '--depth', '1', origin, shallow]);
    git(shallow, ['config', 'protocol.file.allow', 'always']);
    const missingParent = spawnSync('git', ['cat-file', '-e', `${base}^{commit}`], {
      cwd: shallow,
    });
    assert.notEqual(missingParent.status, 0);

    const result = run(shallow, {
      GITHUB_EVENT_NAME: 'push',
      GITHUB_SHA: head,
      PUSH_BEFORE: base,
    });

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.output, new RegExp(`^base=${base}$`, 'm'));
    assert.match(result.output, new RegExp(`^head=${head}$`, 'm'));
    assert.match(result.stdout, /files=1/);
    assert.equal(result.output.includes(`base=${head}`), false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('push rejects an empty range and a zero before SHA', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'nx-format-empty-'));
  try {
    const { work, base } = initWork(dir);
    const empty = run(work, {
      GITHUB_EVENT_NAME: 'push',
      GITHUB_SHA: base,
      PUSH_BEFORE: base,
    });
    assert.equal(empty.status, 1);
    assert.match(empty.stderr, /empty format range/);
    assert.equal(empty.output, '');

    const zero = run(work, {
      GITHUB_EVENT_NAME: 'push',
      GITHUB_SHA: base,
      PUSH_BEFORE: ZERO_SHA,
    });
    assert.equal(zero.status, 1);
    assert.match(zero.stderr, /zero/);
    assert.equal(zero.output, '');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('push does not succeed when the previous commit cannot be fetched', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'nx-format-missing-'));
  try {
    const { work, base } = initWork(dir);
    const missing = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    const result = run(work, {
      GITHUB_EVENT_NAME: 'push',
      GITHUB_SHA: base,
      PUSH_BEFORE: missing,
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /could not fetch push before SHA/);
    assert.equal(result.output, '');
    assert.equal(result.stdout.includes('files='), false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('unsupported events and unsafe base refs fail closed', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'nx-format-closed-'));
  try {
    const { work, base } = initWork(dir);
    const unsupported = run(work, {
      GITHUB_EVENT_NAME: 'workflow_dispatch',
      GITHUB_SHA: base,
    });
    assert.equal(unsupported.status, 1);
    assert.match(unsupported.stderr, /unsupported event/);

    const unsafe = run(work, {
      GITHUB_EVENT_NAME: 'pull_request',
      GITHUB_SHA: base,
      PR_BASE_REF: '--upload-pack=evil',
    });
    assert.equal(unsafe.status, 1);
    assert.match(unsafe.stderr, /unsafe/);
    assert.equal(unsafe.output, '');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('workflow validates main pushes without a privileged trigger', () => {
  const workflow = readFileSync(workflowPath, 'utf8');
  assert.match(workflow, /push:\n {4}branches:\n {6}- main/);
  assert.match(workflow, /permissions:\n {2}contents: read/);
  assert.equal(workflow.includes('pull_request_target'), false);
  assert.equal(workflow.includes('secrets.'), false);
  assert.match(workflow, /actions\/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1/);
  assert.match(workflow, /pnpm\/action-setup@73e46992e05b19abd31f2f3c20e0e7370d762115/);
  assert.match(workflow, /actions\/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1/);
  assert.match(workflow, /node-version: 24\.22\.2/);
  assert.match(workflow, /version: 11\.10\.0/);
  assert.match(workflow, /bash tools\/ci\/resolve-nx-format-range\.sh/);
  assert.match(workflow, /lint typecheck test build secret-scan/);
  assert.match(
    workflow,
    /nx format:check --base="\$\{NX_FORMAT_BASE\}" --head="\$\{NX_FORMAT_HEAD\}"/,
  );
  assert.match(workflow, /commercecore-catalog-domain:architecture/);
  assert.match(workflow, /commercecore-identity-domain:architecture/);
  assert.match(workflow, /assert-project-graph\.mjs/);
  assert.match(workflow, /pnpm run local-representative-demo/);
  assert.match(workflow, /pnpm run local-egame-fullstack-smoke/);
  assert.match(workflow, /pnpm run local-commercecloud-shell-smoke/);
  assert.match(workflow, /pnpm run local-commercecore-stack-smoke/);
  assert.match(workflow, /pnpm run local-commercecore-stack-browser/);
  assert.equal(workflow.includes('origin main:main'), false);
  assert.equal(
    workflow.includes('group: pr-validation-${{ github.event.pull_request.number }}'),
    false,
  );
});
