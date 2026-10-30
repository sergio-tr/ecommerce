# CommerceCore — Pre-Implementation Readiness and Decision Gates

**State:** ACCEPTED SCOPE AND M01 DIRECTION; TECHNICAL CONTRACTS / IMPLEMENTATION GATES PENDING, 2026-10-30. **Owner:** @sergio-tr. **Implementation authorization:** NOT GRANTED. **Milestones:** M00–M09; no M00.5.

## Correct interpretation of "ready to develop locally"

There are TWO separate entry decisions:

- **M01 independent engineering foundation:** can be specified now without completing all M00.1 financial contracts. It may be implemented ONLY after its own G1/G2/G3 scope, accepted technical specification, a reviewed and testable atomic issue, and explicit user implementation authorization (G4). M01 may not include financial integration, StockPool algorithms, buyer authorization or unratified domain state machines.
- **M04 financial/digital fulfillment vertical:** NOT implementation-ready. Any task whose behavior relies on external Stripe dispatch, Payment capture, capacity release, key revelation, refund exclusivity or guest authority remains blocked until its specific approved guards and contracts meet G3. P0 findings remain OPEN/BLOCKING.

G5 actual experiments normally occur AFTER code/test-mode behavior exists. It is incorrect to require G5 to permit *all* initial engineering code, and equally incorrect to treat local stub-based tests as Stripe provider evidence.

## Before any authorized M01 engineering bootstrap

