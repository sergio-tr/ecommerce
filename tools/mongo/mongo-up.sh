#!/usr/bin/env bash
# Start the local one-member MongoDB replica set.
# Exit 0 is a start. Exit 1 is a refused start. Exit 2 is WAITING_OWNER_LOCAL.
set -euo pipefail

MONGO_LOG_PREFIX=mongo-up
# shellcheck source=lib.sh
source "$(dirname "$0")/lib.sh"

mongo_load_credentials
mongo_prepare_runtime

if ! mongo_compose up -d; then
  mongo_fail "compose up failed. If 127.0.0.1:${MONGO_PUBLISH_PORT} is taken, set MONGO_PUBLISH_PORT to another port. The bind stays 127.0.0.1"
fi

ready=0
for _ in $(seq 1 90); do
  set +e
  mongo_compose exec -T mongo bash /bootstrap/bootstrap.sh
  code=$?
  set -e
  if [[ "$code" -eq 0 ]]; then
    ready=1
    break
  fi
  if [[ "$code" -eq 10 ]]; then
    mongo_fail "bootstrap rejected the replica set shape"
  fi
  sleep 1
done

if [[ "$ready" -ne 1 ]]; then
  mongo_fail "replica set bootstrap did not become primary"
fi

printf 'mongo-up: PASS\n'
