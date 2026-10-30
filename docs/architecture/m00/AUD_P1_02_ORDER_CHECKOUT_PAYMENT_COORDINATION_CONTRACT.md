# AUD-P1-02 — Order / CheckoutProcess / Payments ownership and local saga contract

**Status:** REVIEW-READY DETAILED CANDIDATE, not final ratification of AUD-P1-02-FSM-MIN or G5 proof. **Date:** 2026-10-30. **Owner:** Ordering (Order + CheckoutProcess); financial fact owner Payments. **Original:** GitHub #6 / Linear SER-123, AUD12-T01..T12. Preserves user-accepted AUD-P1-02 ownership and C-01..C-08 coordination policies without inventing a new global `CheckoutStatus` aggregate.

## 1. Three distinct object responsibilities

**Order** stores durable commercial identity and immutable accepted Quote snapshot (tenant/store/OrderLine[]/Money/tax/policy/generation), a commercial obligation to fulfill or compensate, the exclusive *business* resolution choice, and delivery facts the owner incorporated. Order persists **before** a potentially collectible provider Session is admitted. Captured/refunded history is never retroactively erased from Order merely because an operational phase changes.

**CheckoutProcess** belongs to Ordering and coordinates a recoverable saga: outstanding work, attempt/generation, pending commands, last incorporated owner facts, evidence references, sequencing barriers and incident/cancellation investigation. It is **not** independent truth about provider charges, StockPool counts or key exposure. CheckoutProcess may be a separate Mongo document **only if its coupled Order transition + pending Outbox are owner-locally atomic**; physical placement is D-05-MONGO's responsibility.

**Payments** exclusively owns PaymentAttempt, ProviderOperation, Payment, Refund, provider account/mode/version-scoped evidence, event deduplication and financial authorization/exclusion. Payments cannot write Order's private Mongo documents. It can be unavailable while Order remains a real paid obligation.

## 2. Minimal owner-local command/evidence contract (not a universal FSM)

| Command | Owner | Preconditions | Durable local result | Unknown/replay treatment |
|---|---|---|---|---|
| `AcceptQuote/PlaceOrder` | Ordering | Quote immutable, store/actor authorized, amount/Money/Offer policy valid, request digest unique | Order + CheckoutProcess + mandatory Outbox/operation receipt atomically | Reread receipt; never make a new Order for replayed intent |
| `RequestStockProtection` | Ordering → Inventory | Order accepted, no contradictory commercial resolution, generation current | Durable pending Inventory command, not reserved-fact authority | Preserve pending work; Inventory duplicate is idempotent |
| `RecordReservationResult` | Ordering | Verify tenant/store/order/generation/owner version, Inbox event ID | Inbox + incorporated Inventory evidence + next Outbox locally atomic | Ignore duplicate, quarantine mismatched version/tenant |
| `AdmitPaymentAttempt` | Ordering → Payments | protected Inventory evidence; no incompatible cancellation; Payments independently checks financial admission | Pending possible-send work and correlated attempt reference | Payments may return UNKNOWN; do not claim Order unpaid |
| `IncorporateCapturedFunds` | Ordering | Payments account-scoped captured evidence and amount/currency/Order snapshot checks | Inbox + Order owed-paid semantics + CheckoutProcess next work + Outbox atomic | Late capture after cancel keeps financial fact and obligation, opens incident/resolution |
| `CommitInventory` | Ordering → Inventory | verified captured funds incorporated and no incompatible commercial branch | Durable pending command, followed by authoritative Inventory commit reference | Unknown response readback, no invented allocation proof |
| `PrepareFulfillment` | Ordering → Fulfillment | Inventory commitment, all lines eligible, no refund branch already authorized | Durable pending preparation; incorporate prepared set only after evidence | No key reveal until entire prepared set and authorized delivery |
| `AuthorizeDisclosure` | Ordering | exclusive resolution permit and consistent potentially exposed evidence; actor auth | Commercial grant operation/policy reference | Fulfillment persists possible disclosure before network response |
| `AuthorizeRefund` | Ordering | paid commercial obligation; delivery not already irreversible or unresolved; no incompatible pending effect | Single authorized refund permit and durable pending Payments request | Refund UNKNOWN not compensation; never issue incompatible disclosure |
| `RequestCancel` | Ordering | trusted buyer/guest or operator authorization, current Order generation | Monotonic intent to close new payments, durable command to Payments | Closing new admissions does not revoke old Stripe HTTP POST |
| `ResolveIncident` | Ordering + authorized ops | scope/actor validation, stable evidence set and policy | Audited commercial decision without losing original money/disclosure history | Unresolved external negative proof remains HOLD/INVESTIGATE |

These signatures and candidate statuses are **local command contracts**; they do not require each action to be a synchronous API call or every intermediate step to be exposed to the UI.

## 3. Order commercial invariants

