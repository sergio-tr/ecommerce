> **2026-11-18 isolated volume key:** On `8e34cc7083f0b33cfec6e52bdc402016569d1fa5` the owner isolated T01 exited 1 before Mongo started. `config --volumes` prints logical key `t01-data`, and the physical name is `commercecore-mongo-t01-data`. The same SHA `--resume` exited 0 and revalidated T02–T09, with `v8.0.38`, the live volume kept, `t01=NOT_CLAIMED`, and `g5: NOT_CLAIMED`. G5 is not claimed. Neither named volume was deleted.

> **2026-11-18 isolated clean T01:** The owner reported `bash tools/mongo/mongo-smoke.sh --resume` on `15e46e5f94e1b21b517a7b673240079914a14508` with exit 0. That report revalidated T02–T09, with `t01=NOT_CLAIMED`, `matrix=NOT_CLAIMED`, and `g5: NOT_CLAIMED`. It is not a clean T01 and not G5. `tools/mongo/mongo-t01-isolated.sh` is a separate Compose project on `127.0.0.1:27018` with volume `commercecore-mongo-t01-data`. The canonical Compose file still names `commercecore-mongo-data` and `127.0.0.1:27017`. The isolated command does not delete `commercecore-mongo-data` or `commercecore-mongo-t01-data`. If that isolated volume, container, network, or project already exists, the command stops before Docker is changed. It has not been run here. G5 is not claimed.

> **2026-11-18 smoke correction, local Compose only:** The owner WSL2 run on `92a8f7d1a541fd0a465a0976504a9b2196f1d2a3` reached `mongo-up: PASS` and then `anonymous ping succeeded`, exit 1. Ping is not the authorization oracle. The same run left `commercecore-mongo-data` in place. Docker 29 did not install the `127.0.0.1:27017` publish while the only network was internal: `NetworkSettings.Ports` was `{"27017/tcp":null}`. T01 is not passed. T02–T09 stay `NOT_RUN`. G5 is not claimed. R1 and the loopback-only bind stay. The volume was not deleted.

