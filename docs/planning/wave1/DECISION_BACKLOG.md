# Wave 1 — Architecture Decision and Dependency Backlog

**DRAFT — no new approvals.** 103 work packages: 30 pre-existing decision/audit IDs and 73 provisional PLAN-DEC IDs. Proposed priorities/deadlines are for planning only. No implementation tickets have been created. **Four original P0 findings remain OPEN / BLOCKING**; no existing decision status has changed.

## Existing decision and audit questions

| ID | P | Question | Owner | Needed by | Dependencies | Required spec | Validation |
|---|---|---|---|---|---|---|---|
| AUD-P0-01 | P0 | Prove exclusion across Stripe dispatch cancellation and Inventory release | Payments/Ordering/Inventory | Before M00.1 closure | AUD-P0-02, D-05-MONGO | Versioned dispatch/closure/release permits and external quiescence guards | Provider-backed late POST tests and recovery |
| AUD-P0-02 | P0 | Prove recovery of Stripe UNKNOWN without Session ID | Payments | Before M00.1 closure | AUD-P0-01 | Correlation, provider capabilities, evidence and safe close | Stripe test-mode object search/late dispatch trials |
| AUD-P0-03 | P0 | Prove preserved paid obligation across context failures | Payments/Ordering | Before M00.1 closure | D-05-MONGO, AUD-P0-02 | Capture fact and atomic local propagation contracts | Crash/ACK-loss/tenant isolation tests |
| AUD-P0-04 | P0 | Prove exclusive irreversible fulfillment or refund | Ordering/Fulfillment/Payments | Before M00.1 closure | AUD-P0-01, M00.2 | Effect capability quiescence and resolution commands | Lost delivery/refund response tests |
| AUD-P1-01 | P1 | Select Reservation FSM and StockPool atomicity | Inventory | Before M00.2 exit | AUD-P0-01, D-01-SM | Transitions, versions, conservation equation | Final-unit races and failover |
| AUD-P1-02 | P1 | Select concrete Ordering saga FSM and truth boundaries | Ordering | Before M00.4 exit | AUD-P0-03, D-05-MONGO | Order/CheckoutProcess status and local atomic continuation | Duplicate and out-of-order financial fact |
| AUD-P1-03 | P1 | Ratify or reject commercial double retry-window policy | Ordering/Payments | Before M00.1 design closure | D-06-RETRY-WINDOW, AUD-P0-01 | Commercial and provider deadlines distinction | AUD13 tests after approval |
| AUD-P1-04 | P1 | Select Stripe Connect methods and capture enforcement | Payments/CommerceCloud | Before M04 implementation | AUD-P0-03 | Account topology, capture and store payment rules | Provider actual API/test-mode validation |
| AUD-P1-05 | P1 | Specify Mongo durability and ambiguous commit | Shared persistence ports | Before M04 implementation | D-05-MONGO | Document/transaction/write concern/restart contracts | Mongo failover tests |
| AUD-P1-06 | P1 | Specify all-or-nothing multi-line sale and allocation | Inventory/Fulfillment | Before M04 implementation | AUD-P0-04, AUD-P1-01 | Batch capacity/all-line preparation contract | Concurrent stock and partial exposure tests |
| AUD-P2-01 | P2 | Normalize Payment Session Attempt Refund vocabulary | Payments/Ordering | Before M00.4 exit | AUD-P1-02 | Canonical cross-context glossary | Contract review |
| AUD-P2-02 | P2 | Validate 35-minute Checkout and two attempt defaults | Payments/Commerce | Before M04 tuning | D-02-P01, D-06-P01 | Config version and measurement plan | Stripe test mode and buyer flow |
| AUD-P2-03 | P2 | Complete evidence and requirement trace coverage | Architecture governance | Before M00.5 planning gate | W1-GAP-04 | Trace matrix and source-oracle mapping | Catalog integrity check |
| D-01-SM | P1 | Formalize capacity-specific Reservation states | Inventory | Before M00.2 exit | AUD-P1-01 | Final FSM transitions and release identity | Property tests |
| D-02-P01 | P2 | Select actual Checkout Session duration policy | Payments | Before M04 implementation | AUD-P2-02 | Config version/min/max/clock handling | Provider experiments |
| D-03-CONFIG | P1 | Enforce store payment methods with Stripe API | Payments/CommerceCloud | Before M04 implementation | AUD-P1-04 | Actual API/provider account guard contract | Provider card/3DS test mode |
| AUD-P0-03-CAPTURE | P0 | Define authorization vs captured funds evidence | Payments/Ordering | Before M04 implementation | AUD-P0-03 | Captured/pending/requires_capture semantics | Stripe capture-mode tests |
| D-04-SM | P1 | Select commercial compensation FSM and evidence | Ordering | Before M04 implementation | AUD-P0-04 | Branch guards and irreversible effects | Refund/license races |
| D-04-P01 | P2 | Choose bounded fulfillment recovery and escalation policy | Ordering | Before M04 implementation | AUD-P0-04 | Retry budgets without false terminal states | Stuck saga scenarios |
| D-04-CONNECT | P1 | Select refund fund-flow and Stripe Connect scope | Payments | Before M04 implementation | AUD-P1-04 | Charge owner/refund account/transfer reversal | Provider test-mode refunds |
| D-05-MONGO | P0 | Set local Mongo atomicity and durability contract | Infrastructure ports | Before M04 implementation | AUD-P0-03 | Transaction/journal/write concern/unknown commit | Failover/commit uncertainty |
| D-05-CONCURRENCY | P1 | Specify safe worker concurrency and fencing | Payments/Ordering | Before M04 implementation | AUD-P0-01 | Conditional authorization and worker restart rules | Suspended-worker tests |
| D-05-OPS | P1 | Specify reconciliation and incident alerting | Payments/Operations | Before M04 integration | AUD-P0-02 | Escalation ownership/rate budgets | Stuck operation observability |
| D-06-P01 | P2 | Select maximum sequential hosted Sessions | Payments/Ordering | Before M04 implementation | AUD-P1-03 | Policy value+version | Repeat/abuse load tests |
| D-06-RETRY-WINDOW | P1 | Choose commercial retry eligibility deadlines | Ordering | Before M00.1 design closure | AUD-P1-03 | Relative/global cutoff semantics | Race and expiry tests |
| D-06-INTENT | P1 | Prevent incompatible multi-checkout attempts | Ordering/Payments | Before M04 implementation | D-06-RETRY-WINDOW | Intent identity, legitimate multiple buys | Idempotency/abuse tests |
| D-07-AUTH | P1 | Authorize guest cancellation and ownership | Identity/Ordering | Before M04 implementation | M00.3 | Actor-resource proof and expiration | BOLA negative tests |
| D-07-CONCURRENCY | P0 | Specify cancel vs in-flight create/capture | Ordering/Payments | Before M04 implementation | AUD-P0-01, AUD-P0-02 | Barrier and cancellation contracts | Concurrence with 3DS/unknown |
| D-07-OPS | P2 | Define cancellation recovery and investigation | Operations | Before M04 integration | D-05-OPS | Safe retries/alerts | Stuck cancel tests |
| D-03-LINK | P2 | Decide Stripe Link inclusion and method constraints | Payments | Before M04 payment UI freeze | D-03-CONFIG | Link policy or defer | Provider method enforcement test |