| Item | Decision to approve | Objective G3/G4 evidence |
|---|---|---|
| ENG-01 | Exactly scoped M01 tasks, no commerce external effects | Explicit user acceptance of foundation scope and exclusion list |
| ENG-02 | Runtime and tool versions | Exact pinned Node/TypeScript/NestJS/Nx/pnpm/Angular test compatibility and deterministic install strategy; Node 24 is historical candidate |
| ENG-03 | Module architecture and ownership | Context map, Domain/Application/Adapters composition rules, import boundaries, cross-context public ports, package names; architecture tests specified |
| ENG-04 | Repository and branch policy | Independent feature/* or bugfix/* topic branch, conventional commits, PR review, sergio-tr default author/accountable owner, no co-author/agent credits |
| ENG-05 | Quality and test skeleton | Test hierarchy, code coverage gates, contract tests, failure/negative test conventions, CI check policies and Definition of Done |
| ENG-06 | Secrets and local configuration | Sample config without credentials, isolated test secrets, no committed activation keys, scoped Stripe test-mode credentials only after authorization |
| ENG-07 | Local persistence and environment boundaries | Only approved local infrastructure; no assumption Mongo unknown-commit/atomicity physical contract is solved by starting Docker |
| ENG-08 | Task-level authorization | G4-reviewed issue or explicitly equivalent approved scope, dependency IDs, acceptance criteria and independently executable change set |

**Result when satisfied:** safe to begin *foundation work only*. Not authorized by this document; no implementation issue is created.

## Critical decisions before M04 financial/fulfillment implementation

| Risk / contract | Authority and dependency | Exact design acceptance required |
|---|---|---|
| AUD-P0-01 / D-07 concurrency | Payments + Inventory + Ordering | Define versioned financial admission and durable closure, prove or safely contain previously enabled Stripe HTTP POSTs before stock release; local lease alone insufficient |
| AUD-P0-02 / D-02 | Payments | Reconcile Session ID unknown, original idempotency keys/accounts and all potentially collectible effects; absence of webhook/search is not provider negative proof |
| AUD-P0-03 / AUD-P0-03-CAPTURE | Payments + Ordering | Specify authorization/processing/capture/captured evidence; durable Payment fact with local atomic mandatory propagation to pre-existing Order |
| AUD-P0-04 / M00.2 | Ordering + Fulfillment + Payments | Prove exclusive fulfillment/refund resolutions despite stale in-flight reveal/refund effects; no normal partial sale |
| AUD-P1-01 / D-01-SM | Inventory | Finalize Reservation guards, Pool/Reservation atomicity, last-unit conservation, versioned protected/committed/release commands |
| AUD-P1-06 / DigitalLicense | Inventory + Fulfillment | Exclusive DigitalLicense assignment per OrderLine, all-line preparation, authenticated potential key exposure and response-loss recovery |
| D-05-MONGO / D-05-CONCURRENCY | Owned local persistence | Choose document vs multi-document atomicity, write concern/journal, unknown commit, worker fencing and crash recovery; no global TX |
| AUD-P1-02-FSM-MIN / D-04-SM | Ordering | Ratify actual Order/CheckoutProcess FSM/commands, immutable snapshot, local mandatory saga work and semantic idempotency |
| D-07-AUTH / M00.3 | Identity + Ordering/Fulfillment | Trusted TenantContext, guest cancel and claim proof, privileged refund and license disclosure authorization, CSRF/MFA/session boundaries |
| AUD-P1-04 / D-03-CONFIG | Payments + CommerceCloud | Actual Stripe account/Connect charge model, capture and refund fund flow, enforced card/3DS methods, Link control |
| D-02-P01 / D-06-P01 / AUD-P1-03 | Payments + Ordering | Preserve selected-but-not-approved 35-minute and two-Session candidates; choose safe commercial retry admission rule and values independently |
| CAP-PRC-004 / R0.3-08 | Pricing + Ordering | User must select T1 demonstration tax port or T2 explicit synthetic fixture; exact displayed/persisted amounts match Quote |
| D-05-OPS / D-07-OPS | Operations + financial/domain owners | Observability, investigation ownership, escalation and remediation without time-based financial closure or unaudited state edits |
| M00.4 versioned interfaces | All bounded contexts | Typed commands/events, tenant/Store/scope/generation IDs, preconditions, idempotency, version guards, durable ACK meanings, negative cases and schema compatibility |

**First-sale no-go:** while any critical protocol permits a double charge, oversell, duplicate key, cross-tenant access or irreversible fulfill/refund conflict, its implementation task is SPECIFICATION BLOCKED even if the happy-path interface is easy to code.

## 23 remaining scope decisions

Following explicit approval of all recommended scope options, **0 M04 CAP records remain without an inclusion/exclusion/defer disposition**: 85 INCLUDED, 43 EXCLUDED, 12 DEFERRED. B01 tax T1 and B02–B06 scope options are accepted. This is scope resolution, not final implementation contracts; the remaining detail is listed in [REMAINING_WORK_REGISTER.md](REMAINING_WORK_REGISTER.md).

## Source and evidence that still require reconciliation

- Source-level R1 clause crosswalk against D-01–D-07 and later AUD ratifications.
- 140 CAP records: only a subset has clause-level R0.10 references reviewed, so full G0 provenance remains PARTIAL.
- 110 audit experiment IDs located in original hash-matched source files, but the exact English scenario/oracle descriptions still need semantic verification; all 148 are TEST_PLANNED / NOT_RUN.
- Fourteen PLAN-DEC proposed refinements/duplicates require review before creating work items.
- Real Stripe test-mode and Mongo failover/unknown-commit evidence is not available through architecture prose alone. Distinguish documentary specification proof from later authorized experiments.

## Local implementation sequence, conditional on separate authorizations

1. **M01:** reproducible tooling, Nx/pnpm/NestJS/Angular boundary, domain-first package layout, lint/format, CI and test harness; no business payment behavior.
2. **M02:** trusted Tenant/Brand/Store and scoped authorization only after M00.3 contracts are accepted.
3. **M03:** Store-local catalog, Listing/Offer, exact pricing, accepted Quote after B01 and its remaining tax decision/contract readiness.
4. **M04:** guest cart and durable Order; Inventory protection; Stripe hosted card/3DS and provider reconciliation; unique license reveal; refund/cancellation/incident recovery. Each dependency must be individually G3-complete before its code is authorized.
5. **M05–M09:** Kafka after durable Inbox/Outbox, framework reuse with independent consumer, safe context extraction, Kubernetes/operations and actual verification after separately approved plans.

## Completion criteria before claiming M04 can start

- Scope options are ratified for all 140 M04 capability rows; complete source fidelity and actor/technical acceptance remain to be reviewed (G1 evidence remains partial).
- All connected D/AUD decisions and bounded-context contracts ratified with testable failure/unknown semantics (G2/G3).
- A complete dependency/ownership/actor-permission matrix exists, including old enabled operations and negative tenant cases.
- Atomic, independently reviewable implementation tasks with Given/When/Then oracles and existing Linear/GitHub crosswalk (G4), and user separately authorizes them.
- Experiments have reproducible test plans; future actual execution determines G5, not this document.

No actual payment or release proof, implementation, new ticket or infrastructure is claimed in this checklist.

## Latest decision addendum — 2026-10-30

M01-A is accepted as the candidate *architectural direction* for a local Nx/pnpm/NestJS modular foundation with Angular reference shell, not as specific package versions or permission to code. AUD-P1-03 alternative D policy accepted; exact relative/absolute windows and old dispatch fencing remain pending. The first actionable next work is individual G3 foundation-contract sign-off and explicit G4 authorization, while financial/Inventory and digital-license effect contracts must still resolve their P0 blockers. See [consolidated approval](RECOMMENDED_DECISIONS_APPROVAL.md) and [remaining contracts](REMAINING_WORK_REGISTER.md).
