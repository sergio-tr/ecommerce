# M00.4 — Proposed stable ports and cross-context contract catalog

**Status:** PROPOSED G3 INTERFACE BASELINE, revisionable through ADR + schema migration. **Date:** 2026-10-30. **Owner:** @sergio-tr. Not application code, a final ratified API, provider experiment, or global FSM. Existing accepted D-01..D-07 and C-01..C-08/ownership invariants take precedence. All examples use conceptual types for documentation only.

## 1. Contract design rules

1. Every public owner operation has a **stable semantic name**, `schemaVersion`, tenant scope, an immutable idempotency identity, actor/service authority, expected owner version and versioned policy when relevant. Command result is only that owner's fact, not a global promise about another context.
2. Typed outcomes: `ACCEPTED`, `REJECTED_POLICY`, `CONFLICT_VERSION`, `FORBIDDEN_SCOPE`, `DUPLICATE_COMPATIBLE`, `EXTERNAL_OUTCOME_UNKNOWN`, `PENDING_RECONCILIATION`. The last two **must not** be silently interpreted as failure/no charge; an operation may later be captured.
3. Idempotency scope is `(ownerContext, tenantId, operationType, idempotencyKey)` with stored request payload hash, relevant account/mode and exact command scope. Duplicate with different hash is a conflict. Replaying the same command does not imply replaying an external HTTP effect.
4. Owner-local transaction writes authoritative fact, the Inbox/operation deduplication and Outbox atomically. Cross-context events are at-least-once deliveries; duplicates, gaps and reordering require version/causation guards, never last-write-wins financial state.
5. Every source event and result states exact **authority** and **what is not established**. `Stripe Session status complete` is provider Session evidence, not always captured funds; `Order.PENDING_PAYMENT` is not evidence of non-payment; `Refund.PENDING` is not settled refund.
6. Explicit `UNSUPPORTED_SCHEMA_VERSION` is safer than silently processing unknown essential fields. New optional fields should be additive, fields with changed semantics require new versions. Maintain consumer/version registry before breaking changes.
7. Tenant and Store IDs are validated against trusted actor context. A client-provided ID is a selector; it cannot self-authorize an operation.

## 2. Conceptual wire-level envelope

```text
CommandV1 {
  commandId, commandType, schemaVersion, tenantId, storeId?,
  aggregateId?, commercialGeneration?, expectedVersion?,
  correlationId, causationId?, idempotencyKey, immutablePayloadHash,
  actorRef, authorizationRef?, policyVersion?, requestedAt, payload
}
OwnerResultV1 {
  commandId, ownerContext, ownerAggregateId, observedOwnerVersion?,
  resultType, durableOperationId?, reasonCode?, retryAfter?, evidenceRef?,
  correlationId, occurredAt
}
DomainEventV1 {
  eventId, eventType, schemaVersion, ownerContext,
  ownerAggregateId, ownerAggregateVersion, tenantId, storeId?,
  commercialGeneration?, correlationId, causationId, occurredAt,
  immutablePayloadHash, redactedPayload
}
```

Do **not** put card data, raw keys, BFF authentication cookies, Stripe secrets or PII in the envelope. Actor reference in events is a redacted audit identifier, not bearer capability. The persisted operation's private forensic record can be richer but uses least-privilege access and retention rules. Physical serialization remains to be approved per endpoint/version.

## 3. Public ports — authority, safety and extension seams

