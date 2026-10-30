# Wave 1 — Minimum Coherent M04 Digital-License Purchase Boundary

**State:** Scope architecture recommendation based on W1-AP-01, not a ratified per-capability contract or implementation authorization. One eGame Store in Stripe test mode is the assumed planning target; no live payments or new deployment topology.

## Indispensable complete buyer and operator journey

| Step | Business capability | Bounded-context authority | Minimum non-negotiable behavior | Open contract / evidence |
|---|---|---|---|---|
| 1 | Tenant/Store and valid seller account | CommerceCloud context / trusted TenantContext | A clearly scoped configured Store, authorized buyer and operators; no cross-tenant provider account/data access | M00.3 role/session proof; M00.4 effective policy boundaries; Connect topology pending |
| 2 | Sellable Product/Variant and Listing/Offer | Catalog / Merchandising | Store-owned product identity, published Listing, eligible Offer and capacity-linked SKU; one channel suffices | R0.2-03 accepted, R0.3-04 candidate; source identity and lifecycle contracts |
| 3 | Exact price and accepted Quote | Pricing / Ordering | Exact money, currency, accepted immutable snapshot; price/tax/display rules cannot be silently omitted | R0.3-05/06 selected; R0.3-08 demo tax decision and explicit no-live-money limitations |
| 4 | Authorized guest cart and checkout | Cart / Identity / Ordering | Durable guest Cart, buyer scope, explicit acceptance, preexisting Order and durable CheckoutProcess | M00.3 guest claiming, idempotent Cart/Order and state contracts |
| 5 | Capacity hold and financial protection | Inventory | 15m initial reservation is checkout admission eligibility, not payment timeout; confirm durable protection before external provider charge can be enabled | AUD-P0-01, AUD-P1-01, M00.2 StockPool/Reservation atomicity |
| 6 | Versioned Stripe Checkout admission | Payments | Durable immutable external-operation intent, single potential collectible commercial opportunity, card/3DS, safe unknown handling | AUD-P0-01-DISPATCH-NEUTRALIZATION, AUD-P0-02 provider proof, D-03-CONFIG/Connect/capture |
| 7 | Reliable financial truth and Order incorporation | Payments → Ordering | Verified signed webhook Inbox before 2xx, provider reconciliation, idempotent financial fact, locally atomic mandatory Outbox work, Order paid obligation | AUD-P0-03, AUD-P0-03-CAPTURE, D-05-MONGO |
| 8 | Commit capacity and prepare every enabled line | Inventory → Fulfillment | No oversell or duplicate license ownership; assign actual unique keys only after accepted capture; ensure no ordinary partial sale | M00.2 all-line allocation/commit and refund/disclosure quiescence |
| 9 | Secure license reveal and buyer status | Fulfillment / Identity / eGame | Only authorized buyer/claimed owner receives content; potential disclosure persisted; pending/refund status truthful and staleness explicit | AUD-P0-04-QUIESCENCE and M00.3 claim/access and M00.4 read contract |
| 10 | Cancellation / refund / exception recovery | Ordering / Payments / Inventory / Fulfillment | Buyer affirmative cancel distinct from financial closed/canceled; refunds only on authorized commercial branch; uncertainty retains stock and incident | AUD-P0-01..04, D-04-EXCL, D-07-AUTH |
| 11 | Durable incident and operator handling | Operations with original bounded owner | Trace unknown provider operations, preserved charge facts, action audit, owner escalation, safe repair; no manual bypass of invariants | D-05-OPS, M00.3 privileged auth and evidence retention |

## Minimal boundary guardrails

1. **Single Store does not mean single-tenant security can be omitted.** Every object must carry trusted Tenant, Store and provider-account correlation; negative cross-tenant tests remain required.
2. **Initial card/3DS only.** Wallets remain deferred and Link pending, subject to actual effective payment-method configuration. Return/redirect does not prove capture.
3. **No claim of atomicity across Stripe, Mongo and several bounded contexts.** D-05 durable local commitments and provider reconciliation are mandatory; physical guarantee not selected.
4. **Unknown means protected and investigated.** No TTL, lease, missing HTTP log, absent webhook or search miss is sufficient to release Inventory or authorize another incompatible charge.
5. **Multi-line assumption is NOT silently changed.** Any enabled multi-line Order must honor no ordinary partial fulfillment and a proven multi-line preparation/allocation policy. If it is not specified, capability exposure must be explicitly restricted by a separately ratified product decision; a single-line demo cannot count as proof of all-lines atomic fulfillment.
6. **Administrative UI is not equivalent to privileged command controls.** Store-product bootstrap, refund authorization, stuck-charge investigation and safe incident quarantine require governed access even without a full admin portal.
7. **Key assignment is not delivery.** A token that could disclose content or a response lost after disclosure must be treated as potentially irreversible.
8. **No real-money readiness.** Demo taxation, refund and provider integrations are test-mode and require separate legal/commercial approval before real transactions.
9. **Framework boundary remains.** CommerceCore must not call CommerceCloud private tables or absorb eGame-specific business rules; future independent installation and second consumer remain roadmap requirements.

## Post-first-slice exclusions recommended, not automatically ratified

Full master-catalog inheritance, multi-channel publication, comprehensive tenants/invitations, rich Store/Platform administration UIs, image/CDN pipelines, translations/themes, routine emails, general stock-adjustment console, account-wide Order history, full SDK/package distribution, Kafka, microservice extraction, k8s production cluster, enterprise SLOs and physical logistics. These may still belong to M02/M03/M05–M09 or later approved releases. Importantly, avoiding those interfaces does **not** defer their already accepted core consistency/security guards.

## Active undecided prerequisites

- Tax demo adapter versus explicitly selected no-tax synthetic case; do not claim real-tax correctness.
- Guest/operator secure sessions and admin MFA; effective TenantContext and Store actor permissions.
- Stripe Connect charge/refund configuration, captured-funds definition and effective Link/method suppression.
- Mongo local atomicity and unknown commit; old enabled Stripe POST neutralization and provider proof; refund/disclosure quiescence.
- Multi-line activation rule, StockPool/Reservation aggregate boundary and exclusive DigitalLicense allocation.
- Accessible cancellation, payment status and licensed-content display acceptance standard.
- Initial operational recovery, alert/evidence and exact SLO targets.

**Exit of scope review:** user explicitly approves each current ambiguous M04 item and functional exclusions; G1 may then be assessed, but G3/G4/G5 remain independently blocked where contracts, authorization or evidence are missing.
