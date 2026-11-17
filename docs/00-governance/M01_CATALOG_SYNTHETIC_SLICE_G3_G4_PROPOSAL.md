# Proposal — local synthetic catalog slice G3/G4

**Decision ID:** `PROP-2026-11-17-M01-CATALOG-SYNTHETIC-01`  
**Status:** `PROPOSED_NOT_RATIFIED`  
**Date:** 2026-11-17  
**Accountable owner:** @sergio-tr  
**Base reviewed:** `origin/main` `e67480c6372af4b106f06f7c8a91be70885f8eb2`  
**Open pull requests at review:** none. **Running agent:** this documentation task only.  
**This file grants nothing.** Merging it does not pass G3, grant G4, or authorize HTTP implementation.

## Verdict

The suggested create/list/get/update catalog HTTP slice is **not ratified**. A separate G3 and a separate G4 are required before any business or synthetic catalog endpoint is written. No exact proposal for these routes already exists on `main`.

`AUTH-2026-11-16-M01-BOOTSTRAP-01` passes G3 and grants G4 only for the nonfinancial Nx/NestJS foundation: `GET /health/live` and a pedagogical `ProductId`. It says later slices need their own G3/G4. The domain type states it is not a Product, Offer, Quote, or catalog model. [M01 admission matrix](M01_SCOPED_G3_G4_START_CONDITIONS.md) still lists M03 Catalog/Listing/Offer/Quote as **exact G3 outstanding**.

## What is already accepted, and what is not

| Source | What it actually accepts | What it does not accept |
|---|---|---|
| [AUTH-2026-11-16-M01-BOOTSTRAP-01](OWNER_G3_G4_AUTHORIZATION_2026-11-16.md) | One Nest app, `GET /health/live`, immutable pedagogical `ProductId`, domain import bans, pinned CI | Any later HTTP route, aggregate, or adapter |
| `libs/commercecore/catalog/domain` | `prd_` plus 26 Crockford base32 characters; invalid input raises `InvalidProductIdError` and does not echo the input | Product, Variant, SKU, price, stock, Offer, or Quote |
| [Context map](../03-domain/context-map.md) | Catalog owns Product, Variant, namespaces, schemas, and inheritance; it must not own a price captured on an accepted Order | HTTP shapes, tenants on the wire, or an in-memory store |
| [M00.4 ports](../architecture/m00/M00_G3_PUBLIC_PORTS_AND_EVOLUTION_CONTRACTS.md) | Illustrative `Catalog.GetVariant(tenant, variantId, revision?)`; not a ratified API | Tenant, Variant, revision schema, and price authority |
| [B01](../planning/wave1/B01_RATIFICATION_RECORD.md) / CAP-CAT-004 | Store-owned Product/Variant **direction** for a later M04 slice | Field list, routes, and master/local override behavior. [M04 review](../planning/wave1/M04_29_DECISION_REVIEW.md) still marks the specification incomplete |
| M00.2 | StockPool, Reservation, and DigitalLicense remain design work | Stock, reservation, and license behavior |
| M00.3 | Tenant and actor trust remain design work | A client-supplied tenant or store id on this slice |

AUD-P0-01..04 stay **OPEN/BLOCKING**. The 148 original experiments stay **TEST_PLANNED/NOT_RUN**. This proposal does not change either register.

## Smallest increment

Do not implement M03. Do not add Product, Variant, SKU, Offer, Listing, Quote, Money, tax, stock, or tenant.

If the owner wants the next local functional test, the smallest contract that stays inside the accepted identity is one **process-local synthetic entry**. Its only identity is the existing `ProductId`. One noncommercial mutable label and one technical revision exist so update can be tested. Those two fields are **not** accepted yet; they are the decision in this proposal.

Rejected alternatives:

- Commercial `/products` CRUD now. CAP-CAT-004 has no ratified field list, and M00.4 `GetVariant` is still conceptual.
- Waiting for full Catalog/Listing/Offer/Quote before any local HTTP test. That avoids new fields, and it does not give the requested local create/list/get/update exercise. The owner can choose this by rejecting the proposal.

## Proposed contract, pending owner acceptance

Resource name: synthetic catalog entry. It is not a Product aggregate.