## M00.2 — Inventory and digital license (not ratified)

| ID | P | Decision | Owner | Proposed deadline | Dependencies | Required specification | Validation |
|---|---|---|---|---|---|---|---|
| PLAN-DEC-001 | P0 | StockPool vs Reservation aggregate | Inventory | Before M00.2 execution/closure as applicable | AUD-P1-01 | Aggregate ownership and atomic balances | Last unit reservation races |
| PLAN-DEC-002 | P1 | Shared pools and store quotas | Inventory | Before M00.2 execution/closure as applicable | R0.3-10 | Store quota model and release | Cross-store oversell |
| PLAN-DEC-003 | P0 | Multi-line reservation integrity | Inventory | Before M00.2 execution/closure as applicable | AUD-P1-06 | All-or-nothing holds | Partial capacity/crash |
| PLAN-DEC-004 | P0 | Unique DigitalLicense assignment | Fulfillment | Before M00.2 execution/closure as applicable | AUD-P0-04 | Per-orderLine ownership uniqueness | Concurrent duplicate claims |
| PLAN-DEC-005 | P1 | License encryption and rotation | Fulfillment/Security | Before M00.2 execution/closure as applicable | R0.7-17 | DEK/KEK access policy | Rotation/no key leakage |
| PLAN-DEC-006 | P0 | Irreversible reveal capability | Fulfillment | Before M00.2 execution/closure as applicable | AUD-P0-04-QUIESCENCE | Reveal authorization and neutralization | Lost HTTP reply |
| PLAN-DEC-007 | P1 | Full-order preparation | Fulfillment | Before M00.2 execution/closure as applicable | AUD-P1-06 | Line readiness before any reveal | Multi-line failure |
| PLAN-DEC-008 | P2 | Stock adjustment and invalidation | Inventory/Admin | Before M00.2 execution/closure as applicable | CAP-ADMIN-007 | Auditable corrective movements | Operator auth |

