# M01-BOOTSTRAP-01 local execution evidence

**Current result:** M01-BOOTSTRAP-01 nonfinancial G5 is **PASSED** for `main` `88b9951dbdbbbf09ddf341ad80eeb359a35133cc`. The evidence is push run [44058469285](https://github.com/sergio-tr/ecommerce/actions/runs/44058469285), recorded in the last section. AC07 stays the owner-accepted mocked CommerceCloud fixture. AC13 stays the owner-accepted `Cursor Agent` authorship. Financial G5 is separate and is not passed. AUD-P0-01 through AUD-P0-04 stay OPEN/BLOCKING. The 148 catalog experiments stay TEST_PLANNED/NOT_RUN. Earlier sections keep their original observations, including the time when a main push run was absent.

**Historical pre-merge record:** the status line and acceptance table below were written before merge. They are not the post-merge execution. That record did not itself change audit or historical test states.

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

## Post-merge recheck on merged main

This section is a separate execution from the historical table above. Merge of PR #39 and the older green Actions runs are not treated as this run. G5 is **not** passed. GitHub #25 was left open. Linear SER-134 was already Done and was not moved. AUD-P0-01 through AUD-P0-04 stay open. The 148-test catalog and CAP dispositions were not edited. `ownerAuthorization`, DR01–DR10, `designGate`, and `preflightEvidence` in the readiness JSON were left as previously written. Current traceability fields (`status`, `implementation`, `g5Evidence`, `branch`, `executionStatus`, `nextAction`) were updated because they still said the work had not started.

**Main SHA:** `8ea4fda52cb4596393a7352e7c4ec23517acc22a` (`git rev-parse origin/main` after `git fetch origin main`).

**Parents:** `5aba94f18fa130530042b7e48f0b335a88f52bd2` and `083e5a3c0722256472fe307a5c230be22b2b3fa0`.

**Tree:** `efcbf913230964c221385fa2f44c57ba20db75c3`, equal to the tree of PR head `083e5a3c0722256472fe307a5c230be22b2b3fa0`.

**Checkout:** clean detached worktree at that SHA. Commands used Node `v24.22.2` at `/home/ubuntu/.nvm/versions/node/v24.22.2/bin/node` and pnpm `11.10.0`. An earlier install in the same directory had used Node `v22.23.4`; `node_modules` was deleted and the install below was repeated. Only the Node 24.22.2 install is evidence.

**Live probe time:** HTTP `Date: Tue, 17 Nov 2026 08:46:45 GMT` (09:46 Europe/Amsterdam).

**Actions on this SHA:** `gh run list --repo sergio-tr/ecommerce --commit 8ea4fda52cb4596393a7352e7c4ec23517acc22a` returned no runs. `.github/workflows/pr-validation.yml` triggers on `pull_request` only. There is no post-merge workflow run to cite.

### Commands and exit codes

| Command | Exit |
|---|---|
| `pnpm install --frozen-lockfile` after removing `node_modules` | 0 |
| `pnpm exec nx run-many -t lint typecheck test build secret-scan --parallel=3 --output-style=static` with `NX_DAEMON=false` and `NX_NO_CLOUD=true` | 0 |
| `pnpm exec nx format:check --base=5aba94f18fa130530042b7e48f0b335a88f52bd2` | 0, no stdout |
| `pnpm exec nx run commercecore-catalog-domain:architecture --output-style=static` | 0 |
| `pnpm exec nx graph --file=tmp/nx-graph.json` | 0 |
| `node tools/architecture/assert-project-graph.mjs tmp/nx-graph.json` | 0 |
| `pnpm exec nx run ecommerce:secret-scan --skip-nx-cache --output-style=static` | 0 |
| `node dist/apps/commercecore-api/main.js` with no `COMMERCECORE_*` variables | 1 |
| same binary with `COMMERCECORE_ENV=test` and a secret-shaped `COMMERCECORE_HTTP_PORT` | 1 |
| `curl` `GET /health/live` on `127.0.0.1:39741` | 0, HTTP 200 |

Lockfile SHA-256 before and after the frozen install: `8f7bd28b55d174c1f67df5d99d47b36eb87ca063c6ccf8b1509edac75beb2ffa`. TypeScript `5.9.3`. Local Nx `v23.3.1`.

Quality run: domain tests 4 passed, API tests 8 passed, 0 failed. Architecture stdout: `NestJS fixture exit=1`, `CommerceCloud fixture exit=1`, then restored domain lint passed. `git status --porcelain` for `libs/commercecore/catalog/domain/src/__negative__` was empty. This run did not copy a fresh ESLint excerpt; the script exits non-zero unless the NestJS output contains `@nestjs/common` and the CommerceCloud output contains `commercecloud`.

Graph stdout: `project-graph: acyclic projects=commercecore-api,commercecore-catalog-domain,ecommerce`; catalog domain has no project dependencies. `libs/commercecore/catalog/domain/package.json` is absent. A search of `dist/libs/commercecore/catalog/domain` for `@nestjs`, Stripe, MongoDB, Mongoose, and Kubernetes strings found none.

`GET /health/live` body: `{"status":"live","service":"commercecore-api","version":"0.0.0","probe":"liveness","dependenciesChecked":false}`. No `/health/ready` route is defined. Missing configuration stderr was `field=COMMERCECORE_ENV`, `reason=missing`, and stdout was empty. The forbidden-port process exited 1 with `field=COMMERCECORE_HTTP_PORT` and `reason=forbidden`; the rejected value was not in stderr. Uncached secret scan printed `secret-scan: no secrets found`. No container image was built. The parallel quality log did not show that print because Nx grouped the cached-capable target; the uncached rerun is the captured line. Both exits were 0.

Diff `5aba94f18fa130530042b7e48f0b335a88f52bd2..8ea4fda52cb4596393a7352e7c4ec23517acc22a` is 43 paths. Name search hits only `tools/architecture-fixtures/commercecloud-private-adapter.ts` and `tools/security/scan-secrets.mjs`. The adapter file states it is a mocked fixture and not an application. Content hits in apps, libs, tools, and package manifests are the NestJS API, a MongoDB URL rejection check, and tests that forbid those imports in the domain. Direct dependencies are NestJS core 11.2.8, `reflect-metadata` 0.2.2, and `rxjs` 7.8.2. No Helm chart, Kubernetes manifest, Stripe SDK, MongoDB driver, or eGame app was added.

### Acceptance map

| ID | Post-merge result | Evidence | Limitation |
|---|---|---|---|
| AC01 | Observed pass | Frozen install exit 0 on `8ea4fda`; lock hash unchanged; Node `v24.22.2`, pnpm `11.10.0` | No Actions run on this SHA |
| AC02 | Observed pass | Graph and `assert-project-graph.mjs` exit 0; one app, domain lib, acyclic, domain dependencies empty | Root `ecommerce` project is tooling, not a second app |
| AC03 | Observed pass | Build and typecheck inside the quality exit 0; domain has no manifest; compiled domain has no NestJS, Stripe, or MongoDB string | Search was a string scan of `dist`, not a dependency graph of unused packages beyond the manifest |
| AC04 | Observed pass | API test plus direct `curl` HTTP 200 and the liveness JSON above | Port 39741 was local only |
| AC05 | Observed pass | 4 domain tests passed, including invalid ids rejected without echoing the input | Pedagogical `ProductId` only |
| AC06 | Observed pass | Architecture script: NestJS fixture exit 1, then restored lint, negative directory clean | ESLint text was not re-copied in this run |
| AC07 | Pending owner review | Same script: CommerceCloud fixture exit 1, then removed | Fixture imports the mocked adapter. The project graph has no CommerceCloud project. This does not prove a future CommerceCloud boundary |
| AC08 | Observed pass | Lint, typecheck, test, build, secret-scan exit 0; `format:check` against `5aba94f` exit 0 | `format:check` printed nothing |
| AC09 | Not re-executed on the merge SHA | No workflow run for `8ea4fda` | Older PR runs are listed below and are not a post-merge pass. The green job checked out `d1063269`, not `8ea4fda` |
| AC10 | Observed pass | Missing config exit 1; secret-shaped port exit 1; value absent from stderr | Direct process plus the API tests |
| AC11 | Observed pass | Uncached secret scan exit 0, `secret-scan: no secrets found` | No image exists to scan |
| AC12 | Observed pass for the merged diff | 43 paths; no Helm, Kubernetes, Stripe SDK, MongoDB driver, or eGame implementation | The mocked CommerceCloud adapter file is present on purpose |
| AC13 | Pending owner review | Code commits authored by `Cursor Agent <cursoragent@cursor.com>`; merge commit author `Sergio Truébano Robles <truebanosergio@gmail.com>`; no `Co-authored-by` in `5aba94f..8ea4fda`; PR #39 GitHub user `sergio-tr` | Criterion asks for author `@sergio-tr` on commit metadata. The implementation commits do not meet that |
| AC14 | Observed pass on one clean worktree | Same SHA, frozen install, and quality, format, architecture, and graph exits 0; lock hash unchanged | Not a second machine, and `dist` was not byte-compared with Actions artifacts |

### Older pull-request Actions, re-read and not reused as post-merge proof

| Run | Conclusion | API `headSha` | `commit=` printed in the job | Job |
|---|---|---|---|---|
| [44036261321](https://github.com/sergio-tr/ecommerce/actions/runs/44036261321) | failure | `14f0b748bd9794f4f68b14d6cbf8a864cf2d87f1` | `6f679ab8a6da4845c5ba949c3b922b17822ac67f` | `133879739051` |
| [44036563176](https://github.com/sergio-tr/ecommerce/actions/runs/44036563176) | success | `54324a77ee6a29e161bcb2ef8f196e7d2d010016` | `20c63bbe052455eba11aa1e8f0284f93a021b5f5` | `133880742874` |
| [44036932054](https://github.com/sergio-tr/ecommerce/actions/runs/44036932054) | success | `083e5a3c0722256472fe307a5c230be22b2b3fa0` | `d1063269e08966472c5b5f8ed18ceffe435582c1` | `133881953692` |

The failed run stopped in `nx format:check` with `fatal: ambiguous argument 'main'`. Run `44036932054` printed Node `v24.22.2`, pnpm `11.10.0`, Nx local `v23.3.1`, `secret-scan: no secrets found`, 4 domain tests, 8 API tests, both fixture exits `1`, and the acyclic project graph. Token permissions in that log were `Contents: read` and `Metadata: read`. `format:check` was invoked and the quality step succeeded; the log has no format stdout. Those runs remain pre-merge pull-request evidence.

### Owner decisions open at the 8ea4fda recheck

These were the open questions when that recheck was written. AC07 and AC13 are answered in the reconciliation below. AC09 is not.

- AC07: accept or reject the mocked private-adapter fixture as the CommerceCloud architecture check.
- AC13: accept or reject `Cursor Agent` as the git author of `a8f17f1d45f40ec23786fa04160915299fd02fca`, `14f0b748bd9794f4f68b14d6cbf8a864cf2d87f1`, `54324a77ee6a29e161bcb2ef8f196e7d2d010016`, and `083e5a3c0722256472fe307a5c230be22b2b3fa0`.
- GitHub #25: leave **OPEN**. Close it only after those two judgments are recorded and the owner states that this foundation evidence is not financial or catalog G5.
- Linear SER-134: observed **Done** at 09:32 Europe/Amsterdam on 17 Nov 2026, the same moment as the merge, before this recheck. Proposed transition: move it back to In Progress until the same owner judgments are recorded, then return it to Done. This record does not apply that transition.

## Owner reconciliation 2026-11-17

Task `SER-M01-LOCAL-REPRESENTATIVE-SMOKE-26`. This section does not pass M01 G5, does not pass financial G5, and does not edit the four AUD-P0 rows, the 148-test catalog, or the decision and capability registers.

**Current main observed:** `7592399b940deaa5d50e6f1f69cd07b245961013`. That commit is documentation on top of `0fc8fb8` and the implementation merge `8ea4fda52cb4596393a7352e7c4ec23517acc22a`. The code tree of the merge remains `efcbf913230964c221385fa2f44c57ba20db75c3`. The tree of `7592399` is `d242ed95c8d0b90e199b9529cc8f1384dc723906` because of the two documentation commits only.

**AC09 — merge-SHA CI absent.** GitHub Actions `list workflow runs` for head SHA `8ea4fda52cb4596393a7352e7c4ec23517acc22a` returned `total_count: 0`. The same query for current main `7592399b940deaa5d50e6f1f69cd07b245961013` returned `total_count: 0`. `.github/workflows/pr-validation.yml` triggers on `pull_request` only, with `permissions: contents: read`. A merge to `main` does not create that run.

The earlier green runs stay pull-request evidence and are not AC09 for either SHA:

| Run | Role | API `headSha` | Not the merge SHA |
|---|---|---|---|
| [44036261321](https://github.com/sergio-tr/ecommerce/actions/runs/44036261321) | failed pull-request run | `14f0b748bd9794f4f68b14d6cbf8a864cf2d87f1` | yes |
| [44036563176](https://github.com/sergio-tr/ecommerce/actions/runs/44036563176) | successful pull-request run | `54324a77ee6a29e161bcb2ef8f196e7d2d010016` | yes |
| [44036932054](https://github.com/sergio-tr/ecommerce/actions/runs/44036932054) | successful pull-request run | `083e5a3c0722256472fe307a5c230be22b2b3fa0` | yes |

The job logs for the successful runs checked out merge commits of the pull request (`20c63bbe052455eba11aa1e8f0284f93a021b5f5` and `d1063269e08966472c5b5f8ed18ceffe435582c1`). Those checkouts are not `8ea4fda` and not `7592399`.

**AC07 — owner-accepted bounded exception.** The owner direction of 2026-11-17 accepts the mocked CommerceCloud negative fixture as the architecture check that exists today. The fixture imports `tools/architecture-fixtures/commercecloud-private-adapter.ts`. CommerceCloud is not a generated project, and this acceptance does not prove a future CommerceCloud boundary. It is not provider or financial evidence.

**AC13 — owner-accepted genuine authorship.** The same direction accepts `Cursor Agent <cursoragent@cursor.com>` as the real author of the implementation commits and rejects impersonation of `@sergio-tr`. No `Co-authored-by` trailer is added. The merge commit author remains `Sergio Truébano Robles <truebanosergio@gmail.com>`.

**Financial G5 stays separate.** AUD-P0-01 through AUD-P0-04 remain OPEN/BLOCKING. The 148 original experiments remain TEST_PLANNED/NOT_RUN. Nothing in this reconciliation is a Stripe, MongoDB, refund, inventory, fulfillment, or license-key result.

**Issue state observed, not changed by this section.** GitHub #25 was already `closed` / `completed` at `2026-11-17T08:54:48Z` (09:54 Europe/Amsterdam) by `sergio-tr`. Linear SER-134 was already Done. This reconciliation does not reopen either one and does not apply a Linear transition.

**M01 G5 result:** `NOT_PASSED`. Local observations for the other bootstrap checks remain the observations recorded above. They are not relabeled as merge-SHA CI. The remaining bootstrap evidence gap is AC09 on the merge SHA.

## AC09 main-push correction 2026-11-17

Task `SER-M01-AC09-MAIN-CI-G5-CLOSURE-27`. This section does not pass M01 G5. It does not edit the four AUD-P0 rows, the 148-test catalog, or the decision and capability registers. AC07 and AC13 stay the owner-accepted bounded exceptions recorded above.

**Main observed before this change:** `67e035e207fb472ef68af00bcb70bb798e748319`, the merge of PR #41. `gh run list --commit 67e035e207fb472ef68af00bcb70bb798e748319` returned no runs. `GET /repos/sergio-tr/ecommerce/commits/67e035e207fb472ef68af00bcb70bb798e748319/check-runs` returned `total_count: 0`.

**Why that SHA has no run.** `.github/workflows/pr-validation.yml` on that commit triggers on `pull_request` only. A merge push to `main` does not start it. Run [44052514363](https://github.com/sergio-tr/ecommerce/actions/runs/44052514363) completed with `conclusion: success` and `event: pull_request` for head `3484faf39ed3d5883ed48da484a6b851b32af24c`. That head is not `67e035e`. This correction does not retroactively create a run for `67e035e`, `7592399`, or `8ea4fda`.

**What the draft changes.** The same workflow also triggers on `push` to `main`, still with `permissions: contents: read`, the same pinned action SHAs, Node `24.22.2`, and pnpm `11.10.0`. Concurrency includes the event name, so a main push does not use `github.event.pull_request.number`. `nx format:check` receives an explicit base and head. A pull request compares the fetched base ref with the checkout SHA. A push compares `github.event.before` with `github.sha`, and fails if that before SHA is zero, equal to HEAD, or has an empty diff. It does not fetch `origin/main` into a local `main` ref during the push, because that ref would be the commit under test. Lint, typecheck, test, build, secret scan, architecture, project graph, and the local representative demo stay in the job. There is no `pull_request_target`, no secret, and no privileged permission.

**AC09 result for this change:** not met. A green `pull_request` run of the draft is evidence for the draft head only. AC09 for main becomes checkable only after the owner merges and the `push` run on that new merge commit succeeds.

**M01 G5 result:** `NOT_PASSED`. The blocker is the absent successful `push` run on a main SHA that contains this trigger. Financial G5 stays separate.

## Main push verification 2026-11-17

Task `SER-M01-VERIFY-MAIN-PUSH-AC09-G5-28`. This section records the push run that the previous section said was still required. It passes M01-BOOTSTRAP-01 nonfinancial G5 only. It does not edit the four AUD-P0 rows, the 148-test catalog, or the decision and capability registers. AC07 and AC13 stay the owner-accepted bounded exceptions recorded above.

**Agents.** One cloud agent was `RUNNING` when this check started: this verification, `bc-9967fe75-9171-57f2-bd45-c954b1d3a8fb`. The other listed agents on this repository were `IDLE`. No second agent was started.

**Run.** [44058469285](https://github.com/sergio-tr/ecommerce/actions/runs/44058469285)

| Field | Value |
|---|---|
| Workflow | `.github/workflows/pr-validation.yml` (`pr-validation`) |
| Event | `push` |
| Branch | `main` |
| `head_sha` | `88b9951dbdbbbf09ddf341ad80eeb359a35133cc` |
| Status | `completed` |
| Conclusion | `success` |
| Run number | 7 |
| Attempt | 1 |
| Created | 2026-11-17T09:45:21Z (10:45 Europe/Amsterdam) |
| Updated | 2026-11-17T09:46:00Z (10:46 Europe/Amsterdam) |
| Display title | `fix(ci): validate pushes to main` |
| Merge | PR #42, merged at 2026-11-17T09:45:18Z by `sergio-tr` |
| Job | `validate` [133953807663](https://github.com/sergio-tr/ecommerce/actions/runs/44058469285/job/133953807663) |
| Job conclusion | `success` |
| Runner | `ubuntu-24.04` |
| Token | `Contents: read`, `Metadata: read` |

`GET /repos/sergio-tr/ecommerce/actions/workflows/pr-validation.yml/runs?event=push&head_sha=88b9951dbdbbbf09ddf341ad80eeb359a35133cc` returned `total_count: 1`. The legacy combined commit status for that SHA is `state: pending` with `statuses: []` and `total_count: 0`. That empty status list does not describe this run. `GET /repos/sergio-tr/ecommerce/commits/88b9951dbdbbbf09ddf341ad80eeb359a35133cc/check-runs` returned one check run, `validate`, `completed` / `success`, with the same `head_sha`.

Checkout fetched `88b9951dbdbbbf09ddf341ad80eeb359a35133cc` and `git log -1` printed the same SHA. The format step printed `nx-format-range event=push base=67e035e207fb472ef68af00bcb70bb798e748319 head=88b9951dbdbbbf09ddf341ad80eeb359a35133cc files=7`. The toolchain step printed `commit=88b9951dbdbbbf09ddf341ad80eeb359a35133cc`, Node `v24.22.2`, and pnpm `11.10.0`. Nx printed `Local: v23.3.1`.

Job steps, all `completed` / `success`: Set up job, Checkout, Resolve Nx format range, Setup pnpm, Setup Node.js, Show toolchain, Frozen install, Quality targets, Local representative demo, Post Setup Node.js, Post Setup pnpm, Post Checkout, Complete job.

Quality targets ran with `NX_DAEMON=false` and `NX_NO_CLOUD=true`. The log shows lint, typecheck, test, build, and secret-scan for `commercecore-catalog-domain`, `commercecore-api`, and `ecommerce`, plus the two compile-test dependencies. Domain tests: 4 passed, 0 failed. API tests: 8 passed, 0 failed, including `GET /health/live returns HTTP 200 with a nonsecret liveness payload` and the missing-configuration and secret-like rejection tests. Format-range script tests: 6 passed, 0 failed. `secret-scan: no secrets found`. `nx format:check` was invoked with the two 40-character SHAs above and printed no file list; the shell is `set -euo pipefail`, and the architecture step started after it. Architecture printed `NestJS fixture exit=1`, `CommerceCloud fixture exit=1`, and `restored domain lint passed`. The graph step printed `project-graph: acyclic projects=commercecore-api,commercecore-catalog-domain,ecommerce`, both product projects present, and no catalog-domain project dependencies. The local representative demo printed 1 passed, 0 failed. Frozen install printed `Lockfile is up to date` and finished on pnpm `11.10.0`. Cache hits for the Nx targets were 0.

`libs/` and `apps/` are unchanged from implementation merge `8ea4fda52cb4596393a7352e7c4ec23517acc22a` to this SHA. The earlier domain-dist search for Nest, Stripe, MongoDB, Mongoose, and Kubernetes strings therefore still describes these sources. This log does not repeat that search and does not byte-compare `dist`.

No `Co-authored-by` trailer is present from `5aba94f18fa130530042b7e48f0b335a88f52bd2` through this SHA. Implementation commits `a8f17f1d45f40ec23786fa04160915299fd02fca`, `14f0b748bd9794f4f68b14d6cbf8a864cf2d87f1`, `54324a77ee6a29e161bcb2ef8f196e7d2d010016`, and `083e5a3c0722256472fe307a5c230be22b2b3fa0` remain authored by `Cursor Agent <cursoragent@cursor.com>`.

### Acceptance on this SHA

| ID | Result | Bound |
|---|---|---|
| AC01 | Passed in the push job | Frozen install succeeded and reported the lockfile up to date. The earlier SHA-256 measurement was not reprinted. |
| AC02 | Passed in the push job | Acyclic graph, both product projects present, catalog domain dependencies empty. |
| AC03 | Passed for build and typecheck | Domain and API build and typecheck succeeded. Domain sources are the `8ea4fda` sources. |
| AC04 | Passed in the API tests | `GET /health/live` HTTP 200. |
| AC05 | Passed in the domain tests | 4 passed, including invalid ids rejected without echoing the input. |
| AC06 | Passed in the architecture step | NestJS fixture exit 1, then restored domain lint. |
| AC07 | Owner-accepted bounded exception, reobserved | Mocked CommerceCloud fixture exit 1. No generated CommerceCloud project. |
| AC08 | Passed in the push job | Lint, typecheck, test, build, secret-scan, and `format:check` on the explicit range. |
| AC09 | Passed for this SHA only | Push event, exact `head_sha`, printed commit and versions, checks executed. `8ea4fda`, `7592399`, and `67e035e` still have no push run. |
| AC10 | Passed in the API tests | Missing configuration and secret-like values rejected. |
| AC11 | Passed in secret-scan | `secret-scan: no secrets found`. No image is in scope. |
| AC12 | Passed for the diff after `8ea4fda` | Changes are the workflow, format-range tool, local demo, package script, and these docs. No Helm, Kubernetes, MongoDB, Stripe, or eGame product code. |
| AC13 | Owner-accepted genuine authorship | `Cursor Agent` remains the implementation author. Impersonation of `@sergio-tr` was not done. |
| AC14 | Passed on the clean Actions runner | Frozen lockfile and the same checks. `dist` was not byte-compared. |

**M01 G5 result:** `PASSED` for M01-BOOTSTRAP-01 nonfinancial foundation only. Financial G5 stays `NOT_RUN`. AUD-P0-01 through AUD-P0-04 stay OPEN/BLOCKING. The 148 original experiments stay TEST_PLANNED/NOT_RUN. GitHub #25 and Linear SER-134 were already closed and Done; this section does not move them.

**Owner action:** review the documentary draft that contains this section. Merge it only to accept the record. Do not treat the merge as financial G5, and do not start provider, Stripe, MongoDB, or production work from it.
