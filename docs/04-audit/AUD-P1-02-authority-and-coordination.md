# AUD-P1-02 — Distinct Sources of Truth and Minimal Durable Saga

**Finding:** P1 / OPEN. **Accepted:** AUD-P1-02-OWNERSHIP-POLICY and AUD-P1-02-COORDINATION-POLICY (alternative C, 15 principles plus C-01..C-08). **Not accepted:** AUD-P1-02-FSM-MIN is explicitly PENDING; a small actual CheckoutProcess FSM has not been selected. AUD-P1-02-CONTRACT PROPOSED — SELECTED (conceptual); AUD-P1-02-IMPL PENDING. **Evidence:** AUD12-T01..T12 TEST_PLANNED.

## The misleading consistency problem

Stripe has captured a payment, but the Ordering projection still says Order.PENDING_PAYMENT and CheckoutProcess.AWAITING_PAYMENT. Inventory remains PAYMENT_PROTECTED. These are *not necessarily contradictory facts*: Payments knows authoritative money, Ordering has not yet incorporated it, and CheckoutProcess has a durable pending step. The defect occurs only if a stale Order or saga state is treated as proof Stripe cannot charge and used to release stock or authorize another attempt.

## Sources of truth and permitted representations

| Object/state | Owner | Legitimate meaning |
|---|---|---|
| Order | Ordering | Commercial purchase identity, accepted immutable economic snapshot, obligation, resolution and recognized fulfillment |
| CheckoutProcess | Ordering | Recoverable work plan, pending operations, incorporated results, idempotent continuation and investigation |
| Payment | Payments | Provider-neutral financial record and confirmed/unknown facts |
| PaymentAttempt | Payments | One authorized commercial opportunity and its Stripe Sessions/operations |
| Refund | Payments | Financial refund operation, actual external status and evidence |
| Reservation / StockPool | Inventory | Protected/available/committed capacity |
| DigitalLicense | Fulfillment | Allocation, access authorization and possibly irreversible disclosure |
| UI projection | Query layer | Potentially delayed, **not** authorization for irreversible effects |

Order.PENDING_PAYMENT means Ordering has not incorporated capture evidence, *not* that capture cannot occur. CheckoutProcess.PAYMENT_CONFIRMED may represent incorporation of Payments evidence, not independent capture. Order.PAID_AWAITING_ALLOCATION may represent a real paid unfulfilled obligation. Refund.PENDING is not completed compensation. A refunded payment must preserve the original captured fact; financial truth is not historically overwritten.

## Ratified additional conditions

**C-01 — State semantics.** Every future FSM state must be classified as authoritative fact, commercial decision, coordination checkpoint or stale projection. Specify the actor who can change it, evidence needed and effects it legally/technically permits. Do not remove a state merely because its name references another context.

**C-02 — Minimal yet durable coordination.** CheckoutProcess must keep all stable operation IDs, applied result facts, pending/unknown records, versions, retry/exclusion controls, evidence references, and mandatory future work. Fewer nominal states are not better if recovery becomes impossible.

**C-03 — Order/CheckoutProcess local atomicity.** These models share the Ordering context but may be separate Mongo documents. If one transition requires the other, a crash must not leave a committed decision without recoverable required work. Choose single document versus local transaction/Outbox later in D-05-MONGO; no implicit atomicity assumed.

**C-04 — No stale-based effects.** Order.PENDING_PAYMENT and saga AWAITING_PAYMENT cannot independently open another Session, release capacity, cancel definitively, deliver keys or initiate incompatible refunds. Financial authorization must compete with close barriers and old potential external effects; a one-off synchronous read is not sufficient.

**C-05 — Semantic idempotency and history.** Distinguish event/delivery IDs, Payment/Attempt, underlying charge identity, incorporated business fact, Order transition and downstream effect. Two different events describing one capture produce one Order paid incorporation. A later refund/dispute adds facts, not deletion of capture.

**C-06 — Refund decision versus outcome.** Ordering authorizes a compensation branch, Payments proves the actual Refund state. Sending CreateRefund or marking CheckoutProcess refunded is not proof funds returned. The Order remains unresolved until provider evidence is appropriately incorporated.

**C-07 — Contradiction handling.** Explicitly investigate Order canceled with late capture, pending Order with Payments captured, refund succeeded without incorporated commercial resolution, stale saga after financial terminal result, mistaken store/generation account and out-of-order tenant-bound evidence. Do not repair by arbitrary cross-context overwrite.

**C-08 — Justified minimalism and read contracts.** Decide each state from meaningful local invariant and transition authority, not a predetermined minimum count. Storefront/admin/support can query composed projections but those views cannot authorize financial or fulfillment effects. Do not introduce CheckoutStatus aggregate or universal Event Sourcing solely for presentation.

## Rejected alternatives

- A — Single global checkout FSM combining inventory, provider payment, Order and refund: state explosion and duplicated authority.
- B — Fully mirrored independent FSMs synchronized via events: allowed as projections, unsafe as distributed business truth.
- C — Distinct authority per context with minimal *recoverable* saga: ACCEPTED policy.
- D — Universal Event Sourcing: unjustified complexity; does not solve external unknown outcomes.

## Dependencies and unresolved specification

AUD-P0-01..04 all OPEN/BLOCKING; AUD-P1-01 and candidate D-01-SM; AUD-P0-03-CAPTURE; D-04-SM; D-05-MONGO; M00.2/M00.3/M00.4. No physical coordinator state machine, guards or storage model is ratified.

**Trace:** AUD-P1-02 → [GitHub #6](https://github.com/sergio-tr/ecommerce/issues/6) → Linear SER-123 → future CheckoutProcess contract → AUD12-T01..T12 (TEST_PLANNED).
