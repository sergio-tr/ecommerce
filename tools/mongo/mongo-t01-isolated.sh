#!/usr/bin/env bash
# Clean T01 on a separate Compose project. This does not claim the live volume's T01 or G5.
# It never removes commercecore-mongo-data, commercecore-mongo, or the live keyfile.
set -euo pipefail

MONGO_LOG_PREFIX=mongo-t01-isolated
# shellcheck source=lib.sh
source "$(dirname "$0")/lib.sh"

LIVE_VOLUME=commercecore-mongo-data
LIVE_CONTAINER=commercecore-mongo
LIVE_NETWORK=commercecore-mongo
LIVE_PORT=27017
ISO_VOLUME=commercecore-mongo-t01-data
ISO_CONTAINER=commercecore-mongo-t01
ISO_NETWORK=commercecore-mongo-t01
ISO_PORT=27018
ISO_PROJECT=commercecore-mongo-t01
PINNED_IMAGE=docker.io/library/mongo:8.0.38-noble@sha256:76a93cc399d05709baeea4e55385749657aa0085ad5b497c851380778eccea2c

if [[ "$#" -ne 0 ]]; then
  mongo_fail "arguments are not accepted"
fi
if [[ "$ISO_VOLUME" == "$LIVE_VOLUME" || "$ISO_CONTAINER" == "$LIVE_CONTAINER" || "$ISO_NETWORK" == "$LIVE_NETWORK" || "$ISO_PORT" == "$LIVE_PORT" || "$ISO_PROJECT" == "mongo" ]]; then
  mongo_fail "isolated names collide with the live project"
fi
if [[ "${MONGO_T01_PUBLISH_PORT:-27018}" != "$ISO_PORT" ]]; then
  mongo_fail "isolated T01 publish port is fixed at ${ISO_PORT}"
fi

root="$(mongo_root)"
runtime_dir="${MONGO_T01_RUNTIME_DIR:-${root}/tmp/mongo-t01}"
live_runtime="${root}/tmp/mongo"
case "$runtime_dir" in
  "$live_runtime"|"${live_runtime}/")
    mongo_fail "refusing to use the live runtime directory"
    ;;
esac

if [[ "${MONGO_T01_PLAN_ONLY:-}" == "1" ]]; then
  printf 'volume=%s\ncontainer=%s\nnetwork=%s\nport=%s\nproject=%s\nruntime=%s\n' \
    "$ISO_VOLUME" "$ISO_CONTAINER" "$ISO_NETWORK" "$ISO_PORT" "$ISO_PROJECT" "$runtime_dir"
  exit 0
fi

mongo_load_credentials
mongo_require_docker

started=0
cleaned=0
in_trap=0
live_recorded=0
live_volume_before=0
live_container_before=0

iso_compose() {
  mongo_docker compose \
    --project-name "$ISO_PROJECT" \
    --project-directory "${root}/tools/mongo" \
    --file "${root}/tools/mongo/compose.t01.yaml" \
    "$@"
}

