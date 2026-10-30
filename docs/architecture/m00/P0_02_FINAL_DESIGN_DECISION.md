# AUD-P0-02 — Design Resolution: Missing Stripe Session ID and Idempotency Expiry

**Owner:** @sergio-tr · **Option:** durable correlation + positive reconciliation + indefinite quarantine on irreducible UNKNOWN · **Documentary design:** SELECTED FOR REVIEW · **Actual Stripe evidence:** NOT_VERIFIED · **Finding:** OPEN/BLOCKING until required tests.

## Failure case

A Stripe Checkout Session creation may succeed but the HTTP response disappears. The application never learns the `cs_...` ID, and the provider can remain capable of collecting money. After Stripe API v1 idempotency keys are pruned (potentially at or after 24 hours), another POST with the same key may create a **new Session**. Therefore a local negative search and a repeated POST beyond the known retention interval are not conclusive safe recovery.

Stripe's API v1 idempotency reference explicitly states that the first execution result is cached even for certain `500` responses and that keys may be removed after at least 24 hours: https://docs.stripe.com/api/idempotent_requests

## Alternatives

| Option | Outcome |
|---|---|
| A: repeat POST with old key forever | REJECT: API v1 idempotency retention not permanent |
| B: query Stripe by Order metadata; if search empty mark failed | REJECT: search/list absence not authoritative proof that object never existed |
| C: single-attempt durable ledger, correlate objects as they become positively identifiable, **quarantine unresolved attempts** | **SELECTED**: safe without pretending every UNKNOWN is eventually resolved |
| D: require a nonexistent global Stripe/Mongo transaction | REJECT |

## Required durable identity

Before a potential POST, Payments persists immutable operationId, tenant/store, accepted Order/CheckoutProcess/generation, PaymentAttempt ID, Reservation identity/version, Stripe account ID and livemode, API version, original endpoint/method/payload hash, idempotency key, request creation timestamp, `MAY_HAVE_BEEN_SENT`, and provider references (nullable but **not default-negative**).

The intended create Session request contains stable, non-sensitive correlation where supported: `client_reference_id` and metadata with an opaque original attempt/order identifier, and version/mode/account information kept locally; protect buyer PII and keys. Do not assume every Stripe query indexes metadata or that a search timeout proves no result.

## Reconciliation decision tree

1. If Session ID known: retrieve exact Session with same account/mode; inspect Session status, actual `expires_at`, `payment_status`, and relevant PaymentIntent/Charge evidence; investigate any mismatch.
2. If ID unknown: **do not issue CreateSession again**. Try documented safe query/list/Workbench/event correlation by account, time, original immutable correlation, Customer/PaymentIntent when available; verify each candidate against money, currency, order and generation. A found matching object is **positive evidence**, not authorization to assume other possible duplicated operations absent.
3. If a matching Session is open and buyer has canceled: expire that exact known Session when permitted and reconcile any collected/pending facts; canceled and expired alone cannot erase captured money.
4. If a matching captured payment exists: preserve it in Payments, reliably incorporate Order obligation, and resolve authorized Fulfillment/Refund separately.
5. If a matching terminal-negative, non-collectible Session is known and all preceding dispatches accounted for: permit the ordinary financial close protocol. **Never treat a payment failure within a still-open Session as final closure.**
6. If not positively matched or provider unavailable: persist `UNKNOWN`, keep Inventory protected, no successor attempt, incident ownership and repeat read-only investigation. Do not derive negative proof from time elapsed.
7. If merchant cannot conclusively establish which provider object might exist, the system **must be allowed to remain unresolved without inventing a financially safe automatic release**. Escalation can conclude with an unresolved incident retained and no license resale.

For the first M04 slice, disable automatic sequential commercial retries (one Session candidate per Order) to reduce unknown-provider branching. Historical D-06 possibility of bounded sequential retries remains accepted but not enabled.

## Semantic deduplication

`Stripe Event.id` deduplicates transport delivery. `paymentIntentId/chargeId + account + mode` deduplicates the economic fact. `operationId/generation` deduplicates commercial incorporation. A later Event for an already captured charge cannot create another paid Order or another license. Invoice/refund facts are stored with original financial history, never overwritten to claim charge never occurred.

## Operational runbook

The operator sees an incident with exact account, mode, attempt, first request time, idempotency age, immutable payload digest, known Stripe object references, available webhook/object evidence and next allowed actions. Operator may inspect Stripe Workbench, query verified objects, reconcile/refund as commercially authorized and attach evidence. Operator cannot set a `PROVED_NOT_SENT` flag merely because no Session was found. An unresolved test-mode order can remain quarantined, and a separate legitimate new purchase is a separate obligation subject to D-06-INTENT policy.

## Adversarial experiment oracles (NOT_RUN)

| Scenario | Expected result |
|---|---|
| HTTP response lost after provider successfully creates Session | UNKNOWN persists, no second POST, stock protected |
| Restart after intent persisted before sending | May-send conservative marker; no unsafe release if send uncertainty exists |
| Idempotency key age exceeds provider retention | Any automatic retry is rejected; original attempt retained |
| Stripe list/search returns no candidate | Absence not treated as proof; incident maintained |
| Webhook arrives after Order locally canceled | Payments records economic fact, Ordering resolves contradiction |
| Webhook Event ID differs for the same PaymentIntent | Exactly one semantic paid incorporation |
| Correlated Session belongs to wrong Store/Stripe account | Reject association and escalate; no cross-tenant payment attribution |
| Session known expired but Charge evidence says paid | Preserve actual paid fact, investigate; do not free stock on Session status alone |

## Resolution classification

This **resolves the design choice by explicitly choosing safety over guaranteed automated liveness**. It does *not* discharge provider-negative-proof evidence or prove that a missing Session can always be discovered. That impossibility is a documented residual constraint rather than hidden technical debt. AUD-P0-02 remains OPEN/BLOCKING for actual evidence closure; the documentation PR can be reviewed and merged separately.
