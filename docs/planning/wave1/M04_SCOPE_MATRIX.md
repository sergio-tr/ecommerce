# Wave 1 — M04 Functional Inclusion/Exclusion Matrix

Decision W1-AP-01: ACCEPTED as a bounded recoverable eGame digital-license purchase **planning direction only**. Technical contracts, exact user interface scope, Stripe/Inventory safety evidence and implementation authorization remain unapproved. All original CAP IDs retained. Per-capability interpretations are a reviewable derivation, not 140 separate user ratifications.

**Dispositions (after W1-SCOPE-B01 Option A approval):** INCLUDED 74; UNRESOLVED 23; EXCLUDED 35; DEFERRED 8. INCLUDED means planned functional behavior, not an implementation-ready specification. EXCLUDED is outside M04 but may be planned later. DEFERRED preserves explicit historical deferral. UNRESOLVED needs separate scope approval. PRE_M04 entries count prerequisite design, not all M04 deliverables.

| Original planning category | Included | Excluded | Deferred | Unresolved |
|---|---:|---:|---:|---:|
| PRE_M04 | 19 | 3 | 0 | 12 |
| M04_CANDIDATE | 2 | 7 | 0 | 11 |
| POST_M04 | 0 | 25 | 0 | 0 |
| DEFERRED | 0 | 0 | 8 | 0 |
| M04_REQUIRED_DIRECTION | 53 | 0 | 0 | 0 |

**New exact scope ratification:** [B01_RATIFICATION_RECORD.md](B01_RATIFICATION_RECORD.md). Six originally unresolved capabilities approved for M04 inclusion/exclusion, and `CAP-PRC-004` tax option remains UNRESOLVED. The original 29-case review is a prior proposal snapshot, not the current ratification ledger.

## All 140 capability-level dispositions

