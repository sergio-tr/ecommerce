# Wave 1 — Architecture Decision / Dependency Backlog

**Current state:** 103 planning questions, 30 canonical existing IDs and 73 provisional PLAN-DEC IDs. **Approved:** W1-AP-01/03/04/05 as scoped directions; M00–M09 retained, M00.5 not approved. No new domain ADRs or implementation issues are accepted. The four AUD-P0 audits remain OPEN / BLOCKING.

**Dependency correction:** prior export produced five cycles by misclassifying coupled reviews as hard prereqs. This revision separates hardPrerequisites, relatedContextAndSourceIds and coDesignLinks. **Zero directed cycles** in the corrected planning graph. This is a scheduling-level correction, not proof that joint financial design has been resolved.

**Overlap review:** 14 provisional planning questions are now marked REFINEMENT_OF_EXISTING_WORK_NOT_NEW_ISSUE (see related existing ID). The other 59 proposals remain source/scope pending; absence of exact title duplicates is not enough to call them unique engineering work.

## Canonical existing work (source status unchanged)

| ID | Actual status | P | Question | Owner | Directed prerequisites | Related/source or co-design | Required specification | Evidence |
|---|---|---|---|---|---|---|---|---|
| AUD-P0-01 | OPEN / BLOCKING | P0 | Prove exclusion across Stripe dispatch cancellation and Inventory release | Payments/Ordering/Inventory | D-05-MONGO | AUD-P0-02 | Versioned dispatch/closure/release permits and external quiescence guards | Provider-backed late POST tests and recovery |
| AUD-P0-02 | OPEN / BLOCKING | P0 | Prove recovery of Stripe UNKNOWN without Session ID | Payments | — | AUD-P0-01 | Correlation, provider capabilities, evidence and safe close | Stripe test-mode object search/late dispatch trials |
| AUD-P0-03 | OPEN / BLOCKING | P0 | Prove preserved paid obligation across context failures | Payments/Ordering | D-05-MONGO, AUD-P0-02 | — | Capture fact and atomic local propagation contracts | Crash/ACK-loss/tenant isolation tests |
| AUD-P0-04 | OPEN / BLOCKING | P0 | Prove exclusive irreversible fulfillment or refund | Ordering/Fulfillment/Payments | AUD-P0-01 | M00.2 | Effect capability quiescence and resolution commands | Lost delivery/refund response tests |
| AUD-P1-01 | OPEN | P1 | Select Reservation FSM and StockPool atomicity | Inventory | AUD-P0-01 | D-01-SM | Transitions, versions, conservation equation | Final-unit races and failover |
| AUD-P1-02 | OPEN | P1 | Select concrete Ordering saga FSM and truth boundaries | Ordering | AUD-P0-03, D-05-MONGO | — | Order/CheckoutProcess status and local atomic continuation | Duplicate and out-of-order financial fact |
| AUD-P1-03 | OPEN / NOT RATIFIED | P1 | Ratify or reject commercial double retry-window policy | Ordering/Payments | AUD-P0-01 | D-06-RETRY-WINDOW | Commercial and provider deadlines distinction | AUD13 tests after approval |
| AUD-P1-04 | OPEN | P1 | Select Stripe Connect methods and capture enforcement | Payments/CommerceCloud | AUD-P0-03 | — | Account topology, capture and store payment rules | Provider actual API/test-mode validation |
| AUD-P1-05 | OPEN | P1 | Specify Mongo durability and ambiguous commit | Shared persistence ports | D-05-MONGO | — | Document/transaction/write concern/restart contracts | Mongo failover tests |
| AUD-P1-06 | OPEN | P1 | Specify all-or-nothing multi-line sale and allocation | Inventory/Fulfillment | AUD-P0-04, AUD-P1-01 | — | Batch capacity/all-line preparation contract | Concurrent stock and partial exposure tests |
| AUD-P2-01 | OPEN | P2 | Normalize Payment Session Attempt Refund vocabulary | Payments/Ordering | AUD-P1-02 | — | Canonical cross-context glossary | Contract review |
| AUD-P2-02 | OPEN | P2 | Validate 35-minute Checkout and two attempt defaults | Payments/Commerce | D-06-P01 | D-02-P01 | Config version and measurement plan | Stripe test mode and buyer flow |
| AUD-P2-03 | OPEN | P2 | Complete evidence and requirement trace coverage | Architecture governance | — | W1-GAP-04 | Trace matrix and source-oracle mapping | Catalog integrity check |
| D-01-SM | PROPOSED — SELECTED | P1 | Formalize capacity-specific Reservation states | Inventory | AUD-P1-01 | — | Final FSM transitions and release identity | Property tests |
| D-02-P01 | PROPOSED — SELECTED | P2 | Select actual Checkout Session duration policy | Payments | AUD-P2-02 | — | Config version/min/max/clock handling | Provider experiments |
| D-03-CONFIG | PENDING | P1 | Enforce store payment methods with Stripe API | Payments/CommerceCloud | AUD-P1-04 | — | Actual API/provider account guard contract | Provider card/3DS test mode |
| AUD-P0-03-CAPTURE | PENDING | P0 | Define authorization vs captured funds evidence | Payments/Ordering | AUD-P0-03 | — | Captured/pending/requires_capture semantics | Stripe capture-mode tests |
| D-04-SM | PROPOSED — SELECTED | P1 | Select commercial compensation FSM and evidence | Ordering | AUD-P0-04 | — | Branch guards and irreversible effects | Refund/license races |
| D-04-P01 | PENDING | P2 | Choose bounded fulfillment recovery and escalation policy | Ordering | AUD-P0-04 | — | Retry budgets without false terminal states | Stuck saga scenarios |
| D-04-CONNECT | PENDING | P1 | Select refund fund-flow and Stripe Connect scope | Payments | AUD-P1-04 | — | Charge owner/refund account/transfer reversal | Provider test-mode refunds |
| D-05-MONGO | PENDING | P0 | Set local Mongo atomicity and durability contract | Infrastructure ports | — | AUD-P0-03 | Transaction/journal/write concern/unknown commit | Failover/commit uncertainty |
| D-05-CONCURRENCY | PENDING | P1 | Specify safe worker concurrency and fencing | Payments/Ordering | AUD-P0-01 | — | Conditional authorization and worker restart rules | Suspended-worker tests |
| D-05-OPS | PENDING | P1 | Specify reconciliation and incident alerting | Payments/Operations | AUD-P0-02 | — | Escalation ownership/rate budgets | Stuck operation observability |
| D-06-P01 | PROPOSED — SELECTED | P2 | Select maximum sequential hosted Sessions | Payments/Ordering | AUD-P1-03 | — | Policy value+version | Repeat/abuse load tests |
| D-06-RETRY-WINDOW | PENDING | P1 | Choose commercial retry eligibility deadlines | Ordering | AUD-P1-03 | — | Relative/global cutoff semantics | Race and expiry tests |
| D-06-INTENT | PENDING | P1 | Prevent incompatible multi-checkout attempts | Ordering/Payments | D-06-RETRY-WINDOW | — | Intent identity, legitimate multiple buys | Idempotency/abuse tests |
| D-07-AUTH | PENDING | P1 | Authorize guest cancellation and ownership | Identity/Ordering | — | M00.3 | Actor-resource proof and expiration | BOLA negative tests |
| D-07-CONCURRENCY | PENDING | P0 | Specify cancel vs in-flight create/capture | Ordering/Payments | AUD-P0-01, AUD-P0-02 | — | Barrier and cancellation contracts | Concurrence with 3DS/unknown |
| D-07-OPS | PENDING | P2 | Define cancellation recovery and investigation | Operations | D-05-OPS | — | Safe retries/alerts | Stuck cancel tests |
| D-03-LINK | PENDING | P2 | Decide Stripe Link inclusion and method constraints | Payments | D-03-CONFIG | — | Link policy or defer | Provider method enforcement test |

