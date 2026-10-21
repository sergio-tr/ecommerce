# CommerceCore — Architecture Knowledge Base

CommerceCore is a reusable, headless, frontend-agnostic commerce engine. CommerceCloud is an independent multi-tenant SaaS and Control Plane. eGame is the first consumer: controlled sales and delivery of individual digital activation licenses. Standalone distribution and a second independent consumer are future validation gates.

## Latest reviewed planning state (2026-10-21)

[Wave 1 validation report and approved planning directions](docs/planning/wave1/README.md) — draft PR #17, still unmerged. W1-AP-01 accepted the bounded recoverable M04 scope **direction**; W1-AP-02 retained M00–M09 but did not approve M00.5; W1-AP-03/04/05 accepted canonical ID preservation, evidence-based G0–G6 and source reconciliation priorities. The 140 capabilities and 103 work questions remain a validated **inventory with gaps**, not fully ratified implementation scope. Four M00.1 financial P0s remain OPEN / BLOCKING, 148 experiments planned and none VERIFIED.

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

The repository is public. Original non-English research documents remain in separate source custody; canonical Git content is in English. No customer secrets, digital license contents, payment links or private credentials belong in Git.
