# AUD-P0-04 — Design Resolution: Exclusive License Disclosure and Non-delivery Refund

**Owner:** @sergio-tr · **Selected:** prepare-all-before-reveal, durable possible-exposure boundary, conservative branch exclusion, fail-closed incident for old external effects · **Finding:** OPEN/BLOCKING pending executed race/effect tests.

## Scenario

The buyer has paid for the last license. Fulfillment assigns key K, then a worker obtains an authorization to reveal K, pauses before returning the HTTP response, and Ordering tries to resolve an allocation failure by refunding the charge. A canceled lease, new Order version or stale application projection cannot prove that the old worker will not reveal K. If Stripe refund is also possibly sent, the two incompatible irreversible effects may both occur.

The agreed D-04-EXCL policy makes ordinary non-delivery full refund and disclosure of that same undelivered obligation mutually exclusive, including **already in-flight effects**. Genuine returns/refunds following completed delivery are a different, future business policy.

## Alternatives

| Choice | Outcome |
|---|---|
| A — Refund when current Order says `FULFILLMENT_EXCEPTION` | REJECT: stale local state can miss an earlier reveal effect |
| B — Use expiring reveal JWT/worker lease alone | REJECT: paused worker could already hold secret or return an old response |
| C — Global Stripe/Mongo/browser atomic transaction | NOT AVAILABLE |
| D — **SELECTED:** all-line preparation, one authoritative commercial resolution branch, durable exposure-possible record before sending any key, refund only when no past/future disclosure may execute; otherwise hold incident | Correctness-first but a lost response after exposure may prevent automatic full refund |

## First-M04 scope and safe simplification

Initially enable one Store, digital key delivery after verified captured funds, and **no automatic non-delivery refund after any key has entered a possibly exposed state**. Refunds are still supported for **provably unexposed** paid failure cases, with a unique Refund operation and signed provider results. Do not implement ordinary partial fulfillment + automatic full refund. Restrict initial multi-line availability if M00.2 all-line preparation has not yet passed its own G3 and tests; explicitly scope this restriction rather than pretending one-line tests prove multi-line correctness.

## Authorities and required durable data

- **Ordering:** `Order` accepted financial obligation, resolution branch/generation and durable authorization to deliver or compensate, references to financial evidence and effect barriers.
- **CheckoutProcess:** required saga steps, pending authorization/ack, incident and retries; no independent authority.
- **Payments:** captured payment, `Refund` plus `RefundAttempt`/external operation identity, provider account/mode, refund status and UNKNOWN send evidence.
- **Inventory:** protected/committed stock, never automatic return of an exposed key to available capacity.
- **Fulfillment:** exclusive `DigitalLicense` assignment, `ExposureOperation` identity, durable authorization and `POTENTIALLY_EXPOSED` evidence, request/claim version, actor and observed delivery acknowledgment (if any).

A browser delivery acknowledgment is **positive evidence** when authenticated and observed, but its absence is **not proof of non-disclosure**.

## Protocol: successful delivery branch

1. Verify Payments captured fact (via Ordering incorporated authenticated evidence), correct tenant/Store/Order snapshot and commercial delivery permission.
2. Atomically reserve/assign a different usable DigitalLicense to every required OrderLine and prepare *all* assigned keys before any secret is exposed. Ensure unique constraints and idempotent assignment IDs.
3. Ordering records a durable delivery branch authorization/generation. Fulfillment validates the exact order/line/actor scope. A stale authorization is rejected **unless key material may already have crossed an irreversible boundary**; an old potential effect cannot be ignored.
4. **Before** allowing a response/stream/browser message containing key material, Fulfillment durably records `ExposureOperation.POTENTIALLY_EXPOSED` with Order/generation/license and actor/claim binding.
5. If response is delivered, append delivery evidence; if response is lost, keep `POTENTIALLY_EXPOSED` and a recoverable incident. Do not recycle license or automatically refund it as certainly undelivered.
6. Buyer can safely re-access the **same already assigned license** through fresh authorization under the delivery branch, not get a second key by a timeout retry.
7. If any line was never safely assigned, and no line can have been exposed, fail before step 4 and evaluate the non-delivery compensation branch.

## Protocol: non-delivery full refund branch

1. Ordering asks Fulfillment to **seal future disclosure admissions** for the Order/generation and return durable evidence for every prior ExposureOperation. A current read-only snapshot is not enough: old admitted operations that could still send keys must be included.
2. If any key was actually or potentially exposed, or a stale worker might still send a previously authorized secret, **do not authorize this branch**; keep protected/committed resources and a commercial incident for investigation.
3. If Fulfillment establishes that no prior exposure was enabled and none can be enabled after sealing, Ordering selects `NON_DELIVERY_REFUND` with a durable versioned authorization, original captured Payment ID and full amount/currency.
4. Payments durably persists one unique refund intent *before* potential Stripe API send, tied to original Charge/PaymentIntent, account/mode and amount. On timeout UNKNOWN, **do not issue another refund**.
5. Provider status is reconciled independently. `Refund.PENDING`, sent, action-required and UNKNOWN do not close the compensation obligation. Only verified succeeded financial result, incorporated into Ordering, can close it.
6. If Stripe refund is unavailable/fails, remain on commercial refund obligation pending reconciliation/escalation; do not reopen the delivery branch just because the refund API timed out.

## Cross-context fence limitation

Neither signed JWT expiry, local Mongo CAS, a Fulfillment worker lease nor an Ordering-only branch transition prevents a worker that already obtained the key and is paused before its network response from revealing it. The conservative solution is to persist possible exposure before transferring the key and never choose a contradictory automatic non-delivery refund while possible exposure exists.

This means **availability and automatic remediation may be incomplete** in an inconclusive case. That is a deliberate educational scope limitation and a safety outcome, not a claim that a browser network effect can be atomically controlled.

## Tests (all TEST_PLANNED)

| Case | Fault/race | Required outcome |
|---|---|---|
| AUD04-T | Two-line Order second key unavailable before preparation | No first key exposed; commercial obligation still open |
| AUD04-T | Two workers assign same key concurrently | Unique index permits only one OrderLine assignment |
| AUD04-T | Fulfillment exposure operation persisted, HTTP response lost | Key remains assigned/potentially exposed; no automatic non-delivery refund |
| AUD04-T | Old reveal worker paused while refund branch requested | Refund authorization blocked if old response may still send key |
| AUD04-T | Refund POST response lost | Refund UNKNOWN; no duplicate CreateRefund |
| AUD04-T | Refund confirmed and Ordering down | Payments keeps fact+Outbox; eventual commercial close once incorporated |
| AUD04-T | Operator tries to override refund while key possibly exposed | Denied unless future independently defined legitimate post-delivery return policy applies |
| AUD04-T | Paid Order cannot assign keys and no exposure was ever enabled | Full original-charge refund may proceed after branch seal, with provider confirmation required |
| AUD04-T | Same original OrderLine revealed twice by authorized buyer | Same key, never allocate a second one |
| AUD04-T | Delivery evidence appears after resolution generation changes | Record contradiction and incident; never delete source facts |

## Resolution and next action

**Chosen design:** option D — conservative exclusive branch protocol. **Missing verification:** simulated and real asynchronous key-response loss, stale worker quiescence and Stripe refund timeout tests; formal review of owner-local atomic persistence and exact exposure authorization contract. This review does not change AUD-P0-04 from OPEN/BLOCKING to VERIFIED. A documentation-only PR may be merged after user review, and actual testing can be performed later in the local implementation phase.
