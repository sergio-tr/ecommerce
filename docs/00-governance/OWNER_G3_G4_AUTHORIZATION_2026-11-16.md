# Owner authorization — scoped M00-G3 review and M01-BOOTSTRAP-01 G4

**Decision ID:** `AUTH-2026-11-16-M01-BOOTSTRAP-01`  
**Recorded:** 2026-11-16, Europe/Madrid  
**Accountable owner:** @sergio-tr  
**Source:** owner's explicit instruction in the ongoing project orchestration, 2026-11-16: "Aprueba los gates y termina de manera conjunta con toda la base documental para poder comenzar a implementar el proyecto."  
**Status:** `ACCEPTED_FOR_M01_FOUNDATION_ONLY`  
**GitHub:** [design review #27](https://github.com/sergio-tr/ecommerce/issues/27), [implementation #25](https://github.com/sergio-tr/ecommerce/issues/25)  
**Linear:** SER-135 / SER-134  
**Base reviewed at authorization:** `78f06e5fc848e11794a0c5a18908a5a86a2eba3c` (`main` before this authorization PR). **Implementation must use the HEAD of `origin/main` after this approved authorization is integrated**, never blindly branch from the old observed SHA.

## Exactly what is approved

1. **M00-G3 — PASS, scoped exclusively to the noncommercial M01 engineering foundation.** The owner has reviewed the design-first sequencing and expressly accepts a **milestone-specific deferment** of unresolved financial, inventory, identity, provider, license, physical Mongo and future-service details. These are not removed from the architecture; they retain their existing exact IDs, scope and future approval gates. This ends the design-first *sequencing hold* **for M01-BOOTSTRAP-01 only**. It is not global architectural freeze or approval of every outstanding proposed FSM/protocol.
2. **M01 G4 — GRANTED, only for GitHub #25 / Linear SER-134 / `M01-BOOTSTRAP-01`.** Cursor Cloud Agents are authorized to create an implementation branch, write the agreed nonfinancial workspace and CI, run safe builds/tests locally or in isolated environment, and prepare **one reviewable PR** from current `main`. The owner reserves review, modification, rejection and merge of that PR. G4 here does **not** grant automatic merge or deployment.
3. **DR10:** `AUTHORIZED_BY_OWNER_2026-11-16`. **DR09:** GitHub #25 / SER-134 confirmed; baseline HEAD must be rechecked **after** this authorization PR lands. **DR07:** isolated mise toolchain install/peers/frozen-lock smoke PASSED in user-reported WSL preflight; running the real Nx generators and quality suite belongs to execution/G5 and must not be retroactively claimed as a preflight pass. **DR08:** user-reported WSL2 host PASS for bootstrap; Cloud environment must verify its own pinned toolchain.
4. **Only G4 is granted**; `implementation` remains `NOT_STARTED` until a real commit exists and **all AC01–AC14 remain `TEST_PLANNED / NOT_RUN`** until executed. This document itself does not mark a build, lint, CI, product test, Stripe behavior or Mongo fault experiment `VERIFIED`.

## First implementation boundary — exact permitted deliverables

- One workspace: pinned `Node.js 24.22.2`, `pnpm 11.10.0`, `Nx / @nx/* 23.3.1`, `NestJS core 11.2.8`, `@nestjs/cli 11.0.24`, `TypeScript 5.9.3`, `rxjs 7.8.2`, `reflect-metadata 0.2.2`. These are **smoke-tested candidate versions**, not promises of generator success: verify actual availability, peer constraints and lockfile on each clean setup; propose any required version change in the PR rather than silently using latest.
- Project-local `.mise.toml` and `packageManager` plus `pnpm-lock.yaml`; no system-wide Node/pnpm change. With pnpm 11, explicitly whitelist required Nx/native packages in `pnpm-workspace.yaml` `allowBuilds` after validating the required installer scripts; do not globally disable install-script protection.
- Nx/pnpm repository root; **one** `apps/commercecore-api` NestJS application, `GET /health/live` with a nonsecret static/build response; **one** framework-free `libs/commercecore/catalog/domain` exemplar with immutable `ProductId` and unit tests.
- Negative architecture import tests proving NestJS and private infrastructure imports are forbidden in Domain, plus typecheck, lint, formatting, tests, build, a minimal PR GitHub Actions workflow with permissions `contents: read` and pinned exact action SHAs; English `docs/development/LOCAL_BOOTSTRAP.md` with clean-clone/Cloud/WSL steps and evidence.
- Work **only** in `feature/m01-bootstrap-workspace` (or a clearly mapped equivalent feature branch from approved `main`) for #25/SER-134. Conventional commit messages, no artificial coauthor text. Preserve and report true Git author; **never impersonate the repository owner** if the Cloud Agent environment cannot commit using owner-authorized identity. Attach real AC01–AC14 evidence to PR and Linear.
- Do not bypass tests, introduce unnecessary components or scaffold the later CommerceCloud/eGame consumer in this atomic task.

## Review performed across the original design inventory

| Canonical findings | Current authoritative situation | Scope disposition for M01 foundation | Hard gate retained for later owner |
|---|---|---|---|
| AUD-P0-01..04 — GitHub #1–4 / SER-118–121 | **OPEN / BLOCKING**; provider send/UNKNOWN, captured Order obligation, irreversible disclosure/refund | **EXPLICITLY DEFERRED**, because no Stripe, payment, refund, license or Inventory effect is implemented in bootstrap | Before affected M04 financial/fulfillment functionality: exact protocol approval and genuine provider/driver/worker fault evidence |
| AUD-P1-01 — #5 / SER-122 | StockPool/Reservation capacity, D-01-SM candidate not ratified | DEFER; no stock or Reservation types in bootstrap | M00.2/M04 contract, capacity conservation and owner-local transaction tests |
| AUD-P1-02 — #6 / SER-123 | Order/CheckoutProcess/Payments authority accepted direction, exact FSM transitions pending | DEFER; no CheckoutProcess/Payments aggregate in bootstrap | M00.4/M04 command guards and durable incorporation |
| AUD-P1-03 — #7 / SER-124 | Option-D commercial retry policy accepted direction; duration/protocol unresolved | DEFER; no commercial attempts | Future supported payment retry capability; no invented 35m/two-session guarantee |
| AUD-P1-04 — #8 / SER-125 | Stripe method/capture/account, Connect model pending; current API version unpinned | DEFER; no Stripe adapter, SDK or secrets | Payment slice M04 (CAP-PAY-010 Connect **INCLUDED** in approved final scope) |
| AUD-P1-05 — #9 / SER-126 | D-05-MONGO physical transaction/unknown commit pending and untested | DEFER; no Mongo in bootstrap | Separate M01-DATA-01 G3/G4 and Mongo G5 evidence |
| AUD-P1-06 — #10 / SER-127 | Multi-line Inventory and license preparation required | DEFER; no commercial OrderLines | Final M04 **includes** CAP-INV-006 and CAP-FUL-004; no one-line-only final-scope reduction |
| AUD-P2-01 — #11 / SER-128 | GitHub **CLOSED** / Linear Done; static docs matrix and glossary accepted by owner's issue closure; runtime untouched | Documentation available, no new scope blocker | Any future runtime terminology checks remain project testing |
| AUD-P2-02 — #12 / SER-129 | Stripe 35m and two Sessions not universally ratified, actual provider behavior unknown | DEFER; no Sessions | Before active Checkout adapter: exact API version, observed `expires_at`, effective methods, mode/account tests |
| AUD-P2-03 — #13 / SER-130 | Source/oracle/traceability partly indexed; GitHub OPEN, 140 CAP exact-clause and user-approval lineage incomplete | DEFER the *remaining* semantic source checks that do not govern the empty foundation | Complete per affected M00.2–M04 contractual gate, maintain provenance; no false G0/G5 claim |

All thirteen original findings have documented architectural recommendations, alternatives and verification obligations. The owner **accepts their scoped deferment as a deliberate, reversible sequencing decision**, not as ratification of unsettled commercial conditions. **Preserve all existing actual audit and test states.** Do not infer accepted subdecisions from this scoped authorization.

## Source, contracts, and extension boundaries preserved

- Prior decisions **D-01..D-07** and accepted ownership/coordination policies remain authoritative for covered contexts. This authorization neither alters them nor chooses the unratified `D-01-SM`, `AUD-P1-02-FSM-MIN`, `D-05-MONGO`, Stripe account/API-version values or commercial retry durations.
- Inventory belongs to Inventory, provider money/evidence to Payments, commercial Order obligation/resolution and saga incorporation to Ordering, key assignment/exposure to Fulfillment. A read model cannot authorize an irreversible effect. Future API/adapter detail may evolve through reviewed ADRs and compatible migrations.
- M00.2 (StockPool/Reservation/DigitalLicense), M00.3 (trusted TenantContext, guest/OIDC, actor–resource authorization) and M00.4 (versioned ports, owner-local transactions/Inbox/Outbox/error semantics) are **reviewed reference baselines**. Detailed unresolved contracts remain milestone-gated; the initial pure Domain example is not an implementation of any such business aggregate.
- Original **103 planning entries** retain stable IDs with individually proposed dispositions, 181 original historical records (26 accepted/155 selected proposals), 91 scoped register records and the **140 CAP scope classification: 85 INCLUDED / 43 EXCLUDED / 12 DEFERRED**. **CAP-INV-005 is EXCLUDED**, CAP-INV-006/CAP-FUL-004/CAP-PAY-010 are INCLUDED for final approved M04. No blanket ratification of the 73 provisional PLAN-DEC entries.
- The 110 source-oracle translations remain drafts based on indexed Spanish source rows and require original-clause/owner review where they affect later implementation. **All 148 original tests remain `TEST_PLANNED / NOT_RUN`**, and four P0 remain OPEN/BLOCKING. Never reinterpret `UNKNOWN` as `FAILED`.

## Governance disposition and what follows

- **G3 for M01 foundation:** `PASSED_SCOPE_M01_BOOTSTRAP_01`. **G3 for full M00/M02/M03/M04 commercial architecture:** `OPEN_WITH_EXPLICIT_DEFERRALS`; no implicit all-project signoff.
- **G4 for M01-BOOTSTRAP-01:** `GRANTED_2026-11-16`, effective **after** this authorization is merged to the protected authoritative `main` and the agent has rechecked `origin/main` as DR09. Any product coding before that is not covered.
- **G5:** `NOT_RUN` until implementation checks. No live-money, third-party account creation, network payment, K8s deployment, Mongo setup, secrets or paid cloud resources are authorized by this document.
- GitHub #27 / Linear SER-135: the **design-first M01 sequencing gate can be marked completed as a scoped review** once this authorization record is integrated and synchronized, while the **original unresolved findings remain open** and continue to block their own milestone. The issue closing rationale must state the limited scope, not "all P0 resolved".
- GitHub #25 / Linear SER-134: activate implementation **only after** the preceding documentation PR is merged and exact G4 recorded in the canonical readiness JSON, issue and Linear. Separate new G3/G4 approvals are still required for subsequent slices.
- The owner may amend these choices via a new recorded decision with migration and compatibility review. **Architecture is a development baseline, not an immutable final truth.**
