# AUD-P0-01 — Financial admission, cancellation and capacity-release exclusion

**Audit severity:** P0. **Current finding:** OPEN / BLOCKING. **Evidence:** TEST_PLANNED, not VERIFIED. **Sources:** Texto pegado (11)(1).txt + Texto pegado (12)(1).txt + explicit user ratifications. This document records the ratified *direction* and its unresolved proof boundary; it does not close the finding or approve a physical algorithm.

## Ratified policy and exact child-state boundaries

- AUD-P0-01-DIR: ACCEPTED
- AUD-P0-01-DISPATCH-POLICY: ACCEPTED
- AUD-P0-01-DISPATCH-NEUTRALIZATION: PENDING / BLOCKING
- AUD-P0-01-DISPATCH-PROVIDER-WINDOW: PENDING (hypothesis only)
- AUD-P0-01-PROTOCOL: PROPOSED — SELECTED

## Minimal eGame failure scenario

A worker receives a valid Stripe-create dispatch authorization while Inventory protects the final eGame license. The worker is suspended before HTTP. A buyer cancels, Payments seals new admission, the worker lease expires, and Inventory is tempted to release stock. If the worker later resumes and Stripe creates a Session, a collectable opportunity now exists with unprotected inventory.

## Architectural alternatives and rejection rationale

- A — Read current flags before each step. Invalid: the worker may pause after reading and before Stripe POST; TOCTOU.
- B — Hold Mongo/global locks or a distributed transaction for external HTTP. Not possible end-to-end with Stripe; high coupling and no late-HTTP neutralization.
- C — Versioned admission and fencing alone. Necessary to reject stale Mongo writes but not sufficient to stop a previously authorized HTTP request.
- D — Versioned admission plus durable monotonic closing barrier, conservative dispatch exposure accounting, provider reconciliation and conditioned Inventory release: accepted direction, incomplete protocol.
- E — Optimistically release then refund if Stripe later charges. Rejected as routine behavior because it violates D-01 protected-capacity guarantee.

## Accepted constraints and safeguards (source-derived summary)

1. Payments is the sole authority for admitting/enabling collectible operations by financial obligation. Ordering owns commercial eligibility and cancellation intent; Inventory owns capacity.
2. Durably persist operation identity and immutable external parameters before permitting any potentially collectible Stripe request.
3. Commercial attempt admission and actual dispatch enablement are distinct approvals; an earlier preparation is not an indefinite HTTP permission.
4. Both admission and enablement require conditional writes, versions, idempotency and logical serialization per financial obligation.
5. Once dispatch is enabled, treat the operation as potentially executable even when no local HTTP send log exists.
6. Cancellation seals incompatible new admission, but does not automatically neutralize already-enabled or in-flight requests.
7. Do not infer shutdown of an HTTP capability from Mongo fencing/lease expiry, worker stop, timeout, successful local close or empty provider search.
8. Payments may issue the final release permission only after sealing the generation and proving all previous potentially executable external effects are financially resolved or neutralized.
9. The final release permission must be durable and monotonically irreversible for the generation, scoped to tenant, store, checkout, Order, reservation and their versions.
10. Inventory applies release atomically/conditionally, rejecting stale requests and duplicates. It does not read Stripe or stale Payments projections as its source of truth.
11. A confirmed late contradictory payment is preserved as exposure/incident; it is not silently rewritten as unpaid, nor does it legitimate over-selling.
12. Security outranks progress when evidence is unavailable, but blocked capacity requires observability, escalation, an investigator and non-destructive remediation.
13. No new aggregate, microservice, external workflow engine or physical lease algorithm is ratified by accepting this direction.

## Execution exposure categories (not an approved domain FSM)

- Prepared but not enabled: locally closed if authority can atomically exclude new enablement and no older execution capability exists.
- Enabled but reportedly not sent: still a potential external effect. A local send log cannot establish no HTTP call.
- Send may have begun: treat as potentially received by Stripe.
- Sent, response unknown: reconcile without creating a new incompatible session.
- External object found and reconciled: identify actual collectible state and all related candidates.
- Effect proved neutralized: only sufficient when old future dispatch is also impossible and all other operations are closed.

## Concurrent and crash interleavings

- I-01: ProtectReservation competes with ordinary TTL expiry — the Inventory atomic transition has a single winner; losing hold prohibits Stripe enablement.
- I-02: AuthorizeAttempt races with RequestCancellation — conditional Payments admission and closing barrier arbitrate; existing enabled sends remain open.
- I-03: Worker suspended after enablement; lease expires; a new worker closes locally — release is prohibited because stale HTTP can still be emitted.
- I-04: Stripe POST succeeds, reply lost — financial exposure is UNKNOWN; later Session ID may be recovered, but absence of ID is not absence of Session.
- I-05: Payments seals release authority and crashes before sending Inventory command — pending durable Outbox resends same scoped permit idempotently.
- I-06: An expired known Session coexists with a future late POST from the original operation — do not release solely because the known Session expired.

## What evidence is necessary and what remains unproved

- A provider-confirmed expiration or terminal financial negative state for all known candidate Sessions.
- Positive evidence that any old executor cannot make a *new* HTTP dispatch; this guarantee is currently unresolved and cannot be inferred from a lease.
- Durable audit of account/environment, operation ID, immutable params, idempotency identity, versioned barrier and operator interventions.
- State-level and Stripe-test-mode object counts, not merely successful local write returns.

## Future verification and acceptance

**Planned tests:** AUD01-T01–T12 and AUD01-DT01–DT10. All are TEST_PLANNED; none executed. A passing local mock or database-only transaction test does not demonstrate Stripe provider behavior or universal control of external effects. Test claims require observed provider objects, durable business state, monotonic authorization, cross-tenant isolation, duplicate operation counts and post-restart investigation.

**Dependencies:** D-01, D-05, D-06, D-07, AUD-P0-02-PROVIDER-PROOF, D-05-MONGO, M00.2.

**Documentary closure criterion:** user-ratified command contracts, guarded transitions, local atomicity semantics, precise proof/neutralization conditions, durable escalation and no contradictory remaining P0 behavior. Do not introduce services, aggregates or infrastructure without demonstrated need and separate approval.

**Tracking:** GitHub #1, Linear SER-118. Owner: @sergio-tr. Future changes through independent English feature/bugfix branches and conventional commits.
