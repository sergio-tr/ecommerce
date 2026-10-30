# AUD-P1-01 / M00.2 — StockPool and Reservation capacity contract

**Status:** REVIEW-READY CONCRETE DESIGN CANDIDATE, not an accepted final D-01-SM FSM or G5 proof. **Owner:** Inventory; findings AUD-P1-01 (#5/SER-122), AUD-P1-06 (#10/SER-127), AUD-P0-01 (#1/SER-118); persistence D-05-MONGO (#9). **Date:** 2026-10-30. Preserve historical D-01 protected-capacity and AUD-P1-01-FSM-POLICY accepted directions.

## 1. Explicit capacity unit and conservation

Within one `(tenantId, stockPoolId, capacityUnit)` and its accounting generation, let:
- `S`: authorized saleable capacity imported/published into that pool, net of **audited** supply adjustments and revocations;
- `A`: available saleable capacity;
- `H`: active held units in `RESERVED` or `PAYMENT_PROTECTED` (count each held unit once);
- `C`: committed sales that consume capacity in this accounting generation;
- `D`: explicitly disabled/not-sellable inventory units that have **not** already been counted as committed or held.

**Candidate invariant:** `S = A + H + C + D`; require each term an integer >= 0 and all transitions preserve the equality. Exact physical query projection must be validated against real imported DigitalLicense supply records and authoritative movement events; **do not add an extra "licensed" count** that represents the same units. A new source/import creates a versioned audited +S/+A adjustment; an invalidated available key moves A→D; consumed licensed key is C, not A again. For physical products use another capacity source implementation through a port, not the digital-key assignment table as the inventory ledger.

For each Store with a granted quota, `quotaUsed = activeHeldByStore + committedByStore` under the configured quota horizon; `quotaUsed <= quotaLimit`. Quota is a **rights cap** over S, not additional StockPool supply. Same-tenant Stores can share one Pool only via an authorized allocation plan; cross-tenant links are denied.

## 2. Aggregate authority and physical boundary

`StockPool` owns the capacity equation and global increments/decrements. `Reservation` owns its own immutable ID, pool/Store/Order/generation association and monotonic capacity commitment state. They may be distinct documents but the local update **must** be performed in one Inventory-owner transaction with versioned CAS and command receipts. Splitting into two documents and updating one at a time is **not acceptable** for admission/release/commit. Separate per-context logical DB and deployment later does not permit Orders or Payments to modify Inventory's collections.

`DigitalLicense` remains Fulfillment-owned: no shared database write is assumed when Inventory commits a Reservation. Reconciliation between capacity supply and unique license count must be explicit and tolerate their separate owners.

## 3. Candidate Reservation transition relation (not a generic payment FSM)

| From | Command/cause | To | Owner-local precondition and evidence | Counter movement |
|---|---|---|---|---|
| none | `Reserve(orderRef,lines,commandId)` | `RESERVED` | actor/store authorized; nonnegative available + quota; same Order generation; unique command hash; CAS success | A -= q, H += q |
| `RESERVED` | `ProtectForPayment(paymentAdmissionRef)` | `PAYMENT_PROTECTED` | owner verifies durable financial possible-send admission/handshake, exact Order/generation/version | A/H unchanged |
| `RESERVED` | `Release(reviewPermit)` | `RELEASED` | expiry only makes eligible for review; positive financial absence proof under release permit, or no possible send was ever admitted with durable evidence; no concurrent protected transition | H -= q, A += q |
| `PAYMENT_PROTECTED` | `Release(financialReleasePermit)` | `RELEASED` | permit covers exact Reservation/generation and **all** possible provider sends, including old delayed dispatch; cannot prove? HOLD/INCIDENT | H -= q, A += q |
| `RESERVED` or `PAYMENT_PROTECTED` | `Commit(commercialEvidence)` | `COMMITTED` | approved Ordering commercial decision and authoritative Payments capture evidence incorporated; command idempotency/version guarded | H -= q, C += q |
| any terminal | retry exact same command | same terminal result | operation receipt proves original result; no extra stock movement | 0 |

**Forbidden:** `RELEASED → RESERVED`, `COMMITTED → RELEASED`, `COMMITTED → RESERVED`; automatically returning a license to saleable stock after Refund or delivery; using Stripe Session expiry, worker lease expiry or a delayed UI read as release evidence. A committed sale that is legitimately reversed in a later commercial process uses **new audited supply/compensation operations**, not retroactive rewriting of a Reservation's committed history.

**Ambiguities to ratify:** whether `RESERVED→COMMITTED` direct path should be exposed in future providerless/zero-price flows (the candidate allows it only with a domain-specific commercial evidence contract); whether `PAYMENT_PROTECTED` must be entered before any Stripe send; and how commercial cancellation is fenced against a commit already in flight. The transition table alone is **not** P0 proof; cross-context permission contracts and tests are required.

## 4. Batch reservation, deduplication and concurrency

- A batch Request includes `tenantId,storeId,orderId,generation,policyVersion,commandId,immutableLineDigest,expectedPoolVersions` and line-by-line required quantity. Normalize multiple lines from same StockPool before applying changes; do not decrement capacity for one line while another fails.
- An Inventory owner-local transaction verifies every pool/quota and creates all Reservation records in that same transaction. First shortage **aborts whole batch** with no partial holds and no "success" projection.
- Unique `(tenant,poolId,orderId,generation,lineKey)` binding where required and unique operation receipt enforce semantic dedupe; a repeated key with a changed line digest is `IDEMPOTENCY_CONFLICT`.
- Two workers for final unit may both have stale reads; only one expected Pool version CAS+owner transaction may commit. After a retryable conflict, reread authoritative Pool and recompute safely. Timeout of unknown commit => readback by immutable operation ID before repeating owner-local action.
- Financial closing barrier cannot change Inventory's balance by simply emitting an eventual event; Inventory applies release only upon validated financial permit. Queued, paused or late provider effects keep H positive.

## 5. What tests must demonstrate (not yet executed)

AUD11-T01..T12 and AUD01-T01..T12, especially last unit, initial review timer vs financial protection, active provider effect past 15 minutes, money unknown after Session expiry, stale release after commit, quota race, idempotent unknown commit and multiline shortage. Additional negative tests: two tenants try same StockPool ID; one Store quota exceeded while global supply remains; duplicate import of DigitalLicense supply; deactivated key counted twice; CAS failed with no hidden Reservation insert. Verify exact counters across crash, not merely expected API 200. Preserve all original IDs and TEST_PLANNED/NOT_RUN until actual execution.

## 6. Evolvability and alternatives

- **Selected starting option:** separate StockPool and Reservation identities with one Inventory-owner Mongo transaction and explicit capacity rights. This supports shared same-tenant quotas and realistic later process extraction.
- **Alternative for one-SKU narrow case:** single-document StockPool+reservations can use Mongo's inherent atomic writes; do not select by default if a Pool may have large unbounded reservations. A migration must preserve operation receipt, capacity balance and record history.
- **Future warehouses/physical inventory:** CapacityPort can later support lot/location/shipping constraints without contaminating the initial digital Order with shipping status; a new specialized Domain adapter must satisfy conservation/last-unit oracle suite.
- **Cost tradeoff:** Conservative indefinite protected reservations may reduce apparent stock availability under unknown Stripe outcomes. This is intentional until positive evidence closes all potential sends; operations must surface an attributable incident rather than silently release.

## 7. Conditions before closing original issue

Owner explicitly reviews and approves this exact proposed capacity/Reservation contract and physically plausible Mongo/index model, cross-checks its invariants against D-01 and C policies, then runs or explicitly schedules the original transactional property/race tests per closure policy. Until exact ratification and execution evidence exist, **AUD-P1-01 remains OPEN** and D-01-SM is still PROPOSED — SELECTED. This document is neither code nor an irrevocable schema.
