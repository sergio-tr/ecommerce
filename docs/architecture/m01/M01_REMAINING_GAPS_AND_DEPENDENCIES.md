# CommerceCore / CommerceCloud / eGame — What Remains Before Design and Implementation

**Date:** 2026-10-30. **Owner:** @sergio-tr. **Source baseline:** actual `main` at task start `71f95faaa206f01ef0356acbb393f77facddab9c`; root currently contains `.github`, documentation and `README.md`, **no application code**.
**User-approved architecture:** M01-A / K2 / NET-A / DATA-A / STRIPE-A; M00.1 D-01..07 policies and four P0 protocol directions with empirical proof pending.
**Interpretation:** neither a complete documentation corpus nor a chosen tool proves the system exists or is safe to use.

## Four distinct readiness milestones

1. **Architecture/scope decision**: decide what a system/context does and who owns authoritative facts. Existing major M01 choices are accepted.
2. **G3 executable specification**: exact data shape, contracts, preconditions, security permission, negative cases and ownership; implemented technology dependencies must be identifiable. M01-D01..D08 are documentary specifications, some physical parameters intentionally not yet frozen.
3. **G4 task authorization**: an atomic, reviewed change request with branch/issue crosswalk, explicit approval and a reproducible environment. `M01-BOOTSTRAP-01` Definition of Ready is **written and complete**, but DR07–DR10 have not passed.
4. **G5 verification**: actual builds, provider/DB/cluster fault-injection, screenshots/logs and measured outcomes. No G5 conclusion follows from a spec.

### Immediate state table

| Area | What is settled | What remains before coding the corresponding area | Independently startable? |
|---|---|---|---|
| M01 core workspace | Nx/pnpm, TypeScript/NestJS, Angular future, DDD/hexagonal and module independence selected | exact package peer resolution, OS/host checks, current base + approved task identity and G4 | **YES**, first authorized bootstrap after DR07–DR10 |
| M01 Kubernetes | K2/NET-A: k3d/K3s, Traefik, ClusterIP and initial replicas | prove local Docker/k3d/K3s compatibility, pin image digests, security and Helm review, G4 K8S task | **AFTER** bootstrap, no finance dependency |
| M01 Mongo infrastructure | DATA-A local one-member rs with separate owned DBs | exact Mongo image/driver, local PVC/StorageClass, credential model, backup/restore specification G3 | after K8S+secrets; single-member does NOT prove failover |
| M01 Configuration/CI/observability | safe defaults, no live Stripe, CI PR checks, structured logs/probes specified | choose final validation lib and trusted action SHAs, run actual negative tests; branch protection not proven active | foundation task subset can begin independently |
| M02 Tenant/Store & Identity | tenant/store authority and isolation direction accepted, Cloud independent | M00.3 guest claim/session/MFA/OIDC/Keycloak role matrix, exact Cloud configuration port, authorization/CSRF/BOLA tests | **Design** in parallel; endpoint implementation only after relevant G3 |
| M03 Catalog/Offer/Quote | one-store Product/Variant/Listing/Offer/immutable Quote and T1 demo tax direction accepted | exact aggregates/ports, product/offer validity, Money/rounding, published offer eligibility, Quote version/tax snapshot and negative tests | **Design** in parallel with M01; code after G3 |
| M04 Cart/Ordering | durable Order before any potentially collectible payment, CheckoutProcess saga policy accepted | Order/CheckoutProcess full FSM, idempotency/generation, atomic local persistence, guest cancel/claim permissions | **No financial code until G3** |
| M04 Payments/Stripe | STRIPE-A seller test account and user buyer, hosted card/3DS, P0 safe hold/fail-closed direction | actual test account, effective methods/Link control, capture/Connect model, 4 P0 effect contracts, unknown Session idempotency, refund tests | Only **simulation/test harness** once separately approved; actual provider adapter after G3 |
| M04 Inventory | StockPool/Reservation, 15-minute review eligibility and protected capacity rules | exact counters/quotas/transaction indexes, last-unit concurrency, ambiguous commit, Reservation FSM | design M00.2 first |
| M04 Fulfillment | unique digital license, prepare all before reveal, no automatic refund after possible exposure | exact assignment/disclosure grant revocation, all-line preparation, pending unknown response and repair | design M00.2/M00.4 first |
| M04 Operational incident | durable UNKNOWN, no false closed compensation and privileged evidence | operator permission matrix, alert/event schema, investigation and quiescence test evidence | design in parallel |
| M05 Messaging | Kafka after Inbox/Outbox, at-least-once/semantic idempotency | event version contracts, partition keys, DLQ/replay and local operator/lab plan | later |
| M06 Reusable framework | headless, separately consumed CommerceCore, internal contract versioning | independently installable packages, second consumer, licensing choice before public distribution | later |
| M07 Service extraction | distinct Deployments not yet equivalent to distinct services | partition DBs, migrate ownership, domain contracts, single writer, resilience performance tests | later |
| M08 Advanced operations | introductory local K8s moved to M01 | Gateway API, TLS/GitOps/ArgoCD, secure secrets, operator/HA/chaos tests and backup restoration | later |
| M09 Release/verification | G0–G6 governance and learning-only scope | final interoperability, regression, security/fault proof, external reproducibility; live-money explicitly outside present scope | later |

