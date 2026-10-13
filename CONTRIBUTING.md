# Repository contribution and decision governance

## Language, identity and accountability

All new documentation, issue bodies, branch descriptions, pull requests, commits, test names, diagrams and future source comments must be written in **English**. **@sergio-tr** is the sole default responsible owner and assignee. Do not add any Co-authored-by trailers, signatures or contributor claims for tools, editors, assistants or connected services. If the authenticated GitHub identity differs from @sergio-tr, do not publish under an assumed identity.

## Branches and pull requests

Do not commit to main directly. Use one independent, reviewable branch per change, for example:
- feature/SER-131-architecture-knowledge-baseline-en
- feature/SER-200-checkout-specification
- bugfix/SER-201-reservation-expiration-race
- hotfix/SER-202-payment-reconciliation
- refactor/SER-203-domain-boundary-cleanup
- docs/SER-204-adr-update
- chore/SER-205-metadata-and-tooling
- test/SER-206-concurrency-experiments

Always open an English pull request, link the relevant Linear and GitHub issues, and obtain approval before merging. A feature branch does not imply authorization to implement the product.

## Conventional Commits

Every commit subject follows: **type(scope): imperative English summary**. Allowed meaningful types include feat, fix, chore, docs, test, refactor, perf and build.

Examples:
- feat(checkout): specify payment opportunity admission guards
- fix(inventory): correct unsafe release preconditions
- chore(docs): normalize architecture source references
- test(payments): cover unknown Stripe creation result
- refactor(ordering): isolate saga coordination ownership

Do not add tooling attribution, co-author trailers or non-English text to commits.

## Review checklist

- Historical R0.1–R0.10 statuses remain unchanged unless expressly superseded by a new, separately tracked decision.
- Ratified policies remain separate from proposed state machines, implementation details and experiment results.
- Every business effect has an accountable bounded context and explicit preconditions.
- P0 blockers cannot be closed solely because a direction was ACCEPTED.
- The change specifies failure, unknown result, concurrency, idempotency and recovery where relevant.
- No test is VERIFIED without real, preserved execution evidence.
- Source provenance and scope are linked to an ADR or audit record.
- Public documentation has no secrets, license keys or customer-sensitive data.
- All code and documentation authorship/accountability belongs to @sergio-tr.

## New user instruction versus earlier history

Historical candidate R0.5-02 favored trunk-based development. The latest explicit user policy requires independent feature/bugfix branches and PR review. Apply that policy going forward without falsely upgrading or deleting the historical R0.5-02 entry.