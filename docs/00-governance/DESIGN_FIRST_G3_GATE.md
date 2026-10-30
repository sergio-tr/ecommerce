> **Design drafting progress (2026-10-30):** recommended contracts have been written for **all 13 existing audits** and linked individually to their existing GitHub/Linear issues; **all 103 existing planning entries** now have explicit preferred starting dispositions and preserved original states. Proposed packages: [all audit contracts](../architecture/m00/M00_G3_ALL_13_AUDITS_RECOMMENDED_CONTRACTS.md), [evolvable architecture](../architecture/m00/M00_G3_EVOLVABLE_REFERENCE_ARCHITECTURE.md), [103-item matrix](../planning/wave1/M00_G3_PLANNING_RECOMMENDATIONS.md). **DRAFTED is not SIGNED OFF**: exact decision ratifications, source fidelity, 110 oracle comparisons and eventual provider/driver G5 evidence are not claimed complete. Gate status remains REVIEW REQUIRED, M01 G4 NOT_GRANTED.

# CommerceCore — Architecture-first design gate (M00-G3)

**Date:** 2026-10-30. **Owner:** @sergio-tr. **Status:** DESIGN REVIEW REQUIRED, NO PRODUCT IMPLEMENTATION. **Tracking:** [GitHub issue #27](https://github.com/sergio-tr/ecommerce/issues/27) / [Linear SER-135](https://linear.app/sergiotr/issue/SER-135/m00-g3-architecture-first-readiness-review-of-all-13-audit-issues). **Implementation parked:** [GitHub #25](https://github.com/sergio-tr/ecommerce/issues/25) / [SER-134](https://linear.app/sergiotr/issue/SER-134/m01-bootstrap-01-reproducible-nxnestjs-engineering-baseline).

## Intent and authority

The user requires **design-first sequencing**: do not start product coding, including the technically separable Nx/Nest bootstrap, until the open architecture issues and material design contracts have been reviewed and explicitly accepted, or explicitly deferred with a defensible scope boundary. This is a **project sequencing hold**, not a claim that the first Nest app technically needs financial provider tests to function.

Source of truth for decision status: `docs/02-decisions/decision-register.json`, `docs/04-audit/REGISTER.md`, their ADRs, historical source manifest and existing scope registers. This file is an operational dependency map; it does **not** accept/reject any unsettled design by itself. Linear manages issues; GitHub PRs document changes; Slack announces links.

## Complete existing audit queue — NONE SKIPPED

| Priority | Audit | GitHub | Linear | Exact remaining design concern | Status |
|---|---|---|---|---|---|
| P0 | AUD-P0-01 | [#1](https://github.com/sergio-tr/ecommerce/issues/1) | SER-118 | old Stripe sends versus cancel/financial close/Inventory release; neutralization vs indefinite hold | OPEN/BLOCKING |
| P0 | AUD-P0-02 | [#2](https://github.com/sergio-tr/ecommerce/issues/2) | SER-119 | unknown provider Session ID, durable correlation, negative evidence, no blind repost | OPEN/BLOCKING |
| P0 | AUD-P0-03 | [#3](https://github.com/sergio-tr/ecommerce/issues/3) | SER-120 | pre-existing Order/obligation, captured-funds evidence, owner-local Payments Outbox and Ordering Inbox | OPEN/BLOCKING |
| P0 | AUD-P0-04 | [#4](https://github.com/sergio-tr/ecommerce/issues/4) | SER-121 | disclosure frontier, safe refund vs potentially exposed digital license, executor quiescence | OPEN/BLOCKING |
| P1 | AUD-P1-01 | [#5](https://github.com/sergio-tr/ecommerce/issues/5) | SER-122 | Reservation FSM and StockPool capacity conservation | OPEN |
| P1 | AUD-P1-02 | [#6](https://github.com/sergio-tr/ecommerce/issues/6) | SER-123 | Order vs CheckoutProcess vs Payments ownership; concrete FSM without new global status aggregate | OPEN |
| P1 | AUD-P1-03 | [#7](https://github.com/sergio-tr/ecommerce/issues/7) | SER-124 | accepted alternative-D policy; numerical deadlines, retries and guards not ratified as full protocol | OPEN |
| P1 | AUD-P1-04 | [#8](https://github.com/sergio-tr/ecommerce/issues/8) | SER-125 | single test merchant for first slice versus later Connect, capture and enforced methods | OPEN |
| P1 | AUD-P1-05 | [#9](https://github.com/sergio-tr/ecommerce/issues/9) | SER-126 | D-05-MONGO transactions, journaling, commit-unknown and recovery | OPEN |
| P1 | AUD-P1-06 | [#10](https://github.com/sergio-tr/ecommerce/issues/10) | SER-127 | all-or-nothing multiline reserve/commit and preparation before reveal | OPEN |
| P2 | AUD-P2-01 | [#11](https://github.com/sergio-tr/ecommerce/issues/11) | SER-128 | domain versus provider naming/authority glossary | OPEN |
| P2 | AUD-P2-02 | [#12](https://github.com/sergio-tr/ecommerce/issues/12) | SER-129 | actual provider expiration; 35m/two-Session are NOT ratified universal defaults | OPEN |
| P2 | AUD-P2-03 | [#13](https://github.com/sergio-tr/ecommerce/issues/13) | SER-130 | requirement → source/ADR → contract → test/oracle → evidence traceability | OPEN |

These **13 are the existing work**; no duplicate replacements. Their titles, checklists, statuses and priorities remain normative as currently recorded. Reviewing a design alternative does not close an issue or imply executed tests.

## Cross-cutting design packages not to lose

- **M00.1:** D-01..D-07, the four P0 protocols and exact safe-fail external effect operations, D-05-MONGO, captures, retries, cancellation, account scope, incident/runbook; reconcile P1/P2 contracts.
- **M00.2:** StockPool/Reservation/unique DigitalLicense and encryption, last-unit/multiline atomicity, prepare-before-disclose, possible disclosure frontier and idempotent recovery.
- **M00.3:** TenantContext, user/guest claims, identity and session trust, OIDC/Keycloak, actor/resource/action permissions, cross-tenant negative scenarios.
- **M00.4:** context and aggregate owners, command/API/event contracts, Money/Quote/version semantics, idempotency keys, error taxonomies and portable public boundaries; no invented universal FSM.
- **M02/M03/M04:** finish milestone-specific G3 contracts before coding those capabilities. Optional or later decisions must be explicitly scoped/deferred, not silently considered complete.
- **Provenance:** review `docs/planning/wave1/DECISION_BACKLOG.md` (103 planning questions, including 73 provisional PLAN-DEC entries), deduplicate/reconcile their classifications and hard prerequisites; preserve 181 original historical decisions, 91 scoped decisions and 140 M04 CAP selections. Reconcile 110 source-test oracles; 148 original experiments remain planned until genuinely executed.

## Exact ordered next actions

1. **Audit register reconciliation:** for each #1–#13 compare original finding/acceptance versus merged PR #21 design proposals and current register. Make a matrix of what is *design-approved*, *contract-pending*, *deliberately deferred* and *requires G5*. Flag wrong historical branch/PR references without rewriting history.
2. **Foundational ownership:** finalize/ratify D-05-MONGO, M00.2 entity/transaction boundaries, Order/CheckoutProcess/Payments state semantics and immutable paid obligation.
3. **External-effects design:** produce precise P0 dispatch, unknown provider correlation, captured money, fulfillment/refund boundaries, failure/incident and proof-experiment specifications. No `UNKNOWN` may authorize unsafe charge, stock release or license exposure.
4. **Identity, tenant, Catalog and contracts:** specify M00.3/M00.4 and the relevant M02/M03 gates; document explicit exclusions/deferred decisions.
5. **Complete the 13-row traceability and the 103-question inventory** with status and unique owner; record signed acceptance/exceptions, gate status and outstanding physical test obligations.
6. **Human G3 design review:** the owner assesses whether the remaining unresolved design issues prevent *any* local product implementation under the design-first preference, or explicitly permits only an independent foundation as an exception. A gate decision is **not** G4 itself.
7. Only **after** design-first gate review, separately re-evaluate M01 DR07–DR10 and request an explicit G4 authorization for #25/SER-134. G4 is currently **NOT_GRANTED**.

## Empirical preflight received (not product code)

The local Cursor preflight reported **DR07 PARTIAL:** isolated mise Node 24.22.2 + pnpm 11.10.0; Nx/@nx/nest 23.3.1, Nest core 11.2.8, Nest CLI 11.0.24, TS 5.9.3, RxJS 7.8.2, reflect-metadata 0.2.2; clean install and frozen lock PASS, Nx executable requires declared pnpm `allowBuilds` and works when allowed. Actual product generator NOT_RUN. **DR08 PASS** Ubuntu 22.04.5/WSL2 and host resources, Docker 29.1.3 available; K8s not required for bootstrap. **DR09:** GitHub #25 + Linear SER-134 linked, main observed `8140b1101d50757438b37973476dad4e14c43762` at preflight; recheck at branch creation. **DR10 NOT_AUTHORIZED**. No AC01–AC14 actual product acceptance runs.

## Critical distinction: design sign-off versus verification

P0 audits may remain OPEN/BLOCKING as *empirical verification* items after an exact, explicitly ratified specification exists. G5 Stripe/Mongo/fault-injection evidence must never be manufactured to unblock a pre-code gate. If a design cannot safely determine the corresponding contract, it remains an actual design blocker. There is no automatic approval, issue closure or change of the audit status from this gate alone.

**No code, providers, infrastructure, deployment, PR merge or payment execution authorized here.**
