# SER-135 — 13-audit dependency and closure matrix (post-PR32/PR33)

As-of (Europe/Amsterdam): 2026-11-12 20:00 CET  
Main (observed): origin/main @ 5be6c448291f74e76291d64adf8d0a4356bc2377  
Scope: Documentary, source-backed analysis; no status promotion; no code changes beyond this file.

Sources reviewed
- docs/00-governance/DESIGN_FIRST_G3_GATE.md
- docs/00-governance/ISSUE_CLOSURE_AUDIT_2026-10-30.md
- docs/00-governance/SER-135_ORIGINAL_110_SEMANTIC_REVIEW_VERDICTS_2026-11-06.md (from PR #32)
- docs/00-governance/SER-130_CAP140_CLAUSE_PROVENANCE_2026-11-07.md (from PR #33)
- docs/02-decisions/decision-register.json
- docs/architecture/m01/M01_BOOTSTRAP_01_DEFINITION_OF_READY.md
- docs/architecture/m01/m01-bootstrap-01-readiness.json
- docs/planning/wave1/decision-backlog.json
- docs/planning/wave1/functional-inventory.json

Legend
- G3 owner-ratification needed: explicit owner decision on exact ID/contract.
- G5 external experiment needed: Stripe/Mongo/worker/fulfillment runtime proof.
- “Accepted vs Proposed”: key decision IDs with current status from decision-register.json (ACCEPTED / PROPOSED — SELECTED / PENDING / DEFERRED).
- “Acceptance clause (delta)”: the minimum remaining closure stated in ISSUE_CLOSURE_AUDIT_2026-10-30.md.

Matrix (13 rows)

1) AUD-P0-01 — [GitHub #1](https://github.com/sergio-tr/ecommerce/issues/1) / Linear SER-118 (P0)  
- Acceptance clause (delta): Positive proof or conservative hold; old dispatch must not cause unsafe release; execute suspended‑worker and provider tests.  
- Accepted vs Proposed: D‑01 ACCEPTED; D‑02 ACCEPTED; D‑07‑EXCL ACCEPTED; AUD‑P0‑01‑DISPATCH‑POLICY ACCEPTED; AUD‑P0‑01‑DISPATCH‑NEUTRALIZATION PENDING/BLOCKING.  
- Evidence pointers: docs/04-audit/AUD-P0-01-deep-dive.md; docs/architecture/m00/P0_01_FINAL_DESIGN_DECISION.md; tests AUD01‑T01..T12, AUD01‑DT01..DT10; SER‑135 110/110 semantic verdicts CONSISTENT_WITH_INDEXED_ROW.  
- G3 owner-ratification: yes (final cross-context command/guards).  
- G5 external experiment: yes (Stripe POST late window, neutralization, lost responses).  
- Hard deps (planning): D‑05‑MONGO.  
- Next safe packet: finalize dispatch/closure/release permits; design‑only ratification; define provider test plan.

2) AUD-P0-02 — [GitHub #2](https://github.com/sergio-tr/ecommerce/issues/2) / Linear SER-119 (P0)  
- Acceptance clause (delta): Prove safe unknown‑Session recovery without Session ID or retain protected incident; provider/account specific.  
- Accepted vs Proposed: D‑02 ACCEPTED; AUD‑P0‑02‑RECOVERY‑POLICY ACCEPTED; AUD‑P0‑02‑PROVIDER‑PROOF PENDING/BLOCKING.  
- Evidence pointers: docs/04-audit/AUD-P0-02-deep-dive.md; docs/architecture/m00/P0_02_FINAL_DESIGN_DECISION.md; tests AUD02‑T01..T16.  
- G3 owner-ratification: yes (correlation/evidence policy).  
- G5 external experiment: yes (search, idempotency, unknown outcomes).  
- Hard deps (planning): none (co‑design with AUD‑P0‑01).  
- Next safe packet: approve correlation policy; prepare provider search/late‑dispatch trials.

3) AUD-P0-03 — [GitHub #3](https://github.com/sergio-tr/ecommerce/issues/3) / Linear SER-120 (P0)  
- Acceptance clause (delta): Confirm captured funds, preexisting Order, owner‑local Inbox/Outbox, and unknown Mongo commit under crash.  
- Accepted vs Proposed: D‑04 ACCEPTED; D‑05‑INBOX/OUTBOX/RECOVERY ACCEPTED; AUD‑P0‑03‑CONTRACT PROPOSED—SELECTED; D‑05‑MONGO PENDING.  
- Evidence pointers: docs/04-audit/AUD-P0-03-deep-dive.md; docs/architecture/m00/P0_03_FINAL_DESIGN_DECISION.md; tests AUD03‑T01..T16.  
- G3 owner-ratification: yes (exact propagation/contract).  
- G5 external experiment: yes (Mongo commit‑unknown, crash/ack loss).  
- Hard deps (planning): D‑05‑MONGO, AUD‑P0‑02.  
- Next safe packet: ratify D‑05‑MONGO contract; define crash/readback experiments.

4) AUD-P0-04 — [GitHub #4](https://github.com/sergio-tr/ecommerce/issues/4) / Linear SER-121 (P0)  
- Acceptance clause (delta): Prove effect quiescence vs refund/fulfillment with paused workers and uncertain responses.  
- Accepted vs Proposed: D‑04‑EXCL ACCEPTED; AUD‑P0‑04‑EFFECT‑HANDOFF PROPOSED—SELECTED; AUD‑P0‑04‑QUIESCENCE PENDING/BLOCKING.  
- Evidence pointers: docs/04-audit/AUD-P0-04-deep-dive.md; docs/architecture/m00/P0_04_FINAL_DESIGN_DECISION.md; tests AUD04‑T01..T16.  
- G3 owner-ratification: yes (disclosure frontier/all‑line prep).  
- G5 external experiment: yes (lost‑response/refund/fulfillment races).  
- Hard deps (planning): AUD‑P0‑01; related M00.2.  
- Next safe packet: approve all‑line preparation before exposure; specify effect handoff/irreversibility.

5) AUD-P1-01 — [GitHub #5](https://github.com/sergio-tr/ecommerce/issues/5) / Linear SER-122 (P1)  
- Acceptance clause (delta): Ratify Reservation transition guards and StockPool conservation; verify owner‑local atomicity.  
- Accepted vs Proposed: AUD‑P1‑01‑FSM‑POLICY ACCEPTED; D‑01‑SM PROPOSED—SELECTED.  
- Evidence pointers: tests AUD11‑T01..T12; docs/02-decisions/D‑01‑full‑adr.md.  
- G3 owner-ratification: yes (final states/guards).  
- G5 external experiment: yes (conservation/race).  
- Hard deps (planning): AUD‑P0‑01.  
- Next safe packet: freeze D‑01‑SM; property tests plan.

6) AUD-P1-02 — [GitHub #6](https://github.com/sergio-tr/ecommerce/issues/6) / Linear SER-123 (P1)  
- Acceptance clause (delta): Approve Order/CheckoutProcess local command matrix and prevent duplicate authority.  
- Accepted vs Proposed: AUD‑P1‑02‑OWNERSHIP‑POLICY ACCEPTED; AUD‑P1‑02‑COORDINATION‑POLICY ACCEPTED; AUD‑P1‑02‑FSM‑MIN PENDING; AUD‑P1‑02‑CONTRACT PROPOSED—SELECTED.  
- Evidence pointers: tests AUD12‑T01..T12.  
- G3 owner-ratification: yes (exact FSM/contract).  
- G5 external experiment: yes (dup/out‑of‑order, concurrency).  
- Hard deps (planning): AUD‑P0‑03, D‑05‑MONGO.  
- Next safe packet: select minimal FSM; finalize atomic continuation contract.

7) AUD-P1-03 — [GitHub #7](https://github.com/sergio-tr/ecommerce/issues/7) / Linear SER-124 (P1)  
- Acceptance clause (delta): Option D policy accepted; choose anchors/fencing; defer numeric windows under single‑attempt exposure.  
- Accepted vs Proposed: AUD‑P1‑03‑WINDOW‑POLICY ACCEPTED; SAFE‑RETENTION ACCEPTED; WINDOW‑VALUES PENDING; PROTOCOL PROPOSED—SELECTED.  
- Evidence pointers: tests AUD13‑T01..T16; docs/02-decisions/D‑06‑full‑adr.md.  
- G3 owner-ratification: yes (anchors/fencing).  
- G5 external experiment: yes (provider timing under guards).  
- Hard deps (planning): AUD‑P0‑01 (co‑design D‑06‑RETRY‑WINDOW).  
- Next safe packet: ratify anchors/fencing; defer numeric values into later tuning.

8) AUD-P1-04 — [GitHub #8](https://github.com/sergio-tr/ecommerce/issues/8) / Linear SER-125 (P1)  
- Acceptance clause (delta): Pin account+API version, enforce card/3DS, capture and Link suppression in test mode.  
- Accepted vs Proposed: D‑03 ACCEPTED; CAP‑PAY‑010 INCLUDED (DOWNSTREAM_POLICY_MENTION); D‑03‑LINK PENDING; D‑03‑CONFIG PENDING.  
- Evidence pointers: docs/architecture/m00/AUD_P1_04_P2_02_STRIPE_API_COMPATIBILITY_AND_TIME_POLICY.md; CAP140 provenance table.  
- G3 owner-ratification: yes (effective method/version policy).  
- G5 external experiment: yes (test‑mode provider checks).  
- Hard deps (planning): AUD‑P0‑03.  
- Next safe packet: pin API version/method set; document enforcement checks.

9) AUD-P1-05 — [GitHub #9](https://github.com/sergio-tr/ecommerce/issues/9) / Linear SER-126 (P1)  
- Acceptance clause (delta): Specify Mongo txn read/write/journal/index/unknown commit and run crash/readback evidence.  
- Accepted vs Proposed: D‑05‑MONGO PENDING; related D‑05‑INBOX/OUTBOX/RECOVERY ACCEPTED.  
- Evidence pointers: docs/architecture/m00/D_05_MONGO_EXACT_OWNER_TRANSACTION_CONTRACT.md.  
- G3 owner-ratification: yes (physical contract).  
- G5 external experiment: yes (Mongo driver/replica tests).  
- Hard deps (planning): D‑05‑MONGO.  
- Next safe packet: ratify D‑05‑MONGO; plan commit‑unknown and failover trials.

10) AUD-P1-06 — [GitHub #10](https://github.com/sergio-tr/ecommerce/issues/10) / Linear SER-127 (P1)  
- Acceptance clause (delta): Atomic multi‑line hold and all‑license preparation; no partial disclosure/auto full refund.  
- Accepted vs Proposed: ties to D‑01/D‑04; no final multi‑line contract ratified yet.  
- Evidence pointers: AUD04‑T10..11, AUD11‑T11..12.  
- G3 owner-ratification: yes (batch/prepare‑before‑expose).  
- G5 external experiment: yes (multi‑line races).  
- Hard deps (planning): AUD‑P0‑04, AUD‑P1‑01.  
- Next safe packet: document all‑line preparation and batch atomicity; plan tests.

11) AUD-P2-01 — [GitHub #11](https://github.com/sergio-tr/ecommerce/issues/11) / Linear SER-128 (P2)  
- Acceptance clause (delta): Finalize glossary (one owner per term; provider vs incorporated facts) and typed contract refs.  
- Accepted vs Proposed: glossary contract pending (no exact ID ratified).  
- Evidence pointers: docs/architecture/m00/AUD_P2_01_EXACT_GLOSSARY_CONTRACT.md.  
- G3 owner-ratification: yes (glossary).  
- G5 external experiment: no.  
- Hard deps (planning): AUD‑P1‑02.  
- Next safe packet: ratify glossary with owners/examples.

12) AUD-P2-02 — [GitHub #12](https://github.com/sergio-tr/ecommerce/issues/12) / Linear SER-129 (P2)  
- Acceptance clause (delta): Measure actual provider `expires_at` and available methods; do not hardcode 35m/two‑attempt defaults.  
- Accepted vs Proposed: D‑02‑P01 PROPOSED—SELECTED; D‑06‑P01 PROPOSED—SELECTED.  
- Evidence pointers: STRIPE API time policy doc; CAP140; tests AUD02‑T16.  
- G3 owner-ratification: yes (measurement plan approval).  
- G5 external experiment: yes (Stripe timing/methods).  
- Hard deps (planning): D‑06‑P01 (co‑design: D‑02‑P01).  
- Next safe packet: approve measurement plan; schedule test‑mode runs.

13) AUD-P2-03 — [GitHub #13](https://github.com/sergio-tr/ecommerce/issues/13) / Linear SER-130 (P2)  
- Acceptance clause (delta): 110 source‑oracle semantic owner review; 140 CAP clause anchors; R1→ratification clause diff; evidence placeholders stay NOT_RUN.  
- Accepted vs Proposed: none promoted; see CAP140 table — ORIGINAL_SOURCE_CLAUSE_VERIFIED 0, INDEX_ONLY 137, DOWNSTREAM_POLICY_MENTION 2, AMBIGUOUS 1.  
- Evidence pointers: SER‑135 110/110 semantic verdicts; SER‑130 CAP140 provenance.  
- G3 owner-ratification: yes (semantic approvals, clause anchors).  
- G5 external experiment: no (documentary).  
- Hard deps (planning): none (related W1‑GAP‑04).  
- Next safe packet: run owner semantic review across the 110; resolve CAP anchors.

Explicit distinction: M01 foundation vs finance P0
- M01‑BOOTSTRAP‑01 remains DESIGN_FIRST_HOLD / G4 NOT_GRANTED. Independent from P0 runtime proof but gated by #27 owner decision (see m01-bootstrap-01-readiness.json).  
- Finance P0 (#1–#4) remain OPEN/BLOCKING until provider/driver/worker evidence exists; design ratifications alone do not close them.

Reproducible checks (local)
- git rev-parse origin/main  → 5be6c448291f74e76291d64adf8d0a4356bc2377  
- rg -n '^\\|\\s*AUD' docs/00-governance/SER-135_ORIGINAL_110_SEMANTIC_REVIEW_VERDICTS_2026-11-06.md | wc -l  → 110  
- rg -n '^\\|\\s*CAP-' docs/00-governance/SER-130_CAP140_CLAUSE_PROVENANCE_2026-11-07.md | wc -l  → 140

Notes and cautions
- Do not infer source‑clause authenticity from index/link existence. CAP140 table is a documentary locator only; owner clause-level approvals still required.  
- No G3 PASS, G4 grant, or G5 execution is claimed by this matrix.

