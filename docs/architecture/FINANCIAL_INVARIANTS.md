# CommerceCore — Financial and Commercial Invariants

**Status:** normative only where linked to an ACCEPTED policy. Physical guards and provider proofs are not yet accepted. **Source:** D-01–D-07, AUD-P0-01..04 and AUD-P1-01..02 ratifications.

## Authority and commercial identity

- FIN-001 — Every financial opportunity is attributable to one immutable tenant, store, checkout, pre-existing order, commercial generation, accepted price snapshot and Stripe account/environment. A browser-provided Stripe URL or metadata is correlation, not authorization.
- FIN-002 — Ordering is authoritative for Order, the accepted snapshot, commercial obligation, resolution and fulfillment incorporation; Payments is authoritative for Payment, PaymentAttempt, Refund, provider operations and evidence.
- FIN-003 — CheckoutProcess, within Ordering, owns only durable coordination, pending work, incorporated results, idempotency and recovery. It cannot independently assert or negate provider payment.
- FIN-004 — Inventory exclusively owns the StockPool balance, Reservation protection, capacity commitment and release. Fulfillment exclusively owns DigitalLicense allocation, access and disclosure.
- FIN-005 — A stale read model, browser navigation, unverified webhook or timeout cannot authorize new charges, release capacity, deliver keys, select a refund or close an obligation.
- FIN-006 — The Order and its immutable accepted economic snapshot must be durably established before an external potentially collectible operation is enabled. Order existence does not imply financial capture or unconditional entitlement to delivery.

## Reservation and financial exposure

- FIN-010 — The initial 15-minute reservation window is a deadline for commencing checkout, not the absolute payment or safe-release deadline.
- FIN-011 — Inventory must confirm durable PAYMENT_PROTECTED-equivalent capacity protection before Payments enables an externally collectible Checkout Session operation.
- FIN-012 — The race between expiring an unprotected Reservation and protecting it financially must be resolved atomically by the Inventory authority. No admission based on a subsequently released capacity.
- FIN-013 — Once Stripe operation admission has been enabled, it remains potentially executable until neutralization or all possible external effects are proved terminal. A lease, a timeout, a local version increment or a worker restart is not sufficient proof.
- FIN-014 — Payments is the exclusive financial admission authority per obligation and commercial generation; durable conditional idempotent gates prevent incompatible opportunities from being admitted together.
- FIN-015 — A monotonic financial closing barrier prevents new admissions for the sealed generation but does not cancel previously dispatched, enabled or in-flight HTTP requests.
- FIN-016 — No capacity release while any prior operation is still potentially collectible, unknown, pending, inconsistently correlated or possibly executable.
- FIN-017 — Payments may issue a durable final release authorization only after the admission barrier and prior exposure have been closed with sufficient evidence. The authorization must bind tenant, store, Order, checkout, generation, Reservation identity, versions, original financial obligation and idempotency key.
- FIN-018 — Inventory conditionally and atomically applies that authorization, rejecting stale, duplicated, cross-scope or incompatible commands.
- FIN-019 — Releasing a Reservation is terminal. A new legitimate purchase or new generation must re-acquire capacity; an old PaymentAttempt cannot resurrect a released hold.
- FIN-020 — The Reservation COMMITTED state means commercial capacity was committed, not that the unique DigitalLicense was allocated, displayed or redeemed.
- FIN-021 — Redis caches and projections are not sources of financial truth or authoritative stock capacity.
- FIN-022 — A refunded charge never automatically reopens a committed reservation or makes a potentially disclosed key reusable.

## Provider operations and recovery

- FIN-030 — Before enabling each potentially collectible external POST, Payments durably persists the stable operation ID, exact idempotency identity, immutable request parameters/fingerprint, account/environment/API version and all required commercial correlations.
- FIN-031 — Distinguish preparation, authorization, possible HTTP dispatch, unknown response, positively identified external object, reconciled financial effect and proven neutralization. These are conceptual safety situations, not six automatically accepted domain FSM states.
- FIN-032 — A lost HTTP response does not establish that Stripe rejected a POST, nor does an unknown Mongo write commit prove non-persistence.
- FIN-033 — Stripe idempotency can deduplicate an original request while its key is retained, but retrying a POST can create the previously nonexistent Session and keys may be removed later; idempotency is not a read-only lookup.
- FIN-034 — client_reference_id, Session metadata and PaymentIntent metadata are useful correlation values but cannot alone prove uniqueness, buyer ownership, or nonexistence. Searches and webhook absence are not reliable negative existence proof without a provider-backed guarantee.
- FIN-035 — Recovery must separately prove object identification, financial state resolution, and that no late original dispatch can create an additional collectible opportunity. Proving the first two alone is insufficient.
- FIN-036 — Stripe account, test/live environment, tenant/store, expected amount/currency and operation identity are checked before accepting external evidence.
- FIN-037 — If neutralization or sufficient proof is unavailable: keep the case durable, retain required protected inventory, prevent incompatible effects and escalate to an accountable investigator. Safety takes precedence over bounded progress, but prolonged exposure requires observability and operational ownership.
- FIN-038 — An immutable absolute expires_at as an anti-late-dispatch window is only a pending provider hypothesis, not accepted proof of nonexistence or a replacement for reconciliation.
- FIN-039 — All routes that might create successor Sessions, including any Stripe after_expiration.recovery configuration, must respect current CommerceCore financial authorization. Specific provider configuration remains to be evaluated.

