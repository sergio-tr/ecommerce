# M01-D03 — Local Kubernetes Topology, Networking and Database Authority

**Status:** G3 PROPOSED PHYSICAL SPECIFICATION; ARCHITECTURAL OPTIONS K2/NET-A/DATA-A ACCEPTED 2026-10-30; NO CLUSTER EXISTS. **Owner:** @sergio-tr. **Dependencies:** ADR-M01-001, M01-D01 toolchain, M01-D02 app/port boundaries.

## Exact selected local topology

- **Cluster runtime:** k3d v5.9.0 candidate managing K3s `v1.37.1+k3s1` candidate; check tag compatibility, image digest and Docker host capabilities before starting.
- **Topology:** one K3s server and **two agents** as an initial scheduling/Pod movement learning candidate; still no multi-control-plane HA and no Mongo HA. A one-server/one-agent degraded topology is permitted when machine resources cannot sustain three node containers, but this difference must be recorded and success claims adjusted.
- **Host entry:** k3d `serverlb` maps `127.0.0.1:8080` host to the ingress/controller HTTP port; default localhost only. A separate local TLS route can be added later, not assumed.
- **Ingress controller:** use bundled K3s Traefik, pinned by the selected K3s tag. No second Ingress controller or duplicated load balancer.
- **Internal exposure:** each app has a `ClusterIP` Service (only nonprivileged health/web paths exposed through public ingress). Mongo and Control Plane admin endpoints are not generally reachable on host.
- **Naming:** DNS/Host routing candidate `egame.localhost`, `api.egame.localhost`, `cloud.localhost` on port 8080. Browser/OS DNS resolution of subdomains of localhost is **environment-dependent**; acceptance must include either actual DNS/hosts entries or explicit ingress Host-header curls. Do not silently require public DNS.
- **Namespaces:** `commerce-apps` for apps and `commerce-data` for database; Kubernetes namespace is NOT a tenant security boundary. Exact NetworkPolicy CNI enforcement and least-privileged service accounts deferred until configured, not presumed secure.

## Logical networking and routes

| Host / route | Frontend destination | Internal Service | Authorization / ownership |
|---|---|---|---|
| `egame.localhost:8080` `/` | eGame static web | `egame-web`:80 | no seller admin/Stripe secret |
| `api.egame.localhost:8080` `/health/live`, `/health/ready` | CommerceCore Nest API | `commercecore-api`:3000 | non-financial probes only in M01 |
| `cloud.localhost:8080` `/health/*` | CommerceCloud API | `commercecloud-api`:3000 | restricted control API; only health may be guest-accessible |
| Webhook (later) | Stripe CLI local forward to trusted API endpoint | Core API | verify raw payload signature/account/mode, no direct browser trust |

Avoid rewriting `/api` paths in the ingress at bootstrap; simple host routing eliminates ambiguous rewrite rules.

## How the load balancers differ

1. **k3d serverlb:** a Docker-level edge proxy mapping host ports toward K3s nodes, not the same as `Service.type=LoadBalancer` created by a cloud controller.
2. **Traefik Ingress:** HTTP host/path router targeting Kubernetes Services. Actual ingress class must be inspected under selected K3s version.
3. **ClusterIP Services:** Kubernetes virtual IP/DNS with EndpointSlices distributing traffic to ready API Pod IPs. Verify two distinct `podUid`/Pod names via test-only diagnostic header; do not conflate with serverlb.
4. **Two API replicas:** first one replica, then two only for a stateless health endpoint. Financial workers/effects are explicitly excluded from scale experiment until D-05/Stripe fencing tests.

## Data-A physical authority

- One local **MongoDB replica-set infrastructure** with PVC-backed storage, one member initially; Mongo v major/patch and container digest are **NOT SELECTED** by DATA-A and require M01-D05 source verification. Do not infer Mongo financial replica set reliability from K3s control-plane count.
- Separate `commercecore_dev` and `commercecloud_dev` DBs, different DB users and separate Secrets. CommerceCore must not read/write Cloud-owned tables, nor Cloud private Core collections.
- Disallow Mongo host public NodePort/LoadBalancer; internal DNS only, developer `kubectl port-forward` through approved local access if absolutely required.
- Define PVC Retain/Delete choice and explicit fixture backup before delete. Cluster deletion with local-path volumes may remove data; no backup/restore claims without tests.
- Money/order atomicity is **not defined by D03**; D-05-MONGO and AUD-P0-03 must approve owner-local writes/Outbox and physical transaction guarantees.

## Resource capacity candidate, not a verified host requirement

- Suggested disposable learning budget **8 logical CPU, 12–16 GiB available memory and 25–40 GiB free disk**, pending real Docker/WSL host measurement; these are planning estimates, not Kubernetes minimum requirements.
- Initially one API replica and no Kafka/Keycloak; bring second replica only for networking experiment. Stop automatic image pulls/cluster upgrades when experimenting with reproducibility.
- Set resource requests/limits per service only after local profiling, but choose placeholders in D04 for first safe scheduling and prevent runaway memory.

## Contractual negative cases

| Planned test | Expected result |
|---|---|
| Two healthy Core API Pods behind one Service | requests route to both identities over repeated calls, each ready and matching revision |
| One API Pod deleted | Kubernetes recreates it, Service only routes ready healthy Pods; short restarts observed, **not zero-downtime claim** |
| No ready Core Pods | API readiness fails; ingress returns an error, does not send to stale backend |
| Cloud Pod down | eGame static and independent Core health keep working as their contracts allow |
| Core API tries connecting as Cloud DB user | database authorization rejects cross-owner access |
| Mongo Pod restarted | PVC-backed fixture persists if storage configured; does not prove node failover |
| Unapproved direct access to DB | no public/NodePort/LoadBalancer exposing Mongo service |
| Ingress hostname wrong | fails route, never accidentally maps unknown Host to Cloud privileged endpoint |
| Test Stripe webhook replay with wrong signature | rejected at application port when later implemented; not an M01 Kubernetes test |
| Cluster cleanup | no live Stripe/remote cloud spend, explicit data retention consequences |

## Operational runbook G3 expectations

A future implementer must have **documented** commands and expected observations for:
`docker version`, `k3d version`, `kubectl config current-context`, `kubectl get nodes -o wide`, `kubectl -n commerce-apps get deployments,pods,svc,ingress,endpointslices`, `kubectl describe pod`, `kubectl logs`, `kubectl rollout status`, and a safe explicit local cluster destroy path.

No shell command has been executed against the user's machine. **All oracles are TEST_PLANNED / NOT_RUN.**

## Official external compatibility references

- https://docs.k3d.io/ — k3d's serverlb/port mapping usage
- https://github.com/k3d-io/k3d/releases — v5.9.0
- https://github.com/k3s-io/k3s/releases — v1.37.1+k3s1
- https://kubernetes.io/docs/concepts/services-networking/service/
- https://kubernetes.io/docs/concepts/services-networking/ingress/
- https://kubernetes.io/releases/version-skew-policy/

## G3 gate

**Topology and networking semantics SPECIFIED**, but k3d/K3s/image tag compatibility, Docker/WSL host readiness, route/DNS, Mongo image/DB ownership and actual two-replica behavior remain **PHYSICAL VERIFICATION PENDING**. Do not mistake an approved topology for existing cluster.