## M00.2 — Provisional specification questions

| Provisional ID | Relationship | P | Question | Proposed owner | Hard prerequisites | Co-design / source context | Required spec | Verification obligation |
|---|---|---|---|---|---|---|---|---|
| PLAN-DEC-001 | Refine AUD-P1-01 | P0 | StockPool vs Reservation aggregate | Inventory | AUD-P1-01 | — | Aggregate ownership and atomic balances | Last unit reservation races |
| PLAN-DEC-002 | Source review required | P1 | Shared pools and store quotas | Inventory | — | R0.3-10 | Store quota model and release | Cross-store oversell |
| PLAN-DEC-003 | Refine AUD-P1-06 | P0 | Multi-line reservation integrity | Inventory | AUD-P1-06 | — | All-or-nothing holds | Partial capacity/crash |
| PLAN-DEC-004 | Refine AUD-P0-04 | P0 | Unique DigitalLicense assignment | Fulfillment | AUD-P0-04 | — | Per-orderLine ownership uniqueness | Concurrent duplicate claims |
| PLAN-DEC-005 | Source review required | P1 | License encryption and rotation | Fulfillment/Security | — | R0.7-17 | DEK/KEK access policy | Rotation/no key leakage |
| PLAN-DEC-006 | Refine AUD-P0-04 | P0 | Irreversible reveal capability | Fulfillment | — | AUD-P0-04-QUIESCENCE | Reveal authorization and neutralization | Lost HTTP reply |
| PLAN-DEC-007 | Refine AUD-P1-06 | P1 | Full-order preparation | Fulfillment | AUD-P1-06 | — | Line readiness before any reveal | Multi-line failure |
| PLAN-DEC-008 | Source review required | P2 | Stock adjustment and invalidation | Inventory/Admin | — | CAP-ADMIN-007 | Auditable corrective movements | Operator auth |

