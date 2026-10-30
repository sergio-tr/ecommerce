> **2026-10-30 oracle development:** Original 110 indexed Spanish source-table scenarios and oracles were matched by exact IDs; all 110 English placeholder expected outcomes have been replaced by **draft observable acceptance oracles** in both TEST_CATALOG.json and TEST_CATALOG.md. See [110-row bilingual crosswalk](../../05-tests/M00_G3_ORIGINAL_SOURCE_ORACLE_CROSSWALK.md). This is meaningful specification progress, **not** an owner-certified translation or executed G5. Remaining semantic final review and original-byte hash revalidation are explicitly unresolved.

# M00-G3 — Architecture recommendation review and verification ledger

**Review date:** 2026-10-30. **Reviewed baseline:** `main` `8140b1101d50757438b37973476dad4e14c43762`; changes in `feature/ser-135-design-first-g3-gate` / draft PR #28. **Reviewer:** design-analysis proposal under owner @sergio-tr; **not owner sign-off**. **Design review status:** PROPOSAL COVERAGE COMPLETE, **OWNER ACCEPTANCE AND EVIDENCE GATES PENDING**.

## Review method, records and exact checks

| Check | Observed result | Interpretation |
|---|---|---|
| Original GitHub issues #1–#13 | All 13 inspected and each appended with tailored candidate design | Existing issues remain canonical, do not claim their checkbox exit criteria passed |
| Linear SER-118–SER-130 | All 13 descriptions linked to corresponding existing GitHub issue/review | Original issue states preserved; tracking not proof |
| Planning register enumeration | **103 unique** IDs, no duplicate | 13 audits + 17 named canonical planning topics + 73 provisional PLAN-DEC |
| Proposed planning matrix | **103 unique** IDs, no missing or unexpected against original inventory | Exhaustive initial recommendation coverage, not exhaustive test/ADR ratification |
| Decision register | 91 `records` at observed read; original historical count 181 | Neither source decisions nor acceptance state edited in this PR |
| M04 capability planning scope | source states 85 Included / 43 Excluded / 12 Deferred, total 140 | Reused approved scope direction; no change to class |
| Bootstrap current checks | DR07 PARTIAL; DR08 PASS user-reported; DR09 identity/base observed; DR10 NOT_AUTHORIZED | M01 code blocked by G3 owner review and task-specific G4 |
| P0 audit physical proof | all four OPEN/BLOCKING, 148 original experiments TEST_PLANNED / NOT_RUN | No Stripe/Mongo/worker experiments claimed |
| Source/oracle semantic fidelity | 110 reconstructed test-oracle comparisons **not performed** in this PR | Source-level acceptance **not yet completed**, explicitly track as AUD-P2-03 |
| Human sign-off | no new exact-ID owner acceptance recorded by generating these files | Recommendation is reversible and provisional |

The 103-item completeness check compared the existing `docs/planning/wave1/DECISION_BACKLOG.md` identifier set to `M00_G3_PLANNING_RECOMMENDATIONS.md`; neither set contained a duplicate and neither had missing/unexpected IDs. This checks ID coverage, **not** whether each recommendation satisfies its original issue's complete acceptance checklist.

## Source consistency and hierarchy

1. **Existing accepted principles preserved:** D-01..D-07, ownership of Order vs CheckoutProcess vs Payments and AUD-P1-02 accepted ownership policies. No additional global saga aggregate or universal status can be inferred from the candidate design.
2. **Known candidate states preserved:** `D-01-SM PROPOSED—SELECTED`; `AUD-P1-02-FSM-MIN PENDING`; `D-05-MONGO PENDING`; `AUD-P1-03 option D policy ACCEPTED / exact deadlines and protocol PENDING`; `AUD-P0-01..04 OPEN/BLOCKING`. Some historical documents retain older statements; latest specific dated approval/decision record prevails, without editing source provenance.
3. **Source precedence:** ratified exact-ID ADR / decision register > proposed design pack > issues/Linear execution state > Slack status handoff > read projections. Contradictions must be recorded, not silently overwritten.
4. **Separate evidence:** documentation can demonstrate logical consistency and selected contracts; only real provider/driver/worker trials can verify external behavior. No financial safety release from a checkbox or a merged PR.
5. **Evolvability and non-mandatory future complexity:** one merchant, one hosted Session and one OrderLine are first-slice exposure limits; contracts admit later multistore Connect, alternative providers, retry policies, multi-line, physical fulfillment, Kafka and independent consumers, after scoped G3 and G4.

