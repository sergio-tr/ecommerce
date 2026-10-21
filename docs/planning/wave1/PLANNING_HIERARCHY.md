# Wave 1 — Planning Hierarchy and Dependencies

**Artifact:** W1-PLAN-001. **Status:** PROPOSED, NOT RATIFIED. **Owner:** @sergio-tr.

## Canonical identities and reuse

**Preserve** R0.x and original D/AUD historical source IDs. Active D-01..07 and scoped subdecision IDs retain existing statuses. The new CAP-... labels are provisional functional inventory keys, and PLAN-DEC-... are provisional planning questions, not new accepted ADRs or GitHub Issues. Future REQ-... / ADR-... / SPEC-... identifiers are a naming **proposal** pending crosswalk to the historical 32 ARC candidates.

GitHub stores the authoritative, versioned decision and contract texts after explicit ratification. Linear manages scheduling, assignee and blocked-by relationships. GitHub Issues/PRs manage separately authorized implementation and review. Slack carries links and discussions and cannot independently approve an ADR.

## Proposed hierarchy (no tracker objects created)

| Layer | Concept | Representation | Status |
|---|---|---|---|
| Program | CommerceCore / CommerceCloud / eGame | Existing Linear project + GitHub docs | Existing |
| Milestone | M00–M09, M00.1..M00.4; optional M00.5 | Roadmap + future Linear milestone objects | Proposed structure, no new objects |
| Capability / Epic | Inventory, Ordering, Payments, Cloud, Identity, eGame, SDK, Ops etc. | CAP draft records + future epic | 140 draft capabilities |
| Requirement | Atomic actor/system behavior with priority | Future REQ IDs tied to source | Not allocated or ratified |
| Risk/Decision | Architectural question with evidence constraints | Existing D/AUD or draft PLAN-DEC | Reuse historical and current statuses |
| Specification | Precise command, state, event, version/error/guard, UX rules | Versioned Git specs | Many incomplete |
| Planning issue | Design review, decision, source recovery | Linear SER-118..SER-131 | Existing, reuse |
| Engineering issue | Independently executable feature/bugfix | Future GitHub issue + Linear task | NOT CREATED |
| Change | Individual feature/*, bugfix/*, docs/* topic branch and PR | GitHub | Wave 1 documentation only |
| Test and evidence | Test IDs → observed execution | Planned catalogs and later run reports | TEST_PLANNED, no VERIFIED |

## Existing mapping (no duplicates)

- AUD-P0-01..AUD-P0-04 → GitHub #1..#4, Linear SER-118..SER-121.
- AUD-P1-01..AUD-P1-06 → GitHub #5..#10, Linear SER-122..SER-127.
- AUD-P2-01..AUD-P2-03 → GitHub #11..#13, Linear SER-128..SER-130.
- English baseline/source recovery → GitHub #14, Linear SER-131.
- No new implementation tickets, Slack messages or Linear milestones have been created by Wave 1.

## Dependency model

**Source fidelity and G0 baseline → G1 ratified feature scope → relevant G2 architectural decisions → G3 specifications → G4 authorized implementation issues → G5 evidence.**

Critical predecessor chains:
1. AUD-P0-01 ↔ AUD-P0-02 → versioned PaymentAttempt/session admission + reconciled release → Inventory final release authorization.
2. AUD-P0-03 ↔ D-05-MONGO ↔ financial capture policy → locally atomic financial fact/Outbox and Ordering Inbox/continuation → Order paid obligation.
3. AUD-P0-04 ↔ M00.2 DigitalLicense key exposure and multi-line preparation → commercial failure resolution/refund.
4. M00.3 guest claim/cancel authority ↔ Order/checkout/License access and tenant isolation.
5. M00.4 contracts and context map ↔ all cross-context integration.
6. M01 engineering and M02/M03 domain work may be **planned** while M00.1 design is open; executable tasks may proceed only if their own contract/dependency and authorization gates are met.
7. M04 (first safe Stripe test-mode purchase) is a necessary foundation for M05 Kafka integration and M07 reliable service extraction; M06 reuse and M08 lab planning can begin earlier as independent design.
8. M09 validates measured functionality; G6 separately authorizes real-money operation.

## Engineering issue template gate (later, not now)

Each issue must name stable parent source/capability/decision IDs; owner context and @sergio-tr accountable user; fully ratified scope; command and event schemas; preconditions, postconditions and versions; idempotency and authorization; external-effect recovery; failure and concurrency interleavings; operator escalation; Given/When/Then and negative tests with observable source-of-truth oracles; explicit exclusions; acceptance criteria and readiness state; future topic branch and PR. Do not hide unfinished architecture inside coding tasks.

## Change-control constraints

All project writing is in English. Use independent feature/*, bugfix/* or other valid topic branches; conventional commit subjects type(scope): description; do not add co-author or agent attribution. Only explicit user approval upgrades a decision, opens implementation scope or closes a blocker. Status of an issue or Slack acknowledgment never changes historical decision status by itself.

## Candidate Wave 1–4 flow

- Wave 1: structured baseline assessment, product scope catalog, decision backlog, dependencies and gate proposals.
- Wave 2: ratify scope, detailed architectures and documentary contracts, resolving P0 blockers only with sufficient positive proof.
- Wave 3: construct complete reviewed epics and traceable, atomic **future** implementation-ready tasks.
- Wave 4: explicit authorization, implementation, executed tests, and release evidence per milestone.

**This hierarchy and dependency allocation require the W1 approval packet before becoming normative planning policy.**