| Method and path | Success | Failure |
|---|---|---|
| `POST /catalog/synthetic-entries` | `201` created entry | `400` invalid id or label; `409` id already stored; `409` process already holds 8 entries |
| `GET /catalog/synthetic-entries` | `200` and `entries` sorted by `productId` ascending | `200` with `entries: []` when empty |
| `GET /catalog/synthetic-entries/:productId` | `200` current entry | `400` malformed id; `404` well-formed unknown id |
| `PATCH /catalog/synthetic-entries/:productId` | `200` current entry | `400` malformed id or label; `404` unknown id; `409` revision mismatch |

Create body:

```json
{
  "productId": "prd_01ARZ3NDEKTSV4RRFFQ69G5FAV",
  "syntheticLabel": "synthetic-entry-a"
}
```

Entry body, also the get and list item shape:

```json
{
  "productId": "prd_01ARZ3NDEKTSV4RRFFQ69G5FAV",
  "syntheticLabel": "synthetic-entry-a",
  "revision": 1
}
```

Update body:

```json
{
  "syntheticLabel": "synthetic-entry-b",
  "expectedRevision": 1
}
```

List body:

```json
{
  "entries": []
}
```

Error body, with no submitted id or label:

```json
{
  "code": "PRODUCT_ID_INVALID",
  "reason": "format"
}
```

Allowed `code` values: `PRODUCT_ID_INVALID`, `LABEL_INVALID`, `BODY_INVALID`, `NOT_FOUND`, `DUPLICATE_PRODUCT_ID`, `REVISION_CONFLICT`, `CAPACITY_EXCEEDED`. `PRODUCT_ID_INVALID.reason` is `format` or `type`, matching `InvalidProductIdError`. `LABEL_INVALID.reason` is `format`.

### Identity and invariants

- `productId` is only the pedagogical value object: `prd_` plus 26 Crockford base32 characters, length 30. The prefix remains a teaching example.
- The id is immutable. Update cannot change it.
- `syntheticLabel` matches `^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$`. It is an opaque fixture token, not a commercial name, SKU, description, or price.
- `revision` starts at `1`. A matching `expectedRevision` with a different label increments it by `1`. The same label and the same revision return the current entry and do not increment. A mismatched revision changes nothing.
- A second create with the same id returns `409`, including when the label matches. This slice does not adopt the unratified M00.4 idempotency envelope.
- The map is process-local, keyed by the id string, capped at 8 entries, and empty when the process starts. Restart loses it. There is no MongoDB and no file snapshot.
- No tenant, store, actor, price, currency, stock, Offer, or Quote field is accepted. Unknown JSON fields are `BODY_INVALID`.

### Architecture boundaries

- Label validation, if G4 is granted, belongs in `libs/commercecore/catalog/domain` next to `ProductId`. That library stays free of NestJS, MongoDB, Stripe, and other contexts. Its project dependencies stay empty.
- The in-memory map and HTTP controller belong in `apps/commercecore-api`. The app may import the domain library. The domain library must not import the app.
- No new Nx application and no new deployable service. `tools/architecture/assert-project-graph.mjs` must still see only `commercecore-api` as an app.
- Responses and logs must not add price, sku, stock, currency, stripe, offer, quote, license, or secret fields.

## Tests proposed, all `TEST_PLANNED / NOT_RUN`

These checks do not exist yet and must not be described as executed. They do not change the 148 original experiments.

| Layer | Negative and positive cases |
|---|---|
| Unit | Accept the two ids already used by `product-id.spec.ts`. Reject a non-string, a lowercase body, and a non-`prd_` prefix without echoing the input. Reject an empty, uppercase, or over-long label without echoing it. |
| Integration | In-memory adapter: create, duplicate, list order, get missing, update, stale revision, capacity 8, and a new adapter instance that is empty. |
| HTTP e2e | The four routes above, plus `BODY_INVALID` for an extra field. Assert the error JSON never contains the rejected input. Assert the JSON never contains price, sku, stock, currency, stripe, offer, or quote. |
| Architecture | Existing domain import ban remains red when a fixture imports `@nestjs/*`, `mongodb`, `mongoose`, or `stripe`, then green when the fixture is removed. |

## Synthetic fixture

Use only values already present in the domain test, plus two labels:

```json
{
  "productId": "prd_01ARZ3NDEKTSV4RRFFQ69G5FAV",
  "otherProductId": "prd_01ARZ3NDEKTSV4RRFFQ69G5FAW",
  "syntheticLabel": "synthetic-entry-a",
  "updatedLabel": "synthetic-entry-b",
  "rejectedProductId": "prd_not-valid"
}
```

