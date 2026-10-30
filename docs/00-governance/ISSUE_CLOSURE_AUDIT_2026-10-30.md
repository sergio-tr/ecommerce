# CommerceCore — Evidence-based issue closure register (2026-10-30)

**Owner:** @sergio-tr. **Baseline:** GitHub main observed at `1c1550fc25374149ae8c8e58c2804b34cc7d5d27`, after PR #28 was MERGED; this document is a proposed governance addition in a **separate unmerged feature PR**. **Scope:** issue completion eligibility only, not a modification of ratified domain policy, a blanket acceptance of G3, G4 code permission or G5 evidence.

## Closure decisions actually executed

| Work | GitHub | Linear | Verdict | Evidence and boundary |
|---|---|---|---|---|
| English source/documentary baseline | [#14](https://github.com/sergio-tr/ecommerce/issues/14) CLOSED | SER-131 Done | **CLOSE_COMPLETED** | PR #19 merged (25010ad), 19 source identities/hash manifest, 181 historical entries, current decision register, source gaps disclosed; complete source fidelity continues separately under #13 |
| GitHub/Linear/Slack documentary reconciliation | [#24](https://github.com/sergio-tr/ecommerce/issues/24) CLOSED | SER-133 Done | **CLOSE_COMPLETED** | PR #26 merged (8140b11), PR #28 merged (1c1550f), source-precedence and DR07..10 handoff; remaining architecture work belongs to #27/#1..13 |
| Global architecture review | [#27](https://github.com/sergio-tr/ecommerce/issues/27) OPEN | SER-135 In Progress | **DO_NOT_CLOSE_YET** | PR #28's drafting work merged; exact source/decision signoff, final scope blockers, and G3 owner acceptance criteria not all satisfied |
| M01 bootstrap code | [#25](https://github.com/sergio-tr/ecommerce/issues/25) OPEN | SER-134 Backlog | **NO_G4/NO_CODE** | DR07 PARTIAL, DR08 PASS user-reported, DR09 identity/base recheck, DR10 NOT_AUTHORIZED; #27 gate still open |

**GitHub issue completion and architectural audit disposition are orthogonal.** Never close an original audit merely because its recommended design has a merged PR, its Linear row is Done or its tests are documented; an OPEN/BLOCKING finding may have approved design directions and still require actual provider/DB evidence.

## The 13 original findings — precise remaining closure proof

| Audit | GitHub | Linear | Severity | Minimum closure delta | Relevant tests | Current disposition |
|---|---|---|---|---|---|---|
| AUD-P0-01 | [#1](https://github.com/sergio-tr/ecommerce/issues/1) | SER-118 | P0 | Positive proof or conservative hold: old dispatch never causes unsafe release; must execute suspended-worker and provider tests. | AUD01-T01..T12; AUD01-DT01..DT10 | **KEEP_OPEN**: External-effect proof |
| AUD-P0-02 | [#2](https://github.com/sergio-tr/ecommerce/issues/2) | SER-119 | P0 | Prove safe unknown-Session recovery without Session ID or retain incident/hold; provider account/API-specific. | AUD02-T01..T16 | **KEEP_OPEN**: Provider proof |
| AUD-P0-03 | [#3](https://github.com/sergio-tr/ecommerce/issues/3) | SER-120 | P0 | Confirm captured funds, prior Order, local Inbox/Outbox transactions and unknown Mongo commit under crash. | AUD03-T01..T16 | **KEEP_OPEN**: Physical and provider proof |
| AUD-P0-04 | [#4](https://github.com/sergio-tr/ecommerce/issues/4) | SER-121 | P0 | Prove grant/possible-exposure barrier vs refund with paused workers and uncertain external responses. | AUD04-T01..T16 | **KEEP_OPEN**: Irreversible-effect proof |
| AUD-P1-01 | [#5](https://github.com/sergio-tr/ecommerce/issues/5) | SER-122 | P1 | Ratify Reservation transition guards and StockPool conservation accounting; verify owner-local atomicity. | AUD11-T01..T12 | **KEEP_OPEN**: Exact design + Mongo proof |
| AUD-P1-02 | [#6](https://github.com/sergio-tr/ecommerce/issues/6) | SER-123 | P1 | Approve Order/CheckoutProcess local state command matrix with true source ownership; prevent duplicate authority. | AUD12-T01..T12 | **KEEP_OPEN**: Exact design + concurrency proof |
| AUD-P1-03 | [#7](https://github.com/sergio-tr/ecommerce/issues/7) | SER-124 | P1 | Option D policy accepted; choose exact anchors and clock/dispatch fencing, defer numerical windows under one-attempt exposure. | AUD13-T01..T16 | **KEEP_OPEN**: Protocol/values + proof |
| AUD-P1-04 | [#8](https://github.com/sergio-tr/ecommerce/issues/8) | SER-125 | P1 | Bind test account/API version and confirm effective card/3DS methods, capture mode and Link suppression; future Connect deferred. | Stripe test provider experiment to define | **KEEP_OPEN**: Exact provider contract + proof |
| AUD-P1-05 | [#9](https://github.com/sergio-tr/ecommerce/issues/9) | SER-126 | P1 | Specify Mongo txn read/write/journal/index/unknown commit and run actual crash/readback evidence. | Mongo failure experiment to define | **KEEP_OPEN**: Exact physical contract + driver proof |
| AUD-P1-06 | [#10](https://github.com/sergio-tr/ecommerce/issues/10) | SER-127 | P1 | Atomic multi-line hold and all-license preparation; no partial disclosure/automatic full refund without separate policy. | AUD04-T10..11, AUD11-T11..12 | **KEEP_OPEN**: Exact contract + physical proof |
| AUD-P2-01 | [#11](https://github.com/sergio-tr/ecommerce/issues/11) | SER-128 | P2 | Finalize glossary with one owner per term, provider vs incorporated fact examples and typed contract references; explicit owner approval. | Static contract glossary checks | **KEEP_OPEN**: Ratification/documentary checks |
| AUD-P2-02 | [#12](https://github.com/sergio-tr/ecommerce/issues/12) | SER-129 | P2 | Measure actual Checkout Session expires_at/available methods, do not hardcode universal 35m or two attempts; document first-slice no retry. | Stripe test session expiry experiment | **KEEP_OPEN**: Provider proof and configuration |
| AUD-P2-03 | [#13](https://github.com/sergio-tr/ecommerce/issues/13) | SER-130 | P2 | 110 source-oracle draft translations require semantic owner review; 140 CAP source anchors and R1-to-ratification clause diff; evidence link placeholders stay NOT_RUN. | 148 stable IDs, 110 audit pairs | **KEEP_OPEN**: Trace and provenance |

### What is complete across those rows

- For all 13, a recommended initial architecture, alternatives, basic context ownership, safety invariants, relevant negative outcomes and test-oracle links are drafted and merged by PR #28.
- For the 103 original planning questions, the separate disposition table contains all IDs exactly once and distinguishes 30 existing canonical from 73 provisional IDs. A written candidate does **not** automatically ratify all 73.
- 110 audit source scenarios/oracles were matched by original IDs and have English **draft** translations replacing generic placeholders; 38 prior D05/D06/D07 cases preserved. All **148** tests remain TEST_PLANNED / NOT_RUN.
- M00.2 stock/licensing, M00.3 identity/tenant security and M00.4 versioned public port baseline are **documented candidates**, not a blanket final schema approval.

### Minimum route from proposed to approved (without immutable architecture)

1. **Exact source:** validate R1 original clauses vs later explicit accepted decisions, including mismatches rather than pretending old proposals are ratifications. Check 140 CAP provenance locators, 110 bilingual audit oracle semantics and source hashes where raw bytes are available. Track `SOURCE_GAP` honestly.
2. **One approved contract per enabled capability:** define owner and invariants, payload types/unique constraints, authoritative state transitions, local transaction boundary, idempotency scope, every critical command precondition, typed failures/UNKNOWN handling, human escalation, migration seam, version/compatibility and negative tests. If a future capability is excluded or deferred, record exact reversible exclusion and trigger.
3. **Explicit decision change control:** register only exact selected decisions as ACCEPTED after owner approval under [CHANGE_CONTROL](CHANGE_CONTROL.md); leave all unapproved subdecisions PENDING or PROPOSED. Never infer owner ratification from Slack, PR merge or tracking state.
4. **Execution gate:** business effects, provider method/capture, real DB/worker concurrency and key disclosure tests need actual G5 proof, not documentation. No live-money/production authorization. P0 **OPEN/BLOCKING** until their original proof acceptance rule is satisfied.
5. **M01 sequencing:** review the global design-first gate separately and obtain task-specific G4 for #25/SER-134; a basic Nest workspace is technically independent of Stripe proof, but the user currently requires design-first work before code.

### Immediate issue-work order without unnecessary duplicates

1. Close already completed documentary #14 and #24 (done); don't reopen just because future domain work is pending.
2. Complete source/contract trace and explicit glossary/owner semantics (#13 and #11) as a **design-only** review, not as payment proof.
3. Specify D-05-MONGO exact owner-local physical contract (#9) together with StockPool/Reservation (#5), Ordering/CheckoutProcess (#6) and multiline capacity/fulfillment (#10).
4. Formalize payment/cancellation/unknown provider effect protocols (#1–#4 and #7–#8), preserving fail-closed and account/tenant evidence.
5. Provider-specific session time and effective method tests (#12/#8), actual Mongo crash/transaction tests (#9) and finance/fulfillment fault trials (#1–#4/#10) as separately authorized G5 work.
6. Reconcile all status/evidence axes in #27/SER-135, human-review scope, then decide only the **specific** M01 G4.

**No release of existing P0 holds, no bulk checkbox changes, and no unsupervised merge to main.**
