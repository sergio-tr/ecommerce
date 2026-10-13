# English-only change and decision control

1. Register source provenance, exact stable ID, business risk, affected bounded contexts and dependent ratified invariants.
2. Create a dedicated feature/*, bugfix/*, docs/* or other appropriate scoped branch, never write directly to main.
3. Prepare an ADR comparing viable and rejected options, including concurrency interleavings, unknown outcomes, local atomicity and future service extraction.
4. Request explicit ratification from @sergio-tr. Record ACCEPTED **only** for the approved policy and retain reservations; do not promote subdecisions automatically.
5. In one reviewable change update the machine-readable decision register, English narrative ADR, contract references, test/evidence matrix and affected milestone.
6. Commit using Conventional Commits type(scope): English summary. No Co-authored-by trailer, assistant/tool credit or contributor annotation.
7. Open a pull request assigned to @sergio-tr and cross-link the Linear and GitHub issues. Closing a ticket or merging a PR is not itself a new architectural ratification.
8. Preserve original R0.10 historical selection statuses and earlier proposal documents, and explicitly mark a supersession rather than editing history.
9. Mark experimental evidence VERIFIED only after an executed, repeatable, correctly scoped test with observable external/business results. Tests planned do not count.
10. For any future M00.1-R2 compare original R1 proposal with retained, revised, discarded, still pending and experimentally unverified clauses; M00.1 remains OPEN until blocking P0 contract conditions are resolved.

**Trace:** Requirement → Risk/Audit → ADR → Specification → Linear Issue → GitHub Issue → feature branch → Pull Request → Contract → Test → Evidence.