`prd_not-valid` may appear only inside the fixture file. It must not be printed by the API, the smoke command, or CI logs.

## Local WSL2 smoke, after a future G4 implementation

Not runnable against current `main`. Do not put credentials in the shell, Cursor Cloud, CI, or Slack. Do not change system Node.js or pnpm.

```bash
curl -fsSL https://mise.run | MISE_INSTALL_PATH="$HOME/.local/bin/mise" sh
export PATH="$HOME/.local/bin:$PATH"
mise trust
mise install
eval "$(mise activate bash)"
pnpm install --frozen-lockfile
pnpm exec nx test commercecore-catalog-domain --output-style=static
pnpm exec nx test commercecore-api --output-style=static
node tools/local-catalog-synthetic-smoke/run.mjs
```

Expected versions remain `v24.22.2` and `11.10.0`. Expected smoke output, exit `0`, empty stderr:

```text
local-catalog-synthetic-smoke: boundary=process-local financial=false provider=none persistence=memory
create: http=201 productId=prd_01ARZ3NDEKTSV4RRFFQ69G5FAV revision=1
list: http=200 count=1 first=prd_01ARZ3NDEKTSV4RRFFQ69G5FAV
get: http=200 revision=1
update: http=200 revision=2
missing: http=404 code=NOT_FOUND
invalid: http=400 code=PRODUCT_ID_INVALID reason=format echoed=false
local-catalog-synthetic-smoke: pass
```

The listener must bind `127.0.0.1` only. `GET /health/live` stays as already accepted and is not part of this smoke.

## CI required for a future implementation PR

Keep `.github/workflows/pr-validation.yml`: `pull_request` and `push` to `main`, `permissions: contents: read`, pinned actions, frozen install, and the existing Nx lint, typecheck, test, build, secret-scan, format, architecture, and graph checks. Add the new unit, adapter, and HTTP tests to those existing Nx targets. Cloud CI may use the synthetic fixture only. No secret, Stripe key, MongoDB service, Kubernetes, or external provider.

This documentation pull request is not that evidence. A green docs run does not pass a catalog acceptance criterion.

## Acceptance criteria for a later implementation

All of the following stay `TEST_PLANNED / NOT_RUN` until a scoped G4 exists and the commands have actually been run.

| ID | Criterion |
|---|---|
| AC-CAT-01 | Frozen install from a clean checkout; lockfile unchanged |
| AC-CAT-02 | Unit tests for id and label, including no-echo rejections |
| AC-CAT-03 | Adapter tests for duplicate, order, revision, capacity, and empty restart |
| AC-CAT-04 | HTTP e2e for create, list, get, and update |
| AC-CAT-05 | Negative HTTP cases for invalid id, invalid label, unknown id, stale revision, extra field, and capacity |
| AC-CAT-06 | Domain project still has no dependencies and fails a forbidden NestJS import fixture |
| AC-CAT-07 | Responses contain none of the excluded commercial fields |
| AC-CAT-08 | WSL2 smoke output matches the block above on the owner's machine |
| AC-CAT-09 | `pr-validation` is green on the implementation SHA |
| AC-CAT-10 | Diff contains no Stripe, payment, refund, stock, fulfillment, license, MongoDB, or secret |
| AC-CAT-11 | AUD-P0-01..04 remain OPEN/BLOCKING and the 148 original rows remain TEST_PLANNED/NOT_RUN |
| AC-CAT-12 | Commit author is the real Git author and the message has no co-author trailer |

## Authorization still required

Do not implement these routes until @sergio-tr records a new decision that:

1. Passes G3 only for `PROP-2026-11-17-M01-CATALOG-SYNTHETIC-01`, or records a revised contract.
2. Grants G4 for one new issue and one base SHA, with no automatic merge.
3. Accepts `syntheticLabel`, `revision`, the four routes, the 8-entry cap, and the duplicate-create `409`, or substitutes different noncommercial fields.
4. States that Product, Variant, SKU, Offer, Listing, Quote, Money, tax, tenant, stock, and license remain unratified.
5. Leaves AUD-P0-01..04 OPEN/BLOCKING and the 148 experiments TEST_PLANNED/NOT_RUN.

No Linear or GitHub issue currently covers this slice. SER-134 is the completed bootstrap and does not authorize it.