## M00.3 — Identity and tenant security (not ratified)

| ID | P | Decision | Owner | Proposed deadline | Dependencies | Required specification | Validation |
|---|---|---|---|---|---|---|---|
| PLAN-DEC-009 | P1 | Keycloak realms and organizations | Identity | Before M00.3 execution/closure as applicable | R0.7-01 | B2B/B2C authority | OIDC integration |
| PLAN-DEC-010 | P0 | Actor-resource-action matrix | Security | Before M00.3 execution/closure as applicable | R0.7-05 | RBAC/ABAC for each effect | Cross-tenant negatives |
| PLAN-DEC-011 | P0 | Guest checkout secret identity | Identity/Cart | Before M00.3 execution/closure as applicable | D-07-AUTH | Guest token lifecycle | Replay/forgery |
| PLAN-DEC-012 | P0 | Guest Order claim and key access | Identity/Fulfillment | Before M00.3 execution/closure as applicable | R0.7-10 | One-time verified claim | Expired token/hijack |
| PLAN-DEC-013 | P0 | Trusted TenantContext | Security | Before M00.3 execution/closure as applicable | R0.7-07 | Scoped command and event identity | Tenant mixup |
| PLAN-DEC-014 | P2 | Support privilege elevation | Security/Ops | Before M00.3 execution/closure as applicable | R0.7-08 | Temporal escalation and audit | Expired permission |
| PLAN-DEC-015 | P1 | BFF session and CSRF | Identity/BFF | Before M00.3 execution/closure as applicable | R0.7-03 | PKCE/cookies/redirect checks | Session attack |
| PLAN-DEC-016 | P1 | Privacy retention and deletion | Security/Cloud | Before M00.3 execution/closure as applicable | R0.7-18 | Protected data retention | Compliance review |

## M00.4 — Contracts and shared semantics (not ratified)