## Payment attempts, cancellation and settlement

- FIN-040 — PaymentAttempt represents a commercial hosted checkout opportunity. HTTP retries, another card in the same Session, and 3DS steps do not create new commercial attempts.
- FIN-041 — A subsequent PaymentAttempt requires a verified negative financial AND operational closure of the prior opportunity, a preserved snapshot, eligible Order and still-protected original Reservation. Two Sessions is only a proposed starting maximum.
- FIN-042 — Explicit authorized commercial cancellation must be recorded durably and must prevent new incompatible admissions; closing a tab, cancel_url navigation and browser redirects are not cancellation commands.
- FIN-043 — Payments requests early expiry of an open Session when appropriate; a complete Session may still require settlement reconciliation and cannot be treated as normally expirable.
- FIN-044 — Session expiry or checkout.session.expired alone is not permission to release Inventory if another unknown/enabled operation could charge.
- FIN-045 — A confirmed provider charge is a financial historical fact even if it arrives after cancellation, deadline, or a conflicting stale projection. It must become an incorporated commercial obligation or a durable exception; it must not be erased or misattributed.
- FIN-046 — Distinguish authorization, requires_capture, processing, captured funds and payment confirmation. Exact capture policy is PENDING; requires_capture is not equivalent to capture.
- FIN-047 — An expired commercial retry window can stop **new admissions** but does not automatically terminate a previously authorized Stripe Session or release capacity. The suggested relative+absolute double window in AUD-P1-03 is NOT RATIFIED.

## Fulfillment and refund

- FIN-050 — Full financial confirmation establishes a commercial resolution duty; a timeout against Inventory does not prove that capacity commitment failed.
- FIN-051 — Fulfillment first reconciles the initial commitment and searches only legitimate equivalent capacity. If a fully undelivered order cannot be fulfilled after justified bounded recovery, Ordering may authorize a full refund to the original financial source.
- FIN-052 — A partial or potentially irreversible license disclosure is not ordinary full-refund eligibility. It requires incident investigation and controlled exceptional resolution.
- FIN-053 — Ordering makes the exclusive decision between incompatible fulfillment and failure-compensation refund branches, but cannot safely switch while a previously authorized disclosure/refund can still execute.
- FIN-054 — A license assigned to an Order is not necessarily disclosed. Once plaintext or access enabling disclosure could have left the trusted boundary, lack of a read ACK is not proof of non-delivery.
- FIN-055 — Attempt full multi-line allocation/preparation before exposing any line, but do not claim atomic disclosure of all lines without evidence. M00.2 specifies the irreversibility boundary.
- FIN-056 — Refund authorized is not refund executed; CreateRefund timeout is unknown, Stripe pending is not refunded, and succeeded must be preserved with historical charge data. Never create a second refund solely because a response was lost.
- FIN-057 — Refunds after legitimately completed delivery for law, returns or support are a **separate future policy**; D-04-EXCL does not universally prohibit or automatically authorize them.
- FIN-058 — Operator intervention cannot change an unknown financial result into a known negative outcome simply by editing a state field.

## Durability, messages and observable proof

- FIN-060 — Stripe webhook authenticity verification precedes acceptance; preserve minimum recoverable inbox evidence durably before returning 2xx.
- FIN-061 — Within Payments, the authoritative financial result and mandatory outbound work are locally atomic; within Ordering, commercial incorporation and mandatory saga continuation are locally atomic. D-05-MONGO must later specify the physical mechanism.
- FIN-062 — At-least-once delivery and deduplication are expected. Deduplicate by semantic underlying charge/refund and business effect, not only by event ID or transport delivery ID.
- FIN-063 — Acknowledging a webhook or message does not prove Order payment incorporation, Inventory commitment, DigitalLicense disclosure or completed refund.
- FIN-064 — Detect and reconcile missing financial propagation independently of webhook availability; Stripe cannot participate in a MongoDB distributed transaction.
- FIN-065 — No physically enforced global exactly-once guarantee, high-availability claim or late-dispatch neutralization proof is established by this design alone. Tests remain planned.

## Unresolved gate matrix

| Gate | Unresolved requirement |
|---|---|
| AUD-P0-01-DISPATCH-NEUTRALIZATION | Closing old external HTTP sends safely |
| AUD-P0-02-PROVIDER-PROOF | Reconciliation and negative proof when Session ID is unknown |
| AUD-P0-03-CAPTURE and D-05-MONGO | Capture semantics and local durable propagation |
| AUD-P0-04-QUIESCENCE | Preventing old irreversible disclosure/refund effects |
| D-01-SM; AUD-P1-02-FSM-MIN | Final aggregate state machines and guards |
| D-06-RETRY-WINDOW; AUD-P1-03 | Commercial retry window and anti-hoarding parameters |

No row above is VERIFIED merely because it has a written statement.
