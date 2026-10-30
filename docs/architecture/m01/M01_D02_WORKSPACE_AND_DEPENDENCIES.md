# M01-D02 — Nx Workspace, Deployable Apps and Bounded-Context Dependency Rules

**Status:** PROPOSED G3 TECHNICAL CONTRACT / IMPLEMENTATION NOT AUTHORIZED. **Approval:** ADR-M01-001 / M01-A. **Owner:** @sergio-tr. **Version cohort:** M01-D01 (Node24 / Nx23 / Nest11 / Angular21 / TS5.9) subject to installation check.

## Workspace authority

Nx is the only task/graph orchestration layer; pnpm workspaces own package resolution and a single locked dependency graph. **Do not create a second Nest CLI managed monorepo independent of Nx.** Generate NestJS and Angular projects through Nx-supported generators after exact peer verification. Default package graph is private. Distribution/SDK publication is a future M06 concern.

### Proposed package and application layout (not created)

```text
apps/
  commercecore-api/         NestJS HTTP composition root, headless
  commercecloud-api/        NestJS SaaS/Control Plane composition root
  egame-web/                Angular consumer (no provider secrets)
  commercecore-worker/      OPTIONAL isolated worker entrypoint; initially no financial dispatcher
libs/
  commercecore/
    catalog/{domain,application,ports,adapters}/
    merchandising/{domain,application,ports,adapters}/
    pricing/{domain,application,ports,adapters}/
    cart/{domain,application,ports,adapters}/
    ordering/{domain,application,ports,adapters}/
    payments/{domain,application,ports,adapters}/
    inventory/{domain,application,ports,adapters}/
    fulfillment/{domain,application,ports,adapters}/
  commercecloud/{domain,application,ports,adapters}/
  identity/{domain,application,ports,adapters}/
  contracts/{http,events,errors}/
  shared/{domain-kernel,test-support}/
deploy/
  helm/                    future M01-D04 chart specs (not created yet)
tools/                      later tooling/test utilities
docs/                       ADRs and proofs
```

For M01 minimal bootstrap **generate only one CommerceCore app, one domain library and import-boundary tests**; the rest of the directory map is the accepted target, not permission to produce code in this design task.

## Ownership rules (all enforced by Nx tags + lint/build graph checks when implemented)

- **Domain:** framework-free entities, value objects, invariants and domain events. No imports from NestJS, MongoDB, Angular, Stripe, Kubernetes, framework adapters or other contexts' internals.
- **Application:** use cases, command orchestration, declared ports and own domain models only. No direct ORM/driver, HTTP routing, Stripe SDK or another context's private repositories.
- **Ports:** contracts/DTO for IO dependencies, named provider abstractions and authoritative failure categories (UNKNOWN distinct from REJECTED).
- **Adapters:** NestJS/Mongo/Stripe infrastructure depends inward on public ports. Composition roots wire implementations, never the reverse.
- **Public cross-context:** only independently versioned contracts, local at-least-once messaging abstractions and authorized read facades; no importing other bounded-context `domain/internal` or `adapters`.
- **CommerceCloud:** owns tenant/store policy provisioning and its data. CommerceCore consumes a public, versioned config contract, not Cloud private DB.
- **eGame:** consumes authorized HTTP/BFF contract; cannot directly call MongoDB, Stripe secret API or reveal raw keys without Fulfillment authorization.
- **Shared-kernel:** very small semantic primitives (Money, TenantId, StoreId, immutable IDs) only if ownership ratified; no generic catch-all `shared` coupling repository.

## Specific dependency policy as a matrix

| From → To | Own Domain | Own Application/Ports | Public contracts | Own Adapter | Another context's private layers |
|---|---|---|---|---|---|
| Domain | Own Domain only | DENY | Only independent pure primitives if needed | DENY | DENY |
| Application | ALLOW | ALLOW | ALLOW | DENY | DENY |
| Ports | Pure owner types | ALLOW when no cycle | ALLOW | DENY | DENY |
| Adapters | ALLOW | ALLOW | ALLOW | Own infrastructure only | DENY |
| App composition root | ALLOW via public module assembly | ALLOW | ALLOW | ALLOW owner assembly | DENY direct DB/private cross-context import |
| Another Bounded Context | DENY private | DENY private | ALLOW versioned interface | DENY | DENY |

Avoid common cyclic pattern `application ↔ ports`: choose a single inward import direction for each module during G3 project tag implementation. For example, Application defines consumed ports, adapter implements them; no bidirectional source dependency.

**Nx tag scheme candidate (exact boundary-enforcement test pending):**
- `scope:commercecore`, `scope:commercecloud`, `scope:egame`, `scope:contracts`
- `context:ordering`, `context:payments`, etc.
- `layer:domain`, `layer:application`, `layer:ports`, `layer:adapters`, `layer:app`
- `runtime:node`, `runtime:browser`, `runtime:agnostic`

Standard constraints: `layer:domain` only imports `layer:domain` or pure kernel; `scope:egame` only imports approved contracts/client libraries, not `scope:commercecore` source; no direct `scope:commercecore` ↔ `scope:commercecloud` noncontract imports. Where built-in Nx constraints cannot express cross-context ownership dynamically, add explicit custom lint/architecture negative fixtures, not a silent exemption.

## Tooling and decisions for D02

- Nx package versions must match exactly: `nx`, `@nx/js`, `@nx/angular`, `@nx/nest`, `@nx/node`, and lint plugin versions.
- TypeScript project references or buildable libraries may be chosen only after actual Nx generator inspection. No undeclared path alias that bypasses tag rules.
- Use a single `pnpm-lock.yaml` with `--frozen-lockfile`; separate package.json files for apps/packages only when independently deployable/buildable or publishable, not one per arbitrary folder by default.
- Each app has its own production image/configuration; sharing Nx source repository does not authorize shared runtime secrets or data tables.
- `commercecore-worker` can be its own Deployment entry point only once its Outbox/Inbox semantics and worker locking are specified; no arbitrary background financial POST at M01.

## D02 planned tests / acceptance oracles

| Test | Proposed procedure | Pass condition |
|---|---|---|
| Graph shape | run Nx project graph from clean checkout | no cycles, declared library and app ownership |
| Forbidden dependency | fixture in Domain imports `@nestjs/common` | lint/architecture test FAILS as intended |
| Forbidden provider | Cart domain imports Stripe SDK | lint/architecture test FAILS |
| Forbidden Cloud coupling | Core imports Cloud Mongo collection | lint/architecture test FAILS |
| Contract allowed | Ordering Application references versioned Payments contract | passes build graph, no private imports |
| Build packaging | Core API production image from the Nx app | only its actual runtime dependencies/secrets |
| App independence | eGame build does not require Nest source at runtime | standalone web artifact |
| Future extraction | isolate `catalog` module to new application boundary *in a design simulation* | no known direct private import edge to break |

**All tests are TEST_PLANNED / NOT_RUN.** No Nx-generated application or package graph exists yet.

## G3 current exit

Domain/application/adapter authority rules are **SPECIFIED**. Exact Nx `project.json`/ESLint/TypeScript project implementation, generator options, peer packages and real graph checks are **PENDING authorized implementation smoke**. Do not claim G5 architecture enforcement until test failures are actually observed.
