# AUD-P1-03 — Decision-Ready Review of Commercial Retry Windows

**Original finding:** AUD-P1-03 `OPEN / NOT RATIFIED`. **Policy:** `AUD-P1-03-WINDOW-POLICY` `PROPOSED — NOT RATIFIED`; `AUD-P1-03-SAFE-RETENTION` `PROPOSED — NOT RATIFIED`; `AUD-P1-03-PROTOCOL` `PROPOSED — NOT RATIFIED`; `AUD-P1-03-WINDOW-VALUES` and `AUD-P1-03-OPS` `PENDING`. **No status change is implied by this document.**

**Primary source:** original `Texto pegado (18).txt` SHA-256 `40e4d7c954dd3a6b9b3e31cc67f99cc17623affff4bd182b4a362befc92a18ad`, inspected locally and matched to the source manifest; sections 3–13 contain the original review, 12 invariants, five interleavings and `AUD13-T01..T16` test table. English content below is a paraphrased review, not an assertion of prior approval. Existing GitHub #7 ↔ Linear SER-124 reused; no new issue.

## A. Precise problem and financial/security boundaries

A buyer reserves the last license, starts a hosted Stripe session, and the first commercial PaymentAttempt later closes safely negative. The buyer could postpone requesting a successor indefinitely while Inventory retains the last unit and another buyer is waiting. A simple timeout-based release would be equally unsafe if an older, unknown or still-open Stripe operation could charge later.

- D-01's **initial 15-minute Reservation TTL** is an initial checkout entry deadline, not proof that a potential provider charge is impossible.
- D-02's **actual hosted Stripe Session expires_at** is provider-object validity. D-02-P01 **35-minute candidate is unratified**.
- D-06's **commercial Attempt limit** is accepted in principle; the proposed maximum **two Sessions D-06-P01 is unratified**.
- The proposed relative retry-request window and global admission deadline **only regulate new commercial opportunities**.
- Investigation/escalation deadlines are operational alerts. None of the clocks is negative provider proof.

**Owner split:** Ordering owns whether the existing accepted Order/Quote is commercially eligible for a successor. Payments owns admission/fencing, actual financial facts and safe negative closure. Inventory owns protection and conditional release. CheckoutProcess holds durable coordination checkpoints. No new aggregate is prescribed.

## B. Viable alternatives, corrections and rejected trade-offs

| Choice | Admission policy | Benefit | Correctness/progress tradeoff | Recommendation |
|---|---|---|---|---|
| A | No commercial retry-request window after safe negative closure | Easy to explain, flexible buyers | May hold scarce stock through arbitrary inactivity without financial exposure | Reject for scarce keys unless a separate fair close rule is defined |
| B | One absolute commercial deadline | Clear bounded admission horizon | Does not distinguish late legitimate failed charge from abandoned checkout; must not terminate open Session | Viable simple fallback |
| C | Relative window starts only after proved negative closure | Fair recovery after a genuine failed payment | Without global cap, buyer can extend capacity hold across several allowed attempts | Viable when attempt count/total horizon is sufficiently bounded |
| D | Relative post-negative + absolute global new-admission cutoff (proposed) | Limits stock-hoarding and preserves buyer recovery | Two configuration values, versioned anchor, concurrency with admission, depends on AUD-P0-01/02; no absolute protected-stock release bound | Preferred conceptual policy; **not ratified** |

No alternative can safely release Inventory without AUD-P0-01/02 provider-side closure evidence. The chosen commercial clock policy must never be implemented as an Inventory TTL update.

## C. Candidate protocol (requires ratification, not physical specification)

1. For each checkout/generation, persist immutable accepted snapshot, initial Reservation identity, effective commercial retry-policy version, and commercial time anchor **whose exact definition remains PENDING**.
2. Ordering may consider a successor *only* when the preceding PaymentAttempt is independently proven terminal negative (including its enabled Stripe dispatch and possible provider side effects), the accepted Order remains commercially eligible, no cancellation/refund/closing barrier excludes it, and original protected Inventory Reservation is still valid.
3. If option D is selected, the candidate **request admission condition** is `request_time < min(negative_closure_recorded_at + relative_window, commercial_anchor + absolute_window)`. This expression is a business deadline proposal; event/retry-time clock rules and original anchor are unratified.
4. Payments then performs a **durable conditional admission decision**, reconciling concurrent cancellation/closure, generation/version and previous potentially collectible Attempts. A successful preliminary time check is not a safe Stripe dispatch permission; AUD-P0-01-DISPATCH-NEUTRALIZATION remains open.
5. If the buyer misses the commercial cutoff, Ordering initiates closure of **future new-attempt admissions**, recording mandatory continuation. Payments reconciles any enabled or UNKNOWN external operations. Inventory changes only after authoritative financially safe release authorization.
6. A Stripe Session that remains open when global admission ends stays protected. The deadline does not automatically call Stripe expire, invalidate earlier payments or assert cancelled/refunded status. D-07 early expiry still requires its previously approved commercial and provider guards.
7. If Stripe or Payments cannot confirm negative outcome, the checkout/Reservation remains protected and the incident escalates. A pause/lease/timeout is not evidence. An independently initiated **new** legitimate purchase follows separate identity/idempotency policy D-06-INTENT (PENDING).

## D. Original safety invariants (source-derived; not newly ratified as double-window policy)

