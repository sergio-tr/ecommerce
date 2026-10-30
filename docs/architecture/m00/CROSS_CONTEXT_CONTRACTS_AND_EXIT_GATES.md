# M00–M09 — Decision-to-Implementation Contract and Test Readiness

**Document status:** proposed executable design contract; no code or experiments. **Owner:** @sergio-tr. **Core architecture:** modular monolith, independent bounded contexts, no global transaction, no improvised external-effect exactly-once guarantee.

## Contract envelope, all commands

Every effectful command must include requestId/idempotencyKey, tenantId/storeId, subject actor/claim reference, owner aggregate identity, expected aggregate version, commercial obligation/order/checkout generation, authenticated authority or permission reference, provenance and immutable correlation. Monetary commands add currency/minor units and accepted Quote digest. Provider commands add livemode, provider account, API version, immutable payload digest, operation identity and current dispatch evidence. License commands add exact OrderLine and disclosure/effect generation.

Responses distinguish APPLIED with durable version/receipt, ALREADY_APPLIED with original receipt, REJECTED with typed reason, and UNKNOWN_OR_PENDING with durable reconciliation identity. **A network timeout is never a REJECTED response**. Read models return evidence recency/authority where relevant; a stale read does not issue any irreversible permit.

## Proposed command catalog (G3 detail to review)

| Contract | Owned by | Required precondition | Durable postcondition and failure result |
|---|---|---|---|
| AcceptQuoteAndCreateOrder | Ordering | signed/validated Quote, Store/Cart/tenant ownership, buyer intent idempotency | immutable Order/CheckoutProcess + required Outbox; ambiguous commit readback |
| ReserveCapacity | Inventory | StockPool available and scoped, expected version, unique request | Reservation and pool capacity conserved in owner-local transaction |
| ProtectReservation | Inventory | original Reservation still RESERVED with verified commercial generation | PAYMENT_PROTECTED durable receipt before Stripe admission; timeout remains unknown |
| AuthorizePaymentAttempt | Payments | Ordering accepted Order/generation; positively protected capacity; no earlier possible collectible attempt | durable finance intent/unique active opportunity; UNKNOWN blocks successor |
| DispatchCheckoutSession | Payments | admissible immutable intent, eligible dispatch grant and consistent version, no competing close | Stripe API call once per operation identity; missing response => UNKNOWN |
| IncorporateCapturedPayment | Ordering | verified Payments owner event, matching account/mode/amount/currency | local Order+CheckoutProcess continuation and Inbox/Outbox atomic |
| CommitReservation | Inventory | authenticated captured obligation and unchanged protected reservation identity | committed capacity, not digital-license reveal |
| PrepareAllDigitalLicenses | Fulfillment | paid and commercially delivery-eligible Order, enough unique usable keys for all lines | all-line unique assignments before any exposure permission |
| PermitAndRecordDisclosure | Fulfillment / Ordering authorization | branch still delivery, exact Order/claim/line version, no refund branch | conservative disclosure-possible fact persisted before sending key; stale grant denied |
| AuthorizeNonDeliveryRefund | Ordering | paid obligation; proof no delivery effect, including old workers; economic branch exclusivity | immutable refund authorization with versioned financial target |
| ExecuteRefund | Payments | unique current refund authorization, original captured Charge/PI, account/mode/amount | durable intent and provider outcome; UNKNOWN reconciled before any retry |
| ReleaseReservation | Inventory | authenticated release permit + proof no possible collectible former operation; no new admissions | RELEASED conditionally, never on TTL alone |
| ResolveIncident | proper owning context | evidence, actor permission, no contradictory old effect | documented safe resolution or holds/exception with audit; never arbitrary state overwrite |

## Concurrency and error matrix

- Two simultaneous last-unit reserves => one wins.
- Simultaneous protected admission and expiry release => exactly one valid transition with finite version evidence.
- Two payment POST workers and a cancellation => at most one potential collectible opportunity; no post-cancel incompatible release.
- Captured payment after cancel => contradiction and compensating commercial obligation, not deletion of charge fact.
- Refund request vs delayed license reveal => either safe branch or incident, no unsupported no-exposure conclusion.
- Mongo failover during local multi-document commit => recover by owner operation ID and durable Outbox, never duplicate provider effect.
- Same provider payment with two webhook Event IDs => one semantic capture incorporation.
- JWT/guest claim from other Tenant or Store => deny all reads and effects; no sender-provided authority.

## Exact readiness steps before any local code

1. Ratify or amend **each typed contract** and its authority, preconditions, schema fields and negative response semantics.
2. For all financial/stock/secret effects, define failure-injection test including timing, injected exception, expected durable records and provider evidence.
3. Decide physical persistence with transaction write concerns and index uniqueness; prove no hidden cross-context write or unbounded lease semantics.
4. Pin exact local runtime tool versions with a reproducible documented dependency lock and allowed modules, test harness and CI acceptance criteria.
5. Create or reuse issue in Linear and GitHub with source decision IDs, explicit Given/When/Then and evidence owner, only after G3.
6. Obtain user approval for the first independent M01 implementation scope (G4). Financial M04 tasks stay blocked until their own G3 and provider evidence contracts are addressed.
7. During implementation, execute Mongo crash/failover, real Stripe test mode and external license response-loss experiments; attach actual measured results. Only then can G5 be asserted.

**Historical tests:** 148 TEST_PLANNED/NOT_RUN, 110 source matching English-oracle fidelity still needs review. No code, resource provisioning or security evidence was generated while preparing these specifications.
