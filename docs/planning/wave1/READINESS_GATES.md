# Wave 1 — Objective Readiness and Evidence Gates

**Artifact:** W1-GATE-001. **Status:** G0–G6 GOVERNANCE ACCEPTED WITH EVIDENCE CONDITIONS (W1-AP-04); individual GATE PASS status NOT IMPLIED. **Accountable owner:** @sergio-tr. **Scope:** M00–M09.

**Core rule:** policy ratification, specification completeness, implementation authorization, software completion, and experimental verification are different facts. An issue marked Done does not ratify an ADR. A test listed as TEST_PLANNED has not been executed. Neither provider HTTP 2xx nor a browser redirect proves commercial completion.

## G0 — Recoverable, reconciled baseline

**Required:** 181 historical decisions and 26/155 statuses preserved; current scoped D/AUD/GOV register with exact statuses; original R1 and SHA-256 source custody referenced; identified contradictions and provenance gaps; 13 existing audits linked; 148 test IDs with genuine source/fidelity indicators; English project documents; branch/owner/commit governance. **Proof:** reviewed pull request and explicit source-coverage checklist. **Current:** PARTIAL. 19 source artifacts indexed, but user-message clause fidelity and 110 tests not explicitly source-reconciled.

## G1 — Release scope accepted

**Required:** all capabilities linked to a source, owner, milestone and an explicit user-reviewed inclusion label: IN_SCOPE, OUT_OF_SCOPE, DEFERRED or EXPERIMENT_ONLY. The minimal M04 buyer/admin/operator journeys are approved, with written exclusions; only a coherent Stripe test-mode digital purchase is claimed. Accepted framework-direction does not imply all UI/admin capability inclusion. **Proof:** exact feature boundary and exclusions ratified. **Current:** NOT PASSED; Wave 1's 140 capability inventory is a DRAFT.

## G2 — Scoped architecture decision ratified

**Required for each decision:** unique source-backed problem and business risk; affected bounded contexts and external authorities; alternatives and rejected options; invariant/guard implications; interleavings, unknown result and recovery; dependencies; explicit user approval of the exact scoped ID and qualifications; consistent structured register and ADR. Subdecisions are not accepted by implication. **Proof:** user ratification + reviewed ADR record. **Current:** D-01–D-07 primary directions accepted; several specific decisions still PENDING or PROPOSED — SELECTED.

## G3 — Specification complete / design ready

**Required for each behavior:** an owning context and public contract; typed request, response, event and error; trusted tenant/store/actor scope; operation identity/version/idempotency; exact preconditions, transitions/guards and postconditions; explicit local atomicity and durable future work; conflict/stale operation rejection; crash, retry, timeout, unknown and contradictory outcomes; security, privacy, observability and human escalation; reproducible acceptance/test oracles; no unresolved BLOCKING decision for that behavior. **Proof:** user-accepted versioned specification and contract references. **Current:** NOT PASSED for the four financial P0 pathways.

## G4 — Implementation-ready atomic issue

