const port = process.env.COMMERCECORE_PROBE_PORT ?? '3000';
if (!/^\d{1,5}$/.test(port)) {
  process.stderr.write('probe: rejected port\n');
  process.exit(1);
}
const healthUrlPattern = new RegExp(
  `^http://(?:(?:25[0-5]|2[0-4]\\d|1?\\d?\\d)\\.){3}(?:25[0-5]|2[0-4]\\d|1?\\d?\\d):${port}/health/live$`,
);

const urls = process.argv.slice(2);
if (urls.length === 0) {
  process.stderr.write('probe: no urls\n');
  process.exit(1);
}

let failed = false;
for (const url of urls) {
  if (!healthUrlPattern.test(url)) {
    process.stdout.write('0\trejected-url\n');
    failed = true;
    continue;
  }
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const text = await response.text();
    process.stdout.write(`${response.status}\t${text.replace(/[\r\n]/g, '')}\n`);
    if (response.status !== 200) {
      failed = true;
    }
  } catch {
    process.stdout.write('0\tfetch-failed\n');
    failed = true;
  }
}

process.exit(failed ? 1 : 0);
