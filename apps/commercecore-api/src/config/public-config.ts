export const PUBLIC_CONFIG = Symbol('PUBLIC_CONFIG');

export type CommerceCoreEnvironment = 'local' | 'test' | 'ci';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type PublicConfigReason = 'missing' | 'invalid' | 'forbidden' | 'unsupported';

export type ListenHost = '127.0.0.1' | '0.0.0.0';

export interface PublicConfig {
  readonly environment: CommerceCoreEnvironment;
  readonly host: ListenHost;
  readonly port: number;
  readonly logLevel: LogLevel;
  readonly serviceVersion: string;
}

export class PublicConfigError extends Error {
  readonly code = 'PUBLIC_CONFIG_INVALID';
  readonly field: string;
  readonly reason: PublicConfigReason;

  constructor(field: string, reason: PublicConfigReason) {
    super(`Invalid public configuration for ${field}: ${reason}`);
    this.name = 'PublicConfigError';
    this.field = field;
    this.reason = reason;
  }
}

const ENVIRONMENTS: ReadonlySet<string> = new Set(['local', 'test', 'ci']);
const LOG_LEVELS: ReadonlySet<string> = new Set(['debug', 'info', 'warn', 'error']);
const LISTEN_HOSTS: ReadonlySet<string> = new Set(['127.0.0.1', '0.0.0.0']);
const KNOWN_FIELDS: ReadonlySet<string> = new Set([
  'COMMERCECORE_ENV',
  'COMMERCECORE_HTTP_HOST',
  'COMMERCECORE_HTTP_PORT',
  'COMMERCECORE_LOG_LEVEL',
  'COMMERCECORE_SERVICE_VERSION',
]);

const SECRET_MARKERS: readonly string[] = [
  ['sk', 'live'].join('_'),
  ['sk', 'test'].join('_'),
  ['pk', 'live'].join('_'),
  ['pk', 'test'].join('_'),
  ['wh', 'sec_'].join(''),
  ['BEGIN ', 'PRIVATE KEY'].join(''),
  ['BEGIN ', 'RSA PRIVATE KEY'].join(''),
];

export function loadPublicConfig(env: NodeJS.ProcessEnv): PublicConfig {
  const commerceKeys = Object.keys(env)
    .filter((key) => key.startsWith('COMMERCECORE_'))
    .sort();

  for (const key of commerceKeys) {
    const value = env[key];
    if (typeof value === 'string' && looksSecret(value)) {
      throw new PublicConfigError(key, 'forbidden');
    }
  }

  for (const key of commerceKeys) {
    if (!KNOWN_FIELDS.has(key)) {
      throw new PublicConfigError(key, 'unsupported');
    }
  }

  const environment = required(env, 'COMMERCECORE_ENV');
  if (!ENVIRONMENTS.has(environment)) {
    throw new PublicConfigError('COMMERCECORE_ENV', 'invalid');
  }

  const host = listenHost(env);

  const port = parsePort(required(env, 'COMMERCECORE_HTTP_PORT'));
  const logLevel = env.COMMERCECORE_LOG_LEVEL ?? 'info';
  if (!LOG_LEVELS.has(logLevel)) {
    throw new PublicConfigError('COMMERCECORE_LOG_LEVEL', 'invalid');
  }

  const serviceVersion = env.COMMERCECORE_SERVICE_VERSION ?? '0.0.0';
  if (!/^[0-9]+\.[0-9]+\.[0-9]+$/.test(serviceVersion)) {
    throw new PublicConfigError('COMMERCECORE_SERVICE_VERSION', 'invalid');
  }

  return Object.freeze({
    environment: environment as CommerceCoreEnvironment,
    host,
    port,
    logLevel: logLevel as LogLevel,
    serviceVersion,
  });
}

function listenHost(env: NodeJS.ProcessEnv): ListenHost {
  const host = env.COMMERCECORE_HTTP_HOST ?? '127.0.0.1';
  if (!LISTEN_HOSTS.has(host)) {
    throw new PublicConfigError('COMMERCECORE_HTTP_HOST', 'invalid');
  }
  return host as ListenHost;
}

function required(env: NodeJS.ProcessEnv, field: string): string {
  const value = env[field];
  if (value === undefined || value === '') {
    throw new PublicConfigError(field, 'missing');
  }
  return value;
}

function parsePort(raw: string): number {
  if (!/^[0-9]+$/.test(raw)) {
    throw new PublicConfigError('COMMERCECORE_HTTP_PORT', 'invalid');
  }
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new PublicConfigError('COMMERCECORE_HTTP_PORT', 'invalid');
  }
  return port;
}

function looksSecret(value: string): boolean {
  if (SECRET_MARKERS.some((marker) => value.includes(marker))) {
    return true;
  }
  if (/mongodb(\+srv)?:\/\//i.test(value)) {
    return true;
  }
  return value.includes('://') && value.includes('@');
}
