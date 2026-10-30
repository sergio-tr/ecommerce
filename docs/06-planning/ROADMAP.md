# CommerceCore — Source-Derived Milestone Roadmap (M00–M09)

**Status:** planning baseline with ratified M01 Kubernetes-first scope (2026-10-30), not permission to implement. Exact milestone dates, sequence details, cost ceilings and physical implementations are subject to separate explicit approval. The history in R0.10 and the independent discovery consolidation remain the reference sources.

## M00 — Architecture, Decision Governance and Design Gates

- **M00.1 — Financial checkout, reservation and reconciliation.** Define accepted quote/Order identity, Inventory reservation/protection/commit/release, hosted Stripe attempt/session lifecycle, unknown financial operations, cancellation, refunds, durable Inbox/Outbox, obligation preservation and provider proof. **Current:** seven main policies ACCEPTED; four P0 OPEN/BLOCKING; six P1 and three P2 tracked, several open technical subdecisions. R2 is not closed.
- **M00.2 — Inventory and DigitalLicense fulfillment.** Specify StockPool/Reservation authority and true capacity-conservation atomicity, shared pools/protected quotas, unique DigitalLicense assignment per orderLineId, encrypted and auditable access, full multi-line preparation before potentially irreversible disclosure, idempotent repair after partial failure. Must distinguish COMMITTED capacity from disclosed license.
- **M00.3 — Identity, guest claims and authorization.** Specify guest carts/sessions, one-use expiring claim links, verification, OIDC Keycloak realms, B2B vs B2C profiles, trusted TenantContext, per-resource RBAC/ABAC, delegated scope, CSRF, revocation, cancellation authorization for guest checkouts and safe key access.
- **M00.4 — Domain and cross-context contracts.** Finalize context map, aggregates, ports, OpenAPI/JSON Schema event contracts, error taxonomy, commercial generation and version semantics, ownership boundaries, local atomicity assumptions and microservice extraction compatibility.
- **M00.5 — NOT APPROVED / NOT A MILESTONE.** This was a historical planning suggestion only. W1-AP-02 retains M00–M09 and requires demonstrated necessity before adding a separate checkpoint. Current completeness/readiness functions belong to M00.1–M00.4 and G0–G6; no M00.5 scheduling object is introduced.

## M01 — Reproducible engineering foundations

**Accepted M01 direction (2026-10-30):** Nx/pnpm monorepo, NestJS modular CommerceCore API, separate CommerceCloud Control Plane, Angular eGame web, hexagonal Domain/Application/Ports/Adapters, enforceable Nx/ESLint boundaries, GitHub Actions and docs-as-code. The user explicitly approved **K2**: run a local **k3d/K3s Kubernetes foundation from M01**, not Docker Compose as the mandatory primary deployment path. Deploy the CommerceCore modular monolith, CommerceCloud and eGame as separate workloads; do **not** extract the CommerceCore bounded contexts into microservices before M07.

**Accepted physical options:** **NET-A** (k3d serverlb → Traefik Ingress → ClusterIP Service → Pods); **DATA-A** (one local MongoDB replica-set infrastructure, dedicated Core/Cloud DB owners and credentials, PVC; not HA); **STRIPE-A** (one Stripe merchant in test mode, an eGame buyer with optional Stripe Customer, no buyer merchant account, Connect later). No real-money use is authorized.

**Verified upstream compatibility cohort, pending actual install:** Node 24.22.2, Nx 23.3.1, Angular 21.2.x, NestJS 11.2.8, TypeScript 5.9.3, pnpm 11.10.0; k3d v5.9.0 and K3s v1.37.1+k3s1 are separately published but their *combined execution is not verified*; Helm 4.3.1 officially supports Kubernetes 1.37. Full version, boundary, network and deployment G3 specifications: [ADR-M01-001](../02-decisions/ADR-M01-001-kubernetes-first-and-test-stripe.md) and [M01-D01–D04](../architecture/m01/README.md). No lockfile, app, chart, cluster or provider operation has been created.

**M01 deliverable sequence (future, separately G4-authorized):** (1) reproducible toolchain/workspace and architecture tests; (2) independent image builds/Helm definitions; (3) local Kubernetes ingress/ClusterIP and two-replica stateless health test; (4) MongoDB PVC/owner separation and restart test; (5) Stripe sandbox setup only once its adapter is approved.

**Exit gate (future):** actual pinned clean install/build/typecheck/lint/architecture tests, reproducible cluster/bootstrap, independently reachable apps, health/rollout and Service balancing logs, container secret isolation, database restart/volume evidence and safe teardown. **No G3/G4/G5 pass is claimed from these documentary specifications.**

## M02 — Multi-tenant foundation and identity

**Historical proposal:** Tenant/Brand/Store ownership, shared master/local catalog references, CommerceCloud as separate Control Plane, trusted tenant context, per-store customer profiles, Keycloak realms and delegated authorization, BOLA/BFLA matrices.

