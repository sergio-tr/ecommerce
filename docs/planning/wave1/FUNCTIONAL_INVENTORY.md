# Wave 1 — Functional Capability Inventory

**Status: INVENTORY REVIEWED; M04 functional direction accepted, row-level inclusion still provisional. Owner: @sergio-tr.** **Capabilities cataloged:** 140. **Proposed scope groups:** PRE_M04 34, M04_CANDIDATE 20, POST_M04 25, DEFERRED 8, M04_REQUIRED_DIRECTION 53.

[W1-SCOPE-B01 Option A](B01_RATIFICATION_RECORD.md) subsequently ratified six of the original 29 scope dispositions while CAP-PRC-004 remains open. W1-AP-01 ratified the bounded recoverable first digital-license purchase, **not** all 140 individual capabilities. The authoritative capability-level draft M04 disposition is [M04_SCOPE_MATRIX.md](M04_SCOPE_MATRIX.md): INCLUDED 74, EXCLUDED 35, DEFERRED 8, UNRESOLVED 23. Original broad planningScope values below are retained for history; technical and provenance attributes are detailed in the updated JSON. No implementation authorization exists.

This is a requirement discovery and scope classification, not blanket approval. `M04_REQUIRED_DIRECTION` means necessary for a coherent first checkout according to existing constraints, not a completed specification. `PRE_M04` reflects dependency sequencing, while `M04_CANDIDATE`, `POST_M04` and `DEFERRED` require explicit scope decisions before becoming executable work. `PROPOSED_SCOPE` marks newly identified planning inferences.

## CommerceCore / Catalog

| ID | Capability | Proposed M04 scope | Source maturity | Missing contract / decision |
|---|---|---|---|---|
| CAP-CAT-001 | Product and Variant identity | PRE_M04 | SELECTED_HISTORICAL | Aggregate boundaries and lifecycle |
| CAP-CAT-002 | SKU uniqueness by namespace | PRE_M04 | SELECTED_HISTORICAL | Unique indexes and tenancy |
| CAP-CAT-003 | Shared master catalog | PRE_M04 | ACCEPTED_FOUNDATION | Share policy and ownership |
| CAP-CAT-004 | Store-local catalog | PRE_M04 | ACCEPTED_FOUNDATION | Copy/import and override rules |
| CAP-CAT-005 | Typed attribute schema | PRE_M04 | SELECTED_HISTORICAL | Version/migration and validation |
| CAP-CAT-006 | Field inheritance and overrides | PRE_M04 | SELECTED_HISTORICAL | Update conflict resolution |
| CAP-CAT-007 | Categories, search and filtering | M04_CANDIDATE | PROPOSED_SCOPE | Discovery/query contracts |
| CAP-CAT-008 | Localization and product assets | M04_CANDIDATE | PROPOSED_SCOPE | Media, locale and licensing |
| CAP-CAT-009 | Bulk product import | POST_M04 | PROPOSED_SCOPE | Batch errors, idempotency and permissions |

## CommerceCore / Merchandising

| ID | Capability | Proposed M04 scope | Source maturity | Missing contract / decision |
|---|---|---|---|---|
| CAP-MER-001 | Listing visibility and publication | PRE_M04 | SELECTED_HISTORICAL | State and channel rules |
| CAP-MER-002 | Offer and sale conditions | PRE_M04 | SELECTED_HISTORICAL | Currency/date/version constraints |
| CAP-MER-003 | Channel-based publication | M04_CANDIDATE | SELECTED_HISTORICAL | Storefront/channel projection |
| CAP-MER-004 | Advanced discounts and promotions | DEFERRED | EXPLICIT_DEFERRED | Outside initial MVP |

## CommerceCore / Pricing

