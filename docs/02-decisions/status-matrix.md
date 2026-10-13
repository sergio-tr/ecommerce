# CommerceCore — Current Scoped Decision Register

**Cutoff:** 2026-10-13. **Source of truth:** explicit user ratifications govern only their own scope. The 181 inherited decisions are in the separate historical register, with immutable source statuses. This table contains **79 preexisting scoped records plus four newly accepted explicit governance policies**. No P0 blocker is closed. All relevant future tests remain TEST_PLANNED; no VERIFIED provider evidence.

**Special notes:** D-01-SM remains PROPOSED — SELECTED; AUD-P1-02-FSM-MIN remains PENDING (an explicit user correction). AUD-P1-03's double-window suggestion is NOT RATIFIED; its inherited display status is preserved, not upgraded. D-03-CAPTURE is a noncanonical audit reference for a PENDING topic, not a user-approved new decision ID.

| ID | Exact recorded state | English scope and meaning |
|---|---|---|
| D-01 | ACCEPTED | Protected inventory and evidence-gated release before Stripe |
| D-02 | ACCEPTED | Configurable/versioned Stripe Checkout Session expiration |
| D-03 | ACCEPTED | Hosted card payments and 3DS for initial eGame |
| D-04 | ACCEPTED | Preserve paid obligations and safely compensate unfulfillable orders |
| D-05 | ACCEPTED | Durable financial Inbox/Outbox and crash recovery before Kafka |
| D-06 | ACCEPTED | Limited sequential commercial payment attempts |
| D-07 | ACCEPTED | Authorized cancellation and early Session expiry with reconciliation |
| D-01-SM | PROPOSED — SELECTED | Candidate Reservation capacity-only FSM, not ratified |
| D-02-P01 | PROPOSED — SELECTED | Candidate 35-minute Session duration, not ratified |
| D-03-WALLET | DEFERRED | Apple Pay and Google Pay deferred |
| D-03-LINK | PENDING | Stripe Link settlement instrument evaluation pending |
| D-03-CONFIG | PENDING | Effective provider API/store payment-method restriction pending |
| D-03-CAPTURE | PENDING | Audit alias for capture-mode question; not a ratified canonical identifier |
| D-04-EXCL | ACCEPTED | Exclusion of incompatible fulfillment and failure-compensation refund |
| D-04-SM | PROPOSED — SELECTED | Candidate commercial-resolution state machine |
| D-04-P01 | PENDING | Recovery retry/backoff/escalation values pending |
| D-04-CONNECT | PENDING | Refund processing under Stripe Connect pending |
| D-05-INBOX | ACCEPTED | Verified durable webhook Inbox before provider 2xx |
| D-05-OUTBOX | ACCEPTED | Locally atomic mandatory outbound work |
| D-05-RECOVERY | ACCEPTED | Durable crash and message recovery for business saga |
| D-05-IMPL | PROPOSED — SELECTED | Candidate physical inbox/outbox/worker polling |
| D-05-CONCURRENCY | PENDING | Worker leasing, fencing and concurrency pending |
| D-05-MONGO | PENDING | Mongo write concern, transaction atomicity, journaling and commit-unknown behavior pending |
| D-05-OPS | PENDING | Polling, reconciliation, alerts and escalation pending |
| D-06-EXCL | ACCEPTED | Only one potentially collectible commercial opportunity at once |
| D-06-P01 | PROPOSED — SELECTED | Two hosted commercial Sessions candidate, not ratified |
| D-06-SM | PROPOSED — SELECTED | Candidate PaymentAttempt admission and successor guards |
| D-06-OPS | PENDING | Anti-abuse limits, operational metrics and thresholds pending |
| D-06-RETRY-WINDOW | PENDING | Post-negative commercial retry request window pending |
| D-06-INTENT | PENDING | Commercial intent correlation across checkouts pending |
| D-07-EXCL | ACCEPTED | Accepted cancellation blocks new incompatible financial admission |
| D-07-SM | PROPOSED — SELECTED | Candidate cancellation process FSM |
| D-07-CONCURRENCY | PENDING | Cancellation versus payment/session race protocol pending |
| D-07-AUTH | PENDING | Guest cancellation authorization to M00.3 pending |
| D-07-OPS | PENDING | Cancel/reconcile timing and escalation pending |
| AUD-P0-01-DIR | ACCEPTED | Versioned financial admission, durable closing barrier, conditional release direction |
| AUD-P0-01-DISPATCH-POLICY | ACCEPTED | Conservative durable dispatch exposure and evidence-gated closure |
| AUD-P0-01-DISPATCH-NEUTRALIZATION | PENDING / BLOCKING | Unproved quiescence of previously enabled Stripe HTTP sends |
| AUD-P0-01-DISPATCH-PROVIDER-WINDOW | PENDING | Absolute expires_at as unverified provider hypothesis only |
| AUD-P0-01-PROTOCOL | PROPOSED — SELECTED | Candidate final cross-context command and guard protocol |
| AUD-P0-02-RECOVERY-POLICY | ACCEPTED | Multi-layer financial recovery and positive-evidence closure |
| AUD-P0-02-PROTOCOL | PROPOSED — SELECTED | Candidate source-correlated provider recovery steps |
| AUD-P0-02-PROVIDER-PROOF | PENDING / BLOCKING | Insufficient proof of universal closure for Session-ID-unknown operations |
| AUD-P0-02-OPS | PENDING | Unknown operation investigation and escalation pending |
| AUD-P0-03-OBLIGATION-POLICY | ACCEPTED | Preexisting Order and preserved captured commercial obligation |
| AUD-P0-03-PROPAGATION | ACCEPTED | Mandatory durable/idempotent Payments-to-Ordering propagation |
| AUD-P0-03-CONTRACT | PROPOSED — SELECTED | Candidate financial-fact and commercial-incorporation contract |
| AUD-P0-03-SM | PROPOSED — SELECTED | Candidate obligation/Order transition model |
| AUD-P0-03-IMPL | PENDING | Physical Mongo/transport implementation pending |
| AUD-P0-03-CAPTURE | PENDING | Capture semantics and evidence threshold pending |
| AUD-P0-04-EXCLUSION-POLICY | ACCEPTED | Exclusive commercial resolution under irreversible effects |
| AUD-P0-04-EFFECT-HANDOFF | PROPOSED — SELECTED | Candidate versioned effect execution/handoff |
| AUD-P0-04-QUIESCENCE | PENDING / BLOCKING | Unproved cessation of stale license disclosure or refund effects |
| AUD-P0-04-SM | PROPOSED — SELECTED | Candidate compensation/refund/fulfillment FSM |
| AUD-P0-04-IMPL | PENDING | Physical execution and storage protocol pending |
| AUD-P1-01-FSM-POLICY | ACCEPTED | Accepted direction toward capacity-only four-state Reservation FSM |
| AUD-P1-02-OWNERSHIP-POLICY | ACCEPTED | Separate authoritative facts by bounded context |
| AUD-P1-02-COORDINATION-POLICY | ACCEPTED | Minimal but durable CheckoutProcess as recovery coordinator |
| AUD-P1-02-FSM-MIN | PENDING | Concrete minimal saga FSM not selected; PENDING |
| AUD-P1-02-CONTRACT | PROPOSED — SELECTED | Candidate semantic contract between Order, coordinator and Payments |
| AUD-P1-02-IMPL | PENDING | Atomicity and concrete storage/recovery pending |
| AUD-P1-03-WINDOW-POLICY | PROPOSED — NOT RATIFIED | Relative and absolute retry admission windows only proposed, NOT ratified |
| AUD-P1-03-SAFE-RETENTION | PROPOSED — NOT RATIFIED | Safe protected-capacity condition inside unratified retry proposal |
| AUD-P1-03-WINDOW-VALUES | PENDING | Commercial retry window parameters pending |
| AUD-P1-03-PROTOCOL | PROPOSED — NOT RATIFIED | Candidate commercial admission deadlines, NOT ratified |
| AUD-P1-03-OPS | PENDING | Operational expiry/escalation model pending |
| AUD-P0-01 | OPEN / BLOCKING | P0 blocker: old external Stripe dispatch may still create a collectible Session |
| AUD-P0-02 | OPEN / BLOCKING | P0 blocker: unknown Stripe Session without ID cannot always be conclusively closed |
| AUD-P0-03 | OPEN / BLOCKING | P0 blocker: capture and obligation propagation must survive inter-context failure |
| AUD-P0-04 | OPEN / BLOCKING | P0 blocker: prior irreversible Fulfillment/Refund effects cannot be assumed neutralized |
| AUD-P1-01 | OPEN | P1 open: Reservation FSM and StockPool conservation |
| AUD-P1-02 | OPEN | P1 open: duplicate authorities among Order/CheckoutProcess/Payment |
| AUD-P1-03 | OPEN / NOT RATIFIED | P1 open: commercial retry windows not ratified |
| AUD-P1-04 | OPEN | P1 open: Stripe Connect, capture and method restriction |
| AUD-P1-05 | OPEN | P1 open: Mongo financial atomicity and persistence guarantees |
| AUD-P1-06 | OPEN | P1 open: multi-line all-or-nothing capacity and fulfillment |
| AUD-P2-01 | OPEN | P2 open: exact domain/provider vocabulary and meanings |
| AUD-P2-02 | OPEN | P2 open: evidence for proposed 35-minute and two-session defaults |
| AUD-P2-03 | OPEN | P2 open: unified trace from requirement to actual test evidence |
| GOV-001 | ACCEPTED | English is mandatory for all future repository artifacts, issues, commits, planning records and communication. |
| GOV-002 | ACCEPTED | All changes happen on independent feature/*, bugfix/* or equivalent scoped branches and reviewed pull requests, never directly on main. |
| GOV-003 | ACCEPTED | Use Conventional Commits with type(scope): message; never credit assistants, tools or external services as co-authors or contributors. |
| GOV-004 | ACCEPTED | GitHub account sergio-tr is the sole default owner, author and responsible assignee across code and planning. |

For rationale, alternatives and failure interleavings consult the individual D-01..D-07 and AUD-P0/P1 deep-dive files; this is an index, not a substitute for those decisions.
