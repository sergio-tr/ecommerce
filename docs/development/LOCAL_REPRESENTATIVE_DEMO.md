# Local representative demo

Sandbox command for the behaviors already accepted in M01-BOOTSTRAP-01: pedagogical `ProductId` validation and `GET /health/live`. It uses deterministic synthetic input. It does not call Stripe or any other provider, does not open MongoDB, does not reserve inventory, and does not accept a product, offer, quote, order, or payment model.

M01-BOOTSTRAP-01 nonfinancial G5 is passed for `main` `88b9951dbdbbbf09ddf341ad80eeb359a35133cc` by push run [44058469285](https://github.com/sergio-tr/ecommerce/actions/runs/44058469285). AC07 and AC13 remain the owner-accepted bounded exceptions in [M01_BOOTSTRAP_01_EXECUTION_EVIDENCE.md](M01_BOOTSTRAP_01_EXECUTION_EVIDENCE.md). Financial G5 stays a separate gate. The four AUD-P0 findings stay OPEN/BLOCKING, and the 148 original experiments stay TEST_PLANNED/NOT_RUN.

No credentials, `.env` file, or external account is required. The demo does not set `COMMERCECORE_HTTP_HOST`, so the process keeps the loopback default.

## WSL2 setup

Do not replace the system Node.js or pnpm. From the repository directory:

```bash
curl -fsSL https://mise.run | MISE_INSTALL_PATH="$HOME/.local/bin/mise" sh
export PATH="$HOME/.local/bin:$PATH"
mise trust
mise install
eval "$(mise activate bash)"
node --version
pnpm --version
```

Expected version lines:

```text
v24.22.2
11.10.0
```

## Install, build, and run

```bash
pnpm install --frozen-lockfile
pnpm exec nx run-many -t build --projects=commercecore-api,commercecore-catalog-domain --output-style=static
node tools/local-representative-demo/run.mjs
```

Do not pass `--force`, `--legacy-peer-deps`, `--ignore-scripts`, or `--no-frozen-lockfile`.

Expected standard output, exactly:

```text
local-representative-demo: boundary=sandbox financial=false provider=none
domain: case=accepted result=accepted value=prd_01ARZ3NDEKTSV4RRFFQ69G5FAV frozen=true equalToSynthetic=true
domain: case=rejected result=rejected code=PRODUCT_ID_INVALID reason=format echoed=false
api: GET /health/live http=200 status=live service=commercecore-api version=0.0.0 probe=liveness dependenciesChecked=false host=127.0.0.1
local-representative-demo: pass
```

Expected exit code: `0`. Expected standard error: empty.

The rejected synthetic value `prd_not-valid` is read from `tools/local-representative-demo/synthetic-input.json` and must not appear in the output. The accepted value is the same pedagogical id already used by the domain unit test. `dependenciesChecked: false` means the liveness route did not check a database or a provider.

## Automated checks

Unit tests for `ProductId`, and the API process test that already probes `/health/live`, stay on their existing Nx targets:

```bash
pnpm exec nx test commercecore-catalog-domain --output-style=static
pnpm exec nx test commercecore-api --output-style=static
```

The sandbox command itself is asserted by:

```bash
pnpm run local-representative-demo
```

That runs `node --test tools/local-representative-demo/run.spec.mjs`, which executes `run.mjs` and compares the output above. Node's test reporter adds its own summary lines. The assertions inside the test are the exact demo lines, empty stderr, exit 0, and the absence of the rejected input.

`pr-validation` runs this command after the quality step on `pull_request` and on `push` to `main`, with `permissions: contents: read`. The AC09 record for `88b9951dbdbbbf09ddf341ad80eeb359a35133cc` is the push run linked above. A later pull-request run does not replace that record.
