# Atomic Architecture or Delivery Issue

**Issue ID:** REQ / AUD / ADR / SPEC / TEST stable identifier
**Title:** One observable outcome using an imperative English verb
**Accountable owner/assignee:** @sergio-tr
**Linear:** SER-...
**GitHub:** #...
**Branch:** feature/*, bugfix/* or appropriate independent branch

## Problem and real eGame example
Explain the buyer/business risk and smallest race or failure that reproduces the issue.

## Ratified requirements and dependencies
List exact ACCEPTED invariants with identifiers, all PROPOSED / PENDING subdecisions separately, and related M00 milestones.

## Bounded context ownership
Specify the authority for each fact, immutable financial snapshot, authorization and side effect. Reject illegal writes into another context.

## Exact input and contracts
Commands, event/schema versions, required identities, tenant/store/provider account, versions, idempotency and authentication.

## Preconditions and guards
Define which facts must be durable and which owner decides. Name all unknown/timeout/obsolete-version cases.

## Postconditions and mandatory durable continuation
Specify transition invariants, local transaction boundary, Outbox/Inbox requirements, intended eventual progress and safe failure behavior.

## Recovery and concurrency
At least one interleaving, duplicate, worker crash, network timeout, out-of-order event, late external effect, cross-tenant misuse and partial-recovery scenario where applicable.

## Acceptance criteria (individually testable)
- Given ... When ... Then ...
- Given an external operation UNKNOWN ... Then no incompatible financial action ...
- Given duplicate delivery ... Then exactly one logical business effect ...
- Given process restart ... Then pending operation resumes idempotently ...

## Test IDs and evidence
For each TEST-... specify setup, actual provider/test mode, expected observable source-of-truth state and falsifying counterexample. Mark TEST_PLANNED until actually executed. Link logs/evidence when authorized.

## Out of scope
List postponed FSM parameters, provider behavior or infrastructure and avoid approving them as an accidental side effect.

## Definition of Done
Human review of English documentation, correct owner, independent branch, Conventional Commits, PR, traceability, all relevant required proof types, no external co-authors, and no undocumented change in historical decision status.
