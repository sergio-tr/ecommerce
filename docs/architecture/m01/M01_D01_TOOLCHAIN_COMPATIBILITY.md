# M01-D01 — Toolchain Versions and Compatibility Contract

- **Status:** TECHNICAL SPECIFICATION — SUPPORTED VERSION RANGES VERIFIED AGAINST PUBLISHED UPSTREAM DOCUMENTATION; INSTALLATION/PEER/BUILD NOT EXECUTED
- **Scope decision:** K2 / NET-A / DATA-A / STRIPE-A ACCEPTED 2026-10-30
- **Owner:** @sergio-tr
- **Prerequisites:** ADR-M01-001
- **G3 evidence:** `OFFICIAL_MATRIX_REVIEWED`; `CLEAN_INSTALL_AND_BUILD_PENDING`
- **Implementation:** NOT AUTHORIZED

## Selection: stable integration baseline, not newest-major-at-all-costs

Use a version cohort explicitly covered by Nx's **published Angular + Nest compatibility matrices**. Do **not** mix Angular 22/TypeScript 6/Nest 12 with an `@nx/nest` plugin whose published requirements still list Nest 10/11, unless a separately validated compatibility experiment demonstrates support.

| Component | Proposed exact initial patch/reference | Published support and compatibility basis | Evidence status |
|---|---|---|---|
| Node.js | **24.22.2 LTS** | Angular 21.2 allows Node `^24.0.0`; Nx 23 supports Node 24; official Node.js patch was published Oct 28 2026 | VERIFIED BY OFFICIAL RELEASE/MATRICES, not installed |
| pnpm | **11.10.0** initial pin (published version existence from pnpm official installer guidance; recheck registry integrity) | pnpm 11 supports Node >=22; Node24 included; use Corepack `packageManager` exact and lockfile | PUBLISHED SUPPORT VERIFIED; exact package-integrity validation pending |
| Nx CLI | **23.3.1** | Nx 23 LTS; Nx 23.3.1 listed in official changelog; compatible with Angular 21.2 per `>=22.6` matrix | VERIFIED BY OFFICIAL MATRIX; actual workspace not scaffolded |
| `@nx/angular`, `@nx/nest`, `@nx/js`, `@nx/node` | **23.3.1**, all same exact Nx package version | Nx requires all `@nx/*` packages in lockstep. Published `@nx/nest` supports Nest 10/11 | VERIFIED RANGE; per-generator execution pending |
| Angular core/CLI | **21.2.x** (candidate Angular core patch **21.2.25**) | Angular 21.2 allows Node `^24`, TypeScript `>=5.9 <6`, RxJS `^7.4`; Nx 23.3 supports Angular 21.2 | VERIFIED CORE PATCH/RANGES; angular-cli exact patch must be checked before lock |
| TypeScript | **5.9.3** | Within Angular 21.2 range and Nx 23 TS range; official TypeScript 5.9.3 exists | VERIFIED RANGE/PATCH |
| RxJS | **7.x**, exact patch to confirm from registry | Angular 21.2 accepts `^7.4.0`; Nest11 compatible peer must be resolved in lockfile | RANGE VERIFIED; patch and peer acceptance pending |
| NestJS core/common/platform | **11.2.8** | Official 11.2.8 release Oct 23 2026, published `@nx/nest` requirement `^10 || ^11`; TypeScript 5.9 compatible via Nx TS range | VERIFIED MAJOR/RANGE, generator execution pending |
| k3d | **v5.9.0** | Official GitHub release listed June 2026; local Docker-based K3s manager | PATCH EXISTS; interaction with selected K3s image untested |
| K3s / Kubernetes API | **v1.37.1+k3s1** | Official K3s release published Sept 30 2026; Kubernetes 1.37 in current three-minor support window | PATCH EXISTS; k3d/k3s pair not executed |
| kubectl | **1.37.1** candidate, must obtain official binary and checksum | Official client skew is within ±1 Kubernetes minor; exact 1.37 matches server minor | MINOR MATRIX VERIFIED; patch/tooling download pending |
| Helm | **v4.3.1** | Official v4.3 release supports Kubernetes 1.37–1.34, and 4.3.1 released Oct 15 2026 | OFFICIAL HELM/K8S MATRIX VERIFIED |
| Docker Engine / Desktop and WSL | **PENDING host inspection** | k3d requires a working container runtime; no user's installed Docker daemon, WSL version, resource allocation or filesystem path inspected | NOT VERIFIED; cannot pin blindly |
| Traefik (bundled) | **Match selected K3s distribution** | Use the ingress controller actually shipped/enabled with chosen K3s tag; check deployment/chart revision on cluster | PHYSICAL INTEGRATION NOT VERIFIED |