trim() {
  local value="$1"
  value="${value//$'\r'/}"
  value="${value#"${value%%[![:space:]]*}"}"
  value="${value%"${value##*[![:space:]]}"}"
  printf '%s' "$value"
}

refuse() {
  if [[ "$in_trap" -eq 1 ]]; then
    return 1
  fi
  mongo_fail "$1"
}

assert_isolated_config() {
  local volumes images
  volumes="$(trim "$(iso_compose config --volumes)")"
  images="$(trim "$(iso_compose config --images)")"
  if [[ "$volumes" != "$ISO_VOLUME" || "$volumes" == "$LIVE_VOLUME" ]]; then
    refuse "isolated compose volumes are not ${ISO_VOLUME}"
  fi
  if [[ "$images" != "$PINNED_IMAGE" ]]; then
    refuse "isolated compose image is not the pinned index"
  fi
}

remove_isolated_names() {
  assert_isolated_config
  if [[ "$ISO_CONTAINER" != "commercecore-mongo-t01" || "$ISO_VOLUME" != "commercecore-mongo-t01-data" || "$ISO_NETWORK" != "commercecore-mongo-t01" ]]; then
    refuse "refusing to remove live names"
  fi
  iso_compose down -v
  if mongo_docker container inspect "$ISO_CONTAINER" >/dev/null 2>&1; then
    mongo_docker rm -f "$ISO_CONTAINER"
  fi
  if mongo_docker volume inspect "$ISO_VOLUME" >/dev/null 2>&1; then
    mongo_docker volume rm "$ISO_VOLUME"
  fi
  if mongo_docker network inspect "$ISO_NETWORK" >/dev/null 2>&1; then
    mongo_docker network rm "$ISO_NETWORK"
  fi
}

live_exists() {
  local kind="$1"
  local name="$2"
  mongo_docker "$kind" inspect "$name" >/dev/null 2>&1
}

record_live() {
  live_volume_before=0
  live_container_before=0
  if live_exists volume "$LIVE_VOLUME"; then
    live_volume_before=1
  fi
  if live_exists container "$LIVE_CONTAINER"; then
    live_container_before=1
  fi
  live_recorded=1
}

assert_live_unchanged() {
  local volume_after=0
  local container_after=0
  if [[ "$live_recorded" -ne 1 ]]; then
    return 0
  fi
  if live_exists volume "$LIVE_VOLUME"; then
    volume_after=1
  fi
  if live_exists container "$LIVE_CONTAINER"; then
    container_after=1
  fi
  if [[ "$volume_after" -ne "$live_volume_before" || "$container_after" -ne "$live_container_before" ]]; then
    printf '%s: live volume or container changed\n' "$MONGO_LOG_PREFIX" >&2
    return 1
  fi
}

on_exit() {
  local status=$?
  trap - EXIT
  in_trap=1
  if [[ "$started" -eq 1 && "$cleaned" -eq 0 ]]; then
    remove_isolated_names >/dev/null 2>&1 || true
  fi
  if ! assert_live_unchanged; then
    status=1
  fi
  exit "$status"
}
trap on_exit EXIT

record_live

umask 077
mkdir -p "$runtime_dir"
keyfile="${runtime_dir}/keyfile"
runtime_env="${runtime_dir}/runtime.env"
if [[ ! -s "$keyfile" ]]; then
  head -c 756 /dev/urandom | base64 >"$keyfile"
fi
chmod 400 "$keyfile"
{
  printf 'MONGO_INITDB_ROOT_USERNAME="%s"\n' "$MONGO_USERNAME"
  printf 'MONGO_INITDB_ROOT_PASSWORD="%s"\n' "$MONGO_PASSWORD"
} >"$runtime_env"
chmod 600 "$runtime_env"
export MONGO_T01_PUBLISH_PORT="$ISO_PORT"
export MONGO_T01_KEYFILE_FILE="$keyfile"
export MONGO_T01_RUNTIME_ENV="$runtime_env"

started=1
remove_isolated_names
printf '%s: publish=127.0.0.1:%s\n' "$MONGO_LOG_PREFIX" "$ISO_PORT"
if ! iso_compose up -d; then
  mongo_fail "isolated compose up failed"
fi

ready=0
for _ in $(seq 1 90); do
  set +e
  iso_compose exec -T mongo bash /bootstrap/bootstrap.sh
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

iso_compose exec -T mongo bash -lc \
  'mongosh --quiet --username "$MONGO_INITDB_ROOT_USERNAME" --password "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin --file /bootstrap/probe-write.js'

set +e
token="$(
  iso_compose exec -T mongo \
    bash --noprofile --norc -c \
    'unset MONGO_INITDB_ROOT_USERNAME MONGO_INITDB_ROOT_PASSWORD MONGODB_URI; exec mongosh --quiet --norc --file /bootstrap/probe-anonymous.js'
)"
read_status=$?
set -e
token="$(trim "$token")"
if [[ "$read_status" -eq 0 || "$token" != "AUTH_REJECTED" ]]; then
  mongo_fail "anonymous infra_probe read was not rejected"
fi
printf '%s: anonymous infra_probe read rejected\n' "$MONGO_LOG_PREFIX"

remove_isolated_names
cleaned=1
assert_live_unchanged
printf '%s: live volume unchanged\n' "$MONGO_LOG_PREFIX"
printf '%s: T01_ISOLATED_PASS\n' "$MONGO_LOG_PREFIX"
printf '%s: t01-live=NOT_CLAIMED\n' "$MONGO_LOG_PREFIX"
printf '%s: matrix=NOT_CLAIMED\n' "$MONGO_LOG_PREFIX"
printf 'g5: NOT_CLAIMED\n'
