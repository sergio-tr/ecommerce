# AUD-P1 Ratifications and Unapproved Proposal

## AUD-P1-01 — Inventory capacity FSM (OPEN)
AUD-P1-01-FSM-POLICY ACCEPTED: four-state D-01-SM as a **candidate**. D-01-SM remains PROPOSED — SELECTED; final guards, capacity conservation and StockPool/Reservation aggregate boundary remain M00.2 pending. [Detailed analysis](../04-audit/AUD-P1-01-reservation-fsm.md). AUD11-T01–T12 TEST_PLANNED.

## AUD-P1-02 — Authority and durable saga (OPEN)
AUD-P1-02-OWNERSHIP-POLICY and AUD-P1-02-COORDINATION-POLICY ACCEPTED: Order owns accepted commercial snapshot/obligation; CheckoutProcess owns saga progress; Payments owns provider facts/Payment/Attempt/Refund. The concrete AUD-P1-02-FSM-MIN is **PENDING**, expressly corrected by Sergio, not PROPOSED — SELECTED. [Detailed analysis](../04-audit/AUD-P1-02-authority-and-coordination.md). AUD12-T01–T12 TEST_PLANNED.

## AUD-P1-03 — Retry request windows (OPEN, NOT RATIFIED)
Double commercial admission deadline (relative post-negative + absolute checkout window) is a candidate presented for review; Sergio has not ratified it. It must never permit time-based release of unknown payments. [Candidate analysis](../04-audit/AUD-P1-03-retry-windows-proposal.md). AUD13-T01–T16 are only proposed tests. D-06-RETRY-WINDOW and exact window values remain PENDING.

## Remaining P1 issues
AUD-P1-04 actual Stripe Connect charge/capture and payment-method enforcement. AUD-P1-05 Mongo transaction/document/durability and worker crash guarantees. AUD-P1-06 multi-line capacity, exclusive license assignment and preparation before any irreversible disclosure.

All statuses are maintained in [the exact scoped register](decision-register.json). Nothing in this index closes M00.1.
