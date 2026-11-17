import { spawnSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const directory = process.argv[2];
if (!directory) {
  process.stderr.write('Usage: node tools/run-node-tests.mjs <compiled-test-directory>\n');
  process.exit(1);
}

const files = [];
function walk(current) {
  for (const entry of readdirSync(current)) {
    const fullPath = path.join(current, entry);
    if (statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (entry.endsWith('.spec.js')) {
      files.push(fullPath);
    }
  }
}

walk(directory);
if (files.length === 0) {
  process.stderr.write(`No compiled specs under ${directory}\n`);
  process.exit(1);
}

const result = spawnSync(process.execPath, ['--test', '--test-reporter', 'spec', ...files], {
  stdio: 'inherit',
});
process.exit(result.status ?? 1);