| ID | Capability | Proposed M04 scope | Source maturity | Missing contract / decision |
|---|---|---|---|---|
| CAP-PRC-001 | Exact money arithmetic | PRE_M04 | SELECTED_HISTORICAL | Currency rounding and minor units |
| CAP-PRC-002 | Quote evaluation | PRE_M04 | SELECTED_HISTORICAL | Effective Offer/tax policy |
| CAP-PRC-003 | Immutable accepted economic snapshot | M04_REQUIRED_DIRECTION | ACCEPTED_POLICY | Identity, version and repricing |
| CAP-PRC-004 | Demonstration tax adapter | M04_CANDIDATE | SELECTED_HISTORICAL | No real-tax claim |
| CAP-PRC-005 | Production taxation | DEFERRED | EXPLICIT_DEFERRED | Legal/fiscal readiness separate |
| CAP-PRC-006 | Cross-currency pricing | POST_M04 | PROPOSED_SCOPE | FX rules not approved |

## CommerceCore / Cart

| ID | Capability | Proposed M04 scope | Source maturity | Missing contract / decision |
|---|---|---|---|---|
| CAP-CART-001 | Persistent guest cart | M04_REQUIRED_DIRECTION | ACCEPTED_FOUNDATION | Token authorization and durable storage |
| CAP-CART-002 | Authenticated cart | M04_CANDIDATE | SELECTED_HISTORICAL | Actor scope and edits |
| CAP-CART-003 | Cart line validation | M04_REQUIRED_DIRECTION | SELECTED_HISTORICAL | Store boundary and quantity changes |
| CAP-CART-004 | Guest/account cart merging | POST_M04 | PROPOSED_SCOPE | Cross-device merge policy |
| CAP-CART-005 | Cart-to-checkout acceptance | M04_REQUIRED_DIRECTION | ACCEPTED_POLICY | Snapshot and idempotency |

## CommerceCore / Ordering

| ID | Capability | Proposed M04 scope | Source maturity | Missing contract / decision |
|---|---|---|---|---|
| CAP-ORD-001 | Durable Order identity | M04_REQUIRED_DIRECTION | ACCEPTED_POLICY | Create before charge |
| CAP-ORD-002 | Commercial obligation lifecycle | M04_REQUIRED_DIRECTION | ACCEPTED_POLICY | Capture vs obligation and resolution |
| CAP-ORD-003 | CheckoutProcess recoverable saga | M04_REQUIRED_DIRECTION | ACCEPTED_POLICY | State/guards/mandatory continuation |
| CAP-ORD-004 | Financial fact incorporation | M04_REQUIRED_DIRECTION | ACCEPTED_POLICY | Outbox/Inbox and semantic dedup |
| CAP-ORD-005 | Authorized commercial cancellation | M04_REQUIRED_DIRECTION | ACCEPTED_POLICY | Request vs settlement vs closure |
| CAP-ORD-006 | Exclusive fulfillment/refund resolution | M04_REQUIRED_DIRECTION | ACCEPTED_POLICY | Quiescence before branch switch |
| CAP-ORD-007 | Customer order read model | M04_CANDIDATE | SELECTED_HISTORICAL | Projection staleness and access |
| CAP-ORD-008 | Exceptional commercial repair | M04_REQUIRED_DIRECTION | ACCEPTED_POLICY | Evidence escalation and operator controls |
| CAP-ORD-009 | Order history and reconciliation | M04_CANDIDATE | SELECTED_HISTORICAL | Financial fact history preservation |

## CommerceCore / Inventory

| ID | Capability | Proposed M04 scope | Source maturity | Missing contract / decision |
|---|---|---|---|---|
| CAP-INV-001 | StockPool capacity | M04_REQUIRED_DIRECTION | ACCEPTED_POLICY | Final-unit conservation |
| CAP-INV-002 | Reservation initial hold | M04_REQUIRED_DIRECTION | ACCEPTED_POLICY | 15m eligibility, no unsafe release |
| CAP-INV-003 | Financially protected reservation | M04_REQUIRED_DIRECTION | ACCEPTED_POLICY | Protect before Stripe |
| CAP-INV-004 | Versioned commit/release | M04_REQUIRED_DIRECTION | ACCEPTED_POLICY | Financial permit and old command rejection |
| CAP-INV-005 | Shared pools and store quotas | M04_CANDIDATE | SELECTED_HISTORICAL | Pool/Reservation atomicity |
| CAP-INV-006 | Multi-line capacity all-or-nothing | M04_REQUIRED_DIRECTION | ACCEPTED_FOUNDATION | No normal partial purchase |
| CAP-INV-007 | Inventory administrative adjustment | M04_CANDIDATE | PROPOSED_SCOPE | Audit invalid/revoked stock |
| CAP-INV-008 | Post-commit capacity correction | POST_M04 | PROPOSED_SCOPE | No automatic refund-driven reopen |