| ID | Preserved expected invariant |
|---|---|
| AUD13-I01 | Commercial expiration never proves no payment |
| AUD13-I02 | A collectible known Session retains D-01 protection even after admissions cease |
| AUD13-I03 | New commercial Attempts require all valid financial, commercial and deadline guards |
| AUD13-I04 | Window expiration does not revoke previously enabled HTTP dispatch |
| AUD13-I05 | Release requires conclusive financial closure and authorized Inventory transition |
| AUD13-I06 | Subsequent attempts do not restart Inventory's initial 15-minute TTL |
| AUD13-I07 | Confirmed paid fact remains valid after admission deadline expires |
| AUD13-I08 | Admission deadline is not a maximum physical protected-stock hold |
| AUD13-I09 | Effective policy/version cannot be retroactively reinterpreted |
| AUD13-I10 | Stuck protected cases are observable, recoverable and assigned to escalation |
| AUD13-I11 | A separate legitimate purchase is not automatically an old attempt |
| AUD13-I12 | Operational timings cannot bypass exclusivity, reconciliation or idempotency |

**Fundamental exclusion:** `AdmissionDeadlineExpired` does **NOT** imply `ReleaseAuthorized`. Safe release, whenever supported, requires actual closure of all collectible external opportunities and irreversible sealing of incompatible new admissions, as reviewed in AUD-P0-01/02.

## E. Concrete concurrency counterexamples

1. **17:00 reserve; 17:10 Stripe; 17:45 example expiry; 17:46 proved negative; 17:48 retry.** The 35-minute provider duration is illustrative, not approved. A retry request at 17:48 needs both time windows (if approved) and independent financial/Inventory guards. Buyer B waiting does not justify releasing A's potentially charged stock.
2. **Admission versus window sealing:** If financial admission commits before the close, the closer must include the new potentially collectible operation. If close commits first, old permission cannot issue Stripe HTTP afterward. A Mongo version check alone does not neutralize a worker suspended before HTTP.
3. **Second Attempt in preparation versus cancellation:** A preceding Session may be negative, but if a cancellation barrier wins before actual dispatch habilitation the new POST must be prohibited; UNKNOWN old dispatch must remain investigated.
4. **Stale browser versus released Reservation:** A visible countdown does not grant a valid capability; stale RequestAttempt is rejected on original Reservation/generation/version.
5. **Late captured payment after global admission expiry:** The capture is a financial fact and Order obligation, not a payment that became invalid due to a clock; any premature capacity release is a P0 incident.
6. **Payments unavailable after window expiration:** Commercial admission closes durably when possible, but protected stock cannot be released based on a missing response; reconciliation and alerting continue.

**Atomicity boundary:** Ordering and Payments each need owned durable conditional records and recoverable messages; no global Mongo-to-Stripe transaction, no automatic network HTTP fencing, no infrastructure mandated by option D alone.

## F. Exact future experiment matrix (original IDs, not executed)

| Test | Scenario | Required observable result |
|---|---|---|
| AUD13-T01 | Previous Session negatively closed; buyer requests inside eligibility window | Admit only with every other financial and commercial guard valid |
| AUD13-T02 | Request after relative deadline | Reject new Session before enabling any collectible operation |
| AUD13-T03 | Relative open but global deadline expired | Reject admission; do not treat this as provider negative evidence |
| AUD13-T04 | Global deadline expires while original Session still open | Protect Inventory while old opportunity remains collectible |
| AUD13-T05 | New Attempt admission races commercial-close operation | Single valid admission or sealed close; no orphan collectible Session |
| AUD13-T06 | Window expires when Payments is unavailable | Persist close request, retain protected stock, escalate |
| AUD13-T07 | Provider proves a charge after admission deadline | Preserve charge and Ordering obligation |
| AUD13-T08 | UNKNOWN operation exceeds every commercial deadline | Never release by time alone; reconcile and escalate |
| AUD13-T09 | Second attempt admitted on same Reservation | No renewed initial TTL or unauthorized second reservation |
| AUD13-T10 | Old browser requests retry after Inventory legitimate release | Reject stale checkout/generation/Reservation access |
| AUD13-T11 | Store retry-window configuration changes during active checkout | Effective version and previously enabled operations remain stable |
| AUD13-T12 | Several checkouts appear linked to one buying intention | Do not create duplicate holds for idempotent retries; do not merge arbitrary purchases |
| AUD13-T13 | Buyer legitimately makes another independent purchase | Do not deny it solely because another checkout existed |
| AUD13-T14 | Deadline passes while Ordering→Payments message is pending | No contradictory close or capacity release |
| AUD13-T15 | Worker restarts after marking deadline expired but before durable admission closure | Resume close and reconcile prior enabled operations |
| AUD13-T16 | Reservation stays protected anomalously long | Detect accountable incident and operational escalation |

These are translated from an independently inspected original audit table and still require final English title/oracle acceptance. All remain `TEST_PLANNED / NOT_RUN`; no Stripe behavior has been experimentally validated by this review. Relevant independent proofs include AUD01-DT, AUD02 provider recovery and AUD04 irreversible external effects.

## G. Decision requested; unapproved details

**Proposed `AUD-P1-03-WINDOW-POLICY`:** choose between A, B, C or D. **Recommendation D** with commercial new-admission limits independent from D-01 financial safe release; preserve all 12 original AUD13-I invariants. A less complex B remains viable for deliberate comparison if user wants a single limit.

Even if D is accepted, keep numeric relative/global durations, chosen anchor, actual clock/skew handling, D-06 two-session candidate, D-02 35-minute candidate, D-06-INTENT, effective Mongo concurrency algorithm, Stripe dispatch neutralization, provider evidence and operational monitoring **PENDING/OPEN as before**. Do not close AUD-P1-03 until contracts, guards, values and evidence obligations are subsequently specified and approved. All four AUD-P0 original findings remain OPEN/BLOCKING.

**Request:** Ratify alternative D as *commercial-window policy direction with these reservations*, choose alternative B/C, or require a further counterexample review. Nothing has been changed in the canonical decision-register.json.
