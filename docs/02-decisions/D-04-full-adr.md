# D-04 — Paid obligation, recovery and eventual refund

**Decision:** ACCEPTED (policy only; with expressly recorded qualifications). **Evidence:** TEST_PLANNED, except D-01 is also SPECIFIED at policy level; no experiment VERIFIED. **Primary source:** Texto pegado (6)(20261013-170152).txt (original individual proposal). **Authority:** later explicit user ratification governs; the original proposal's initial PENDING heading is historical and must not be interpreted as today's status.

## Ratified policy and safety conditions

1. A confirmed collected payment establishes a durable commercial obligation linked to a preexisting Order, not permission to ignore an unavailable license.
2. An Inventory timeout or lost CommitReservation response is unknown, not proven failure; reconcile the original commitment before substituting stock or refunding.
3. Search only valid, genuinely allocatable equivalent capacity under authorized store/tenant scope; never steal a unit committed to a different buyer.
4. Use bounded, justified, idempotent recovery steps that survive restarts; do not turn the MVP into ordinary indefinite backorder fulfillment.
5. If full fulfillment is proven impossible while no incompatible license has been delivered/exposed, Ordering may choose a **full refund of the original captured charge**.
6. Refund authorization, provider request, pending, succeeded, failed, canceled and unknown are distinct; the Order is not compensated merely because a refund was requested.
7. Use account-scoped Stripe operations tied to the original charge/PaymentIntent and exact amount/currency; Connect-specific controls remain pending.
8. Ordering alone selects a commercial resolution; Payments alone executes/refines Refund financial truth; Fulfillment alone knows keys and delivery.
9. D-04-EXCL is ACCEPTED: incompatible fulfillment and inability-compensation refund effects cannot be simultaneously authorized for one obligation.
10. A changed local guard/lease is insufficient if an earlier license reveal or refund might still execute.
11. Partial delivery or contradictory evidence requires a durable incident, investigation and exceptional repair rather than normal automatic full refund.
12. Separate post-fulfillment refunds for legal/commercial reasons are future processes and are not implicitly disallowed or accepted here.

## Alternatives retained in the ADR

- A1 — Immediate refund upon any inventory error: rejected because local timeout may conceal an already committed unit.
- A2 — Reconcile, safely recover, then full refund for truly undeliverable wholly unfulfilled orders: ACCEPTED.
- B — Wait indefinitely for new stock: rejected as ordinary MVP behavior; no ordinary backorders.
- C — Manual action on every error: retained for exceptions, not selected as the default workflow.

## Consequences and trade-offs

Safety requires durable states, context-specific authority, bounded commercial flexibility and explicit investigation of external/unknown effects. Business throughput can be reduced when Stripe fails or evidence is ambiguous. That is deliberate: preserving financial/inventory correctness takes precedence over falsely declaring completion. No alternative or numbered clause above selects a Mongo schema, physical worker algorithm, standalone microservice, provider API version or globally atomic workflow.

## Scoped unresolved decisions and dependencies

- D-04-EXCL ACCEPTED, D-04-SM PROPOSED — SELECTED.
- D-04-P01 PENDING recovery thresholds/operations.
- D-04-CONNECT PENDING actual Stripe Connect refund semantics.
- AUD-P0-04-QUIESCENCE PENDING / BLOCKING; M00.2 license disclosure boundary unresolved.

## Future verification

- Relevant planned tests: AUD04-T01..T16; D05-T07.
- Do not treat simulator success as proof of Stripe-internal behavior.
- Verify authoritative business facts, provider objects where applicable, isolation boundaries and lack of duplicated financial/fulfillment effects.
- Required status: TEST_PLANNED. No VERIFIED evidence exists.

## Source and change governance

The original source contains more discussion, interleavings and alternative rationale than this ratification-focused record. Preserve that source in custody and consult it for any fine-grained implementation specification. Later changes require scoped ratification and an English feature/bugfix branch + PR owned by @sergio-tr.