| Port and proposed signature (conceptual) | Authority and durable success evidence | Safe error/unknown behavior | Change seam |
|---|---|---|---|
| `Catalog.GetVariant(tenant, variantId, revision?) → VariantSnapshot` | Catalog immutable versioned identity/schema | Not found or scope denied; no price authority | New attributes as versioned schema |
| `Merchandising.ResolveOffer(store, listingId, channel, at) → OfferSnapshot` | Published Listing and Offer eligibility | No saleable offer if not published; no inventory inference | New channel/eligibility rules |
| `Pricing.QuoteCart(store, cartRevision, policyRevision) → QuoteProposal` | Price/tax rule and deterministic Money calculation | Return reprice conflict, never mutate an accepted Quote | Replace demo TaxPort |
| `Ordering.AcceptQuoteAndPlaceOrder(quoteRef, buyerCapability, requestKey) → OrderRef` | Preexisting Order ID and immutable accepted Quote snapshot persisted | Reject stale quote; retry identical intent returns same Order | Multi-line and fulfillment strategy |
| `Inventory.ReserveBatch(orderRef, lines, supplyVersions, key) → ReservationRefs` | Atomic owner-local Pool CAS + all lines Reservation ledger | Any shortage rejects whole batch, unknown commit requires readback | Physical stock/warehouse adapter |
| `Inventory.ProtectReservations(order, generation, paymentAdmissionEvidence) → ProtectedRefs` | Versioned protected capacity without Stripe status mirroring | Race/unknown => no release; retrieve owner fact | Multiple warehouses |
| `Payments.AdmitAttempt(order, quoteDigest, generation, accountRef, policyVersion) → AttemptRef` | Durable owner-local admit + possible-send operation | If old attempt possible or unknown, refuse successor and retain hold | Other provider / retries |
| `Payments.ReconcileProvider(operationRef, evidenceRefs) → PaymentFactRef` | Verified account-scoped provider observations and local captured-funds ledger | UNKNOWN remains UNKNOWN; search miss cannot clear old send | Provider query/adapters |
| `Ordering.IncorporatePaymentFact(eventRef, orderRef) → IncorporationRef` | Ordering Inbox + Order commercial snapshot/CheckoutProcess updated atomically | Duplicate idempotent; contradiction incident, no erasure of capture | Async transport Kafka |
| `Inventory.CommitProtected(order, allocationPolicy, expectedVersions) → CommitRefs` | Owner-local capacity transition exactly once | Contradictory generation => reject; no keys disclosed | Shipment fulfillment |
| `Fulfillment.PrepareAll(order, lineBindings, generation) → OpaquePreparedSet` | Every key uniquely assigned, encrypted and prepared before exposure | Missing key rejects entire pre-exposure preparation; incident for ambiguous commit | Different goods/entitlements |
| `Ordering.AuthorizeResolution(order, action, evidenceDigest) → ResolutionPermit` | Commercial decision belongs to Order; compatible branch guard | Possible secret exposure/refund forbids contradictory automatic decision | Post-delivery goodwill/manual policy |
| `Fulfillment.DisclosePrepared(preparedSet, authorizedActor, permit) → DeliveryEvidence` | Persist POSSIBLE_DISCLOSURE **before** revealing any secret | Lost response means maybe exposed; never reset saleable | New presentation/access grant adapter |
| `Payments.ExecuteAuthorizedRefund(permit, paymentRef, amount, key) → RefundOperationRef` | Payments durable Refund and provider evidence | PENDING/UNKNOWN is not refunded; no blind duplicated POST | Connect flow, partial refunds |
| `Ordering.RequestCancellation(order, actor, generation) → CancellationReviewRef` | Monotonic business close intent, no new commercial admits | Old possibly sent Stripe op must reconcile before release permit | Cancellation UX/timing |
| `Inventory.ReleaseWithPermit(reservation, releasePermit, expectedVersion) → ReleaseRef` | Positive proof of no outstanding collectible old send bound to exact Reservation/version | Cannot prove? HOLD, incident, no TTL shortcut | Other reservation sources |
| `Identity.Authorize(actor, action, resource, sessionRef) → ScopedAuthorization` | Verified tenant/store/subject/role/claim, check expiry/revocation | Default DENY, never trust browser selectors | Replace IdP, guests and service auth |
| `CommerceCloud.PublishStorePolicy(store, version, operatorAuth) → PublishedPolicyRef` | Cloud owns config and tenant lifecycle | Core rejects untrusted/downgraded policy, accepted Orders retain snapshot | More merchants/channels |

These port names are **illustrations of command intent**, not declarations that every context owns a separate deployable service or that the response is synchronous. The physical port shapes should be adjusted by the relevant G3 ADR, preserving ownership and invariants.

## 4. Versioning, provider evidence, and timeout contract

- Client retry and provider retry are **different**. Retry on a local command is safe only if the owner can deduplicate it; retry of Stripe POST may create an externally collectible effect after an idempotency key is pruned. No automatic success-to-failure conversion after HTTP timeout.
- Provider adapter requires `ProviderScope(provider, accountId, apiVersion, environment, merchantMode)`, `ProviderOperationId`, `immutableRequestHash`, `idempotencyKey`, `possibleSendTimestamp`, actual `providerObjectRefs[]`, and evidence provenance. For API v1, Stripe's documented idempotency response rules and key-pruning horizon matter; API v2 differs. Pin exact API version per connection.
- Typed payment evidence `SESSION_OPEN`, `SESSION_COMPLETE`, `PAYMENT_INTENT_REQUIRES_CAPTURE`, `CAPTURE_CONFIRMED`, `REFUND_PENDING`, `REFUND_CONFIRMED`, `EXTERNAL_OUTCOME_UNKNOWN` is an **evidence taxonomy**, not one payment domain FSM.
- Unknown Mongo transaction commit: caller reads back by durable operation identity, never infers failure from lost ACK. Unknown Stripe operation: refrain from new collectible attempt and StockPool release unless all possibly sent effects are provably resolved.
- Error result `RETRYABLE_LOCAL_CONFLICT` may retry a Mongo owner-local operation with the same idempotency key after readback; `EXTERNAL_OUTCOME_UNKNOWN` must not trigger blind external resend.