## CommerceCore / Payments

| ID | Capability | Proposed M04 scope | Source maturity | Missing contract / decision |
|---|---|---|---|---|
| CAP-PAY-001 | Provider-neutral finance contracts | M04_REQUIRED_DIRECTION | ACCEPTED_POLICY | No Stripe domain coupling |
| CAP-PAY-002 | Financial admission barrier | M04_REQUIRED_DIRECTION | ACCEPTED_POLICY | Old dispatch quiescence blocked |
| CAP-PAY-003 | Pre-POST durable operation record | M04_REQUIRED_DIRECTION | ACCEPTED_POLICY | Stable idempotency/account/version |
| CAP-PAY-004 | Stripe hosted cards and 3DS | M04_REQUIRED_DIRECTION | ACCEPTED_POLICY | Actual provider settings |
| CAP-PAY-005 | Capture/settlement proof | M04_REQUIRED_DIRECTION | PENDING_DETAIL | requires_capture not captured |
| CAP-PAY-006 | Verified webhook Inbox | M04_REQUIRED_DIRECTION | ACCEPTED_POLICY | Durable evidence before 2xx |
| CAP-PAY-007 | Unknown Session without ID reconciliation | M04_REQUIRED_DIRECTION | ACCEPTED_POLICY | Positive proof/provider limitations |
| CAP-PAY-008 | Refund financial execution | M04_REQUIRED_DIRECTION | ACCEPTED_POLICY | Unknown/pending/succeeded distinction |
| CAP-PAY-009 | Sequential commercial PaymentAttempts | M04_REQUIRED_DIRECTION | ACCEPTED_POLICY | Negative safe predecessor closure |
| CAP-PAY-010 | Stripe Connect charge architecture | M04_REQUIRED_DIRECTION | PENDING_DETAIL | Direct/destination/other selection |
| CAP-PAY-011 | Session successor/recovery control | M04_REQUIRED_DIRECTION | PENDING_DETAIL | after_expiration.recovery limits |
| CAP-PAY-012 | Wallets and Stripe Link | POST_M04 | DEFERRED_OR_PENDING | Wallets deferred Link pending |
| CAP-PAY-013 | Delayed instruments | DEFERRED | EXPLICIT_DEFERRED | No first-vertical asynchronous methods |
| CAP-PAY-014 | Partial refunds/disputes | DEFERRED | EXPLICIT_DEFERRED | Separate legal/support policies |

## CommerceCore / Fulfillment

| ID | Capability | Proposed M04 scope | Source maturity | Missing contract / decision |
|---|---|---|---|---|
| CAP-FUL-001 | DigitalLicense catalog/import | M04_REQUIRED_DIRECTION | ACCEPTED_FOUNDATION | Unique valid key identity |
| CAP-FUL-002 | Encrypted license storage | M04_REQUIRED_DIRECTION | SELECTED_HISTORICAL | Key rotation and audit |
| CAP-FUL-003 | Exclusive key allocation by order line | M04_REQUIRED_DIRECTION | ACCEPTED_FOUNDATION | Concurrency and crash idempotency |
| CAP-FUL-004 | Multi-line preparation before exposure | M04_REQUIRED_DIRECTION | ACCEPTED_POLICY | No atomic exposure claim |
| CAP-FUL-005 | Buyer-authorized secure key reveal | M04_REQUIRED_DIRECTION | ACCEPTED_POLICY | Potential disclosure boundary |
| CAP-FUL-006 | Delivery evidence tracking | M04_REQUIRED_DIRECTION | ACCEPTED_POLICY | HTTP reply loss not non-delivery |
| CAP-FUL-007 | Fulfillment repair and incident | M04_REQUIRED_DIRECTION | ACCEPTED_POLICY | No incompatible refund |
| CAP-FUL-008 | External redemption validation | POST_M04 | PROPOSED_SCOPE | Not ratified for initial slice |
| CAP-FUL-009 | Physical fulfillment logistics | DEFERRED | EXPLICIT_DEFERRED | Future adapter only |