1. Every captured fund against this commercial intent must correspond to an existing `Order` or be recorded in a **separately investigated orphan** if a provider violates admitted lineage. Never create an invented successful Order to hide an orphan charge.
2. Order's accepted Quote amount, currency, tax version and StorePolicy snapshot are immutable. Amount/account mismatch blocks automatic PAID incorporation and escalates; do not ignore the captured fact.
3. `Order.PENDING_PAYMENT` means financial confirmation has **not been incorporated in Ordering**. It does **not** mean no charge exists at Payments/Stripe.
4. `Order.PAID_AWAITING_ALLOCATION` denotes a real outstanding delivery/compensation obligation, even when CheckoutProcess is stuck. Buyer status can be "payment being verified"; no false negative.
5. Both delivery and eligible non-delivery refund are mutually constrained by **durable irrevocable effect authorization**, not a stale read of CheckoutProcess alone. Once secret may have been exposed, automatic refund for "never delivered" is forbidden; separate discretionary refund rules may exist later.
6. A provider captured fact is immutable history. Later dispute/refund changes net financial position but not the historic captured fact; never regress `PAID` into `never paid`.
7. Customer retry, duplicate webhook and reordering cannot create a second commercial obligation or dismiss a previously confirmed captured amount; use owner-local Inbox unique event identity + semantic fact ID.
8. If separate Order + CheckoutProcess documents are used, **same Ordering-owner Mongo transaction** must persist the Order decision, coordinator incorporation and mandatory Outbox (D-05-MONGO); never assume two separate documents are automatically atomic.

## 4. Suggested local state axes (DO NOT claim approved global FSM)

| Axis | Example explanatory states | Authoritative owner | What changes state |
|---|---|---|---|
| Commercial obligation | `PENDING_PAYMENT`, `PAID_AWAITING_ALLOCATION`, `RESOLUTION_REQUIRED`, `RESOLVED_DELIVERED`, `RESOLVED_COMPENSATED` | Order / Ordering | Accepted owner-local commercial command with verified evidence |
| Saga activity | `WAITING_INVENTORY`, `PENDING_PAYMENT_OPERATION`, `AWAITING_PAYMENTS_FACT`, `AWAITING_FULFILLMENT`, `INCIDENT_HOLD` | CheckoutProcess / Ordering | Atomic incorporation and pending durable operation records |
| Financial evidence | `ATTEMPT_ADMITTED`, `PROVIDER_UNKNOWN`, `CAPTURE_CONFIRMED`, `REFUND_PENDING/CONFIRMED` | Payments | Provider-validated facts and financial operations |
| Capacity | `RESERVED`, `PAYMENT_PROTECTED`, `COMMITTED`, `RELEASED` | Inventory | Guarded Reservation capacity commands |
| Exposure | `PREPARED`, `POSSIBLE_DISCLOSURE`, `DISCLOSED_EVIDENCED` | Fulfillment | Durable key assignment/exposure evidence |

These are **illustrative vocabulary** only: no extra aggregate, no claim that every row is a legal transition, and no transitive equation between different owners. Before final FSM ratification enumerate exact Order states and command transition guards from the accepted original policies and all unusual cases; no state transition can be legalized merely by its name.

## 5. Race and recovery truth table

| Observation | Must persist | May do | Must NOT do |
|---|---|---|---|
| Provider operation timed out, session ID unknown | Payments possible-send, account/version/immutable request, protected Reservation | reconcile, investigate and retain hold | mark Order unpaid/cancelled terminal, release stock or create successor Session |
| Payments confirms captured funds but Ordering offline | Payments captured fact + Payments Outbox + original Order lineage | later Inbox incorporation and commercial continuation | lose obligation, recreate Order or expose key on stale projection |
| Ordering accepts payment event twice / loses ACK | Ordering Inbox receipt, incorporated fact, next durable Outbox | idempotent replay and continue | double allocate or double refund |
| Refund sent, HTTP result unknown | Payments Refund operation pending/unknown, exclusive commercial branch | recover provider status by ID/evidence | issue new unrelated refund or authorize conflicting disclosure |
| License may have been exposed and response lost | Fulfillment immutable possible exposure, Order commercial resolution permission | investigate/recover evidence, authorized discretionary refund separately | return license to stock or auto refund as undisclosed |
| Cancellation accepted while stale financial worker paused | Ordering closure intent + Payments possible-send ledger + protected Inventory | refuse new attempt, reconcile original send, retain hold | infer a completed close from lease expiry |
| Read model says "unpaid" while Payments charged | read projection source version/freshness and owner evidence | show "verification in progress" and reconcile | use projection to authorize another payment or release stock |

## 6. Contracts for later service extraction

Preserve owner-specific operation identities, immutable event schema versions, expected aggregate versions, at-least-once Inbox/Outbox semantics and refusal of private cross-context writes. When Payments becomes a service, its capture event must remain **owned by Payments**, while Ordering incorporates it in its own atomic boundary. A new transport (Kafka in M05) is not a replacement for durable local transactions.

## 7. Documentary and eventual empirical acceptance

- Review this candidate against all accepted C-01..C-08 and D-01..D-07 exact clauses; trace every projected state to the owner and commercial evidence.
- Explicitly decide whether Order/CheckoutProcess are physically one bounded aggregate or separate Ordering documents with a transaction; both must preserve atomic owner decision/incorporation/Outbox.
- Formal ratification of `AUD-P1-02-FSM-MIN` and specific Order command transitions remains **PENDING**; this document is detailed starting material, not an automatic user approval.
- Run AUD12-T01..T12 plus capture/out-of-order/unknown-commit/refund tests in controlled environments later. A documentation merge does not mean these tests passed.
- **Issue #6/SER-123 remains OPEN/In Review** until user exact-scope acceptance and relevant recovery proof. No G4 and no implementation code here.
