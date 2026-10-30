# CommerceCore — Initial cross-context reference architecture (M00.2–M00.4, M02/M03 handoff)

**Status:** RECOMMENDED DESIGN BASELINE / OWNER REVIEW REQUIRED, not final implementation truth, not an ADR ratification, not a G4 grant. **Date:** 2026-10-30. **Owner:** @sergio-tr. Modular monolith first, isolated context ownership from day one; migrate by contracts when evidence justifies it.

## 0. Decision framework: minimize expected rework without overengineering

- Reversible by config/adapter: versions, selected providers, tax calculators, notification sinks, auth adapters, host names, queues, UI options, API exposure, currency/method policy.
- Reversible by versioned migration: aggregate layout, Mongo indexes and scopes, module boundaries, StorePolicy snapshots, API/event schemas; require expand/migrate/contract.
- High-cost/irreversible: financial effects, buyer commercial obligation, tenant ownership, leaked license keys, published events and payment refunds. Design these as invariant-bearing contracts and never derive them from read models.
- All decisions below use `RECOMMENDED_FOR_REVIEW`. If an existing accepted ADR conflicts, the accepted ADR wins and the conflict must be reviewed explicitly; this document cannot silently supersede it.
- A future decision is changed by new ADR and migration, not by rewriting old rationales or source hashes. Propose a review when real use cases, load, provider capabilities or new consumers justify it.

## 1. Context ownership and module topology

| Context | Authoritative facts | Public application ports | Adapter details deferred |
|---|---|---|---|
| Catalog | Product/Variant, typed attribute schemas, published master references | GetProduct, ValidateVariant, RecordCatalogChange | Mongo schema/search |
| Merchandising | Store Listing visibility, Offer eligibility, channels and sales terms | ResolveListing, GetEffectiveOffer | Search/index |
| Pricing | Money math, pricing/tax policy version and immutable Quote proposal | PriceCart, AcceptQuote | Tax port, promotion |
| Cart | Guest/auth buyer intent and line revisions | AddLine, GetCart, SubmitCart | Persistence |
| Ordering / Order | accepted Quote snapshot, Order identity, commercial obligation/resolution | PlaceOrder, CancelOrder, DecideResolution | Mongo transaction |
| Ordering / CheckoutProcess | durable pending operations, incorporated facts, repair/timeout decisions | AdvanceCheckout, IncorporateResult, Reconcile | Outbox executor |
| Payments | ProviderOperation, PaymentAttempt, captured Payment, Refund and evidence | AdmitAttempt, ReconcileProvider, ExecuteAuthorizedRefund | Stripe/test provider |
| Inventory | StockPool, quotas, Reservation, conservation | Reserve, Protect, Commit, ReleaseWithPermit | Mongo transactional CAS |
| Fulfillment | unique DigitalLicense, assignment, access grant and possible disclosure | PrepareAll, AuthorizeAccess, RecordExposure | Secure secret store |
| Identity | actor/session/claim, tenant/store memberships, authz decisions | AuthorizeAction, VerifyClaim, ResolveTenant | OIDC/Keycloak |
| CommerceCloud | Tenant/Brand/Store lifecycle, memberships, configuration policy | ProvisionStore, PublishPolicy | SaaS DB |
| BFF/eGame | authorized read composition, buyer UX and anti-CSRF edge | Backend commands delegated to owners | Angular / future clients |
| Notifications | redacted messages and delivery attempts | Notify, RecordDelivery | Email/SMS later |

Rules: domain + application cannot import NestJS, Stripe, Mongo, Kafka, Keycloak or Angular. Cross-context communication happens through versioned contracts, never private table/collection imports; same process is not permission to violate a context. Composition roots may wire modules. Never add a global `CheckoutStatus` or an unnecessary duplicate `CommercialObligation` aggregate; these are concepts already owned by Order and CheckoutProcess.

## 2. M00.2 Inventory and unique DigitalLicense

