# M00 — Financial Admission, Unknown Stripe Effects and Recovery

**Status:** RECOMMENDED CONCRETE DESIGN — selected for planning by user directive; not provider-verified or implementation-ready. **Owner:** @sergio-tr. **Prior policies:** D-01/02/03/05/06/07, AUD-P0-01 and AUD-P0-02 (both still OPEN/BLOCKING until evidence).

## Model and irrevocability

A CheckoutProcess represents durable coordination, Order owns the accepted commercial obligation and resolution, Payments owns Payment/PaymentAttempt/Refund and provider evidence, and Inventory owns protected capacity. A Stripe request can create chargeable effects despite the client losing the response. There is no general reliable local transaction/timeout/lease that cancels a POST already in flight.

**Mandatory conservative rule:** A financial operation whose external execution cannot be excluded is **POTENTIALLY_COLLECTIBLE**. It blocks incompatible new attempts and stock release, for as long as necessary; alerting and explicit incident investigation are allowed, timeout-based release is not. This favors safety over guaranteed liveness and is the declared fallback when provider negative proof cannot be obtained.

## Identifiers and durable records

Each admission carries tenantId, storeId, Stripe account/livemode, orderId, checkoutProcessId, commercialGeneration, paymentAttemptId, reservationId/version, accepted quote digest/amount/currency, operationId and idempotency key, requested API endpoint/method, immutable normalized parameters and effective policy version.

Payments persists **before** enabling any external operation:
- immutable operation intent (operationId, attempt generation, payload hash, Stripe correlation metadata);
- dispatch eligibility and a monotonic close generation;
- attempt-specific evidence and UNKNOWN classification;
- mandatory Outbox work for cross-context propagation.

Store the exact Stripe mode/account with the operation. Never use a new account, environment or idempotency key to silently retry an UNKNOWN operation. For Stripe API v1, keys can be pruned after at least 24h; key repetition beyond the retention window can create a new operation. The ledger therefore retains independent evidence and blocks blind reposts.

## Financial admission protocol (proposed contract)

1. **Ordering:** validates accepted immutable Quote/Order, correct tenant/Store, active commercial generation and cancellation exclusion. Records a durable saga intention for an operation.
2. **Inventory:** conditionally and durably transitions Reservation `RESERVED -> PAYMENT_PROTECTED` before any charge-enabled POST; initial 15-minute TTL never substitutes for this.
3. **Payments:** validates Inventory's version-bound positive acknowledgment and the previously accepted Order identity; atomically admits **at most one potentially collectible attempt** for the commercial obligation. Version mismatch or unknown protection response => no Stripe POST.
4. **Dispatcher:** claims a single durable operation and performs a last conditional admission check. A check made *before a thread pause* does not prove the HTTP request cannot later be sent. Treat any operation that may have reached the network as in-flight/UNKNOWN and block release until its financial effect and old-dispatch quiescence are established. No optimistic release is possible on local worker TTL alone.
5. **Result:** persist returned Session ID, actual expires_at, PaymentIntent ID when known and evidence. If response lost, remain UNKNOWN; reconcile via positive objects, account/mode, metadata and safe provider APIs. Do not claim generic search absence proves none exists.
6. **Webhook:** verify signature/raw payload and account/mode; durably deduplicate Inbox by provider event ID and separately financial object ID; persist verified financial facts and atomic Outbox before acknowledging 2xx. Out-of-order notifications do not roll back paid facts.
7. **Commercial incorporation:** Ordering idempotently incorporates a valid Payments event into Order/CheckoutProcess and emits required continuation; stale `Order.PENDING_PAYMENT` never authorizes a new attempt.
8. **Safe close / release:** close **new** admission durably, account for **all** earlier admitted and potentially sent operations, positively reconcile provider object status and pending captures, and establish no old worker can still send incompatible effects. If any proof is unavailable: keep protected capacity and escalate. If satisfied, Ordering issues a versioned release authorization; Inventory independently checks it.

## Explicit evidence interpretation

- A Stripe Session `open` can be expired via API. A successful expire response is evidence about **that known Session**; it is NOT proof no unknown parallel Session or old POST exists.
- Stripe Session expiration, app cancellation, merchant browser redirect and a missing webhook are NOT authoritative no-charge facts.
- Positive charge evidence includes correct account/mode/amount/currency and captured payment status as specified by the capture contract, not `checkout.session.completed` alone when any delayed method is available.
- The paid fact remains historical even if refunded. There can be only one active collectible opportunity, including UNKNOWN, per accepted commercial obligation; independent new orders require a separately versioned commercial intent.

## Decision on commercial retries

AUD-P1-03 option D: relative retry window after proved-negative preceding attempt AND absolute global new-admission cutoff. Both are **new attempt** permissions only. No selected numeric values yet; durations and time anchors must be approved from tested operational constraints. D-02 35 minutes and D-06 max 2 Sessions are not implicitly approved.

## P0 acceptance matrix

| Planned test | Injected race/failure | Required outcome |
|---|---|---|
| AUD01-T / AUD01-DT | worker pauses after conditional check, release proceeds, old HTTP resumes | no released stock while old dispatch potentially collectible; else incident held |
| AUD02-T | Stripe Session POST creates object but HTTP response is lost | original operation remains UNKNOWN and protected; no blind second POST |
| AUD02-T | idempotency key beyond Stripe retention | no blind retry across key retention; proof or operator investigation |
| AUD01-T | payment succeeds after commercial admission deadline | financial fact preserved; Order obligation still accounted for |
| AUD03-T | duplicated/out-of-order webhook and Ordering outage | one semantic financial capture; durable continuation |
| AUD01-T | cancel while Stripe Session open | close new admission; verify known Session and all unknown side effects before release |

**Evidence gate:** documentary contract can be reviewed now; actual Stripe testmode late-post, timeout, idempotency-retention, provider search and unknown-effect tests require a later authorized run. These audit IDs are references to planned test families, not newly executed individual cases. **AUD-P0-01/02 remain OPEN / BLOCKING, with a specified safe fallback that deliberately may hold Inventory indefinitely.**

**Provider references:** https://docs.stripe.com/api/idempotent_requests ; https://docs.stripe.com/api/checkout/sessions/expire ; https://docs.stripe.com/webhooks ; https://docs.stripe.com/checkout/fulfillment
