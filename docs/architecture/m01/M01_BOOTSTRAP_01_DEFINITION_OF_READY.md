# M01-BOOTSTRAP-01 — Final Definition of Ready and Atomic Implementation Contract

**Status:** `DOR_SPECIFICATION_FINALIZED / DESIGN_FIRST_HOLD / NOT_READY_FOR_IMPLEMENTATION` (not `G4_AUTHORIZED`, `IMPLEMENTED` or `G5_PASSED`).
**Accountable owner:** @sergio-tr. **Scope:** independent, local, non-financial engineering foundation.
**Date:** 2026-10-30. **Source:** accepted ADR-M01-001 K2/NET-A/DATA-A/STRIPE-A; M01-D01–D08 design specs.
**Work-item identity:** `M01-BOOTSTRAP-01` is now tracked by [CommerceCore GitHub #25](https://github.com/sergio-tr/ecommerce/issues/25) and [Linear SER-134](https://linear.app/sergiotr/issue/SER-134). Historical documentary baseline SER-131/#14 is not the implementation identity.
**Implementation authorization:** NO. **Actual execution:** NOT_RUN.

## 2026-10-30 design-first sequencing hold (supersedes immediate bootstrap recommendation)

The owner has clarified that the 13 original design issues must not be skipped to begin code. [M00-G3 design gate](../../00-governance/DESIGN_FIRST_G3_GATE.md), [GitHub #27](https://github.com/sergio-tr/ecommerce/issues/27) and [Linear SER-135](https://linear.app/sergiotr/issue/SER-135) are a **separate required pre-G4 governance review**, even though a pure Nx/Nest bootstrap has no financial runtime dependency. The architecture gate requires reviewed/ratified or explicitly scoped/deferred contracts; do **not** fabricate Stripe/Mongo/worker G5 proof before implementation. No feature implementation branch, generated workspace or application code is authorized. DR07 PARTIAL, DR08 PASS, DR09 issue identity confirmed/base recheck at future launch, DR10 NOT_AUTHORIZED; AC01–AC14 NOT_RUN. The preflight owner reported Ubuntu 22.04.5 WSL2, isolated mise Node24.22.2/pnpm11.10.0 peer/frozen lock smoke PASS, pnpm allowBuilds required, actual Nx app generator NOT_RUN. The earlier DR07–DR09 checklist values below are historical as-written, superseded for current execution by this dated addendum.

## Exact goal (one observable outcome)

A **clean clone** of `sergio-tr/ecommerce`, after an explicitly authorized feature branch is opened from the reviewed main, can install a pinned Nx/pnpm TypeScript workspace, build a minimal NestJS CommerceCore API and a pure framework-free Domain library, run deterministic unit + architecture-boundary tests, and report reproducible GitHub Actions checks. It does **not** need a Kubernetes cluster, MongoDB or Stripe to complete this first change.

## Why this is the first slice

It tests the highest-leverage integration assumptions (Node/Nx/Nest/pnpm, import boundaries, code quality and CI) without entangling financial state, host Kubernetes setup, MongoDB physical transactions or authentication protocols. It directly enables M01-K8S-01 and M01-DATA-01 later.

## Included output (implementation deliverables, NOT presently created)

1. Root `package.json`, `pnpm-workspace.yaml`, exact `packageManager` version, `pnpm-lock.yaml`, one Node runtime lock file and a verified compatibility decision attached to the task.
2. Nx workspace configuration and explicit project graph with a **single** initial `apps/commercecore-api` NestJS composition root (no CommerceCloud/eGame scaffold in this first atomic change).
3. One pure `libs/commercecore/catalog/domain` teaching example: an immutable `ProductId` or similarly nonfinancial validated value object and at least one unit test. **Do not imply full Catalog aggregate/business model was implemented.**
4. One HTTP endpoint `GET /health/live` returning static nonsecret response and build version. `/health/ready` may be added only if it can clearly distinguish readiness and stay independent of absent MongoDB.
5. Nx/ESLint architecture import restrictions and executable negative test fixture that intentionally imports NestJS into pure Domain and must fail.
6. Formatting/lint/typecheck/build/unit and architecture scripts with documented commands and coherent Nx targets.
7. Minimal GitHub Actions PR validation with `permissions: contents: read`, pinned external action commit SHAs, frozen pnpm install and no provider/deployment secrets.
8. English `docs/development/LOCAL_BOOTSTRAP.md` with toolchain, installation, run/test commands, failure diagnostics and branch/commit policy.

**No other functionality, application runtime or integration is in scope.** README and ADRs may be referenced, not silently rewritten to mark payments completed.

## Explicit exclusions and forbidden side effects

- No creation of Stripe merchant accounts, Customer objects, Sessions, Charges, Refunds or webhook traffic.
- No Kubernetes `Deployment`, Helm chart, local k3d cluster or secret resource in this work item; those are M01-K8S-01 after D03/D04/D06 review.
- No MongoDB server, ReplicaSet, user or StatefulSet in this work item; M01-DATA-01 follows D05.
- No CommerceCloud or eGame application generation in this first task, except documenting their eventual workspace slots.
- No licensed game keys, Inventory mutation, Cart/Order FSM, finance saga, identity service or AI/agent contributor metadata.
- No commit/merge to main directly. No public npm release, paid cloud or live mode.

## Exact DoR checks (contract completeness)

| Check | Required state before G4 |
|---|---|
| DR01 | Scope and explicit excluded effects enumerated above — **MET DOCUMENTARILY** |
| DR02 | Owner @sergio-tr, ADR-M01-001, M01-D01/D02/D06/D07/D08 links — **MET DOCUMENTARILY** |
| DR03 | Task does not require unresolved M00 financial P0 contracts — **MET DOCUMENTARILY** |
| DR04 | Desired packages, artifacts and quality checks enumerated — **MET DOCUMENTARILY** |
| DR05 | Positive and adversarial Given/When/Then acceptance below — **MET DOCUMENTARILY** |
| DR06 | Approved feature branch and git/workflow policy — **MET AS POLICY**; branch for future code NOT CREATED |
| DR07 | Final exact version metadata and peer dependencies validated, especially Node24/pnpm/Nx23/Nest11/TS5.9 — **PENDING ACTUAL REGISTRY/LOCAL SMOKE** |
| DR08 | User's actual OS/WSL, Node availability and available disk verified for scaffold — **PENDING HOST OBSERVATION**; k3d hardware budget not required for this first task |
| DR09 | Current reviewed base commit selected and exact implementation issue crosswalk established — **PENDING AT AUTHORIZATION**; reuse SER-131/#14, avoid duplicate |
| DR10 | Explicit user instruction authorizing M01-BOOTSTRAP-01 code — **PENDING G4**, absent in this request |

**DoR policy:** DR01–DR06 are defined and met at the specification level. DR07–DR10 are *named admission conditions*. Therefore the **Definition of Ready document is finalized**, but the **task must NOT be marked fully READY_TO_IMPLEMENT or G4_APPROVED yet**. Do not conflate a complete checklist with evidence that the checklist passed.

## Acceptance criteria for the future implementation (Given/When/Then)

| ID | Given / When | Then |
|---|---|---|
| AC01 | clean clone + pinned Node/pnpm; run frozen install | exit code 0 and lockfile unchanged |
| AC02 | run Nx graph | single Core app + domain lib present, dependency graph acyclic |
| AC03 | run package build and typecheck | return 0, no unused direct Node/Stripe/Mongo runtime dependency in Domain |
| AC04 | start NestJS API with no DB or Stripe | `GET /health/live` responds 200 with nonsecret version information |
| AC05 | run pure value-object unit tests with valid and invalid IDs | assertions pass; invalid value rejected with typed error |
| AC06 | intentionally add forbidden NestJS Domain import fixture | architecture check fails; removal returns green |
| AC07 | intentionally import CommerceCloud private adapter from Domain | architecture rule rejects when a test fixture exists |
| AC08 | run lint, formatting check, typecheck and tests through supported Nx targets | all checks pass and are reproducible |
| AC09 | trigger PR CI in independent feature branch | job logs report actual versions and commit, checks not silently skipped |
| AC10 | simulate missing/invalid public configuration | app fails safely with no credential disclosure |
| AC11 | scan image? **N/A** (no image in scope); scan repository/test artifacts | no `sk_test`, `sk_live`, raw activation keys or private env files |
| AC12 | inspect git diff | no Helm/K8s/Mongo/Stripe, business aggregate or main mutation |
| AC13 | inspect commit/PR metadata | author @sergio-tr, Conventional Commits, no agent `Co-authored-by` trailers |
| AC14 | build with exact lock/version after isolated clean setup | same build/check outputs (within normal timestamps) and unchanged dependencies |

**All AC tests are `TEST_PLANNED / NOT_RUN`.** Passing after future coding is required before claiming the task's G5 outcome.

## Planned step sequence after G4 authorization

1. Re-check current main and select an independent `feature/m01-bootstrap-workspace` branch.
2. Verify registry metadata/peers and lock Node/pnpm/Nx/Nest/TypeScript **without forcing broken peer resolution**.
3. Generate Nx/pnpm workspace with one Nest API and one Domain lib; preserve all existing docs/ADRs.
4. Add architecture constraints and a failing negative import test, then confirm it passes after removing invalid import.
5. Add minimal `/health/live`, safe logging/config, unit tests, build/typecheck/lint/format targets.
6. Configure minimal restricted GitHub Actions checks with reviewed action commit SHAs.
7. Run and capture evidence; open a PR linking this specification and original governance IDs. **Do not merge without independent authorization.**

## Current precise next user action

1. Review this final DoR and M01-D01–D08 document set; accept any preferred changes.
2. **Provide or inspect actual local version/host prerequisites**. A short command report (`node -v`, `pnpm -v`, `docker version`, `wsl --status`, CPU/RAM/disk) is useful; only Node/pnpm and disk/OS environment are hard prerequisites to the first bootstrap, Docker/Kubernetes can be checked before M01-K8S-01.
3. Authorize the exact first code task in a subsequent turn, and permit linking/reusing the correct Linear/GitHub issue identity.
4. Implement and verify the defined AC01–AC14 locally; only then mark implemented/tested.

## Non-goals

This DoR does **not** close any of four AUD-P0 financial evidence blockers, does not establish API/event contract G3 for M02–M04, and does not authorize deployment or purchases.

See [M01 readiness and dependency report](M01_REMAINING_GAPS_AND_DEPENDENCIES.md) for the whole ecosystem.