### StockPool and Reservation recommended shape
- `StockPool(poolId, tenantId, supplyVersion, authorizedCapacity, unavailableCapacity, activeHolds, committedUnits, auditedAdjustments, version)`; Store allocation quotas are separate scoped rights, never synthetic extra global stock. Supply can represent individually imported digital licenses, physical inventory later via adapters, or a separately governed entitlement source; do not assume all units are physical.
- `Reservation(reservationId, poolId, storeId, orderId, orderGeneration, lines, quantity, phase, expectedPoolVersion, admissionVersion, timestamps, operationIds)`. Its proposed `RESERVED/PAYMENT_PROTECTED/COMMITTED/RELEASED` vocabulary is capacity-specific and monotonic. Store an external cause/permit reference, never a Stripe status.
- Conservative conservation candidate `authorizedSaleable = available + outstandingHolds + committed + explicitlyDisabled` within one chosen capacity unit and accounting horizon, with audited adjustments reconciled to import/remove movements. **Do not count unique keys separately again**; validate with a ledger/query oracle and exact supply semantics in the future ADR. Hard rule: `available >= 0`, `quotaUsed <= quotaLimit`, every commitment consumes previously admitted capacity exactly once.
- Tenant+pool+reservation+command unique indexes and versioned CAS. Atomic local transition updates Pool counters, Reservation phase, idempotency Operation and owner Outbox in a **single Inventory transaction** if stored separately.
- `RESERVED` 15-minute timer is *review eligibility only*, never delete TTL or proof that no collectible Stripe operation exists. `PAYMENT_PROTECTED` persists until positive ReleasePermit or COMMITTED.
- Shared same-tenant StockPools are explicit allocation/quota relationships; cross-tenant references denied. A later physical stock reservation variant can implement the same capacity API with additional shipping concerns isolated in a separate fulfillment adapter.

### DigitalLicense assignment and key exposure
- Fulfillment owns `DigitalLicense(licenseId, tenantId, storeId/assignedPool, productVariantRef, ciphertextRef, secretVersion, assignment, disclosureEvidence, version)`. Do not store plaintext in log, outgoing event, mail, URL query, analytics or DB read projections.
- Unique `(tenantId, licenseId)` and `(tenantId, orderId, orderLineId, assignedUnitId)`; idempotent assignment and immutable association once possibility of disclosure exists. Upstream StockPool capacity and Fulfillment key inventory require a reconciliation protocol, not a shared write.
- `PrepareAll(order, lineItems[], generation)` stages **all** required keys and returns cryptographically opaque preparation references before any reveal token is issuable. Use owner-local transaction for batch uniqueness; no partial-line rollout to the consumer.
- `AuthorizeDisclosure` validates Ordering commercial permit, actor resource authorization, current generation and prepared-all evidence. **Persist POSSIBLE_DISCLOSURE before** returning any secret-bearing response, including a retry. If the client connection drops after potential access, retention remains; no automatic resale or incompatible no-delivery refund.
- Short-lived single-purpose access grant is defense in depth, **not** proof that no stale worker can still disclose. Introduce future rights delegation and KMS/rotation behind ports; changing crypto is a migration with re-encryption audit, not a domain transition.
- Full-order preparation is logically all-or-nothing; operational partial delivery, disputes and voluntary post-disclosure refunds need separate auditable incident and resolution policies.

### M00.2 verification contracts
Concurrent last-unit holds, three Store quotas against one pool, duplicate reservation, crash between transaction and response, Payment-protected TTL overrun, unique key race, lost delivery HTTP response, incompatible refund, batch multiline shortage. Unit/property contracts can be specified before code; true transaction and external response tests are G5 later.

## 3. M00.3 Identity, tenant authority and secure BFF

