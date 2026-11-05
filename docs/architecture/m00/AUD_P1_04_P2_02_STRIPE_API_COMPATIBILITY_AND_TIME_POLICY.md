# AUD-P1-04 / AUD-P2-02 — Stripe Checkout API-versioned methods, capture and Session timing

**Date:** 2026-11-05. **Status:** REVIEWABLE INITIAL CONTRACT / EXTERNAL TEST PROOF NOT_RUN / EXACT OWNER APPROVAL PENDING. **Scope:** GitHub #8/SER-125, #12/SER-129, D-03-CONFIG, D-03-LINK, D-02-P01, D-06-P01. Initial eGame M04 uses one Stripe test merchant account, hosted Checkout, **card/3DS only**, `automatic` capture, and **one active commercial attempt and one Session opportunity** per Order. No Connect, wallets, Link, delayed methods or live payment processing are authorized. This document is not a new G4 or live-money grant.

## 1. Critical current API compatibility correction (5 Nov 2026)

Stripe's current Checkout Session create reference lists **`allowed_payment_method_types`** as a filter on dynamically eligible payment methods. Stripe's support guidance says passing older **`payment_method_types`** in API version **`2026-09-30.endive` and later** causes HTTP 400; earlier versions might accept it. Treat the *exact configured API version* as a mandatory adapter input and persist it alongside account and mode, not as an implicit account-wide default. Avoid older snippets that blindly set `payment_method_types: ['card']`.

**Recommended initial request semantics (test mode, conceptual):**
```text
StripeCheckoutCreateIntent {
  mode: payment, ui_mode: hosted_page,
  accountRef: exact configured platform/single-merchant account,
  apiVersion: explicit pinned adapter version,
  payment_intent_data.capture_method: automatic,
  allowed_payment_method_types: [card],    // only when supported by the pinned API contract
  wallet_options.link.display: never,     // verify support/effect in this API version/account;
                                           // fail closed if Link cannot actually be disallowed
  expires_at: actual provider-accepted absolute timestamp,
  after_expiration.recovery.enabled: false,
  metadata: OrderRef/operationId/generation safe correlation identifiers,
  idempotencyKey: original durable possible-send operation key
}
```
This is **not copy-paste executable request JSON**. Each option's availability and conflicts, especially `wallet_options` and `allowed_payment_method_types`, must be verified using Stripe's pinned OpenAPI schema/SDK and actual test account. Do **not** assume a `card` filter alone excludes Apple Pay, Google Pay or Link: wallets may ride card rails and require their own Checkout options or account settings. Do not silently permit payment methods merely because they appear in test mode. A config that cannot enforce the permitted set is a fail-closed configuration error.

The current allowed-method filter cannot be combined with other mutually exclusive selection schemes (e.g. `payment_method_configuration`/automatic methods) unless official reference allows it for the pinned version. For future Store-specific behavior use explicit `PaymentMethodPolicyVersion` and `MerchantAccountRef`; no user-controlled payment method directly bypasses Payments admission.

## 2. Payment and financial fact interpretation

- `checkout.session.completed`, `Session.payment_status`, `PaymentIntent` lifecycle and final captured Charge are **distinct observations**; only validated provider-specific captured-money evidence against exact `accountId/mode/apiVersion/OrderSnapshot` can produce a `CapturedFundsFact` and advance authorized commercial fulfillment.
- Capture semantics for initial card-only slice: automatic capture requested; on unexpected `requires_capture`, `processing`, amount/currency/account mismatch, delayed provider event or provider outcome UNKNOWN, **retain the Order obligation and protected Inventory, start reconciliation, never disclose a key**.
- Provider adapter stores immutable request hash, original idempotency key, effect send-intent, possible-send marker, correlated external Session/Intent/Charge IDs, actual returned method list and observed status. No blind resend after lost response or key retention expiry.
- Link/wallet status must be tested not assumed from a displayed Stripe API `payment_method_types=['card']`; screenshot/UI and effective Checkout response plus actual authorization result are necessary to confirm policy.

## 3. Session and attempt clocks are separate

| Clock/policy | Initial decision | What it does NOT prove |
|---|---|---|
| Initial Reservation review TTL | 15 minutes, existing design policy | NOT provider expiry, charge absence, or right to release protected units |
| Stripe Checkout Session `expires_at` | **Candidate 35 minutes** from Stripe Session creation, within provider documented supported interval 30 minutes–24 hours; persist **actual response** timestamp | NOT definitive financial closure; expired Session does not eliminate old external possible POST or pending payment |
| Relative future retry-request window | Alternative D policy accepted; numeric duration **DEFERRED** while first slice has no successor attempt | Window elapsed does not neutralize old sends or release stock |
| Absolute global new-attempt admission cutoff | Alternative D policy accepted; exact value **DEFERRED** for initial one-attempt first slice | Late captured payment still creates obligation |
| Total commercial Session count | **Initial 1** enabled Session; candidate up to 2 sequential attempts remains PROPOSED/DEFERRED | A second session must never become available merely because first timed out |

