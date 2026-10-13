# CommerceCore — Architecture Knowledge Base

**Canonical language: English. Accountable owner: [@sergio-tr](https://github.com/sergio-tr/ecommerce).**

CommerceCore is a reusable, headless, frontend-agnostic commerce engine. CommerceCloud is an independent multi-tenant SaaS and Control Plane. eGame is the first consumer: controlled sales and delivery of individual digital activation licenses. Standalone distribution and a second independent consumer are future validation gates.

**Current status (2026-10-13):** design only. M00.1 is OPEN. All four P0 architecture audits remain OPEN / BLOCKING. D-01 through D-07 are ACCEPTED with reservations; their technical subdecisions retain independent states. No tests are VERIFIED; no product implementation or infrastructure deployment is authorized by this documentation.

## Reading order

1. [Current state](docs/00-governance/CURRENT_STATE.md) and [restoration guide](docs/07-handoff/START_HERE.md).
2. [Historical R0.10 decisions (181)](docs/01-historical-baseline/R0.10_181_decisions.md) and [structured JSON](docs/01-historical-baseline/R0.10_181_decisions.json): 26 accepted / 155 selected proposals.
3. [Scoped M00.1 decision register](docs/02-decisions/status-matrix.md) and [structured state](docs/02-decisions/decision-register.json).
4. [D-01–D-07](docs/02-decisions/D01-D07-policies.md), [P0 ratifications](docs/02-decisions/AUD-P0-ratifications.md) and [P1 ratifications](docs/02-decisions/AUD-P1-ratifications.md).
5. [Bounded contexts](docs/03-domain/context-map.md), [audit register](docs/04-audit/REGISTER.md), [experiments](docs/05-tests/TEST_CATALOG.md), [roadmap](docs/06-planning/ROADMAP.md) and [traceability](docs/06-planning/TRACEABILITY.md).
6. [Contributor and branch governance](CONTRIBUTING.md).

## Tool relationships

- **GitHub:** versioned architecture decisions, design docs, future contracts and implementation.
- **Linear:** tracked risks, issues, priorities and dependencies; it does not independently ratify an ADR.
- **Slack:** notification and coordination only, never an independent commercial authority or repository contributor.

Architecture changes: Requirement → Risk/Audit → ADR → Specification → Linear Issue → GitHub Issue → branch → Pull Request → Contract → Test → Evidence.

The source artifacts include an independent **original proposed M00.1-R1 document**, uploaded on October 13, 2026; this supersedes the previous claim that no R1 source existed. R1 is not thereby accepted, and M00.1-R2 has not been finalized.

The repository is public. Original non-English research documents remain in separate source custody; canonical Git content is in English. No customer secrets, digital license contents, payment links or private credentials belong in Git.