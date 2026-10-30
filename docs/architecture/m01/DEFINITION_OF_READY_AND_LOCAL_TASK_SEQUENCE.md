# M01 — Concrete Design, Definition of Ready and First Local Implementation Handoff

**Scope:** first independent engineering milestone; **K2/NET-A/DATA-A/STRIPE-A ACCEPTED 2026-10-30** as M01/M08 allocation change. **Status:** G3 D01–D04 documentary specifications available, physical tests pending / G4 NOT AUTHORIZED. **Owner:** @sergio-tr. **No code or Kubernetes resources created.**

## Answer: what is design and what is implementation?

| Level | Definition | Current state | Required user action |
|---|---|---|---|
| M00 architecture policy | what CommerceCore/Cloud/eGame own, invariants, risks, milestone governance | Major principles accepted, four P0 proof findings OPEN | None for prior accepted direction; review outstanding exact M00 contracts |
| M01 architecture direction | Nx/pnpm, TypeScript/NestJS modular, Angular reference, DDD/ports | **ACCEPTED M01-A**, documented | No decision unless altering it |
| M01 Kubernetes-first scope | bring first local cluster/Ingress/Deployments into M01, leave HA/chaos/GitOps in M08 | **ACCEPTED K2/NET-A/DATA-A/STRIPE-A on 2026-10-30** | No further option ratification needed |
| M01 technical specification (G3) | pinned runtime versions, Nx graph, exact manifests/chart inputs, storage, networking, health/CI and failure oracles | **NOT COMPLETE** | Approve exact defaults when documented and verified for compatibility |
| M01 implementation task (G4) | atomic branch/issue with step-by-step acceptance criteria, code/config output and dependency IDs | **NOT AUTHORIZED / NOT CREATED** | Explicitly authorize first local work package |
| M01 testing (G5) | actual `kubectl` cluster and deployment outputs, CI and failover logs | **NOT EXECUTED** | Execute after code/cluster exists |

**No need to complete G5 BEFORE coding the first M01 task.** G5 is measured after implementation. M04 financial-effect implementation has separate G3 contracts and subsequent provider tests; a working Kubernetes cluster does not close them.

## Concrete pre-implementation design packages — proposed task names, NOT tracker issues

| Order | Proposed package | Exact specification to ratify | Objective review acceptance / dependency |
|---|---|---|---|
| M01-D01 | Local OS/toolchain compatibility | WSL2/Linux or other host, Node LTS, pnpm, Nx, NestJS, Angular, Docker, k3d, kubectl, Helm versions and CPU/RAM limits | Supported version matrix + lockfiles strategy; no unverified assumption that all current versions interoperate |
| M01-D02 | Workspace and deployables | `apps/commercecore-api`, `apps/commercecloud-api`, `apps/egame-web`, optional `apps/commercecore-worker`, `libs/contexts/*/{domain,application,ports,infrastructure}` or equivalent exact Nx graph | Context import deny rules and exact public dependency contracts; Cloud does not import Core private storage |
| M01-D03 | Cluster topology and networking | one k3d server + two agents as learning candidate; Traefik Ingress, k3d serverlb, internal ClusterIP Services, namespaced routes and port maps | Two API replicas reachable through one Service and ingress; distinguish host lb from pod selection; avoid duplicate exposed public endpoints |
| M01-D04 | Image/build/deployment | multi-stage builds or equivalent reproducible images, tags/digests, Deployment and Service templates, rollout strategy, namespace | `kubectl rollout status`, probes, rollback and teardown acceptance criteria |
| M01-D05 | Mongo local storage | local replica set, PVC, DB users scoped Core/Cloud, seeded demo data, backup/teardown policy; owner-local transaction strategy still separately gated | Durable restart with same fixture, no cross-context DB reads, no false HA claim |
| M01-D06 | Configuration and secrets | local ignored secrets, K8s Secret referencing, runtime env validation, never use live Stripe keys; documented test-merchant parameters | negative test for `sk_live_`, missing/invalid config; no sensitive values in git |
| M01-D07 | Developer workflow & observability | optional hot reload vs image deployment loop, health/readiness/liveness, structured logs, tracing correlation IDs, minimal local monitoring | developer can debug Pod/Service, inspect logs, see request served by either replica |
| M01-D08 | CI and quality | Nx affected lint/typecheck/unit, architecture import rules, manifest/Helm validation, conventional commits, PR gates | Clean branch produces deterministic pass/fail results with evidence and documented commands |
| M01-D09 | Stripe manual sandbox plan | one test merchant, eGame guest user and optional Stripe Customer, Stripe CLI forward target, safe test cards | account/provider evidence only after user manually connects sandbox; no code credential leakage |
| M01-D10 | First task G4 authorization | reviewed single-source issue crosswalk with exact output/tests and branch name, preferably first D01/D02 minimal workspace | user explicitly authorizes only that task; no merge to main except separate review |

## Deployment layout (proposal, not a code repository)