## M00.3 — Provisional specification questions

| Provisional ID | Relationship | P | Question | Proposed owner | Hard prerequisites | Co-design / source context | Required spec | Verification obligation |
|---|---|---|---|---|---|---|---|---|
| PLAN-DEC-009 | Source review required | P1 | Keycloak realms and organizations | Identity | — | R0.7-01 | B2B/B2C authority | OIDC integration |
| PLAN-DEC-010 | Source review required | P0 | Actor-resource-action matrix | Security | — | R0.7-05 | RBAC/ABAC for each effect | Cross-tenant negatives |
| PLAN-DEC-011 | Source review required | P0 | Guest checkout secret identity | Identity/Cart | D-07-AUTH | — | Guest token lifecycle | Replay/forgery |
| PLAN-DEC-012 | Source review required | P0 | Guest Order claim and key access | Identity/Fulfillment | — | R0.7-10 | One-time verified claim | Expired token/hijack |
| PLAN-DEC-013 | Source review required | P0 | Trusted TenantContext | Security | — | R0.7-07 | Scoped command and event identity | Tenant mixup |
| PLAN-DEC-014 | Source review required | P2 | Support privilege elevation | Security/Ops | — | R0.7-08 | Temporal escalation and audit | Expired permission |
| PLAN-DEC-015 | Source review required | P1 | BFF session and CSRF | Identity/BFF | — | R0.7-03 | PKCE/cookies/redirect checks | Session attack |
| PLAN-DEC-016 | Source review required | P1 | Privacy retention and deletion | Security/Cloud | — | R0.7-18 | Protected data retention | Compliance review |

## M00.4 — Provisional specification questions