## Trade-off review

| Alternative set | Starting recommendation | Rejected or deferred | Why / revision trigger |
|---|---|---|---|
| Financial release | Conservative possible-send ledger + evidence-scoped release permit | TTL / worker lease as proof | Cannot retroactively revoke delayed Stripe HTTP; revisit when provider guarantees demonstrably permit stronger conclusion |
| Session recovery | Provider-scoped positive evidence or protected incident | Negative search as no-charge proof, infinite idempotency replay | Provider search and idempotency scope uncertain; revise with tested provider/API capabilities |
| Persistence | Mongo owner-local transactions+CAS, durable Inbox/Outbox | shared cross-context writer / pretend Stripe atomicity | Separation and crash recovery; adapt physical DB through owner ports |
| Capacity | StockPool+Reservation with atomic conservation, no key reuse | eventually-consistent oversell-prone decrement | Last-unit, quota, disclosure correctness; single-doc optimization possible |
| Authorization | strict trusted TenantContext and actor-resource-action checks | client tenant header or frontend guard as authority | cross-tenant/security; IdP replaceable |
| Commercial status | owner-local Order and coordinator semantics | universal CheckoutStatus aggregate | preserve accepted authority and avoid duplicated financial truth |
| Stripe methods | test merchant, card/3DS, effective provider method enforcement | auto-enabled wallet/Link/Connect in MVP | launch scope and provider effective account configuration must be tested |
| API/integration | versioned ports, owner Inbox/Outbox | Kafka as essential initial durability layer | M05 extraction on throughput/replay evidence |
| Deployment | local K3s/k3d later in M01 | HA/paid cloud required for initial empty app | local learning; real HA only in M08 |
| Toolchain | project-local mise Node24/pnpm11, preserve host tools | global Node/pnpm upgrade now | isolated frozen install already worked; prevent affecting unrelated repos |

## Provider and platform documentation reviewed

- [Stripe API v1 idempotent requests](https://docs.stripe.com/api/idempotent_requests): first execution can save `500`, parameter mismatch matters, keys can be purged after 24h; retry must not be assumed a perpetual negative-effect proof. API v2 semantics differ: adapter must bind exact API version, not generalize behavior.
- [Stripe Checkout create Session](https://docs.stripe.com/api/checkout/sessions/create): provider-returned `expires_at`, account-effective methods; current reference includes `allowed_payment_method_types` filter. Exact method enforcement is subject to the configured API version and account; validate live behavior only in test mode.
- [MongoDB transactions](https://www.mongodb.com/docs/manual/core/transactions/) and [write concern](https://www.mongodb.com/docs/manual/reference/write-concern/): use owner-local transaction-level write concern, not per-operation inside transaction; majority in one member doesn't imply multi-node availability.
- [pnpm 11 release notes](https://pnpm.io/blog/releases/11.0): package build-script allowlist `allowBuilds` replaces older configuration; no global toolchain upgrade necessary.

## Unresolved semantic/design decisions requiring exact-ID review

- Ratify or adjust the physical `D-05-MONGO` transaction/index/unknown-commit contract, actual chosen server+driver versions and single-member limitations.
- Ratify specific Reservation phases, shared quota accounting, source-to-license conservation and physical assignment/disclosure frontier at `M00.2`.
- Ratify concrete Order/CheckoutProcess transitions and intercontext contracts without creating duplicate authority.
- Pin payment method enforcement, capture semantics, refunds and incident/operator decisions against test Stripe account/API version. One-attempt initial M04 may be selected without requiring proof of a second attempt.
- Define and approve M00.3 actor/resource/action matrix and M00.4 command/event schema/error/version contract per enabled workflow.
- Resolve initial published-milestone dependencies: which of 73 provisional future topics are explicitly deferred with scope, not globally declared accepted; publication/license/Connect/live-money stay separate decisions.
- Reconcile 110 original test oracle semantics and historical R1 source clauses; this is a **real pending source review**, not a drafted table proxy.
- Human decision on [G3 design gate #27](https://github.com/sergio-tr/ecommerce/issues/27), then **separate G4** for M01 if conditions met. Final gate remains NOT_PASSED.

**No direct edit to main, no CI/implementation code, no commercial external effects, no approval or G5 verification inferred.**