## Remaining critical architecture/provenance obligations

| Identifier / source | Actual state | Decision/test next work |
|---|---|---|
| AUD-P0-01 | recommended durable possible-send/release protocol selected; **OPEN / BLOCKING** empirically | paused worker after DB check + cancel/release vs old Stripe POST; prove hold/neutralization |
| AUD-P0-02 | provider correlation/quarantine selected; **OPEN / BLOCKING** | lost CreateSession response, idempotency retention, positive provider evidence and unknown incident |
| AUD-P0-03 | pre-existing Order + owner-local Mongo transactions + Outbox/Inbox selected; **OPEN / BLOCKING** | captured fact, duplicate webhook, unknown Mongo commit, Ordering recovery |
| AUD-P0-04 | all-line prepare, potential disclosure and refund exclusivity selected; **OPEN / BLOCKING** | stale reveal worker, response loss and refund uncertainty |
| D-05-MONGO | physical Mongo contract still pending specific driver/schema/failover | local transaction indexes, readback, majority commit/unknown results |
| AUD-P1-01 / AUD-P1-06 | Inventory/unique-license policies, physical model pending | Pool/Reservation and assignment transaction tests |
| AUD-P1-02-FSM-MIN | not yet a ratified concrete FSM | Order+CheckoutProcess state/command model |
| AUD-P1-03 | relative+absolute admission window direction accepted | exact durations and clock/dispatch semantics; successor attempt initially disabled |
| M00.3 | actor and guest permission direction accepted | real implementation authority matrices & negatives |
| M00.4 | typed contract direction accepted | schemas, versioning, idempotent commands, no global FSM |
| Source baseline | R1 clause crosswalk, 110 English test oracles and historical documentation fidelity incomplete | finish original-source comparison; keep 148 TEST_PLANNED / NOT_RUN until executed |

**No scope reduction of M04 financial correctness is implied** by postponing optional UI, notifications or multi-store Connect. Initial M04 may be one Store, one line and one Session *if documented as a feature exposure limit*, but its payment/cancel/refund/secret paths still need correct contracts.

## Most efficient design/build sequence

### Phase 0 — already completed in documents

- User approved M01 Nx/pnpm/NestJS + K2/NET-A/DATA-A/STRIPE-A; M01-D01–D08 written and cross-linked.
- Four P0 architectural designs are explicitly selected, with external proof deliberately unresolved.
- `M01-BOOTSTRAP-01` exact output, exclusions, failure/negative AC and pending admission evidence documented.

### Phase 1 — enable first local coding task (NO system domain code)

