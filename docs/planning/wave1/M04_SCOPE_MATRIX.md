# M04 Capability Scope — 2026-10-30 Approved Direction

**User approved the previously recommended scope options.** All 140 provisional CAP identifiers now have an M04 delivery disposition: **85 INCLUDED, 43 EXCLUDED, 12 DEFERRED**. This classification is not proof of source fidelity, ratified technical implementation, test results or production readiness. Historical framework requirements remain in the M00–M09 roadmap even when excluded from initial M04.

**Accepted direction sources:** [B01 ratification](B01_RATIFICATION_RECORD.md), [consolidated decisions](RECOMMENDED_DECISIONS_APPROVAL.md), [remaining evidence](REMAINING_WORK_REGISTER.md). Original D-*/AUD-* and R0.x approvals retain independent statuses. Source links in the 140-row catalog were historically subsystem-level; all have not undergone clause-level reconciliation.

| Capability | Meaning | M04 scope | Current source maturity | Exact qualification / missing specification |
|---|---|---|---|---|
| CAP-CAT-001 | Product and Variant identity | INCLUDED | SELECTED_HISTORICAL | Aggregate boundaries and lifecycle |
| CAP-CAT-002 | SKU uniqueness by namespace | INCLUDED | SELECTED_HISTORICAL | Unique indexes and tenancy |
| CAP-CAT-003 | Shared master catalog | EXCLUDED | ACCEPTED_FOUNDATION | Master catalog is product foundation, but full multi-store capabilities not implied in first slice |
| CAP-CAT-004 | Store-local catalog | INCLUDED | ACCEPTED_FOUNDATION | Store-local catalog model required for framework, first-slice full override scope unratified |
| CAP-CAT-005 | Typed attribute schema | EXCLUDED | SELECTED_HISTORICAL | Version/migration and validation |
| CAP-CAT-006 | Field inheritance and overrides | EXCLUDED | SELECTED_HISTORICAL | Update conflict resolution |
| CAP-CAT-007 | Categories, search and filtering | EXCLUDED | PROPOSED_SCOPE | Discovery/query contracts |
| CAP-CAT-008 | Localization and product assets | EXCLUDED | PROPOSED_SCOPE | Media, locale and licensing |
| CAP-CAT-009 | Bulk product import | EXCLUDED | PROPOSED_SCOPE | Batch errors, idempotency and permissions |
| CAP-MER-001 | Listing visibility and publication | INCLUDED | SELECTED_HISTORICAL | State and channel rules |
| CAP-MER-002 | Offer and sale conditions | INCLUDED | SELECTED_HISTORICAL | Currency/date/version constraints |
| CAP-MER-003 | Channel-based publication | EXCLUDED | SELECTED_HISTORICAL | Storefront/channel projection |
| CAP-MER-004 | Advanced discounts and promotions | DEFERRED | EXPLICIT_DEFERRED | Outside initial MVP |
| CAP-PRC-001 | Exact money arithmetic | INCLUDED | SELECTED_HISTORICAL | Currency rounding and minor units |
| CAP-PRC-002 | Quote evaluation | INCLUDED | SELECTED_HISTORICAL | Effective Offer/tax policy |
| CAP-PRC-003 | Immutable accepted economic snapshot | INCLUDED | ACCEPTED_POLICY | Identity, version and repricing |
| CAP-PRC-004 | Demonstration tax adapter | INCLUDED | SELECTED_HISTORICAL | T1 selected: demonstration-only tax port/adapter with explicit quote tax fields and no real-tax-compliance claim |
| CAP-PRC-005 | Production taxation | DEFERRED | EXPLICIT_DEFERRED | Legal/fiscal readiness separate |
| CAP-PRC-006 | Cross-currency pricing | EXCLUDED | PROPOSED_SCOPE | FX rules not approved |
| CAP-CART-001 | Persistent guest cart | INCLUDED | ACCEPTED_FOUNDATION | Token authorization and durable storage |
| CAP-CART-002 | Authenticated cart | EXCLUDED | SELECTED_HISTORICAL | Actor scope and edits |
| CAP-CART-003 | Cart line validation | INCLUDED | SELECTED_HISTORICAL | Store boundary and quantity changes |
| CAP-CART-004 | Guest/account cart merging | EXCLUDED | PROPOSED_SCOPE | Cross-device merge policy |
| CAP-CART-005 | Cart-to-checkout acceptance | INCLUDED | ACCEPTED_POLICY | Snapshot and idempotency |
| CAP-ORD-001 | Durable Order identity | INCLUDED | ACCEPTED_POLICY | Create before charge |
| CAP-ORD-002 | Commercial obligation lifecycle | INCLUDED | ACCEPTED_POLICY | Capture vs obligation and resolution |
| CAP-ORD-003 | CheckoutProcess recoverable saga | INCLUDED | ACCEPTED_POLICY | State/guards/mandatory continuation |
| CAP-ORD-004 | Financial fact incorporation | INCLUDED | ACCEPTED_POLICY | Outbox/Inbox and semantic dedup |
| CAP-ORD-005 | Authorized commercial cancellation | INCLUDED | ACCEPTED_POLICY | Request vs settlement vs closure |
| CAP-ORD-006 | Exclusive fulfillment/refund resolution | INCLUDED | ACCEPTED_POLICY | Quiescence before branch switch |
| CAP-ORD-007 | Customer order read model | INCLUDED | SELECTED_HISTORICAL | Projection staleness and access |
| CAP-ORD-008 | Exceptional commercial repair | INCLUDED | ACCEPTED_POLICY | Evidence escalation and operator controls |
| CAP-ORD-009 | Order history and reconciliation | INCLUDED | SELECTED_HISTORICAL | Preserve durable Order financial history and reconciliation evidence; broad buyer history UI excluded |
| CAP-INV-001 | StockPool capacity | INCLUDED | ACCEPTED_POLICY | Final-unit conservation |
| CAP-INV-002 | Reservation initial hold | INCLUDED | ACCEPTED_POLICY | 15m eligibility, no unsafe release |
| CAP-INV-003 | Financially protected reservation | INCLUDED | ACCEPTED_POLICY | Protect before Stripe |
| CAP-INV-004 | Versioned commit/release | INCLUDED | ACCEPTED_POLICY | Financial permit and old command rejection |
| CAP-INV-005 | Shared pools and store quotas | EXCLUDED | SELECTED_HISTORICAL | Cross-store shared quotas excluded from initial one-store delivery, capacity conservation remains mandatory |
| CAP-INV-006 | Multi-line capacity all-or-nothing | INCLUDED | ACCEPTED_FOUNDATION | No normal partial purchase |
| CAP-INV-007 | Inventory administrative adjustment | EXCLUDED | PROPOSED_SCOPE | Exclude general-purpose stock adjustment UI; safe quarantine and authorized capacity repair still required |
| CAP-INV-008 | Post-commit capacity correction | EXCLUDED | PROPOSED_SCOPE | No automatic refund-driven reopen |
| CAP-PAY-001 | Provider-neutral finance contracts | INCLUDED | ACCEPTED_POLICY | No Stripe domain coupling |
| CAP-PAY-002 | Financial admission barrier | INCLUDED | ACCEPTED_POLICY | Old dispatch quiescence blocked |
| CAP-PAY-003 | Pre-POST durable operation record | INCLUDED | ACCEPTED_POLICY | Stable idempotency/account/version |
| CAP-PAY-004 | Stripe hosted cards and 3DS | INCLUDED | ACCEPTED_POLICY | Actual provider settings |
| CAP-PAY-005 | Capture/settlement proof | INCLUDED | PENDING_DETAIL | requires_capture not captured |
| CAP-PAY-006 | Verified webhook Inbox | INCLUDED | ACCEPTED_POLICY | Durable evidence before 2xx |
| CAP-PAY-007 | Unknown Session without ID reconciliation | INCLUDED | ACCEPTED_POLICY | Positive proof/provider limitations |
| CAP-PAY-008 | Refund financial execution | INCLUDED | ACCEPTED_POLICY | Unknown/pending/succeeded distinction |
| CAP-PAY-009 | Sequential commercial PaymentAttempts | INCLUDED | ACCEPTED_POLICY | Negative safe predecessor closure |
| CAP-PAY-010 | Stripe Connect charge architecture | INCLUDED | PENDING_DETAIL | Direct/destination/other selection |
| CAP-PAY-011 | Session successor/recovery control | INCLUDED | PENDING_DETAIL | after_expiration.recovery limits |
| CAP-PAY-012 | Wallets and Stripe Link | EXCLUDED | DEFERRED_OR_PENDING | COMPOSITE wallets DEFERRED; Stripe Link PENDING; cannot share one exact decision status |
| CAP-PAY-013 | Delayed instruments | DEFERRED | EXPLICIT_DEFERRED | No first-vertical asynchronous methods |
| CAP-PAY-014 | Partial refunds/disputes | DEFERRED | EXPLICIT_DEFERRED | Separate legal/support policies |
| CAP-FUL-001 | DigitalLicense catalog/import | INCLUDED | ACCEPTED_FOUNDATION | Unique valid key identity |
| CAP-FUL-002 | Encrypted license storage | INCLUDED | SELECTED_HISTORICAL | Key rotation and audit |
| CAP-FUL-003 | Exclusive key allocation by order line | INCLUDED | ACCEPTED_FOUNDATION | Concurrency and crash idempotency |
| CAP-FUL-004 | Multi-line preparation before exposure | INCLUDED | ACCEPTED_POLICY | No atomic exposure claim |
| CAP-FUL-005 | Buyer-authorized secure key reveal | INCLUDED | ACCEPTED_POLICY | Potential disclosure boundary |
| CAP-FUL-006 | Delivery evidence tracking | INCLUDED | ACCEPTED_POLICY | HTTP reply loss not non-delivery |
| CAP-FUL-007 | Fulfillment repair and incident | INCLUDED | ACCEPTED_POLICY | No incompatible refund |
| CAP-FUL-008 | External redemption validation | EXCLUDED | PROPOSED_SCOPE | Not ratified for initial slice |
| CAP-FUL-009 | Physical fulfillment logistics | DEFERRED | EXPLICIT_DEFERRED | Future adapter only |
| CAP-SEC-001 | B2B/B2C identity separation | EXCLUDED | SELECTED_HISTORICAL | Trusted actor/store model mandatory, exact B2B/B2C realm deployment not decided; Exclude physical full dual-realm rollout only; actor/security separation mandatory |
| CAP-SEC-002 | OIDC and BFF sessions | INCLUDED | SELECTED_HISTORICAL | Guest session is required, physical Keycloak/BFF plan remains unratified; Include secure guest sessions and privileged operator authentication; precise OIDC/BFF implementation remains pending M00.3 |
| CAP-SEC-003 | Tenant membership lifecycle | EXCLUDED | ACCEPTED_FOUNDATION | Exclude self-service multiuser tenant membership lifecycle; trusted scoped roles mandatory |
| CAP-SEC-004 | RBAC/ABAC enforcement | INCLUDED | SELECTED_HISTORICAL | Actor/action/resource matrix |
| CAP-SEC-005 | Secure guest checkout | INCLUDED | ACCEPTED_FOUNDATION | Token scope and integrity |
| CAP-SEC-006 | One-time guest Order claim | INCLUDED | SELECTED_HISTORICAL | Replay expiry verification |
| CAP-SEC-007 | Guest cancellation authorization | INCLUDED | PENDING_DETAIL | D-07-AUTH unresolved |
| CAP-SEC-008 | Trusted TenantContext propagation | INCLUDED | ACCEPTED_FOUNDATION | Prevent forged scope |
| CAP-SEC-009 | License secret access control | INCLUDED | SELECTED_HISTORICAL | Encryption and operator access |
| CAP-SEC-010 | Privileged support elevation | EXCLUDED | SELECTED_HISTORICAL | Time-scoped investigation |
| CAP-SEC-011 | MFA/recovery | INCLUDED | SELECTED_HISTORICAL | Require strong operator authentication and MFA as security direction; exact identity provider and recovery tests pending |
| CAP-SEC-012 | Negative cross-tenant auth tests | INCLUDED | SELECTED_HISTORICAL | BOLA/BFLA and account mixup |
| CAP-CLOUD-001 | Tenant lifecycle and provisioning | EXCLUDED | ACCEPTED_FOUNDATION | Single-store tenant isolation accepted; full self-service provisioning not required automatically; Exclude full self-service tenant provisioning; durable scoped Store identity required |
| CAP-CLOUD-002 | Brand and Store configuration | INCLUDED | ACCEPTED_FOUNDATION | Lifecycle/versions |
| CAP-CLOUD-003 | Storefront and Channel configuration | EXCLUDED | SELECTED_HISTORICAL | Boundary to Store |
| CAP-CLOUD-004 | Invitation/membership administration | EXCLUDED | SELECTED_HISTORICAL | Exclude invitations/membership administration UI; operator authorization mandatory |
| CAP-CLOUD-005 | Control Plane management UI | EXCLUDED | PROPOSED_SCOPE | Screens and actors not ratified |
| CAP-CLOUD-006 | Payment provider per-store configuration | INCLUDED | PENDING_DETAIL | Actual Stripe account topology |
| CAP-CLOUD-007 | Policy version propagation | INCLUDED | PENDING_DETAIL | Preserve active checkout parameters |
| CAP-CLOUD-008 | Independent control-plane storage | INCLUDED | SELECTED_HISTORICAL | Require CommerceCloud/CommerceCore public configuration boundary and independent data authority; initial physical deployment still pending |
| CAP-CLOUD-009 | SaaS subscription billing | DEFERRED | EXPLICIT_DEFERRED | Outside first vertical |
| CAP-CLOUD-010 | Dedicated tenant deployment tiers | EXCLUDED | SELECTED_HISTORICAL | Later tenant isolation mode |
| CAP-EGAME-001 | Published product browsing | INCLUDED | ACCEPTED_FOUNDATION | Catalog query and Store scope |
| CAP-EGAME-002 | Product/price display | INCLUDED | SELECTED_HISTORICAL | Accurate Offer/quote presentation |
| CAP-EGAME-003 | Secure guest cart journey | INCLUDED | ACCEPTED_FOUNDATION | Persistence and recovery |
| CAP-EGAME-004 | Hosted Checkout redirect | INCLUDED | ACCEPTED_POLICY | No browser financial authority |
| CAP-EGAME-005 | Pending payment state UX | INCLUDED | ACCEPTED_POLICY | Uncertainty shown accurately |
| CAP-EGAME-006 | Explicit authorized cancellation UI | INCLUDED | ACCEPTED_POLICY | Only request until verified closure |
| CAP-EGAME-007 | Order status/history | INCLUDED | SELECTED_HISTORICAL | COMPOSITE minimum order-status presentation included through CAP-EGAME-005; full history scope unresolved; Require authorized current-order status and claim; cross-order history screen excluded |
| CAP-EGAME-008 | License reveal page | INCLUDED | ACCEPTED_FOUNDATION | No key in email |
| CAP-EGAME-009 | Localization/accessibility/theming | INCLUDED | PROPOSED_SCOPE | COMPOSITE accessibility requirements and optional localization/theming require distinct review; Require accessible core purchase, cancel, claim and key reveal; optional i18n and theming excluded; acceptance standard candidate needs verification |
| CAP-EGAME-010 | Buyer support/disputes portal | EXCLUDED | PROPOSED_SCOPE | Future scope |
| CAP-ADMIN-001 | Tenant/platform administration | EXCLUDED | SELECTED_HISTORICAL | Exclude complete platform admin UI; minimum privileged investigation commands retained |
| CAP-ADMIN-002 | Store catalog editor | EXCLUDED | SELECTED_HISTORICAL | Exclude general catalog editor; controlled, auditable test Store product setup retained |
| CAP-ADMIN-003 | License inventory import | INCLUDED | SELECTED_HISTORICAL | Dedup encryption and audit |
| CAP-ADMIN-004 | Order/support lookup | INCLUDED | SELECTED_HISTORICAL | Minimal authorized incident lookup only; not the full support dashboard |
| CAP-ADMIN-005 | Refund initiation authority | INCLUDED | ACCEPTED_POLICY | Separate commercial approval and payment |
| CAP-ADMIN-006 | Unknown charge incident investigation | INCLUDED | ACCEPTED_POLICY | Escalation and evidence |
| CAP-ADMIN-007 | Inventory correction | EXCLUDED | PROPOSED_SCOPE | Exclude general stock correction dashboard; protected-capacity evidence and incident quarantine retained |
| CAP-ADMIN-008 | Audit log and privileged review | INCLUDED | SELECTED_HISTORICAL | Require durable attributable privileged activity trail and restricted incident read; rich audit dashboard excluded |
| CAP-ADMIN-009 | Financial dashboards | EXCLUDED | PROPOSED_SCOPE | Not a source of truth |
| CAP-NOTIF-001 | Purchase confirmation | DEFERRED | SELECTED_HISTORICAL | Purchase confirmation email optional; authorized buyer status is mandatory |
| CAP-NOTIF-002 | Fulfillment-ready notification | DEFERRED | SELECTED_HISTORICAL | License-ready email optional; license keys must not be sent in email |
| CAP-NOTIF-003 | Template/retry/provider handling | DEFERRED | PROPOSED_SCOPE | Notification provider/templates/retry optional; financial D-05 Outbox remains mandatory |
| CAP-ENG-001 | Monorepo and import boundaries | INCLUDED | SELECTED_HISTORICAL | Nx/pnpm and DDD independence |
| CAP-ENG-002 | OpenAPI/JSON Schema contracts | INCLUDED | SELECTED_HISTORICAL | Compatibility and schema governance |
| CAP-ENG-003 | CI and PR branch gates | INCLUDED | SELECTED_HISTORICAL | English and Conventional Commits |
| CAP-ENG-004 | Unit/integration/E2E tooling | INCLUDED | SELECTED_HISTORICAL | Real reproducible suites |
| CAP-ENG-005 | Mongo durable authority | INCLUDED | PENDING_DETAIL | D-05-MONGO guarantees |
| CAP-ENG-006 | Durable Inbox/Outbox workers | INCLUDED | ACCEPTED_POLICY | No global exactly-once claim |
| CAP-ENG-007 | Optional Redis | EXCLUDED | SELECTED_HISTORICAL | Never financial authority |
| CAP-ENG-008 | Kafka transport | EXCLUDED | SELECTED_HISTORICAL | M05 not M04 prerequisite |
| CAP-ENG-009 | Domain service extraction | EXCLUDED | SELECTED_HISTORICAL | M07 single-writer cutover |
| CAP-ENG-010 | Local Compose runtime | INCLUDED | SELECTED_HISTORICAL | Pinned tool versions |
| CAP-ENG-011 | Kubernetes/Helm/Terraform/Argo CD | EXCLUDED | SELECTED_HISTORICAL | M08 only |
| CAP-ENG-012 | Backup restore and DR | EXCLUDED | SELECTED_HISTORICAL | Real evidence and RPO/RTO |
| CAP-ENG-013 | Telemetry metrics and logs | EXCLUDED | SELECTED_HISTORICAL | M09, M04 finance alert subset |
| CAP-ENG-014 | Secrets and network policy | INCLUDED | SELECTED_HISTORICAL | No secret exposure |
| CAP-ENG-015 | Environment budget and costs | INCLUDED | SELECTED_HISTORICAL | Require local cost governance and explicit resource spending/teardown authorization; no infra deployed |
| CAP-DIST-001 | Public npm package boundaries | EXCLUDED | SELECTED_HISTORICAL | Versioning and scope naming |
| CAP-DIST-002 | Independent installable CommerceCore | EXCLUDED | ACCEPTED_FOUNDATION | No CommerceCloud dependency |
| CAP-DIST-003 | Generated TypeScript SDK | EXCLUDED | SELECTED_HISTORICAL | Contract compatibility |
| CAP-DIST-004 | Reusable Angular shell/theme | EXCLUDED | SELECTED_HISTORICAL | Extension constraints |
| CAP-DIST-005 | Second real independent consumer | EXCLUDED | ACCEPTED_FOUNDATION | Beyond branded duplicate |
| CAP-DIST-006 | Provider and strategy adapter ports | EXCLUDED | SELECTED_HISTORICAL | No arbitrary tenant code |
| CAP-DIST-007 | Release/deprecation compatibility | INCLUDED | SELECTED_HISTORICAL | Require internal contract versioning and compatibility; public SDK release governance later |
| CAP-DIST-008 | Open-source license choice | DEFERRED | PENDING_DETAIL | Public distribution/licensing activity excluded from M04; Apache-2.0 remains candidate pending explicit license/legal audit |
| CAP-DIST-009 | Physical-product fulfillment | DEFERRED | EXPLICIT_DEFERRED | Ports now, shipping later |
| CAP-DIST-010 | Live payment commercial compliance | DEFERRED | EXPLICIT_DEFERRED | Separate legal/financial approvals |
| CAP-OPS-001 | Unknown finance operation monitoring | INCLUDED | ACCEPTED_POLICY | Durable alerts and responsibility |
| CAP-OPS-002 | Business event projections | EXCLUDED | SELECTED_HISTORICAL | Never economic truth |
| CAP-OPS-003 | SLOs and error budgets | INCLUDED | PENDING_DETAIL | Require minimum event/unknown-state observability, escalation and evidence; numerical SLOs must be derived/tested |
| CAP-OPS-004 | Data privacy/retention | INCLUDED | SELECTED_HISTORICAL | PII and financial evidence policy |
| CAP-OPS-005 | Chaos and partition testing | EXCLUDED | SELECTED_HISTORICAL | Real observation |
| CAP-OPS-006 | Backup/restore proof | EXCLUDED | SELECTED_HISTORICAL | No unsupported HA claims |
| CAP-OPS-007 | Incident runbooks/escalation | INCLUDED | ACCEPTED_POLICY | Unknown charges, keys, refunds |

## Scope categories are not implementation permissions

- INCLUDED: required/approved release capability direction only; G3 guard/contract and G4 per-task authorization still necessary.
- EXCLUDED: omitted from first M04 slice, not removed from historical framework requirements. A secure minimum of the capability may remain mandatory (for example actor roles despite deferring dual realms).
- DEFERRED: future milestone scope such as notifications/public distribution; do not silently switch on provider integrations.
- No previous P0 financial blocker, D-05-MONGO, license reveal quiescence, guest authorization contract or Stripe Connect/Link proof has been completed merely by selecting scope.
