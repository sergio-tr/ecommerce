# End-to-End Change and Evidence Traceability

## Stable chain

Requirement → Risk/Audit → ADR → Specification → Linear Issue → GitHub Issue → isolated branch → Pull Request → Contract → Test → Evidence.

The *decision ledger* in GitHub is normative once explicitly reviewed. Linear tracks who is assigned, issue priority and dependencies; GitHub Issues/PRs track review and future implementation. A task marked Done does not constitute policy ACCEPTED, an ADR ACCEPTED does not imply experiment VERIFIED, and a CI check does not prove Stripe safely neutralized a previously enabled HTTP request.

## Key examples

| Requirement / invariant | Audit | Accepted policy | Future contract | Planning | Test plan |
|---|---|---|---|---|---|
| No release while collectible external operation may remain | AUD-P0-01 | D-01, D-06-EXCL, D-07-EXCL | financial close/release permit; prior dispatch neutralization | SER-118 / #1 | AUD01-T01..12 and AUD01-DT01..10 |
| Recover Stripe unknown without Session ID | AUD-P0-02 | D-05, AUD-P0-02-RECOVERY-POLICY | persisted external operation identity and provider evidence | SER-119 / #2 | AUD02-T01..16 |
| Preserve collected obligation through Ordering outage | AUD-P0-03 | D-04, D-05-INBOX/OUTBOX | capture evidence + atomic local propagation | SER-120 / #3 | AUD03-T01..16 |
| Exclude incompatible license disclosure and refunds | AUD-P0-04 | D-04-EXCL, AUD-P0-04-EXCLUSION-POLICY | commercial resolution + effect quiescence | SER-121 / #4 | AUD04-T01..16 |
| Capacity-specific Reservation without duplicated finance FSM | AUD-P1-01 | AUD-P1-01-FSM-POLICY | StockPool balance and reservation transitions | SER-122 / #5 | AUD11-T01..12 |
| Distinct Order, CheckoutProcess and Payment truth | AUD-P1-02 | AUD-P1-02-OWNERSHIP/COORDINATION-POLICY | locally atomic Order+saga continuation | SER-123 / #6 | AUD12-T01..12 |
| Limit commercial retry windows without unsafe release | AUD-P1-03 | D-06 only; double-window **NOT RATIFIED** | candidate admission deadlines | SER-124 / #7 | AUD13-T01..16 (candidate tests) |

## Pull request requirements

Use one independent feature/bugfix/docs branch per atomic change, English-only, with a Conventional Commit subject (type(scope): summary), owned by @sergio-tr, and no agent/co-author credits. A documentation PR that refines an ADR must link original sources, exact decision statuses, alternatives/rejected proposals and updated tests. Any implementation PR will need separate authorization to exist.

## Avoid accidental approvals

Never infer a fully approved D-01 Reservation FSM from accepting the four-state candidate. Never infer a supported provider-side HTTP fencing mechanism from a locally versioned operation. Never infer that AUD-P1-03 double-window timing is ACCEPTED. Never infer a service/microservice deployment is required because a logical worker was described. Never infer Stripe/Mongo evidence from pending experiments.