```text
Repository (Nx/pnpm)
├── apps/
│   ├── commercecore-api/       # NestJS: modular monolith
│   ├── commercecloud-api/      # separate Control Plane
│   ├── egame-web/              # Angular SPA
│   └── commercecore-worker/    # optional independent Outbox worker start command
├── libs/
│   ├── contexts/               # Domain / Application / Ports / Adapters per bounded context
│   └── contracts/              # typed public APIs/events
├── deploy/
│   └── k8s/                    # Helm or Kustomize choice not yet ratified
├── tools/                      # test and developer utility scripts
└── docs/                       # ADRs, specs, tests, evidence
```

The tree is a **design example**. None of these app directories has been created. The exact name/tag scheme and deployment build boundaries need G3 review.

## Minimal first implementation work (once separately authorized)

**First real slice: M01-BOOTSTRAP-01 (candidate).**

**Inputs:** approved D01/D02 toolchain/graph, verified target branch and existing docs.  
**Actions:** initialize Nx/pnpm workspace, NestJS empty composition root, one pure domain library and architecture import-denial test, lint/format/typecheck/unit scripts, minimal CI checks and English onboarding guide.  
**Not allowed in this slice:** Stripe account operations, inventory reservation business state, license reveal, real Mongo financial transactions, staging/production rollout, unapproved services.  
**Acceptance:** clean clone installs exact pinned versions; `pnpm install --frozen-lockfile`, `lint`, `typecheck`, `test`, graph boundary negative case and CI checks execute and record actual pass/fail. Feature branch and PR only, owner @sergio-tr, conventional commit no coauthor trailers.

**Second real slice: M01-K8S-01 (candidate).**

**Inputs:** approved D03/D04/D06 versions and manifests; bootstrap outputs.  
**Actions:** local k3d cluster creation/teardown config, OCI image build, two simple API replicas, ClusterIP Service, Traefik ingress/host port, documented rollout and basic requests.  
**Acceptance:** actual `kubectl get nodes/pods/svc/ingress`, distinct Pod identities behind one route, kill/recover a Pod with preserved request availability through ready peer, cleanup has no remote spending. Never imply multi-node Mongo HA or financial-domain consistency.

**Third slice: M01-K8S-02 / M01-DATA-01 (candidate).**

**Inputs:** D05 local persistence and privileged config.  
**Actions:** local persisted Mongo replica-set with owned DB/credential policy, local fixture, volumes and restart test.  
**Acceptance:** persistence evidence for fixture after restarting a DB Pod, no exposed DB public port, no cross-database credentials. Distinguish restart from three-node failover.

These are proposed atomic implementation slices, not GitHub/Linear issues and not authorization to build.

## No hidden milestone rewrite

If K2 is ratified:
- **M01** adds local Kubernetes deployment foundations, service networking, basic load balancing and container/cluster reproducibility.
- **M07** continues extraction into independently deployed Catalog/Payments/Inventory/Ordering services and owned persistence; Kubernetes Deployment separation does NOT imply extracting these in M01.
- **M08** retains Gateway API/advanced networking, GitOps/ArgoCD, Terraform, production-like HA, autoscaling beyond basic replica experiment, resilience/chaos and operational verification.
- **M09** retains release and full-system verification.
- **M00.5** remains NOT APPROVED.

## Explicit next user approval packet

A. **K2** (recommended) versus K1/K3: Kubernetes local from M01 with independent CommerceCore/CommerceCloud/eGame deployments and intro load balancing.

B. **NET-A** (recommended): k3d serverlb + Traefik Ingress + ClusterIP Service now; Gateway API via Envoy or another selected implementation in M08. **NET-B:** Gateway API already M01 (higher setup cost; more routing learning).

C. **DATA-A** (recommended): one local Mongo replica-set with separately owned Core/Cloud DB credentials and PVC; physical HA later. **DATA-B:** distinct Mongo deployments immediately (higher resource/backup effort).

D. **STRIPE-A** (recommended): one Stripe test merchant plus eGame buyer/optional Stripe Customer; Connect test connected accounts deferred. **STRIPE-B:** add Connect test accounts immediately if multi-merchant fund-flow behavior is an explicit early learning target.

Default choices **K2 + NET-A + DATA-A + STRIPE-A** best meet current project goals. The four option choices are accepted. Exact version cohort, technical interfaces, actual host resource budget and workload parameters are documented or flagged for verification in M01-D01–D04.

### Following the already recorded user approval

1. Ratify M01 Kubernetes-first scope addendum in planning governance (not G5).
2. Complete exact compatible versions and M01-D01..D04 technical acceptance, verify OS resources.
3. Link to existing SER-131/#14 and prepare the single first atomic implementation task, without duplicating audit issues.
4. Obtain explicit G4 authorization for M01-BOOTSTRAP-01.
5. Write, run and test that task **locally**. Then independently authorize M01-K8S-01, etc.

**Current immediate user action:** review M01-D01–D04, verify host and peer compatibility in a separately authorized local reproducibility task, then explicitly authorize M01-BOOTSTRAP-01 under G4. Do not create buyer merchant accounts, app code or production Kubernetes merely from this design approval.
