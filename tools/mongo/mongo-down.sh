#!/usr/bin/env bash
# Stop the local MongoDB Compose project.
# The default keeps the named volume. --destroy-volume is the only removal path.
# MONGO_DOWN_PLAN_ONLY=1 prints the action and does not call Docker.
set -euo pipefail

MONGO_LOG_PREFIX=mongo-down
# shellcheck source=lib.sh
source "$(dirname "$0")/lib.sh"

action=down
if [[ $# -gt 1 ]]; then
  mongo_fail "too many arguments"
fi
if [[ "${1:-}" == "--destroy-volume" ]]; then
  action=down-volume
elif [[ -n "${1:-}" ]]; then
  mongo_fail "unknown argument: ${1}"
fi

if [[ "${MONGO_DOWN_PLAN_ONLY:-}" == "1" ]]; then
  printf '%s\n' "$action"
  exit 0
fi

mongo_require_docker
root="$(mongo_root)"
runtime_dir="${MONGO_RUNTIME_DIR:-${root}/tmp/mongo}"

if [[ "$action" == "down-volume" ]]; then
  mongo_compose down -v
  rm -f "${runtime_dir}/keyfile" "${runtime_dir}/runtime.env"
  printf 'mongo-down: volume removed\n'
else
  mongo_compose down
  rm -f "${runtime_dir}/runtime.env"
  printf 'mongo-down: volume kept\n'
fi
