# Wave 1 — Controlled Approval Record (2026-10-21)

**Source:** explicit user ratification following draft PR #17. **Accountable owner:** @sergio-tr. **Authority:** scoped planning governance only. **Implementation:** NOT AUTHORIZED. **M00.1:** OPEN; AUD-P0-01..04 OPEN / BLOCKING.

| Decision ID | Outcome | Precisely approved | Explicit limits |
|---|---|---|---|
| W1-AP-01 | ACCEPTED — FUNCTIONAL SCOPE DIRECTION | First M04 target is a bounded but complete recoverable eGame digital-license purchase: catalog, quote, cart, Order, Inventory protection, Stripe test-mode payment, financial proof, unique license, authorized disclosure, cancellation, refund and exception recovery | Does not ratify every CAP row, technical contracts, Stripe capture mode or implementation; P0 blockers intact |
| W1-AP-02 | ACCEPTED — M00–M09 TAXONOMY; M00.5 NOT APPROVED | Retain historical M00–M09 hierarchy | M00.5 requires proven necessity beyond existing M00 structures and G0–G6; no separate milestone created |
| W1-AP-03 | ACCEPTED — HISTORICAL ID PRESERVATION | Canonical historical and scoped IDs remain stable; CAP/PLAN IDs provisional | No duplicate work items or automatic promotion to accepted requirements/ADRs |
| W1-AP-04 | ACCEPTED WITH CONDITIONS — READINESS GOVERNANCE | G0–G6 recognized as planning gates | Individual acceptance criteria and evidence must be objective and inspectable; no planned test is VERIFIED |
| W1-AP-05 | ACCEPTED — SOURCE RECONCILIATION PRIORITIES | Reconcile original R1 versus ratifications; preserve conditions; reconcile 110 test cases, documentation discrepancies, and provenance | Acceptance of audit work does not imply successful source validation |

## Interpretation of W1-AP-01

M04 may be planned around **one eGame Store** and a complete digitally fulfilled test-mode purchase. No full multi-store administration, automatic delayed payment methods, complex promotions, production tax system or live monetary flows were approved. Underlying tenant isolation, correctness, cancellation/refund reconciliation and safe exception operations remain compulsory.

[Capability-level scope matrix](M04_SCOPE_MATRIX.md): 73 INCLUDED (including prerequisites), 30 EXCLUDED from M04, 8 DEFERRED and 29 UNRESOLVED. These row-level categories are an **auditable derivation for review**, not 140 individually ratified feature commitments. Three composite capability entries require refinement.

## M00.5 burden of proof

The original W1-AP-02 proposal added M00.5 as a readiness checkpoint. The user declined automatic addition. Its suggested functions — baseline verification, scope ratification, G2 architecture review, G3 specification readiness, G4 implementation permission — **can currently be represented by existing M00.1–M00.4 and cross-cutting G0–G6**, so no independent M00.5 justification has been demonstrated. Status: NOT APPROVED / REMOVED FROM CURRENT NORMATIVE MILESTONE STRUCTURE. It may be reconsidered only after a documented irreducible scheduling or governance requirement is shown.

## Unchanged scopes and restrictions

- D-01 through D-07 primary policies ACCEPTED with all original reservations; no subordinate financial details upgraded.
- All 181 R0.x historical decision statuses and all prior scoped decision states preserved.
- AUD-P0-01..04 stay OPEN / BLOCKING; AUD-P1-03 commercial double window remains NOT RATIFIED.
- No physical MongoDB schema, License reveal authorization design, Stripe-provider negative proof or global transaction is approved.
- No implementation issues, code, infrastructure, test execution, Slack publication or merge are authorized by these approvals.

## Traceability

Existing issue source: GitHub #14 / Linear SER-131 for source recovery. PR #17 is a draft documentation review; no new tracker issue is needed for these decisions. Scope/gates are recorded here and will be reconciled to the canonical decision ledger only through an explicit approved documentation change; these entries do not mutate the existing 83 scoped records.

## Next individual decisions

The original five Wave 1 governance directions above have been addressed. The next individual ratification is the exact M04 scope of 29 UNRESOLVED capabilities and three mixed-scope entries; then AUD-P1-03 remains the next historical unratified architecture review. No automatic transition into implementation.
