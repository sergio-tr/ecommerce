# CommerceCore — Domain and Authority Map

## Product boundaries

CommerceCore is a reusable installable headless commerce engine, not a Stripe application. CommerceCloud is a SaaS administrative Control Plane with independent lifecycle and persistence. eGame is a consumer storefront for individually identifiable digital game-license stock. Physical goods must be possible through future ports, not by leaking physical-shipping concerns into the initial digital checkout.

### Multi-tenant hierarchy

Tenant → Brands / Stores → Storefronts / Channels. A Store can have independently published Listings and Offers for shared Products/Variants. Same-tenant shared catalog references and StockPool quotas require explicit governed allocations. Cross-tenant relations are copy/import only, never private foreign-object pointers. Commercial customer profiles are store-scoped even if technical identity is reusable.

## Context authority matrix

| Bounded context | Owns | Must not own |
|---|---|---|
| Catalog | Product, Variant, product namespaces, attribute schemas, references and controlled inheritance | Price captured for an accepted Order |
| Merchandising | Listing publication and visibility, Offer conditions | Physical stock or financial capture |
| Pricing | Price computation, currency constraints, tax port and quote preparation | Mutating Order economic snapshot after acceptance |
| Cart | Persistent guest/authenticated cart | Charging, allocating keys or committing inventory |
| Ordering / Order | Accepted commercial snapshot, order identity, obligation, resolution decision and fulfillment incorporation | Stripe provider truth |
| Ordering / CheckoutProcess | Durable saga coordination, pending/outgoing work, incorporated results, investigation state | Independent financial or inventory authority |
| Payments | Payment, commercial PaymentAttempt, Refund, Stripe account-scoped operations, verified provider evidence, reconciliation, financial close permission | Writing Order or Inventory private persistence |
| Inventory | StockPool, quotas, Reservation, available/protected/committed/releasable capacity | Stripe Session or individual key disclosure |
| Fulfillment | DigitalLicense assignment, validity, access preparation, potential irreversible disclosure, delivery evidence | Authorizing an incompatible refund |
| Identity & Access | Trusted actor identity, tenant/store scope, session/claim authorization | Treating client IDs or Stripe URLs as commercial proof |
| CommerceCloud | Tenant provisioning, memberships, policy administration and SaaS management | Directly taking ownership of CommerceCore transactions |
| BFF / storefront / admin | Session boundary, authorized composition of views and command forwarding | Bypassing business guards or authorizing irreversible effects |
| Notifications | Buyer and operator notifications | Placing license material in email or making messages financial truth |

## Hexagonal and DDD direction

Domain and Application do not depend on NestJS, MongoDB, Kafka, Redis, Stripe, Angular or Keycloak. Domain aggregates enforce local invariants. Application orchestration uses explicitly versioned ports. Infrastructure adapters implement DB, provider and messaging contracts. Do not import other contexts' internals or write directly into another context's collections, even in the initial modular monolith.

Order and CheckoutProcess both belong to Ordering, but do not assume separate documents are automatically updated atomically. D-05-MONGO and AUD-P0-03 must define document layout/transaction choice and durable propagation guarantees.

## Critical state semantics

- Order.PENDING_PAYMENT means Ordering has not incorporated a confirmed financial result; it is not proof Stripe has not charged.
- CheckoutProcess.PAYMENT_CONFIRMED may mean a confirmed Payments event has been incorporated; CheckoutProcess does not independently settle money.
- Order.PAID_AWAITING_ALLOCATION may be a real unfulfilled obligation even if coordination work is pending.
- Refund.PENDING describes provider execution, not completed commercial compensation.
- Reservation.PAYMENT_PROTECTED concerns capacity ownership even when the exact provider stage is unknown.
- Reservation.COMMITTED is neither license allocation nor key disclosure.
- Disputes/refunds are subsequent facts layered on captured payment history, never retroactive erasure of the charge.

## Modular-monolith-to-services migration

Maintain domain ownership from the start; use in-process ports and durable handoff as needed. Future M07 extraction isolates Catalog, Payments, Inventory and Ordering, with separate persistence and credentials after cutover. Only one authoritative writer per entity during expand–migrate–contract. Kafka transport in M05 must not be used to bypass M04 safety or replace local Outbox atomicity.

## Future boundaries

M00.2 — StockPool/Reservation capacity conservation, shared quotas, individual DigitalLicense allocation and exposure frontier; all-or-nothing preparation for multi-line orders.

M00.3 — Guest claim/authentication, secure cancellation, one-use links, Keycloak/OIDC roles and object-level RBAC/ABAC.

M00.4 — Versioned inter-context contracts, error semantics, context maps and extraction compatibility checks.

All designs above preserve their original historical versus explicitly ratified status.