| ID | P | Decision | Owner | Proposed deadline | Dependencies | Required specification | Validation |
|---|---|---|---|---|---|---|---|
| PLAN-DEC-017 | P0 | Definitive context and aggregate map | Architecture | Before M00.4 execution/closure as applicable | AUD-P1-01, AUD-P1-02 | Owner and aggregate boundaries | Architecture conformance |
| PLAN-DEC-018 | P0 | Command and error semantics | Architecture | Before M00.4 execution/closure as applicable | AUD-P2-01 | Scope/version/idempotency/conflict | Negative contracts |
| PLAN-DEC-019 | P1 | OpenAPI request/response versioning | API | Before M00.4 execution/closure as applicable | R0.4-05 | API compatibility policy | Schema diff |
| PLAN-DEC-020 | P1 | Event envelope and duplicates | Integration | Before M00.4 execution/closure as applicable | D-05-OUTBOX | Source authority and dedup | Replay tests |
| PLAN-DEC-021 | P1 | Effective store policy versioning | CommerceCloud | Before M00.4 execution/closure as applicable | R0.2-12 | Config precedence/snapshot | Mid-checkout policy change |
| PLAN-DEC-022 | P0 | Local atomicity map | Architecture | Before M00.4 execution/closure as applicable | D-05-MONGO | Fact and outbox guarantee | Ambiguous DB commits |
| PLAN-DEC-023 | P1 | Read projections and command guards | Architecture/BFF | Before M00.4 execution/closure as applicable | AUD-P1-02 | Lag and stale-safe commands | Delayed projections |
| PLAN-DEC-024 | P1 | Stripe adapter boundary | Payments | Before M00.4 execution/closure as applicable | D-03 | Provider-neutral port | Contract conformance |
| PLAN-DEC-025 | P2 | Contract deprecation rules | Integration | Before M00.4 execution/closure as applicable | R0.4-11 | Version compatibility | Old SDK test |
| PLAN-DEC-026 | P0 | R1-to-ratified policy crosswalk | Governance | Before M00.4 execution/closure as applicable | W1-GAP-01 | Retained/changed/rejected clauses | Full clause coverage |

## M01 — Engineering foundations (not ratified)

| ID | P | Decision | Owner | Proposed deadline | Dependencies | Required specification | Validation |
|---|---|---|---|---|---|---|---|
| PLAN-DEC-027 | P1 | Monorepo and package boundary | Engineering | Before M01 execution/closure as applicable | R0.5-04 | Nx/pnpm modules | Forbidden import tests |
| PLAN-DEC-028 | P1 | Runtime/toolchain pinning | Engineering | Before M01 execution/closure as applicable | R0.5-09 | Node/TS/NestJS versions | Reproducible clean build |
| PLAN-DEC-029 | P1 | CI branch protections | Engineering | Before M01 execution/closure as applicable | GOV-002 | Required checks and PR flow | Enforcement test |
| PLAN-DEC-030 | P1 | Test harness responsibilities | Quality | Before M01 execution/closure as applicable | R0.5-13 | Unit/integration/E2E conventions | Smoke run |
| PLAN-DEC-031 | P1 | Secrets and config boundary | Security | Before M01 execution/closure as applicable | R0.7-16 | Config validation/secrets | Leak scan |
| PLAN-DEC-032 | P1 | Open-source license decision | Governance | Before M01 execution/closure as applicable | R0.1-08 | License and public releases | Legal check |
| PLAN-DEC-033 | P2 | Local environment and budget | Platform | Before M01 execution/closure as applicable | R0.8-01 | WSL/Compose reproducibility | Environment replay |

## M02 — Tenant and SaaS (not ratified)

| ID | P | Decision | Owner | Proposed deadline | Dependencies | Required specification | Validation |
|---|---|---|---|---|---|---|---|
| PLAN-DEC-034 | P1 | Tenant/Brand/Store lifecycle | CommerceCloud | Before M02 execution/closure as applicable | R0.2-01 | State and ownership | Scoped access tests |
| PLAN-DEC-035 | P1 | Provisioning to CommerceCore | CommerceCloud | Before M02 execution/closure as applicable | R0.4-02 | Independent provisioning saga | Partial failure recovery |
| PLAN-DEC-036 | P1 | Store-scoped customer identity | Identity | Before M02 execution/closure as applicable | R0.2-06 | Profile/link lifecycle | Tenant isolation |
| PLAN-DEC-037 | P1 | Invites and membership | CommerceCloud | Before M02 execution/closure as applicable | R0.7-02 | Claim/revoke permissions | Invitation replay |
| PLAN-DEC-038 | P1 | Store policy configuration | CommerceCloud | Before M02 execution/closure as applicable | R0.2-12 | Versioned precedence | Effective policy tests |

## M03 — Catalog and pricing (not ratified)

