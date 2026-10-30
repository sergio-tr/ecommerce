# Remaining Design, Evidence and Local-Implementation Work — Executable Handoff

**Snapshot:** 2026-10-30. **Owner:** @sergio-tr. **Functional M04 scope:** 140/140 classified (85 INCLUDED, 43 EXCLUDED, 12 DEFERRED). **Architecture implementation readiness:** INCOMPLETE. **This document does not authorize coding or assert failed/missing provider evidence exists.**

## P0 — mandatory contracts before Stripe/Inventory/Fulfillment implementation

| Existing canonical identifier | Bounded-context authority | Exact missing deliverable | Predeclared negative/failure evidence | Planned milestone |
|---|---|---|---|---|
| AUD-P0-01-DISPATCH-NEUTRALIZATION | Payments, Ordering, Inventory | Show how versioned admission barrier prevents **old already-enabled** Stripe sends from creating a charge after stock release, or preserves a conservative unresolved hold | Delayed worker resumes after closure; lost HTTP response; no unsafe release | M00.1 |
| AUD-P0-02-PROVIDER-PROOF | Payments | Identify provider Session/payment by immutable request metadata, account, mode, key; prove closure/unknown without inventing absence from eventual-consistent search | Session ID lost, idempotency key pruned, duplicate POST blocked, provider search negative inconclusive | M00.1 |
| AUD-P0-03-CAPTURE | Payments/Ordering | Ratify capture/captured/processing and Order-obligation admission and propagation | Webhook duplicate/delay, captured payment with Ordering restart, old account attribution | M00.1 |
| D-05-MONGO | Payments/Ordering persistence owners | Select owned local Mongo transactional boundary, durable Inbox/Outbox, write concern, recovery after unknown commit | Reconnect/failover before acknowledged commit, duplicate event idempotency and surviving mandatory continuation | M00.1 |
| AUD-P0-04-QUIESCENCE | Ordering/Fulfillment/Payments | Prove licensed key cannot be exposed after refund branch changes, or keep protected incident; mirrored refund in-flight state | Old reveal capability, already-sent refund POST unknown, lost client ACK after reveal | M00.1/M00.2 |
| AUD-P1-01 + AUD-P1-06 | Inventory/Fulfillment | Finalize StockPool/Reservation atomic conservation and all-line exclusive DigitalLicense preparation/reveal | Concurrent last unit, same key allocated twice, partial multi-line preparation and crash | M00.2 |
| M00.3 + D-07-AUTH | Identity/Ordering/Fulfillment | Trusted TenantContext, secure guest/cart/order claim and cancel, operator MFA, scoped authorization and effect revocation | Forged Store scope, stale guest token, CSRF, unauthorized refund/key access | M00.3 |
| M00.4 + AUD-P1-02-FSM-MIN | Ordering/contract owners | Concrete FSM, command/event/version/error identities, mandatory saga work, stale read guards | Crash between Order and process updates, duplicate/out-of-order events and crossed generations | M00.4 |

**No invented full-payments transaction:** local atomicity can protect owner records/Outbox but cannot atomically include Stripe, buyer HTTP response and key exposure. A timeout, expired lease, absent webhook or search miss is never a negative financial fact.

## P1 — additional design decisions and specifications