| Provisional ID | Relationship | P | Question | Proposed owner | Hard prerequisites | Co-design / source context | Required spec | Verification obligation |
|---|---|---|---|---|---|---|---|---|
| PLAN-DEC-017 | Refine AUD-P1-01, AUD-P1-02 | P0 | Definitive context and aggregate map | Architecture | AUD-P1-01, AUD-P1-02 | — | Owner and aggregate boundaries | Architecture conformance |
| PLAN-DEC-018 | Refine AUD-P2-01 | P0 | Command and error semantics | Architecture | AUD-P2-01 | — | Scope/version/idempotency/conflict | Negative contracts |
| PLAN-DEC-019 | Source review required | P1 | OpenAPI request/response versioning | API | — | R0.4-05 | API compatibility policy | Schema diff |
| PLAN-DEC-020 | Source review required | P1 | Event envelope and duplicates | Integration | — | D-05-OUTBOX | Source authority and dedup | Replay tests |
| PLAN-DEC-021 | Source review required | P1 | Effective store policy versioning | CommerceCloud | — | R0.2-12 | Config precedence/snapshot | Mid-checkout policy change |
| PLAN-DEC-022 | Refine D-05-MONGO | P0 | Local atomicity map | Architecture | D-05-MONGO | — | Fact and outbox guarantee | Ambiguous DB commits |
| PLAN-DEC-023 | Refine AUD-P1-02 | P1 | Read projections and command guards | Architecture/BFF | AUD-P1-02 | — | Lag and stale-safe commands | Delayed projections |
| PLAN-DEC-024 | Refine D-03-CONFIG | P1 | Stripe adapter boundary | Payments | — | D-03 | Provider-neutral port | Contract conformance |
| PLAN-DEC-025 | Source review required | P2 | Contract deprecation rules | Integration | — | R0.4-11 | Version compatibility | Old SDK test |
| PLAN-DEC-026 | Refine W1-GAP-01 | P0 | R1-to-ratified policy crosswalk | Governance | — | W1-GAP-01 | Retained/changed/rejected clauses | Full clause coverage |

## M01 — Provisional specification questions

| Provisional ID | Relationship | P | Question | Proposed owner | Hard prerequisites | Co-design / source context | Required spec | Verification obligation |
|---|---|---|---|---|---|---|---|---|
| PLAN-DEC-027 | Source review required | P1 | Monorepo and package boundary | Engineering | — | R0.5-04 | Nx/pnpm modules | Forbidden import tests |
| PLAN-DEC-028 | Source review required | P1 | Runtime/toolchain pinning | Engineering | — | R0.5-09 | Node/TS/NestJS versions | Reproducible clean build |
| PLAN-DEC-029 | Source review required | P1 | CI branch protections | Engineering | — | GOV-002 | Required checks and PR flow | Enforcement test |
| PLAN-DEC-030 | Source review required | P1 | Test harness responsibilities | Quality | — | R0.5-13 | Unit/integration/E2E conventions | Smoke run |
| PLAN-DEC-031 | Source review required | P1 | Secrets and config boundary | Security | — | R0.7-16 | Config validation/secrets | Leak scan |
| PLAN-DEC-032 | Source review required | P1 | Open-source license decision | Governance | — | R0.1-08 | License and public releases | Legal check |
| PLAN-DEC-033 | Source review required | P2 | Local environment and budget | Platform | — | R0.8-01 | WSL/Compose reproducibility | Environment replay |

## M02 — Provisional specification questions

| Provisional ID | Relationship | P | Question | Proposed owner | Hard prerequisites | Co-design / source context | Required spec | Verification obligation |
|---|---|---|---|---|---|---|---|---|
| PLAN-DEC-034 | Source review required | P1 | Tenant/Brand/Store lifecycle | CommerceCloud | — | R0.2-01 | State and ownership | Scoped access tests |
| PLAN-DEC-035 | Source review required | P1 | Provisioning to CommerceCore | CommerceCloud | — | R0.4-02 | Independent provisioning saga | Partial failure recovery |
| PLAN-DEC-036 | Source review required | P1 | Store-scoped customer identity | Identity | — | R0.2-06 | Profile/link lifecycle | Tenant isolation |
| PLAN-DEC-037 | Source review required | P1 | Invites and membership | CommerceCloud | — | R0.7-02 | Claim/revoke permissions | Invitation replay |
| PLAN-DEC-038 | Source review required | P1 | Store policy configuration | CommerceCloud | — | R0.2-12 | Versioned precedence | Effective policy tests |

## M03 — Provisional specification questions