**Version governance:** this is an initial, exact-release candidate selection from authoritative release pages. A published compatible *range* is not proof a particular peer dependency tree installs, that all Nx generators work, or that host Docker/k3d/k3s versions interoperate. Freeze `packageManager`, lockfile, runtime file (`.node-version` or equivalent), Docker base image digest, Helm/kubectl and k3d/K3s tag only after inspection and passing M01-D01 verification. Do not write an untested package lockfile into a documentation-only branch.

## Explicit comparison to recent majors

| Cohort | Advantages | Published blocker/gap | Decision |
|---|---|---|---|
| Node24 + Nx23.3 + Angular21.2 + TS5.9 + Nest11 | Cross-matrix-supported combination; easier first CI and Nx generators | Not newest major release; future planned upgrade | **RECOMMENDED INITIAL LOCK** |
| Node24 + Nx24 + Angular22 + TS6 + Nest12 | More recent Angular/Nest features | Current published `@nx/nest` docs list support `^10 || ^11`; no confirmed v12 generator compatibility; Nx24 newly released Oct 21 | **DO NOT CLAIM VERIFIED**; optional M01 experiment after initial reproducible baseline |
| Node26 + newest majors | Learning new runtime | Not required for initial K8s learning; increases compatibility matrix to verify | DEFER pending actual peer/probe tests |

## Verification gates (all TEST_PLANNED, not executed)

1. `node --version` matches locked v24.22.2; `pnpm --version` matches locked pin; check `corepack` availability/version before choosing provisioning method.
2. Registry metadata confirms exact version of `@angular/cli`, `@nx/angular`, `@nx/nest`, `@nestjs/core`, `@nestjs/cli`, TypeScript and RxJS; inspect all `peerDependencies` and `engines`. No `--force` or `--legacy-peer-deps`.
3. Fresh Nx workspace with one Nest app and Angular app, `pnpm install --frozen-lockfile`, `pnpm nx graph`, build/typecheck/test all pass. This is a later *authorized implementation verification*, not performed in design phase.
4. `docker version` client+server, `kubectl version --client`, `helm version`, `k3d version` and cluster `kubectl version` captured when local environment becomes available.
5. `kubectl` minor 1.37 supported against K3s API 1.37; Helm 4.3 with API 1.37. K3s image digest and Traefik version captured after create, no implicit auto-update.

## Primary evidence URLs (checked 2026-10-30)

- https://angular.dev/reference/versions
- https://nx.dev/docs/kb/angular-nx-version-matrix
- https://nx.dev/docs/technologies/node/nest/introduction
- https://nx.dev/docs/reference/releases
- https://nx.dev/changelog
- https://nodejs.org/en/blog/release
- https://pnpm.io/installation
- https://github.com/nestjs/nest/releases
- https://github.com/microsoft/TypeScript/releases
- https://github.com/k3d-io/k3d/releases
- https://github.com/k3s-io/k3s/releases
- https://kubernetes.io/releases/version-skew-policy/
- https://docs.helm.sh/el/docs/topics/version_skew/
- https://github.com/helm/helm/releases

## G3 review outcome

**SOURCE_COMPATIBILITY_VERIFIED / PHYSICAL_INSTALL_COMPATIBILITY_PENDING.** This specification is sufficiently concrete to authorize a *future* first reproducibility spike, but not to certify that M01-D01 is executed or to authorize code without G4.
