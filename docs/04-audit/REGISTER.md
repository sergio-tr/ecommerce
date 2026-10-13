# M00.1 — Global Consistency Audit and Risk Register

**Review verdict:** NOT READY FOR M00.1-R2 CLOSURE. The original audit found **four P0, six P1 and three P2**. The audit verdict was accepted as a review plan, *not* as acceptance of every technical remedy. All these findings are still OPEN.

## P0 blockers

### AUD-P0-01 — Exclusive financial admission, cancellation and release (OPEN / BLOCKING)

Race: AuthorizeAttempt → CreateCheckoutSession competes with RequestCancellation → CloseChargeOpportunity → ReleaseReservation. Stripe is not in a Mongo transaction; a worker can remain suspended between local authorization and HTTP, resume after a closing barrier, and create another collectible Session. Versioning protects Mongo writes, not the external request. Accepted: versioned durable admission, monotonic financial close barrier, durable release permit scoped to checkout, Order, generation, Reservation identity/version and tenant/account. Still blocked: provable neutralization of previously enabled sends. Reconcile every potentially executed external effect before releasing inventory. Relevant: D-01, D-05, D-06, D-07, AUD-P0-01-DISPATCH-NEUTRALIZATION, AUD01 and AUD01-DT suites. GitHub #1 / Linear SER-118.

### AUD-P0-02 — Unknown Stripe session without provider identifier (OPEN / BLOCKING)

Race: Stripe creates Checkout Session, loses HTTP response; internal record knows account/environment/parameters/idempotency but not Session ID. Idempotency replay is not a safe read, metadata is not unique provider authorization, a negative search may be eventually consistent, and a prior dispatcher may still POST later. Accepted: multi-layer correlation, deterministic operation identity, scope validation, trusted webhooks, paginated discovery, positive provider evidence and conservative exposure retention. Blocked: proving closure/no additional old sends in all relevant cases. AUD-P0-02-PROVIDER-PROOF, AUD02 tests. GitHub #2 / Linear SER-119.

### AUD-P0-03 — Commercial obligation lost between Payments and Ordering (OPEN / BLOCKING)

Race: Stripe confirms capture while Ordering is unavailable. A provider charge is authoritative in Payments and must retain an existing Order and its economic snapshot; durable Outbox/Inbox transfers the financial fact and Ordering persists saga continuation atomically. Accepted: preexisting Order and recoverable idempotent handoff. Still open: actual PaymentConfirmed capture semantics, requires_capture behavior, Mongo physical atomicity, unknown local commit and contract guards. AUD-P0-03-CAPTURE, D-05-MONGO, AUD03 tests. GitHub #3 / Linear SER-120.

### AUD-P0-04 — Fulfillment versus refund irreversible effects (OPEN / BLOCKING)

Race: a license may have been exposed despite losing its HTTP reply; Ordering may not safely change to refund just because the worker timed out. Inverse applies when CreateRefund might have reached Stripe. Accepted: exclusive commercial resolution and durable controlled effects, not a distributed transaction. Still blocked: provable quiescence of old fulfillment/refund executors and external effects, M00.2 disclosure frontier, and safe multi-line preparation. AUD-P0-04-QUIESCENCE, AUD04 tests. GitHub #4 / Linear SER-121.

## P1 specification findings

| ID | Status | Focus | Current direction |
|---|---|---|---|
| AUD-P1-01 | OPEN | Original R1 Reservation financial states versus four capacity states | Four-state D-01-SM only PROPOSED — SELECTED; StockPool atomicity pending M00.2 |
| AUD-P1-02 | OPEN | Duplicate Order, CheckoutProcess and Payment authority | Ownership/coordination policies ACCEPTED; Checkout FSM-MIN remains PENDING |
| AUD-P1-03 | OPEN | Financially safe retry windows and stock-hoarding | Double relative+absolute window is a proposal NOT RATIFIED |
| AUD-P1-04 | OPEN | Stripe Connect, capture mode, store payment policies | Provider-account and API-version-specific contracts pending |
| AUD-P1-05 | OPEN | Mongo write concern, journaling, multi-document transactions, commit unknown | D-05-MONGO PENDING |
| AUD-P1-06 | OPEN | Multi-line all-or-nothing stock and license preparation | Capacity conservation and irreversible disclosure pending M00.2 |

## P2 quality and traceability findings

| ID | Status | Focus |
|---|---|---|
| AUD-P2-01 | OPEN | Precise vocabulary for Payment, Attempt, Session, Charge, Refund, snapshot and coordinator facts |
| AUD-P2-02 | OPEN | Validate proposed Stripe 35-minute duration and maximum two commercial Sessions |
| AUD-P2-03 | OPEN | Unify requirement/ADR/contract/test/evidence traces with source provenance |

## Approved review sequence

1. AUD-P0-01 financial exclusion and durable dispatcher policy (accepted direction, blocker remains).
2. AUD-P0-02 recovery without Session ID (accepted direction, blocker remains).
3. AUD-P0-03 paid obligation propagation (accepted direction, blocker remains).
4. AUD-P0-04 fulfillment/refund exclusive effects (accepted direction, blocker remains).
5. AUD-P1-01 and AUD-P1-02 FSM/ownership (accepted directions, open).
6. AUD-P1-03 commercial retry windows (review written, **explicit ratification pending**).
7. Remaining P1/P2, contracts and evidence traceability.

## Closing rule

M00.1 stays OPEN until no P0 contradictions/specification dependencies remain, contracts are sufficiently explicit, alternatives rejected with reasons, and ratified vs proposed details are separated. Document-only resolution and executed external-provider verification remain separate gates. Neither an issue being closed in GitHub nor a passing unit test automatically upgrades business policy to ACCEPTED or supplier facts to VERIFIED.
