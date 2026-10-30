# AUD-P0 Ratifications — Four Open Blocking Findings

**Important distinction:** the architectural direction for each P0 was ratified with reservations; the underlying finding remains OPEN / BLOCKING pending contracts, evidence and edge-case proof.

| Finding | Accepted policy IDs | Blocking proof | Detailed record |
|---|---|---|---|
| AUD-P0-01 | AUD-P0-01-DIR, AUD-P0-01-DISPATCH-POLICY | AUD-P0-01-DISPATCH-NEUTRALIZATION | [Deep dive](../04-audit/AUD-P0-01-deep-dive.md) |
| AUD-P0-02 | AUD-P0-02-RECOVERY-POLICY | AUD-P0-02-PROVIDER-PROOF | [Deep dive](../04-audit/AUD-P0-02-deep-dive.md) |
| AUD-P0-03 | AUD-P0-03-OBLIGATION-POLICY, AUD-P0-03-PROPAGATION | AUD-P0-03-CAPTURE, D-05-MONGO, contracts | [Deep dive](../04-audit/AUD-P0-03-deep-dive.md) |
| AUD-P0-04 | AUD-P0-04-EXCLUSION-POLICY | AUD-P0-04-QUIESCENCE | [Deep dive](../04-audit/AUD-P0-04-deep-dive.md) |

No old-worker lease, local Mongo version change, negative Stripe search, lost HTTP response or process restart is in itself proof a collectible external effect can no longer occur. If proof is unavailable, preserve required Inventory protection and the financial obligation, reconcile and escalate, with named human responsibility. This is a safety guarantee specification, not experimentally VERIFIED execution.

**Planned suites:** AUD01-T01–T12; AUD01-DT01–DT10; AUD02-T01–T16; AUD03-T01–T16; AUD04-T01–T16.

## 2026-10-30 — initial M04 design-resolution review

The user requested the most recommended solutions for all four P0 design blockers for a **local educational Stripe test-mode project**. The selected design recommendations are documented in [P0 final protocols](../architecture/m00/P0_4_DECISIONS_AND_NEXT_STEPS.md):

- **AUD-P0-01:** durable possible-send ledger, single initially allowed collectible opportunity per Order, no stock release unless previously enabled external effects are positively reconciled/neutralized; else protected incident.
- **AUD-P0-02:** immutable provider-correlation records, no blind unknown CreateSession retry beyond idempotency TTL, positive reconciliation, potentially indefinite hold.
- **AUD-P0-03:** Ordering Order+CheckoutProcess original transaction, Payments owner-local Inbox+financial fact+Outbox, Ordering owner-local Inbox+obligation+saga continuation; captured-funds evidence and recovery tests required.
- **AUD-P0-04:** all-line pre-disclosure preparation, possible exposure persisted before sending a secret, strict refund-branch separation, operator incident if exposure/old work may still occur.

These recommendations constitute **specific design selections for review**, not empirical validation, not irreversible operator privilege and not a claim that a stale worker can be fenced by Mongo CAS. The four original audits retain status **OPEN / BLOCKING**, evidence **TEST_PLANNED / NOT_RUN**. This enables a truthful documentation-only review/merge, not declaring M00.1 financial behavior verified. See [structured decision metadata](decision-register.json).
