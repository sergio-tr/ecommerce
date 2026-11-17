# M01-K8S-01 — local image, Helm, and k3d smoke

**G5:** `WAIT_MERGE` (ready for owner review). Not `PASSED`. Chart lint, the chart contract, and an image build do not pass this gate. On 2026-11-17 at 21:37 Europe/Amsterdam the owner reported a WSL2 run of `bash tools/k8s/k3d-smoke.sh` on `affde2ce87e7569595598f7bc116819e65a67785`, the merge commit of [PR #47](https://github.com/sergio-tr/ecommerce/pull/47). The reported markers are `sha=` that commit, `exit=0`, and `k3d-smoke: PASS`. This repository does not contain `/tmp/k3d-smoke.log`. The report is owner-supplied, not an agent run and not an external attestation. An earlier `k3d-smoke: PASS` used an uncommitted local edit and is not this evidence. GitHub [#45](https://github.com/sergio-tr/ecommerce/issues/45) and Linear [SER-137](https://linear.app/sergiotr/issue/SER-137/m01-k8s-01-local-api-image-helm-and-k3d-smoke) stay open until this record is reviewed and merged and that merge is checked independently.

This slice packages the existing `commercecore-api` process. It does not add a business route, MongoDB, Stripe, a public Ingress, or a registry push.

## Security boundary

| Surface | Behavior |
|---|---|
| Host-local `node dist/apps/commercecore-api/main.js` | Binds `127.0.0.1` unless `COMMERCECORE_HTTP_HOST` is set |
| Allowed hosts | `127.0.0.1` and `0.0.0.0` only |
| Local Deployment | Sets `COMMERCECORE_HTTP_HOST=0.0.0.0` so probes can use the pod IP |
| Service | `ClusterIP` port 3000. No NodePort, LoadBalancer, hostPort, or hostNetwork |
| Service links | `enableServiceLinks: false` on the pod. The Service must not inject `COMMERCECORE_API_*` |
| Reach from the workstation | `kubectl port-forward` on `127.0.0.1` only |
| Image | Non-root `node` user, uid 1000, read-only root filesystem, `/tmp` emptyDir |
| Registry | Build locally. `imagePullPolicy: Never`. Do not `docker push` |

`0.0.0.0` is every interface in the pod network namespace. Do not set it in `.env.local`, and do not publish port 3000 on a host address other than loopback.

## Service links

Kubernetes defaults `enableServiceLinks` to true. The Service is named `commercecore-api`, so the kubelet injects Docker-link variables into the container. The first key the process sees is `COMMERCECORE_API_PORT` (`tcp://<cluster-ip>:3000`), together with the other `COMMERCECORE_API_*` siblings.

`loadPublicConfig` accepts only `COMMERCECORE_ENV`, `COMMERCECORE_HTTP_HOST`, `COMMERCECORE_HTTP_PORT`, `COMMERCECORE_LOG_LEVEL`, and `COMMERCECORE_SERVICE_VERSION`. Any other `COMMERCECORE_*` key throws `PublicConfigError` with reason `unsupported`. `main.ts` writes stderr event `config.invalid` and exits 1. The pod enters CrashLoopBackOff. `helm upgrade --install --wait --timeout 180s` then fails.

The mitigation is `enableServiceLinks: false` on `spec.template.spec` of the Deployment. The values schema has `additionalProperties: false`, so `--set enableServiceLinks=true` is rejected and the flag cannot be turned back on through values. The strict env validator is unchanged. Host-local processes still default to `127.0.0.1`. Only the chart sets `COMMERCECORE_HTTP_HOST=0.0.0.0`. The Service stays `ClusterIP`.

## Prerequisites (WSL2)

Use an Ubuntu WSL2 distro on the ext4 filesystem, not a `/mnt/c` checkout. Docker Desktop or the Docker Engine service must be running inside the integration the owner already uses. This repository does not install Docker, k3d, or a Kubernetes distribution for you.

Pinned tools:

| Tool | Pin |
|---|---|
| Node | 24.22.2 |
| pnpm | 11.10.0 |
| Image base | `node:24.22.2-bookworm-slim@sha256:01d566e8d94d8c619591d78652babfccd3c6992a3dffa9ed5ab39e11cf6c70e9` |
| Helm | 4.3.1 (`0403a88ae20913d11b10a2467b50087721fea7581736da6b9d3992f5357fe54b`) |
| k3d | v5.9.0 |
| K3s image | `rancher/k3s:v1.37.1-k3s1` |
| kubectl | A client that can talk to that cluster |

The Node digest is the multi-arch index returned by `registry-1.docker.io` for `library/node:24.22.2-bookworm-slim` on 2026-11-17. The build pulls that public image anonymously. It does not log in to Docker Hub and it does not push.

Install Helm 4.3.1 without a package repository:

```bash
curl -fsSL -o /tmp/helm.tgz https://get.helm.sh/helm-v4.3.1-linux-amd64.tar.gz
echo "0403a88ae20913d11b10a2467b50087721fea7581736da6b9d3992f5357fe54b  /tmp/helm.tgz" | sha256sum -c -
tar -C /tmp -xzf /tmp/helm.tgz linux-amd64/helm
sudo install -m 0755 /tmp/linux-amd64/helm /usr/local/bin/helm
helm version --short
```

Install k3d v5.9.0 from its GitHub release binary, and install kubectl from the Kubernetes release matching the client you already trust. Confirm:

```bash
docker version
k3d version
kubectl version --client
```

## Commands that do not need a cluster

```bash
pnpm install --frozen-lockfile
pnpm exec nx run-many -t lint typecheck test build secret-scan --parallel=3 --output-style=static
helm lint deploy/helm/commercecore-api
pnpm run k8s:check
```

`pnpm run k8s:check` renders the chart and rejects `NodePort`, `LoadBalancer`, `imagePullPolicy=Always`, `replicaCount=2`, an ingress value, and `enableServiceLinks=true`. Expected result: the Node test reporter shows four passing tests. The default render includes `enableServiceLinks: false` once.

## Image build

```bash
docker build -t commercecore-api:local .
```

Expected result: a local tag `commercecore-api:local`. No push. A loopback container check, still not a cluster check:

```bash
docker run -d --name commercecore-api-local \
  --read-only --tmpfs /tmp \
  -p 127.0.0.1:3000:3000 \
  -e COMMERCECORE_ENV=local \
  -e COMMERCECORE_HTTP_HOST=0.0.0.0 \
  -e COMMERCECORE_HTTP_PORT=3000 \
  -e COMMERCECORE_SERVICE_VERSION=0.0.0 \
  -e COMMERCECORE_LOG_LEVEL=info \
  commercecore-api:local
curl -fsS http://127.0.0.1:3000/health/live
docker rm -f commercecore-api-local
```

Expected body:

```json
{"status":"live","service":"commercecore-api","version":"0.0.0","probe":"liveness","dependenciesChecked":false}
```

## k3d smoke and teardown

```bash
bash tools/k8s/k3d-smoke.sh
```

The script creates one k3d server, no agents, no server load balancer, and Traefik disabled. It imports the local image, installs the chart into namespace `commerce-apps`, waits for the rollout, and port-forwards `127.0.0.1:18080` to the ClusterIP. The trap deletes cluster `commercecore-local` on exit, including failure.

| Exit | Meaning |
|---|---|
| 0 and `k3d-smoke: PASS` | `GET /health/live` returned HTTP 200 through the port-forward |
| 2 and `k3d-smoke: PENDING_OWNER_LOCAL` | Docker, the daemon, k3d, kubectl, Helm, or curl is missing. This is not a pass |
| 1 and `k3d-smoke: FAIL` | The cluster started and the probe did not succeed |

This is one server node, not the two-agent learning topology. It does not prove a second replica, a killed pod, or MongoDB restart.

## Limitations

- Remote CI builds the image and renders the chart. It does not run k3d. The image job's loopback `GET /health/live` is not the k3d smoke. K8S G5 stays `WAIT_MERGE` until this owner-reported record is reviewed and merged.
- Docker Hub anonymous pulls can be rate-limited. The build does not log in with an owner account.
- The image is not scanned by a registry and is not signed.
- Resource numbers are the D04 placeholders, not a measured profile.
- `/health/live` does not mean the process can serve a future business route.

## Evidence

The first implementation agent had no Docker daemon. Its smoke was:

```text
k3d-smoke: PENDING_OWNER_LOCAL
reason: docker is not installed
```

The owner later applied `enableServiceLinks: false` on a WSL2 working tree that was not committed, saw `GET /health/live` return `{"status":"live","service":"commercecore-api","version":"0.0.0","probe":"liveness","dependenciesChecked":false}`, and saw the script end with `k3d-smoke: PASS`. That log is owner-local evidence of the mitigation shape. It is not the SHA-bound smoke below, because it is not bound to the corrected commit.

## SHA-bound owner smoke

Provenance: owner report in the queue thread on 2026-11-17 at 21:37 Europe/Amsterdam. The recording agent did not run the smoke, did not read `/tmp/k3d-smoke.log`, and does not attest the log bytes.

Command the owner reported, from a WSL2 checkout:

```bash
git fetch origin
git checkout affde2ce87e7569595598f7bc116819e65a67785
bash tools/k8s/k3d-smoke.sh > /tmp/k3d-smoke.log 2>&1
status=$?
printf 'sha=%s\nexit=%s\n' "$(git rev-parse HEAD)" "$status" | tee -a /tmp/k3d-smoke.log
grep -E '^(sha=|exit=|k3d-smoke:)' /tmp/k3d-smoke.log
```

Owner-reported markers:

```text
sha=affde2ce87e7569595598f7bc116819e65a67785
exit=0
k3d-smoke: PASS
```

Owner-reported summary, not a stored log: Docker built `commercecore-api:local`, k3d created cluster `commercecore-local`, the image was imported, namespace `commerce-apps` was created, Helm release `commercecore-api` was `STATUS: deployed`, the deployment rolled out, and `GET /health/live` returned `{"status":"live","service":"commercecore-api","version":"0.0.0","probe":"liveness","dependenciesChecked":false}`. The owner reported a legacy Docker builder deprecation warning and marked it non-blocking. This document does not reproduce that warning text.

Cause, already fixed on that SHA: Kubernetes service links default to true. The Service name `commercecore-api` injects `COMMERCECORE_API_PORT`. `loadPublicConfig` rejects that key, `main.ts` emits `config.invalid`, and the pod CrashLoopBackOffs. The fix is `enableServiceLinks: false` on `spec.template.spec` in `deploy/helm/commercecore-api/templates/deployment.yaml`. `tools/k8s/assert-local-contract.spec.mjs` requires that rendered line once and rejects `--set enableServiceLinks=true`.

Checks read from GitHub for that same SHA, not a new cluster run: [Actions run 44150937887](https://github.com/sergio-tr/ecommerce/actions/runs/44150937887) is a `push` to `main`, conclusion `success`, completed 2026-11-17 19:44 Europe/Amsterdam. Jobs `validate`, `chart`, and `image` each concluded `success`. The `image` job's loopback probe is not k3d.

K8S G5 stays `WAIT_MERGE`. A pass still requires this documentary record to be reviewed and merged, and that merge SHA to be checked independently. Exit 2, or `k3d-smoke: PASS` on any other SHA, is not this evidence. The log file is not stored in the repository. AUD-P0-01 through AUD-P0-04 stay OPEN/BLOCKING. The 148 original experiments stay TEST_PLANNED/NOT_RUN. Catalog G4 stays not granted. MongoDB is out of scope.