- `TenantId` and `StoreId` always come from a **verified authenticated principal and owner-resolved mapping**, not untrusted path/header alone. A path ID is a resource selector only; every effect requires authorization against authoritative relationship and active Store/Tenant policy.
- Distinguish SaaS Tenant administrator, Brand/Store operator, buyer account, guest capability and support incident operator. Create actor–resource–action matrix with explicit deny by default. Check `tenantId + storeId + orderId/generation + action` for every payment/cancel/license/refund/admin command; buyer can request refund, but only Ordering may authorize commercial resolution and Payments may execute.
- Recommended first slice: guest checkout uses random cryptographic bearer `GuestOrderCapability` transmitted in secure HttpOnly SameSite cookie bound to Order, Store and specific actions, TTL and revocation; hash server-side, rotate on claim, avoid identity claims from public email/order number. CAPTCHA/rate limits layered on abuse-sensitive endpoints.
- Authenticated buyer `StoreCustomerIdentity` is store-scoped even if technical user login may be reused; never infer globally shared purchase visibility. Guest → account claim requires verifiable possession and atomic single-use token; prohibit cross-tenant linkage. Stale sessions/revoked claims cannot authorize new secret reveals.
- BFF recommended server-managed OIDC authorization-code+PKCE, state/nonce/issuer/audience validation, secure cookies and CSRF defense for mutations; do not use access tokens in localStorage. Keycloak is a replaceable Identity Provider adapter, not embedded Domain code; tenants/roles enforced by CommerceCore application services, never delegated solely to UI.
- Admin support elevation requires timebound explicit role, reason/ticket, 2FA where available and immutable audit; may investigate incidents but not bypass financial invariants. Secrets scoped by environment and role; deny live payment mode on learning stack.
- Privacy: PII minimization, ciphertext for licenses, redaction, retention schedules and erasure exceptions for immutable legal/audit facts; run multi-tenant/BOLA and CSRF negative cases before exposing endpoints.

### Authorization contract examples
`Authorize(actor, action=ORDER_CANCEL_REQUEST, resource=(tenant,store,order), generation, policyVersion)` returns immutable authorization reference + expiry; application **rechecks owner facts** before mutation. Client `X-Tenant-Id` alone is never sufficient. Admin cannot directly execute a financial Refund without accepted Ordering resolution.

## 4. M00.4 Commands/events/integration boundary

### Canonical versioned envelope (illustrative, not committed API JSON schema)
```text
ContractEnvelope {
  eventId | commandId, contractName, schemaVersion, occurredAt,
  tenantId, storeId?, aggregateId, aggregateVersion, commercialGeneration?,
  correlationId, causationId, actorOrServiceRef?, policyVersion?,
  idempotencyKey, payloadHash, payload
}
```
- Unique namespace `(tenantId, owner, operationType, idempotencyKey)` with immutable request hash and expiry chosen **longer than every possible business effect/replay horizon**, or durable indefinite reconciliation where proof isn't possible. A duplicate key with different hash is a conflict, not silent reuse.
- Clear `REQUESTED / ACCEPTED / REJECTED / UNKNOWN` response taxonomy by operation, and typed `CONFLICT_VERSION / FORBIDDEN_SCOPE / DUPLICATE_SEMANTIC / EXTERNAL_OUTCOME_UNKNOWN` errors. These are **contract outcomes**, not one shared domain FSM.
- OpenAPI and future Cloud/SDK public contracts use semantic versioning: backward-compatible additions first, dual-read/dual-write where necessary, deprecation with recorded consuming versions. Event consumers ignore unknown additive fields and reject incompatible major schema until migrated; message duplication and reordering are normal.
- Persist Inbox dedupe+state mutation+Outbox atomically in owner DB. Acknowledge provider webhook after signature/account validation and durable Inbox admission, not after optional downstream side-effects. Outbox retries at least once; consumer semantic idempotence and version guard required. Kafka transport can later replace in-process delivery **without** changing financial authority.
- External calls never occur inside DB transaction; retry policy for money is distinct from a safe local Inbox retry. Provider key retention/replay and proxy/network timeouts require explicit per-operation contracts.
- Read models declare source version, freshness and trace ID, but cannot drive reserve/release/refund/license reveal decisions. All irreversible commands read owner-local authoritative facts.

