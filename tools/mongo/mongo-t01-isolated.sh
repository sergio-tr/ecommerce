#!/usr/bin/env bash
# Clean T01 on a second Compose project. This does not claim T02-T09 or G5.
# It does not read .env.local, does not write tmp/mongo, and does not delete
# commercecore-mongo-data. --fresh is not accepted. A pre-existing isolated
# volume, container, or network is left in place and the command stops.
set -euo pipefail

MONGO_LOG_PREFIX=mongo-t01-isolated
# shellcheck source=lib.sh
source "$(dirname "$0")/lib.sh"

project=commercecore-mongo-t01
container=commercecore-mongo-t01
volume=commercecore-mongo-t01-data
network=commercecore-mongo-t01
port=27018
owner_volume=commercecore-mongo-data
owner_container=commercecore-mongo
owner_network=commercecore-mongo
started=0
removed=0
snapshots_ready=0

t01_owner_unchanged() {
  [[ "$(t01_inspect_text volume "$owner_volume" '{{.Name}}|{{.CreatedAt}}|{{.Mountpoint}}|{{json .Labels}}|{{json .Options}}')" == "$owner_volume_snapshot" ]] \
    && [[ "$(t01_inspect_text container "$owner_container" '{{.Id}}|{{.State.Status}}|{{json .HostConfig.PortBindings}}|{{json .Mounts}}')" == "$owner_container_snapshot" ]] \
    && [[ "$(t01_inspect_text network "$owner_network" '{{.Id}}|{{.Internal}}|{{json .Containers}}')" == "$owner_network_snapshot" ]] \
    && [[ "$(t01_file_digest "$owner_keyfile")" == "$owner_keyfile_snapshot" ]] \
    && [[ "$(t01_file_digest "$owner_env")" == "$owner_env_snapshot" ]]
}

on_exit() {
  local code=$?
  if [[ "$snapshots_ready" -eq 1 ]]; then
    if ! t01_owner_unchanged; then
      printf 'mongo-t01-isolated: owner resources changed\n' >&2
      code=1
    fi
  fi
  if [[ "$code" -ne 0 && "$started" -eq 1 && "$removed" -ne 1 ]]; then
    printf 'mongo-t01-isolated: isolated resources were left in place and were not deleted\n' >&2
  fi
  exit "$code"
}
trap on_exit EXIT

