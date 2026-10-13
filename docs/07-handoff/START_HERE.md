# CommerceCore — Recovery Guide for a New Session or Workspace

**Accountable owner:** @sergio-tr. **Language:** English only. **Scope:** architecture and planning until explicitly changed.

## Essential opening sequence

1. Read repository README and docs/00-governance/CURRENT_STATE.md. M00.1 is OPEN with four P0 blockers; no tests VERIFIED.
2. Read the 181 historical English decision entries and machine-readable JSON under docs/01-historical-baseline. Keep 26 ACCEPTED / 155 PROPOSED — SELECTED.
3. Read the scoped decision register and seven full ADRs in docs/02-decisions; the seven policies are ACCEPTED with reservations but their subdecisions may be PENDING or PROPOSED — SELECTED.
4. Read the four detailed P0 audits and P1-01/P1-02 accepted-but-open reviews. AUD-P1-03 is an unratified proposal: do not proceed as if approved.
5. Read docs/architecture/FINANCIAL_INVARIANTS.md and docs/03-domain/context-map.md to restore owner boundaries.
6. Read the original M00.1-R1 source-based English preservation note under docs/milestones. **R1 is independently available** in the user-supplied source custody, but was PROPOSED and is not an accepted final specification.
7. Read docs/00-governance/SOURCE_MANIFEST.md (19 integrity hashes), and retrieve the original source-custody ZIP if a literal comparison is required. The English canonical repo does not embed the original non-English bytes.
8. Read docs/05-tests/TEST_CATALOG.json and verify every entry remains TEST_PLANNED until true execution evidence is produced.
9. Use Linear issue SER-131 and GitHub #14 for this document-recovery branch, and the 13 paired audit issues in LINKED_ISSUES.md for later reviews. Do not replace decisions with task status.
10. Consult CONTRIBUTING.md before changes: no writes directly to main, separate feature/bugfix branch per change, Conventional Commits, no co-author credits, @sergio-tr sole accountable owner.

## Current decision to resume

AUD-P1-03 — candidate commercial retry admission policy with relative+absolute windows. Alternative D and candidate parameters were proposed, but Sergio did **not** ratify them. D-06-RETRY-WINDOW remains PENDING, AUD-P1-03 stays OPEN, and the four P0s remain OPEN / BLOCKING. Do not move to AUD-P1-04 without an explicit answer.

## Prompt to resume a lost conversation

> Review the CommerceCore repository as the authoritative English knowledge baseline. Begin with CURRENT_STATE, historical R0.10, scoped decision register, full D-01–D-07 ADRs, P0/P1 audit deep dives, R1 proposal preservation, source manifest, and traceability. Preserve ACCEPTED, PROPOSED — SELECTED, PENDING and OPEN/BLOCKING states exactly. CommerceCore is a reusable headless engine, CommerceCloud its independent Control Plane and eGame its first license-based consumer. Protect money/inventory across unknown Stripe operations and do not claim distributed atomicity or provider proof. M00.1 is not closed and no tests are VERIFIED. All new writing and issue metadata must be in English; work only in isolated feature/* or bugfix/* branches with Conventional Commits and a PR. @sergio-tr is the accountable owner and no tools are credited as co-authors. The next unresolved decision is AUD-P1-03; request explicit approval before moving onward.

## What has not happened

There is no completed M00.1-R2, no final physical Mongo schema, no fully ratified Reservation/CheckoutProcess FSM, no proven provider neutralization, no end-to-end verified payment/fulfillment experiment, no product implementation authorization, and no deployed or production-ready checkout by virtue of this documentation.