| ID | P | Decision | Owner | Proposed deadline | Dependencies | Required specification | Validation |
|---|---|---|---|---|---|---|---|
| PLAN-DEC-039 | P1 | Product Variant SKU contracts | Catalog | Before M03 execution/closure as applicable | R0.3-01 | Aggregate and index semantics | Unique SKU tests |
| PLAN-DEC-040 | P1 | Master/local inheritance | Catalog | Before M03 execution/closure as applicable | R0.3-03 | Override propagation | Update conflict |
| PLAN-DEC-041 | P1 | Listing vs Offer lifecycle | Merchandising | Before M03 execution/closure as applicable | R0.3-04 | Publication/sale eligibility | Unavailable offer |
| PLAN-DEC-042 | P0 | Exact money/rounding | Pricing | Before M03 execution/closure as applicable | R0.3-05 | Minor units and precision | Money property tests |
| PLAN-DEC-043 | P1 | Quote repricing and acceptance | Pricing | Before M03 execution/closure as applicable | R0.3-06 | Immutable snapshot identity | Price-change race |
| PLAN-DEC-044 | P2 | Demo taxation disclaimer | Pricing | Before M03 execution/closure as applicable | R0.3-08 | Tax port and limitations | Quote tests |

## M04 — Initial eGame purchase (not ratified)

| ID | P | Decision | Owner | Proposed deadline | Dependencies | Required specification | Validation |
|---|---|---|---|---|---|---|---|
| PLAN-DEC-045 | P0 | First-slice buyer journey | Product/eGame | Before M04 execution/closure as applicable | W1-AP-01 | Full happy/failure path scope | E2E acceptance |
| PLAN-DEC-046 | P1 | Admin and store support screens | Product/Admin | Before M04 execution/closure as applicable | W1-AP-01 | Roles and minimal UI scope | Scope review |
| PLAN-DEC-047 | P1 | Financial investigation responsibility | Operations | Before M04 execution/closure as applicable | D-05-OPS | Escalation runbook | Stuck case |
| PLAN-DEC-048 | P1 | Pending/unknown buyer UX | eGame/BFF | Before M04 execution/closure as applicable | AUD-P0-03 | Truthful read contract | False success prevention |
| PLAN-DEC-049 | P1 | Refund and fulfillment support | Admin | Before M04 execution/closure as applicable | AUD-P0-04 | Authorized manual repair | Contradictory effects |
| PLAN-DEC-050 | P2 | Notification secret policy | Notifications | Before M04 execution/closure as applicable | R0.3-23 | No key in message | Content scan |

## M05 — Kafka integration (not ratified)

| ID | P | Decision | Owner | Proposed deadline | Dependencies | Required specification | Validation |
|---|---|---|---|---|---|---|---|
| PLAN-DEC-051 | P1 | Kafka adoption rationale | Integration | Before M05 execution/closure as applicable | D-05-OUTBOX | Exit criteria from polling | No invariant regression |
| PLAN-DEC-052 | P1 | Topic and partition strategy | Integration | Before M05 execution/closure as applicable | R0.6-14 | Ordering key and event ownership | Ordering replay |
| PLAN-DEC-053 | P1 | DLQ and consumer replay | Integration | Before M05 execution/closure as applicable | R0.6-17 | Retry and idempotent resume | Crash/replay |
| PLAN-DEC-054 | P2 | Schema evolution | Integration | Before M05 execution/closure as applicable | R0.6-16 | Registry and contracts | Compatibility run |

## M06 — Framework distribution (not ratified)

| ID | P | Decision | Owner | Proposed deadline | Dependencies | Required specification | Validation |
|---|---|---|---|---|---|---|---|
| PLAN-DEC-055 | P1 | Public npm boundary | Framework | Before M06 execution/closure as applicable | R0.5-06 | Publishable exports | Compatibility |
| PLAN-DEC-056 | P1 | Standalone CommerceCore install | Framework | Before M06 execution/closure as applicable | R0.10-10 | No Cloud dependency | Clean install |
| PLAN-DEC-057 | P1 | Second consumer validation | Framework | Before M06 execution/closure as applicable | R0.10-10 | Distinct use-case acceptance | Consumer conformance |
| PLAN-DEC-058 | P1 | Secure extension ports | Framework | Before M06 execution/closure as applicable | R0.1-05 | No arbitrary tenant execution | Extension policy |
| PLAN-DEC-059 | P2 | SDK compatibility and versions | SDK | Before M06 execution/closure as applicable | R0.5-12 | Generated TypeScript client | Version matrix |

