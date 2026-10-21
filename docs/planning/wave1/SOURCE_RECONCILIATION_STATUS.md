# Wave 1 — Source Reconciliation Status

**Date:** 2026-10-21. **Status:** PARTIAL SOURCE FIDELITY; NO EXPERIMENT EXECUTED.

## What is directly corroborated

- The original R0.10 DOCX is present and its SHA-256 matches SOURCE_MANIFEST.md. Specific historical clauses cited in the 29-capability review have original paragraph-number anchors.
- The eight original review files associated with AUD01, AUD01-DT, AUD02, AUD03, AUD04, AUD11, AUD12 and AUD13 are present and all match their registered SHA-256 hashes.
- All 110 audit experiment *identifiers* that were previously marked RECONSTRUCTED_FROM_CONVERSATION occur in those original, hash-matched files.
- The AUD-P1-03 original includes 12 stated safety invariants and 16 proposed experiment cases. None is a user ratification of the double-window policy.

## What has NOT been validated

- The exact English scenario/title and acceptance-oracle translation of each of the 110 reconstructed experiments. Existing provenance and TEST_PLANNED / NOT_RUN status are preserved.
- Original R1 clause-to-later-user-ratification disposition for every statement; original R1 bytes exist, but full semantic comparison is not complete.
- User-ratification text in line-addressable form for every scoped ACCEPTED policy; reviewed English summaries must not be treated as verbatim ratification text.
- All 140 CAP source links: previous sourceIds were broad subsystem links. The 29-case review supplies corrective candidate clauses, but this does not validate the remaining 111.
- The 14 possible PLAN-DEC duplicate/refinement records; their deduplication resolution remains pending.

## Methodology and milestones

1. Reconcile R1 clauses and exact user approval evidence first, preserving historical states.
2. Compare the 110 English experiment scenarios and success/failure oracles with original audit table rows. Keep source-presence verification separate from semantic fidelity.
3. Review 140 capability-level source locators, including the 29 corrected historical references.
4. Merge, refine or retain the 14 candidate overlapping PLAN-DEC records only after source and governance review.
5. Report gaps as SOURCE_GAP or NEEDS_USER_RATIFICATION; never infer Stripe test-mode PASS or claim G0 complete.

**Current gates:** G0 PARTIAL; G1 PARTIAL; G3 critical domains BLOCKED; G4 implementation NOT AUTHORIZED; G5 not VERIFIED. AUD-P0-01..04 remain OPEN/BLOCKING.