## 5. Workflow-specific state ownership and allowed transitions

| Fact | Owner | Required historical invariants | Never infer |
|---|---|---|---|
| `Order.PENDING_PAYMENT` | Ordering | accepted economic obligation persists | absent Stripe charge |
| `Order.PAID_AWAITING_ALLOCATION` | Ordering | delivery or compensation still owed | allocation done |
| `CheckoutProcess.PAYMENT_CONFIRMED` | Ordering | Payments fact has been incorporated idempotently | CheckoutProcess independently settled funds |
| `PaymentAttempt.UNKNOWN` | Payments | collectible opportunity may still exist | safe new attempt |
| `Refund.PENDING/UNKNOWN` | Payments | immutable refund operation retained | cash returned to buyer |
| `Reservation.PAYMENT_PROTECTED` | Inventory | quantity unavailable to resale until positive permit or commit | Stripe status itself |
| `DigitalLicense.POSSIBLE_DISCLOSURE` | Fulfillment | unique license no longer safely resellable | buyer definitely saw or did not see secret |

Do not compress these owner-local states into `CheckoutStatus`; mixing them would make compensation/late provider messages ambiguous.

## 6. Conformance and acceptance oracle matrix

1. **Catalog/Quote:** stable immutable accepted totals despite later Offer/StorePolicy changes, no rounding drift for currency minor units, expired Quote rejects.
2. **Identity/Tenant:** same account cross-store cannot access customer/order without membership; browser-injected tenant header cannot authorize payment/refund/secret disclosure.
3. **Inventory:** last unit concurrency permits at most one effective Reservation; duplicate requests don't decrement twice; shared quotas and multiline all-or-nothing.
4. **Payments:** webhook duplications and out-of-order events never double-capture in local ledger or erase captured history; lost create response remains unresolved, no second payment Session.
5. **Ordering:** Payments captured fact while Ordering offline recreates pending obligation exactly once; late financial fact does not justify contradictory auto refund or ignore amount.
6. **Fulfillment:** duplicate key assignment impossible by unique index; possible-disclosure recorded before any HTTP secret output; lost response does not release.
7. **Cancellation:** a past HTTP dispatcher paused after authorization and resumed after cancellation prevents unsafe release absent conclusive neutralization.
8. **Replay/schema:** event major version unknown rejected/quarantined; additive versions tolerated only under recorded compatibility rules; no projection authorizes business effects.
9. **Security/observability:** logs and events contain no raw license, payment secret, guest capability or session token.
10. **Migration:** the same owner-local invariants must pass before and after any M07 service extraction.

All oracles above are **TEST_PLANNED / NOT_RUN** until code/provider/database evidence exists; existing 148 original experiments retain their own identifiers, source and status.

## 7. Later milestone interfaces and consciously deferred work

- **M01:** use Nx/pnpm/Nest + pure domain dependency restrictions and one health API only after design gate/G4. k3d/K3s/Helm/Mongo are later authorized slices; Docker is not a prerequisite for empty Nest bootstrap.
- **M02:** Cloud provisioning, IdentityPort, tenant auth and StorePolicy publish require scoped security G3. Start with one Store in UI but maintain tenant/store refs in every command.
- **M03:** Catalog/Listing/Offer/Quote implemented with Money and versioning; never leak payment details into Quote.
- **M04:** financial and fulfillment ports require ratified exact contracts and provider/driver fault experiments before G5 safety. Hosted test card/3DS only, no real money.
- **M05:** Kafka may replace Outbox transport but cannot replace transactional persistence/Inbox, and topic ownership remains by bounded context.
- **M06:** second independent consumer proves no CommerceCloud or eGame coupling; only stable documented ports become public SDK exports; open-source license is separate approval.
- **M07:** migrations preserve one authoritative writer, expand/migrate/contract events and DB ownership; two Deployments are not automatically two independently owned services.
- **M08:** production ingress/TLS/GitOps/HA/secret rotation only under separate security/cost and actual restore acceptance; a one-member Mongo replica set is not availability proof.
- **M09:** restore/chaos/tenant isolation/product interoperability and cost/supply-chain release gates; real-money launch requires separate legal/security/owner authorization.

**Change policy:** a proposed port can be replaced without changing domain money/stock/obligation invariants when an adapter contract passes its conformance suite. A changed invariant or irreversible financial effect requires a new explicitly reviewed ADR and migration. No claims of final immutable truth.
