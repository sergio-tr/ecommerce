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

## Decision-ready Wave 1 scope review (2026-10-21)

- [29 individually unresolved capability recommendations](M04_29_DECISION_REVIEW.md) and [structured review](m04-29-decision-review.json): no previous UNRESOLVED state upgraded.
- [Composite capability decomposition](COMPOSITE_CAPABILITIES.md): CAP-PAY-012, CAP-EGAME-007 and CAP-EGAME-009, plus Catalog/Order/Audit variants, without allocating canonical child identifiers.
- [Minimum coherent digital-license purchase boundary](M04_MINIMUM_COHERENT_SCOPE.md): mandatory commercial and security steps versus deferrable UI/tenant/framework breadth.
- [Six approval batches](M04_APPROVAL_BATCHES.md), five covering the exact 29 items and a separate Stripe-methods composite check; [first batch](M04_APPROVAL_BATCHES.md) is catalog, Listing/Offer and explicit demo tax scope.
- [AUD-P1-03 decision-ready individual review](AUD-P1-03_DECISION_PACKAGE.md): option D preferred but NOT RATIFIED; source-derived invariants and test descriptions, P0 guards retained.
- [Updated source-fidelity status](SOURCE_RECONCILIATION_STATUS.md): original R0.10 plus eight audit hashes verified; 110 test IDs found in original reviews while semantic English-oracle reconciliation remains pending.
- [Wave 2 entry readiness](WAVE2_ENTRY_READINESS.md): independent documentary planning versus provider-proof-blocked packages.

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
- Previous [PR #17](https://github.com/sergio-tr/ecommerce/pull/17) was merged into the English baseline branch on 2026-10-30. Current 2026-10-30 scope/readiness changes are on independent `feature/m04-b01-approval-preimplementation-readiness` and are awaiting review in their own PR; not merged.

## Next controlled decision

Review the first decision batch W1-SCOPE-B01 (seven catalog/pricing scope items) and the independent AUD-P1-03 commercial retry-window package. All 29 scope rows remain UNRESOLVED in the original inventory until explicit ratification. Begin Wave 2 contracts only in the documented dependency order; architecture-policy ratification remains separate from actual implementation and evidence.
