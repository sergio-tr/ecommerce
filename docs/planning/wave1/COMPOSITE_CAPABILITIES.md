# Wave 1 — Composite Capability Decomposition (Provisional)

**State:** RECOMMENDATIONS ONLY. Parent CAP IDs remain the existing provisional planning IDs and keep their status; parent/component keys are descriptive local names, not canonical newly accepted requirements or engineering issues. Additional composites beyond the three explicitly requested were identified while reviewing the 29.

## CAP-PAY-012 — Wallets and Stripe Link

Original parent status: POST_M04 / DEFERRED_OR_PENDING.

| Local component key | Original source status | Recommendation | M04 role | Rationale | Boundary |
|---|---|---|---|---|---|
| wallets | D-03-WALLET = DEFERRED | Deferred | OUT_OF_SCOPE | Cards and 3DS are the approved initial method; wallet integration is not required | Dynamic Stripe configuration must not silently enable wallets |
| link | D-03-LINK = PENDING; D-03-CONFIG = PENDING | Still Unresolved | NOT_ENABLED_UNTIL_DECIDED | Effective Stripe Link behavior must be intentionally included or excluded | Actual provider method restrictions require contract and testmode checks |

## CAP-EGAME-007 — Order status/history

Original parent status: UNRESOLVED.

| Local component key | Original source status | Recommendation | M04 role | Rationale | Boundary |
|---|---|---|---|---|---|
| current-order-status | D-03, D-07, AUD-P0-03; CAP-EGAME-005 | Included | IN_SCOPE_MINIMUM | Buyer must see current order pending/unknown, paid/fulfillment and refund accurately | UI/projection never authorizes second charge |
| cross-order-history | R0.2-09 supports eGame but not account-wide history | Excluded | OUT_OF_SCOPE | Multi-order browsing is not required for a recoverable individual purchase | Ordering/Payments still retain authoritative history |

## CAP-EGAME-009 — Localization/accessibility/theming

Original parent status: UNRESOLVED.

| Local component key | Original source status | Recommendation | M04 role | Rationale | Boundary |
|---|---|---|---|---|---|
| accessibility | R0.2-09 not a precise accessibility acceptance standard | Still Unresolved | M04_CRITERIA_REQUIRED | Accessible cancellation, checkout, status and license reveal need an explicit acceptance rule | Target standard and test oracles must be ratified |
| localization | SOURCE_GAP: no initial locale-count requirement | Excluded | OUT_OF_SCOPE | One UI language is adequate as a *proposal* for first slice | Money/currency rendering and commercial text remain accurate |
| theming | Historical reusable shell candidate, not approved initial UI | Excluded | OUT_OF_SCOPE | Brand/theme customization can be postponed | Domain packages remain frontend-independent |

## CAP-CAT-008 — Localization and product assets

Original parent status: UNRESOLVED.

| Local component key | Original source status | Recommendation | M04 role | Rationale | Boundary |
|---|---|---|---|---|---|
| translated-product-copy | SOURCE_GAP for M04 translations | Excluded | OUT_OF_SCOPE | Single language product name/description adequate first scope proposal | Required purchase terms cannot be omitted |
| managed-media-assets | SOURCE_GAP for product media pipeline | Excluded | OUT_OF_SCOPE | Product discovery can begin without image upload/CDN | No untrusted media provider assumptions |

## CAP-ORD-009 — Order history and reconciliation

Original parent status: UNRESOLVED.

| Local component key | Original source status | Recommendation | M04 role | Rationale | Boundary |
|---|---|---|---|---|---|
| durable-commercial-financial-history | D-04, D-05, AUD-P0-03 | Included | IN_SCOPE_MANDATORY | Historical paid/refunded facts and provider evidence cannot be overwritten | Local atomicity and source-of-truth guards still pending |
| full-buyer-history-archive | No explicit M04 requirement | Excluded | OUT_OF_SCOPE | Multi-purchase history is separate from status of current order | Incident history remains available to authorized operations |

## CAP-ADMIN-008 — Audit log and privileged review

Original parent status: UNRESOLVED.

| Local component key | Original source status | Recommendation | M04 role | Rationale | Boundary |
|---|---|---|---|---|---|
| tamper-evident-operation-trail | R0.7-08, R0.7-19 PROPOSED — SELECTED | Included | IN_SCOPE_MANDATORY | Privileged refunds, inventory and key operations need attributable evidence | Mutable DB collection cannot be claimed immutable without further proof |
| rich-audit-review-UI | No accepted first-slice administration requirement | Excluded | OUT_OF_SCOPE | Minimal authorized incident audit read is adequate | Sensitive evidence scoped by tenant/role |

## Non-negotiable separation

- Wallets remain D-03-WALLET DEFERRED; Stripe Link remains D-03-LINK PENDING and the store-level enforcement D-03-CONFIG PENDING. No automatic provider method assumption.
- The eGame purchase status view must be truthful and actor-authorized; account-wide Order history is optional, while financial facts remain durable.
- Accessibility acceptance requires explicit standard and tests, while independent localization and theming may be postponed.
- Audit/financial evidence is mandatory for recovery, but a rich audit dashboard is not.
- No aggregate, new tracker issue, stable child ID or architecture decision is introduced by decomposing these planning rows.
