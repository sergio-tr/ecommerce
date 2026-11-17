#!/usr/bin/env bash
# Local-only k3d smoke for the CommerceCore API health workload.
# Exit 0 is a real probe pass. Exit 2 is PENDING_OWNER_LOCAL. Exit 1 is a failed smoke.
set -euo pipefail

CLUSTER_NAME=commercecore-local
NAMESPACE=commerce-apps
IMAGE=commercecore-api:local
HOST_PORT=18080
K3S_IMAGE=rancher/k3s:v1.37.1-k3s1
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

pending() {
  printf 'k3d-smoke: PENDING_OWNER_LOCAL\nreason: %s\n' "$1"
  exit 2
}

command -v docker >/dev/null 2>&1 || pending "docker is not installed"
docker info >/dev/null 2>&1 || pending "the docker daemon is not reachable"
command -v k3d >/dev/null 2>&1 || pending "k3d is not installed"
command -v kubectl >/dev/null 2>&1 || pending "kubectl is not installed"
command -v helm >/dev/null 2>&1 || pending "helm is not installed"
command -v curl >/dev/null 2>&1 || pending "curl is not installed"

PF_PID=""
cleanup() {
  if [[ -n "${PF_PID}" ]]; then
    kill "${PF_PID}" >/dev/null 2>&1 || true
    wait "${PF_PID}" >/dev/null 2>&1 || true
  fi
  k3d cluster delete "${CLUSTER_NAME}" >/dev/null 2>&1 || true
}
trap cleanup EXIT

docker build -t "${IMAGE}" "${ROOT}"
k3d cluster create "${CLUSTER_NAME}" \
  --image "${K3S_IMAGE}" \
  --servers 1 \
  --agents 0 \
  --no-lb \
  --api-port 127.0.0.1:6550 \
  --k3s-arg "--disable=traefik@server:0" \
  --wait
k3d image import "${IMAGE}" --cluster "${CLUSTER_NAME}"
kubectl create namespace "${NAMESPACE}"
helm upgrade --install commercecore-api "${ROOT}/deploy/helm/commercecore-api" \
  --namespace "${NAMESPACE}" \
  --set image.tag=local \
  --wait \
  --timeout 180s
kubectl --namespace "${NAMESPACE}" rollout status deployment/commercecore-api --timeout=180s
kubectl --namespace "${NAMESPACE}" port-forward --address 127.0.0.1 "svc/commercecore-api" "${HOST_PORT}:3000" \
  >/tmp/commercecore-api-port-forward.log 2>&1 &
PF_PID=$!

for _ in $(seq 1 40); do
  if curl -fsS "http://127.0.0.1:${HOST_PORT}/health/live"; then
    printf '\nk3d-smoke: PASS\n'
    exit 0
  fi
  sleep 1
done

printf 'k3d-smoke: FAIL\n' >&2
kubectl --namespace "${NAMESPACE}" describe pods >&2 || true
exit 1
