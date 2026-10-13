# CommerceCore — Source-Derived Milestone Roadmap (M00–M09)

**Status:** planning baseline, not permission to implement. Exact milestone dates, sequence details, cost ceilings and physical implementations are subject to separate explicit approval. The history in R0.10 and the independent discovery consolidation remain the reference sources.

## M00 — Architecture, Decision Governance and Design Gates

- **M00.1 — Financial checkout, reservation and reconciliation.** Define accepted quote/Order identity, Inventory reservation/protection/commit/release, hosted Stripe attempt/session lifecycle, unknown financial operations, cancellation, refunds, durable Inbox/Outbox, obligation preservation and provider proof. **Current:** seven main policies ACCEPTED; four P0 OPEN/BLOCKING; six P1 and three P2 tracked, several open technical subdecisions. R2 is not closed.
- **M00.2 — Inventory and DigitalLicense fulfillment.** Specify StockPool/Reservation authority and true capacity-conservation atomicity, shared pools/protected quotas, unique DigitalLicense assignment per orderLineId, encrypted and auditable access, full multi-line preparation before potentially irreversible disclosure, idempotent repair after partial failure. Must distinguish COMMITTED capacity from disclosed license.
- **M00.3 — Identity, guest claims and authorization.** Specify guest carts/sessions, one-use expiring claim links, verification, OIDC Keycloak realms, B2B vs B2C profiles, trusted TenantContext, per-resource RBAC/ABAC, delegated scope, CSRF, revocation, cancellation authorization for guest checkouts and safe key access.
- **M00.4 — Domain and cross-context contracts.** Finalize context map, aggregates, ports, OpenAPI/JSON Schema event contracts, error taxonomy, commercial generation and version semantics, ownership boundaries, local atomicity assumptions and microservice extraction compatibility.
- **M00.5 — Architecture ratification and implementation readiness.** Normalize independent ADRs, preserve original R0.10 and R1, review all unresolved audits and costs, define acceptance/test gates, establish explicit scope for a future M01 implementation authorization. This phase must not auto-approve earlier proposals.

## M01 — Reproducible engineering foundations

**Historical proposal:** Nx/pnpm monorepo, NestJS modular commerce-api, Angular reference shell, lint/format, dependency-boundary enforcement via Nx tags/ESLint, GitHub Actions with non-skippable gates, public/private package boundaries, Compose baseline, conventional versioned contracts and docs-as-code. Lock precise runtime/tool versions when implementation is actually authorized; Node 24 was a historical selected candidate, not an experimentally tested build.

**Exit gate (future):** clean reproducible build, independent domain unit tests, enforceable no-cross-context imports, basic secure config, reproducible local development and no provisioned external account surprises.

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

**Historical proposals (not globally ratified):** local k3d, low-cost k3s VPS labs, Gateway API/Envoy Gateway, TLS/Cloudflare hardening, Helm, Terraform, Argo CD, External Secrets, tested NetworkPolicies, CSI storage, operator-managed Mongo/Kafka labs as justified. Simulate pod/node/network failures, backup restore, secrets rotation and rollback. No high-availability assertion without real multi-node proof.

## M09 — End-to-end validation and distribution

Run deterministic concurrency/chaos, backup restore, authorization isolation, reconciliation, service extraction regression, load tests, SLO evidence, observability validation, independent install and second consumer test. Distribute only explicitly public packages/SDK and docs with legal/operational review. Live monetary operations require a *separate* commercial/tax/legal/security/operations approval.

## Cross-cutting validation and completion gates

FINANCIAL: payment capture/refund and unknown external outcomes; INVENTORY: capacity conservation and unique license assignment; SECURITY: multi-tenant/authn/authz/secret handling; DISTRIBUTED: recovery/Inbox/Outbox/Kafka; DATA-MIGRATION: single writer and restore; OPERATIONS: telemetry, runbooks and rollback; FRAMEWORK: independent installation/second consumer. For each gate, preserve experiment setup, observable oracle and actual evidence rather than inferring readiness from diagrams.

**No approved dates or budget schedule exist.** Temporary labs and local-first cost control are selected historical directions, not permission to deploy or spend.
