#!/usr/bin/env bash
# Opt-in local evidence for two CommerceCore API pods on one k3d server.
# Exit 0 and k3d-two-replica-smoke: PASS only after a real in-cluster probe.
# Exit 2 is PENDING_OWNER_LOCAL. Exit 1 is a failed or refused run.
# Two ready endpoints do not prove per-request balancing, HA, or G5.
# CI must run the Node shims, not this cluster path.
# The trap deletes only a cluster this invocation created.
set -euo pipefail

CLUSTER_NAME=commercecore-two-replica
CONTEXT="k3d-${CLUSTER_NAME}"
NAMESPACE=commerce-apps
RELEASE=commercecore-api
IMAGE=commercecore-api:local
K3S_IMAGE=rancher/k3s:v1.37.1-k3s1
API_PORT=6551
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CHART="${ROOT}/deploy/helm/commercecore-api"
VALUES="${CHART}/values-two-replica.yaml"
CONTRACT="${ROOT}/tools/k8s/two-replica-contract.mjs"
PROBE_SOURCE="${ROOT}/tools/k8s/two-replica-probe.mjs"
WORKDIR=""
KUBECONFIG=""
CREATED=0
SHA=""

pending() {
  printf 'k3d-two-replica-smoke: PENDING_OWNER_LOCAL\nreason: %s\nservers: 1\ningress: NOT_INSTALLED\nbalance: NOT_PROVEN\nha: NOT_CLAIMED\nG5: NOT_CLAIMED\ng5: NOT_CLAIMED\nruntime: NOT_RUN\n' "$1"
  exit 2
}

refuse() {
  printf 'k3d-two-replica-smoke: FAIL\nreason: %s\nbalance: NOT_PROVEN\nha: NOT_CLAIMED\nG5: NOT_CLAIMED\nruntime: NOT_RUN\n' "$1" >&2
  exit 1
}

emit_evidence() {
  local status="$1"
  STATUS="${status}" SHA="${SHA}" WORKDIR="${WORKDIR}" node --input-type=module <<'EOF'
import { readFileSync } from 'node:fs';
import path from 'node:path';

function field(name) {
  try {
    const value = readFileSync(path.join(process.env.WORKDIR, name), 'utf8')
      .replace(/[\r\n]+/g, ' ')
      .trim()
      .slice(0, 80);
    return value.length > 0 ? value : 'unavailable';
  } catch {
    return 'unavailable';
  }
}

const payload = {
  sha: process.env.SHA || 'unavailable',
  status: process.env.STATUS,
  ingress: 'NOT_INSTALLED',
  balance: 'NOT_PROVEN',
  ha: 'NOT_CLAIMED',
  g5: 'NOT_CLAIMED',
  runtime: 'EXECUTED',
  docker: field('docker.txt'),
  k3d: field('k3d.txt'),
  kubectl: field('kubectl.txt'),
  helm: field('helm.txt'),
  node: field('node.txt'),
};
if (process.env.STATUS === 'PASS') {
  payload.servers = 1;
  payload.readyPods = 2;
  payload.endpoints = 2;
  payload.serviceProbes = 8;
  payload.podProbes = 2;
}
process.stdout.write(`k3d-two-replica-smoke: evidence ${JSON.stringify(payload)}\n`);
EOF
}

fail() {
  printf 'k3d-two-replica-smoke: FAIL\nreason: %s\nbalance: NOT_PROVEN\nha: NOT_CLAIMED\nG5: NOT_CLAIMED\nruntime: EXECUTED\n' "$1" >&2
  emit_evidence FAIL || true
  exit 1
}

cleanup() {
  if [[ "${CREATED}" == 1 ]]; then
    k3d cluster delete "${CLUSTER_NAME}" >/dev/null 2>&1 || true
  fi
  if [[ "${WORKDIR}" == /tmp/commercecore-two-replica.* ]]; then
    rm -rf "${WORKDIR}"
  fi
}

write_text() {
  local name="$1"
  shift
  if "$@" >"${WORKDIR}/${name}" 2>/dev/null; then
    return 0
  fi
  printf 'unavailable\n' >"${WORKDIR}/${name}"
}

command -v docker >/dev/null 2>&1 || pending "docker is not installed"
docker info >/dev/null 2>&1 || pending "the docker daemon is not reachable"
command -v k3d >/dev/null 2>&1 || pending "k3d is not installed"
command -v kubectl >/dev/null 2>&1 || pending "kubectl is not installed"
command -v helm >/dev/null 2>&1 || pending "helm is not installed"
command -v node >/dev/null 2>&1 || pending "node is not installed"

WORKDIR="$(mktemp -d /tmp/commercecore-two-replica.XXXXXX)"
KUBECONFIG="${WORKDIR}/kubeconfig"
trap cleanup EXIT

k3d cluster list -o json >"${WORKDIR}/clusters.json" || refuse "k3d cluster list failed"
listed=0
node "${CONTRACT}" cluster-exists "${CLUSTER_NAME}" "${WORKDIR}/clusters.json" || listed=$?
if [[ "${listed}" -eq 0 ]]; then
  refuse "cluster ${CLUSTER_NAME} already exists"
