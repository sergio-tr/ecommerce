# Wave 1 — First Decisions Requiring User Approval

**Artifact:** W1-AP-001. **All items remain UNRATIFIED.** Owner: @sergio-tr. This packet requests product-scope and governance choices only; it does not approve implementation, infrastructure, Stripe algorithms or new domain aggregates.

## W1-AP-01 — Bound the first M04 vertical slice

**A (recommended candidate):** One eGame Store, one safe Stripe test-mode purchase journey with published Product/Variant/Offer, exact Quote snapshot, durable guest Cart and Order, protected StockPool/Reservation, card+3DS hosted Checkout, Payments reconciliation and Inbox/Outbox, idempotent Order incorporation, Inventory commit, exclusive encrypted digital-key allocation, authorized guest claim and controlled key reveal, safe refund/exception handling and minimum required buyer/operator visibility.

**B:** Include broad tenant self-service provisioning, complete store-admin dashboards, multiple active stores and shared quotas, advanced discovery/theme/localization, cart account merging and notifications in the very first vertical.

**Recommendation:** candidate A for initial M04 scope, with security and tenant isolation intact. It does **not** waive AUD-P0-01..04, Mongo durability, Connect account choice, the real license exposure frontier or operational incident controls. Store-administration and notification inclusion must be scoped explicitly rather than guessed.

**Approval consequence:** classifies CAP records into M04 IN_SCOPE / OUT_OF_SCOPE / DEFERRED, enabling buyer/admin journeys and contract planning; it does **not** create implementation-ready tasks or authorize code.

## W1-AP-02 — Milestone and gate taxonomy

**A (recommended):** Keep historical M00–M09; explicitly identify M00.1 finance, M00.2 Inventory/Fulfillment, M00.3 Identity/Guest, M00.4 context contracts. Add M00.5 as a **new proposed documentary-readiness checkpoint** (not a historical accepted phase), preceding future implementation authorization. M01 platform foundations; M02 tenant/identity; M03 catalog/pricing; M04 purchase; M05 messaging; M06 distribution/reuse; M07 extraction; M08 infrastructure; M09 full verification.

**B:** Do not introduce M00.5; use the G0–G4 gate inside M00.4.

**Approval consequence:** stable parent hierarchy/dependency deadlines, not calendar commitments or approval of all historical technology candidates.

## W1-AP-03 — Scope and decision-identifier policy

**Recommended:** Keep the 181 historical selections, original source D/AUD IDs and the 83 scoped records unchanged. CAP-* and PLAN-DEC-* are provisional Wave 1 inventory keys. After deduplicating the 32 historical ARC candidates and R1 definitions, allocate canonical REQ/ADR/SPEC IDs as needed, without renaming historical source IDs. Add independent per-milestone scope status IN_SCOPE / OUT_OF_SCOPE / DEFERRED / EXPERIMENT_ONLY, distinct from accepted/proposed audit/test states.

**Approval consequence:** unambiguous traceability and resistance to accidentally treating a proposed capability as approved.

## W1-AP-04 — Objective readiness gates

**Recommended:** Formally adopt G0 source accuracy, G1 approved release feature scope, G2 scoped ADR ratification, G3 complete contracts/guards, G4 separately authorized atomic implementation issue, G5 actual executed verification and G6 separate production/live-money approval. Details in READINESS_GATES.md.

**Approval consequence:** objective stop/go and Definition of Done conditions; financial implementation must not bypass P0 blockers or provider evidence. This is not a new approval to implement.

## W1-AP-05 — Source reconciliation order and issue reuse

**Recommended:** Prioritize (1) R1 original clause-to-ratified decision comparison, (2) source fidelity of the ratification conditions and 32-ARC/181/83 crosswalk, (3) reconcile 110 test descriptions not explicitly source-reconciled, (4) deliberate scope ratification. Reuse GitHub #1–#14 and Linear SER-118–SER-131, and defer creating additional tracker issues until approved epic/requirements boundaries are stable.

**Approval consequence:** a reliable baseline before expanding the issue inventory; existing AUD-P0 issues remain OPEN/BLOCKING.

## What these approvals must NEVER imply

No ratification of AUD-P0-01 external dispatch neutralization, AUD-P0-02 universal negative provider proof, AUD-P0-03 capture and Mongo local atomicity, AUD-P0-04 fulfillment/refund quiescence, final D-01-SM or CheckoutProcess FSM, AUD-P1-03 double deadline, candidate 35-minute session, candidate two Session limit, any specific Mongo schema, new microservices, Stripe live mode, external spending or implementation.

## Suggested review order

1. Decide **W1-AP-01** (scope determines the essential system capabilities).
2. Decide **W1-AP-02** (milestone classification and optional M00.5).
3. Decide **W1-AP-03** and **W1-AP-04** (identifier and readiness rules).
4. Decide **W1-AP-05** (source reconciliation and tracker governance).
5. Resume the independently unratified **AUD-P1-03** while keeping all P0 blockers intact.

Each item may be accepted, modified or rejected individually. Acceptance of Wave 1 as a *work assignment* is not acceptance of these proposed decisions.
