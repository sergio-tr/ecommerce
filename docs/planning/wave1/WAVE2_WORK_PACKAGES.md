# Wave 2 — Dependency-Aware Architecture Work Packages

**Status: PROPOSED, NOT AUTHORIZED FOR IMPLEMENTATION.** Owner @sergio-tr. The prior ratifications of architecture direction do not close any AUD-P0 risk. Wave 2 entry permits isolated architecture review with G0/G1 gaps documented; it does not assert complete source fidelity.

| Package | Priority | Goal | Bounded contexts | Entry dependencies | Required specification | Documentary exit/positive evidence | Existing tracker |
|---|---|---|---|---|---|---|---|
| W2-00 | P0 | R1 / ratification / 110 test-source fidelity | Governance | W1-RC-01..05 | Source locator crosswalk and explicit gaps | 100% source clauses matched or visibly unresolved; no fake TEST_VERIFIED | SER-131 / #14 |
| W2-01 | P1 | AUD-P1-03 retry windows ratification | Ordering/Payments | D-06; AUD-P0-01 acknowledged | Alternative review, admission cutoff invariants and negative closure | Explicit user approval or rejection; no timeout release | SER-124 / #7 |
| W2-02 | P0 | Previously enabled Stripe dispatch neutralization | Payments/Inventory | AUD-P0-01; co-design W2-03 | Versioned admission, dispatch barrier, release permit, paused HTTP worker proof | Provider-backed or conservatively BLOCKED disposition; P0-01 remains open without proof | SER-118 / #1 |
| W2-03 | P0 | Session-ID-unknown recovery and proof | Payments | AUD-P0-02; co-design W2-02 | Account/mode/correlation, idempotency, search limits, positive result and no future effect | Reviewed evidence matrix; no negative absence claim without proof | SER-119 / #2 |
| W2-04 | P1 | Mongo local atomicity and unknown commits | Payments/Ordering/Persistence | D-05-MONGO; AUD-P1-05 | Single vs multi-doc, write concern, retry/ambiguous commit, Outbox/Inbox | Accepted local guarantees and future failover/unknown-commit oracle | SER-126 / #9 |
| W2-05 | P0 | Captured financial fact and Order obligation | Payments/Ordering | AUD-P0-03; W2-04 | Capture vs authorization, idempotent propagation, saga continuation | Accepted commands/events/guards; P0-03 open until full proof | SER-120 / #3 |
| W2-06 | P0 | Irreversible key reveal versus refund | Ordering/Fulfillment/Payments | AUD-P0-04; co-design W2-07 | Exclusive resolution and old execution quiescence, refund unknown | Safe effect proof or durable incident; P0-04 open without proof | SER-121 / #4 |
| W2-07 | P0 | StockPool conservation and unique DigitalLicense | Inventory/Fulfillment | AUD-P1-01; AUD-P1-06; M00.2 | Reservation guards, last-unit contention, all-lines preparation, unique key assignment | Ratable FSM/contract, concurrency/unknown outcome test plan | SER-122 / #5; SER-127 / #10 |
| W2-08 | P0 | Guest claims and tenant action authorization | Identity/CommerceCloud | M00.3; D-07-AUTH | Trusted scope, cancellation authority, key reveal and role matrix | Accepted actor-action-resource contracts and BOLA/BFLA test oracles | Reuse source; no new issue |
| W2-09 | P1 | CheckoutProcess FSM and context contracts | Ordering/API | AUD-P1-02; W2-05; M00.4 | Facts vs projections, error/idempotency/versions, durable continuation | Accepted Checkout FSM and cross-context contract catalogue | SER-123 / #6 |
| W2-10 | P1 | Stripe Connect and store method enforcement | Payments/CommerceCloud | AUD-P1-04; D-08; AUD-P0-03-CAPTURE | Charge model, account scopes, capture evidence and refund ownership | Explicit selected Connect/capture policy; future testmode oracles | SER-125 / #8 |
| W2-11 | P1 | Independent M01 foundation design | Engineering/Security | G0/G1 recorded; no financial code dependency | Nx/pnpm, module boundaries, runtime, CI, security and test strategy | Review-ready engineering spec, no implementation or infrastructure | SER-131 / #14 planning only |
| W2-12 | P1 | Cross-context integrated Wave 3 handoff | Architecture Governance | W2-00..11 as applicable | R1 diff, specifications, CAP scope, source and decision/evidence references | G2/G3 assessment; open P0s remain blockers; no automatic R2 | Existing planning only |

## Workstream order and concurrency

1. W2-00 remains ongoing to reconcile R1, ratification clauses and 110 reconstructed test descriptions. Source gaps may persist only if explicitly named.
2. Review AUD-P1-03 (W2-01) next as the historically identified unratified individual audit. Approving a commercial admission deadline can never release stock by timeout.
3. W2-02 and W2-03 are a **co-design group**, not circular prerequisites: analyze old Stripe POSTs and unknown-provider effects together, preserving separate accepted policies and both P0 blockers.
4. W2-04 local Mongo decisions may progress alongside W2-05 Payments→Ordering capture specification; final captured-obligation proof depends on explicit local atomicity. W2-10 supplies the separately undecided Connect/capture policies.
5. W2-06 fulfillment/refund effects and W2-07 Inventory/DigitalLicense must co-design exposure and recovery boundaries without inventing a global transaction. W2-08 guest/tenant contracts may proceed in parallel.
6. W2-09 consolidates Ordering FSM and M00.4 contracts, while W2-11 can plan M01 engineering foundation independently where no unresolved finance/inventory/security effect is used.
7. W2-12 is a review checkpoint, not a new M00.5 milestone: it produces handoff readiness and records remaining blockers; never declares M00.1-R2 closed implicitly.

## Entry criteria for any work package

- Existing source and decision IDs checked, affected owner contexts specified.
- Parent scope known or uncertainty explicitly recorded.
- Relevant accepted invariants and blocked external proofs listed.
- No pending experimental result treated as negative or positive provider evidence.
- @sergio-tr remains accountable; changes occur only through reviewed English docs and topic branch.

## Exit criteria

- Alternatives, concrete pre/postconditions, version and identity guards, timeout/restart/duplicates, and safe unknown behavior specified wherever needed.
- No hidden assumption of Stripe/Mongo distributed atomicity, no released Inventory under unknown collectible exposure, no license double assignment, no tenant authority bypass.
- Exact future test setup, source-of-truth oracle, provider mode, failure/result evidence and incident owner linked.
- Explicit user ratification recorded for a newly resolved policy; child decisions, open P0s and test status remain independent.
- If provider evidence unavailable, return BLOCKED with the precise missing positive proof; do not fabricate closure.

**No implementation issues or new tracker entries are created in this Wave 2 planning proposal.**