**Exit gate (future):** cross-tenant access denied for all data and effects, not just read queries; authentication/authorization scopes verified under real execution.

## M03 — Catalog, listing, offers and pricing

**Historical proposal:** Product/Variant namespaces, typed tenant attributes, controlled master-local overrides/inheritance, Listing publication and Offer conditions, exact currency arithmetic, versioned price quotes, no full promotions/tax provider initially.

**Exit gate (future):** one sellable multi-store catalog with accepted immutable economic snapshots and complete isolation/consistency tests.

## M04 — First complete digital eGame purchase

**Historical proposal refined by D-01–D-07:** persist Order and CheckoutProcess, reserve inventory, protect before collectible Stripe, host card/3DS Checkout in **test mode**, verify webhook/financial outcome, commit capacity, prepare/reveal unique licenses through authorized access, repair or refund real obligations. Durable Mongo Inbox/Outbox and reconciliation **must exist before Kafka**. No real payments, tax compliance or production readiness implied.

**Exit gate (future):** race, crash, idempotency and unknown-provider-case evidence; guaranteed no unsafe stock release or duplicate semantic charges; provider test-mode objects observed. Cannot claim general Stripe proof while AUD-P0-01/P0-02 remain BLOCKING.

## M05 — Distributed integration and messaging

**Historical proposal:** introduce Kafka (KRaft locally, Strimzi in lab), versioned schema envelopes, at-least-once consumer semantics, partitions keyed by the ordering domain, Outbox publisher, Inbox/consumer dedup, DLQ/replay and telemetry. Kafka changes transport; it does **not** invent provider financial truth or replace D-05 local atomicity.

## M06 — Framework reuse beyond eGame

**Historical proposal:** usable npm contracts/SDK/public packages, configurable reusable Angular shell/theme, independent installation through Docker/Helm target, second non-eGame consumer, optional physical-products extension contracts. Demonstrate framework does not contain eGame-specific pricing or vendor business logic.

## M07 — Mandatory bounded-context microservice extraction

Catalog, Payments, Inventory and Ordering each receive independent runtimes, owned persistence/DB credentials, APIs/events, release pipelines, observability and resilience tests. One authoritative writer after data migration cutover. Compare before/after latency, operational burden, failure isolation and consistency behavior, including D-01/D-04 safeguards. No single cross-context Mongo transaction in the resulting architecture.

## M08 — Kubernetes and operational verification

**Re-scoped after accepted K2/NET-A (2026-10-30):** introductory local k3d/K3s, Traefik Ingress, ClusterIP Services, app Deployments and introductory Helm rollout are **M01** foundations. **M08 remains the advanced Kubernetes and operational verification milestone**: production-like Gateway API/Envoy Gateway evaluation, TLS/Cloudflare hardening, multi-node/low-cost VPS labs when separately approved, Terraform, Argo CD/GitOps, External Secrets, enforceable NetworkPolicies, CSI storage, Mongo/Kafka operators and tested security/chaos/backup-recovery/secret rotation/rollbacks. No production, external spending or HA claim is implied by M01 local Kubernetes.

## M09 — End-to-end validation and distribution

Run deterministic concurrency/chaos, backup restore, authorization isolation, reconciliation, service extraction regression, load tests, SLO evidence, observability validation, independent install and second consumer test. Distribute only explicitly public packages/SDK and docs with legal/operational review. Live monetary operations require a *separate* commercial/tax/legal/security/operations approval.

## Cross-cutting validation and completion gates

FINANCIAL: payment capture/refund and unknown external outcomes; INVENTORY: capacity conservation and unique license assignment; SECURITY: multi-tenant/authn/authz/secret handling; DISTRIBUTED: recovery/Inbox/Outbox/Kafka; DATA-MIGRATION: single writer and restore; OPERATIONS: telemetry, runbooks and rollback; FRAMEWORK: independent installation/second consumer. For each gate, preserve experiment setup, observable oracle and actual evidence rather than inferring readiness from diagrams.

**No approved dates or budget schedule exist.** Temporary labs and local-first cost control are selected historical directions, not permission to deploy or spend.

## Current Wave 1 scope and gates (2026-10-21)

W1-AP-01 accepted the bounded but complete Stripe-test-mode eGame digital-license purchase **planning target**; contracts, implementation and experiments remain unapproved. W1-AP-02 rejected automatic M00.5 adoption. W1-AP-03 accepted ID preservation; W1-AP-04 accepted G0–G6 with measurable evidence conditions; W1-AP-05 accepted provenance/test reconciliation priorities. For per-capability scope consult docs/planning/wave1/M04_SCOPE_MATRIX.md. None of these changes modifies the historical 181 selections or closes AUD-P0-01..04.
