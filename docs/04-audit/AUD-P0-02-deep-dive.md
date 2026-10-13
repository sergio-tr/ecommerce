# AUD-P0-02 — Recovering unknown Stripe operations without a Session ID

**Audit severity:** P0. **Current finding:** OPEN / BLOCKING. **Evidence:** TEST_PLANNED, not VERIFIED. **Sources:** Texto pegado (13).txt + explicit user ratification including C-01..C-06. This document records the ratified *direction* and its unresolved proof boundary; it does not close the finding or approve a physical algorithm.

## Ratified policy and exact child-state boundaries

- AUD-P0-02-RECOVERY-POLICY: ACCEPTED (alternative D, 13 principles + six additional conditions)
- AUD-P0-02-PROTOCOL: PROPOSED — SELECTED
- AUD-P0-02-PROVIDER-PROOF: PENDING / BLOCKING
- AUD-P0-02-OPS: PENDING

## Minimal eGame failure scenario

Stripe receives a create-Checkout-Session POST but the response disappears. Payments still knows eGame Order, amount/currency, Stripe account/environment, immutable request, idempotency key and time, but not the Session ID. Buyer requests cancellation. Retrying a POST could create the Session for the first time, or another Session after Stripe prunes the key.

## Architectural alternatives and rejection rationale

- A — Trust Stripe idempotency alone: rejected; a POST retry is not a read and retention/errors are bounded.
- B — Rely on webhook delivery alone: rejected; no webhook is not evidence of no Session; delayed/out-of-order delivery is expected.
- C — Search by reference or metadata alone: insufficient because reference is not a provider-enforced unique key and search may be eventually consistent.
- D — Multi-layer recovery with positive-evidence closure, durable correlation and provider-aware safeguards: ACCEPTED policy; universal safe closure still not proved.
- E — Release after timeout or negative search: incompatible with D-01 and accepted dispatch safety policy.

## Accepted constraints and safeguards (source-derived summary)

1. Persist tenant/store/Order/checkout/generation, Reservation identity/version, Payment/Attempt/externalOperationId, exact immutable request fingerprint, amount/currency, provider account, test/live, API version, idempotency key and time before enabling execution.
2. Use opaque stable internal IDs in client_reference_id, Checkout Session metadata and, when actually configured, PaymentIntent metadata; do not assume automatic metadata propagation.
3. Metadata and client_reference_id are correlation, never external uniqueness guarantees, buyer authorization, or independent proof of no object.
4. Use known-ID retrieve operations first; otherwise page over permitted Session listings within the correct account/time range and examine candidates, cross-check against webhook Inbox/Events and PaymentIntent where available.
5. Do not imply Stripe offers exact Session lookup by client_reference_id or by idempotency key unless that API is explicitly verified.
6. Recognize that Stripe idempotency may save an original 500 response and may remove keys after its documented retention; replay might create a Session if no prior execution occurred.
7. Do not perform a recovery POST after cancellation or close unless the current financial authority reauthorizes its potentially collectible effect.
8. Separate three goals: finding an external object; resolving the object's financial result; proving the original enabled dispatch cannot create further external effects.
9. Do not release from a negative eventually consistent search, lack of webhook, exhausted retry budget, session timeout or absence of PaymentIntent.
10. If multiple external candidates match a reference, investigate *all* of them and do not duplicate commercial obligations or authorization effects.
11. Every transition from UNKNOWN to terminal result specifies positive evidence source, authority, versions, durable/idempotent application and handling of contradictory later evidence.
12. Maintain strict tenant/store/account/environment/snapshot matching; preserve financial evidence even if Order cannot immediately be resolved.
13. Review Stripe after_expiration.recovery and all Session-successor paths; they must not bypass CommerceCore admission or invent compatible successors silently.
14. Absolute immutable expires_at can be experimented with but does not become a guarantee of nonexistence or future dispatch neutralization.
15. When Stripe is unavailable or evidence is insufficient, preserve protected inventory and the financial case with investigation ownership and escalation rather than fabricate progress.

## Execution exposure categories (not an approved domain FSM)

- Identity prepared and enabled without Session ID — still a potential payable Session.
- Same idempotency key reused while live — the provider may return original response, create for first time, or return persisted error; observe actual behavior.
- Key no longer retained — treating identical POST as idempotent forever is unsafe.
- Provider object positively found — verify owner/account/mode/amount/currency and financial status; then evaluate every other candidate.
- Provider search empty — does not generally prove provider nonexistence or no future old POST.
- All effects proven terminal and dispatch quiescent — possible safe close, but the provider proof boundary is pending.

## Concurrent and crash interleavings

- I-01: POST processed by Stripe, HTTP response lost; worker restarts — query/reconcile rather than open another paid Session.
- I-02: First POST never reached Stripe; retry would create new Session after cancellation — reject unauthorized replay.
- I-03: Webhook arrives after a negative PaymentIntent search — preserve later positive fact, no unsafe release.
- I-04: Two candidate Sessions share metadata — resolve both and escalate incompatible multiplicity.
- I-05: Original known Session expired, worker with old dispatch authorization resumes — AUD-P0-01 still blocks release.
- I-06: Stripe outage lasts beyond key-retention window — maintain unknown and inventory protection, not a new POST.

## What evidence is necessary and what remains unproved

- Positive Stripe Session or PaymentIntent retrieved with exact account/mode/commercial correlation.
- Provider-documented semantics verified against the effective API version; note list vs search consistency/retention.
- Stripe test-mode chaos trials and object counts for lost replies, idempotency replay, multiple candidates and old dispatch.
- No general provider-backed nonexistence proof has yet been demonstrated; preserve blocking state.

## Future verification and acceptance

**Planned tests:** AUD02-T01–T16. All are TEST_PLANNED; none executed. A passing local mock or database-only transaction test does not demonstrate Stripe provider behavior or universal control of external effects. Test claims require observed provider objects, durable business state, monotonic authorization, cross-tenant isolation, duplicate operation counts and post-restart investigation.

**Dependencies:** AUD-P0-01-DISPATCH-NEUTRALIZATION, D-02, D-05, D-06, D-07, Stripe provider capabilities, future operational runbook.

**Documentary closure criterion:** user-ratified command contracts, guarded transitions, local atomicity semantics, precise proof/neutralization conditions, durable escalation and no contradictory remaining P0 behavior. Do not introduce services, aggregates or infrastructure without demonstrated need and separate approval.

**Tracking:** GitHub #2, Linear SER-119. Owner: @sergio-tr. Future changes through independent English feature/bugfix branches and conventional commits.
