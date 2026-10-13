# D-07 — Explicit cancellation and early Stripe expiration

**Decision:** ACCEPTED (policy only; with expressly recorded qualifications). **Evidence:** TEST_PLANNED, except D-01 is also SPECIFIED at policy level; no experiment VERIFIED. **Primary source:** Texto pegado (9)(1).txt (original individual proposal). **Authority:** later explicit user ratification governs; the original proposal's initial PENDING heading is historical and must not be interpreted as today's status.

## Ratified policy and safety conditions

1. Recognize a commercially explicit, authenticated/authorized buyer or operator RequestCancellation; persist it durably.
2. Distinguish cancellation requested, closure of the external collectible opportunity, actual financial outcome and commercial checkout closure.
3. Closing a tab, browser abandon, cancel_url navigation and URL possession are not explicit commercial cancellation commands.
4. Payments requests early expiry of an open Stripe Checkout Session when the effective Stripe API allows that operation; the external HTTP request is outside any Mongo transaction with durable intent/result.
5. A Session already complete or associated with unknown/processing/succeeded financial outcome requires reconciliation instead of an unavailable or fictitious cancellation.
6. Timeout, failed API response, Session-expired event and natural expiry alone do not authorize releasing Inventory, because another POST may still create an opportunity.
7. Cancellation must bar incompatible new admission and resolve in-flight Session creation, successor attempts and late workers under AUD-P0-01.
8. The permanent release decision needs resolved prior operations, correct identity and version; only Inventory applies the capacity transition.
9. Once closure is sufficiently evidenced, do not keep stock artificially held until the originally expected Session timeout.
10. An already confirmed or concurrently confirmed charge is preserved in Payments and the Ordering obligation; buyer remorse refund is not approved here.
11. Guest authorization, actor-resource ownership proof, tenant/store matching and protection against forged client ID remain mandatory.
12. Invalid/stale/duplicate commands, crashes, out-of-order webhooks and account mismatch must not create second charge opportunities or duplicate releases.
13. Operator delays trigger reconciliation and escalation, not automatic fail-open.
14. No new cancellation service, aggregate or workflow engine is implied.
15. Stripe automatic recovery of expired Sessions stays disabled initially as agreed in D-02.

## Alternatives retained in the ADR

- A — Wait for natural expiry: safe only with complete reconciliation, but retains capacity unnecessarily.
- B — Explicit authorized cancellation, early expiration when possible, and complete reconciliation: ACCEPTED.
- C — Immediately mark canceled and release locally: rejected because Stripe could still charge.
- D — Infer commercial cancellation from browser/tab/cancel_url: rejected because navigation is ambiguous and not an authorization.

## Consequences and trade-offs

Safety requires durable states, context-specific authority, bounded commercial flexibility and explicit investigation of external/unknown effects. Business throughput can be reduced when Stripe fails or evidence is ambiguous. That is deliberate: preserving financial/inventory correctness takes precedence over falsely declaring completion. No alternative or numbered clause above selects a Mongo schema, physical worker algorithm, standalone microservice, provider API version or globally atomic workflow.

## Scoped unresolved decisions and dependencies

- D-07-EXCL ACCEPTED.
- D-07-SM PROPOSED — SELECTED.
- D-07-CONCURRENCY, D-07-AUTH (M00.3) and D-07-OPS PENDING.
- AUD-P0-01 and AUD-P0-02 remain blocking.

## Future verification

- Relevant planned tests: D07-T01..T14.
- Do not treat simulator success as proof of Stripe-internal behavior.
- Verify authoritative business facts, provider objects where applicable, isolation boundaries and lack of duplicated financial/fulfillment effects.
- Required status: TEST_PLANNED. No VERIFIED evidence exists.

## Source and change governance

The original source contains more discussion, interleavings and alternative rationale than this ratification-focused record. Preserve that source in custody and consult it for any fine-grained implementation specification. Later changes require scoped ratification and an English feature/bugfix branch + PR owned by @sergio-tr.
