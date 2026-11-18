// Unauthenticated read of the synthetic infra_probe collection.
// MongoDB accepts { ping: 1 } without credentials, so ping is not this oracle.
// Exit 0 / AUTH_BYPASS: the data command was accepted.
// AUTH_REJECTED: the server refused the read because it requires authentication.
// NETWORK: the attempt never reached an authorization decision.
// Nothing in this file prints a document or a credential.

function classifyAnonymousRead(error, result) {
  const rejected = error || (result && result.ok !== 1 ? result : null);
  if (!rejected) {
    if (result && result.ok === 1) {
      return 0;
    }
    return 5;
  }

  const code = rejected.code;
  const codeName = String(rejected.codeName || '');
  const name = String(rejected.name || '');
  const message = String(rejected.message || '');
  const network =
    name.indexOf('Network') !== -1 ||
    name.indexOf('ServerSelection') !== -1 ||
    codeName === 'HostUnreachable' ||
    message.indexOf('ECONNREFUSED') !== -1 ||
    message.indexOf('ENOTFOUND') !== -1 ||
    message.indexOf('timed out') !== -1 ||
    message.indexOf('Server selection') !== -1 ||
    message.indexOf('getaddrinfo') !== -1;
  if (network) {
    return 4;
  }

  const lower = message.toLowerCase();
  if (
    code === 13 ||
    codeName === 'Unauthorized' ||
    lower.indexOf('requires authentication') !== -1
  ) {
    return 13;
  }
  return 5;
}

if (typeof quit === 'function' && typeof db !== 'undefined') {
  let outcome = 5;
  try {
    const result = db.getSiblingDB('infra_probe').runCommand({
      find: 'probe',
      filter: { probe: 'mongo-infra' },
      limit: 1,
    });
    outcome = classifyAnonymousRead(null, result);
  } catch (error) {
    outcome = classifyAnonymousRead(error, null);
  }

  if (outcome === 13) {
    print('AUTH_REJECTED');
  } else if (outcome === 4) {
    print('NETWORK');
  } else if (outcome === 0) {
    print('AUTH_BYPASS');
  } else {
    print('OTHER');
  }
  quit(outcome);
}

if (typeof module === 'object' && module && module.exports) {
  module.exports = { classifyAnonymousRead };
}
