# Local bootstrap — M01-BOOTSTRAP-01

This is the nonfinancial Nx/pnpm + NestJS foundation for GitHub #25 / Linear SER-134. It does not deploy Kubernetes, MongoDB, Stripe, CommerceCloud, or eGame, and it does not mark G5.

## Pinned toolchain

| Tool | Version | Where it is pinned |
|---|---|---|
| Node.js | 24.22.2 | `.mise.toml`, `.node-version`, `package.json` `engines` |
| pnpm | 11.10.0 | `.mise.toml`, `package.json` `packageManager` |
| Nx and direct `@nx/*` | 23.3.1 | `package.json` |
| `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express` | 11.2.8 | `package.json` |
| `@nestjs/cli` | 11.0.24 | `package.json` |
| TypeScript | 5.9.3 | `package.json` |
| rxjs | 7.8.2 | `package.json` |
| reflect-metadata | 0.2.2 | `package.json` |

Do not change the system-wide Node.js or pnpm installation. `.mise.toml` applies only in this repository when mise is activated. A cloud or CI shell that still has another Node on `PATH` must enter the mise environment, or install the same patch through `actions/setup-node` as the PR workflow does.

## Install mise without replacing the system runtime

```bash
curl -fsSL https://mise.run | MISE_INSTALL_PATH="$HOME/.local/bin/mise" sh
export PATH="$HOME/.local/bin:$PATH"
cd /path/to/ecommerce
mise trust
mise install
eval "$(mise activate bash)"
node --version   # v24.22.2
pnpm --version   # 11.10.0
```

`mise activate` in a shell does not rewrite the OS package manager. Leave the global Node.js alone.

## Frozen install

```bash
pnpm install --frozen-lockfile
```

Do not pass `--force`, `--legacy-peer-deps`, `--ignore-scripts`, or `--no-frozen-lockfile`. If peers cannot resolve, stop and record the registry error. Do not float the pinned versions silently.

pnpm 11 denies dependency lifecycle scripts unless `pnpm-workspace.yaml` `allowBuilds` lists them:

- `nx`: `postinstall` checks the supported platform and returns. The same file can update an Nx Cloud client only when Nx Cloud is enabled. `nx.json` sets `neverConnectToCloud`, so that branch is not used.
- `@parcel/watcher`: `install` runs `scripts/build-from-source.js`, which spawns `node-gyp` only when `npm_config_build_from_source=true`. The normal install uses the published platform package.

`unrs-resolver@1.13.0` is present for ESLint resolution and has no `install`, `preinstall`, or `postinstall` script, so it is not allowlisted. No other package is granted a build script. `dangerouslyAllowAllBuilds` is not set. `@typescript-eslint/*` is pinned to 8.72.2 so the install does not need a `minimumReleaseAgeExclude` bypass.

## Quality commands

```bash
pnpm exec nx run-many -t lint typecheck test build secret-scan --parallel=3 --output-style=static
pnpm exec nx format:check
pnpm exec nx run commercecore-catalog-domain:architecture --output-style=static
mkdir -p tmp
pnpm exec nx graph --file=tmp/nx-graph.json
node tools/architecture/assert-project-graph.mjs tmp/nx-graph.json
```

Targets:

| Target | Projects | What it does |
|---|---|---|
| `build` | `commercecore-api`, `commercecore-catalog-domain` | `tsc` emit |
| `typecheck` | both | `tsc --noEmit` for library/app and specs |
| `lint` | both | ESLint, including Nx module boundaries |
| `test` | both | Node.js test runner on compiled specs |
| `architecture` | `commercecore-catalog-domain` | Writes a NestJS import fixture and a mocked CommerceCloud private-adapter import, expects both lints to fail, deletes the fixtures, and expects a clean lint |
| `secret-scan` | `ecommerce` workspace project | Scans the tree for credential-shaped strings and forbidden filenames |
| `nx format:check` | workspace | Prettier check for files not excluded by `.prettierignore` |

`NX_DAEMON=false` and `NX_NO_CLOUD=true` keep graph and CI runs local. Nx Cloud is not configured.

## Run the API

```bash
cp .env.example .env.local
set -a
source .env.local
set +a
pnpm exec nx build commercecore-api
node dist/apps/commercecore-api/main.js
```

`.env.local` is gitignored. The example file contains only public values. The process binds `127.0.0.1` only. `GET /health/live` returns HTTP 200 and a liveness payload with `dependenciesChecked: false`. It does not claim business readiness. `/health/ready` is intentionally absent.

## Local representative demo

[LOCAL_REPRESENTATIVE_DEMO.md](LOCAL_REPRESENTATIVE_DEMO.md) is a sandbox command over this same liveness route and the pedagogical `ProductId`. It does not add a business API, and it does not pass G5.

Missing or invalid `COMMERCECORE_*` values exit 1 with a JSON line naming the field and reason. The process does not copy the rejected value into that line.

## Layout

- `apps/commercecore-api`: NestJS composition root and `GET /health/live`.
- `libs/commercecore/catalog/domain`: pedagogical immutable `ProductId` only. It is not a Product, Offer, or Quote model.
- `tools/architecture-fixtures/commercecloud-private-adapter.ts`: mocked private adapter. CommerceCloud itself is not generated. The negative test's scope is this fixture path, not a future Cloud project graph.

## Failure diagnostics

| Symptom | Meaning |
|---|---|
| `engines` mismatch | The shell is not on Node 24.22.2 or pnpm 11.10.0. Activate mise in this repository. |
| Frozen install wants to change `pnpm-lock.yaml` | The tree does not match the lock. Do not refresh it to hide drift. |
| `nx format:check` says `main` is unknown, or a push to `main` checks no files | Nx uses `defaultBase` `main`. If that revision cannot be resolved, Nx formats every file. On a pull request, compare the fetched base ref with the checkout SHA. On a push to `main`, compare `github.event.before` with `github.sha`. Do not point a local `main` ref at the push commit: that range is empty, so the check passes without reading the pushed files. Do not reformat historical documents to hide either failure. |
| Ignored build scripts warning for a package outside `allowBuilds` | Expected for packages that were not reviewed. Add one only after reading its script and only if the build cannot run without it. |
| Architecture target leaves `__negative__` | The script removes that directory in a `finally`/`exit` path. Delete `libs/commercecore/catalog/domain/src/__negative__` and re-run. |
| `config.invalid` on stderr | A public variable is missing, invalid, forbidden, or unsupported. Fix the named field. Do not put credentials in `COMMERCECORE_*`. |

## Branch and commit policy

Use one reviewable branch from current `main`. Commit subjects follow `type(scope): subject`. Do not add `Co-authored-by` trailers. The git author recorded by the environment must stay the real committer; do not rewrite it to `@sergio-tr` when the environment identity is different. Open a draft pull request. Do not merge it from automation.

## Out of scope

Kubernetes, Helm, k3d, MongoDB, Stripe, Kafka, CommerceCloud and eGame generators, authentication, license keys, money movement, production configuration, and automatic merge are not part of this bootstrap.