### Commercial operation trace example
`QuoteAccepted` (Pricing) → `OrderPlaced` (Ordering with immutable snapshot) → `ReservationProtected` (Inventory evidence) → `PaymentAttemptAdmitted` (Payments) → `ProviderOperationPossiblySent` (Payments) → `CapturedFundsFact` (Payments) → `PaymentFactIncorporated` (Ordering) → `ReservationCommitted` (Inventory) → `AllLicensesPrepared` (Fulfillment) → `DisclosurePotentiallyOccurred` (Fulfillment). On failure, Ordering chooses exclusive recovery/refund authority; each owner enforces its own guards. This is a **trace example**, not a mandatory synchronous workflow or a global FSM.

## 5. M02 CommerceCloud / M03 Catalog–Offer–Quote evolvability

- `Tenant → Brand/Store → Channel` hierarchy. CommerceCloud owns provisioning/configuration and its own DB; CommerceCore owns commercial aggregate facts. Config changes emit a versioned StorePolicy snapshot and do not silently mutate an already accepted Quote/Order.
- Catalog Product/Variant are reusable across authorized Stores; Store Listing is publication; Offer is store/channel price/eligibility and policy conditions. Do not collapse Product, Listing and Offer into one aggregate; cross-tenant sharing only explicit copy/import.
- Money recommended: integer **minor units** or exact decimal with explicit currency scale, no binary floating-point for monetary arithmetic. `Money(currency, amount)`; no cross-currency add without conversion contract; deterministic rounding per currency/tax line and snapshot policy.
- Quote is immutable when accepted: line identities, effective Offer revision, currency, tax-adapter version, discounts and totals, StorePolicy version, buyer eligibility and expiry. Repricing creates a new Quote revision; accepted Order references the accepted exact Quote, not live catalog prices.
- T1 tax adapter is explicitly a local education/demo calculation, **not** production tax compliance. Optional notifications never contain activation secrets.
- Buyer journey: catalog → cart → immutable quote → order → stock protection → hosted payment test → confirmed capture → fulfillment claim. Pending/unknown renders "being verified", never "failed/no charge" without authoritative proof.
- First line checkout can be restricted in exposed MVP **without** making multiline impossible in the domain model; similarly one merchant is scope limitation, not an eternal engine constraint.

## 6. Change control, deferred interfaces and decision triggers

| Interface | Initial choice | Upgrade/replacement trigger | Invariant to preserve |
|---|---|---|---|
| PaymentProviderPort | Stripe hosted test card/3DS | Real business/Connect/more methods | captured evidence and unknown send safety |
| CapacityPort | StockPool + Reservation | Physical goods/warehouse | no oversell, capacity rights |
| FulfillmentPort | individual encrypted key | Gift cards/shipping/fulfillment network | no incompatible refund/disclosure |
| IdentityPort | guest capability + OIDC adapter | alternative IdP/multi-org federation | verified tenant/actor scope |
| TaxPort | labelled demo T1 | jurisdiction/real compliance | immutable accepted Quote |
| EventTransport | in-process + transactional Outbox | Kafka M05, services M07 | durable semantic delivery |
| DataPort | Mongo owner-local transactions | relational or split DB | atomic owner fact+Inbox/Outbox |
| Frontend | eGame Angular BFF | other storefronts/SDK | backend owner guards |
| Deployment | local K3s/k3d in M01 | HA cloud / GitOps / M08 | reversible config and no live secrets |

**Explicit later review triggers:** first real-money launch; second merchant or Store funding route; digital-to-physical stock; multiple storefront consumers; multi-region HA; published SDK contracts; changed jurisdiction; material throughput evidence. No public license, provider choice or timing constant is accepted without the corresponding future decision.

## 7. Review exit

Each owner packet must have: problem/constraints, alternatives, recommended behavior, exact authoritative state, persistence boundary, idempotency key and version, unknown/timeout behavior, allowed/forbidden transitions, threat cases, proposed tests, upgrade seam and source. The [13-audit contract pack](M00_G3_ALL_13_AUDITS_RECOMMENDED_CONTRACTS.md) and [planning reconciliation](../../planning/wave1/M00_G3_PLANNING_RECOMMENDATIONS.md) supply the mapping; approvals remain with @sergio-tr and the exact canonical decision register.

**No implementation, no test evidence, no financial P0 closure is claimed.**
