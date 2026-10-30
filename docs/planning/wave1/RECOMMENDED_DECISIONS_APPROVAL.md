# Recommended Architectural and Scope Decisions — Approval 2026-10-30

**Source:** user instruction to take all previously recommended options. **Owner:** @sergio-tr. **Scope:** architectural directions and M04 scope only; no implementation or experimental verification authorization.

## Final first-slice functional scope

The 140 candidate capabilities now classify as 85 INCLUDED, 43 EXCLUDED and 12 DEFERRED for M04. This release-scope classification does not alter accepted historical framework requirements. Complete eGame test-mode purchase retains Catalog, Pricing, Cart, durable Order/CheckoutProcess, protected Inventory, Stripe financial verification, unique DigitalLicense allocation, authorized reveal, refund/cancel and safe recovery.

| Decision | Accepted recommendation | Explicit outstanding contract |
|---|---|---|
| W1-SCOPE-B01 | Option A, six Catalog/Merchandising scope rows | Full Product/Variant, Listing/Offer and Quote APIs |
| W1-SCOPE-B01-TAX | T1 demonstration tax port and adapter | Tax/rounding schema; never claim production tax correctness |
| W1-SCOPE-B02 | A: scoped actors, secure guests/operators, MFA direction, independent Cloud authority; postpone self-service/realm UI | Guest claim, CSRF, MFA, tenant matrix and physical Cloud contract |
| W1-SCOPE-B03 | A: durable commercial/evidence history, accessible current-order status and minimum authorized operator repair; postpone broad admin UI | Accessibility test standard, privileged repair and audit proof |
| W1-SCOPE-B04 | A: optional purchase/fulfillment emails and provider deferred | Status/key access mandatory; no keys in future email |
| W1-SCOPE-B05 | A: local cost control, internal contract versioning and minimum incident monitoring | Public license not selected; real SLO thresholds pending |
| W1-SCOPE-B06 | A: card/3DS only; wallets deferred, Link not authorized for first slice | D-03-LINK and D-03-CONFIG still need actual provider effective-method evidence |
| M01-FOUNDATION-DIRECTION | A: TypeScript NestJS modular monolith, Nx/pnpm, isolated DDD/hexagonal contexts, Angular reference shell candidate | Compatible exact runtime versions, boundary/test/CI contracts, implementation approval |

## The 23 remaining M04 scope choices now covered

| ID | M04 decision | Essential qualification |
|---|---|---|
| CAP-PRC-004 | INCLUDED | Nonproduction T1 tax adapter |
| CAP-ORD-009 | INCLUDED | Durable economic history, not complete buyer archive |
| CAP-INV-007 | EXCLUDED | No generic stock correction UI; quarantine remains required |
| CAP-SEC-001 | EXCLUDED | Physical dual-realm rollout only; role isolation required |
| CAP-SEC-002 | INCLUDED | Secure guest/privileged sessions, technical mechanism pending |
| CAP-SEC-003 | EXCLUDED | No self-service membership lifecycle |
| CAP-SEC-011 | INCLUDED | Admin MFA direction, provider/recovery contract pending |
| CAP-CLOUD-001 | EXCLUDED | Full SaaS tenant provisioning UI only |
| CAP-CLOUD-004 | EXCLUDED | Invitations and membership administration |
| CAP-CLOUD-008 | INCLUDED | Independent Cloud authority and public contract, physical runtime pending |
| CAP-EGAME-007 | INCLUDED | Authenticated current-order status, not account-wide history |
| CAP-EGAME-009 | INCLUDED | Accessible buyer flows; localization/theme excluded |
| CAP-ADMIN-001 | EXCLUDED | Full Platform admin console; safe incident operations required |
| CAP-ADMIN-002 | EXCLUDED | Rich catalog editor; valid bootstrap required |
| CAP-ADMIN-007 | EXCLUDED | Generic inventory correction console; safe repair remains |
| CAP-ADMIN-008 | INCLUDED | Durable attributable privileged audit, no rich dashboard |
| CAP-NOTIF-001 | DEFERRED | Optional purchase email |
| CAP-NOTIF-002 | DEFERRED | Optional ready-to-reveal email, never key content |
| CAP-NOTIF-003 | DEFERRED | Optional notification providers and retries |
| CAP-ENG-015 | INCLUDED | Environment spending authorization and teardown |
| CAP-DIST-007 | INCLUDED | Internal API/event compatibility |
| CAP-DIST-008 | DEFERRED | Public-license/distribution work: Apache-2.0 only a historical candidate; legal choice not completed |
| CAP-OPS-003 | INCLUDED | Basic UNKNOWN/backlog/incident detection and escalation; SLO thresholds pending |

Composite IDs CAP-PAY-012, CAP-EGAME-007 and CAP-EGAME-009 remain parent planning identities; no new child identifiers or issues created.

## AUD-P1-03: user-selected alternative D

**ACCEPTED policy:** a relative commercial retry request window after *proven negative* prior Attempt, together with absolute global cutoff for **new Attempt admission**. All twelve source invariants remain in force. The clock does not authorize Inventory release, extinguish a previously enabled Stripe POST or negate subsequently confirmed payment.

**ACCEPTED safe retention:** protect capacity while potentially collectible external effects remain unknown; report/incorporate later financial facts.

**PROPOSED — SELECTED protocol:** admission-versus-close fencing, time anchor and durable identity/versioned commands. **PENDING:** durations, D-02-P01 35-minute Session candidate, D-06-P01 two Session candidate, D-06-INTENT, provider proof, Mongo local atomicity and operational escalation. AUD-P1-03 overall remains OPEN. All AUD13 tests remain TEST_PLANNED.

## Unchanged proof and safety gates

AUD-P0-01..04 remain OPEN / BLOCKING. G0 historic clause and test fidelity incomplete; G1 scope categories selected but exact lineage evidence pending; G3 financial/exposure contracts incomplete; G4 implementation authorization separate; G5 real provider and fault evidence not yet executed; G6 live money not authorized.

No approval of an external service API guarantee, global transaction, source-code implementation, deployment, public license or real-money release is implied. All new decisions are scoped user ratifications of preferred directions only.

## PR governance

PR #17 had already merged into the English baseline before this task. PR #18 was closed **without merge** because it duplicated the B01 head but targeted main directly. PR #19 is the source baseline review, and PR #20 contains current ratification/roadmap documentation as a stacked draft; no current PR is merged by this task.