if [[ $# -ne 0 ]]; then
  mongo_fail "no arguments are accepted. --fresh is not available and nothing was deleted"
fi

if [[ "$project" == "commercecore-mongo" || "$container" == "$owner_container" || "$volume" == "$owner_volume" || "$network" == "$owner_network" || "$port" == "27017" ]]; then
  mongo_fail "isolated names collide with the owner Mongo resources. Nothing was deleted"
fi

mongo_require_docker

root="$(mongo_root)"
runtime_dir="${MONGO_T01_RUNTIME_DIR:-${root}/tmp/mongo-t01}"
owner_keyfile="${root}/tmp/mongo/keyfile"
owner_env="${root}/.env.local"
override="${root}/tools/mongo/compose.t01-isolated.yaml"
checker="${root}/tools/mongo/assert-isolated-config.js"

t01_canonical_dir() {
  local dir="$1"
  local parent base
  if [[ -d "$dir" ]]; then
    (cd "$dir" && pwd)
    return
  fi
  parent="$(dirname "$dir")"
  base="$(basename "$dir")"
  if [[ -d "$parent" ]]; then
    printf '%s/%s' "$(cd "$parent" && pwd)" "$base"
    return
  fi
  printf '%s' "$dir"
}

owner_runtime="$(t01_canonical_dir "${root}/tmp/mongo")"
t01_runtime="$(t01_canonical_dir "$runtime_dir")"
if [[ "$t01_runtime" == "$owner_runtime" || "$t01_runtime" == "$owner_runtime"/* ]]; then
  mongo_fail "isolated runtime dir collides with tmp/mongo. Nothing was deleted"
fi

t01_inspect_text() {
  local kind="$1"
  local name="$2"
  local format="$3"
  local out code
  set +e
  out="$(mongo_docker "$kind" inspect --format "$format" "$name" 2>/dev/null)"
  code=$?
  set -e
  if [[ "$code" -ne 0 ]]; then
    printf 'ABSENT'
    return 0
  fi
  printf '%s' "${out//$'\n'/ }"
}

t01_inspect_code() {
  local kind="$1"
  local name="$2"
  local code
  set +e
  mongo_docker "$kind" inspect "$name" >/dev/null 2>&1
  code=$?
  set -e
  printf '%s' "$code"
}

t01_file_digest() {
  local file="$1"
  if [[ ! -f "$file" ]]; then
    printf 'ABSENT'
    return 0
  fi
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$file" | awk '{print $1}'
    return 0
  fi
  shasum -a 256 "$file" | awk '{print $1}'
}

t01_compose() {
  mongo_docker compose \
    --project-directory "${root}/tools/mongo" \
    --project-name "$project" \
    --file "${root}/tools/mongo/compose.yaml" \
    --file "$override" \
    "$@"
}

t01_bounded_attempts() {
  local value="$1"
  local label="$2"
  if [[ ! "$value" =~ ^[0-9]+$ ]] || ((value < 1 || value > 90)); then
    mongo_fail "${label} must be an integer from 1 to 90"
  fi
  printf '%s' "$value"
}

t01_refuse_existing() {
  local kind="$1"
  local name="$2"
  local label="$3"
  local code
  code="$(t01_inspect_code "$kind" "$name")"
  if [[ "$code" -eq 0 ]]; then
    mongo_fail "isolated ${label} ${name} already exists. It was not deleted"
  fi
  if [[ "$code" -ne 1 ]]; then
    mongo_fail "could not inspect isolated ${label} ${name}. Nothing was deleted"
  fi
}

owner_volume_snapshot="$(t01_inspect_text volume "$owner_volume" '{{.Name}}|{{.CreatedAt}}|{{.Mountpoint}}|{{json .Labels}}|{{json .Options}}')"
owner_container_snapshot="$(t01_inspect_text container "$owner_container" '{{.Id}}|{{.State.Status}}|{{json .HostConfig.PortBindings}}|{{json .Mounts}}')"
owner_network_snapshot="$(t01_inspect_text network "$owner_network" '{{.Id}}|{{.Internal}}|{{json .Containers}}')"
owner_keyfile_snapshot="$(t01_file_digest "$owner_keyfile")"
owner_env_snapshot="$(t01_file_digest "$owner_env")"
snapshots_ready=1

t01_refuse_existing volume "$volume" volume
t01_refuse_existing container "$container" container
t01_refuse_existing network "$network" network

listing="$(mongo_docker ps -a --format '{{.Names}} {{.Ports}}')"
if [[ "$listing" == *":${port}->"* ]]; then
  mongo_fail "127.0.0.1:${port} is already published. Nothing was deleted"
fi

if ! command -v node >/dev/null 2>&1; then
  mongo_fail "node is required for the isolated config check. Nothing was started and nothing was deleted"
fi
if ! command -v od >/dev/null 2>&1; then
  mongo_fail "od is required to mint the isolated credential. Nothing was started and nothing was deleted"
fi

umask 077
mkdir -p "$runtime_dir"
chmod 700 "$runtime_dir"
keyfile="${runtime_dir}/keyfile"
runtime_env="${runtime_dir}/runtime.env"
head -c 756 /dev/urandom | base64 >"$keyfile"
chmod 400 "$keyfile"
username="t01-isolate"
password="$(od -An -tx1 -N 24 /dev/urandom | tr -d ' \n')"
mongo_reject_credential MONGO_INITDB_ROOT_USERNAME "$username"
mongo_reject_credential MONGO_INITDB_ROOT_PASSWORD "$password"
{
  printf 'MONGO_INITDB_ROOT_USERNAME="%s"\n' "$username"
  printf 'MONGO_INITDB_ROOT_PASSWORD="%s"\n' "$password"
} >"$runtime_env"
chmod 600 "$runtime_env"
unset password
export MONGO_PUBLISH_PORT="$port"
export MONGO_KEYFILE_FILE="$keyfile"
export MONGO_RUNTIME_ENV="$runtime_env"

bootstrap_attempts="$(t01_bounded_attempts "${MONGO_T01_BOOTSTRAP_ATTEMPTS:-90}" MONGO_T01_BOOTSTRAP_ATTEMPTS)"
mongosh_attempts="$(t01_bounded_attempts "${MONGO_T01_MONGOSH_ATTEMPTS:-90}" MONGO_T01_MONGOSH_ATTEMPTS)"

summary="$(t01_compose config --format json | node "$checker")"
printf 'mongo-t01-isolated: %s\n' "$summary"

started=1
if ! t01_compose up -d; then
  mongo_fail "isolated compose up failed. Owner resources were not removed"
fi

ready=0
for _ in $(seq 1 "$bootstrap_attempts"); do
  set +e
  t01_compose exec -T mongo bash /bootstrap/bootstrap.sh
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

wrote=0
for _ in $(seq 1 "$mongosh_attempts"); do
  if t01_compose exec -T mongo bash -lc \
    "mongosh --quiet --username \"\$MONGO_INITDB_ROOT_USERNAME\" --password \"\$MONGO_INITDB_ROOT_PASSWORD\" --authenticationDatabase admin --file /bootstrap/probe-write.js"; then
    wrote=1
    break
  fi
  sleep 1
done
if [[ "$wrote" -ne 1 ]]; then
  mongo_fail "credentialed infra_probe write did not succeed"
fi

anonymous_data_read_rejected() {
  local status token err_file err
  err_file="$(mktemp)"
  set +e
  token="$(
    t01_compose exec -T mongo \
      bash --noprofile --norc -c \
      'unset MONGO_INITDB_ROOT_USERNAME MONGO_INITDB_ROOT_PASSWORD MONGODB_URI; exec mongosh --quiet --norc --file /bootstrap/probe-anonymous.js' \
      2>"$err_file"
  )"
  status=$?
  set -e
  err="$(cat "$err_file" 2>/dev/null || true)"
  rm -f "$err_file"
  token="${token//$'\r'/}"
  token="${token#"${token%%[![:space:]]*}"}"
  token="${token%"${token##*[![:space:]]}"}"
  if [[ "$status" -eq 0 || "$token" == "AUTH_BYPASS" ]]; then
    mongo_fail "anonymous infra_probe read succeeded"
  fi
  if [[ "$token" == "AUTH_REJECTED" ]]; then
    printf 'mongo-t01-isolated: anonymous infra_probe read rejected\n'
    return 0
  fi
  if [[ "$token" == "NETWORK" || "$status" -eq 4 || "$err" == *"ECONNREFUSED"* || "$err" == *"Server selection"* || "$err" == *"getaddrinfo"* || "$err" == *"timed out"* ]]; then
    mongo_fail "anonymous infra_probe read failed before authorization"
  fi
  mongo_fail "anonymous infra_probe read was not an authorization rejection"
}

printf 'mongo-t01-isolated: T01 clean start\n'
anonymous_data_read_rejected

published="$(mongo_docker port "$container" 27017/tcp)"
published="${published//$'\r'/}"
published="${published#"${published%%[![:space:]]*}"}"
published="${published%"${published##*[![:space:]]}"}"
printf 'mongo-t01-isolated: port %s\n' "$published"
if [[ "$published" != "127.0.0.1:${port}" ]]; then
  mongo_fail "isolated published port is not 127.0.0.1:${port}"
fi

version="$(t01_compose exec -T mongo mongod --version)"
printf '%s\n' "$version"
if [[ "$version" != *"v8.0.38"* ]]; then
  mongo_fail "mongod --version does not report 8.0.38"
fi

if ! t01_owner_unchanged; then
  mongo_fail "owner resources changed before isolated teardown"
fi

summary_down="$(t01_compose config --format json | node "$checker")"
if [[ "$summary_down" != "$summary" ]]; then
  mongo_fail "isolated config changed before teardown. Isolated resources were not deleted"
fi

t01_compose down -v

if [[ "$(t01_inspect_code volume "$volume")" -ne 1 ]]; then
  mongo_fail "isolated volume remained after teardown"
fi
if [[ "$(t01_inspect_code container "$container")" -ne 1 ]]; then
  mongo_fail "isolated container remained after teardown"
fi
if [[ "$(t01_inspect_code network "$network")" -ne 1 ]]; then
  mongo_fail "isolated network remained after teardown"
fi
if ! t01_owner_unchanged; then
  mongo_fail "owner resources changed"
fi

rm -f "$keyfile" "$runtime_env"
removed=1

printf 'mongo-t01-isolated: owner volume unchanged\n'
printf 'mongo-t01-isolated: isolated volume removed\n'
printf 'mongo-t01-isolated: t01=ISOLATED_PASS\n'
printf 'mongo-t01-isolated: t02-t09=NOT_RUN\n'
printf 'mongo-t01-isolated: t06=NOT_CLAIMED\n'
printf 'mongo-t01-isolated: t08=NOT_CLAIMED\n'
printf 'mongo-t01-isolated: matrix=NOT_CLAIMED\n'
printf 'g5: NOT_CLAIMED\n'
