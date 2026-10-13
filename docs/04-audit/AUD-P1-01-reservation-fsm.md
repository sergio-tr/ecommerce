# AUD-P1-01 — Reservation FSM and StockPool/Reservation atomicity

**Finding:** P1 / OPEN. **Accepted policy:** AUD-P1-01-FSM-POLICY ACCEPTED (alternative B, 12 principles and C-01..C-06). **Still proposed:** D-01-SM PROPOSED — SELECTED. **Evidence:** AUD11-T01..T12 TEST_PLANNED. Source: original AUD-P1-01 individual review and later explicit user ratification.

## The R1-to-candidate incompatibility

The original M00.1-R1 proposal used INITIAL_HELD → PAYMENT_HELD → SETTLEMENT_HELD → RELEASE_REVIEW → COMMITTED / RELEASED. Later D-01-SM proposed capacity-only RESERVED → PAYMENT_PROTECTED → COMMITTED / RELEASED. The accepted review prefers the latter as a **candidate**, but does not delete or deny the business conditions once named SETTLEMENT_HELD or RELEASE_REVIEW. Payments is authoritative for unsettled/unknown money; CheckoutProcess is authoritative for pending investigation and release work; Inventory is authoritative only for capacity.

## Candidate state meanings

| Candidate | Capacity-specific semantics | Forbidden inference |
|---|---|---|
| RESERVED | Temporary commercial capacity held before financial protection is enabled | Does not authorize Stripe by itself |
| PAYMENT_PROTECTED | Capacity must not be made available while a financial operation can collect or is unknown | Does not assert a particular Stripe Session/PaymentIntent state |
| COMMITTED | Capacity permanently associated with a legitimate paid Order | Does not mean a particular DigitalLicense has been allocated or disclosed |
| RELEASED | A reservation has safely ceased consuming available capacity | Cannot be reopened by delayed PaymentAttempt or old version |

This is not the final state machine. Physical transition tables and persistence remain to be specified and ratified.

## Additional user conditions

**C-01 — Durable protection before financial effect.** Inventory must durably confirm the PAYMENT_PROTECTED condition before Payments enables a collectible Stripe operation. A late asynchronous event confirming protection is insufficient. If the Inventory reply is lost, the caller must reconcile the actual transition; no answer is not success. Linked AUD-P0-01-DISPATCH-NEUTRALIZATION remains blocking.

**C-02 — Deadline versus safe release.** Fifteen minutes makes an ordinary RESERVED hold eligible for expiry evaluation but does not itself free stock. RESERVED expiry must compete atomically with financial protection. PAYMENT_PROTECTED cannot expire just because its initial TTL ended. Finishing an attempt or starting a successor does not automatically renew its initial TTL. Release requires all accepted finance-evidence guards.

**C-03 — Identity and version binding.** Commands must carry trusted tenant/store/StockPool/Reservation scope, Order/CheckoutProcess/commercial generation, relevant authorizing operation and version, idempotency key and evidence. An authorization for a previous reservation incarnation or commercial generation must not mutate a newly legitimate commitment. Versioning alone is not evidence against external old Stripe effects.

**C-04 — Stock conservation beyond the per-Reservation FSM.** The aggregate model must prevent double booking or negative balances when two buyers race for the final unit. M00.2 must analyze StockPool and Reservation single-aggregate versus separate aggregate boundaries, shared pools, protected quotas, multi-line operations, crash/unknown Mongo outcomes, and no double counting of reserved versus committed units. A correct per-reservation FSM is not sufficient proof of pool integrity.

**C-05 — Commitment is not key delivery.** COMMITTED is Inventory capacity ownership, not Fulfillment assignment or disclosure. Refunding a fulfilled order never automatically restores capacity or makes a potentially exposed license reusable. Legitimate post-commit capacity correction is a distinct explicit, auditable operation; do not reopen terminal reservation states.

**C-06 — Unknown payments and observable recovery.** Inventory need not model each Stripe uncertainty as a new state. Protected Reservation must remain traceable to durable Payments/CheckoutProcess operations and to an investigator. Long holds raise escalation; no default release if Payments cannot be queried. The rule must survive later Inventory service extraction with no Stripe-specific domain fields.

## Alternatives

- A — Keep R1's extended financially named reservation states: rejected as the preferred direction because it duplicates provider facts and creates stale authority.
- B — Four capacity-specific states: accepted **design direction only**.
- C — HELD + isFinanciallyProtected boolean: adds invalid-state combinations without clear value.
- D — Keep protection entirely in Payments and have Inventory release after querying it: unsafe TOCTOU and violates Inventory authority.

## Demonstration obligations

Two buyers race for the last StockPool unit; the same RESERVED hold receives expiry and ProtectReservation concurrently; a worker resumes after ReleaseReservation; a second attempt begins without resetting TTL; Payment becomes confirmed while Inventory is temporarily unavailable; two multi-line checkouts compete; refund is confirmed after COMMITTED. The candidate must reject stale commands and maintain conservation after restarts and physical persistence failures.

**No final schema, guards, transaction strategy or capacity conservation formula is ratified.** M00.2 and D-05-MONGO are responsible for resolving their physical aspects; AUD-P0-01 still governs external finance safety.

**Trace:** AUD-P1-01 → [GitHub #5](https://github.com/sergio-tr/ecommerce/issues/5) → Linear SER-122 → future contracts → AUD11-T01..T12 (TEST_PLANNED).
