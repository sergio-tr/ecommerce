# SER-135 — Oracle Source Semantic Audit (2026-11-06)

Scope: documentary read-only audit for #27/SER-135. No source-fidelity verification possible here; original Spanish clauses not embedded.

- JSON was restored to base; no provenance status was changed in this PR.
- The 110 IDs previously compared across MD/JSON remain UNVERIFIED and require OWNER REVIEW against the Spanish originals.

## Pending owner verification IDs (110)
(List unchanged; see prior analysis outside this PR.)

## Independent bilingual semantic review (indexed source rows)

The independently verifiable portion of the audit has now been performed against the indexed bilingual table:

- Source crosswalk: `docs/05-tests/M00_G3_ORIGINAL_SOURCE_ORACLE_CROSSWALK.md`
- Test catalog: `docs/05-tests/TEST_CATALOG.md`

Results are recorded per ID (Spanish scenario + oracle, English title + oracle, assessment, reason) here:

- `docs/00-governance/SER-135_ORIGINAL_110_SEMANTIC_REVIEW_VERDICTS_2026-11-06.md`

Summary of verdicts (110 total):

- CONSISTENT_WITH_INDEXED_ROW: 110
- MISMATCH: 0
- AMBIGUOUS: 0
- INSUFFICIENT_SOURCE: 0

Notes:

- This is a semantic comparison of the indexed extract only. It does not verify original source bytes or promote any test to VERIFIED.
- Objective mistranslations were not identified; no English wording corrections are proposed at this time.
- CAP inclusion boundaries remain unchanged: `CAP-INV-006`, `CAP-FUL-004` and `CAP-PAY-010` INCLUDED; `CAP-INV-005` EXCLUDED; `CAP-PAY-012` wallets DEFERRED / Link PENDING.
