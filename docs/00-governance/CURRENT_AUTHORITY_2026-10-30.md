# CommerceCore — Current authority and reconciliation (2026-10-30)

**Status:** DOCUMENTARY RECONCILIATION / REVIEW REQUIRED. **Owner:** @sergio-tr. **Base commit observed:** `17c0d0531cee8b5b5d3392c1dba7dc35f6234ad2`. This snapshot is not a substitute for runtime evidence, the canonical ADRs, or the decision/audit registers.

## Source-of-truth precedence

- Git `main` governs ratified ADRs, decision states, contracts, acceptance criteria, test catalogs and evidence. Proposed content on branches is not ratified by publication alone.
- Linear owns work tracking, assignees, priorities, blockers and task progress; it cannot amend accepted ADRs.
- GitHub Issues and PRs own code/document change traceability, review, merge and CI records. Historical PR descriptions describe the state **at authorship**, not current status.
- Slack #ecommerce is a notification and link index, not normative authority.
- Local host commands are **user-reported evidence**, not connector-run or independently replicated checks. No test can be marked VERIFIED from a proposed protocol.

## Current state verified by GitHub and Linear

- PR #19, #20, #21, #22 and #23 are MERGED into `main`. PR #23 merge SHA `17c0d0531cee8b5b5d3392c1dba7dc35f6234ad2`. Do not repeat old 'draft/unmerged' text as current operational state.
- M01-D01..D08 are DOCUMENTED, not implemented. K2 / NET-A / DATA-A / STRIPE-A are ACCEPTED architectural options. Helm subordinate specification is not an independently ratified protocol.
- M01-BOOTSTRAP-01 has AC01..AC14 planned, all NOT_RUN. DR01..DR06 documentary/policy covered; DR07 dependency cohort clean install PENDING; DR08 local host PARTIAL; DR09 identity now GitHub #25 / Linear SER-134, but the base for the **future implementation branch** must be rechecked; DR10 explicit task G4 authorization NOT_GRANTED.
- Financial AUD-P0-01..04 stay OPEN/BLOCKING for provider/driver/fault evidence. 148 original experiments remain TEST_PLANNED/NOT_RUN; no inferred provider proof.
- Historical R0.x 181 original selections, 91 scoped decisions, M04 CAP 85 INCLUDED / 43 EXCLUDED / 12 DEFERRED preserve their separately recorded status and provenance.
- SER-131 / GitHub #14 are documentary baseline, not an implementation task. SER-133 / GitHub #24 own reconciliation. SER-134 / GitHub #25 own implementation identity. Do not conflate these with Financial Platform work.

## User-provided local WSL preflight — partial DR08

Captured 2026-10-30 in WSL2; `uname -a`: Linux STR kernel 6.18.54.1-microsoft-standard-WSL2 x86_64; Node v22.23.1; pnpm 12.16.1; Git 2.34.1. Memory: 15 GiB total, 5.3 GiB available at capture; swap 4.0 GiB. Current filesystem: 1007 GiB, 860 GiB available, 11% used. No host Windows `wsl --status`, `wsl --list --verbose`, Docker, Corepack or actual Nx/NestJS dependency installation result was provided. Docker is not a bootstrap-01 prerequisite.

M01-D01 proposed cohort: Node 24.22.2, Nx 23.3.1, NestJS 11.2.8, TypeScript 5.9.3, pnpm 11.10.0 (Angular later). The current host Node 22/pnpm 12 **do not match the selected baseline**; this is a compatibility/preflight discrepancy, not proof of impossibility. Do not silently use latest packages or change approved versions. Confirm exact availability/peer compatibility and perform a clean frozen-lock installation when authorized.

## Discrepancy register

| ID | Problem | Correct interpretation | Required action |
| --- | --- | --- | --- |
| REC-01 | Old CURRENT_STATE addenda and PR bodies say PR #19..23 unmerged | Historical snapshots only; PR #19..23 merged | Put an explicit current top-level pointer in CURRENT_STATE; preserve history |
| REC-02 | Bootstrap DoR status sounds execution ready | Document ready for G4 review only; admission conditions unmet | Display NOT_READY_FOR_EXECUTION alongside outstanding DR07..10 |
| REC-03 | SER-131 Done might be read as implementation Done | Documentary baseline closed only | Crosswalk SER-131/#14, SER-133/#24, SER-134/#25 |
| REC-04 | Slack October 13 message predates October 30 decisions | Informational historical announcement | Publish new #ecommerce update with current Git reference and outstanding gates after review |
| REC-05 | Host Node 22/pnpm 12 differ from proposed Node 24/pnpm 11 | Version mismatch, peer install NOT_RUN | Preflight then lock toolchain and run install |
| REC-06 | Proposed financial protocols sometimes described as resolved audits | Documented protocols not verified external effects | Preserve P0 OPEN/BLOCKING and planned tests |

## Safe ordered handoff

1. Review this documentation PR; only user may authorize its merge.
2. Record full DR07 verified package/peer matrix and local frozen install, and remaining DR08 host checks; no Docker/Kubernetes required for bootstrap-01.
3. DR09: crosswalk issue #25 / SER-134; obtain **fresh** `main` SHA and create `feature/*` implementation branch only after readiness and approval. Existing #24/SER-133 are docs-only.
4. DR10: record explicit G4 human authorization for M01-BOOTSTRAP-01. No such authorization is assumed here.
5. Implement only Nx/pnpm workspace, NestJS `commercecore-api` with `/health/live`, pure domain library, architecture-negative tests, quality scripts, minimal PR CI and English onboarding. Verify AC01..AC14, attach real outputs and keep unmerged PR for review.
6. Plan separate, authorized M01 images/Helm, k3d/K3s networking, Mongo/PVC and restore steps; then M02/M03/M04 with M00.2–M00.4 and P0 proof dependencies.

**No runtime code, Kubernetes, MongoDB, Stripe operation, installation or G5 proof was performed by this reconciliation.**
