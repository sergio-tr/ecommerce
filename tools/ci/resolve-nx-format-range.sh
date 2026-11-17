#!/usr/bin/env bash
# Print the base and head commits for `nx format:check`.
# Nx diffs the merge-base of those commits. If that lookup fails, Nx formats
# every file. If the two commits are the same, the diff is empty and the check
# passes without reading the pushed files.
set -euo pipefail

ZERO_SHA=0000000000000000000000000000000000000000

die() {
  echo "nx-format-range: $*" >&2
  exit 1
}

is_sha() {
  [[ "$1" =~ ^[0-9a-f]{40}$ ]]
}

require_head() {
  if ! is_sha "${GITHUB_SHA:-}"; then
    die "GITHUB_SHA must be a 40-character hexadecimal commit"
  fi
  local actual
  actual="$(git rev-parse HEAD)"
  if [[ "$actual" != "$GITHUB_SHA" ]]; then
    die "checkout HEAD ${actual} does not match GITHUB_SHA ${GITHUB_SHA}"
  fi
}

file_count() {
  git diff --name-only --no-renames "$1" "$2" | wc -l | tr -d '[:space:]'
}

write_result() {
  local base="$1"
  local head="$2"
  local files="$3"
  if ! is_sha "$base" || ! is_sha "$head"; then
    die "resolved range is not two commit SHAs"
  fi
  echo "nx-format-range event=${GITHUB_EVENT_NAME} base=${base} head=${head} files=${files}"
  if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
    {
      echo "base=${base}"
      echo "head=${head}"
      echo "files=${files}"
    } >>"${GITHUB_OUTPUT}"
  fi
}

require_head

case "${GITHUB_EVENT_NAME:-}" in
  pull_request)
    ref="${PR_BASE_REF:-}"
    if [[ -z "$ref" || "$ref" == -* || "$ref" == *..* || ! "$ref" =~ ^[A-Za-z0-9._/-]+$ ]]; then
      die "pull_request base ref is missing or unsafe"
    fi
    if ! git fetch --no-tags --depth=1 origin "${ref}:refs/format-base"; then
      die "could not fetch pull_request base ref ${ref}"
    fi
    base="$(git rev-parse refs/format-base)"
    write_result "$base" "$GITHUB_SHA" "$(file_count "$base" "$GITHUB_SHA")"
    ;;
  push)
    before="${PUSH_BEFORE:-}"
    if [[ "$before" == "$ZERO_SHA" ]]; then
      die "push before SHA is zero; refusing an unbounded history comparison"
    fi
    if ! is_sha "$before"; then
      die "push before SHA is missing or not a commit SHA"
    fi
    if [[ "$before" == "$GITHUB_SHA" ]]; then
      die "push before SHA equals HEAD; refusing an empty format range"
    fi
    if ! git fetch --no-tags --depth=1 origin "$before"; then
      die "could not fetch push before SHA ${before}"
    fi
    if ! git cat-file -e "${before}^{commit}"; then
      die "push before SHA ${before} is not a commit after fetch"
    fi
    files="$(file_count "$before" "$GITHUB_SHA")"
    if [[ "$files" == "0" ]]; then
      die "push diff is empty; refusing a format check that would read no files"
    fi
    write_result "$before" "$GITHUB_SHA" "$files"
    ;;
  *)
    die "unsupported event ${GITHUB_EVENT_NAME:-unset}"
    ;;
esac
