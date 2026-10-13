# CommerceCore — Discovery Reference Architecture (R0.10)

**Decision maturity:** R0.1/R0.2 functional foundations accepted; R0.3–R0.10 technical choices are selected candidates unless separately ratified in M00.1. This document adds structure to the 181 individual historical decisions; it does not bulk-ratify or implement them.

## Product decomposition

- **CommerceCore:** frontend-agnostic core services and ports for catalog, merchandising, pricing, cart, ordering, payments, inventory and fulfillment.
- **CommerceCloud:** separate provisioning and SaaS control plane (tenant/store creation, memberships, policies), with separate persistence. CommerceCore must never depend on CommerceCloud to behave as an installable engine.
- **eGame:** first reference storefront demonstrating a scarce digital-license purchase and secure key reveal. A distinct second consumer must prove true framework reuse.
- **External channels:** custom storefronts and BFFs consume versioned API/SDK contracts rather than importing internal domain models.

## Historical conceptual deployment topology

The discovery proposed commerce-api as the NestJS modular composition root; cloud-control-api as independent Control Plane; storefront-bff and admin-bff as boundary/session/projection services; payment-integration for provider webhook/Stripe transport; outbox-publisher as a logical publication process; and notification-worker for asynchronous notices without secrets.

**Correction from later D-05 ratification:** M04 durability does not require a standalone Outbox Publisher microservice or Kafka. The historical process names are candidates, not mandatory physical services.

## Proposed monorepo structure (NOT CREATED OR RATIFIED AS PHYSICAL LAYOUT)

- apps/backend: commerce-api, cloud-control-api, storefront-bff, admin-bff, outbox-publisher, payment-integration, notification-worker.
- apps/frontend: egame, store-admin, platform-admin.
- packages/core/<context>: domain, application, adapters.
- packages/cloud; packages/contracts: openapi/events/json-schema; packages/sdk; packages/frontend: shell/ui/themes; packages/platform; tooling.
- infrastructure: compose/kubernetes/helm/terraform; docs: governance/product/architecture/decisions/contracts/security/reliability/operations/validation/planning.

These were **historical design names**, not evidence that directories, deployments or publishable npm packages exist. The npm scope @commercecore/* requires an availability and naming review when relevant.

## Domain guardrail architecture

Use DDD, Ports and Adapters, contract-first OpenAPI/JSON Schema/Ajv, no NestJS dependency from Domain/Application, no cross-context internal imports, no private datastore writes across contexts. Stable economic snapshot belongs to Order. Inventory is authority over StockPool and Reservation. Fulfillment alone can allocate an individual license; assignment must be idempotent per order line and unique under concurrent buyers. Capture evidence belongs to Payments. Cancellation, refund decisions and eventual commercial obligation resolution belong to Ordering.

## Data and integration

- MongoDB driver behind repository ports, local replica-set candidate, private collections per context, shared commerce_db only initially. The replica set is not HA. Actual writeConcern, journaling, transaction and commit-unknown strategy remain D-05-MONGO PENDING.
- Redis caches and short-lived controls are never economic truth; cart authoritative persistence lives in MongoDB.
- Kafka is a M05 transport with KRaft locally and Strimzi in later labs, source-dependent selected proposals. Outbox/Inbox/reconciliation are required already in M04.
- Events use JSON Schema, a versioned envelope with eventId, eventType, schemaVersion, tenant scope where relevant, aggregateId/version, occurredAt and correlationId; never expose license keys, provider secrets or customer-sensitive data in events.
- Cross-service HTTP becomes versioned REST/OpenAPI when extracted; in-process modular boundaries use ports instead of forced internal HTTP.
- Extraction M07 must enforce a single authoritative writer after data cutover; no indefinitely shared mutable collections or cross-context Mongo transactions.

## Security and identity

B2B and B2C Keycloak realms, OIDC BFF with Authorization Code/PKCE, HttpOnly sessions and CSRF, trusted TenantContext, store-scoped commercial buyers, RBAC/ABAC and BOLA/BFLA tests, time-limited support elevation, MFA for administration. Guest order claims require one-use expiry, actor verification and atomic binding, without placing keys into emails, URL query strings or logs. Tenant isolation applies equally to Mongo, Redis, Kafka, Elastic, APIs, events, staff operations and license access.

## License security

Use envelope encryption (KEK/DEK) with versioned keys and auditable disclosure. Assignment is not exposure. If decrypted content may leave trusted processing, treat the key as potentially exposed even if the buyer did not ACK reading it. M00.2 must specify the irreversible effect boundary, multi-line preparation and uniqueness.

## DevOps and runtime technology candidates

Historical candidates: TypeScript/NestJS, Angular Signals/RxJS, Nx/pnpm, Node 24 LTS candidate, Vitest, Testcontainers, Playwright and k6, GitHub Actions, Changesets, local-first Linux/WSL2, Compose, k3d/k3s Kubernetes labs, Helm/Terraform/Argo CD, External Secrets, Cloudflare and Envoy Gateway, OpenTelemetry, Prometheus/Grafana, Jaeger, Elasticsearch/Kibana and Fluent Bit. None of these is automatically a deployed or tested component. No permission to install or spend on lab infrastructure follows from this document.

## Observability and operations

Durable correlation of checkout, Order, PaymentAttempt, Stripe operation, Reservation, Fulfillment and Refund should survive log loss. Traces are not the financial source of truth. Use W3C Trace Context, eventual business dashboards without high-cardinality IDs as metric labels, explicit runbooks, operational ownership of unknown cases, and chaos experiments that inspect actual event/financial outcomes. No universal SLO/HA claims are accepted without evidence.

## Open and deferred scope

Physical fulfillment, real SaaS billing, international tax providers, advanced promotions, sharding, dedicated tenant deployments, marketplace features, arbitrary third-party executable plugins, enterprise HA and service mesh are deferred historical directions. Real money use requires separately reviewed commercial, fiscal, legal, security and operational readiness.

## Governance precedence

The newest accepted branch and authorship rules are feature/bugfix topic branches, PR review, Conventional Commits, English only and sole @sergio-tr accountability. This updates the workflow from the earlier trunk-based historical proposal without altering its archived selection status.
