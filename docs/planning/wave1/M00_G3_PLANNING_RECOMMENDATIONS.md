# M00-G3 — Every planning item accounted for: recommended design disposition

**As of:** 2026-10-30. **Owner:** @sergio-tr. **Status:** 103/103 RECOMMENDATIONS WRITTEN, 0 AUTO-RATIFICATIONS; original canonical states retained. This table is an **initial design proposal** to minimize expensive changes, not a claim that all detailed schemas or runtime tests have passed. The source inventory is [DECISION_BACKLOG.md](DECISION_BACKLOG.md), which retains each item's complete owner, external dependencies, linked provenance and test obligation. The concrete 13 audit contract candidates are in [M00_G3_ALL_13_AUDITS_RECOMMENDED_CONTRACTS.md](../../architecture/m00/M00_G3_ALL_13_AUDITS_RECOMMENDED_CONTRACTS.md); domain/port seams in [M00_G3_EVOLVABLE_REFERENCE_ARCHITECTURE.md](../../architecture/m00/M00_G3_EVOLVABLE_REFERENCE_ARCHITECTURE.md).

## Enumeration and rules

- **13 existing audit findings + 17 named other canonical planning topics + 73 provisional PLAN-DEC = 103** distinct *inventory entries*; not 103 automatically independent ADRs. Every identifier below matches the existing inventory.
- Each row below proposes a preferred **starting design**, not a change to `docs/02-decisions/decision-register.json` or to any existing user-accepted option. In case of difference, original accepted decision prevails pending explicit review. P0/OPEN/BLOCKING statuses and 148 TEST_PLANNED results are preserved.
- All `PLAN-DEC-xxx` remain `PROPOSED_PLANNING_ONLY_NOT_RATIFIED`. Some are subordinate details of existing accepted policies; some require a distinct future decision. Do not create duplicate per-row issues without evidence of a distinct owner/decision.
- The column `Planning horizon` indicates the **first dependent milestone**, not an authorization to implement there. Hard dependencies are retained from source inventory and must be checked when completing a particular contract.
- All recommendations are changeable through a new reviewed ADR + versioned migration, not by retroactively rewriting their provenance.
- A row with provider/driver semantics is **DESIGN_RECOMMENDED / G5 NOT_RUN**, irrespective of its priority.

## Exhaustive recommendation matrix

