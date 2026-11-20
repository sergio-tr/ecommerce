# Proposal — next nonfinancial G3 gate after local Mongo

**Decision ID:** `PROP-2026-11-20-CC-NEXT-GATE-01`  
**Task:** `CC-NEXT-GATE-PLANNING-48`  
**Status:** `PLANNING_PROPOSED`  
**Date:** 2026-11-20  
**Accountable owner:** @sergio-tr  
**Linear:** no new issue. [SER-138](https://linear.app/sergiotr/issue/SER-138/m01-mongo-01-local-compose-mongodb-infrastructure-g3) is Done. [SER-137](https://linear.app/sergiotr/issue/SER-137/m01-k8s-01-local-api-image-helm-and-k3d-smoke) is Done. [SER-134](https://linear.app/sergiotr/issue/SER-134/m01-bootstrap-01-reproducible-nxnestjs-engineering-baseline) is Done. [SER-126](https://linear.app/sergiotr/issue/SER-126/aud-p1-05-atomicidad-y-durabilidad-mongodb) stays In Review.  
**GitHub:** no new issue. Open issues on 2026-11-20 are #1–#10, #12, and #13. [#9](https://github.com/sergio-tr/ecommerce/issues/9) stays open. The synthetic catalog slice still has no issue.  
**Proposal base:** `origin/main` `7feccea21e4e38c916818fbaf4446b4becfb37aa`, merge of [PR #62](https://github.com/sergio-tr/ecommerce/pull/62). Push CI [Actions run 44806090077](https://github.com/sergio-tr/ecommerce/actions/runs/44806090077) completed `success` at 20:52 Europe/Amsterdam. Jobs `validate`, `chart`, and `image` each completed `success`.

Merging this file does not accept a new contract, does not grant G4, and does not start an implementation. The questions at the end need a separate owner sentence.

## What is already settled

These statements stay as they are. This file does not reopen them.

| Source | Status on this base | What it settles |
|---|---|---|
| [AUTH-2026-11-16-M01-BOOTSTRAP-01](OWNER_G3_G4_AUTHORIZATION_2026-11-16.md) | G3 passed and G4 granted for SER-134 only | Nx/NestJS foundation, `GET /health/live`, pedagogical `ProductId`. Later slices need their own G3 and G4. |
| [M01-K8S-01](../development/M01_K8S_01_LOCAL.md) | Scoped local G5 `PASSED` | One k3d server and `GET /health/live` on `affde2ce87e7569595598f7bc116819e65a67785`. SER-137 is Done. |
| [PROP-2026-11-17-M01-MONGO-INFRA-01](M01_MONGO_INFRA_G3_PROPOSAL.md) | G3 accepted, `G4_EFFECTIVE_SCOPED`, scoped G5 `PASSED_LOCAL` | Auxiliary local Compose, one member, loopback, named volume. SER-138 is Done. K2 stays the application runtime. |
| [PROP-2026-11-20-D05-MONGO-01](D05_MONGO_DURABILITY_G3_PROPOSAL.md) | `G3_ACCEPTED — DESIGN_ONLY` | Q1=A through Q6=A. Not G4. D05-T01..T10 stay `NOT_RUN`. |
| [PROP-2026-11-17-M01-CATALOG-SYNTHETIC-01](M01_CATALOG_SYNTHETIC_SLICE_G3_G4_PROPOSAL.md) | `G3_ACCEPTED_2026-11-17` / `G4_NOT_GRANTED` | Four process-local routes, `syntheticLabel`, `revision`, eight-entry cap, `409` on a duplicate create. Routes stay unbuilt. |
| [ADR-M01-001](../02-decisions/ADR-M01-001-kubernetes-first-and-test-stripe.md) D-1 K2 | ACCEPTED | The application runtime is local Kubernetes. Compose is not that runtime. |
| ADR-M01-001 D-3 DATA-A | ACCEPTED, not amended | One local replica set and a PVC remain specified. The Compose volume is not that PVC. |
| [REGISTER.md](../04-audit/REGISTER.md) | unchanged | AUD-P0-01..04 OPEN/BLOCKING. AUD-P1-05 OPEN. |
| [decision-register.json](../02-decisions/decision-register.json) | unchanged by this file | `D-05-CONCURRENCY` PENDING. `D-05-OPS` PENDING. |

The M01 sequence in [ROADMAP.md](../06-planning/ROADMAP.md) still lists five items. Item (1) is the completed bootstrap. Item (2) is the image and Helm work inside the completed K8S slice. Item (3) names ingress, ClusterIP, and a two-replica stateless health test. The scoped K8S G5 covers one k3d server and `GET /health/live`, not that two-replica test. Item (4), the MongoDB PVC and owner separation, stays specified and unbuilt. Item (5), Stripe sandbox, stays blocked with the financial audits. The Compose G5 does not complete item (4).

## What this file does not treat as the next authorization

Completing SER-137 and SER-138 does not grant catalog G4. Accepting `D-05-MONGO` as design does not authorize a NestJS Mongo module, a business collection, `commercecore_dev`, `commercecloud_dev`, or the M01-D05 StatefulSet. A green docs run of this pull request does not run AC-CAT-01..12 or D05-T01..T10. The 148 historical experiments stay `TEST_PLANNED` / `NOT_RUN`.

K2 and the local Compose path stay distinct. The API runtime is the Kubernetes deployment. The Compose project is the auxiliary database used for the infrastructure smoke. The synthetic catalog contract, if it is later implemented, stays in process memory and does not attach to either.

## Candidates

| Id | Candidate | Eligible now? | Why |
|---|---|---|---|
| A | Implement [PROP-2026-11-17-M01-CATALOG-SYNTHETIC-01](M01_CATALOG_SYNTHETIC_SLICE_G3_G4_PROPOSAL.md) after a new G4 | G3 exists. G4 does not. | Smallest nonfinancial contract that is already accepted. Process-local memory. No Mongo, Stripe, stock, license, or secret. The 2026-11-17 sentence deferred it because M01-K8S-01 was the next slice. That K8S slice now has its scoped G5. The deferral sentence is not itself a G4. |
| B | New G3 for the two-replica stateless health remainder of roadmap item (3) | No accepted task G3 for that remainder | The closed K8S G5 is one server and `GET /health/live`. A second replica is a new slice. It needs its own G3 and G4. It is infrastructure, and it is larger than a contract that is already accepted. |
| C | Design-only G3 for `D-05-CONCURRENCY` | Design can be written. No code follows from it | Q5 left worker leases PENDING. The operation receipt is not a lease. Useful later. It does not unblock a local nonfinancial route. |
| D | Design-only G3 for `D-05-OPS` | Same as C | Poll interval and alert route stay unselected. Weaker dependency than C. |
| E | Run D05-T01..T10 | No | The durability record says a later evidence unit needs a separate G4. Several rows name Stripe, refund, or reveal. That is not a nonfinancial unit. |
| F | NestJS Mongo module, Core/Cloud databases, or the M01-D05 StatefulSet and PVC | No | R3 leaves `commercecore_dev` and `commercecloud_dev` uncreated. R1 leaves the StatefulSet and PVC specified and unbuilt. `D-05-MONGO` is design only. |
| G | Commercial M03 Product, Variant, Offer, or Quote | No | [M01 admission matrix](M01_SCOPED_G3_G4_START_CONDITIONS.md) still has exact G3 outstanding for that milestone. The synthetic slice is not that milestone. |
| H | AUD-P0-01..04, Stripe, Inventory, or Fulfillment | No | Those audits stay OPEN/BLOCKING or OPEN. No financial G4 exists. |

## Recommendation

Candidate A is the next sequenced unit, and it stays blocked until the owner answers Q1 and Q2 below.

The unit that may follow those answers is one implementation pull request of the existing synthetic catalog contract. That pull request is not this one. Before it, the owner sentence has to grant G4 for that contract alone, name one new issue, and name the base SHA. This file does not create the issue and does not grant G4.

Candidate B stays available if the owner wants the unfinished Kubernetes remainder before any catalog route. Candidate C is the fallback if the owner rejects A and still wants a docs-only unit. This file selects neither B nor C.

## Scope of a later A implementation

The later pull request, if Q1 and Q2 are both A, copies the accepted contract and does not widen it.

- Four routes under `/catalog/synthetic-entries`, the label pattern, the revision, the eight-entry cap, and `409` on a duplicate create.
- Storage is process memory. Restart clears it. No Mongo client, no Compose edit, no volume, and no Kubernetes chart edit.
- Responses omit Product, Variant, SKU, Offer, Listing, Quote, Money, tax, tenant, stock, and license fields.
- AC-CAT-01..12 in the catalog proposal stay the acceptance list. They stay `TEST_PLANNED` / `NOT_RUN` until that later pull request actually runs them.
- AUD-P0-01..04 stay OPEN/BLOCKING. The 148 historical rows stay `TEST_PLANNED` / `NOT_RUN`.

## Definition of ready for that later implementation

All of the following have to be true before an agent starts the implementation. None of them become true by merging this file.

1. This proposal is merged and the push CI of that merge is green.
2. The owner answers Q1=A and Q2=A in a separate sentence.
3. That sentence names one GitHub or Linear issue that does not already exist, and the base SHA the branch starts from.
4. No other agent and no open pull request are active.
5. The contract text is still the 2026-11-17 acceptance. A field change is a new G3, not a G4.

## Definition of done for this planning unit

This unit is done as a proposal when all of the following are true.

- This file records the settled baseline, the candidates, one recommendation, and the owner questions.
- Catalog G4 stays `G4_NOT_GRANTED` in [M01_CATALOG_SYNTHETIC_SLICE_G3_G4_PROPOSAL.md](M01_CATALOG_SYNTHETIC_SLICE_G3_G4_PROPOSAL.md).
- `D-05-MONGO` stays `G3_ACCEPTED — DESIGN_ONLY`. `D-05-CONCURRENCY` and `D-05-OPS` stay PENDING.
- AUD-P0-01..04 stay OPEN/BLOCKING. AUD-P1-05 stays OPEN. SER-126 stays In Review. GitHub #9 stays open.
- D05-T01..T10 and the 148 historical experiments stay `NOT_RUN`.
- No application code, Compose file, chart, secret, volume, or workflow file changes.
- An independent reader can see that K2 is the application runtime and that Compose is only the auxiliary database path.

## Owner questions

Answer by a separate sentence. Merging this pull request is not that sentence.

| Id | Question | Recommended answer, still unratified |
|---|---|---|
| Q1 | Is the next nonfinancial unit the already-accepted synthetic catalog slice? | A. Yes. G4 stays ungranted until Q2. |
| Q2 | May a later sentence grant G4 for that slice only, with one new issue and one base SHA, and with no Mongo, Stripe, stock, license, or commercial catalog field? | A. Yes. This file is not that sentence. |
| Q3 | Leave the two-replica health remainder, the StatefulSet and PVC, NestJS Mongo, the Core and Cloud databases, D05-T01..T10, `D-05-CONCURRENCY`, `D-05-OPS`, and every financial slice unstarted? | A. Yes. |
| Q4 | If Q1 is not A, is the fallback a design-only `D-05-CONCURRENCY` G3 with no lease and no code? | A, only as the fallback. It is not selected while Q1 stays unanswered. |

## Out of scope

- Writing the four catalog routes or their tests.
- Granting catalog G4, M03 G3, or a durability evidence G4.
- Editing Compose, the pinned image, the smoke scripts, or either named volume.
- A Kubernetes replica change, a StatefulSet, or a PVC.
- Orders, payments, inventory, fulfillment, Stripe, or license effects.
- Closing GitHub #1–#10, #12, or #13, or marking SER-126 Done.
- Dispatching the next unit from this change.
