import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const skipDirectories = new Set(['.git', 'node_modules', 'dist', 'tmp', '.nx', 'coverage']);
const forbiddenNames = new Set([
  '.env',
  '.env.local',
  '.env.production',
  'credentials.json',
  'id_rsa',
  'id_ed25519',
]);
const patterns = [
  { name: 'stripe-live-secret', expression: /sk_live_[0-9A-Za-z]+/ },
  { name: 'stripe-test-secret', expression: /sk_test_[0-9A-Za-z]+/ },
  { name: 'stripe-live-publishable', expression: /pk_live_[0-9A-Za-z]+/ },
  { name: 'stripe-test-publishable', expression: /pk_test_[0-9A-Za-z]+/ },
  { name: 'webhook-secret', expression: /whsec_[0-9A-Za-z]+/ },
  { name: 'aws-access-key', expression: /AKIA[0-9A-Z]{16}/ },
  { name: 'private-key', expression: /-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----/ },
];

const findings = [];

function walk(directory) {
  for (const name of readdirSync(directory)) {
    if (skipDirectories.has(name)) {
      continue;
    }
    const fullPath = path.join(directory, name);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
      continue;
    }
    if (forbiddenNames.has(name)) {
      findings.push(`${path.relative(root, fullPath)}:forbidden-filename`);
      continue;
    }
    if (stat.size > 5_000_000) {
      findings.push(`${path.relative(root, fullPath)}:unscanned-large-file`);
      continue;
    }
    const buffer = readFileSync(fullPath);
    if (buffer.includes(0)) {
      continue;
    }
    const text = buffer.toString('utf8');
    for (const pattern of patterns) {
      if (pattern.expression.test(text)) {
        findings.push(`${path.relative(root, fullPath)}:${pattern.name}`);
      }
    }
  }
}

walk(root);

if (findings.length > 0) {
  process.stderr.write(`secret-scan: findings=${findings.length}\n`);
  for (const finding of findings) {
    process.stderr.write(`${finding}\n`);
  }
  process.exit(1);
}

process.stdout.write('secret-scan: no secrets found\n');