| Provisional ID | Relationship | P | Question | Proposed owner | Hard prerequisites | Co-design / source context | Required spec | Verification obligation |
|---|---|---|---|---|---|---|---|---|
| PLAN-DEC-039 | Source review required | P1 | Product Variant SKU contracts | Catalog | — | R0.3-01 | Aggregate and index semantics | Unique SKU tests |
| PLAN-DEC-040 | Source review required | P1 | Master/local inheritance | Catalog | — | R0.3-03 | Override propagation | Update conflict |
| PLAN-DEC-041 | Source review required | P1 | Listing vs Offer lifecycle | Merchandising | — | R0.3-04 | Publication/sale eligibility | Unavailable offer |
| PLAN-DEC-042 | Source review required | P0 | Exact money/rounding | Pricing | — | R0.3-05 | Minor units and precision | Money property tests |
| PLAN-DEC-043 | Source review required | P1 | Quote repricing and acceptance | Pricing | — | R0.3-06 | Immutable snapshot identity | Price-change race |
| PLAN-DEC-044 | Source review required | P2 | Demo taxation disclaimer | Pricing | — | R0.3-08 | Tax port and limitations | Quote tests |

## M04 — Provisional specification questions

| Provisional ID | Relationship | P | Question | Proposed owner | Hard prerequisites | Co-design / source context | Required spec | Verification obligation |
|---|---|---|---|---|---|---|---|---|
| PLAN-DEC-045 | Refine W1-AP-01 | P0 | First-slice buyer journey | Product/eGame | — | W1-AP-01 | Full happy/failure path scope | E2E acceptance |
| PLAN-DEC-046 | Source review required | P1 | Admin and store support screens | Product/Admin | — | W1-AP-01 | Roles and minimal UI scope | Scope review |
| PLAN-DEC-047 | Refine D-05-OPS | P1 | Financial investigation responsibility | Operations | D-05-OPS | — | Escalation runbook | Stuck case |
| PLAN-DEC-048 | Source review required | P1 | Pending/unknown buyer UX | eGame/BFF | AUD-P0-03 | — | Truthful read contract | False success prevention |
| PLAN-DEC-049 | Refine AUD-P0-04 | P1 | Refund and fulfillment support | Admin | AUD-P0-04 | — | Authorized manual repair | Contradictory effects |
| PLAN-DEC-050 | Source review required | P2 | Notification secret policy | Notifications | — | R0.3-23 | No key in message | Content scan |

## M05 — Provisional specification questions

| Provisional ID | Relationship | P | Question | Proposed owner | Hard prerequisites | Co-design / source context | Required spec | Verification obligation |
|---|---|---|---|---|---|---|---|---|
| PLAN-DEC-051 | Source review required | P1 | Kafka adoption rationale | Integration | — | D-05-OUTBOX | Exit criteria from polling | No invariant regression |
| PLAN-DEC-052 | Source review required | P1 | Topic and partition strategy | Integration | — | R0.6-14 | Ordering key and event ownership | Ordering replay |
| PLAN-DEC-053 | Source review required | P1 | DLQ and consumer replay | Integration | — | R0.6-17 | Retry and idempotent resume | Crash/replay |
| PLAN-DEC-054 | Source review required | P2 | Schema evolution | Integration | — | R0.6-16 | Registry and contracts | Compatibility run |

## M06 — Provisional specification questions

| Provisional ID | Relationship | P | Question | Proposed owner | Hard prerequisites | Co-design / source context | Required spec | Verification obligation |
|---|---|---|---|---|---|---|---|---|
| PLAN-DEC-055 | Source review required | P1 | Public npm boundary | Framework | — | R0.5-06 | Publishable exports | Compatibility |
| PLAN-DEC-056 | Source review required | P1 | Standalone CommerceCore install | Framework | — | R0.10-10 | No Cloud dependency | Clean install |
| PLAN-DEC-057 | Source review required | P1 | Second consumer validation | Framework | — | R0.10-10 | Distinct use-case acceptance | Consumer conformance |
| PLAN-DEC-058 | Source review required | P1 | Secure extension ports | Framework | — | R0.1-05 | No arbitrary tenant execution | Extension policy |
| PLAN-DEC-059 | Source review required | P2 | SDK compatibility and versions | SDK | — | R0.5-12 | Generated TypeScript client | Version matrix |