| Existing ID | Priority | Planning horizon | Current source state (unchanged) | Recommended initial disposition | Hard prerequisite in original backlog |
|---|---|---|---|---|---|
| AUD-P0-01 | P0 | M00.1 / M04 | OPEN / BLOCKING | Durable possible-send ledger; no release until all prior external opportunities positively neutralized; otherwise HOLD/INCIDENT. | D-05-MONGO |
| AUD-P0-02 | P0 | M00.1 / M04 | OPEN / BLOCKING | Record account/mode/key/hash/send; provider unknown is unresolved; no blind resend or inference from negative search. | None |
| AUD-P0-03 | P0 | M00.1 / M04 | OPEN / BLOCKING | Preexisting immutable Order; Payments owner-local captured fact + Outbox; Ordering Inbox+commercial incorporation atomic. | D-05-MONGO, AUD-P0-02 |
| AUD-P0-04 | P0 | M00.1 / M04 | OPEN / BLOCKING | Prepare all licenses; durable possible-disclosure before any secret response; no automatic incompatible refund. | AUD-P0-01 |
| AUD-P1-01 | P1 | M00.1 / M04 | OPEN | Four candidate capacity phases; StockPool+Reservation atomic owner-local balance and CAS; TTL triggers review only. | AUD-P0-01 |
| AUD-P1-02 | P1 | M00.1 / M04 | OPEN | Order commercial obligation, CheckoutProcess durable coordinator, Payments money truth; no universal FSM. | AUD-P0-03, D-05-MONGO |
| AUD-P1-03 | P1 | M00.1 / M04 | OPEN | Accepted option D policy; relative proven-closure and absolute admission cutoff; first slice forbids successor. | AUD-P0-01 |
| AUD-P1-04 | P1 | M00.1 / M04 | OPEN | One test-mode merchant; cards/3DS and automatic capture with method enforcement; Connect deferred. | AUD-P0-03 |
| AUD-P1-05 | P1 | M00.1 / M00.2 | OPEN | Owner-local Mongo transactions and indexes; majority commit, uncertain commit readback; single node not HA. | D-05-MONGO |
| AUD-P1-06 | P1 | M00.1 / M04 | OPEN | All-line reserve and prepare before reveal; first exposed MVP one line; no routine partial refund. | AUD-P0-04, AUD-P1-01 |
| AUD-P2-01 | P2 | M00.4 / M01 | OPEN | Typed glossary differentiates domain, provider, owner-local fact and read projection. | AUD-P1-02 |
| AUD-P2-02 | P2 | M00.4 / M01 | OPEN | Persist actual Stripe expires_at; no universal 35m/two sessions; measure supported bounds. | D-06-P01 |
| AUD-P2-03 | P2 | M00.4 / M01 | OPEN | ID trace source-hash→ADR→contract→task→oracle→executed evidence; preserve NOT_RUN. | None |
| D-01-SM | P1 | M00.1 / M04 | PROPOSED — SELECTED | Recommend capacity-only RESERVED/PAYMENT_PROTECTED/COMMITTED/RELEASED subject to explicit state review; do not mirror Stripe. | AUD-P1-01 |
| D-02-P01 | P2 | M00.1 / M04 | PROPOSED — SELECTED | Keep 35m as configurable candidate, clamp only after proving provider bounds; never use expiry as absent-charge evidence. | AUD-P2-02 |
| D-03-CONFIG | P1 | M00.1 / M04 | PENDING | Send explicit allowed methods; verify provider effective method restriction, including Link and wallets in actual account. | AUD-P1-04 |
| AUD-P0-03-CAPTURE | P0 | M00.1 / M04 | PENDING | Separate session complete, paid status, PaymentIntent requires_capture and confirmed captured amount. | AUD-P0-03 |
| D-04-SM | P1 | M00.1 / M04 | PROPOSED — SELECTED | Resolution state/guard contract belongs to Order; CheckoutProcess tracks steps, not another commercial truth. | AUD-P0-04 |
| D-04-P01 | P2 | M00.1 / M04 | PENDING | Bound recovery retries per operation kind, persist retry budget and incident escalation; no forced financial terminal state. | AUD-P0-04 |
| D-04-CONNECT | P1 | M00.1 / M04 | PENDING | Defer Connect refund flow until merchant/account ownership and fund-reversal ADR; no implied initial multi-seller. | AUD-P1-04 |
| D-05-MONGO | P0 | M00.1 / M00.2 | PENDING | Owner-local tx + unique ID + snapshot where necessary + majority commit; readback ambiguous commit. | None |
| D-05-CONCURRENCY | P1 | M00.1 / M04 | PENDING | Durable operation authorization and fencing plus unsafe-send hold; leases alone never retract HTTP. | AUD-P0-01 |
| D-05-OPS | P1 | M00.1 / M04 | PENDING | Incident queue by tenant/account/op with redacted evidence, reconciliation budgets, alerting and human ownership. | AUD-P0-02 |
| D-06-P01 | P2 | M00.1 / M04 | PROPOSED — SELECTED | One hosted session exposed in first slice; two sequential opportunities as configurable future candidate with proof. | AUD-P1-03 |
| D-06-RETRY-WINDOW | P1 | M00.1 / M04 | PROPOSED — SELECTED | Relative deadline after proven-negative plus absolute original-order deadline; precise times left parametrized. | AUD-P1-03 |
| D-06-INTENT | P1 | M00.1 / M04 | PENDING | One accepted Order intent/generation with dedupe scope; a second legitimate purchase creates a distinct Order. | D-06-RETRY-WINDOW |
| D-07-AUTH | P1 | M00.1 / M04 | PENDING | Tenant/store/order-bound guest capability, server proof and explicit cancellation authorization; no email-only proof. | None |
| D-07-CONCURRENCY | P0 | M00.1 / M04 | PENDING | Cancel closes new admission, drains/reconciles old possible sends, waits for release permit; late funds remain obligation. | AUD-P0-01, AUD-P0-02 |
| D-07-OPS | P2 | M00.1 / M04 | PENDING | Persist uncertain cancellation and operator investigation; do not equate provider expiry request to completed closure. | D-05-OPS |
| D-03-LINK | P2 | M00.1 / M04 | PENDING | Defer Link for initial card-only slice until verified effective suppression; fail closed if not enforceable. | D-03-CONFIG |
| PLAN-DEC-001 | P0 | M00.1–M00.4 / M01 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Distinct StockPool and Reservation owner-model; owner-local transactional CAS or single-document optimization later. | AUD-P1-01 |
| PLAN-DEC-002 | P1 | M00.1–M00.4 / M01 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Explicit same-tenant pool quotas per Store with atomic global and quota conservation. | None |
| PLAN-DEC-003 | P0 | M00.1–M00.4 / M01 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | One owner-local batch reservation transaction for all lines; rollback entire attempt on one shortage. | AUD-P1-06 |
| PLAN-DEC-004 | P0 | M00.1–M00.4 / M01 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Unique immutable DigitalLicense binding to OrderLine with tenant scope, DB index and irreversible reuse rule. | AUD-P0-04 |
| PLAN-DEC-005 | P1 | M00.1–M00.4 / M01 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Ciphertext-at-rest, per-environment keys, provider-neutral encryption port and versioned rotation with audit. | None |
| PLAN-DEC-006 | P0 | M00.1–M00.4 / M01 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Persist POSSIBLE_DISCLOSURE before first secret-bearing response; grants never prove no exposure. | None |
| PLAN-DEC-007 | P1 | M00.1–M00.4 / M01 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Prepare every OrderLine assignment before issuing any consumer disclosure permit. | AUD-P1-06 |
| PLAN-DEC-008 | P2 | M00.1–M00.4 / M01 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Audited stock movements, authorized corrections only; never silently mutate historical sold/assigned units. | None |
| PLAN-DEC-009 | P1 | M00.1–M00.4 / M01 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Keycloak as replaceable OIDC adapter; tenancy and per-resource authorization enforced in CommerceCore. | None |
| PLAN-DEC-010 | P0 | M00.1–M00.4 / M01 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Deny-by-default actor-resource-action policy per effect, including tenant/store/order/generation. | None |
| PLAN-DEC-011 | P0 | M00.1–M00.4 / M01 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Opaque random guest capability in secure cookie hashed server side, scoped to Store/Order/actions. | D-07-AUTH |
| PLAN-DEC-012 | P0 | M00.1–M00.4 / M01 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Single-use verified guest Order claim; revocation/rotation and cross-tenant denial. | None |
| PLAN-DEC-013 | P0 | M00.1–M00.4 / M01 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Derive trusted TenantContext from validated actor+Store policy; never trust raw client tenant header. | None |
| PLAN-DEC-014 | P2 | M00.1–M00.4 / M01 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Time-limited, reasoned support elevation with audit, least privilege and no financial-bypass permission. | None |
| PLAN-DEC-015 | P1 | M00.1–M00.4 / M01 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | BFF OIDC auth code+PKCE, secure SameSite HttpOnly cookies, CSRF and token boundary. | None |
| PLAN-DEC-016 | P1 | M00.1–M00.4 / M01 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | PII minimization and retention policy by class; preserve mandatory immutable financial audit facts. | None |
| PLAN-DEC-017 | P0 | M00.1–M00.4 / M01 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Owner matrix Catalog, Merchandising, Pricing, Cart, Ordering, Payments, Inventory, Fulfillment, Identity and Cloud. | AUD-P1-01, AUD-P1-02 |
| PLAN-DEC-018 | P0 | M00.1–M00.4 / M01 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Versioned command envelope, immutable idempotency hash, actor scope and typed conflict/UNKNOWN results. | AUD-P2-01 |
| PLAN-DEC-019 | P1 | M00.1–M00.4 / M01 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | OpenAPI semantic versioning, backward-compatible fields, breaking migration by expand/deprecate. | None |
| PLAN-DEC-020 | P1 | M00.1–M00.4 / M01 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | At-least-once event envelope with owner aggregate version, idempotent Inbox, durable Outbox. | None |
| PLAN-DEC-021 | P1 | M00.1–M00.4 / M01 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Effective StorePolicy snapshot immutable at accepted Quote/Order with version and issuer. | None |
| PLAN-DEC-022 | P0 | M00.1–M00.4 / M01 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Owner-local transaction matrix; cross-owner integration via Inbox/Outbox, never shared writes. | D-05-MONGO |
| PLAN-DEC-023 | P1 | M00.1–M00.4 / M01 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Versioned projections for UX only; authoritative owner reads before irreversible commands. | AUD-P1-02 |
| PLAN-DEC-024 | P1 | M00.1–M00.4 / M01 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Stripe SDK behind PaymentProviderPort; operation identity/account/version/evidence and circuit handling. | None |
| PLAN-DEC-025 | P2 | M00.1–M00.4 / M01 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Contract support window and consumer version inventory; additive deprecation, not silent mutation. | None |
| PLAN-DEC-026 | P0 | M00.1–M00.4 / M01 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Crosswalk all source R1 clauses and human approval against each canonical ratified decision. | None |
| PLAN-DEC-027 | P1 | M00.1–M00.4 / M01 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Nx modular domain/application/infrastructure packages; enforce forbidden private imports. | None |
| PLAN-DEC-028 | P1 | M00.1–M00.4 / M01 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Per-repo mise Node24.22.2 and pnpm11.10.0, Nx23.3.1, Nest11.2.8, TS5.9.3; no global update. | None |
| PLAN-DEC-029 | P1 | M00.1–M00.4 / M01 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | SHA-pin CI actions, least privileges, reproducible frozen install and protected main reviews. | None |
| PLAN-DEC-030 | P1 | M00.1–M00.4 / M01 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Split domain unit/property, contract, Mongo transaction, provider sandbox, worker race and e2e suites. | None |
| PLAN-DEC-031 | P1 | M00.1–M00.4 / M01 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Per-role scoped config and secrets ports; local ignored files, never live Stripe keys in learning mode. | None |
| PLAN-DEC-032 | P1 | M00.1–M00.4 / M01 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Keep distribution/license unresolved until intended public distribution; do not implicitly grant open-source rights. | None |
| PLAN-DEC-033 | P2 | M00.1–M00.4 / M01 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Local WSL2 ext4 baseline; separate k3d resource check, no paid service requirement. | None |
| PLAN-DEC-034 | P1 | M02 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Cloud owns lifecycle Tenant→Brand/Store→Channels with immutable active-state references in Core. | None |
| PLAN-DEC-035 | P1 | M02 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Idempotent versioned Cloud provisioning command to Core with reconciliation and permissions. | None |
| PLAN-DEC-036 | P1 | M02 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Store-scoped commercial CustomerProfile; identity account may be federated separately. | None |
| PLAN-DEC-037 | P1 | M02 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Invite as one-use scoped role assignment with expiry and revocation audit. | None |
| PLAN-DEC-038 | P1 | M02 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | StorePolicy versioned publish/activate event; accepted Order unaffected by later config. | None |
| PLAN-DEC-039 | P1 | M03 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Catalog Product/Variant/SKU have immutable identifiers, unique namespace and versioned attributes. | None |
| PLAN-DEC-040 | P1 | M03 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Same-tenant master/local references versioned; cross-tenant only copy/import with provenance. | None |
| PLAN-DEC-041 | P1 | M03 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Listing controls visibility; Offer controls eligibility/economic conditions; separate publication versions. | None |
| PLAN-DEC-042 | P0 | M03 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Money exact minor units/decimal and currency scale; deterministic line/tax rounding; no floating point. | None |
| PLAN-DEC-043 | P1 | M03 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Immutable accepted Quote with effective Offer/pricing/tax/policy snapshots; new quote on reprice. | None |
| PLAN-DEC-044 | P2 | M03 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | T1 tax adapter clearly labelled demo-only, replaceable with jurisdictional tax port. | None |
| PLAN-DEC-045 | P0 | M04 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Buyer catalog→cart→Quote→Order→protected stock→hosted test checkout→delivery claim; pending/unknown UX honest. | None |
| PLAN-DEC-046 | P1 | M04 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Least-privileged admin/store support pages, statuses and evidence without secret leakage. | None |
| PLAN-DEC-047 | P1 | M04 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Named incident owner, safe queue, escalation and financial reconciliation runbook. | D-05-OPS |
| PLAN-DEC-048 | P1 | M04 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Buyer pending/unknown reflects investigation; no promise of no charge or resend. | AUD-P0-03 |
| PLAN-DEC-049 | P1 | M04 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Authorized support read/evidence and exclusive refund/delivery decision; no manual DB mutation. | AUD-P0-04 |
| PLAN-DEC-050 | P2 | M04 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Notifications optional, redacted metadata only; no license plaintext in email/push. | None |
| PLAN-DEC-051 | P1 | M05 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Kafka M05 only when outbox/inbox semantics and throughput need it; no early broker dependency. | None |
| PLAN-DEC-052 | P1 | M05 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Versioned topic by bounded context/aggregate; stable partition key, tenant-scoped payload. | None |
| PLAN-DEC-053 | P1 | M05 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | DLQ/quarantine with controlled replay by immutable ID, authorization and collision prevention. | None |
| PLAN-DEC-054 | P2 | M05 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Versioned event schemas and compatibility tests, additive changes first. | None |
| PLAN-DEC-055 | P1 | M06 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Public npm exports only explicit stable ports/types; private domain remains inaccessible. | None |
| PLAN-DEC-056 | P1 | M06 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Standalone install path via packages and env adapters, no mandatory CommerceCloud dependency. | None |
| PLAN-DEC-057 | P1 | M06 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Second independent sample consumer required to verify framework independence. | None |
| PLAN-DEC-058 | P1 | M06 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Extension ports capability- and tenant-scoped, deny direct finance or key secret bypass. | None |
| PLAN-DEC-059 | P2 | M06 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | SDK semver, generated contract tests and deprecation policy after actual consumer evidence. | None |
| PLAN-DEC-060 | P1 | M07 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | M07 extract one low-coupling context at a time with traced consumer contract ownership. | None |
| PLAN-DEC-061 | P0 | M07 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Expand-migrate-contract ownership transfer with exactly one authoritative writer at every phase. | None |
| PLAN-DEC-062 | P0 | M07 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Preserve invariant tests and Inbox/Outbox semantics through process boundary changes. | AUD-P0-01, AUD-P0-03 |
| PLAN-DEC-063 | P1 | M08 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | M01 local k3d/K3s single host initially; multi-node/HA later, no false HA assertion. | None |
| PLAN-DEC-064 | P1 | M08 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Host dev-only ingress; production TLS/Cloudflare and edge policy separate M08 review. | None |
| PLAN-DEC-065 | P1 | M08 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Helm initial local manifests recommended, GitOps and Terraform M08 only if needed. | None |
| PLAN-DEC-066 | P0 | M08 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Mongo local single replica set PVC+restore drills; production HA/backup design independently. | None |
| PLAN-DEC-067 | P1 | M08 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Confirm effective CNI NetworkPolicy support before claiming isolation; fail-closed tests. | None |
| PLAN-DEC-068 | P2 | M08 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Local free environment with explicit cleanup; no paid cloud implicit. | None |
| PLAN-DEC-069 | P1 | M09 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | SLO candidates for commerce latency, correctness, stuck UNKNOWN; targets based on measured data. | None |
| PLAN-DEC-070 | P1 | M09 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Structured trace IDs and safe redaction of PII, payment details and licenses. | None |
| PLAN-DEC-071 | P0 | M09 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Failure injection with actual DB/provider/worker and restore evidence for G5 before safety claims. | None |
| PLAN-DEC-072 | P0 | M09 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | Tenant isolation, BOLA, secret leak, CSRF, replay, dependency and supply-chain qualification. | None |
| PLAN-DEC-073 | P0 | M09 | PROPOSED_PLANNING_ONLY_NOT_RATIFIED | No live-money by default; future legal/compliance, dispute, operator and explicit owner authorization gate. | None |

