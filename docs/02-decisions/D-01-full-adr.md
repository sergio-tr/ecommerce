# D-01 — Financially protected inventory reservations

**Decision:** ACCEPTED (policy only; with expressly recorded qualifications). **Evidence:** TEST_PLANNED, except D-01 is also SPECIFIED at policy level; no experiment VERIFIED. **Primary source:** Texto pegado (3)(20261013-170123).txt (original individual proposal). **Authority:** later explicit user ratification governs; the original proposal's initial PENDING heading is historical and must not be interpreted as today's status.

## Ratified policy and safety conditions

1. Initial Reservation defaults to a 15-minute period for commencing checkout; this is not a payment settlement deadline.
2. Inventory must durably protect the original capacity before Payments enables any externally collectible operation.
3. The transition from initial Reservation to protection must be conditional, atomic under Inventory authority, versioned and idempotent; expiring an ordinary reservation competes with protection.
4. While Stripe may still charge, or a result is unknown, delayed or potentially dispatchable, Inventory preserves the protected commercial quantity even after the initial TTL.
5. Committed capacity is associated with a verified paid commercial obligation, not proof that a DigitalLicense has been individually allocated or exposed.
6. Release requires sufficiently affirmative financial closure, prevention of incompatible new admissions, resolution of previous enabled/unknown operations and a final scoped release authorization applied by Inventory.
7. An unknown result, external timeout, 3DS progress, missing webhook, lease expiry or inability to query Stripe cannot justify an automatic release.
8. All Operations, retries and releases must survive crashes and remain bound to tenant/store, Order/checkout/generation, Reservation/version and unique operation identity.
9. Prolonged protected holds require observable reconciliation, escalation and accountable manual investigation; operator action cannot fabricate negative provider evidence.

## Alternatives retained in the ADR

- A — Fixed TTL: rejected because Stripe can still collect money after stock was released.
- B — Extend TTL to a new timestamp: incomplete because payment can remain processing after the extension.
- C — Conditional commitment and evidence-based release: ACCEPTED.
- D — Release optimistically and refund later: not the standard policy because it exposes stock to multiple obligations; exceptional compensations are governed separately by D-04.

## Consequences and trade-offs

Safety requires durable states, context-specific authority, bounded commercial flexibility and explicit investigation of external/unknown effects. Business throughput can be reduced when Stripe fails or evidence is ambiguous. That is deliberate: preserving financial/inventory correctness takes precedence over falsely declaring completion. No alternative or numbered clause above selects a Mongo schema, physical worker algorithm, standalone microservice, provider API version or globally atomic workflow.

## Scoped unresolved decisions and dependencies

- D-01-SM PROPOSED — SELECTED: four-state Reservation candidate, not a final FSM.
- AUD-P1-01 OPEN: original R1 settlement/release-review states must be represented by Payments/saga rather than erased.
- AUD-P0-01 OPEN / BLOCKING: late Stripe dispatches not universally neutralized.
- M00.2: StockPool–Reservation aggregate boundaries, balance conservation and shared quotas.

## Future verification

- Relevant planned tests: AUD11-T01..T12; AUD01-T01..T12; AUD01-DT01..DT10.
- Do not treat simulator success as proof of Stripe-internal behavior.
- Verify authoritative business facts, provider objects where applicable, isolation boundaries and lack of duplicated financial/fulfillment effects.
- Required status: TEST_PLANNED. No VERIFIED evidence exists.

## Source and change governance

The original source contains more discussion, interleavings and alternative rationale than this ratification-focused record. Preserve that source in custody and consult it for any fine-grained implementation specification. Later changes require scoped ratification and an English feature/bugfix branch + PR owned by @sergio-tr.