> **2026-11-18 scoped G4, local Compose only:** [M01-MONGO-01](M01_MONGO_INFRA_G3_PROPOSAL.md) stays `G3_ACCEPTED_2026-11-17`. K2 stays the application runtime. The M01-D05 StatefulSet and PVC stay specified and unbuilt. G4 request `G4-REQUEST-2026-11-17-M01-MONGO-INFRA-01` is `G4_EFFECTIVE_SCOPED` on `main` `ae55c22aa82a8148bfeea3bcb867d85ecf4a5b19`. Push [Actions run 44246479138](https://github.com/sergio-tr/ecommerce/actions/runs/44246479138) concluded `success` for `validate`, `chart`, and `image`. T01–T09 stay `NOT_RUN`. This is not G5. `D-05-MONGO` stays PENDING. AUD-P0-01..04 stay OPEN/BLOCKING and the 148 experiments stay `TEST_PLANNED/NOT_RUN`.

> **2026-11-18 image pin, local Compose only:** [M01-MONGO-01](M01_MONGO_INFRA_G3_PROPOSAL.md) is `G3_ACCEPTED_2026-11-17` for that task's local Docker Compose infrastructure. K2 stays the application runtime. The M01-D05 StatefulSet and PVC stay specified and unbuilt. The Compose pin is the OCI index `docker.io/library/mongo:8.0.38-noble@sha256:76a93cc399d05709baeea4e55385749657aa0085ad5b497c851380778eccea2c`. G4 request `G4-REQUEST-2026-11-17-M01-MONGO-INFRA-01` is `READY_PENDING_MERGE` and not effective until that pin change is merged and its CI is green. `D-05-MONGO` stays PENDING. AUD-P0-01..04 stay OPEN/BLOCKING and the 148 experiments stay `TEST_PLANNED/NOT_RUN`.

> **2026-11-17 owner decision:** [M01-K8S-01 listen address](M01_K8S_01_LISTEN_ADDRESS_DECISION.md) is `G3_ACCEPTED_2026-11-17` as LISTEN-B. Scoped G4 covers the local image, Helm chart, and k3d smoke only. Scoped local K8S G5 is `PASSED` for one k3d server and `GET /health/live` only: the owner reported a WSL2 `k3d-smoke: PASS` with `exit=0` on `affde2ce87e7569595598f7bc116819e65a67785`, [PR #48](https://github.com/sergio-tr/ecommerce/pull/48) merged that record at `09964e53bad53899856415eeae886663d096061f`, and the push CI of that merge succeeded. The smoke is owner-reported, not an agent run. Catalog G4 stays `NOT_GRANTED`. AUD-P0-01..04 stay OPEN/BLOCKING and the 148 experiments stay `TEST_PLANNED/NOT_RUN`.

> **2026-11-17 owner decision:** [synthetic catalog slice](M01_CATALOG_SYNTHETIC_SLICE_G3_G4_PROPOSAL.md) is `G3_ACCEPTED_2026-11-17` and `G4_NOT_GRANTED`. The contract is accepted. The routes stay unbuilt because the next planned slice is M01-K8S-01. AUD-P0-01..04 stay OPEN/BLOCKING and the 148 experiments stay `TEST_PLANNED/NOT_RUN`.

> **2026-11-16 accountable owner design-first review disposition:** [AUTH-2026-11-16-M01-BOOTSTRAP-01](OWNER_G3_G4_AUTHORIZATION_2026-11-16.md) explicitly **PASSES G3 for the M01 engineering foundation only**, by accepting conservative, individually traceable deferrals of outstanding commercial/physical work; task-specific **G4 for #25/SER-134 is GRANTED**, effective only after this authorization merges to main. This *discharges the original blanket design-first hold for that independent foundation* but **does not ratify 73 provisional planning choices, pending FSM/Stripe/physical Mongo details, or tests**. Original P0 #1–4 remain OPEN/BLOCKING; other original unresolved findings stay at their real status, #11 was owner-closed separately, 148 original experiments NOT_RUN. Subsequent milestones each require exact G3/G4 and G5 proof. [M01 execution boundaries](../architecture/m01/M01_BOOTSTRAP_01_CURSOR_HANDOFF.md). Historical NO-GO snapshots below retain their original date and are superseded solely for this M01 slice.

> **5 Nov 2026 independent review:** [PR #29 review record](PR29_INDEPENDENT_ARCHITECTURE_REVIEW_2026-11-05.md) keeps every original audit open, records which acceptance criteria are still unmet, and does not lift this gate or grant G4.

> **5 Nov 2026 material follow-up:** [Stripe provider/API-version and session clock contract](../architecture/m00/AUD_P1_04_P2_02_STRIPE_API_COMPATIBILITY_AND_TIME_POLICY.md) corrects the deprecated `payment_method_types` recommendation for recent API versions, requires version-pinned `allowed_payment_method_types`/verified Link+wallet control, and retains optional 35-minute Session as unratified. [Original M00.1-R1 indexed source section-by-section crosswalk](../planning/wave1/M00_G3_R1_ORIGINAL_SECTION_DECISION_CROSSWALK.md) now accounts for 90 original numbered headings from 1,513 indexed lines, including superseded FSMs, later policies and unresolved proof; full clause-level owner-ratification audit remains required. G3 is NOT automatically accepted; M01 G4 still NOT_GRANTED.

> **Further G3 review candidates:** [AUD-P1-01 stock/reservation model](../architecture/m00/AUD_P1_01_STOCK_RESERVATION_CAPACITY_CONTRACT.md) and [AUD-P1-02 commercial obligation / coordinator / financial facts](../architecture/m00/AUD_P1_02_ORDER_CHECKOUT_PAYMENT_COORDINATION_CONTRACT.md) now include concrete owner-local operations and negative race oracles; still exact-ID ratification + G5 PENDING. Added in draft PR #29, no G4.

> **Issue closure verification (2026-10-30, proposed):** merged PR #28's 13-audit drafting work is historic; GitHub #14 and #24 have been closed with evidence, but **#27 remains OPEN** and SER-135 has been restored to In Progress. Exact-owner signoffs/source crosswalk and G3 are distinct from a merged docs PR. See [eligibility matrix](ISSUE_CLOSURE_AUDIT_2026-10-30.md), [full terminology contract](../architecture/m00/AUD_P2_01_EXACT_GLOSSARY_CONTRACT.md), [physical Mongo owner-local transaction candidate](../architecture/m00/D_05_MONGO_EXACT_OWNER_TRANSACTION_CONTRACT.md), and [140-cap source-reference audit](../planning/wave1/M00_G3_140_CAP_SOURCE_INTEGRITY.md). Nothing grants implementation G4, no audit VERIFIED.

> **Test-oracle authoring milestone:** The 110 existing AUD tests now have actual **draft English acceptance oracles** translated from the original indexed Spanish tables and a [110-case bilingual crosswalk](../05-tests/M00_G3_ORIGINAL_SOURCE_ORACLE_CROSSWALK.md). This replaces placeholder text but does **not** complete exact-owner semantic acceptance, source-byte verification or G5 test runs; 148/148 remain TEST_PLANNED/NOT_RUN.

> **Initial interface contract coverage:** [M00.4 public port and evolution candidates](../architecture/m00/M00_G3_PUBLIC_PORTS_AND_EVOLUTION_CONTRACTS.md) explicitly name cross-context operations, authoritative owner facts, error/UNKNOWN semantics, versioning and future-adapter seams; an owner review is required before treating any individual schema/port name as stable.

> **Architecture cross-check:** [M00_G3_RECOMMENDATION_REVIEW_LEDGER.md](M00_G3_RECOMMENDATION_REVIEW_LEDGER.md) records the actual 103/103 source-ID coverage check, all 13 GitHub/Linear audit links, alternative/reversibility review, independently researched vendor constraints, and unresolved exact-ID ratifications and source-oracle fidelity. This ledger does not close the G3 gate or infer G5.

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
