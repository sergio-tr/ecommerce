#!/usr/bin/env bash
# Shared helpers for the local MongoDB Compose path. No secret values are printed.
set -euo pipefail

mongo_root() {
  (cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
}

mongo_docker() {
  local docker_bin="${MONGO_DOCKER_BIN:-docker}"
  "$docker_bin" "$@"
}

mongo_fail() {
  printf '%s: %s\n' "${MONGO_LOG_PREFIX:-mongo}" "$1" >&2
  exit 1
}

mongo_pending() {
  printf '%s: WAITING_OWNER_LOCAL\nreason: %s\n' "${MONGO_LOG_PREFIX:-mongo}" "$1"
  exit 2
}

mongo_read_key() {
  local key="$1"
  local file="$2"
  local line
  line="$(grep -E "^${key}=" "$file" | tail -n 1 || true)"
  [[ -n "$line" ]] || return 1
  local value="${line#*=}"
  value="${value%$'\r'}"
  if [[ ${#value} -ge 2 && "${value:0:1}" == '"' && "${value: -1}" == '"' ]]; then
    value="${value:1:${#value}-2}"
  fi
  printf '%s' "$value"
}

mongo_reject_credential() {
  local label="$1"
  local value="$2"
  if [[ -z "${value//[[:space:]]/}" ]]; then
    mongo_fail "empty ${label}"
  fi
  if [[ "$value" == *$'\n'* || "$value" == *$'\r'* || "$value" == *'"'* ]]; then
    mongo_fail "${label} contains a newline or a double quote"
  fi
}

mongo_load_credentials() {
  local root env_file username password
  root="$(mongo_root)"
  env_file="${MONGO_ENV_FILE:-${root}/.env.local}"
  if [[ ! -f "$env_file" ]]; then
    mongo_fail "missing ${env_file}"
  fi
  username="$(mongo_read_key MONGO_INITDB_ROOT_USERNAME "$env_file" || true)"
  password="$(mongo_read_key MONGO_INITDB_ROOT_PASSWORD "$env_file" || true)"
  mongo_reject_credential MONGO_INITDB_ROOT_USERNAME "$username"
  mongo_reject_credential MONGO_INITDB_ROOT_PASSWORD "$password"
  MONGO_USERNAME="$username"
  MONGO_PASSWORD="$password"
  export MONGO_USERNAME MONGO_PASSWORD
  export MONGO_INITDB_ROOT_USERNAME="$username"
  export MONGO_INITDB_ROOT_PASSWORD="$password"
}

mongo_publish_port() {
  local port="${MONGO_PUBLISH_PORT:-27017}"
  if [[ ! "$port" =~ ^[0-9]+$ ]]; then
    mongo_fail "MONGO_PUBLISH_PORT must be an integer from 1 to 65535"
  fi
  if ((port < 1 || port > 65535)); then
    mongo_fail "MONGO_PUBLISH_PORT must be an integer from 1 to 65535"
  fi
  printf '%s' "$port"
}

mongo_require_docker() {
  local docker_bin="${MONGO_DOCKER_BIN:-docker}"
  if [[ "$docker_bin" == "docker" ]]; then
    command -v docker >/dev/null 2>&1 || mongo_pending "docker is not installed"
  elif [[ ! -x "$docker_bin" ]]; then
    mongo_pending "docker is not installed"
  fi
  mongo_docker info >/dev/null 2>&1 || mongo_pending "the docker daemon is not reachable"
  mongo_docker compose version >/dev/null 2>&1 || mongo_pending "docker compose is not available"
}

mongo_prepare_runtime() {
  local root runtime_dir keyfile runtime_env volume_name port
  root="$(mongo_root)"
  runtime_dir="${MONGO_RUNTIME_DIR:-${root}/tmp/mongo}"
  keyfile="${runtime_dir}/keyfile"
  runtime_env="${runtime_dir}/runtime.env"
  volume_name=commercecore-mongo-data
  port="$(mongo_publish_port)"
  mongo_require_docker
  umask 077
  mkdir -p "$runtime_dir"
  if mongo_docker volume inspect "$volume_name" >/dev/null 2>&1; then
    if [[ ! -s "$keyfile" ]]; then
      mongo_fail "volume ${volume_name} exists but ${keyfile} is missing; refusing to mint a new keyfile"
    fi
  elif [[ ! -s "$keyfile" ]]; then
    head -c 756 /dev/urandom | base64 >"$keyfile"
  fi
  chmod 400 "$keyfile"
  {
    printf 'MONGO_INITDB_ROOT_USERNAME="%s"\n' "$MONGO_USERNAME"
    printf 'MONGO_INITDB_ROOT_PASSWORD="%s"\n' "$MONGO_PASSWORD"
  } >"$runtime_env"
  chmod 600 "$runtime_env"
  export MONGO_PUBLISH_PORT="$port"
  export MONGO_KEYFILE_FILE="$keyfile"
  export MONGO_RUNTIME_ENV="$runtime_env"
  printf '127.0.0.1:%s\n' "$port" >"${runtime_dir}/published-port"
  printf '%s: publish=127.0.0.1:%s\n' "${MONGO_LOG_PREFIX:-mongo}" "$port"
}

mongo_compose() {
  local root
  root="$(mongo_root)"
  mongo_docker compose \
    --project-directory "${root}/tools/mongo" \
    --file "${root}/tools/mongo/compose.yaml" \
    "$@"
}
