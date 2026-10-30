# Current CommerceCore definition state — 2026-10-13

**Accountable owner:** @sergio-tr. **Project:** CommerceCore headless engine, CommerceCloud SaaS Control Plane and eGame license-based first consumer. **Current authorization:** architecture documentation/planning only; no implementation, prototype, infrastructure, live payments or deployment.

## Historical record

- 181 original decisions in R0.1..R0.10 (26 ACCEPTED; 155 PROPOSED — SELECTED).
- 79 previously registered scoped decisions and audit findings, with their original exact statuses preserved.
- Four additional explicit governance policies GOV-001..004 accepted (English only, feature/bugfix branches + PR, conventional commits without co-author credits, ownership @sergio-tr).
- M00.1-R1 original document is now available as a separate PROPOSED source. M00.1-R2 has **not** been consolidated or ratified.

## Accepted core policies

D-01 financial reservation protection; D-02 versioned Stripe Session expiration; D-03 initial cards and 3DS; D-04 preserve paid obligations and safe recovery/full refund; D-05 durable pre-Stripe operations, Inbox/Outbox/saga recovery; D-06 exclusive sequential commercial PaymentAttempts; D-07 explicit authorized cancellation with Stripe expiry/reconciliation.

## Audit states

| Finding | State | Blocking or next review |
|---|---|---|
| AUD-P0-01 | OPEN / BLOCKING | Previous Stripe HTTP dispatches may resume after local close; neutralization proof absent |
| AUD-P0-02 | OPEN / BLOCKING | Unknown provider Session ID recovery and negative evidence not universally proved |
| AUD-P0-03 | OPEN / BLOCKING | Order/payment propagation and captured-funds semantics need contract/physical guards |
| AUD-P0-04 | OPEN / BLOCKING | Quiescence of already authorized license disclosure and Refund external effects |
| AUD-P1-01 | OPEN | Reservation four-state model candidate, StockPool conservation/atomicity pending M00.2 |
| AUD-P1-02 | OPEN | Ownership policy accepted; concrete minimal CheckoutProcess FSM PENDING |
| AUD-P1-03 | OPEN / NOT RATIFIED | Two-window commercial retry policy only proposed, no user ratification |
| AUD-P1-04..06 | OPEN | Connect/capture, Mongo durability and multi-line guarantees |
| AUD-P2-01..03 | OPEN | Vocabulary, duration/attempt parameters and evidence traceability |

## Experiments

148 identifiers in earlier catalog, TEST_PLANNED, zero VERIFIED. D05/D06/D07 source experiments are available in uploaded documents; any imprecise test title must be reconciled against those sources, not invented. Many provider-specific tests require Stripe test mode; no tests have actually been run in this baseline.

## Next controlled decision

AUD-P1-03 is the immediate unratified review; after explicit acceptance or alteration, continue with the next **real** audit ID. The documentation recovery project is SER-131 and GitHub Issue #14, on feature/ser-131-architecture-knowledge-baseline-en. None of this closes M00.1 or approves M00.1-R2.

## Addendum — Wave 1 approval and validation (2026-10-21)

The above 2026-10-13 snapshot is historically retained; the following later planning ratifications **do not change original financial decision status**. W1-AP-01 accepted a bounded complete recoverable eGame digital-license purchase target for M04, not implementation authorization. W1-AP-02 retained M00–M09 and expressly withheld approval of M00.5. W1-AP-03 approved stable historical IDs and provisional-only CAP/PLAN identifiers; W1-AP-04 accepted G0–G6 with objective evidence criteria; W1-AP-05 approved R1, ratification and test-fidelity reconciliation priorities.

[Wave 1 validation report](../planning/wave1/VALIDATION_REPORT.md) found 140 unique capabilities with broad source provenance, 103 work questions with 14 candidate overlaps, and five hard-dependency cycles since corrected into co-design links. [M04 scope matrix](../planning/wave1/M04_SCOPE_MATRIX.md) currently classifies 73 INCLUDED (including prerequisites), 30 EXCLUDED, 8 DEFERRED and 29 UNRESOLVED; these per-row interpretations are not 140 separately ratified product requirements. Of 148 TEST_PLANNED, 110 require source-table fidelity review. G0/G1 PARTIAL, G3 BLOCKED, G4/G6 NOT AUTHORIZED, G5 NOT VERIFIED. Original AUD-P0-01..04 remain OPEN / BLOCKING. Draft PR #17 is not merged.

Next original architecture decision awaiting separate approval remains AUD-P1-03; Wave 2 documentation also includes financial/inventory/identity/provider contracts and source-fidelity work. Source-recovery parent remains GitHub #14 / Linear SER-131, with no new implementation tickets.
