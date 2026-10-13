# AUD-P0-04 — Exclusive fulfillment versus refund under irreversible in-flight effects

**Audit severity:** P0. **Current finding:** OPEN / BLOCKING. **Evidence:** TEST_PLANNED, not VERIFIED. **Sources:** Texto pegado (15).txt + explicit user ratification C-01..C-07. This document records the ratified *direction* and its unresolved proof boundary; it does not close the finding or approve a physical algorithm.

## Ratified policy and exact child-state boundaries

- AUD-P0-04-EXCLUSION-POLICY: ACCEPTED
- AUD-P0-04-EFFECT-HANDOFF: PROPOSED — SELECTED
- AUD-P0-04-QUIESCENCE: PENDING / BLOCKING
- AUD-P0-04-SM: PROPOSED — SELECTED
- AUD-P0-04-IMPL: PENDING

## Minimal eGame failure scenario

A verified paid eGame Order moves toward delivery. Fulfillment prepares or reveals a license, but its HTTP reply is lost. Ordering misreads the timeout as non-delivery and authorizes a full refund. Stripe accepts CreateRefund, then evidence appears that the license was already disclosed. A local revision of Ordering could not undo either effect.

## Architectural alternatives and rejection rationale

- A — Single exclusive local resolution in Ordering: necessary but insufficient to stop old effect workers.
- B — Re-check Ordering just before each irreversible call: TOCTOU, suspension between check and effect.
- C — Distributed coordinator/global transaction/long lock during Stripe or key disclosure: cannot encompass external effects and couples contexts.
- D — Exclusive commercial resolution + durable versioned effect grants + positive quiescence of earlier effects + controlled recovery: ACCEPTED direction, incomplete proof.

## Accepted constraints and safeguards (source-derived summary)

1. Ordering alone decides the authorized commercial resolution; Payments executes/records refunds, Fulfillment assigns/discloses DigitalLicenses, Inventory preserves stock authority, CheckoutProcess coordinates pending work.
2. Distinguish capacity reservation, exclusive per-line DigitalLicense assignment, access preparation, enabling a disclosure capability, possible actual irreversible disclosure and evidence of use/fulfillment.
3. Do not equate key assignment with delivery, nor lack of read acknowledgement with absence of disclosure. If decrypted key material might leave the trusted boundary, treat it as potentially exposed.
4. An access capability that still permits revelation is itself a potentially executable effect until explicitly neutralized.
5. Consider complete durable multi-line preparation before enabling any line's disclosure; this improves safety but does not prove atomic exposure across lines.
6. Ordinary partial fulfillment and indefinite backorder are outside initial MVP. Exceptional partial exposure is a financially/commercially distinct incident, not an automatically safe full-refund branch.
7. Before changing from fulfillment to incompatible refund, reconcile all effects already executed and demonstrate no pending older permission can still perform a conflicting effect.
8. Versions and lease expiry do not withdraw already exported keys or Stripe CreateRefund requests; evidence must come from actual effect-owning context/provider.
9. Refund authorized/commercially selected, prepared, potentially sent/unknown, identified/pending, requires action, succeeded, failed and canceled have distinct semantics; exact provider FSM not ratified.
10. Do not infer a pending Stripe refund can be freely canceled, or create another Refund merely because CreateRefund timed out.
11. Cross-check account/mode/charge/amount/currency/refund ID/Order resolution before applying financial refund evidence.
12. D-04-EXCL governs incompatible resolution for inability to fulfill *the same obligation*. Legitimate later statutory or customer-support refunds require separate future policies and are not universally forbidden.
13. Time and retry exhaustion may trigger operations escalation but cannot authorize incompatible delivery/refund.
14. Operator intervention may investigate, repair and escalate; it cannot bypass evidence requirements through direct state edits.
15. No RecoveryCase aggregate, global transaction manager or additional service is approved by this policy alone.

## Execution exposure categories (not an approved domain FSM)

- Capacity reserved/protected is not a license assigned.
- License exclusively assigned and access prepared is not necessarily externally disclosed.
- Reveal-capable operation authorized is potentially irreversible until neutralized.
- Disclosure/HTTP reply unknown — assume potential exposure rather than no delivery.
- Refund requested to Stripe with lost reply — financial result unknown; preserve original operation identity.
- Refund provider terminal confirmation — preserve original charge history and incorporate resolution only if commercially valid.

## Concurrent and crash interleavings

- I-01: Fulfillment worker suspended after reveal authorization; Ordering wants refund — block the switch pending quiescence proof.
- I-02: License plaintext leaves process and response is lost — treat as potentially disclosed, not safe automatic full refund.
- I-03: Two-line Order reserves both, one allocation fails before any access — recover preparation or refund if no irreversible exposure.
- I-04: CreateRefund reaches Stripe, reply lost; inventory availability later returns — no new incompatible fulfillment or second refund.
- I-05: A stale Fulfillment worker resumes after resolution version changed — local fencing protects records, but external disclosure must be prevented/evidenced.
- I-06: Legitimate refund after completed delivery is a separate governed process and does not prove earlier compensation error.

## What evidence is necessary and what remains unproved

- Fulfillment per-line immutable assignment and secure access/disclosure logs with proof of whether an access capability remains executable.
- Positive neutralization or terminal outcome for each earlier effect before authorizing incompatible resolution.
- Stripe real refund object evidence against the original charge, mode and account, including unknown and pending states.
- Evidence of no ordinary partial fulfillment in happy path; safe incident path when partial exposure nevertheless occurred.

## Future verification and acceptance

**Planned tests:** AUD04-T01–T16. All are TEST_PLANNED; none executed. A passing local mock or database-only transaction test does not demonstrate Stripe provider behavior or universal control of external effects. Test claims require observed provider objects, durable business state, monotonic authorization, cross-tenant isolation, duplicate operation counts and post-restart investigation.

**Dependencies:** D-04, D-04-EXCL, AUD-P0-01-DISPATCH-NEUTRALIZATION, M00.2 individual license exposure and multi-line invariants, D-05.

**Documentary closure criterion:** user-ratified command contracts, guarded transitions, local atomicity semantics, precise proof/neutralization conditions, durable escalation and no contradictory remaining P0 behavior. Do not introduce services, aggregates or infrastructure without demonstrated need and separate approval.

**Tracking:** GitHub #4, Linear SER-121. Owner: @sergio-tr. Future changes through independent English feature/bugfix branches and conventional commits.
