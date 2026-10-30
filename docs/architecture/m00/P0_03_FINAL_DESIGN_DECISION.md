# AUD-P0-03 — Design Resolution: Captured Payment and Durable Order Obligation

**Owner:** @sergio-tr · **Selected:** strict owner-local Mongo transactions and Inbox/Outbox semantic idempotence · **Scope:** Stripe test-mode automatic-capture cards initially · **Evidence:** NOT_RUN · **Audit:** OPEN/BLOCKING until failure-path proof.

## Commercial invariant

The accepted Order is durably stored *before* a Stripe operation is allowed to collect. A capture proven by Payments creates an outstanding commercial obligation even if Ordering has crashed, its projection still says `PENDING_PAYMENT`, or webhook delivery is duplicated/delayed. Payments cannot modify an Order directly; CheckoutProcess cannot independently establish financial truth.

## Four alternatives

1. Browser redirect or direct `Order.PAID` after Checkout Session creation: **REJECT**, neither proves captured funds.
2. Publish an event without atomic Payments persistence: **REJECT**, a crash can lose a paid fact or mandatory work.
3. Require one transaction spanning Stripe and multiple bounded contexts: **REJECT**, no such global transaction exists.
4. **SELECTED:** durable pre-payment Order, owner-local atomic financial fact + Outbox, Ordering-local Inbox + Order + CheckoutProcess + mandatory continuation. At-least-once delivery and semantic idempotency, with evidence reconciliation.

## Explicit financial definition for first M04

- Stripe hosted Checkout with card/3DS, `payment` mode, automatic capture candidate, delayed/asynchronous methods disabled. Configuration must be validated against *actual effective* Stripe test-mode settings before implementation sign-off.
- Financial collection is recognized only after Payments verifies the correct Stripe account/mode, Session/PaymentIntent/Charge linkage, expected currency/minor-unit total and actual captured/paid evidence. Do **not** treat `checkout.session.completed` or a success-page return as proof by itself; inspect `payment_status` and PaymentIntent/Charge capture condition according to the pinned Stripe API version.
- Authorized amount versus captured amount and PaymentIntent `processing` versus `succeeded` are distinct; never deliver a license solely on an authorization or an unconfirmed asynchronous state.
- No partial collection/partial line fulfillment is silently authorized. If a mismatch occurs, preserve evidence and enter an investigated financial exception.
- Preserve historical captured fact after refund, dispute or later financial correction.

## Required owner-local atomic boundaries

### Ordering T0 — accepted obligation before payment

Within **Ordering's Mongo session/transaction**:
- insert immutable `Order` with commercial snapshot, buyer/tenant/Store, line identifiers, accepted Quote hash, currency/minor units and version;
- insert `CheckoutProcess` durable saga identity and pending work;
- insert `Outbox` operation to request Inventory reservation.

Commit with explicit transaction write concern `majority` and appropriate read concern and journaling as selected in D-05-MONGO; no Stripe calls inside the transaction. If commit response is UNKNOWN, read back by accepted operation ID, resolve whether already persisted, and **do not enable payment** until positively established.

### Payments T1 — captured fact and required work

After signed webhook verification and/or authenticated provider GET, within a **Payments-owned Mongo transaction**:
- durable Inbox entry (event ID, account/mode/source, payload hash, correlation);
- upsert/append semantic `Payment` captured-funds fact identified by account/mode/PaymentIntent/Charge, with immutable source evidence and Order/generation linkage;
- persist an Outbox `PaymentCaptured` event or reconciliation task atomically.

Only acknowledge webhook 2xx after durable necessary Inbox/Outbox work commits. Unknown DB commit => reconcile local record by operation ID and retry safely without duplicating a charge.

### Ordering T2 — incorporate captured obligation and continuation