## Reconciliation method and explicit deferrals

1. **G3 before corresponding code:** first ratify/explicitly defer contracts needed by the enabled milestone. A candidate from M07/M09 does not block an empty M01 workspace by physical dependency, but the owner may impose a cross-project design-first review.
2. **Exact audit and payment state:** AUD-P0-01..04 remain OPEN/BLOCKING for real Stripe/Mongo/worker fault proof; selected design does not close them. D-05-MONGO is proposed physical specification until approved; owner-local transaction tests require real driver.
3. **Deferral is explicit, never omission:** Connect fund routing, multiple retries/35m defaults, Stripe Link/wallets, physical goods, Kafka, public npm license, multi-node HA, real-money release require a new scoped ADR when activated.
4. **Reconcile overlaps:** existing planning review identified 14 overlaps (seven refinements, seven independent subordinate specifications); preserve the relationships instead of inventing a new canonical ID or silently merging unlike responsibilities.
5. **Complete acceptance:** cross-validate 181 historical rows, 91 scoped decision entries and 140 M04 capability dispositions; compare each of 110 reconstructed oracles to source artifacts. This is **pending actual human/source-by-source review**, not declared completed by generating this table.
6. **Human approval:** for each milestone, convert recommendation to approved decision only after acceptance by @sergio-tr at exact ID granularity. Separate design status from verification evidence and operational incident reports.

## Design quality boundaries

Avoid universal FSMs, shared Mongo writes between contexts, client-provided TenantContext, business effects from stale projections, key reuse after exposure, blind Stripe replays, false `UNKNOWN = FAILED`, arbitrary 35-minute promises, unscoped method inclusion, and forced latest toolchain upgrades. The high-value invariant boundaries are durable, while providers, frontend, infrastructure, distribution and schemas remain explicitly versionable.

**The gate is not yet passed by the creation of this matrix.** G4 and G5 remain separate; the initial M01 implementation stays on hold pending owner review.
