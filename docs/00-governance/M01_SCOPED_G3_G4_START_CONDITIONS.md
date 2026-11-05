# CommerceCore — Scope-specific G3-to-G4 handoff and remaining closure thresholds

**Date:** 2026-11-05. **Status:** TECHNICAL REVIEW RECOMMENDATION / OWNER G3 SIGNOFF PENDING. **Owner:** @sergio-tr. **Tracking:** GitHub #27 / Linear SER-135. **No automatic G4 or merge authorization.**

## Why this gate is necessary

The 13 original findings mix **design acceptance**, **protocol correctness**, **provider/database runtime evidence** and **future milestone capabilities**. Requiring full G5 Stripe/worker/Mongo experiments before writing an empty NestJS API is a circular dependency; however, allowing financial operations from a mere proposed contract is unsafe. The correct solution is **milestone-scoped G3 followed by task-specific G4**, while preserving the global design-first review requirement and exact audit states. A project-wide audit status must never be silently inferred from one milestone's entry decision.

## Recommended milestone admission matrix

| Milestone/task | Design G3 required BEFORE implementation | Future G5 evidence required BEFORE claiming behavior verified | Current gate |
|---|---|---|---|
| **M01-BOOTSTRAP-01** Nx/pnpm, one NestJS `/health/live`, pure Domain library, negative architecture import tests and CI | ADR-M01-001 and M01-D01/02/06/07/08 documented, exact first-slice boundary, owner and reproducible version cohort | AC01–AC14 actual scaffold, test, lint/build and CI evidence | **DOCUMENTED, scope-reviewed candidate; global design-first hold #27 and task G4 NOT_GRANTED** |
| M01 Kubernetes/Helm local | K2/NET-A/DATA-A/STRIPE-A choices and exact networking, secret, resource/health bounds for the distinct issue | Real k3d/K3s/Helm deploy and failure/readiness probes | NOT_AUTHORIZED; k3d/kubectl/helm not installed |
| M01 Mongo physical persistence | D-05-MONGO exact contract, owner UnitOfWork/Indexes/transactions, secure local replica-set and backup | Commit-unknown/readback, transaction race, backup/restore, majority/journal checks | G3 candidate in PR #29, physical proof NOT_RUN |
| M02 Identity/CommerceCloud | Scoped TenantContext/actor-resource-action/guest/StorePolicy schema; principal trust and deny-by-default; exact Cloud ownership | Token/CSRF/BOLA/tenant isolation contract/e2e tests | M00.3 reference candidate; exact G3 outstanding |
| M03 Catalog/Listing/Offer/Quote | Versioned Product/Variant/Offer/immutable Quote, Money/tax and owner ports | Currency rounding, concurrent price updates, quote rejection tests | M00.4 reference candidate; exact G3 outstanding |
| M04 Inventory protected reservations | D-01-SM state guards, StockPool conservation and Store quotas, D-05-MONGO local atomicity and external possible-send permits | Last-unit/multi-line conservation, race and DB crash/readback tests | #5/#9 design candidates, no G5 |
| M04 Stripe financial payment/cancel/refund | P0-01..04 and D-03-CONFIG/Link/payment-method/capture/unknown/send contract, account+API version, no unsafe release | Real test-mode Session/unknown/3DS/refund/pause-worker fault cases and owner observations, P0 proof | **BLOCKED for business functionality** |
| M04 DigitalLicense exposure | Unique assignment/preparation, secret handling, actor entitlement and possible-disclosure frontier vs refund | Concurrent/duplicate key and lost response/reveal/refund tests | #4/#10 still open; no proof |
| M05–M09 additional contexts/services/HA/distribution | Exact new public contracts and scope-specific G3, backward compatibility | Milestone-specific integration, migration, restore and security tests | Deferred; does not automatically block non-business M01 foundation |

## Immediate closure checklist for the existing issues

**Done now:** GitHub #14 and #24 closed with merged documentary PR evidence. All 13 original findings have design recommendation coverage and original risk status retained.

