#!/usr/bin/env bash
# Run inside the container. Credentials come from the container environment.
set -euo pipefail

if [[ -z "${MONGO_INITDB_ROOT_USERNAME:-}" || -z "${MONGO_INITDB_ROOT_PASSWORD:-}" ]]; then
  printf 'mongo-bootstrap: missing credentials\n' >&2
  exit 10
fi

mongosh --quiet \
  --username "$MONGO_INITDB_ROOT_USERNAME" \
  --password "$MONGO_INITDB_ROOT_PASSWORD" \
  --authenticationDatabase admin \
  --file /bootstrap/bootstrap.js