Stripe's current `expires_at` documented range is **30 minutes to 24 hours** after creation, default 24 hours when omitted. Treat 35 minutes as **store-configurable candidate with validation**, not universal accepted provider guarantee. The effective timestamp is from the Session response, not merely the request. An abandoned buyer, expired session or `checkout.session.expired` event can trigger reconciliation, **not direct release** in this provider-uncertain architecture.

## 4. Tests required before enabling Stripe in M04 (all NOT_RUN)

| ID | Initial scenario | Mandatory observable evidence |
|---|---|---|
| STRIPE-METHOD-01 | test account + pinned API; `allowed_payment_method_types: [card]` | request accepted, effective provider method list is permitted, no alternative method |
| STRIPE-METHOD-02 | 2026-09-30.endive+ rejects deprecated `payment_method_types` | explicit version-specific adapter compatibility / no fallback to insecure dynamic methods |
| STRIPE-METHOD-03 | Link, Apple Pay and Google Pay in eligible device/account | **not offered nor usable** if excluded by approved Store policy, or fail closed |
| STRIPE-METHOD-04 | capture and 3DS challenge / abandonment | no key disclosure before captured-funds confirmation and authorized Order continuation |
| STRIPE-METHOD-05 | account mode/store/tenant mismatch | reject attribution, preserve forensic evidence |
| STRIPE-EXPIRY-01 | request 35-minute Session | record actual provider `expires_at` and accepted bound |
| STRIPE-EXPIRY-02 | original POST paused and Session expired | no Inventory release until all possibly executable external sends neutralized or quarantined |
| STRIPE-EXPIRY-03 | delayed confirmation/async status | preserve captured obligation, never interpret Session status as sole proof |
| STRIPE-EXPIRY-04 | first Session UNKNOWN and browser asks new Session | refuse successor; retain protected capacity and incident |
| STRIPE-EXPIRY-05 | idempotency key may be pruned after retention window | no blind POST replay, no duplicate collectible opportunity |

These IDs are **proposed new M04 provider conformance tests**, not replacements for the immutable 148 original test IDs. They require actual external test-mode evidence and exact configured Stripe account/version. Live mode is not permitted.

## 5. Reversible future upgrade path

- Stripe Connect and multiple platform/connected merchant accounts are **excluded from first slice**. The `MerchantAccountRef` must still specify owner, mode, API version and any destination/on_behalf_of routing when future scoped ADR approves Connect.
- Payment method selection behind versioned `PaymentMethodPolicy` and `PaymentProviderPort`; adding a provider, wallets, Link, delayed methods, manual capture or recurring charges requires a new capability scope and integration-specific conformance suite. A later richer flow must not compromise existing Order/Payment/Inventory/Disclosure invariants.
- A provider method or expiration change requires an explicit policy/adapter version change and tests, **not** a new Order aggregate or payment state machine.

## 6. Closure eligibility

- **AUD-P1-04/#8:** design may be approved after method/capture/account contract review; provider test-mode proof and effective enforcement remain G5 open, original audit cannot be called VERIFIED.
- **AUD-P2-02/#12:** design can document no universal 35-min/two-Session guarantee and defer multi-attempt; still needs Stripe expiry/capture test proof for definitive provider closure, no automatic release.
- The source's D-02-P01 and D-06-P01 retain PROPOSED — SELECTED as applicable; D-03-CONFIG/D-03-LINK remain PENDING until exact user approval and provider compatibility is established.

## Vendor documentation reviewed 2026-11-05

- [Stripe Checkout create reference](https://docs.stripe.com/api/checkout/sessions/create): current `allowed_payment_method_types` filter and `expires_at`.
- [Stripe support: `payment_method_types` removed in new API versions](https://support.stripe.com/questions/fix-the-payment-method-types-error?locale=es-ES): version >= 2026-09-30.endive requires migration.
- [Dynamic payment methods](https://docs.stripe.com/payments/payment-methods/dynamic-payment-methods): account setup, Link/wallet caveats.
- [Stripe Checkout Session expiry](https://docs.stripe.com/payments/checkout/custom-success-page) and [Stripe session create](https://docs.stripe.com/api/checkout/sessions/create): automatic expiry and readback.