**Design-ready candidates but NOT CLOSED:** #5 StockPool/Reservation, #6 Order/CheckoutProcess, #8 Stripe method/API, #9 Mongo, #11 glossary, #12 provider clocks. Some need exact user selection/contract checks and actual driver/provider G5 proof. #13 needs R1 per-statement approvals and 140 CAP exact source clauses; 90 R1 numbered sections are now classified at section granularity, 402 referenced CAP source IDs all resolve, but they are not literal semantic approvals.

**Never represent as closed without genuine G5:** P0 #1–#4 require provider/driver/worker/exposure validation and keep OPEN/BLOCKING until original closure criteria proven. #10 multiline safety needs real Inventory+Fulfillment behavior, not just draft.

## Bounded, reversible architecture decision policy

1. **Freeze invariants, not implementation choices:** money and commercial obligation ownership; positive evidence for external effects; inventory conservation; no unguarded license reveal; multi-tenant denial; durable idempotency.
2. **Version interfaces and mutable adapters:** Stripe API version and method policies, provider identity, storage implementation, event transport (Kafka later), frontend, Identity Provider, tax, physical inventory and public SDKs.
3. Restrict the **first payment integration increment** to one Stripe test account, card+3DS and automatic capture, with one initial Session per Order. An earlier *development increment* may use one OrderLine, but **approved final M04 must implement and test** the already-INCLUDED `CAP-INV-006` multi-line atomic reserve and `CAP-FUL-004` all-line preparation before disclosure. `CAP-PAY-012` wallets stay EXCLUDED. `CAP-PAY-010` Connect stays INCLUDED, with its account model still PENDING_DETAIL; the first increment may omit Connect fund routing without deleting that capability. **Multi-line is not deferred.** The permitted first-increment simplification is a staging tactic, not a change to the accepted M04 capability classification.
4. Do not set current historical `D-01-SM` / `D-05-MONGO` / `AUD-P1-02-FSM-MIN` ACCEPTED merely because the candidate makes technical sense. A human must approve an exact scoped ADR and its change impact.
5. Never convert G3 accepted contracts to G5 verified provider behavior without executed test-mode evidence.
6. An implementation branch G4 approval is scoped to one issue and one base SHA, not the entire eCommerce roadmap.

## M01 bootstrap admission steps the owner can explicitly authorize

1. Review **draft PR #29**, decide exact G3 baseline for M01 foundation and whether to accept a **narrow foundation-only sequencing exception** while G3 for financial products remains open. The original user-required global design-first hold is not overridden by this document.
2. Keep M01-BOOTSTRAP-01 identity #25/SER-134 and verify current `main` commit immediately before branching (observed `1c1550fc25374149ae8c8e58c2804b34cc7d5d27` on 2026-11-05).
3. DR07: isolated mise Node 24.22.2 / pnpm 11.10.0 / Nx 23.3.1 / Nest core 11.2.8 / CLI 11.0.24 / TS 5.9.3 peers+frozen lock already smoke passed. pnpm 11 `allowBuilds` needed for Nx; actual repository generator unrun, and that is an implementation AC, not evidence we must fabricate in preflight. **Do not change global Node22/pnpm12.**
4. DR08 PASS on user-provided WSL preflight; DR09 Issue identity confirmed, base SHA recheck; DR10 requires explicit, task-scoped G4 to produce code.
5. After G4: implement **only** Nx workspace, NestJS /health/live, one pure domain lib, negative imports tests, lint/typecheck/build, minimal SHA-pinned CI; AC01–AC14 actual evidence, draft PR linking #25/SER-134; no automatic merge or real Stripe/Mongo/Kubernetes.

## Current GO/NO-GO verdict

- **GO for further architecture research and review** under existing G3 issues, no product code.
- **NO-GO for financial production or Stripe/Mongo/Inventory business behavior** until exact contracts and G5 evidence.
- **M01 foundation remains NO-GO for product implementation solely because the user has not yet accepted the scoped design-gate policy and G4 is NOT_GRANTED**; technical version feasibility is already shown by the isolated smoke. This is a *human authorization hold*, not a claim the empty NestJS scaffold technically depends on all 148 financial experiments.

**This document is a proposed gate distinction, not a change of the current live readiness JSON or accepted architecture.**
