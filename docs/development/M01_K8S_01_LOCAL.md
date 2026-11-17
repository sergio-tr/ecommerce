# M01-K8S-01 — local image, Helm, and k3d smoke

**G5:** `NOT_PASSED`. A chart render and a unit test do not pass this gate. The k3d smoke below is `PENDING_OWNER_LOCAL` until it is run on a machine with Docker and the printed result is `k3d-smoke: PASS`.

This slice packages the existing `commercecore-api` process. It does not add a business route, MongoDB, Stripe, a public Ingress, or a registry push.

## Security boundary

| Surface | Behavior |
|---|---|
| Host-local `node dist/apps/commercecore-api/main.js` | Binds `127.0.0.1` unless `COMMERCECORE_HTTP_HOST` is set |
| Allowed hosts | `127.0.0.1` and `0.0.0.0` only |
| Local Deployment | Sets `COMMERCECORE_HTTP_HOST=0.0.0.0` so probes can use the pod IP |
| Service | `ClusterIP` port 3000. No NodePort, LoadBalancer, hostPort, or hostNetwork |
| Reach from the workstation | `kubectl port-forward` on `127.0.0.1` only |
| Image | Non-root `node` user, uid 1000, read-only root filesystem, `/tmp` emptyDir |
| Registry | Build locally. `imagePullPolicy: Never`. Do not `docker push` |

`0.0.0.0` is every interface in the pod network namespace. Do not set it in `.env.local`, and do not publish port 3000 on a host address other than loopback.

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

`pnpm run k8s:check` renders the chart and rejects `NodePort`, `LoadBalancer`, `imagePullPolicy=Always`, `replicaCount=2`, and an ingress value. Expected result: the Node test reporter shows three passing tests.

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

- Remote CI builds the image and renders the chart. It does not run k3d. K8S G5 stays not passed until the owner runs the smoke and keeps the PASS output.
- Docker Hub anonymous pulls can be rate-limited. The build does not log in with an owner account.
- The image is not scanned by a registry and is not signed.
- Resource numbers are the D04 placeholders, not a measured profile.
- `/health/live` does not mean the process can serve a future business route.

## Evidence from the implementation agent

Recorded on the agent that opened the draft pull request. Docker and k3d were not installed, so the smoke was not executed.

```text
k3d-smoke: PENDING_OWNER_LOCAL
reason: docker is not installed
```

Helm 4.3.1 `helm lint` and `pnpm run k8s:check` were run on that agent. Their results belong in the pull request test notes. They are not K8S G5.
