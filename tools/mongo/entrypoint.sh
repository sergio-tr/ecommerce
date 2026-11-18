#!/usr/bin/env bash
# Copy the Compose secret to a mode-400 file the mongodb user can read.
# The official image starts as root and docker-entrypoint.sh drops to uid 999.
set -euo pipefail

source=/run/secrets/mongo-keyfile
target=/tmp/mongo-keyfile

if [[ ! -f "$source" ]]; then
  printf 'mongo-entrypoint: missing keyfile\n' >&2
  exit 1
fi

cp "$source" "$target"
chown 999:999 "$target"
chmod 400 "$target"

rewritten=()
skip=0
for arg in "$@"; do
  if [[ "$skip" -eq 1 ]]; then
    rewritten+=("$target")
    skip=0
    continue
  fi
  case "$arg" in
    --keyFile)
      rewritten+=(--keyFile)
      skip=1
      ;;
    --keyFile=*)
      rewritten+=("--keyFile=${target}")
      ;;
    *)
      rewritten+=("$arg")
      ;;
  esac
done

if [[ "$skip" -eq 1 ]]; then
  printf 'mongo-entrypoint: --keyFile is missing its path\n' >&2
  exit 1
fi

exec /usr/local/bin/docker-entrypoint.sh "${rewritten[@]}"