1. **DR07:** inspect actual package registry/peer dependencies and pin Node24/pnpm/Nx23/Nest11/TS5.9 and exact patches. Angular 21.2 belongs to subsequent eGame bootstrap; do not force Angular package resolution into a Nest-only bootstrap unnecessarily.
2. **DR08:** inspect local OS/WSL, `node`/`pnpm`, free disk, Git auth; inspect Docker/CPU/RAM before K8s next task (not mandatory for Nest-only bootstrap).
3. **DR09:** identify latest main revision, reconcile existing Linear/GitHub planning parents and approve the atomic implementation issue/PR relationship without creating duplicates.
4. **DR10:** obtain user explicit G4 implementation authorization for `M01-BOOTSTRAP-01` in a separate interaction.
5. Implement and execute the bootstrapping acceptance suite; update evidence after real pass.

### Phase 2 — develop local Kubernetes foundation

- `M01-K8S-01`: one API image, local k3d/Traefik/Service, 1→2 stateless replicas, controlled rollout and diagnostic logs (D03/04/06/07).
- `M01-DATA-01`: Mongo local replica-set/PVC, scoped Core/Cloud DB users, fixture restart and backup/restore (D05/06).
- `M01-PLATFORM-01`: separate Cloud/eGame health-only deployables, ingress and observable logs; no payment operations.
- Demonstrate local development loop before adding payment business logic.

### Phase 3 — parallel design M00.2–M00.4 and M02/M03

- Finalize Catalog/Offer/Price/Quote contracts and tenant/guest permissions; create atomically testable tasks only after G3.
- Finalize protected stock and DigitalLicense assignment models, Order/CheckoutProcess state machine and Payments operator protocols.
- Implement M02/M03 independent modules after their own G3/G4; do not rely on eventual consistency to authorize irreversible effects.

### Phase 4 — M04 first full eGame sale in test mode

- Real Stripe **test** merchant, eGame buyer and optional Stripe Customer; no real money; Stripe CLI or controlled endpoint.
- Owner-local Mongo transactions/Outbox/Inbox, negative provider proof safeguards, release fencing and full refund/reveal path.
- Run four P0 fault-injection suites with actual driver/provider evidence before marking them VERIFIED.
- Only then demonstrate the complete recoverable digital key purchase and validate G5.

### Phase 5 — M05–M09

Kafka, second consumer/framework distribution, extracted services, advanced Kubernetes operations, repeatable system validation. No live-money authorization assumed.

## Scope/decision status that requires honest wording

- **M01 architecture:** APPROVED.
- **M01-D01..D08 design content:** PREPARED FOR G3 REVIEW, source support and runtime results distinguished.
- **M01-BOOTSTRAP-01 DoR document:** FINALIZED with checklist and acceptance criteria; **DR07–DR10 outstanding**; not code-authorized or tested.
- **M01-K8S/MONGO implementation:** NOT STARTED.
- **M04 financial correctness:** DESIGNED direction; provider/driver tests NOT_RUN.
- **GitHub/Linear issues:** traceability governance only, no new implementation tickets in this design PR.

## Decision packets still genuinely requiring a user's action

1. **M01 first task authorization after environment check**: decide whether to authorize a Nest-only Nx foundation on independent feature branch. Recommended YES once DR07–DR09 are satisfied.
2. **M01 deployment tool detail**: Helm 4.3 vs Kustomize. Recommended Helm (learn package/release lifecycle); in D04 still a selected design recommendation, not a ratified standalone ADR.
3. **Local machine resources and OS runtime**: no access to user's Docker/WSL machine. Do not invent installed tools or RAM. A short host report can be generated during a separately authorized compatibility check.
4. **Mongo exact image/version and storage reset behavior**: select after platform/OCI registry compatibility, not before.
5. **Advanced identity & payment contracts**: must be ratified before corresponding API/business effect coding; cannot be replaced by Kubernetes success.

## Next expected action

**User:** review the [M01-D05..D08 specifications](README.md) and [bootstrap DoR](M01_BOOTSTRAP_01_DEFINITION_OF_READY.md). Choose whether to conduct a small local compatibility/host preflight and then explicitly authorize `M01-BOOTSTRAP-01` in a subsequent message. There is **no requirement to finish M04 provider tests before starting that independent foundation**.

**Assistant:** upon authorization, use current main, preserve English docs/decisions, create exactly one feature branch and task-scoped PR, implement only the approved bootstrap, run actual tests and report evidence; never merge without explicit review.