## Identity and Security

| ID | Capability | Proposed M04 scope | Source maturity | Missing contract / decision |
|---|---|---|---|---|
| CAP-SEC-001 | B2B/B2C identity separation | PRE_M04 | SELECTED_HISTORICAL | Keycloak strategy |
| CAP-SEC-002 | OIDC and BFF sessions | PRE_M04 | SELECTED_HISTORICAL | PKCE cookies CSRF |
| CAP-SEC-003 | Tenant membership lifecycle | PRE_M04 | ACCEPTED_FOUNDATION | Membership and revocation |
| CAP-SEC-004 | RBAC/ABAC enforcement | PRE_M04 | SELECTED_HISTORICAL | Actor/action/resource matrix |
| CAP-SEC-005 | Secure guest checkout | M04_REQUIRED_DIRECTION | ACCEPTED_FOUNDATION | Token scope and integrity |
| CAP-SEC-006 | One-time guest Order claim | M04_REQUIRED_DIRECTION | SELECTED_HISTORICAL | Replay expiry verification |
| CAP-SEC-007 | Guest cancellation authorization | M04_REQUIRED_DIRECTION | PENDING_DETAIL | D-07-AUTH unresolved |
| CAP-SEC-008 | Trusted TenantContext propagation | PRE_M04 | ACCEPTED_FOUNDATION | Prevent forged scope |
| CAP-SEC-009 | License secret access control | M04_REQUIRED_DIRECTION | SELECTED_HISTORICAL | Encryption and operator access |
| CAP-SEC-010 | Privileged support elevation | POST_M04 | SELECTED_HISTORICAL | Time-scoped investigation |
| CAP-SEC-011 | MFA/recovery | PRE_M04 | SELECTED_HISTORICAL | Admin and buyer recovery |
| CAP-SEC-012 | Negative cross-tenant auth tests | PRE_M04 | SELECTED_HISTORICAL | BOLA/BFLA and account mixup |

## CommerceCloud / Control Plane

| ID | Capability | Proposed M04 scope | Source maturity | Missing contract / decision |
|---|---|---|---|---|
| CAP-CLOUD-001 | Tenant lifecycle and provisioning | PRE_M04 | ACCEPTED_FOUNDATION | Create/suspend/teardown rollback |
| CAP-CLOUD-002 | Brand and Store configuration | PRE_M04 | ACCEPTED_FOUNDATION | Lifecycle/versions |
| CAP-CLOUD-003 | Storefront and Channel configuration | M04_CANDIDATE | SELECTED_HISTORICAL | Boundary to Store |
| CAP-CLOUD-004 | Invitation/membership administration | PRE_M04 | SELECTED_HISTORICAL | Access control and syncing |
| CAP-CLOUD-005 | Control Plane management UI | M04_CANDIDATE | PROPOSED_SCOPE | Screens and actors not ratified |
| CAP-CLOUD-006 | Payment provider per-store configuration | M04_REQUIRED_DIRECTION | PENDING_DETAIL | Actual Stripe account topology |
| CAP-CLOUD-007 | Policy version propagation | M04_REQUIRED_DIRECTION | PENDING_DETAIL | Preserve active checkout parameters |
| CAP-CLOUD-008 | Independent control-plane storage | PRE_M04 | SELECTED_HISTORICAL | No cross-context authoritative writes |
| CAP-CLOUD-009 | SaaS subscription billing | DEFERRED | EXPLICIT_DEFERRED | Outside first vertical |
| CAP-CLOUD-010 | Dedicated tenant deployment tiers | POST_M04 | SELECTED_HISTORICAL | Later tenant isolation mode |

## eGame / Buyer storefront

