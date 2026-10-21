# CommerceCore — Wave 1 Validation and Planning Baseline

**As of:** 2026-10-21. **Accountable owner:** @sergio-tr. **State:** PARTIALLY VALIDATED; REVIEW REQUIRED. **Implementation authorization:** NONE.

Wave 1's first nine files were reviewed against their actual GitHub content, the historical/scoped decision records, source manifest and test catalog. The review and corrective artifacts are linked here. W1-AP-01,03,04,05 have explicit scope-limited approvals. W1-AP-02 preserves M00–M09 and **does not approve M00.5**. None authorizes implementation or closes M00.1.

## Begin with the validated findings

1. [Substantive validation report](VALIDATION_REPORT.md) — 16 recorded issues with exact paths, evidence, corrected versus open status.
2. [Approval record](APPROVAL_RECORD.md) and [JSON](approval-record.json) — exact W1-AP-01..05 outcomes; [approval packet](APPROVAL_PACKET.md) mirrors accepted decisions.
3. [M04 capability inclusion/exclusion matrix](M04_SCOPE_MATRIX.md) — 140 IDs; INCLUDED 73 (including prerequisites), EXCLUDED 30, DEFERRED 8, UNRESOLVED 29; not 140 individual ratifications.
4. [Source and test reconciliation plan](RECONCILIATION_PLAN.md) — R1/user ratification fidelity, canonical ID crosswalk and 110 reconstructed test entries.
5. [Wave 2 architecture work packages](WAVE2_WORK_PACKAGES.md) and [JSON](wave2-work-packages.json) — 13 proposed risk/dependency-aligned work packages, including next original AUD-P1-03 review.
6. [G0–G6 readiness gates](READINESS_GATES.md) and [current evidence/status checklist](readiness-status.json) — accepted governance with measurable, outstanding verification criteria.

## Original nine-file Wave 1 working baseline (updated where needed)

- [Baseline assessment](BASELINE_ASSESSMENT.md) — source/status integrity and remaining gaps.
- [Functional inventory](FUNCTIONAL_INVENTORY.md) and [structured 140-entry catalog](functional-inventory.json). All source IDs resolve to known decision IDs, but **clause-level provenance is not yet validated**.
- [Decision/dependency backlog](DECISION_BACKLOG.md) and [structured 103-entry catalog](decision-backlog.json) — 30 existing canonical items, 73 planning-only, 14 overlapping existing work; five original hard-dependency cycles corrected.
- [Planning hierarchy](PLANNING_HIERARCHY.md) — no duplicate audit issues, only reviewed topic-branch/PR changes.

## Core invariants and open proof

Financial correctness, Inventory capacity conservation, unique DigitalLicense ownership, tenant isolation and durable recovery remain non-negotiable. The four AUD-P0-01..04 findings remain OPEN / BLOCKING. D-05-MONGO, capture mode, Stripe post-dispatch negative proof and fulfillment/refund quiescence are not physically specified or verified. Every original checkout/audit experiment remains TEST_PLANNED, none VERIFIED.

## Existing source-of-truth and tracking

- Historical [181 R0.x selections](../../01-historical-baseline/R0.10_181_decisions.md) and [83 scoped records](../../02-decisions/decision-register.json) are unchanged.
- Original [19-source manifest](../../00-governance/SOURCE_MANIFEST.md) records hashes but a SHA is not clause-level proof.
- Existing AUD finding mappings [GitHub #1..#13 / Linear SER-118..SER-130](../../06-planning/LINKED_ISSUES.md) remain used. English recovery [GitHub #14](https://github.com/sergio-tr/ecommerce/issues/14)/[SER-131](https://linear.app/sergiotr/issue/SER-131) is reused; no new implementation issues, Slack messages or Linear tasks are created.
- Current review: draft [PR #17](https://github.com/sergio-tr/ecommerce/pull/17), independent feature/ser-131-wave1-planning-foundation branch stacked on the English-baseline branch, **not merged**.

## Next controlled decision

Review the 29 UNRESOLVED M04 capability-scope rows and the three mixed-scope entries, then address the historical unratified AUD-P1-03 review as the next architecture question. Begin Wave 2 contracts only in the documented dependency order; architecture-policy ratification remains separate from actual implementation and evidence.
