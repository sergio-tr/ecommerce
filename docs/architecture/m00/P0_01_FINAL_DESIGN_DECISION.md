# AUD-P0-01 — Design Resolution: Financial Dispatch Fencing and Inventory Release

**Owner:** @sergio-tr · **Decision type:** concrete design selection for initial M04 test-mode vertical · **Design recommendation:** ACCEPT / REVIEW REQUIRED · **Provider evidence:** NOT EXECUTED · **Audit:** remains OPEN/BLOCKING until external-effect tests are observed.

## Problem

An Order reserves the final game key. The backend decides to create a Stripe Checkout Session. A worker pauses just before transmitting an HTTP POST. Another worker observes cancellation and a local deadline. If it releases the Reservation, the old worker may later transmit the request, allowing real collection without any stock reserved for the original buyer.

A Mongo version, expired worker lease or canceled CheckoutProcess **does not stop an HTTP request that an old process is still capable of sending**.

## Compared approaches

| Alternative | Evaluation |
|---|---|
| A — release when TTL/lease expires | REJECT: permits paid-without-stock or two buyers for one key |
| B — distributed lock/fencing token only | INSUFFICIENT: only fences systems that re-check it, not already-running network operations |
| C — durable financial effect ledger, closed admission and **fail-closed Inventory retention** until every possible external effect is proven closed | **SELECTED**: preserves safety but can block scarce stock indefinitely |
| D — globally atomic Mongo + Stripe transaction | NOT AVAILABLE: no shared transactional boundary |

## Selected M04 scope reduction

Enable **one commercial Stripe Checkout attempt per Order**, with no automatic second Session or new payment opportunity. This is an *initial feature exposure limit* rather than a repeal of D-06's approved sequential retry policy. AUD-P1-03 dual-window policy remains applicable if successor attempts are later enabled. Distinct legitimately authorized Orders are separate obligations, but idempotent duplicate checkout submissions must map to the original Order.

## Persisted records and authoritative guards

**Ordering:** `Order` and `CheckoutProcess` must exist, containing accepted Quote snapshot, tenant/store, line quantities, Buyer/Guest claim, generation, Reservation identity, commercial closure barrier and required continuation.

**Inventory:** `StockPool`, `Reservation` with capacity, owner identity, version and `RESERVED` / `PAYMENT_PROTECTED` / `COMMITTED` / `RELEASED` semantics (formal FSM still needs independent ratification). Protect before any collectible Stripe POST.

**Payments:** immutable `ExternalOperation` with:
- `operationId`, `attemptId`, `orderId`, `checkoutProcessId`, commercial generation, `reservationId`, `reservationVersion`;
- tenant/store, Stripe account, `livemode=false`, Stripe API version, money/amount, request body hash, idempotency key and policy revision;
- monotonic durable `admissionGeneration`, dispatch-intent state, possible-send evidence, provider `sessionId` and `paymentIntentId` where positively known;
- unique constraint on at most one *potentially collectible* attempt per Order commercial generation, including UNKNOWN attempts.

An existing `ExternalOperation` is never discarded or silently treated as terminal after timeout. A potentially sent operation remains a **permanent historical exposure** that the release proof must explicitly account for.

## Exact protocol

1. Ordering creates Order/CheckoutProcess and immutable accepted snapshot, with a durable intent to reserve.
2. Inventory uses an owner-local conditional transaction to reserve capacity and then protect the original Reservation. An ambiguous acknowledgment is *not* protection proof.
3. Payments validates positive current protection receipt and the accepted Order/generation. In its **own local atomic transaction**, it durably registers the single collectible attempt, immutable outgoing request, unique financial opportunity and dispatch intent.
4. The dispatcher claims one operation. It rechecks the durable closure/admission record before attempting POST. Crucially, even if this check wins, a pause **after** the check is possible; therefore the operation must already be recorded as **MAY_HAVE_BEEN_SENT** *before* external transmission is permitted.
5. A successful HTTP response captures Session ID and actual expiration. An HTTP error or lost response after possible-send stays UNKNOWN. A local timeout, server restart or cancellation never clears this marker.
6. Cancellation atomically seals all **future** admissions for the Order and records a required Payments closure/reconciliation job. Inventory retains `PAYMENT_PROTECTED`.
7. For a **known** Session, Payments verifies latest provider state, expires an open Session if cancellation requires it, and reconciles captured/possibly pending financial facts. Expiration is evidence about that named Session only; it is not proof that an unknown second operation does not exist.
8. For an **UNKNOWN** Session, operator/provider reconciliation must positively resolve every possible dispatch; a negative list/search or missing webhook alone cannot establish absence. Until sufficient proof is present, **hold capacity, deny successor payments, report an incident**.
9. The release protocol requires: (a) Ordering admission barrier sealed, (b) full financial operation inventory by tenant/account/generation, (c) positive negative/neutralized evidence for every potentially sent provider effect, and (d) old workers incapable of issuing an *additional* send (e.g., all relevant processes terminated, then restarted only from durable closed state). The fact that a worker was paused before sending cannot be inferred from a lease. Only then Ordering issues a scoped, versioned release permit that Inventory validates atomically.
10. On any missing proof, return `HELD_FOR_RECONCILIATION` with incident ID and no release. Operator may inspect, expire named Sessions and record evidence but may not overwrite financial facts or force release solely to free stock.

### Important physical nuance

Step 4 is a **conservative classification**, not a magical external fence. A pre-send marker protects the business by preventing premature release; it does **not** prove a Stripe POST happened, or that a stale worker is gone. After processes are known terminated, provider reconciliation still must establish the effect (or inability to resolve); no finite automatic waiting period proves its absence.

## Failure oracle / tests (all PLANNED)

| Ref | Fault injection | Expected authoritative outcome |
|---|---|---|
| AUD01-T01/T07 | Last key Reservation expires while external POST is possible | Inventory remains PAYMENT_PROTECTED |
| AUD01-DT | Worker paused after last DB check; cancellation and stock-release request occur | Release denied; old worker cannot silently trigger a second unsafely released sale |
| AUD01-DT | Worker crashes after setting MAY_HAVE_BEEN_SENT, before actual HTTP | UNKNOWN protected; recover only from provider proof/controlled investigation |
| AUD01-T | Duplicate dispatcher/process restart | Exactly one commercial potentially collectible opportunity; no auto successor |
| AUD01-T | Known open Session cancellation | Expire/reconcile named Session; no release until all earlier possible operations accounted |
| AUD01-T | Positive captured payment appears after local cancellation | Preserve captured fact and Order obligation; no stock release based on earlier local cancel |
| AUD01-T | Stripe account not accessible | Incident with protected capacity; no unsafe guess |

## Declared exit criterion

**Design selection:** concrete safety protocol and availability trade-off are documented here. **Audit closure:** requires review of actual dispatch instrumentation and Stripe test-mode fault evidence, or an explicit audited agreement that the blocking property is satisfied by permanent fail-closed quarantine under all unresolved external effects. Do not label the external-effect neutralization VERIFIED simply because conservative quarantine is specified.

**Next user action:** review this document's choice C, especially acceptance that an UNKNOWN Session may quarantine stock indefinitely. The user can merge documentation after review without enabling real payments or declaring AUD-P0-01 experimentally closed.
