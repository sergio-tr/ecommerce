#!/usr/bin/env bash
# MONGO-INFRA-T01 through T09. Exit 2 is WAITING_OWNER_LOCAL. This is not G5.
# Default teardown inside this script keeps the named volume.
# --fresh is the explicit destructive option: it removes an existing volume first.
set -euo pipefail

MONGO_LOG_PREFIX=mongo-infra-smoke
# shellcheck source=lib.sh
source "$(dirname "$0")/lib.sh"

fresh=0
if [[ $# -gt 1 ]]; then
  mongo_fail "too many arguments"
fi
if [[ "${1:-}" == "--fresh" ]]; then
  fresh=1
elif [[ -n "${1:-}" ]]; then
  mongo_fail "unknown argument: ${1}"
fi

mongo_load_credentials
mongo_require_docker

root="$(mongo_root)"
port="$(mongo_publish_port)"
if [[ "$port" != "27017" ]]; then
  mongo_fail "T07 host check needs published port 27017 because the member host is mongo:27017. Free 127.0.0.1:27017 or do not claim T07"
fi

volume_exists=0
if mongo_docker volume inspect commercecore-mongo-data >/dev/null 2>&1; then
  volume_exists=1
fi
if [[ "$volume_exists" -eq 1 && "$fresh" -ne 1 ]]; then
  mongo_fail "volume commercecore-mongo-data already exists. Pass --fresh to remove it before a clean T01 start. The default does not delete it"
fi
if [[ "$fresh" -eq 1 ]]; then
  bash "${root}/tools/mongo/mongo-down.sh" --destroy-volume
fi

# Keep the Compose variables in this process. mongo-up.sh prepares again in its own process.
mongo_prepare_runtime

step() {
  printf 'mongo-infra-smoke: %s\n' "$1"
}

mongosh_file() {
  local script="$1"
  local attempt
  for attempt in $(seq 1 90); do
    if mongo_compose exec -T mongo bash -lc \
      "mongosh --quiet --username \"\$MONGO_INITDB_ROOT_USERNAME\" --password \"\$MONGO_INITDB_ROOT_PASSWORD\" --authenticationDatabase admin --file '${script}'"; then
      return 0
    fi
    sleep 1
  done
  mongo_fail "mongosh ${script} did not succeed"
}

anonymous_ping_fails() {
  if mongo_compose exec -T mongo mongosh --quiet --eval 'db.runCommand({ ping: 1 })'; then
    mongo_fail "anonymous ping succeeded"
  fi
}

step "T01 clean start"
bash "${root}/tools/mongo/mongo-up.sh"
mongosh_file /bootstrap/probe-write.js
anonymous_ping_fails
step "T01 shape recorded by bootstrap and anonymous ping rejected"

step "T02 start again"
bash "${root}/tools/mongo/mongo-up.sh"
mongosh_file /bootstrap/probe-read.js

step "T03 restart"
mongo_compose restart mongo
mongosh_file /bootstrap/probe-read.js

step "T04 recreate container"
mongo_compose up -d --force-recreate --no-deps mongo
mongosh_file /bootstrap/probe-read.js

step "T05 missing env and empty password"
set +e
MONGO_ENV_FILE="${root}/tools/mongo/does-not-exist.env" bash "${root}/tools/mongo/mongo-up.sh"
missing_code=$?
set -e
if [[ "$missing_code" -ne 1 ]]; then
  mongo_fail "missing env file exited ${missing_code}"
fi
empty_file="$(mktemp)"
printf 'MONGO_INITDB_ROOT_USERNAME="local-operator"\nMONGO_INITDB_ROOT_PASSWORD=""\n' >"$empty_file"
set +e
MONGO_ENV_FILE="$empty_file" bash "${root}/tools/mongo/mongo-up.sh"
empty_code=$?
set -e
rm -f "$empty_file"
if [[ "$empty_code" -ne 1 ]]; then
  mongo_fail "empty password exited ${empty_code}"
fi
anonymous_ping_fails

step "T06 loopback publish"
published="$(mongo_docker port commercecore-mongo 27017/tcp)"
printf 'mongo-infra-smoke: port %s\n' "$published"
if [[ "$published" != "127.0.0.1:27017" ]]; then
  mongo_fail "published port is not 127.0.0.1:27017"
fi

step "T07 member host and host client"
mongosh_file /bootstrap/bootstrap.js
image="$(mongo_compose config --images)"
image="${image#"${image%%[![:space:]]*}"}"
image="${image%"${image##*[![:space:]]}"}"
mongo_docker run --rm --network host --add-host mongo:127.0.0.1 \
  -e MONGO_INITDB_ROOT_USERNAME \
  -e MONGO_INITDB_ROOT_PASSWORD \
  -v "${root}/tools/mongo/probe-read.js:/probe-read.js:ro" \
  --entrypoint bash \
  "$image" \
  -lc 'mongosh --quiet --username "$MONGO_INITDB_ROOT_USERNAME" --password "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin "mongodb://mongo:27017/infra_probe?replicaSet=rs0&authSource=admin" --file /probe-read.js'

step "T08 image pin and server version"
if [[ "$image" != "docker.io/library/mongo:8.0.38-noble@sha256:76a93cc399d05709baeea4e55385749657aa0085ad5b497c851380778eccea2c" ]]; then
  mongo_fail "compose image is not the pinned OCI index"
fi
version="$(mongo_compose exec -T mongo mongod --version)"
printf '%s\n' "$version"
if [[ "$version" != *"v8.0.38"* ]]; then
  mongo_fail "mongod --version does not report 8.0.38"
fi

step "T09 default teardown keeps the volume"
bash "${root}/tools/mongo/mongo-down.sh"
if ! mongo_docker volume inspect commercecore-mongo-data >/dev/null 2>&1; then
  mongo_fail "default teardown removed commercecore-mongo-data"
fi
bash "${root}/tools/mongo/mongo-up.sh"
mongosh_file /bootstrap/probe-read.js

printf 'mongo-infra-smoke: PASS\n'
printf 'g5: NOT_CLAIMED\n'
