> **Interface proposal:** [M00.4 public ports and evolution contracts](M00_G3_PUBLIC_PORTS_AND_EVOLUTION_CONTRACTS.md) defines 18 conceptual owner-scoped ports, command/event envelopes, version/unknown semantics and M01–M09 expansion seams. **Design proposal, not executable implementation or approved final API.**

> **2026-10-30 design-review update:** The complete [13-audit initial executable-contract recommendations](M00_G3_ALL_13_AUDITS_RECOMMENDED_CONTRACTS.md) and [evolvable M00.2–M00.4/M02–M03 reference architecture](M00_G3_EVOLVABLE_REFERENCE_ARCHITECTURE.md) are now proposed in [draft PR #28](https://github.com/sergio-tr/ecommerce/pull/28). Their recommendations do **not** supersede accepted ADRs or constitute executed G5 evidence. [All 103 planning entries](../../planning/wave1/M00_G3_PLANNING_RECOMMENDATIONS.md) have individually proposed initial dispositions; exact-ID ratification and source-oracle comparisons remain pending.

# CommerceCore — M00 Design Resolution Dossier

**As of 2026-10-30 | Owner @sergio-tr | Status: RECOMMENDED PROTOCOLS — EVIDENCE BLOCKERS OPEN**

## Four P0 design decisions and review handoff

1. [All four final recommended P0 protocols and next expected user steps](P0_4_DECISIONS_AND_NEXT_STEPS.md)
2. [AUD-P0-01: financial dispatch and release](P0_01_FINAL_DESIGN_DECISION.md)
3. [AUD-P0-02: unknown Stripe Session ID](P0_02_FINAL_DESIGN_DECISION.md)
4. [AUD-P0-03: captured Order obligation](P0_03_FINAL_DESIGN_DECISION.md)
5. [AUD-P0-04: key disclosure vs refund](P0_04_FINAL_DESIGN_DECISION.md)

The decisions above select **conservative initial educational-scope protocols** but leave all P0 evidence gates open until observed fault-injection results. A successful documentation merge may approve design direction; it is not test-mode verification or authorization to operate with live money.

## Read order

1. [Structured blocker register](design-resolution-register.json) — twelve audit/contract groups, owners, chosen conservative design and actual remaining proof.
2. [All 13 original audit findings](ALL_13_AUDITS_RESOLUTION_MATRIX.md) — every AUD-P0/P1/P2 mapped to an explicit recommended decision, exact missing evidence, milestone and existing tracker.
3. [Financial admission and unknown Stripe recovery](P0_FINANCIAL_ADMISSION_AND_RECOVERY.md).
4. [Captured Order obligation and Refund/Disclosure exclusion](P0_ORDER_CAPTURE_REFUND_AND_QUIESCENCE.md).
5. [MongoDB owner-local atomicity, StockPool and DigitalLicense](MONGO_INVENTORY_LOCAL_ATOMICITY.md).
6. [Guest/Store authorization, one-store test-mode provider profile and readiness](SECURITY_PROVIDER_AND_READINESS.md).
7. [Cross-context command catalog and implementation exit gates](CROSS_CONTEXT_CONTRACTS_AND_EXIT_GATES.md).

The original D-01..07 ACCEPTED policy constraints and the four AUD-P0 OPEN/BLOCKING findings have NOT been removed, reduced or reinterpreted. Each selected design explicitly defines a safe UNKNOWN/INCIDENT holding behavior when a provider-effect negative proof is impossible. This satisfies the safety intention in a design proposal but does NOT prove automatic progress, commercial completion or Stripe/Mongo behavior.

### Recommended choice and consequences

The safe M04 starter is **one scoped Store and Stripe test-mode merchant account** with hosted card/3DS and automatic capture, owner-local MongoDB transactions, durable saga/outbox/inbox and unique license allocation. Exact provider and driver configuration is still pending effective test-mode validation. Stripe Connect for multiple merchants and any production tax/real-money acceptance are NOT smuggled into this first slice.

Operationally, the system may deliberately retain a protected Reservation forever when an old potentially chargeable HTTP request cannot be proven neutralized. That is a recorded commercial incident and a potential availability trade-off, **not** a successful cancellation or justification for Inventory release.

### Objective readiness

- **Can start after explicit approval:** an independent M01 local workspace/tooling/quality infrastructure implementation task with approved toolchain and boundary tests.
- **Cannot yet assert:** financial, stock, refund and reveal domain correctness in code; complete M00.1 R2; G3 provider-proof closure; executed G5 tests.
- **Must do next:** source reconcile original R1 and 110 test oracles; settle per-command schema and specific Stripe account/Link/capture policy; plan test-mode fault injection; issue-level G3 acceptance; physical driver experiments when authorized.

**No application code, repository issue for implementation, Stripe operation, Mongo infrastructure, secret or live-payment action has been created by this design dossier.**
