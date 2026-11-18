// Reads `docker compose config --format json` on stdin and checks the isolated
// T01 project. Prints one summary line. Does not print service environment.

const PINNED_IMAGE =
  'docker.io/library/mongo:8.0.38-noble@sha256:76a93cc399d05709baeea4e55385749657aa0085ad5b497c851380778eccea2c';

function fail(token) {
  process.stderr.write(`isolated-config: ${token}\n`);
  process.exit(1);
}

function asText(value) {
  return value === undefined || value === null ? '' : String(value);
}

function readPort(port) {
  if (typeof port === 'string') {
    const match = /^([^:]+):(\d+):(\d+)$/.exec(port);
    if (!match) {
      return null;
    }
    return { hostIp: match[1], published: match[2], target: match[3] };
  }
  if (!port || typeof port !== 'object') {
    return null;
  }
  return {
    hostIp: asText(port.host_ip),
    published: asText(port.published),
    target: asText(port.target),
  };
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  raw += chunk;
});
process.stdin.on('end', () => {
  let config;
  try {
    config = JSON.parse(raw);
  } catch {
    fail('json');
  }

  const service = config && config.services ? config.services.mongo : undefined;
  if (!service) {
    fail('service');
  }
  const serviceNames = Object.keys(config.services);
  if (serviceNames.length !== 1 || serviceNames[0] !== 'mongo') {
    fail('service');
  }

  const ports = Array.isArray(service.ports) ? service.ports : [];
  if (ports.length !== 1) {
    fail('port');
  }
  const port = readPort(ports[0]);
  if (
    !port ||
    port.hostIp !== '127.0.0.1' ||
    port.published !== '27018' ||
    port.target !== '27017'
  ) {
    fail('port');
  }
  const hostIp = port.hostIp;
  const published = port.published;

  const volumeKey = config.volumes ? config.volumes['commercecore-mongo-data'] : undefined;
  const volumeName = volumeKey ? asText(volumeKey.name) : '';
  const network = config.networks ? config.networks.private : undefined;
  const networkName = network ? asText(network.name) : '';
  const project = asText(config.name);
  const container = asText(service.container_name);
  const image = asText(service.image);
  const hostname = asText(service.hostname);

  if (project !== 'commercecore-mongo-t01') {
    fail('project');
  }
  if (container !== 'commercecore-mongo-t01') {
    fail('container');
  }
  if (volumeName !== 'commercecore-mongo-t01-data') {
    fail('volume');
  }
  if (networkName !== 'commercecore-mongo-t01' || !network || network.internal !== false) {
    fail('network');
  }
  if (image !== PINNED_IMAGE) {
    fail('image');
  }
  if (hostname !== 'mongo') {
    fail('hostname');
  }

  const volumeNames = Object.keys(config.volumes || {});
  if (volumeNames.length !== 1) {
    fail('volume');
  }

  process.stdout.write(
    `project=${project} container=${container} volume=${volumeName} network=${networkName} port=${hostIp}:${published}\n`,
  );
});
