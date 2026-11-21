import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const BODY_LIMIT = 16 * 1024;

/**
 * The dev server forwards only the /catalog prefix to loopback.
 * This module reads that file and serves the same prefix on an ephemeral port.
 */
export function loadCatalogProxyRule(root) {
  const file = path.join(root, 'apps/egame-web/proxy.conf.json');
  const parsed = JSON.parse(readFileSync(file, 'utf8'));
  const prefixes = Object.keys(parsed);
  if (prefixes.length !== 1 || prefixes[0] !== '/catalog') {
    throw new Error('proxy.conf.json must expose only /catalog');
  }
  const rule = parsed['/catalog'];
  if (rule?.secure !== false || rule?.target !== 'http://127.0.0.1:3000') {
    throw new Error('proxy.conf.json must target loopback http://127.0.0.1:3000');
  }
  return { prefix: '/catalog', target: rule.target };
}

export function isCatalogPath(pathname) {
  return pathname === '/catalog' || pathname.startsWith('/catalog/');
}

export async function startCatalogProxy(apiPort) {
  const server = http.createServer((request, response) => {
    void handleProxy(request, response, apiPort).catch(() =>
      sendJson(response, 502, 'UPSTREAM_UNAVAILABLE'),
    );
  });
  const port = await listen(server);
  return { port, close: () => closeServer(server) };
}

export async function startStaticProxy({ apiPort, webRoot }) {
  const server = http.createServer((request, response) => {
    void handleStatic(request, response, apiPort, webRoot).catch(() =>
      sendJson(response, 502, 'UPSTREAM_UNAVAILABLE'),
    );
  });
  const port = await listen(server);
  return { port, close: () => closeServer(server) };
}

async function handleProxy(request, response, apiPort) {
  const url = requestUrl(request);
  if (!isCatalogPath(url.pathname)) {
    sendJson(response, 404, 'NOT_PROXIED');
    return;
  }
  await forwardCatalog(request, response, apiPort, url);
}

async function handleStatic(request, response, apiPort, webRoot) {
  const url = requestUrl(request);
  if (isCatalogPath(url.pathname)) {
    await forwardCatalog(request, response, apiPort, url);
    return;
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    sendJson(response, 404, 'NOT_PROXIED');
    return;
  }
  const file = resolveWebFile(webRoot, url.pathname);
  if (file === null || !existsSync(file) || !statSync(file).isFile()) {
    sendJson(response, 404, 'NOT_FOUND');
    return;
  }
  response.writeHead(200, {
    'content-type': contentType(file),
    'cache-control': 'no-store',
  });
  if (request.method === 'HEAD') {
    response.end();
    return;
  }
  createReadStream(file).pipe(response);
}

async function forwardCatalog(request, response, apiPort, url) {
  let body;
  try {
    body = await readBody(request);
  } catch (error) {
    if (error?.code === 'BODY_LIMIT') {
      sendJson(response, 413, 'BODY_LIMIT');
      return;
    }
    sendJson(response, 400, 'BODY_INVALID');
    return;
  }
  let upstream;
  try {
    upstream = await callApi(apiPort, request, body, url);
  } catch {
    sendJson(response, 502, 'UPSTREAM_UNAVAILABLE');
    return;
  }
  const contentType = headerValue(upstream.contentType) ?? 'application/octet-stream';
  response.writeHead(upstream.status, {
    'content-type': contentType,
    'content-length': upstream.body.length,
    'cache-control': 'no-store',
  });
  response.end(upstream.body);
}

function callApi(apiPort, request, body, url) {
  const headers = { 'content-length': String(body.length) };
  const contentType = headerValue(request.headers['content-type']);
  const accept = headerValue(request.headers['accept']);
  if (contentType) {
    headers['content-type'] = contentType;
  }
  if (accept) {
    headers['accept'] = accept;
  }
  return new Promise((resolve, reject) => {
    const upstream = http.request(
      {
        host: '127.0.0.1',
        port: apiPort,
        method: request.method,
        path: `${url.pathname}${url.search}`,
        headers,
        timeout: 2000,
      },
      (incoming) => {
        const chunks = [];
        incoming.on('data', (chunk) => chunks.push(chunk));
        incoming.on('end', () => {
          resolve({
            status: incoming.statusCode ?? 502,
            contentType: incoming.headers['content-type'],
            body: Buffer.concat(chunks),
          });
        });
      },
    );
    upstream.on('timeout', () => upstream.destroy(new Error('timeout')));
    upstream.on('error', reject);
    upstream.end(body);
  });
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    request.on('data', (chunk) => {
      size += chunk.length;
      if (size > BODY_LIMIT) {
        reject(Object.assign(new Error('limit'), { code: 'BODY_LIMIT' }));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on('end', () => resolve(Buffer.concat(chunks)));
    request.on('error', reject);
  });
}

function resolveWebFile(webRoot, pathname) {
  if (pathname === '/') {
    return path.join(webRoot, 'index.html');
  }
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  const relative = decoded.replace(/^\/+/, '');
  if (relative.length === 0 || relative.includes('\0')) {
    return null;
  }
  const root = path.resolve(webRoot);
  const file = path.resolve(root, relative);
  if (file !== root && !file.startsWith(`${root}${path.sep}`)) {
    return null;
  }
  return file;
}

function contentType(file) {
  switch (path.extname(file)) {
    case '.html':
      return 'text/html; charset=utf-8';
    case '.js':
      return 'text/javascript; charset=utf-8';
    case '.css':
      return 'text/css; charset=utf-8';
    case '.json':
    case '.map':
      return 'application/json; charset=utf-8';
    case '.svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
}

function requestUrl(request) {
  return new URL(request.url ?? '/', 'http://127.0.0.1');
}

function headerValue(value) {
  if (Array.isArray(value)) {
    return value[0];
  }
  return typeof value === 'string' ? value : undefined;
}

function sendJson(response, status, code) {
  if (response.headersSent) {
    response.end();
    return;
  }
  const body = JSON.stringify({ code });
  response.writeHead(status, {
    'content-type': 'application/json',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store',
  });
  response.end(body);
}

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (address === null || typeof address === 'string') {
        reject(new Error('Could not allocate a loopback port'));
        return;
      }
      resolve(address.port);
    });
  });
}

function closeServer(server) {
  return new Promise((resolve) => {
    server.close(() => resolve());
  });
}
