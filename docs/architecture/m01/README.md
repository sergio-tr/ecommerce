# M01 — Kubernetes-First Foundation Planning (2026-10-30)

**State:** USER REVIEW REQUESTED — NEW PHYSICAL M01 TOPOLOGY PROPOSED, NOT YET RATIFIED. **Owner:** @sergio-tr. **No application code or cluster created.**

This proposal extends the accepted TypeScript/NestJS + Nx/pnpm + Angular **M01-A** engineering direction with **local Kubernetes deployment foundations** while leaving M07 bounded-context microservice extraction and M08 advanced Kubernetes/HA/GitOps experiments intact.

## Review documents

1. [Kubernetes-first proposed architecture and comparison](KUBERNETES_FIRST_LOCAL_PROPOSAL.md): deployments, diagram, ingress, load balancing, storage, milestone changes and measurable local tests.
2. [Stripe company versus buyer and manual test-mode setup](STRIPE_TEST_ROLES_AND_MANUAL_SETUP.md): one Stripe merchant sandbox, eGame user/optional Customer and later Connect alternatives.
3. [M01 actual design-versus-implementation breakdown and next actions](DEFINITION_OF_READY_AND_LOCAL_TASK_SEQUENCE.md): ten G3 design work packages, proposed implementation slices and four explicit architectural selections.

## Recommended review defaults

- **K2:** begin with k3d Kubernetes from M01, not Docker Compose as sole primary runtime; advanced operations stay M08.
- **NET-A:** k3d local serverlb + Traefik Ingress + ClusterIP Services; optional Gateway API lab M08.
- **DATA-A:** one local developer Mongo replica-set infrastructure with separate Core/Cloud owned databases/credentials, PVC and no HA claim.
- **STRIPE-A:** one merchant Stripe test/sandbox account, simulated buyer in eGame/optional test Customer; Connect test connected accounts later.

A Kubernetes Deployment is not automatically a microservice: `commercecore-api` remains a modular monolith until M07 extraction. No financial P0 audit is closed by running two API replicas.

## State and next action

The original M01-A architecture direction is ACCEPTED. The new physical topology and milestone reallocation are **PROPOSED**. The user should approve/amend K2/NET-A/DATA-A/STRIPE-A, then review exact compatible toolchain/runtime versions and a first M01 bootstrap task (G3). Implementation (G4) needs separate explicit authorization; G5 requires real local executions, not design prose.

All project documents are in English, traceable to original decisions and maintained via independent feature branch/PR. No implementation tickets, credentials, billing account or K8s resources are created in this review.