| ID | Capability | Proposed M04 scope | Source maturity | Missing contract / decision |
|---|---|---|---|---|
| CAP-EGAME-001 | Published product browsing | M04_REQUIRED_DIRECTION | ACCEPTED_FOUNDATION | Catalog query and Store scope |
| CAP-EGAME-002 | Product/price display | M04_REQUIRED_DIRECTION | SELECTED_HISTORICAL | Accurate Offer/quote presentation |
| CAP-EGAME-003 | Secure guest cart journey | M04_REQUIRED_DIRECTION | ACCEPTED_FOUNDATION | Persistence and recovery |
| CAP-EGAME-004 | Hosted Checkout redirect | M04_REQUIRED_DIRECTION | ACCEPTED_POLICY | No browser financial authority |
| CAP-EGAME-005 | Pending payment state UX | M04_REQUIRED_DIRECTION | ACCEPTED_POLICY | Uncertainty shown accurately |
| CAP-EGAME-006 | Explicit authorized cancellation UI | M04_REQUIRED_DIRECTION | ACCEPTED_POLICY | Only request until verified closure |
| CAP-EGAME-007 | Order status/history | M04_CANDIDATE | SELECTED_HISTORICAL | Authorized read and staleness |
| CAP-EGAME-008 | License reveal page | M04_REQUIRED_DIRECTION | ACCEPTED_FOUNDATION | No key in email |
| CAP-EGAME-009 | Localization/accessibility/theming | M04_CANDIDATE | PROPOSED_SCOPE | Acceptance criteria missing |
| CAP-EGAME-010 | Buyer support/disputes portal | POST_M04 | PROPOSED_SCOPE | Future scope |

## Store and Platform Administration

| ID | Capability | Proposed M04 scope | Source maturity | Missing contract / decision |
|---|---|---|---|---|
| CAP-ADMIN-001 | Tenant/platform administration | PRE_M04 | SELECTED_HISTORICAL | Provisioning and memberships |
| CAP-ADMIN-002 | Store catalog editor | M04_CANDIDATE | SELECTED_HISTORICAL | Actor rights |
| CAP-ADMIN-003 | License inventory import | M04_REQUIRED_DIRECTION | SELECTED_HISTORICAL | Dedup encryption and audit |
| CAP-ADMIN-004 | Order/support lookup | M04_CANDIDATE | SELECTED_HISTORICAL | Sensitive data and projection |
| CAP-ADMIN-005 | Refund initiation authority | M04_REQUIRED_DIRECTION | ACCEPTED_POLICY | Separate commercial approval and payment |
| CAP-ADMIN-006 | Unknown charge incident investigation | M04_REQUIRED_DIRECTION | ACCEPTED_POLICY | Escalation and evidence |
| CAP-ADMIN-007 | Inventory correction | M04_CANDIDATE | PROPOSED_SCOPE | Safe adjustments |
| CAP-ADMIN-008 | Audit log and privileged review | M04_CANDIDATE | SELECTED_HISTORICAL | Retention and access |
| CAP-ADMIN-009 | Financial dashboards | POST_M04 | PROPOSED_SCOPE | Not a source of truth |

## Notifications

| ID | Capability | Proposed M04 scope | Source maturity | Missing contract / decision |
|---|---|---|---|---|
| CAP-NOTIF-001 | Purchase confirmation | M04_CANDIDATE | SELECTED_HISTORICAL | No license secret in messages |
| CAP-NOTIF-002 | Fulfillment-ready notification | M04_CANDIDATE | SELECTED_HISTORICAL | Secure link only |
| CAP-NOTIF-003 | Template/retry/provider handling | M04_CANDIDATE | PROPOSED_SCOPE | Provider and SLA unselected |

## Engineering / Integration / Infrastructure

