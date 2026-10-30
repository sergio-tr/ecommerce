# M01 — Independent Local Engineering Foundation Specification Proposal

**Decision state:** OPTION M01-A ACCEPTED AS ARCHITECTURAL DIRECTION 2026-10-30; technical contracts and implementation authorization still PENDING. **Owner:** @sergio-tr. **Implementation:** NOT AUTHORIZED. **Applicable milestone:** M01, independent of M00.1 financial P0 proof where no financial effects are introduced.

## Target and exclusions

The milestone should produce a reproducible engineering platform for a modular, headless and independently installable CommerceCore, separated from CommerceCloud and eGame. Build no Checkout Session, PaymentAttempt, stock mutation, key reveal, refund, order commercial FSM or cross-context write merely to demonstrate the platform.

## Accepted direction: M01-A (2026-10-30), detailed toolchain and tasks not yet specified

Keep the historical selected **TypeScript / NestJS modular monolith with Nx and pnpm** for initial CommerceCore application composition and **Angular** as reference storefront shell technology, with pure domain/application libraries and ports under DDD/hexagonal boundaries. Initial local development uses independently configured, nonproduction tooling. Do not invent exact current package/runtime versions from the historic candidate.

| Design topic | Proposed specific contract to approve | Alternative or remaining uncertainty |
|---|---|---|
| Workspace | Nx + pnpm; one package.json per independently maintained application/package; enforce tagged dependency graph | Separate repos add version coordination without demonstrating need |
| Applications | CommerceCore API, separate CommerceCloud Control Plane, eGame reference client as distinct deployment consumers | Their initial physical service arrangement is not ratified |
| Packages | Domain, Application, Ports and Infrastructure adapters separated by bounded context; no NestJS import in Domain | Exact names, folder paths and package publication boundaries pending |
| Import rules | Contexts communicate via versioned public contracts; no private DB/model imports or direct cross-context writes; Nx tags + ESLint/CI guards | Allowing convenient crosscontext private imports weakens M07 extraction |
| Persistence | Adapter abstraction may be scaffolded; Mongo chosen as historical candidate, but D-05-MONGO semantics remain PENDING | No default assumption that simple transaction helper proves financial durability |
| Local environment | Pinned toolchain versions, deterministic install, local-only test configuration, approved isolated Docker/Compose dependencies if separately authorized | Exact Node runtime (Node 24 historically selected), package versions and services require current compatibility verification |
| Quality | Lint/format/typecheck/unit tests, dependency-boundary tests, staged integration/contract/E2E harness and CI required checks | Exact thresholds, runner configuration and negative test fixtures pending |
| Security | Environment schema validation, no committed secrets or license keys, test credentials isolated, scoped headers not trusted without authorization | Actual Identity/Keycloak sessions and role matrix belong to M00.3 |
| Workflow | Feature/bugfix branch + PR, Conventional Commits and @sergio-tr accountable authorship; no co-author tooling trailers | Existing user governance accepted, not a new architecture question |
| Release | English docs-as-code, versioned design contract links, no package publishing or live deployment | npm/public licensing and real deployment gates remain pending |

## Suggested atomic future foundation tasks — PLANNING ONLY

1. Approve precise runtime/package versions and local supported OS/WSL2 strategy.
2. Approve bounded context/package names, Domain import rules and exact dependency test matrix.
3. Approve workspace/apps layout without creating extra repos.
4. Approve secure environment config and test fixture strategy without financial/tenant bypasses.
5. Approve unit/architecture/contract test harness and required CI checks.
6. Approve developer onboarding, English documentation and contract versioning conventions.
7. Approve staged integration tooling only where its adapters are independently specified.

These are NOT GitHub/Linear implementation issues. After acceptance they may be converted to individually testable issues with explicit authorization.

## M01-A Definition of Ready for local self-implementation

- User explicitly ratifies M01-A or another named architecture and the exact versions and dependency boundaries.
- The first M01 foundation change has approved G3 inputs/outputs, negative tests and a scoped owner. No unresolved commerce P0 contract is consumed by it.
- User explicitly authorizes M01 local implementation or the individual task (G4).
- A feature/* branch starts from an approved repository base; no direct main mutation; CI quality conditions are specified.

## M01-A Definition of Done (to be assessed only AFTER code is authorized)

A fresh local clone and pinned install run deterministically, lint/typecheck/unit and import-boundary checks actually pass, an app can start without payment functionality, config secrets are absent, docs explain a complete local bootstrap and evidence links show executed results. G5 cannot be claimed until these outcomes are observed.

## Dependency to remaining project

M02 Tenant/Store contracts and M03 Catalog/Quote contracts can be planned in parallel. Payments/Inventory/Fulfillment implementations remain blocked until their own M00.1–M00.4 protections are specified. A successful M01 build does not justify closing P0 audits.
