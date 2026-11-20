#!/usr/bin/env bash
# Two stateless API pods on one local k3d server.
# Exit 0 is a real probe pass. Exit 2 is PENDING_OWNER_LOCAL. Exit 1 is a failed smoke.
# Two pods on one server are not cluster HA, and this script does not claim G5.
# It deletes only its own cluster. It does not delete the one-replica cluster or a Mongo volume.
set -euo pipefail

CLUSTER_NAME=commercecore-two-replica
NAMESPACE=commerce-apps
RELEASE=commercecore-api
IMAGE=commercecore-api:local
HOST_PORT=18081
API_PORT=6551
K3S_IMAGE=rancher/k3s:v1.37.1-k3s1
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CHART="${ROOT}/deploy/helm/commercecore-api"
VALUES="${CHART}/values-two-replica.yaml"
CONTRACT="${ROOT}/tools/k8s/two-replica-contract.mjs"
WORKDIR=""
PF_PIDS=()

pending() {
  printf 'k3d-two-replica: PENDING_OWNER_LOCAL\nreason: %s\nservers: 1\ningress: NOT_INSTALLED\nha: NOT_CLAIMED\ng5: NOT_CLAIMED\n' "$1"
  exit 2
}

fail() {
  printf 'k3d-two-replica: FAIL\nreason: %s\nha: NOT_CLAIMED\ng5: NOT_CLAIMED\n' "$1" >&2
  kubectl --namespace "${NAMESPACE}" get pods,endpoints,svc >&2 || true
  exit 1
}

stop_forwards() {
  local pid
  for pid in "${PF_PIDS[@]}"; do
    kill "${pid}" >/dev/null 2>&1 || true
    wait "${pid}" >/dev/null 2>&1 || true
  done
  PF_PIDS=()
}

cleanup() {
  stop_forwards
  if command -v k3d >/dev/null 2>&1; then
    k3d cluster delete "${CLUSTER_NAME}" >/dev/null 2>&1 || true
  fi
  if [[ -n "${WORKDIR}" ]]; then
    rm -rf "${WORKDIR}"
  fi
}

command -v docker >/dev/null 2>&1 || pending "docker is not installed"
docker info >/dev/null 2>&1 || pending "the docker daemon is not reachable"
command -v k3d >/dev/null 2>&1 || pending "k3d is not installed"
command -v kubectl >/dev/null 2>&1 || pending "kubectl is not installed"
command -v helm >/dev/null 2>&1 || pending "helm is not installed"
command -v curl >/dev/null 2>&1 || pending "curl is not installed"
command -v node >/dev/null 2>&1 || pending "node is not installed"

trap cleanup EXIT
WORKDIR="$(mktemp -d /tmp/commercecore-two-replica.XXXXXX)"

probe_body() {
  local url="$1"
  local body="${WORKDIR}/health.json"
  curl -fsS "${url}" -o "${body}"
  node "${CONTRACT}" check-health "${body}"
}

port_forward() {
  local target="$1"
  local port="$2"
  kubectl --namespace "${NAMESPACE}" port-forward --address 127.0.0.1 "${target}" "${port}:3000" \
    >"${WORKDIR}/pf-${port}.log" 2>&1 &
  PF_PIDS+=("$!")
}

wait_probe() {
  local url="$1"
  local attempt
  for attempt in $(seq 1 40); do
    if probe_body "${url}"; then
      return 0
    fi
    sleep 1
  done
  return 1
}

collect() {
  kubectl get nodes -o json >"${WORKDIR}/nodes.json"
  kubectl --namespace "${NAMESPACE}" get pods -o json >"${WORKDIR}/pods.json"
  kubectl --namespace "${NAMESPACE}" get endpoints "${RELEASE}" -o json >"${WORKDIR}/endpoints.json"
  kubectl --namespace "${NAMESPACE}" get service "${RELEASE}" -o json >"${WORKDIR}/service.json"
}

assert_cluster() {
  local service_curls="$1"
  local pod_curls="$2"
  collect
  node "${CONTRACT}" check-cluster \
    "${WORKDIR}/nodes.json" \
    "${WORKDIR}/pods.json" \
    "${WORKDIR}/endpoints.json" \
    "${WORKDIR}/service.json" \
    "${service_curls}" \
    "${pod_curls}"
}

docker build -t "${IMAGE}" "${ROOT}"
k3d cluster create "${CLUSTER_NAME}" \
  --image "${K3S_IMAGE}" \
  --servers 1 \
  --agents 0 \
  --no-lb \
  --api-port "127.0.0.1:${API_PORT}" \
  --k3s-arg "--disable=traefik@server:0" \
  --wait
k3d image import "${IMAGE}" --cluster "${CLUSTER_NAME}"
kubectl create namespace "${NAMESPACE}"
helm upgrade --install "${RELEASE}" "${CHART}" \
  --namespace "${NAMESPACE}" \
  --values "${VALUES}" \
  --set image.tag=local \
  --wait \
  --timeout 180s
kubectl --namespace "${NAMESPACE}" rollout status "deployment/${RELEASE}" --timeout=180s

probe_pair() {
  local service_curls=0
  local pod_curls=0
  local pod_port=18082
  local pod
  stop_forwards
  port_forward "svc/${RELEASE}" "${HOST_PORT}"
  for _ in $(seq 1 8); do
    wait_probe "http://127.0.0.1:${HOST_PORT}/health/live" || fail "ClusterIP /health/live failed"
    service_curls=$((service_curls + 1))
  done
  while IFS= read -r pod; do
    [[ -n "${pod}" ]] || continue
    port_forward "${pod}" "${pod_port}"
    wait_probe "http://127.0.0.1:${pod_port}/health/live" || fail "${pod} did not serve /health/live"
    pod_curls=$((pod_curls + 1))
    pod_port=$((pod_port + 1))
  done < <(kubectl --namespace "${NAMESPACE}" get pods -l "app.kubernetes.io/name=${RELEASE},app.kubernetes.io/instance=${RELEASE}" -o name)
  assert_cluster "${service_curls}" "${pod_curls}" || fail "ready pods are not both selected by the ClusterIP"
}

probe_pair

set +e
helm upgrade "${RELEASE}" "${CHART}" \
  --namespace "${NAMESPACE}" \
  --reuse-values \
  --set image.tag=absent-local \
  --wait \
  --timeout 40s
bad_upgrade=$?
set -e
if [[ "${bad_upgrade}" -eq 0 ]]; then
  fail "an unpulled image tag rolled out"
fi
if ! kubectl --namespace "${NAMESPACE}" get pods -o json | grep -Eq 'ErrImageNeverPull|ImagePullBackOff|ErrImagePull'; then
  fail "the unpulled image did not leave a pod unready"
fi
helm rollback "${RELEASE}" --namespace "${NAMESPACE}" --wait --timeout 180s
kubectl --namespace "${NAMESPACE}" rollout status "deployment/${RELEASE}" --timeout=180s
probe_pair || fail "rollback did not restore two ready endpoints"

printf 'k3d-two-replica: PASS\nready-pods: 2\nendpoints: 2\nservers: 1\nrollback: PASS\ningress: NOT_INSTALLED\nha: NOT_CLAIMED\ng5: NOT_CLAIMED\n'