## M07 — Context extraction (not ratified)

| ID | P | Decision | Owner | Proposed deadline | Dependencies | Required specification | Validation |
|---|---|---|---|---|---|---|---|
| PLAN-DEC-060 | P1 | Extraction sequence | Architecture | Before M07 execution/closure as applicable | R0.4-04 | Context order via metrics | Before/after |
| PLAN-DEC-061 | P0 | Single-writer migration | Data | Before M07 execution/closure as applicable | R0.6-22 | Expand-migrate-cutover | Consistency/recovery |
| PLAN-DEC-062 | P0 | Invariants after service split | Architecture | Before M07 execution/closure as applicable | AUD-P0-01, AUD-P0-03 | Cross-service handoff | Partition tests |

## M08 — Infrastructure and deployment (not ratified)

| ID | P | Decision | Owner | Proposed deadline | Dependencies | Required specification | Validation |
|---|---|---|---|---|---|---|---|
| PLAN-DEC-063 | P1 | Kubernetes environment topology | Platform | Before M08 execution/closure as applicable | R0.8-01 | k3d/k3s/provider scope | Failure/cost check |
| PLAN-DEC-064 | P1 | Ingress/TLS/Cloudflare | Security/Platform | Before M08 execution/closure as applicable | R0.8-05 | Origin/certificate policy | Network scans |
| PLAN-DEC-065 | P1 | Helm/Terraform/Argo ownership | Platform | Before M08 execution/closure as applicable | R0.8-14 | IaC/GitOps authority | Drift rollback |
| PLAN-DEC-066 | P0 | Storage/backup topology | Data/Platform | Before M08 execution/closure as applicable | R0.8-11 | CSI/restore/RPO | Real restoration |
| PLAN-DEC-067 | P1 | NetworkPolicy CNI | Security/Platform | Before M08 execution/closure as applicable | R0.8-18 | Enforced egress/ingress | Allow/deny test |
| PLAN-DEC-068 | P2 | Budget/teardown | Platform | Before M08 execution/closure as applicable | R0.8-19 | Spend approval and teardown | Cost report |

## M09 — Reliability and release (not ratified)

| ID | P | Decision | Owner | Proposed deadline | Dependencies | Required specification | Validation |
|---|---|---|---|---|---|---|---|
| PLAN-DEC-069 | P1 | Critical commerce SLO values | SRE | Before M09 execution/closure as applicable | R0.9-10 | Measure checkout/recon/reveal | Load test |
| PLAN-DEC-070 | P1 | Trace/log/metric privacy | SRE/Security | Before M09 execution/closure as applicable | R0.9-06 | Redaction/retention | PII test |
| PLAN-DEC-071 | P0 | Chaos/restore qualification | SRE | Before M09 execution/closure as applicable | R0.10-11 | Crash/recovery gate | Executed fault trials |
| PLAN-DEC-072 | P0 | Security qualification | Security | Before M09 execution/closure as applicable | R0.7-21 | Threat model and pen-test | Security report |
| PLAN-DEC-073 | P0 | Real-money launch authorization | Compliance | Before M09 execution/closure as applicable | R0.10-07 | Legal/tax/ops sign-off | Signed approval |

## Tracking and permission rules

All original D/AUD statuses remain in docs/02-decisions/decision-register.json; these PLAN-DEC identifiers are provisional catalog keys, not ratified ADRs. Reuse GitHub #1–#13 and Linear SER-118–SER-130 for audit findings. Never create a coding ticket before its parent scope, required G3 contracts, test oracles and explicit implementation authorization are approved. No timeout or lease may stand in for negative Stripe proof or safe license nondisclosure.
