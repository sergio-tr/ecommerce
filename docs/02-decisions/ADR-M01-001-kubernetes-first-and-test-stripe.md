# ADR-M01-001 — Kubernetes-First Local Foundation and Test-Merchant Model

- **Decision date:** 2026-10-30
- **Status:** ACCEPTED — architectural scope and option selection
- **Approver / accountable owner:** @sergio-tr
- **Source:** explicit user approval: `k8s=K2, net=NET-A, data=DATA-A, stripe=STRIPE-A`
- **Milestone:** M01 (new introductory Kubernetes foundation), later M07/M08 obligations preserved
- **Implementation / test evidence:** NOT AUTHORIZED / NOT RUN
- **Existing roadmap:** M00–M09 unchanged. No M00.5.

## Decision D-1 — K2: Kubernetes as the local M01 runtime

Local orchestration **starts in M01** using **k3d/K3s** instead of making Docker Compose the only initial runtime. The initial deployment units are CommerceCore API (still a modular monolith), CommerceCloud Control Plane API (independent executable), eGame web client, and optionally a separate CommerceCore worker process after worker ownership contracts are specified.

**Consequences:** learn OCI builds, Kubernetes Deployments, Services, routing, replicas, health probes and rollout/rollback before business features. Increased machine resource and onboarding requirements are accepted. Creating a Kubernetes Deployment does not imply extracting a bounded context into a microservice. M07 remains the dedicated extraction milestone. M08 retains HA, advanced Gateway API, GitOps, Terraform, disaster recovery and chaos/operational verification.

**Alternatives rejected for M01:** K1 Compose-first as sole environment (too little Kubernetes learning); K3 production-grade multi-cluster/GitOps/mesh from day one (needlessly complex).

## Decision D-2 — NET-A: local edge + Ingress + stable internal Services

Initial route: local browser → k3d `serverlb` Docker port mapping → bundled Traefik Ingress controller → `ClusterIP` Services → healthy Pods. Use explicit hostnames/Host-header rules, not direct service exposure. Ingress API requires a controller; ClusterIP internal load distribution and k3d host entry are different layers.

**Alternatives rejected:** NET-B requiring advanced Gateway API and a separate Gateway controller before first app; unbacked `type: LoadBalancer` as supposed proof of an assigned external IP. Gateway API and advanced load-balancing experiments retained for M08.

**Limits:** introductory LB is single-machine, not HA; basic 2-Pod readiness/rollout may be tested later, no production TLS or DDoS protection claim.

## Decision D-3 — DATA-A: local MongoDB development replica set, separated logical authority

One **local MongoDB replica-set infrastructure** with dedicated databases, credentials and collection ownership for CommerceCore and CommerceCloud. Separate database does not imply distinct cluster or automatic network isolation. Durable PVC and restart acceptance required. Initial single-member replica set supports local multidocument transaction development but does not prove failover, majority high availability or cross-context transaction authority.

**Limits:** D-05-MONGO exact transaction/write-concern/unknown-commit and Inbox/Outbox guarantees remain independent G3 dependencies. No Stripe/network calls in a database transaction. M07 physical context extraction and M08 true resilience remain pending.

**Alternative rejected:** DATA-B separate MongoDB deployments at M01, higher resource/backup burden for little immediate educational value.

## Decision D-4 — STRIPE-A: test merchant and eGame buyer

One Stripe **merchant sandbox/test-mode account** for the initial eGame Store. eGame buyer identity belongs to eGame/Identity; optional Stripe `Customer` is a data object, **not a second merchant account**. Use documented test cards and signed test webhooks later; no real money or production identity verification. Stripe Connect test connected accounts and multi-merchant charge ownership remain deferred until independently specified.

**Constraints:** API secrets are never committed; server rejects live-mode credentials in local test profile; account/mode/currency/capture facts are scope-bound. AUD-P0-01..04 remain OPEN/BLOCKING for empirical evidence. STRIPE-A does not authorize real Stripe POSTs or mark payment protocols verified.

**Alternative rejected for M01:** STRIPE-B Connect accounts upfront (more provider authority, fund-flow and test cases before first sale).

## Subordinate G3 design deliverables

- [M01-D01 — Verified Toolchain Compatibility](../architecture/m01/M01_D01_TOOLCHAIN_COMPATIBILITY.md)
- [M01-D02 — Workspace and Dependency Rules](../architecture/m01/M01_D02_WORKSPACE_AND_DEPENDENCIES.md)
- [M01-D03 — Kubernetes Network and Local Topology](../architecture/m01/M01_D03_K8S_TOPOLOGY_AND_NETWORK.md)
- [M01-D04 — Image, Deployments and Helm Delivery](../architecture/m01/M01_D04_BUILD_DEPLOY_AND_ROLLBACK.md)

The four are documentary **technical specifications**, not actual scaffolded apps/manifests. Versions must pass first local peer/install smoke checks before a G3 compatibility gate can be considered verified. G4 implementation approval remains separately required.

## Risks and follow-up conditions

1. Local Docker/WSL2 capabilities, available RAM/CPU, volume performance and host-port availability have **not** been inspected on the user's computer.
2. A load-balanced 2-Pod health endpoint does not validate domain-level idempotency, financial effect fencing or transactional safety.
3. The first dev cluster may run without Keycloak, Kafka and payment adapters; their security/owner contracts remain on M00.3 and M05.
4. No automatic main merge, no application code and no live-money deployment is authorized here.

## Official verification sources consulted 2026-10-30

- Kubernetes workloads/Service/Ingress and version skew: https://kubernetes.io/docs/concepts/workloads/controllers/deployment/ ; https://kubernetes.io/docs/concepts/services-networking/service/ ; https://kubernetes.io/docs/concepts/services-networking/ingress/ ; https://kubernetes.io/releases/version-skew-policy/
- k3d/k3s release: https://github.com/k3d-io/k3d/releases ; https://github.com/k3s-io/k3s/releases
- Stripe test rails: https://docs.stripe.com/testing ; https://docs.stripe.com/connect/testing
