# AUD-P2-01 / SER-128 — Exact domain and provider vocabulary contract

**Status:** REVIEW-READY SPECIFICATION, NOT ACCEPTED OR VERIFIED. **As of:** 2026-10-30. **Owner:** @sergio-tr. **Original:** GitHub #11, Linear SER-128. This is a proposed controlled vocabulary for documentation, ports and schemas; no renaming/migration has been authorized. Existing accepted ownership policies D-01..D-07 and C-01..C-08 override any conflicting detail.

## Context-owned concepts: one source of authoritative facts

| Concept | Authoritative owner | Identity and lifetime | What the concept establishes | Does **not** establish |
|---|---|---|---|---|
| `Order` | Ordering | `tenantId/storeId/orderId` permanent | Accepted immutable Quote snapshot, commercial obligation, durable resolution and paid/fulfilled incorporation | Stripe charge existence/absence |
| `CheckoutProcess` | Ordering | `orderId/processId/generation` durable | Outstanding saga work, accepted effects, incorporated results and repair actions | Independent payment/stock or delivery truth |
| `PaymentAttempt` | Payments | `attemptId/orderId/generation/account/mode` durable | One authorized commercial attempt; may have an unknown provider Session outcome | Money captured or ability to safely start a successor |
| `ProviderOperation` | Payments | `operationId/account/mode/apiVersion/key/hash` durable | An exact possible network send and all returned provider evidence, including a send whose result is unknown | Safe absence of a side effect after timeout/lease |
| `StripeCheckoutSession` | Provider; observed in Payments | `providerSessionId/account/mode`; may be unknown | Hosted opportunity and observed Session state/expiration | Final captured funds, universally absent future POST |
| `PaymentIntent` / `Charge` | Provider; observed in Payments | Provider-scoped IDs | Provider payment lifecycle/capture, subject to verified amount/account state | Order commercial delivery decision |
| `Payment` | Payments | `paymentId`, provider fact lineage | Durable financial history including captured and later refunded/disputed amount | License allocation, no remaining obligation |
| `Refund` | Payments | `refundId/paymentId/providerRefundId?` | Explicit attempted or proven financial reversal; `PENDING/UNKNOWN` distinct from `CONFIRMED` | Automatic commercial compensation completed until provider confirmed |
| `StockPool` | Inventory | `tenantId/poolId` | Authorized pool capacity and conservation | Licensed key identity or Stripe provider fact |
| `Reservation` | Inventory | `reservationId/poolId/orderId/generation` | Protected/committed capacity with release permitting | Financial settlement or secret disclosure |
| `DigitalLicense` | Fulfillment | `tenantId/licenseId/orderLineId?` | Unique secret assignment, access preparation, possible exposure | Automatic right to issue/refund another payment |
| `StorePolicySnapshot` | CommerceCloud provision; consumed in Core | `tenantId/storeId/version` | Versioned configuration and policy chosen for Quote/Order | Retroactive mutation of an accepted Order |

**CommercialObligation** is a domain notion owned by `Order`, not a duplicate financial ledger or new aggregate. **ReadModel** is a projection with freshness/version; never a command authorization. **EvidenceRef** points to an immutable owner-scoped attestation, not to sensitive plaintext or browser redirect.

## Four independent axes required in documentation

1. **Provider observation**: Session open/complete/expired; Intent requires_capture/processing/succeeded; Charge captured; Refund pending/succeeded/failed. These observations have account/mode/API-version provenance and observation time.
2. **Owner authoritative fact**: Payments persisted captured/refund ledger, Inventory protected balance, Fulfillment possible exposure, Ordering accepted commercial resolution.
3. **Local coordinator incorporation**: CheckoutProcess has durably processed a payment or inventory event; it may lag behind the owner's fact.
4. **UI/read projection**: bounded-staleness view may show pending after real funds were captured, and must never independently authorize economic effects.

Only named owner commands can transform owner facts. Cross-context propagation is at least once and idempotent with captured payload hash, tenant, account and generation validation.

## Examples of forbidden equivalence

- `Order.PENDING_PAYMENT` != provider has not charged.
- `CheckoutProcess.PAYMENT_CONFIRMED` != CheckoutProcess captured/settled money; it incorporated Payments' captured fact.
- `StripeCheckoutSession.complete` != automatically confirmed captured funds (the actual payment and capture contract must be checked).
- `Order.PAID_AWAITING_ALLOCATION` != allocation complete or refund granted.
- `Refund.PENDING` != buyer compensated.
- `Reservation.RELEASED` != customer lost a captured payment; release must have prior financial permit.
- `DigitalLicense.POSSIBLE_DISCLOSURE` != client definitely received the secret, **nor** proof of non-disclosure.
- `WebhookDelivered` != Ordering incorporated the event; durable Inbox/Outbox boundaries matter.
- `HTTP_TIMEOUT` != external effect failure.
- `StoreId` in request URL != authenticated tenant/store authorization.

## Type-level error and version rules (proposed)

- Disallow naked `isPaid(): boolean` across contexts. Prefer `Payments.CapturedFundsFact` with explicit currency/amount/scope/provenance/version and `Ordering.IncorporatedPaymentRef` as distinct types.
- `UnknownExternalOutcome`, `PendingLocalIncorporation`, and `StaleProjection` require three distinct typed results. Do not map all of them to generic `PENDING`.
- Tenant-qualified IDs must not be implicitly interchangeable; method arguments contain `TenantRef + StoreRef`, actor/resource authorization, command schema version and owner version.
- Rename/merge must be an explicit versioned contract migration with backward-compatible alias mapping and consumer impact analysis; never silently reuse old event names with changed meaning.
- Logging/events only contain redacted references, never plaintext keys, guest bearer capabilities or payment secrets.

## Contract/static review cases

| ID | Scenario | Expected documentation/API result |
|---|---|---|
| VOC-01 | Reader equates Order pending to Stripe unpaid | Reject interpretation; show independent provider/owner/coordinator views |
| VOC-02 | CheckoutProcess exposes PaymentAmount as provider authority | Reject duplicate truth; require Payments event/evidence reference |
| VOC-03 | Refund pending used to mark compensated | Reject terminal state; show pending/unknown refund operation |
| VOC-04 | Duplicate webhook arrives after Ordering recovered | One Inbox incorporation, Payments capture fact preserved |
| VOC-05 | Stale projection authorizes release/refund/disclose | Reject side effect, recheck owner state/version and authorization |
| VOC-06 | Wrong account/tenant provider event arrives | Reject attribution and preserve forensic record without cross-store write |
| VOC-07 | Provider success and money still requires_capture | Do not claim captured funds or start fulfillment |
| VOC-08 | Loss of disclosure response | Retain POSSIBLE_DISCLOSURE, do not return key to available inventory |

All cases are **SPECIFIED / NOT_RUN**. They are suggested **static contract reviews and future tests**, not additional original 148 test IDs.

## Deferred design decisions and safe evolution

Do not invent a global CheckoutStatus aggregate, synchronous two-phase commit across owner contexts, or Stripe enum as the Order FSM. Additional payment methods, partial captures, Connect accounts, shipping and multi-currency conversions may introduce **new** provider observations and capability types without changing authoritative existing historical facts.

**Closure rule for issue #11:** after owner accepts this exact vocabulary and representative typed usage, review naming against current domain/API schema, record accepted exact scoped decision (not a blanket audit promotion), update the original source/audit record with approved scope and attach static conformance results. Until that owner decision, **AUD-P2-01 remains OPEN** and Linear SER-128 In Review. This is documentary G3 work; future runtime evidence follows G5.
