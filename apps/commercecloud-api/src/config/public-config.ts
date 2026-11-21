export const PUBLIC_CONFIG = Symbol('PUBLIC_CONFIG');

export type CommerceCloudEnvironment = 'local' | 'test' | 'ci';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type PublicConfigReason = 'missing' | 'invalid' | 'forbidden' | 'unsupported';

export interface PublicConfig {
  readonly environment: CommerceCloudEnvironment;
  readonly host: '127.0.0.1';
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
const LOOPBACK_HOST = '127.0.0.1';
const RESERVED_PORTS: ReadonlySet<number> = new Set([3000, 4200]);
const KNOWN_FIELDS: ReadonlySet<string> = new Set([
  'COMMERCECLOUD_ENV',
  'COMMERCECLOUD_HTTP_HOST',
  'COMMERCECLOUD_HTTP_PORT',
  'COMMERCECLOUD_LOG_LEVEL',
  'COMMERCECLOUD_SERVICE_VERSION',
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
  const cloudKeys = Object.keys(env)
    .filter((key) => key.startsWith('COMMERCECLOUD_'))
    .sort();

  for (const key of cloudKeys) {
    const value = env[key];
    if (typeof value === 'string' && looksSecret(value)) {
      throw new PublicConfigError(key, 'forbidden');
    }
  }

  for (const key of cloudKeys) {
    if (!KNOWN_FIELDS.has(key)) {
      throw new PublicConfigError(key, 'unsupported');
    }
  }

  const environment = required(env, 'COMMERCECLOUD_ENV');
  if (!ENVIRONMENTS.has(environment)) {
    throw new PublicConfigError('COMMERCECLOUD_ENV', 'invalid');
  }

  const host = listenHost(env);
  const port = parsePort(required(env, 'COMMERCECLOUD_HTTP_PORT'));
  const logLevel = env.COMMERCECLOUD_LOG_LEVEL ?? 'info';
  if (!LOG_LEVELS.has(logLevel)) {
    throw new PublicConfigError('COMMERCECLOUD_LOG_LEVEL', 'invalid');
  }

  const serviceVersion = env.COMMERCECLOUD_SERVICE_VERSION ?? '0.0.0';
  if (!/^[0-9]+\.[0-9]+\.[0-9]+$/.test(serviceVersion)) {
    throw new PublicConfigError('COMMERCECLOUD_SERVICE_VERSION', 'invalid');
  }

  return Object.freeze({
    environment: environment as CommerceCloudEnvironment,
    host,
    port,
    logLevel: logLevel as LogLevel,
    serviceVersion,
  });
}

function listenHost(env: NodeJS.ProcessEnv): '127.0.0.1' {
  const host = env.COMMERCECLOUD_HTTP_HOST ?? LOOPBACK_HOST;
  if (host !== LOOPBACK_HOST) {
    throw new PublicConfigError('COMMERCECLOUD_HTTP_HOST', 'invalid');
  }
  return LOOPBACK_HOST;
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
    throw new PublicConfigError('COMMERCECLOUD_HTTP_PORT', 'invalid');
  }
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535 || RESERVED_PORTS.has(port)) {
    throw new PublicConfigError('COMMERCECLOUD_HTTP_PORT', 'invalid');
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