| ID | Remaining choice or validation | Why not automatically resolved by preferred policy |
|---|---|---|
| D-03-CONFIG / D-03-LINK | Exact effective Stripe payment-method enforcement; confirm Link/wallet suppression | Selecting card/3DS only does not prove provider UI configuration |
| D-03-CAPTURE / D-04-CONNECT / AUD-P1-04 | Connect ownership, charge flow, capture and refund account attribution | Provider-account model remains unknown |
| D-02-P01 / D-06-P01 | Confirm actual Stripe Session expiry policy and max commercial Sessions | Historical 35m and 2-session values are unratified candidates |
| AUD-P1-03-WINDOW-VALUES / D-06-RETRY-WINDOW | Concrete absolute/relative durations, anchor clock, effective policy version, admission/close interleaving | Recommended alternative D selects policy direction, not executable clock values |
| D-06-INTENT / D-07-CONCURRENCY | Stable commercial intent and cancellation identity, no stale-worker effect | Safe retry/cancel semantics need versioned guards |
| CAP-PRC-004 | Fully specify T1 demo tax adapter and Quote tax snapshot; no live compliance claim | Scope accepted, schema and exact money rounding rules pending |
| CAP-SEC-002 / CAP-SEC-011 | Guest session mechanism, operator identity, MFA/recovery | Broad secure-session direction does not name a working identity protocol |
| CAP-CLOUD-008 | CommerceCloud public Store configuration port and own data authority | No final physical separate DB/container selected |
| CAP-EGAME-009 | Accessible purchase acceptance criteria and test oracles (candidate WCAG 2.2 AA for review, not an execution claim) | Accessibility included, exact target unratified |
| CAP-OPS-003 / D-05-OPS | Detect UNKNOWN, stuck Reservations and invoice/refund incidents; assign escalation owners and measurable thresholds | Hardcoded alert thresholds would need monitored measurements |
| CAP-DIST-008 | Select public license and validate third-party dependencies before distribution; Apache-2.0 historical candidate only | M04 does not require public package publication; legal choice remains open |
| M01 | Pin compatible Node/Nx/pnpm/NestJS/Angular versions; workspace and dependency-guard contracts; CI/test acceptance | Foundation direction accepted, local build not authorized/executed |

## P2 — baseline fidelity and duplication before claiming fully verified design

1. Complete clause-by-clause original M00.1-R1 versus explicit later user ratifications, preserving original statuses and reservations.
2. Reconcile all 140 CAP entries to exact original source clauses; source metadata reused at subsystem level is not proof of individual requirement.
3. Reconcile the English scenario/expected-result *semantics* of the 110 audit experiments found by ID in hash-matched original source files. Keep all 148 TEST_PLANNED / NOT_RUN until actual execution.
4. Review 14 provisional PLAN-DEC candidates marked as refinements of existing decisions; never open duplicate issues.
5. Cross-check accepted decision ledger, context map, contracts, scopes and issue ownership. Contradictions are explicit review findings, never silently overwritten.

## Independent work usable before financial protocol closure

| Task package (planning only, NOT a new GitHub ticket) | G3 readiness criterion | Can be separately authorized for local development? |
|---|---|---|
| M01-ENG-01 | Pin and test compatible toolchain in written spec | YES, after explicit scope/issue G4 approval |
| M01-ENG-02 | Approved Nx/pnpm workspace and deployable-application ownership map | YES, no business side effects |
| M01-ENG-03 | Domain/Application/Ports/Adapters dependency matrix and negative import tests | YES, if independent of unratified effect contracts |
| M01-ENG-04 | Lint, typecheck, unit/contract architecture test conventions and CI quality gates | YES, after G4 approval |
| M01-ENG-05 | Secret-free example configuration and local-only fixtures (no real license/Stripe keys) | YES, after G4 approval |
| M01-ENG-06 | English developer handbook, onboarding and PR/commit requirements | YES, after G4 approval |
| M02-SEC-01 | Tenant/Store actor-role/claim specification | DESIGN only until M00.3 accepted |
| M03-CAT-01 | Store-owned Product/Variant and Listing/Offer/Quote contract | DESIGN only until M03 G3 accepted |
| M04-FIN-* | Stripe, Reservation, Orders, digital key, cancellation/refund | NOT IMPLEMENTATION READY while P0 blockers remain |

## Traceability and issue creation

Keep original GitHub #1–#13 and Linear SER-118–130 for original audit risk; GitHub #14 / SER-131 for baseline source recovery. Use an approved capability/source → exact ADR → G3 specification/contract → planned test → atomic implementation issue → feature branch/PR → executed evidence chain. No new implementation issues or task completion is implied here.

## Objective stop/go

- **G0:** PARTIAL until source fidelity and test catalog reconciliation.
- **G1:** M04 functional disposition SELECTED for all 140; user acceptance does not prove full source reconciliation or final actor journeys.
- **G2:** Recommended policy directions now ACCEPTED as specifically scoped; subordinate vendor/capture/atomicity choices remain pending.
- **G3:** Critical payment/capacity/license/guest contracts INCOMPLETE.
- **G4:** No implementation authorization or atomic issue acceptance; independent M01 still requires its own G4.
- **G5:** No executed test evidence.
- **G6:** No real-money/production authorization.

**The scope-decision backlog is finished; the full system is not designed, implemented or verified.** Closing G3–G6 requires actual contracts, experiments and separately authorized local work, not a blanket assertion of completion.