Within a **separate Ordering-owned Mongo transaction**:
- Inbox dedupe by producer event ID *and* semantic financial-operation ID;
- validate tenant/store/account/mode, Order snapshot, generation and expected amount/currency;
- incorporate captured financial evidence reference, resolve any conflict with `CANCELED_UNPAID` or a stale saga snapshot rather than silently overwriting historical facts;
- update Order's durable commercial obligation and CheckoutProcess milestone/next job with one owner-local atomic boundary.

If Ordering is unavailable, Payments retains captured truth and Outbox until acknowledged incorporation. If the Order cannot be matched, persist an **orphaned money incident** under Payments and reconcile identity rather than dropping the charge.

### Inventory / Fulfillment continuation

Only after Ordering has incorporated an authenticated capture and authorized commercial delivery may Inventory conditionally COMMIT protected capacity. COMMITTED does not mean digital license allocated or exposed. Fulfillment must separately prepare and assign exclusive licenses, then authorize reveal through the P0-04 branch protocol. A failed inventory commit acknowledgment is UNKNOWN and reconciled before replacing stock or choosing refund.

## Mongo transaction physical selection (D-05-MONGO proposal)

For this project use a local Mongo replica set (single-node for developer convenience, **not** evidence of availability through a failover). Use short owner-local transactions when >1 document must commit together. Explicit `readConcern: snapshot` where supported, `writeConcern: majority` and journal expectations matching the server/driver. Declare actual version-specific config and indexes in a later physical spec. Transactions do not include Stripe and are not evidence of global exactly-once.

A Mongo `UnknownTransactionCommitResult` is not proof of abort; retry commit with supported driver semantics or reconcile by unique immutable operation identity, then resume idempotently. `TransientTransactionError` requires owner-local retry with invariant re-evaluation. Never rerun a *Stripe* POST just because the local commit was ambiguous.

MongoDB driver semantics: https://www.mongodb.com/docs/manual/core/transactions-in-applications/ ; https://www.mongodb.com/docs/manual/core/transactions/

## State / evidence guards

| View | Meaning | Cannot authorize |
|---|---|---|
| `Order.PENDING_PAYMENT` | Ordering has not yet incorporated sufficient captured evidence | prove provider never charged, release capacity or start another Attempt |
| `CheckoutProcess.PAYMENT_CONFIRMED` | durable incorporation of Payments' authoritative fact | independent capture proof |
| `Order.PAID_AWAITING_ALLOCATION` | outstanding commercial obligation to deliver or lawfully compensate | immediate secret disclosure without Fulfillment authorization |
| `Refund.PENDING` | financial operation not yet resolved | commercial compensation completion |
| `Order.REFUND_PENDING` | commercial non-delivery compensation obligation | treating money returned before Refund evidence |

## Tests required before VERIFIED

| Test | Fault | Expected durable facts |
|---|---|---|
| Capture confirmed during Ordering outage | Outbox preserved and eventually incorporated once | one Payment capture, one Order commercial obligation |
| Duplicate signed webhooks, different event IDs same Charge | separate transport facts, one semantic captured result | no duplicate deliveries |
| Ordering T2 commit unknown | successful readback or safe pending reconciliation | no lost continuation, no duplicate paid incorporation |
| Payment amount/account mismatched | quarantined financial exception | never authorize license |
| Session succeeded after previously recorded Order cancellation | durable contradiction and compensation/reconciliation | paid history preserved |
| Browser returns before authenticated webhook | buyer reads PENDING/VERIFYING | no premature key reveal |
| Inventory COMMIT response lost | discover commit by Reservation ID/version | no double capacity or full refund based only on timeout |
| Payments successful Refund and Ordering down | reliable refund result and Outbox | Order not closed until result incorporated |

**Design resolution:** selected protocol is detailed enough for technical review. **Empirical blocker:** actual local Mongo failover/transaction and Stripe test-mode capture/out-of-order webhook tests not run. Keep AUD-P0-03 OPEN/BLOCKING; do not call it VERIFIED or issue a financial implementation task without approved G3 contracts.
