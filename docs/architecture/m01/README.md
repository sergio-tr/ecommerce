# M01 — Accepted Kubernetes-First Architecture and G3 Design Specifications

**Date:** 2026-10-30 · **Owner:** @sergio-tr · **Architecture choices:** K2, NET-A, DATA-A, STRIPE-A **ACCEPTED**.
**G3:** documentary design specified; published version support independently checked; local install/host/cluster validation NOT_RUN.
**G4:** NOT AUTHORIZED. **Code:** NOT WRITTEN. **Deployment:** NOT CREATED.

## Canonical reading order

1. [Accepted ADR-M01-001](../../02-decisions/ADR-M01-001-kubernetes-first-and-test-stripe.md) and [structured decision register](../../02-decisions/m01-kubernetes-first-decision-register.json).
2. [M01-D01 — Compatible toolchain and verifiable version matrix](M01_D01_TOOLCHAIN_COMPATIBILITY.md).
3. [M01-D02 — Nx workspace, bounded contexts and import controls](M01_D02_WORKSPACE_AND_DEPENDENCIES.md).
4. [M01-D03 — Local k3d/K3s, Traefik/ClusterIP routes, Mongo authority](M01_D03_K8S_TOPOLOGY_AND_NETWORK.md).
5. [M01-D04 — OCI builds, Helm/Deployment/Service/rollout acceptance](M01_D04_BUILD_DEPLOY_AND_ROLLBACK.md).
6. [Stripe test merchant/buyer manual setup](STRIPE_TEST_ROLES_AND_MANUAL_SETUP.md).
7. [Current local implementation handoff](DEFINITION_OF_READY_AND_LOCAL_TASK_SEQUENCE.md).

The original [Kubernetes alternatives](KUBERNETES_FIRST_LOCAL_PROPOSAL.md) remain as pre-ratification comparison evidence; K2/NET-A/DATA-A/STRIPE-A are now approved. See [roadmap](../../06-planning/ROADMAP.md): M01 introductory Kubernetes, M07 microservice extraction, M08 advanced HA/GitOps/Gateway/chaos, M00.5 NOT APPROVED.

## Technical cohort decision (source-backed; not installed)

Node.js **24.22.2 LTS**, pnpm **11.10.0** initial candidate, Nx **23.3.1** and `@nx/*` lockstep, Angular **21.2.x**, TypeScript **5.9.3**, NestJS **11.2.8**, k3d **5.9.0**, K3s **v1.37.1+k3s1**, Helm **4.3.1**. Exact Angular CLI/RxJS and driver patches, host Docker/WSL support, image digest, Nx generator peer resolution and k3d/K3s cluster boots remain pending the first separately authorized compatibility run.

Why not automatically choose latest major: Angular 22 requires TS 6 and Nest 12 also uses TS 6, while published `@nx/nest` plugin compatibility still lists Nest 10/11. The conservative cohort is a reproducible bootstrap candidate with published mutual version support; evaluate the newer cohort later without claiming current local proof.

## Clear handoff: next user action

No further **architecture-choice** approval is needed for the four selected defaults. Review proposed G3 details, especially exact package versions/host constraints and the subordinate Helm-vs-Kustomize choice. Next, **explicitly authorize the first M01-BOOTSTRAP-01 task** only after peer resolution and its input/output/acceptance are accepted. This chat request expressly forbids implementation; no app, chart, cluster or Stripe operation will be created as part of these docs.

## Merge safety

PR #22 documents these M01 decisions on an independent feature branch. PR #21 was merged into main on 2026-10-30 at 16:45 UTC. PR #22 is a separate independent documentation-only branch; GitHub reported it mergeable after the main update. It uses a standalone M01 decision record and does **not** overwrite the 91-record canonical scoped decision register. Review the current PR diff and updated base before merging. No automatic merge is authorized.
