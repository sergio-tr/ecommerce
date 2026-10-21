# Wave 1 — Baseline and Product Scope

**Owner:** @sergio-tr. **Snapshot:** 2026-10-21. **Decision state:** REVIEW DRAFT. **No implementation or implementation-ready ticket is authorized.**

This documentation package is the first of the approved four-wave planning activities. It **does not** introduce new ratified domain decisions or resolve the four M00.1 P0 findings.

## Deliverables

| Artifact | Contents | Decision maturity |
|---|---|---|
| [BASELINE_ASSESSMENT.md](BASELINE_ASSESSMENT.md) | Reconciliation of historical and scoped decisions, 19 source hashes, current audits, 148 tests, conflicts and source-fidelity gaps | Read-only findings |
| [FUNCTIONAL_INVENTORY.md](FUNCTIONAL_INVENTORY.md) + [JSON](functional-inventory.json) | 140 proposed capability inventory entries covering CommerceCore, CommerceCloud, eGame, identity, administration, engineering, distribution and operations | Scope NOT RATIFIED |
| [DECISION_BACKLOG.md](DECISION_BACKLOG.md) + [JSON](decision-backlog.json) | 103 decision/specification work packages: 30 existing canonical IDs and 73 new **planning-only** questions, each with owner, deadline gate, dependency, spec and validation | NO NEW ADR ACCEPTED |
| [PLANNING_HIERARCHY.md](PLANNING_HIERARCHY.md) | Requirements, ADR, specs, epic, Linear/GitHub, branches, tests and evidence relationships across M00–M09 | PROPOSED |
| [READINESS_GATES.md](READINESS_GATES.md) | Objective G0–G6 checks for baseline, scope, ADRs, specs, implementation issue, executed verification and live money | PROPOSED |
| [APPROVAL_PACKET.md](APPROVAL_PACKET.md) | Five individual approval questions; M04 feature scope comes first | ALL PENDING |

## Scope classification in the candidate inventory

- 53 M04_REQUIRED_DIRECTION: source-derived prerequisites of a coherent first digital purchase, not completed technical specifications or implementation authorization.
- 20 M04_CANDIDATE: possible first-slice features awaiting explicit approval.
- 34 PRE_M04: prerequisite domains and engineering designs, not automatically approved implementation.
- 25 POST_M04: candidate later features.
- 8 DEFERRED: preserve historical later/out-of-scope treatment.

Any newly inferred feature is labeled PROPOSED_SCOPE, not ACCEPTED.

## Baseline status not changed

Historical 181 records (26 ACCEPTED, 155 PROPOSED — SELECTED); 83 currently scoped records; 13 audit findings (four P0 OPEN / BLOCKING); 148 TEST_PLANNED and zero VERIFIED. The current catalog explicitly reconciles only 38 test titles to original source tables: the other 110 require source-specific audit before claiming complete test coverage. No final M00.1-R2, final Inventory/Ordering FSM, or supplier-specific negative proof is assumed.

## Original issue reuse

AUD-P0-01..04: GitHub #1..4 / Linear SER-118..121. AUD-P1-01..06: GitHub #5..10 / Linear SER-122..127. AUD-P2-01..03: GitHub #11..13 / Linear SER-128..130. English source recovery: GitHub #14 / Linear SER-131. **No additional GitHub, Linear or Slack item was created just by writing this package.**

## Review order

1. Review and ratify M04 scope W1-AP-01.
2. Review milestone taxonomy and proposed M00.5 gate W1-AP-02.
3. Review scope/identifier policy W1-AP-03 and readiness G0–G6 W1-AP-04.
4. Review source-reconciliation work and issue reuse W1-AP-05.
5. Resume AUD-P1-03 as the next unratified individual audit. Keep financial P0s open.

## Change governance

All artifacts must be English. Use independent feature/*/bugfix/* branches, conventional type(scope): commit subjects, PR review and @sergio-tr accountable ownership. Do not put assistant or tool co-author credit in commits. The current Wave 1 branch was created from the still-reviewable English-baseline branch, so its PR should target that branch rather than implying main already includes all historical recovered material.
