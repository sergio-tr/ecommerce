# M00 — Order Obligation, Captured Funds, Fulfillment versus Refund

**Status:** RECOMMENDED CONCRETE DESIGN — not executed. Owner @sergio-tr. AUD-P0-03 and AUD-P0-04 remain OPEN/BLOCKING pending effect/proof.

## Authoritative model (DDD)

- **Ordering / Order:** commercial obligation, accepted immutable line snapshot, currency/amount, buyer/tenant/Store and commercial outcome; distinguishes still-owed delivery from compensated non-delivery.
- **Ordering / CheckoutProcess:** durable saga operations, retries, versioned permissions, incorporated fact references and incidents, not financial truth.
- **Payments / PaymentAttempt/Payment/Refund:** verified provider operations, capture/refund statuses, uncertain externally sent requests, provider account/environment and evidence.
- **Inventory / Reservation and StockPool:** capacity, protected hold, commitment/release.
- **Fulfillment / DigitalLicense:** exclusive assignment, prepare/activation of access, authorization and *potential* irreversible disclosure.
- **eGame read model:** shows eventual state with pending/unknown distinction, never grants financial authorization.

No global FSM and no new CommercialObligation/RecoveryCase aggregate.

## Financially binding Order transition

1. Persist durable Order and CheckoutProcess and economic snapshot before the Stripe potentially collectible send. Ordering owner-local handoff must be recoverable across crash.
2. Payments verifies captured funds, not merely initiation or browser completion: correct Stripe account, test/live mode, Charge/PaymentIntent and Session correlation, expected amount/currency and actual capture/paid condition. Proposed initial payment setting: **automatic capture**, hosted card + 3DS, delayed methods disabled; provider-effective validation remains pending.
3. Payments atomically persists the authoritative financial fact and an Outbox entry under Payments' local transaction boundary.
4. Ordering Inbox deduplicates event and semantic financial operation separately, conditionally incorporates into the correct Order/generation and persists CheckoutProcess continuation under an Ordering-local atomic transaction.
5. If a fact arrives after an Order cancellation or due to stale generation, do not overwrite the provider fact; record a contradiction and enter commercial resolution/investigation preserving capacity. Never drop captured money as orphan.

`PENDING_PAYMENT` does not prove no charge. `PAID_AWAITING_ALLOCATION` is a valid outstanding delivery obligation. `PAYMENT_CONFIRMED` on CheckoutProcess means *incorporated authenticated financial evidence*. `Refund.PENDING` is a financial operation, not completed commercial compensation.

## Mutually exclusive commercial branches and effects

The normal paths are:
- Delivery branch: validated capture => protected capacity commitment => prepare all OrderLines => exclusively assign candidate DigitalLicenses => authorize disclosure => record potential exposure conservatively, making automatic non-delivery-full-refund inappropriate.
- Non-delivery compensation: prove **no** previous or still executable license disclosure; select full refund against original captured payment with a durable versioned commercial authorization; Payments issues exactly one durable refund attempt and reconciles an UNKNOWN response before any second refund; commercial resolution only after verified refund completion.

**Barrier design:** Ordering records resolution-generation and branch choice; Fulfillment must receive an authoritative, conditional authorization that remains valid at moment a disclosure effect can be created, not an unbounded old capability. It must durably capture possible irreversible exposure *before* sending key material to any client. If an earlier in-flight disclosure may have reached a buyer, quiescence is NOT provable solely from no response/client ACK. Mark delivery possibly occurred and enter incident—not automatic full non-delivery refund. A refund attempt potentially sent similarly prevents incompatible delivery selection until independently reconciled.

The safe stop rule is stronger than liveness: if cross-context effect quiescence cannot be shown, do not send the alternative irreversible operation. Escalate without inventing an operator bypass.

## Multi-line all-or-nothing

For any enabled multiline purchase:
- Prepare sufficient exclusive DigitalLicenses for **every** OrderLine before enabling any reveal.
- Atomic within Fulfillment where feasible: unique constrained allocation for every line, idempotent retries and rollback of unexposed partial preparation.
- Never claim a global atomic reveal across independent HTTP responses. If one key is potentially exposed and another line fails, record exceptional partial-effect incident and use explicit manual commercial remediation; do not assert all-or-nothing externally achieved.
- A refund after genuine delivery is an independent post-delivery return policy, not automatically prohibited and **not approved here**.

## Captured/Refund facts and recovery matrix

| Failure or race | Mandatory durable behavior |
|---|---|
| HTTP timeout after CreateRefund | Refund attempt UNKNOWN; same original payment/account/amount; reconcile actual Refund, do not blindly duplicate |
| Refund confirmed but Ordering Inbox delayed | Payments financial fact persists; replay Outbox until Order compensation incorporated |
| Old key disclosure grant exists when refund starts | deny refund branch until effect quiescence proven; if not provable, incident |
| Paid Order but Inventory unavailable | outstanding delivery obligation and safe incident/compensation branch; never delete paid record |
| Return-page says success but Payment uncaptured | display pending/verification, no key disclosure |
| Crash after assigning unique key but before preparing access | assignment remains unique; idempotent recovery by stable OrderLine |

## Tests, specification authority and gate

Original AUD03-T01..16 and AUD04-T01..16 remain TEST_PLANNED. Add positive and adversarial oracles for cross-account capture, lost response to key reveal, stale branch worker, already-refunded charge, mid-commit crash and multikey race to the existing cases during source-fidelity reconciliation.

**Stop:** cannot claim AUD-P0-03/04 VERIFIED without actual fault injection and effective provider/driver evidence. The safe UNKNOWN/incident state is a valid designed outcome, not evidence of economic completion.

Provider reference: https://docs.stripe.com/api/refunds/create ; https://docs.stripe.com/checkout/fulfillment
