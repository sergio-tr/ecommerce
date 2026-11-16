# Cursor implementation handoff — M01-BOOTSTRAP-01

**Authority:** [AUTH-2026-11-16-M01-BOOTSTRAP-01](../../00-governance/OWNER_G3_G4_AUTHORIZATION_2026-11-16.md). **Scope-specific G3 PASSED** and **G4 GRANTED** by owner. Effective only after the authorization PR has merged to `main` and `origin/main` HEAD is re-checked. **No automatic code-PR merge, G5 verification or provider operations.**

**Task identity:** GitHub [#25](https://github.com/sergio-tr/ecommerce/issues/25), Linear [SER-134](https://linear.app/sergiotr/issue/SER-134), `M01-BOOTSTRAP-01`. **Accountable owner:** @sergio-tr. **Executor:** Cursor Cloud Agent through Slack #ecommerce, with ChatGPT orchestrating validation; owner reviews/edits/accepts/rejects the resulting PR.

## Single atomic implementation story

Produce a reproducible, minimal Nx/pnpm + NestJS engineering foundation from current `main`: a single Nest app `apps/commercecore-api` with a nonsecret `GET /health/live`, a pure isolated `libs/commercecore/catalog/domain` library containing a minimal immutable `ProductId` and unit tests, enforceable negative architecture-import tests, Nx quality targets, and secure SHA-pinned minimal PR CI. Nothing financial, no product commercial aggregates and no Docker/K8s/Mongo/Stripe integration.

## Required preflight in Cursor environment

1. Read the current merged owner authorization, original issue #25, [Definition of Ready](M01_BOOTSTRAP_01_DEFINITION_OF_READY.md), [readiness JSON](m01-bootstrap-01-readiness.json), decision register and accepted M01-D01/D02/D06/D07/D08. Verify `main` SHA via `git fetch origin && git rev-parse origin/main`; preserve it in handoff. If the authorization record is **not merged on main**, STOP; no product code until effective.
2. Ensure no previous M01 implementation PR/branch exists; never overwrite another agent's work. Use `feature/m01-bootstrap-workspace` only if unoccupied, otherwise a clearly traceable issue-scoped `feature/m01-bootstrap-workspace-<suffix>`. One draft PR, no merge.
3. Use **per-project** `.mise.toml` to select Node 24.22.2 and pnpm 11.10.0, preserve system/global defaults. Lock `Nx/@nx/* 23.3.1`, `NestJS core 11.2.8`, `@nestjs/cli 11.0.24`, TypeScript 5.9.3, rxjs 7.8.2, reflect-metadata 0.2.2 if registry compatibility remains valid. Verify exact peer graph and run frozen installation; no `--force`, `--legacy-peer-deps`, `--ignore-scripts` or `--no-frozen-lockfile` workaround to fake success.
4. With pnpm 11, whitelist only necessary **reviewed** `allowBuilds` entries (candidate: `nx`, `@parcel/watcher`, `unrs-resolver`) in workspace configuration. Verify why each build script is required. Never globally approve package scripts.
5. Cloud Environment was initially documented with Python/jq/Git only: if Node/mise versions absent in cloud, install/project-pin reproducibly inside its isolated setup and document commands. Do not assume the user's WSL installation exists in the cloud. Avoid network permissions or secrets unless strictly required for public dependency registry, and use no paid services.
6. Owner's WSL2 DR08 and isolated installer peer smoke are **prior user-reported evidence**, not proof of fresh Cloud bootstrap. Recheck branch + tools in the executing environment.

## Code and contract requirements

- `GET /health/live`: HTTP 200, clearly stable response and version, no DB/provider checks and no secrets. Do not pretend it is an end-to-end business readiness signal. `/health/ready` is optional only if it remains truthful.
- Pure Domain cannot import `@nestjs/*`, persistence adapters, network clients, UI or other bounded contexts' private code. Use explicit architecture rules and **negative fixture** that intentionally introduces forbidden dependencies and makes the check fail. Restore fixture and re-run green.
- `ProductId` is **pedagogical only** and must not imply approved Product aggregate/Offer/Quote model.
- PR workflow uses minimal `permissions: contents: read`, pinned exact immutable SHA for third-party actions, least privilege and no secrets; CI must run install/build/lint/test/architecture/format targets. Avoid privileged triggers and auto-publishing packages.
- All source, code and docs English, Conventional Commits; real author must be accurately reported, no impersonation of @sergio-tr by agent identity; no fabricated coauthors.
- Explicitly exclude CommerceCloud/eGame generators, K8s/k3d/Helm, MongoDB, Stripe, license keys, authentication production integration, Kafka, money flow and deployment.

## Acceptance evidence — AC01..AC14 (actual outputs required)

| AC | Evidence expected from Cursor and owner review |
|---|---|
| AC01 | clean clone and `pnpm install --frozen-lockfile` successful; lockfile unchanged |
| AC02 | `nx graph`/project graph confirms one initial Core app + pure domain lib without forbidden dependency cycles |
| AC03 | build/typecheck pass, Domain lacks forbidden direct runtime deps |
| AC04 | actual `GET /health/live` returns HTTP 200 with safe version payload |
| AC05 | valid and invalid `ProductId` unit tests pass |
| AC06 | intentionally forbidden NestJS import fixture produces failing architecture check; restored code passes |
| AC07 | forbidden private cross-context import fixture fails (if target not generated, use fixture/mocked target and honestly state its scope) |
| AC08 | lint, format, typecheck, tests all pass with documented Nx targets |
| AC09 | actual PR CI run completes on the exact branch/SHA and publishes logs |
| AC10 | safe behavior on missing/invalid nonsecret configuration, no credentials in messages |
| AC11 | repository/generated artifact secret scan returns no actual secrets |
| AC12 | diff confirms no excluded deployment/provider/business implementation |
| AC13 | original commit metadata/real author, Conventional Commits, no fake Co-authored-by lines; report any actor policy mismatch for owner review |
| AC14 | clean repeat frozen install and quality check reproduces results |

Every AC is `NOT_RUN` until demonstrated. Logs and commands must include exact exit codes and PR commit SHA; an environment build passing Python/jq checks is **not** AC09.

## Human review and stop policy

- Stop if a fundamental peer incompatibility or dependency supply-chain problem requires changing pinned versions: offer a compatible, evidenced candidate and obtain approval at exact issue scope.
- Stop and ask for an explicit decision if any domain/invariant/Stripe behavior/physical Mongo license/identity policy not approved would have to be invented.
- STOP after draft PR and evidence; no merge, product release, live payments, cloud charges or user impersonation. Never modify unrelated repositories.
- Status messages: `[CC_CURSOR_CLAIMED]`, `[CC_CURSOR_COMPLETED]` or `[CC_CURSOR_BLOCKED]`, with task ID `SER-134-M01-BOOTSTRAP-01-IMPLEMENTATION`, branch/sha, files, AC01..AC14, CI and follow-up.
- After review, owner may accept, request changes or reject. **G5** only after actual verification. Subsequent M01-K8S-01/M01-DATA-01 have their own G3/G4 entries.

**No need to globally update Node.js or pnpm on WSL2.** Architecture is explicitly evolvable; accepted business constraints survive later adapter changes.