| ID | Capability | Proposed M04 scope | Source maturity | Missing contract / decision |
|---|---|---|---|---|
| CAP-ENG-001 | Monorepo and import boundaries | PRE_M04 | SELECTED_HISTORICAL | Nx/pnpm and DDD independence |
| CAP-ENG-002 | OpenAPI/JSON Schema contracts | PRE_M04 | SELECTED_HISTORICAL | Compatibility and schema governance |
| CAP-ENG-003 | CI and PR branch gates | PRE_M04 | SELECTED_HISTORICAL | English and Conventional Commits |
| CAP-ENG-004 | Unit/integration/E2E tooling | PRE_M04 | SELECTED_HISTORICAL | Real reproducible suites |
| CAP-ENG-005 | Mongo durable authority | PRE_M04 | PENDING_DETAIL | D-05-MONGO guarantees |
| CAP-ENG-006 | Durable Inbox/Outbox workers | M04_REQUIRED_DIRECTION | ACCEPTED_POLICY | No global exactly-once claim |
| CAP-ENG-007 | Optional Redis | POST_M04 | SELECTED_HISTORICAL | Never financial authority |
| CAP-ENG-008 | Kafka transport | POST_M04 | SELECTED_HISTORICAL | M05 not M04 prerequisite |
| CAP-ENG-009 | Domain service extraction | POST_M04 | SELECTED_HISTORICAL | M07 single-writer cutover |
| CAP-ENG-010 | Local Compose runtime | PRE_M04 | SELECTED_HISTORICAL | Pinned tool versions |
| CAP-ENG-011 | Kubernetes/Helm/Terraform/Argo CD | POST_M04 | SELECTED_HISTORICAL | M08 only |
| CAP-ENG-012 | Backup restore and DR | POST_M04 | SELECTED_HISTORICAL | Real evidence and RPO/RTO |
| CAP-ENG-013 | Telemetry metrics and logs | POST_M04 | SELECTED_HISTORICAL | M09, M04 finance alert subset |
| CAP-ENG-014 | Secrets and network policy | PRE_M04 | SELECTED_HISTORICAL | No secret exposure |
| CAP-ENG-015 | Environment budget and costs | PRE_M04 | SELECTED_HISTORICAL | No unapproved spending |

## Framework Reuse / Distribution

| ID | Capability | Proposed M04 scope | Source maturity | Missing contract / decision |
|---|---|---|---|---|
| CAP-DIST-001 | Public npm package boundaries | POST_M04 | SELECTED_HISTORICAL | Versioning and scope naming |
| CAP-DIST-002 | Independent installable CommerceCore | POST_M04 | ACCEPTED_FOUNDATION | No CommerceCloud dependency |
| CAP-DIST-003 | Generated TypeScript SDK | POST_M04 | SELECTED_HISTORICAL | Contract compatibility |
| CAP-DIST-004 | Reusable Angular shell/theme | POST_M04 | SELECTED_HISTORICAL | Extension constraints |
| CAP-DIST-005 | Second real independent consumer | POST_M04 | ACCEPTED_FOUNDATION | Beyond branded duplicate |
| CAP-DIST-006 | Provider and strategy adapter ports | POST_M04 | SELECTED_HISTORICAL | No arbitrary tenant code |
| CAP-DIST-007 | Release/deprecation compatibility | PRE_M04 | SELECTED_HISTORICAL | Policy not finalized |
| CAP-DIST-008 | Open-source license choice | PRE_M04 | PENDING_DETAIL | Apache-2.0 only candidate |
| CAP-DIST-009 | Physical-product fulfillment | DEFERRED | EXPLICIT_DEFERRED | Ports now, shipping later |
| CAP-DIST-010 | Live payment commercial compliance | DEFERRED | EXPLICIT_DEFERRED | Separate legal/financial approvals |

## Reliability and Compliance

| ID | Capability | Proposed M04 scope | Source maturity | Missing contract / decision |
|---|---|---|---|---|
| CAP-OPS-001 | Unknown finance operation monitoring | M04_REQUIRED_DIRECTION | ACCEPTED_POLICY | Durable alerts and responsibility |
| CAP-OPS-002 | Business event projections | POST_M04 | SELECTED_HISTORICAL | Never economic truth |
| CAP-OPS-003 | SLOs and error budgets | PRE_M04 | PENDING_DETAIL | Targets and measurement unknown |
| CAP-OPS-004 | Data privacy/retention | PRE_M04 | SELECTED_HISTORICAL | PII and financial evidence policy |
| CAP-OPS-005 | Chaos and partition testing | POST_M04 | SELECTED_HISTORICAL | Real observation |
| CAP-OPS-006 | Backup/restore proof | POST_M04 | SELECTED_HISTORICAL | No unsupported HA claims |
| CAP-OPS-007 | Incident runbooks/escalation | M04_REQUIRED_DIRECTION | ACCEPTED_POLICY | Unknown charges, keys, refunds |

