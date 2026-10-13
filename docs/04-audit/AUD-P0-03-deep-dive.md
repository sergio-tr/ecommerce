# AUD-P0-03 — Preserving paid obligations across Payments and Ordering

**Audit severity:** P0. **Current finding:** OPEN / BLOCKING. **Evidence:** TEST_PLANNED, not VERIFIED. **Sources:** Texto pegado (14).txt + explicit user ratification C-01..C-08. This document records the ratified *direction* and its unresolved proof boundary; it does not close the finding or approve a physical algorithm.

## Ratified policy and exact child-state boundaries

- AUD-P0-03-OBLIGATION-POLICY: ACCEPTED
- AUD-P0-03-PROPAGATION: ACCEPTED as a required durable/idempotent property
- AUD-P0-03-CONTRACT: PROPOSED — SELECTED
- AUD-P0-03-SM: PROPOSED — SELECTED
- AUD-P0-03-IMPL: PENDING
- AUD-P0-03-CAPTURE: PENDING

## Minimal eGame failure scenario

Stripe confirms a charge for an eGame Order, and Payments persists its evidence just before Ordering becomes unavailable. The buyer sees PENDING_PAYMENT on an older Ordering view; an unsafe checkout worker interprets that projection as proof no charge exists and releases stock or authorizes another Session.

## Architectural alternatives and rejection rationale

- A — Create Order only after Stripe capture: rejected; loses durable commercial identity when Ordering is down.
- B — Precreate Order but apply payment only in a synchronous webhook callback: insufficient recovery if ACK/results are lost.
- C — One cross-context Mongo transaction from Payments to Ordering: violates private ownership, complicates M07 extraction and still cannot atomically include Stripe.
- D — Pre-existing Order and immutable snapshot, locally durable Payment truth plus Outbox/Inbox and saga continuation: ACCEPTED architectural direction.

## Accepted constraints and safeguards (source-derived summary)

1. Ordering persists Order and accepted economic snapshot before enabling any payable Stripe call; CheckoutProcess and PaymentAttempt references are stable.
2. OrderExists is not PaymentCaptured and does not automatically prove an unconditional fulfillment obligation under undefined commercial/legal terms.
3. Payments alone interprets and persists financial facts, their external evidence and unknown outcomes.
4. Within Payments, financial-fact incorporation and necessary outbound propagation are locally atomic; within Ordering, accepted incoming fact, Order transition and required saga continuation are locally atomic.
5. The physical guarantee (single document vs multi-document, write concern/journal, unknown commit, conflict and failover handling) remains D-05-MONGO PENDING.
6. Do not consider a critical Mongo write persisted merely because an uncertain commit was attempted; do not automatically retry a Stripe charge because the local commit is unknown.
7. Verify webhook authenticity and durably accept minimum relevant evidence before 2xx; webhook ACK is distinct from eventual commercial application.
8. Ordering may remain temporarily PENDING_PAYMENT while Payments knows a charge is captured; old read models cannot grant a new charge, cancellation or release.
9. Distinguish authorization, requires_capture, processing, captured financial truth and business-confirmed payment; actual capture policy is AUD-P0-03-CAPTURE PENDING.
10. Deduplicate based on underlying financial operation identity and commercial transition, not just Stripe eventId or internal message delivery ID.
11. Preserve historical capture, subsequent refunds, disputes and later contradictions rather than overwriting old facts.
12. Stripe charge not correlatable to a valid Order remains a durable Payments financial incident; do not synthesize Order or assign a tenant/store arbitrarily.
13. Commercial obligation is satisfied only by genuinely accredited delivery or corresponding financially confirmed compensation.
14. Detect and replay confirmed financial facts not yet incorporated by Ordering even if the internal Outbox event was delayed or lost.
15. Do not introduce a separate CommercialObligation aggregate, require Kafka in M04, or authorize private cross-context writes by convenience.
16. Recovery and stuck-saga progress require measurable lag, safe retry, owner escalation and repair procedures; a retry limit is not proof that an obligation no longer exists.

## Execution exposure categories (not an approved domain FSM)

- Order registered with accepted terms but no accredited capture.
- PaymentAttempt enabled/processing/unknown independently of Order summary.
- Captured provider payment persisted in Payments and awaiting Ordering incorporation.
- Order has incorporated the paid obligation and holds legitimate work for Inventory/Fulfillment or compensation.
- Refund authorized, externally unknown/pending/confirmed — outcome belongs to Payments.
- An unmatched real charge remains held as an exception pending correlation.

## Concurrent and crash interleavings

- I-01: Payments commits capture+Outbox, then crashes before notifying Ordering — replay later incorporates the same fact once.
- I-02: Ordering commits paid+next saga command but ACK is lost — duplicate delivery is idempotent and causes no second stock commit/delivery.
- I-03: Stripe sends two distinct webhook IDs for the same underlying charge — only one commercial paid transition.
- I-04: Order remains pending while Payments is captured — no new attempt or unsafe release.
- I-05: Mongo commit reply times out — reconcile local commit state before repeating external actions.
- I-06: PaymentIntent is requires_capture — do not treat authorization as final captured funds.
- I-07: Cross-account/cross-tenant payment reference is observed — do not attach to unrelated Order.

## What evidence is necessary and what remains unproved

- Documented locally atomic persistence strategy satisfying financial fact/outbound work and Ordering inbound fact/continuation.
- Provider-authoritative confirmation evidence appropriate to capture mode and effective API.
- Deterministic idempotent consumer tests, loss-of-ACK tests, failover/unknown-commit tests, tenant isolation checks.
- Contracts must specify enough identifiers, versions, provenance and non-regression rules; not yet ratified.

## Future verification and acceptance

**Planned tests:** AUD03-T01–T16. All are TEST_PLANNED; none executed. A passing local mock or database-only transaction test does not demonstrate Stripe provider behavior or universal control of external effects. Test claims require observed provider objects, durable business state, monotonic authorization, cross-tenant isolation, duplicate operation counts and post-restart investigation.

**Dependencies:** D-04, D-05-INBOX/OUTBOX, D-05-MONGO, AUD-P0-02, AUD-P0-03-CAPTURE, M00.4.

**Documentary closure criterion:** user-ratified command contracts, guarded transitions, local atomicity semantics, precise proof/neutralization conditions, durable escalation and no contradictory remaining P0 behavior. Do not introduce services, aggregates or infrastructure without demonstrated need and separate approval.

**Tracking:** GitHub #3, Linear SER-120. Owner: @sergio-tr. Future changes through independent English feature/bugfix branches and conventional commits.
