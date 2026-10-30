# Stripe Sandbox: Merchant, Buyer and Optional Connect Accounts

**Status:** STRIPE-A ARCHITECTURAL MODEL ACCEPTED 2026-10-30 / ACCOUNT SETUP NOT EXECUTED. **Owner:** @sergio-tr. **Date:** 2026-10-30. **Project scope:** learning, one eGame Store, no real charges.

## Correct conceptual identities

| Role | What exists in Stripe | What exists in project | Recommendation |
|---|---|---|---|
| Merchant / company / eGame Store | **One Stripe test-mode merchant account or sandbox** with `sk_test_...` keys, Checkout Sessions, PaymentIntents, Charges, Refunds and test webhook signing secret | Store, payment-account configuration and provider adapter in Payments | REQUIRED once an authorized Stripe test-mode adapter is implemented |
| Buyer / customer | Optional Stripe **Customer** `cus_...` and test payment method/card. There is no requirement for the human buyer to create/log into a second full Stripe business account | eGame registered/guest user, scoped Cart, Order, claim and authorization | Create buyer identity in eGame; use a Stripe test Customer only when useful for repeat checkout/profile testing |
| A second merchant / seller | Stripe Connect **test connected account** if testing marketplace/multi-merchant fund flow | Another Store with explicitly scoped payment account | DEFER from first M04 test Store; needs separate Connect charge/refund authority contracts |

Stripe test/sandbox objects use test payment rails and **do not move real money**. The developer still creates and controls the merchant account; the project must never store or embed a live secret. A test customer is a Stripe object, not a second seller account. References:
- https://docs.stripe.com/keys
- https://docs.stripe.com/testing
- https://docs.stripe.com/payments/checkout
- https://docs.stripe.com/connect/testing

## Recommended manual account configuration — AFTER infrastructure/test phase authorization

1. Register/sign into Stripe as the test merchant; choose its available sandbox/test-mode environment. Verify the current UI and rules, since the Dashboard may evolve. No business activation or live-money processing is necessary for test-mode API requests.
2. Record `StripeAccountId`, sandbox identity and `livemode=false` in locally protected Store payment configuration. Do **not** put keys or personally identifying buyer data in version control.
3. Obtain only test-mode credentials from Stripe, e.g. `sk_test_...` for the backend. Test the backend's hard refusal to start in the educational environment with any `sk_live_`/livemode=true configuration. A publishable `pk_test_...` key is needed only if later chosen browser-facing Stripe libraries require it; hosted redirect Checkout does not imply the frontend should possess the secret key.
4. Install Stripe CLI in local development and authenticate against the intended test account/sandbox; forward signed test webhook deliveries to the API via local port/approved HTTPS endpoint. A Kubernetes Service is not public internet by default: choose a controlled port-forward/host routing for the CLI.
5. For the initial demo, create an eGame guest or registered buyer. Use Stripe's documented test card details in hosted Checkout, including success, declined, authentication-required and canceled scenarios. Optionally create a `Customer` with a unique fake test email/ID if customer reuse is part of a later test; do not create an additional merchant account for the buyer.
6. Confirm effective hosted payment methods: card and expected 3DS, delayed methods disabled, wallets/Link explicitly excluded or acceptance revisited. *Setting* a method list is not proof that dashboard/provider configuration excludes all UI options; inspect the actual test-mode session.
7. Record the returned Checkout Session `expires_at` and provider IDs. Persist financial operation intent first; treat redirect as UI only. Verified captures and refunds use account-scoped provider events/get requests plus durable Inbox/Outbox.
8. Record test-mode evidence in the original AUD IDs with provider object state, correct account/mode, timestamps, database records and outcomes. No test result is claimed by writing this checklist.

## First-use test matrix (PLANNED only)

| Scenario | Expected safe application behavior |
|---|---|
| Successful test card + captured PaymentIntent | Ordering incorporates captured evidence, then authorized key assignment |
| 3DS authentication required | Protected Inventory retained, no secret before captured evidence |
| Declined card within open Checkout Session | No new Stripe Session automatically; buyer can correct within same Session |
| Browser closes before Stripe redirect | Outcome remains UNKNOWN/PENDING, reconciled from provider/webhook |
| Duplicate signed webhook event | Inbox detects transport duplication and semantic financial duplication |
| Backend crashes after CreateSession may have been sent | No blind retry, protect stock, investigate provider evidence |
| Refund API timeout | One refund operation, reconcile before any re-POST |
| Account/mode or amount mismatch | Reject economic association and escalate |
| Buyer repeats purchase with new legitimate Order | Independent obligation, not merged into original automatically |

## Not decided by this guide

- Stripe Connect multi-merchant charge ownership, destination charges, transfers or payout handling.
- Production checkout, legal/tax compliance and business verification requirements.
- Realistic performance/rate limit thresholds and automatic end-to-end failure simulation via Stripe alone. Use a local provider simulator for deterministic rare races.
- Exact Stripe test account credentials or specific dashboard selections (must come from user's own account).

**Accepted 2026-10-30:** STRIPE-A — one test merchant, buyer-as-eGame-user/optional Stripe Customer, Connect later. This requires NO second Stripe business account for a customer. Manual account credentials are still not provisioned, and payment adapter/test evidence remains pending.
