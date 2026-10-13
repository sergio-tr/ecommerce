# AUD-P1-03 — Commercial Retry Windows and Safe Stock Retention

**Finding:** P1 / OPEN. **Decision:** NOT RATIFIED. The individual review recommended alternative D, but Sergio has not approved it. Any status text that says 'ACCEPTED' here would be a documentary error. Values, physical algorithm and operational escalations are PENDING. **Evidence:** AUD13-T01..T16 TEST_PLANNED as candidate experiments.

## Distinct clocks

T1 — Inventory initial reservation TTL, typically fifteen minutes, defines eligibility for initial checkout entry.

T2 — Stripe Checkout Session expires_at reflects the provider's actual hosted session acceptance window. D-02-P01's 35 minutes is a candidate, not a settled value.

T3 — Commercial re-attempt request window would determine whether the buyer may request another opportunity after the previous attempt has been safely closed negative.

T4 — Financial investigation/escalation deadlines instruct operators to investigate unknown outcomes but do not create negative provider proof.

T5 — Candidate global commercial admission deadline would limit total time for *new* sessions over one commercial generation; it would not end already enabled Stripe Sessions or guarantee stock release.

## eGame business tension

A buyer reserves the final license and opens Stripe. The first Session expires without payment and Payments obtains sufficient financial and operational negative evidence. Another buyer needs the same last key. If there is no bounded retry-request window, the first buyer can hold legitimate capacity after there is no current financial exposure simply by postponing a decision. If a fixed timeout releases blindly, the buyer might still be completing an old payment.

## Alternatives (none ratified for the commercial window)

- A — No retry window: simpler but permits unbounded commercial inactivity/stock hoarding.
- B — One absolute deadline: bounds new admissions but may penalize legitimate recovery from failed payment and cannot be the financial release deadline.
- C — Relative window following verified negative closure: fairer to a buyer but may extend across repeated commercial opportunities without a global cap.
- D — Combine relative and global *admission* windows, preserve provider exposure separately: recommended proposal, **not an accepted policy**.

## Candidate guards

Only when Ordering confirms the accepted snapshot/Order remain commercially eligible, Payments has safely closed all preceding opportunities negative, Inventory still protects the original reservation, no cancellation/refund barriers conflict, versioned policy deadlines are met, and D-06's approved-but-not-numeric attempt limit is respected, would another commercial PaymentAttempt be admitted. A deadline is not sufficient by itself; a pause can occur between checking it and enabling external Stripe HTTP.

Candidate admission cutoff is the earlier of 'last accredited negative closure + relative window' and 'initial commercial anchor + global window'. This formula has **not** been ratified as a contract, parameter value or policy.

When a request window ends, Ordering would initiate financial closing, Payments would reconcile previous enabled/unknown operations and seal further admissions, and Inventory would release only when its actual release authorization is durably available. No direct transition from WindowExpired to Reservation.RELEASED is safe.

## Concurrency and progress

- A new-attempt authorization races with the end of the commercial window; durable conditional authority must choose the winner, without forgetting already enabled external effects.
- A Session can remain open when the global admission cutoff passes; stock stays protected. An automatic early Stripe expire on this basis is **not** implicitly approved under D-07.
- Payments or Stripe may be unavailable for hours; operations remain UNKNOWN and inventory protected with escalation, regardless of all commercial deadlines passing.
- An old browser may display a still-valid timer after Inventory has legitimately released capacity; local presentation does not resurrect the reservation.
- Anti-hoarding across separate checkouts must not forbid legitimate second purchases; D-06-INTENT remains PENDING.
- Store policy versions must be tied to the checkout; changes must not retroactively mutate previously authorized provider requests.

## Pending scoped decisions and documentary conditions

AUD-P1-03-WINDOW-POLICY: previously described as proposed/not ratified; no ACCEPTED approval.
AUD-P1-03-SAFE-RETENTION: safety condition supported by D-01, but double-window policy not independently ratified.
AUD-P1-03-WINDOW-VALUES: PENDING.
AUD-P1-03-PROTOCOL: candidate only, not approved.
AUD-P1-03-OPS: PENDING.
AUD-P1-03 overall: OPEN.

**Trace:** AUD-P1-03 → [GitHub #7](https://github.com/sergio-tr/ecommerce/issues/7) → Linear SER-124 → D-06-RETRY-WINDOW → AUD13-T01..T16 (TEST_PLANNED).

**Next required action:** Present alternative D and its proposed 15 policy principles for explicit user ratification before changing any status or proceeding to AUD-P1-04.