**Required:** approved release scope (G1), ratified decisions (G2), fully specified behavior (G3), minimal independent change with bounded owner, testable Given/When/Then including adverse cases, accepted dependency list, specific security/performance constraints, Linear/GitHub links, default @sergio-tr ownership and explicit implementation authorization. Future work follows independent feature/* or bugfix/* branch and conventional commits. **Proof:** reviewed issue and authorization. **Current:** no Wave 1 implementation issue was created or authorized.

## G5 — Implemented milestone verified

**Required:** actual linked commit/release and repeatable test inputs, effective configuration/provider version, test-mode account/environment, run timestamps and IDs, provider/business source-of-truth observations, negative/cross-tenant/concurrency/crash outcomes, signed risk exceptions if any, and explicit milestone acceptance. Provider mocks are labeled simulation, never Stripe proof. **Proof:** executed evidence + milestone sign-off. **Current:** zero financial experiments marked VERIFIED.

## G6 — Production and live-money authorization

**Required separately:** tax/legal, merchant/Stripe Connect, refunds/returns, production security, credentials, backups, incident operation, audit/retention, SLO and explicit commercial approval. Stripe test-mode completion and M09 technical sign-off do not automatically satisfy G6.

## Evidence taxonomy

| Label | Objective threshold |
|---|---|
| PROPOSED | Documented option, no approval |
| PROPOSED — SELECTED | Preferred option for formalization, not finally approved |
| ACCEPTED | Explicit scoped user ratification including reservations |
| SPECIFIED | Reviewed preconditions, effects, guards and recovery contracts |
| TEST_PLANNED | Setup, deterministic observable oracle and evidence type; not executed |
| VERIFIED | Actual run meets declared acceptance criteria; stored run and result |
| FAILED / INCONCLUSIVE | Genuine failed or insufficient proof; no fabricated success |

## Per-milestone gate framework (proposed)

| Milestone | Spec closure gate | Future experimental/exit gate |
|---|---|---|
| M00.1 | Four P0 contracts and proof limitations resolved; R1 comparison; accepted R2 only with explicit approval | Later Stripe/Mongo tests remain separate from documentary closure |
| M00.2 | StockPool conservation, Reservation atomicity, exclusive license allocation, disclosure frontier | Actual concurrency and disclosure-failure tests |
| M00.3 | Guest claiming, tenant scope, actor-resource permissions, session lifecycle | BOLA/BFLA, token replay, session/claim negative tests |
| M00.4 | Aggregate/context map, commands, OpenAPI/events, error/version/idempotency semantics | Contract conformance after implementation |
| M00.5 | Optional PROPOSED readiness consolidation, only if separately approved | Approved planning and source-coverage audit |
| M01 | Runtime/toolchain, boundaries, CI and repository contracts | Clean reproducible build and architecture tests |
| M02 | Tenant/control-plane/identity contracts | Cross-tenant isolation and provisioning recovery |
| M03 | Catalog, pricing, quote and listing/offer contracts | Currency/quote/catalog test evidence |
| M04 | Entire protected Stripe-test-mode digital purchase with accepted P0 safeguards | Real provider-object reconciliation, no double charge/oversell/key reuse |
| M05 | Kafka schema/partition/replay/dedup compatibility | Executed at-least-once and failure tests |
| M06 | Public SDK/standalone/second consumer requirements | Verified independent installation and true reuse |
| M07 | Context extraction, single-writer migration and invariant preservation | Service partition/crash/consistency benchmarks |
| M08 | Kubernetes/TLS/secrets/storage/backup/release specs | Actual network/restore/rollback evidence |
| M09 | SLO, threat model, performance, chaos and operational runbooks | Executed evidence, signed release gate; not automatic real-money approval |

## Readiness classification rules

- Scope not accepted → NOT SCOPED.
- Relevant architectural question open → DECISION BLOCKED.
- Policy accepted, required contract incomplete → SPECIFICATION BLOCKED.
- Complete reviewed specification but no implementation permission → DESIGN READY / NOT AUTHORIZED.
- G4 checklist and explicit implementation scope approval → IMPLEMENTATION READY.
- Software exists, actual tests unrun → IMPLEMENTED / NOT VERIFIED.
- Evidence meets approved oracle and acceptance gate → VERIFIED in the exact tested scope.
- Real money always requires separate G6.

**The G0–G6 governance framework was accepted by W1-AP-04 with verifiable-evidence conditions. Passing any particular gate remains an independent determination.**

## Exact evidence manifest required for a gate PASS

Every PASS record must contain gate ID, exact target milestone/contract and version, accountable reviewer, dated explicit decision or sign-off, checklist denominator and count satisfied, source ID/hash where applicable, exception/risk state and durable evidence link. Missing links are FAIL/INCONCLUSIVE, never assumed PASS. No approval state may be inferred from issue completion.

| Gate | Minimum objective completion / PASS condition | Verified Wave 1 observation | Current evaluation |
|---|---|---|---|
| G0 | 181/181 historical IDs with preserved status; 83/83 scoped IDs; 19/19 source identities; 100% R1/user ratification clauses either source-located or explicitly SOURCE_GAP with reviewer approval; 148/148 tests have verified source locator or classified known uncertainty | 181,83,19 indexed; only 38/148 tests source-table translated; 110 reconstructed; literal R1 and full approval transcript comparison pending | PARTIAL |
| G1 | 140/140 capabilities in one user-reviewed M04 disposition, with zero undefined or improperly mixed inclusion for first slice; buyer/operator journeys have explicit minimum access and exclusions | 73 INCLUDED,30 EXCLUDED,8 DEFERRED,29 UNRESOLVED; three composite entries; only overall W1-AP-01 approved | PARTIAL |
| G2 | Each ratified ID has linked explicit user statement, exact conditions, alternatives/dependencies and unchanged child statuses | D-01..07 accepted; W1-AP-01/03/04/05 accepted within scope; technical children pending | PER_DECISION_PARTIAL |
| G3 | 100% applicable commands/events/FSM guards with owner, scope, version, local atomicity, external-effect evidence, crash/retry/unknown handling and predeclared test oracles; zero unresolved BLOCKING dependency for behavior | AUD-P0-01..04 OPEN/BLOCKING; M00.2/M00.3/M00.4 incomplete | BLOCKED |
| G4 | G1/G2/G3 for targeted behavior, specific atomic issue, accepted Given/When/Then tests and explicit implementation authorization | Zero implementation tickets created; none authorized | NOT_AUTHORIZED |
| G5 | Actual execution artifact with run time, commit, provider/environment, observed authoritative state, pass/fail and reviewer acceptance for every required test | 148 TEST_PLANNED, 0 VERIFIED in financial catalog | NOT_VERIFIED |
| G6 | Separate merchant/Connect, tax/legal, security, recovery, refund/dispute, live-money monitoring and signed financial/production approval | No production authorization or live-payment validation recorded | NOT_AUTHORIZED |

**Status and source separation:** G1 approval of the bounded first vertical does not ratify 73 per-row technology designs. G0 assessment of source IDs is not proof of clause-level correctness. G5 PASS cannot be claimed from a Stripe mock or a timeout. W1-AP-02 declined M00.5: these gates operate across M00.1–M00.4 and subsequent existing milestones.
