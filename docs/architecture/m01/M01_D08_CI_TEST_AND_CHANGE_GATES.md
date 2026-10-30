# M01-D08 — CI, Test Architecture, Change Control and Evidence Contract

**Status:** DOCUMENTARY G3 SPECIFICATION COMPLETE FOR REVIEW; NO WORKFLOW OR RUN EXECUTED.
**Owner / single accountable author:** @sergio-tr.
**Depends on:** M01-D01 toolchain, D02 dependency rules, D04 image/Helm policy, D06 secret restrictions, D07 evidence schema.

## Pipeline decision

**Recommended M01 CI:** GitHub Actions, with pinned full-length action SHAs, read-only `GITHUB_TOKEN` for PR checks, Nx affected tasks, immutable pnpm lock and automatic architecture negative tests. No CI auto-merge, no direct push to main, no live deploy, no automatic Stripe call and no cloud secret access for untrusted branches.

Do not make a full Kubernetes cluster mandatory for every PR unless measured CI budget shows it is sustainable. First split **fast deterministic PR checks** from **local/on-demand Kubernetes integration evidence**.

## Ownership / contributor constraints

- All repository documentation, action summaries, issue titles and software-generated evidence in **English**.
- Branches: `feature/*`, `bugfix/*` or other previously approved dedicated branch categories; protected main; no direct authoring/merge bypass.
- Conventional Commit: `feat(scope):...`, `fix(scope):...`, `chore(scope):...`, `docs(scope):...`, `test(scope):...`.
- Git commit authorship and responsibility belong to @sergio-tr. Do not add `Co-authored-by`, `Signed-off-by` describing external AI agents or agent contributor attribution. Avoid changing historical commits retroactively.
- Keep no unreviewed issue generation; cross-link existing Linear/GitHub IDs or create new implementation items only after G3 and explicit authorization.

## Pipeline phases

| Stage | Trigger | Proposed checks | Pass requirement / dependency |
|---|---|---|---|
| C0 Source and policy | pull request to main | permitted branch, English doc/schema format, conventional commit validation, no secret/PII fixture leakage, no unauthorized generated artifact | source policy pass, never alter authorship |
| C1 Dependencies | pull request | pinned Node/pnpm, `pnpm install --frozen-lockfile`, dependency peer/engine resolution | lockfile reproducible, no `--force` |
| C2 Build/static | pull request | `nx affected --target=lint`, typecheck, build/test for touched projects with correct target names; consistent Nx graph | all affected apps/libs compile; graph acyclic |
| C3 Architecture | pull request | Nx tag restrictions + standalone negative import fixtures (Domain imports NestJS, Core reads Cloud adapters, domain directly imports Stripe) | prohibited imports **fail as expected**; normal allowed imports pass |
| C4 Test and coverage | pull request | domain/application unit tests, config failure tests, public contract schema tests as implemented | deterministic pass and recorded coverage; no invented success |
| C5 Dev artifact | on-demand after image/build implementation | Docker image build, `helm lint/template`, manifest schema checks; scan for secret literals | immutable provenance, valid render, no secrets |
| C6 Local cluster integration | manual/on-demand after M01-K8S-01 authorization | k3d create/teardown, ingress/API replicas, SQLite? **NO** — proper Mongo/ClusterIP only when D05 ready, Pod health and cleanup | logs and observed Kubernetes status attached, no production resources |
| C7 Provider resilience | independently authorized M04 task only | Stripe test-mode, Mongo fault/unknown commit, key disclosure tests | audited provider evidence; never made precondition for basic M01 bootstrap |

**Correction:** C6 does not require Mongo or any dummy DB to prove a stateless API health endpoint; add D05 integration as a separate scoped test.

## Test pyramid and explicit obligations

- **Domain unit:** pure invariants, money/IDs only when domain accepted, no network.
- **Application unit:** ports mocked, negative authorization/unknown outcomes explicit.
- **Architecture:** import/tag/graph rules must fail on intentionally invalid fixture.
- **Contract:** OpenAPI/JSON Schema and versioned event compatibility before cross-context integration.
- **Integration:** actual Mongo replica-set driver/transaction behaviors after D05; k3d Services/Ingress after D03/04.
- **End-to-end:** eGame and sandbox Stripe after M04 contract approval; mocks cannot be called external-provider verification.
- **Security:** secret detection, least privilege, forbidden account/mode, cross-tenant negatives once actors exist.
- **Resilience:** crash after durable intent and unknown responses, planned for M00 audits not assumed passing now.

**Coverage policy proposed:** require a published coverage report from day one; no fabricated percentage or universal 80% requirement for scaffold-only packages. Future threshold recommendation: >=80% for new domain/application logic after meaningful code exists, excluding empty generated shells with a reviewed rationale. Exact threshold ratification is separate; no historical quality gate silently reinterpreted.

## Workflow safety, cache and provenance

- Default workflow `permissions: contents: read`; narrowly grant stronger permissions only in separately reviewed jobs.
- Third-party actions pinned by **full commit SHA** and reviewed sources, not mutable tags.
- Use `pull_request` rather than `pull_request_target` for untrusted contributor code; no repository deployment credentials in PR workflows.
- Cache should not include `.env.local`, Stripe keys, Kubernetes kubeconfig, generated license datasets or any secret.
- Report Node/pnpm/Nx versions, commit SHA, CI job IDs and test artifact checksums in PR checks. Retention/cost caps documented separately.
- Nx affected comparisons need the correct base/head SHA for GitHub PR events; a broken diff base must not silently skip all tests.
- CI workflow changes themselves require review. The platform's branch protection/required status checks must be inspected in GitHub; writing documentation does not establish a repository rule.
- Failing critical checks blocks merge **once branch protection is actually configured and verified**; do not claim such policy is already active.

## Planned checks (TEST_PLANNED / NOT_RUN)

| ID | Intentional condition | Expected result |
|---|---|---|
| M01-D08-T01 | Clean PR with valid lock and import graph | all fast checks PASS with links to logs |
| T02 | Domain depends on NestJS | architecture check fails |
| T03 | Core domain imports Cloud adapter | architecture check fails |
| T04 | Unpinned/action tag or excessive token permissions | security policy check fails |
| T05 | Literal test Stripe secret in fixture | secret scan blocks PR |
| T06 | Missing lockfile / `pnpm install` needs mutation | frozen install fails |
| T07 | PR commit violates Conventional Commit | check fails, no author overwrite |
| T08 | Nx affected base/head omitted | fails safely rather than skipping changed projects |
| T09 | Generated Helm values contain credential | render/scan fails |
| T10 | Cache includes private env | policy fails |
| T11 | Manual local K8s test job | evidence includes cluster version, Pod identities, rollback, teardown |
| T12 | CI rerun after correction | same version/lock dependencies and stable outcome |
| T13 | Untrusted fork PR tries to read secrets | no sensitive secrets present |
| T14 | Tests not run | report remains NOT_RUN; no fake green badge |

## Evidence and G3 DoD

**Documentary contract complete:** triggers, permissions, staging, test taxonomy, negative cases, cache and required status checks specified. **Unverified:** exact Actions SHA pins, Nx target syntax for the generated workspace, CI runner compatibility and actual GitHub branch protection configuration. Those belong to authorized bootstrap and its acceptance evidence.

**M01-D08 is not a claim of configured GitHub Actions.** No YAML workflow or implementation issue was created.

Official references: https://docs.github.com/en/actions/reference/security/secure-use ; https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax ; https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches ; https://nx.dev/ci/features/affected
