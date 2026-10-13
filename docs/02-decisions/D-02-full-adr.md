# D-02 — Configurable Stripe Checkout Session expiration

**Decision:** ACCEPTED (policy only; with expressly recorded qualifications). **Evidence:** TEST_PLANNED, except D-01 is also SPECIFIED at policy level; no experiment VERIFIED. **Primary source:** Texto pegado (4)(20261013-170131).txt (original individual proposal). **Authority:** later explicit user ratification governs; the original proposal's initial PENDING heading is historical and must not be interpreted as today's status.

## Ratified policy and safety conditions

1. CommerceCore controls Checkout Session lifetime through a policy configurable/versioned for the effective store and provider scope.
2. Payments must record the actual Stripe expires_at returned for each commercial PaymentAttempt, not just a locally intended deadline.
3. Expiry controls the hosted checkout opportunity but is not an authoritative statement that every associated payment operation is financially negative.
4. Backend clocks, request latency, Stripe validity bounds and retries need validation against the actual effective API version.
5. Do not silently use an uncontrolled Stripe default duration when the configured request fails or is omitted.
6. Changes to policy must not silently reinterpret already authorized Checkout Sessions or Order economic terms.
7. Automatic Stripe recovery of expired Sessions remains disabled in the initial policy, including any successor-session capabilities unless explicitly authorized.
8. Inventory protected capacity is preserved across Session expiration until the full financial and dispatch exposure is safely closed.
9. A default of 35 minutes is a reasonable candidate for testing but is not proven optimal or yet ratified as a numeric policy.
10. Measure checkout abandonment, conversion, late payment and inventory retention before locking in the value.

## Alternatives retained in the ADR

- A — 30-minute session: provider-documented minimum candidate; tighter stock retention but fragile exact-lower-bound timestamp handling.
- B — 35-minute configurable session: selected *candidate* D-02-P01, PROPOSED — SELECTED.
- C — 45 minutes and D — 60 minutes: may improve convenience but extend scarce stock occupancy without current evidence.
- E — provider default 24 hours: unfavorable for eGame scarce licenses as an uncontrolled initial policy.

## Consequences and trade-offs

Safety requires durable states, context-specific authority, bounded commercial flexibility and explicit investigation of external/unknown effects. Business throughput can be reduced when Stripe fails or evidence is ambiguous. That is deliberate: preserving financial/inventory correctness takes precedence over falsely declaring completion. No alternative or numbered clause above selects a Mongo schema, physical worker algorithm, standalone microservice, provider API version or globally atomic workflow.

## Scoped unresolved decisions and dependencies

- D-02-P01 PROPOSED — SELECTED (35 minutes).
- AUD-P0-01-DISPATCH-PROVIDER-WINDOW PENDING: absolute immutable expiry is only an anti-late-post hypothesis.
- D-06 retry and D-07 cancellation windows are distinct, and actual provider restrictions require experiments.

## Future verification

- Relevant planned tests: AUD-P2-02 and provider validity experiments; D07-T01..14.
- Do not treat simulator success as proof of Stripe-internal behavior.
- Verify authoritative business facts, provider objects where applicable, isolation boundaries and lack of duplicated financial/fulfillment effects.
- Required status: TEST_PLANNED. No VERIFIED evidence exists.

## Source and change governance

The original source contains more discussion, interleavings and alternative rationale than this ratification-focused record. Preserve that source in custody and consult it for any fine-grained implementation specification. Later changes require scoped ratification and an English feature/bugfix branch + PR owned by @sergio-tr.
