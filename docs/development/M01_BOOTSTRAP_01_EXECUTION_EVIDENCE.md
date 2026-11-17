# M01-BOOTSTRAP-01 local execution evidence

**Status:** local commands and the pull request workflow below were executed. This file does not mark G5, does not change `m01-bootstrap-01-readiness.json`, and does not change audit or historical test states.

**Base:** `origin/main` `5aba94f18fa130530042b7e48f0b335a88f52bd2` after `git fetch origin main`.

**Branch:** `feature/m01-bootstrap-workspace` (unoccupied; no open implementation pull request existed).

**Implementation commit:** `a8f17f1d45f40ec23786fa04160915299fd02fca`.

**Author recorded by git:** `Cursor Agent <cursoragent@cursor.com>`. This was not rewritten to `@sergio-tr`. A platform hook first appended `Co-authored-by: marysidras <marysidras@users.noreply.github.com>`. That trailer was removed before push because `CONTRIBUTING.md` and the M01 handoff forbid co-author trailers. The commit message has no `Co-authored-by` line. Owner review should treat the author mismatch as unresolved.

**Toolchain observed:** Node `v24.22.2`, pnpm `11.10.0`, TypeScript `5.9.3`, local Nx `v23.3.1`. Direct package pins match `package.json`. `pnpm-lock.yaml` SHA-256 `8f7bd28b55d174c1f67df5d99d47b36eb87ca063c6ccf8b1509edac75beb2ffa` was unchanged by `pnpm install --frozen-lockfile` (exit 0).

## Acceptance results

| ID | Result | What was run |
|---|---|---|
| AC01 | PASS locally | `pnpm install --frozen-lockfile` exit 0 after deleting `node_modules`. Lockfile hash unchanged. |
| AC02 | PASS locally | `nx graph` then `node tools/architecture/assert-project-graph.mjs`. Projects: `commercecore-api` (app), `commercecore-catalog-domain` (lib), `ecommerce` (library tooling project for secret scan, not a second product app). Domain dependencies empty. No cycle. |
| AC03 | PASS locally | `nx` build and typecheck exit 0. Domain has no `package.json`. Compiled domain output has no `@nestjs`, Stripe, or MongoDB reference. |
| AC04 | PASS locally | Compiled `main.js` served `GET /health/live` with HTTP 200 and `{status:live, service:commercecore-api, version:0.0.0, probe:liveness, dependenciesChecked:false}`. |
| AC05 | PASS locally | 4 domain tests passed, including valid `prd_01ARZ3NDEKTSV4RRFFQ69G5FAV` and invalid values rejected as `InvalidProductIdError` without echoing the input. |
| AC06 | PASS locally | On-disk NestJS fixture lint exit 1 (`no-restricted-imports` and `commercecore/domain-import-boundary` on `@nestjs/common`). Fixture removed. Restored domain lint exit 0. |
| AC07 | PASS locally, limited scope | CommerceCloud was not generated. Fixture imports `tools/architecture-fixtures/commercecloud-private-adapter.ts`. Lint exit 1 from `@nx/enforce-module-boundaries` and `commercecore/domain-import-boundary`. This does not prove a future CommerceCloud project graph. |
| AC08 | PASS locally | `lint`, `typecheck`, `test`, `build`, `secret-scan`, and `nx format:check` exit 0. API tests 8 passed. Domain tests 4 passed. |
| AC09 | PASS | Pull request #39 run [44036261321](https://github.com/sergio-tr/ecommerce/actions/runs/44036261321) failed on `14f0b748bd9794f4f68b14d6cbf8a864cf2d87f1` because a shallow checkout had no `main` ref. Run [44036563176](https://github.com/sergio-tr/ecommerce/actions/runs/44036563176), job `133880742874`, conclusion `success`, on head `54324a77ee6a29e161bcb2ef8f196e7d2d010016`. The log shows Node `v24.22.2`, pnpm `11.10.0`, Nx `v23.3.1`, frozen install, lint, typecheck, 12 tests, build, secret scan, architecture, and the project graph. `nx format:check` ran after `main` was fetched and the job still exited successfully. Checkout of that run was merge commit `20c63bbe052455eba11aa1e8f0284f93a021b5f5`. Token permissions were `contents: read`. |
| AC10 | PASS locally | Missing `COMMERCECORE_ENV` exits 1 with `field=COMMERCECORE_ENV`, `reason=missing`. A secret-shaped port exits 1 with `reason=forbidden` and the value is absent from stderr. |
| AC11 | PASS locally | `node tools/security/scan-secrets.mjs` printed `secret-scan: no secrets found` and exit 0. No container image exists to scan. |
| AC12 | PASS locally | Diff adds the workspace, liveness API, pedagogical `ProductId`, tests, docs, and the pull request workflow. No Helm, Kubernetes, MongoDB, Stripe, CommerceCloud, or eGame implementation. |
| AC13 | MISMATCH for owner review | Conventional Commit subject is present. Author is `Cursor Agent`, not `@sergio-tr`. No `Co-authored-by` trailer remains. |
| AC14 | PASS locally | A clean directory copy installed with `--frozen-lockfile` (same lock hash, exit 0) and repeated lint, typecheck, test, build, secret scan, format, architecture, and graph checks at exit 0. Node `v24.22.2`, pnpm `11.10.0`, TypeScript `5.9.3`, Nx `v23.3.1`. |

`/health/ready` was not added. The liveness payload sets `dependenciesChecked` to false.

## Negative lint excerpt

NestJS fixture:

```text
error  '@nestjs/common' import is restricted from being used by a pattern. Pure catalog domain cannot import NestJS  no-restricted-imports
error  Pure catalog domain cannot import "@nestjs/common". NestJS is a composition concern                           commercecore/domain-import-boundary
```

Mocked CommerceCloud private adapter fixture:

```text
error  Projects cannot be imported by a relative or absolute path, and must begin with a npm scope                                                                                     @nx/enforce-module-boundaries
error  Pure catalog domain cannot import "../../../../../../tools/architecture-fixtures/commercecloud-private-adapter". Other contexts and providers stay outside this domain example  commercecore/domain-import-boundary
```

Both fixtures were deleted. `git status` for `libs/commercecore/catalog/domain/src/__negative__` was empty afterwards.