| ID | Capability | M04 disposition | Timing role | Remaining decision / qualification |
|---|---|---|---|---|
| CAP-CAT-001 | Product and Variant identity | INCLUDED | PREREQUISITE_NOT_M04_UI | Aggregate boundaries and lifecycle |
| CAP-CAT-002 | SKU uniqueness by namespace | INCLUDED | PREREQUISITE_NOT_M04_UI | Unique indexes and tenancy |
| CAP-CAT-003 | Shared master catalog | EXCLUDED | PREREQUISITE_NOT_M04_UI | Master catalog is product foundation, but full multi-store capabilities not implied in first slice — W1-SCOPE-B01 approved scope only |
| CAP-CAT-004 | Store-local catalog | INCLUDED | PREREQUISITE_NOT_M04_UI | Store-local catalog model required for framework, first-slice full override scope unratified — W1-SCOPE-B01 approved scope only |
| CAP-CAT-005 | Typed attribute schema | EXCLUDED | PREREQUISITE_NOT_M04_UI | Version/migration and validation — W1-SCOPE-B01 approved scope only |
| CAP-CAT-006 | Field inheritance and overrides | EXCLUDED | PREREQUISITE_NOT_M04_UI | Update conflict resolution — W1-SCOPE-B01 approved scope only |
| CAP-CAT-007 | Categories, search and filtering | EXCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Discovery/query contracts |
| CAP-CAT-008 | Localization and product assets | EXCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Media, locale and licensing — W1-SCOPE-B01 approved scope only |
| CAP-CAT-009 | Bulk product import | EXCLUDED | LATER_SCOPE | Batch errors, idempotency and permissions |
| CAP-MER-001 | Listing visibility and publication | INCLUDED | PREREQUISITE_NOT_M04_UI | State and channel rules |
| CAP-MER-002 | Offer and sale conditions | INCLUDED | PREREQUISITE_NOT_M04_UI | Currency/date/version constraints |
| CAP-MER-003 | Channel-based publication | EXCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Storefront/channel projection — W1-SCOPE-B01 approved scope only |
| CAP-MER-004 | Advanced discounts and promotions | DEFERRED | LATER_SCOPE | Outside initial MVP |
| CAP-PRC-001 | Exact money arithmetic | INCLUDED | PREREQUISITE_NOT_M04_UI | Currency rounding and minor units |
| CAP-PRC-002 | Quote evaluation | INCLUDED | PREREQUISITE_NOT_M04_UI | Effective Offer/tax policy |
| CAP-PRC-003 | Immutable accepted economic snapshot | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Identity, version and repricing |
| CAP-PRC-004 | Demonstration tax adapter | UNRESOLVED | M04_BEHAVIOR_OR_CANDIDATE | No real-tax claim |
| CAP-PRC-005 | Production taxation | DEFERRED | LATER_SCOPE | Legal/fiscal readiness separate |
| CAP-PRC-006 | Cross-currency pricing | EXCLUDED | LATER_SCOPE | FX rules not approved |
| CAP-CART-001 | Persistent guest cart | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Token authorization and durable storage |
| CAP-CART-002 | Authenticated cart | EXCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Actor scope and edits |
| CAP-CART-003 | Cart line validation | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Store boundary and quantity changes |
| CAP-CART-004 | Guest/account cart merging | EXCLUDED | LATER_SCOPE | Cross-device merge policy |
| CAP-CART-005 | Cart-to-checkout acceptance | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Snapshot and idempotency |
| CAP-ORD-001 | Durable Order identity | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Create before charge |
| CAP-ORD-002 | Commercial obligation lifecycle | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Capture vs obligation and resolution |
| CAP-ORD-003 | CheckoutProcess recoverable saga | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | State/guards/mandatory continuation |
| CAP-ORD-004 | Financial fact incorporation | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Outbox/Inbox and semantic dedup |
| CAP-ORD-005 | Authorized commercial cancellation | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Request vs settlement vs closure |
| CAP-ORD-006 | Exclusive fulfillment/refund resolution | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Quiescence before branch switch |
| CAP-ORD-007 | Customer order read model | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Projection staleness and access |
| CAP-ORD-008 | Exceptional commercial repair | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Evidence escalation and operator controls |
| CAP-ORD-009 | Order history and reconciliation | UNRESOLVED | M04_BEHAVIOR_OR_CANDIDATE | Financial fact history preservation |
| CAP-INV-001 | StockPool capacity | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Final-unit conservation |
| CAP-INV-002 | Reservation initial hold | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | 15m eligibility, no unsafe release |
| CAP-INV-003 | Financially protected reservation | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Protect before Stripe |
| CAP-INV-004 | Versioned commit/release | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Financial permit and old command rejection |
| CAP-INV-005 | Shared pools and store quotas | EXCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Cross-store shared quotas excluded from initial one-store delivery, capacity conservation remains mandatory |
| CAP-INV-006 | Multi-line capacity all-or-nothing | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | No normal partial purchase |
| CAP-INV-007 | Inventory administrative adjustment | UNRESOLVED | M04_BEHAVIOR_OR_CANDIDATE | Audit invalid/revoked stock |
| CAP-INV-008 | Post-commit capacity correction | EXCLUDED | LATER_SCOPE | No automatic refund-driven reopen |
| CAP-PAY-001 | Provider-neutral finance contracts | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | No Stripe domain coupling |
| CAP-PAY-002 | Financial admission barrier | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Old dispatch quiescence blocked |
| CAP-PAY-003 | Pre-POST durable operation record | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Stable idempotency/account/version |
| CAP-PAY-004 | Stripe hosted cards and 3DS | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Actual provider settings |
| CAP-PAY-005 | Capture/settlement proof | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | requires_capture not captured |
| CAP-PAY-006 | Verified webhook Inbox | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Durable evidence before 2xx |
| CAP-PAY-007 | Unknown Session without ID reconciliation | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Positive proof/provider limitations |
| CAP-PAY-008 | Refund financial execution | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Unknown/pending/succeeded distinction |
| CAP-PAY-009 | Sequential commercial PaymentAttempts | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Negative safe predecessor closure |
| CAP-PAY-010 | Stripe Connect charge architecture | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Direct/destination/other selection |
| CAP-PAY-011 | Session successor/recovery control | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | after_expiration.recovery limits |
| CAP-PAY-012 | Wallets and Stripe Link | EXCLUDED | LATER_SCOPE | COMPOSITE wallets DEFERRED; Stripe Link PENDING; cannot share one exact decision status |
| CAP-PAY-013 | Delayed instruments | DEFERRED | LATER_SCOPE | No first-vertical asynchronous methods |
| CAP-PAY-014 | Partial refunds/disputes | DEFERRED | LATER_SCOPE | Separate legal/support policies |
| CAP-FUL-001 | DigitalLicense catalog/import | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Unique valid key identity |
| CAP-FUL-002 | Encrypted license storage | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Key rotation and audit |
| CAP-FUL-003 | Exclusive key allocation by order line | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Concurrency and crash idempotency |
| CAP-FUL-004 | Multi-line preparation before exposure | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | No atomic exposure claim |
| CAP-FUL-005 | Buyer-authorized secure key reveal | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Potential disclosure boundary |
| CAP-FUL-006 | Delivery evidence tracking | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | HTTP reply loss not non-delivery |
| CAP-FUL-007 | Fulfillment repair and incident | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | No incompatible refund |
| CAP-FUL-008 | External redemption validation | EXCLUDED | LATER_SCOPE | Not ratified for initial slice |
| CAP-FUL-009 | Physical fulfillment logistics | DEFERRED | LATER_SCOPE | Future adapter only |
| CAP-SEC-001 | B2B/B2C identity separation | UNRESOLVED | PREREQUISITE_NOT_M04_UI | Trusted actor/store model mandatory, exact B2B/B2C realm deployment not decided |
| CAP-SEC-002 | OIDC and BFF sessions | UNRESOLVED | PREREQUISITE_NOT_M04_UI | Guest session is required, physical Keycloak/BFF plan remains unratified |
| CAP-SEC-003 | Tenant membership lifecycle | UNRESOLVED | PREREQUISITE_NOT_M04_UI | Membership and revocation |
| CAP-SEC-004 | RBAC/ABAC enforcement | INCLUDED | PREREQUISITE_NOT_M04_UI | Actor/action/resource matrix |
| CAP-SEC-005 | Secure guest checkout | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Token scope and integrity |
| CAP-SEC-006 | One-time guest Order claim | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Replay expiry verification |
| CAP-SEC-007 | Guest cancellation authorization | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | D-07-AUTH unresolved |
| CAP-SEC-008 | Trusted TenantContext propagation | INCLUDED | PREREQUISITE_NOT_M04_UI | Prevent forged scope |
| CAP-SEC-009 | License secret access control | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Encryption and operator access |
| CAP-SEC-010 | Privileged support elevation | EXCLUDED | LATER_SCOPE | Time-scoped investigation |
| CAP-SEC-011 | MFA/recovery | UNRESOLVED | PREREQUISITE_NOT_M04_UI | Admin and buyer recovery |
| CAP-SEC-012 | Negative cross-tenant auth tests | INCLUDED | PREREQUISITE_NOT_M04_UI | BOLA/BFLA and account mixup |
| CAP-CLOUD-001 | Tenant lifecycle and provisioning | UNRESOLVED | PREREQUISITE_NOT_M04_UI | Single-store tenant isolation accepted; full self-service provisioning not required automatically |
| CAP-CLOUD-002 | Brand and Store configuration | INCLUDED | PREREQUISITE_NOT_M04_UI | Lifecycle/versions |
| CAP-CLOUD-003 | Storefront and Channel configuration | EXCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Boundary to Store |
| CAP-CLOUD-004 | Invitation/membership administration | UNRESOLVED | PREREQUISITE_NOT_M04_UI | Access control and syncing |
| CAP-CLOUD-005 | Control Plane management UI | EXCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Screens and actors not ratified |
| CAP-CLOUD-006 | Payment provider per-store configuration | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Actual Stripe account topology |
| CAP-CLOUD-007 | Policy version propagation | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Preserve active checkout parameters |
| CAP-CLOUD-008 | Independent control-plane storage | UNRESOLVED | PREREQUISITE_NOT_M04_UI | No cross-context authoritative writes |
| CAP-CLOUD-009 | SaaS subscription billing | DEFERRED | LATER_SCOPE | Outside first vertical |
| CAP-CLOUD-010 | Dedicated tenant deployment tiers | EXCLUDED | LATER_SCOPE | Later tenant isolation mode |
| CAP-EGAME-001 | Published product browsing | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Catalog query and Store scope |
| CAP-EGAME-002 | Product/price display | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Accurate Offer/quote presentation |
| CAP-EGAME-003 | Secure guest cart journey | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Persistence and recovery |
| CAP-EGAME-004 | Hosted Checkout redirect | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | No browser financial authority |
| CAP-EGAME-005 | Pending payment state UX | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Uncertainty shown accurately |
| CAP-EGAME-006 | Explicit authorized cancellation UI | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Only request until verified closure |
| CAP-EGAME-007 | Order status/history | UNRESOLVED | M04_BEHAVIOR_OR_CANDIDATE | COMPOSITE minimum order-status presentation included through CAP-EGAME-005; full history scope unresolved |
| CAP-EGAME-008 | License reveal page | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | No key in email |
| CAP-EGAME-009 | Localization/accessibility/theming | UNRESOLVED | M04_BEHAVIOR_OR_CANDIDATE | COMPOSITE accessibility requirements and optional localization/theming require distinct review |
| CAP-EGAME-010 | Buyer support/disputes portal | EXCLUDED | LATER_SCOPE | Future scope |
| CAP-ADMIN-001 | Tenant/platform administration | UNRESOLVED | PREREQUISITE_NOT_M04_UI | Provisioning and memberships |
| CAP-ADMIN-002 | Store catalog editor | UNRESOLVED | M04_BEHAVIOR_OR_CANDIDATE | Actor rights |
| CAP-ADMIN-003 | License inventory import | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Dedup encryption and audit |
| CAP-ADMIN-004 | Order/support lookup | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Minimal authorized incident lookup only; not the full support dashboard |
| CAP-ADMIN-005 | Refund initiation authority | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Separate commercial approval and payment |
| CAP-ADMIN-006 | Unknown charge incident investigation | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Escalation and evidence |
| CAP-ADMIN-007 | Inventory correction | UNRESOLVED | M04_BEHAVIOR_OR_CANDIDATE | Safe adjustments |
| CAP-ADMIN-008 | Audit log and privileged review | UNRESOLVED | M04_BEHAVIOR_OR_CANDIDATE | Retention and access |
| CAP-ADMIN-009 | Financial dashboards | EXCLUDED | LATER_SCOPE | Not a source of truth |
| CAP-NOTIF-001 | Purchase confirmation | UNRESOLVED | M04_BEHAVIOR_OR_CANDIDATE | No license secret in messages |
| CAP-NOTIF-002 | Fulfillment-ready notification | UNRESOLVED | M04_BEHAVIOR_OR_CANDIDATE | Secure link only |
| CAP-NOTIF-003 | Template/retry/provider handling | UNRESOLVED | M04_BEHAVIOR_OR_CANDIDATE | Provider and SLA unselected |
| CAP-ENG-001 | Monorepo and import boundaries | INCLUDED | PREREQUISITE_NOT_M04_UI | Nx/pnpm and DDD independence |
| CAP-ENG-002 | OpenAPI/JSON Schema contracts | INCLUDED | PREREQUISITE_NOT_M04_UI | Compatibility and schema governance |
| CAP-ENG-003 | CI and PR branch gates | INCLUDED | PREREQUISITE_NOT_M04_UI | English and Conventional Commits |
| CAP-ENG-004 | Unit/integration/E2E tooling | INCLUDED | PREREQUISITE_NOT_M04_UI | Real reproducible suites |
| CAP-ENG-005 | Mongo durable authority | INCLUDED | PREREQUISITE_NOT_M04_UI | D-05-MONGO guarantees |
| CAP-ENG-006 | Durable Inbox/Outbox workers | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | No global exactly-once claim |
| CAP-ENG-007 | Optional Redis | EXCLUDED | LATER_SCOPE | Never financial authority |
| CAP-ENG-008 | Kafka transport | EXCLUDED | LATER_SCOPE | M05 not M04 prerequisite |
| CAP-ENG-009 | Domain service extraction | EXCLUDED | LATER_SCOPE | M07 single-writer cutover |
| CAP-ENG-010 | Local Compose runtime | INCLUDED | PREREQUISITE_NOT_M04_UI | Pinned tool versions |
| CAP-ENG-011 | Kubernetes/Helm/Terraform/Argo CD | EXCLUDED | LATER_SCOPE | M08 only |
| CAP-ENG-012 | Backup restore and DR | EXCLUDED | LATER_SCOPE | Real evidence and RPO/RTO |
| CAP-ENG-013 | Telemetry metrics and logs | EXCLUDED | LATER_SCOPE | M09, M04 finance alert subset |
| CAP-ENG-014 | Secrets and network policy | INCLUDED | PREREQUISITE_NOT_M04_UI | No secret exposure |
| CAP-ENG-015 | Environment budget and costs | UNRESOLVED | PREREQUISITE_NOT_M04_UI | No unapproved spending |
| CAP-DIST-001 | Public npm package boundaries | EXCLUDED | LATER_SCOPE | Versioning and scope naming |
| CAP-DIST-002 | Independent installable CommerceCore | EXCLUDED | LATER_SCOPE | No CommerceCloud dependency |
| CAP-DIST-003 | Generated TypeScript SDK | EXCLUDED | LATER_SCOPE | Contract compatibility |
| CAP-DIST-004 | Reusable Angular shell/theme | EXCLUDED | LATER_SCOPE | Extension constraints |
| CAP-DIST-005 | Second real independent consumer | EXCLUDED | LATER_SCOPE | Beyond branded duplicate |
| CAP-DIST-006 | Provider and strategy adapter ports | EXCLUDED | LATER_SCOPE | No arbitrary tenant code |
| CAP-DIST-007 | Release/deprecation compatibility | UNRESOLVED | PREREQUISITE_NOT_M04_UI | Policy not finalized |
| CAP-DIST-008 | Open-source license choice | UNRESOLVED | PREREQUISITE_NOT_M04_UI | Apache-2.0 only candidate |
| CAP-DIST-009 | Physical-product fulfillment | DEFERRED | LATER_SCOPE | Ports now, shipping later |
| CAP-DIST-010 | Live payment commercial compliance | DEFERRED | LATER_SCOPE | Separate legal/financial approvals |
| CAP-OPS-001 | Unknown finance operation monitoring | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Durable alerts and responsibility |
| CAP-OPS-002 | Business event projections | EXCLUDED | LATER_SCOPE | Never economic truth |
| CAP-OPS-003 | SLOs and error budgets | UNRESOLVED | PREREQUISITE_NOT_M04_UI | Targets and measurement unknown |
| CAP-OPS-004 | Data privacy/retention | INCLUDED | PREREQUISITE_NOT_M04_UI | PII and financial evidence policy |
| CAP-OPS-005 | Chaos and partition testing | EXCLUDED | LATER_SCOPE | Real observation |
| CAP-OPS-006 | Backup/restore proof | EXCLUDED | LATER_SCOPE | No unsupported HA claims |
| CAP-OPS-007 | Incident runbooks/escalation | INCLUDED | M04_BEHAVIOR_OR_CANDIDATE | Unknown charges, keys, refunds |

## Composite and provenance corrections

- CAP-PAY-012 combines historically DEFERRED wallets with PENDING Stripe Link. It cannot accurately receive one inherited approval status. Split its child scope only after review.
- CAP-EGAME-007 combines necessary order-status reading already represented by CAP-EGAME-005 with separately unratified order history.
- CAP-EGAME-009 combines essential accessibility requirements and elective localization/theming; separate acceptance and release criteria.
- CAP-ADMIN-004 is included only as minimum authorized evidence lookup, not a complete support dashboard.
- Existing original capability entries copy broad subsystem-level source IDs. Zero invalid IDs does not establish clause-level source fidelity. Four original accepted-policy-labelled entries had no accepted policy among their original broad group refs: CAP-PRC-003, CAP-CART-005, CAP-OPS-001 and CAP-OPS-007; supplemental policy candidates are provided in JSON, still unverified at clause level.

**Blocking dependencies:** AUD-P0-01 through AUD-P0-04 OPEN / BLOCKING; D-05-MONGO, AUD-P0-03-CAPTURE, M00.2 capacity/license and M00.3 guest authorization remain incomplete. This matrix is not authority to code or move financial/fulfillment statuses.