fi
if [[ "${listed}" -ne 2 ]]; then
  refuse "k3d cluster list was not readable"
fi

SHA="$(git -C "${ROOT}" rev-parse HEAD 2>/dev/null || true)"
write_text docker.txt docker version --format '{{.Server.Version}}'
write_text k3d.txt k3d version
write_text kubectl.txt kubectl version --client
write_text helm.txt helm version --short
write_text node.txt node --version

docker build -t "${IMAGE}" "${ROOT}" || refuse "local image build failed"
CREATED=1
k3d cluster create "${CLUSTER_NAME}" \
  --image "${K3S_IMAGE}" \
  --servers 1 \
  --agents 0 \
  --no-lb \
  --api-port "127.0.0.1:${API_PORT}" \
  --k3s-arg "--disable=traefik@server:0" \
  --kubeconfig-update-default=false \
  --kubeconfig-switch-context=false \
  --timeout 180s \
  --wait \
  || fail "k3d cluster was not created"
k3d kubeconfig get "${CLUSTER_NAME}" >"${KUBECONFIG}" || fail "owned kubeconfig was not written"
chmod 600 "${KUBECONFIG}" || fail "owned kubeconfig was not private"
export KUBECONFIG
k3d image import "${IMAGE}" --cluster "${CLUSTER_NAME}" || fail "local image was not imported"

kubectl --context "${CONTEXT}" get nodes >/dev/null || fail "owned context is not reachable"
helm upgrade --install "${RELEASE}" "${CHART}" \
  --kube-context "${CONTEXT}" \
  --namespace "${NAMESPACE}" \
  --create-namespace \
  --values "${VALUES}" \
  --set image.tag=local \
  --wait \
  --timeout 180s \
  || fail "helm install did not become ready"
kubectl --context "${CONTEXT}" --namespace "${NAMESPACE}" rollout status "deployment/${RELEASE}" --timeout=180s \
  || fail "deployment did not become ready"

kubectl --context "${CONTEXT}" get nodes -o json >"${WORKDIR}/nodes.json" || fail "owned context did not return nodes"
kubectl --context "${CONTEXT}" --namespace "${NAMESPACE}" get pods -o json >"${WORKDIR}/pods.json" \
  || fail "owned context did not return pods"
kubectl --context "${CONTEXT}" --namespace "${NAMESPACE}" get endpoints "${RELEASE}" -o json >"${WORKDIR}/endpoints.json" \
  || fail "owned context did not return endpoints"
kubectl --context "${CONTEXT}" --namespace "${NAMESPACE}" get service "${RELEASE}" -o json >"${WORKDIR}/service.json" \
  || fail "owned context did not return the service"
node "${CONTRACT}" print-targets "${WORKDIR}/pods.json" "${WORKDIR}/service.json" >"${WORKDIR}/targets.json" \
  || fail "ready pods or service target did not match"
node "${CONTRACT}" write-probe-pod "${WORKDIR}/targets.json" >"${WORKDIR}/probe-pod.json" \
  || fail "probe manifest was rejected"
kubectl --context "${CONTEXT}" --namespace "${NAMESPACE}" create configmap commercecore-two-replica-probe \
  --from-file="two-replica-probe.mjs=${PROBE_SOURCE}" \
  || fail "probe configmap was not created"
kubectl --context "${CONTEXT}" apply -f "${WORKDIR}/probe-pod.json" || fail "probe pod was not created"
kubectl --context "${CONTEXT}" --namespace "${NAMESPACE}" wait \
  --for=jsonpath='{.status.phase}'=Succeeded \
  pod/commercecore-two-replica-probe \
  --timeout=90s \
  || fail "in-cluster probe did not succeed"
kubectl --context "${CONTEXT}" --namespace "${NAMESPACE}" logs commercecore-two-replica-probe >"${WORKDIR}/probe.log" \
  || fail "in-cluster probe log was not readable"
node "${CONTRACT}" check-probe-log "${WORKDIR}/probe.log" "${WORKDIR}/targets.json" \
  || fail "in-cluster health probe did not match"
node "${CONTRACT}" check-cluster \
  "${WORKDIR}/nodes.json" \
  "${WORKDIR}/pods.json" \
  "${WORKDIR}/endpoints.json" \
  "${WORKDIR}/service.json" \
  8 \
  2 \
  || fail "cluster contract rejected the live objects"

emit_evidence PASS || fail "evidence record was not written"
printf 'k3d-two-replica-smoke: PASS\nready-pods: 2\nendpoints: 2\nservers: 1\nservice-probes: 8\npod-probes: 2\ningress: NOT_INSTALLED\nbalance: NOT_PROVEN\nha: NOT_CLAIMED\nG5: NOT_CLAIMED\ng5: NOT_CLAIMED\nruntime: EXECUTED\n'
