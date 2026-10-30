> **Oracle reconciliation progress:** [110 original audit source rows matched and draft English oracles authored](../../05-tests/M00_G3_ORIGINAL_SOURCE_ORACLE_CROSSWALK.md). All initial 148 experiment results remain NOT_RUN; bilingual exact-owner review and independent original-byte rehash remain outstanding.

> **2026-10-30 G3 proposal coverage:** [M00_G3_PLANNING_RECOMMENDATIONS.md](M00_G3_PLANNING_RECOMMENDATIONS.md) now provides an individually tailored recommendation for **all 103 existing planning IDs** (13 audits, 17 other canonical topics, 73 PLAN-DEC). This is a **reviewable, changeable initial design**, not 103 ratifications or 103 newly created issues. See the [13 audit contracts](../../architecture/m00/M00_G3_ALL_13_AUDITS_RECOMMENDED_CONTRACTS.md), [reference architecture](../../architecture/m00/M00_G3_EVOLVABLE_REFERENCE_ARCHITECTURE.md) and [design gate](../../00-governance/DESIGN_FIRST_G3_GATE.md). All proof and owner-signoff states remain honest.

# CommerceCore — Current Planning Decisions (2026-10-30)

**Current:** all 140 M04 capability-scope decisions classified (85 INCLUDED, 43 EXCLUDED, 12 DEFERRED), source fidelity incomplete, and audited financial/fulfillment contracts still blocked. **Owner:** @sergio-tr. **No implementation authorization.**

## Read these current decisions first

1. [Consolidated approved recommended directions](RECOMMENDED_DECISIONS_APPROVAL.md) — user-approved W1-SCOPE-B01-TAX, B02–B06, M01-A direction and AUD-P1-03 alternative D.
2. [Current 140-capability M04 scope matrix](M04_SCOPE_MATRIX.md) and [structured inventory](functional-inventory.json).
3. [Canonical current scoped decision register](../../02-decisions/decision-register.json) — original 83 rows preserved as individual records, eight new approved-direction rows appended, and explicit AUD-P1-03 policy changes.
4. [Remaining work and proof obligations](REMAINING_WORK_REGISTER.md) — contracts, authentic source evidence and tests still required before G3/G4/G5.
5. [Local pre-implementation readiness](PREIMPLEMENTATION_READINESS.md) and [M01 technical foundation direction](M01_LOCAL_FOUNDATION_PROPOSAL.md).
6. [AUD-P1-03 approved policy with pending execution protocols](AUD-P1-03_DECISION_PACKAGE.md).
7. [Triage of 14 overlapping planning work items](PLANNING_DEDUPLICATION_REVIEW.md) — seven refinements and seven distinct specification deliverables, no new issues.
8. [Original Wave 1 validation](VALIDATION_REPORT.md), [reconciliation plan](RECONCILIATION_PLAN.md), [Wave 2 work packages](WAVE2_WORK_PACKAGES.md) and [composite capabilities](COMPOSITE_CAPABILITIES.md).

## Historical, not current decisions

The original [29-case review](M04_29_DECISION_REVIEW.md), [B01 ratification](B01_RATIFICATION_RECORD.md), [approval batches](M04_APPROVAL_BATCHES.md) and [initial Wave 1 approval](APPROVAL_RECORD.md) are retained for provenance. Earlier PENDING/UNRESOLVED wording in their historical analysis sections refers to the **older 2026-10-21 source snapshot** and is superseded only where the current ratification expressly says so.

## Current safety and release state

- Four P0 findings: AUD-P0-01..04 OPEN/BLOCKING, with accepted architectural directions.
- AUD-P1-03 option D **policy ACCEPTED**, overall finding OPEN pending deadline values, admission protocol and provider proof.
- D-05-MONGO, capture/Connect, financial dispatch/recovery, capacity/license quiescence and guest security concrete protocols remain pending.
- G0 source reconciliation incomplete; G1 functional scope classifications selected but evidence coverage incomplete; G3 financial contracts blocked; G4 implementation not authorized; G5 tests not verified; G6 live money not authorized.

## Pull-request sequence

PR #17 was already merged into the English-baseline branch. PR #18 closed without merge as redundant direct-to-main. PR #19 is the baseline-to-main review. PR #20 is the unmerged scoped decision addendum targeting the baseline branch. Do not merge PR #19 or #20 without an explicit user instruction to do so.
