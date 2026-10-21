# Wave 1 — Prioritized Source and Experiment Reconciliation Plan

**Artifact:** W1-RECON-001. **State:** APPROVED PRIORITIES (W1-AP-05), EXECUTION PENDING. **Owner:** @sergio-tr. This plan describes documentary source verification, not test execution, supplier proof or a new architecture approval.

## R1 and original-ratification provenance

| ID | Priority | Source to inspect | Output | Acceptance evidence |
|---|---|---|---|---|
| W1-RC-01 | P0 | Independent M00.1-R1 original source from SOURCE_MANIFEST.md (SHA-256 7636dc6d...) | Clause-level R1 → D-01..07/AUD-P0/P1 crosswalk, including retained, modified, rejected, unresolved and unverified items | 100% of original R1 requirement, invariant, state and error/guard statements assigned stable source-locator and disposition; ambiguous lines explicitly flagged |
| W1-RC-02 | P0 | Actual user ratification messages, not just assistant reviews | Clause-level accepted condition text and timestamp mapping, separate from selected proposals and evidence claims | Every claimed ACCEPTED scoped ID linked to ratifying user statement or marked SOURCE_GAP |
| W1-RC-03 | P1 | R0.10 181 rows, 32 candidate ARC catalog and 83 scoped active rows | Identifier crosswalk, aliases/overlaps and status precedence | Every historical/current row classified, no accidental renumbering or silent status mutation |
| W1-RC-04 | P1 | Functional capability source paragraphs and M04 acceptance | All 140 CAP rows linked to exact source subsection or PROPOSED_SCOPE; three composite entries identified | 140/140 reviewed by human with specific source locator, approval status and M04 disposition; broad subsystem source IDs do not qualify |
| W1-RC-05 | P1 | Original test tables in 19-source custody; test catalog | Full source-level 148 test coverage with reproducible setup, assertion, provider context and evidence obligation | 148/148 records categorized verified-against-source or explicitly unresolved/missing; zero fabricated VERIFIED |
| W1-RC-06 | P1 | Readiness framework, documentation versions and PR | Gate-by-gate review report with zero silent assumptions | Readiness passes have actual links and accepted issue/decision scope; blockers remain intact |
| W1-RC-07 | P2 | Source language and document metadata | English-only canonical project descriptions, with original source names preserved as provenance | All new/edited metadata English; source originals remain immutable |

## Test-catalog priority by source provenance

The current JSON catalog has 148 planned IDs. Exactly 38 descriptions are marked SOURCE_TABLE_TRANSLATED_TO_ENGLISH (D05-T01..10, D06-T01..14, D07-T01..14). The remaining 110 are marked RECONSTRUCTED_FROM_CONVERSATION and have an explicit source-review acceptance-oracle placeholder. Thus neither group has executed-provider evidence.

| Batch | IDs | Count | Review priority | Original review source and required oracle |
|---|---|---:|---|---|
| RC-T01 | AUD01-T01..T12 | 12 | P0 | Financial admission/cancellation/release: no late collectible opportunity or unsafe Inventory release; original AUD-P0-01 review |
| RC-T02 | AUD01-DT01..DT10 | 10 | P0 | Paused workers, HTTP after permit close, ambiguous Stripe side effects; original DISPATCH review |
| RC-T03 | AUD02-T01..T16 | 16 | P0 | Session ID unknown, idempotency retention and positive provider proof; original AUD-P0-02 review |
| RC-T04 | AUD03-T01..T16 | 16 | P0 | Durable captured fact, Order propagation, unknown commit and event replay; original AUD-P0-03 review |
| RC-T05 | AUD04-T01..T16 | 16 | P0 | License potential reveal vs refund quiescence, lost responses and multi-line preparation; original AUD-P0-04 review |
| RC-T06 | AUD11-T01..T12 | 12 | P1 | Reservation FSM capacity conservation and protection; original AUD-P1-01 review |
| RC-T07 | AUD12-T01..T12 | 12 | P1 | Order/CheckoutProcess/Payments source-of-truth and coordination; original AUD-P1-02 review |
| RC-T08 | AUD13-T01..T16 | 16 | P1 | **Unratified** commercial double-window proposal; source fidelity may be checked, but running/approving the policy is not implied |

**Totals:** 22 + 16 + 16 + 16 + 12 + 12 + 16 = 110 reconstructed; 38 source-table translations already identified; 148 catalog entries overall.

## Required per-test review record

- Stable exact ID, source artifact SHA-256 and page/line or table row locator.
- Source phrase/context, translation confidence and any ambiguity against later user ratifications.
- Domain invariant and affected bounded contexts.
- Setup and immutable test-input values, provider account/environment/API version when needed.
- Failure injection interleaving, including worker suspension/timeout/unknown result as applicable.
- Expected positive and negative effects at authoritative owners; count duplicates by semantic operation.
- Oracle source: actual Stripe object/state versus mocked adapter/DB/projection.
- Reproducibility conditions and cleanup, including outstanding held stock.
- Evidence artifact type and rule for PASS/FAIL/INCONCLUSIVE.
- Never set VERIFIED without executing the test in the authorized environment.

## Dependencies and safe limitations

- The original test descriptions and full ratification transcript are not embedded as individually line-addressable bytes in the current GitHub documentation. A source artifact hash is not an oracle or a proof that a translated title matches. A separate source-custody comparison remains required.
- Stripe test mode experiments, real Mongo failover and actual worker restart/HTTP conditions require later authorized execution; do **not** simulate provider guarantees and mark them verified.
- Source reconciliation may legitimately end in SOURCE_GAP or NEEDS_USER_CONFIRMATION. Such rows are blockers/uncertainty, not fake closures.
- Keep all original TEST_PLANNED, no test passes assigned here, and preserve AUD-P0-01..04 OPEN / BLOCKING.
