# D-06 — Sequential commercial payment attempts

**Decision:** ACCEPTED (policy only; with expressly recorded qualifications). **Evidence:** TEST_PLANNED, except D-01 is also SPECIFIED at policy level; no experiment VERIFIED. **Primary source:** Texto pegado (8)(4).txt (original individual proposal). **Authority:** later explicit user ratification governs; the original proposal's initial PENDING heading is historical and must not be interpreted as today's status.

## Ratified policy and safety conditions

1. A PaymentAttempt represents one commercial collectible opportunity hosted by Stripe, not each HTTP retry, failed card correction or 3D Secure step.
2. A failed card inside a still-open Checkout Session must not cause a new Session automatically.
3. At most one potentially collectible opportunity may be authorized at a time per financial obligation, including Session creations whose result is UNKNOWN.
4. Before a successor attempt, prove every relevant former operation financially negative and operationally closed with sufficient evidence; no read-only stale snapshot can grant admission.
5. Payments controls durable conditional admission; Ordering verifies commercial eligibility and stable price/contents; Inventory confirms protected capacity.
6. The accepted Order snapshot and money terms cannot be silently repriced on a second attempt.
7. A released Reservation cannot be revived by reopening a previously paid or expired checkout.
8. Concurrent duplicate clicks, workers and retries must yield one logical commercial attempt under durable idempotency.
9. An old in-flight Stripe POST or successful late payment remains financially relevant even after local cancellation/version change.
10. Request cancellation, release authorization and successor attempt admission must resolve their shared exclusion races with durable barriers.
11. Limit the number and timespan of commercial retries to prevent stock hoarding, but do not use the limit as proof of negative payment.
12. Two Sessions is only the candidate D-06-P01; the exact retry request window and intent correlation across new checkouts remain pending.
13. An incompatible pending refund/unknown outcome cannot trigger automatic re-collection on the same obligation.
14. Same-buyer legitimate new purchases must not be globally prohibited by an overbroad anti-abuse identifier.

## Alternatives retained in the ADR

- A — Exactly one hosted Session per checkout: not selected because recoverable negative outcomes would force unnecessary complete restarts.
- B — Limited sequential Sessions after safe closure: ACCEPTED.
- C — Unlimited sequential Sessions: not selected because scarce inventory could be retained indefinitely.
- D — Simultaneously active Sessions: rejected because one Order could result in two independent real charges.

## Consequences and trade-offs

Safety requires durable states, context-specific authority, bounded commercial flexibility and explicit investigation of external/unknown effects. Business throughput can be reduced when Stripe fails or evidence is ambiguous. That is deliberate: preserving financial/inventory correctness takes precedence over falsely declaring completion. No alternative or numbered clause above selects a Mongo schema, physical worker algorithm, standalone microservice, provider API version or globally atomic workflow.

## Scoped unresolved decisions and dependencies

- D-06-EXCL ACCEPTED.
- D-06-P01 (two Sessions) and D-06-SM PROPOSED — SELECTED.
- D-06-OPS, D-06-RETRY-WINDOW and D-06-INTENT PENDING.
- AUD-P1-03 relative+absolute window candidate has NOT been ratified.
- AUD-P0-01 external dispatcher neutralization remains blocking.

## Future verification

- Relevant planned tests: D06-T01..T14; AUD13-T01..T16 (AUD13 proposal only).
- Do not treat simulator success as proof of Stripe-internal behavior.
- Verify authoritative business facts, provider objects where applicable, isolation boundaries and lack of duplicated financial/fulfillment effects.
- Required status: TEST_PLANNED. No VERIFIED evidence exists.

## Source and change governance

The original source contains more discussion, interleavings and alternative rationale than this ratification-focused record. Preserve that source in custody and consult it for any fine-grained implementation specification. Later changes require scoped ratification and an English feature/bugfix branch + PR owned by @sergio-tr.