## M07 — Provisional specification questions

| Provisional ID | Relationship | P | Question | Proposed owner | Hard prerequisites | Co-design / source context | Required spec | Verification obligation |
|---|---|---|---|---|---|---|---|---|
| PLAN-DEC-060 | Source review required | P1 | Extraction sequence | Architecture | — | R0.4-04 | Context order via metrics | Before/after |
| PLAN-DEC-061 | Source review required | P0 | Single-writer migration | Data | — | R0.6-22 | Expand-migrate-cutover | Consistency/recovery |
| PLAN-DEC-062 | Source review required | P0 | Invariants after service split | Architecture | AUD-P0-01, AUD-P0-03 | — | Cross-service handoff | Partition tests |

## M08 — Provisional specification questions

| Provisional ID | Relationship | P | Question | Proposed owner | Hard prerequisites | Co-design / source context | Required spec | Verification obligation |
|---|---|---|---|---|---|---|---|---|
| PLAN-DEC-063 | Source review required | P1 | Kubernetes environment topology | Platform | — | R0.8-01 | k3d/k3s/provider scope | Failure/cost check |
| PLAN-DEC-064 | Source review required | P1 | Ingress/TLS/Cloudflare | Security/Platform | — | R0.8-05 | Origin/certificate policy | Network scans |
| PLAN-DEC-065 | Source review required | P1 | Helm/Terraform/Argo ownership | Platform | — | R0.8-14 | IaC/GitOps authority | Drift rollback |
| PLAN-DEC-066 | Source review required | P0 | Storage/backup topology | Data/Platform | — | R0.8-11 | CSI/restore/RPO | Real restoration |
| PLAN-DEC-067 | Source review required | P1 | NetworkPolicy CNI | Security/Platform | — | R0.8-18 | Enforced egress/ingress | Allow/deny test |
| PLAN-DEC-068 | Source review required | P2 | Budget/teardown | Platform | — | R0.8-19 | Spend approval and teardown | Cost report |

## M09 — Provisional specification questions

| Provisional ID | Relationship | P | Question | Proposed owner | Hard prerequisites | Co-design / source context | Required spec | Verification obligation |
|---|---|---|---|---|---|---|---|---|
| PLAN-DEC-069 | Source review required | P1 | Critical commerce SLO values | SRE | — | R0.9-10 | Measure checkout/recon/reveal | Load test |
| PLAN-DEC-070 | Source review required | P1 | Trace/log/metric privacy | SRE/Security | — | R0.9-06 | Redaction/retention | PII test |
| PLAN-DEC-071 | Source review required | P0 | Chaos/restore qualification | SRE | — | R0.10-11 | Crash/recovery gate | Executed fault trials |
| PLAN-DEC-072 | Source review required | P0 | Security qualification | Security | — | R0.7-21 | Threat model and pen-test | Security report |
| PLAN-DEC-073 | Source review required | P0 | Real-money launch authorization | Compliance | — | R0.10-07 | Legal/tax/ops sign-off | Signed approval |

## Joint design without circular blocking

The following are CO-DESIGN relationships (not mutually blocking completion prerequisites): AUD-P0-01 and AUD-P0-02; AUD-P0-03 and D-05-MONGO; AUD-P1-01 and D-01-SM; AUD-P1-03 and D-06-RETRY-WINDOW; AUD-P2-02 and D-02-P01. Their final milestone gate remains coupled where required: none can claim financial safety merely because the other is recorded as reviewed.

## Source and issue creation

Existing #1–#13 / SER-118–130 remain authoritative for audit risks. PLAN-DEC is not an accepted ADR or implementation ticket. Individual prior source texts must be checked before a proposed item can be promoted. Every future executable issue requires G3 contract completeness, authorized scope and explicit user implementation permission. No new tracker issue was created in this review.
