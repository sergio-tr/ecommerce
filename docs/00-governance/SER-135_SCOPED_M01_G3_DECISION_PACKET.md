# SER-135 — Scoped M01 G3 Approval Decision Packet (Foundation-Only)

Status: DRAFT for owner review (no code or merge authorization)

Date: 2026-11-06

Owner (accountable): @sergio-tr

Tracking: GitHub #27 (G3 design-first), Linear SER-135; implementation parked in GitHub #25 / Linear SER-134

## 1) Scope (foundation-only)

Authorize a limited G3 “documentary acceptance” for M01-BOOTSTRAP-01 as a pure engineering foundation:
- One Nx/pnpm workspace
- One NestJS CommerceCore API exposing GET `/health/live`
- One pure Domain library (no NestJS/Stripe/Mongo imports)
- Architecture negative import tests and minimal PR CI (lint/typecheck/unit/architecture rules)

Explicitly EXCLUDED from this packet (require separate tasks and approvals): Kubernetes, MongoDB, Stripe/provider experiments, any business aggregates or commerce logic, image build/release execution, cluster/ingress resources, external network calls.

## 2) Canonical contracts and documentary evidence (what exists today)

- ADR-M01-001 ACCEPTED (K2 + NET-A + DATA-A + STRIPE-A): `docs/02-decisions/ADR-M01-001-kubernetes-first-and-test-stripe.md`
- M01-D01…D08 documentary specifications present (no implementation started):
  - `docs/architecture/m01/M01_D01_TOOLCHAIN_COMPATIBILITY.md`
  - `docs/architecture/m01/M01_D02_WORKSPACE_AND_DEPENDENCIES.md`
  - `docs/architecture/m01/M01_D03_K8S_TOPOLOGY_AND_NETWORK.md`
  - `docs/architecture/m01/M01_D04_BUILD_DEPLOY_AND_ROLLBACK.md`
  - `docs/architecture/m01/M01_D05_MONGODB_PERSISTENCE_AND_RECOVERY.md`
  - `docs/architecture/m01/M01_D06_CONFIGURATION_SECRETS_AND_TRUST.md`
  - `docs/architecture/m01/M01_D07_DEVELOPER_EXPERIENCE_AND_OBSERVABILITY.md`
  - `docs/architecture/m01/M01_D08_CI_TEST_AND_CHANGE_GATES.md`
- M01-BOOTSTRAP-01 Definition of Ready finalized; machine-readable readiness exists:
  - `docs/architecture/m01/M01_BOOTSTRAP_01_DEFINITION_OF_READY.md`
  - `docs/architecture/m01/m01-bootstrap-01-readiness.json`
- Gate snapshot (`docs/02-decisions/m01-kubernetes-first-decision-register.json → gateStates`)
  - G3: D01_D08_DOCUMENTED_PHYSICAL_PEER_HOST_AND_EVIDENCE_PENDING
  - G4: M01_BOOTSTRAP_DOR_FINALIZED_NOT_AUTHORIZED
  - G5: NOT_RUN
- Global G3 design-first gate remains OPEN: `docs/00-governance/DESIGN_FIRST_G3_GATE.md`
- GitHub/Linear state (queried 2026‑11‑06, Europe/Amsterdam):
  - #27 “[M00-G3] Review all open design audits …” → OPEN
  - #25 “[M01‑BOOTSTRAP‑01] Reproducible Nx/NestJS engineering baseline” → OPEN
  - PR #29 “docs(governance): review G3 contracts …” → MERGED at main@346319f216f58506e4719c7b0ce65d488333bad3
  - SER‑135 → In Progress; SER‑134 → Backlog

## 3) P0/provider evidence and approvals NOT satisfied here

- Four P0 audits remain OPEN/BLOCKING; G5 evidence TEST_PLANNED / NOT_RUN. This packet does not alter their status or claim provider proof. These provider experiments are **not** preconditions to the M01 foundation task; they belong to later M04 increments (see `docs/architecture/m01/M01_REMAINING_GAPS_AND_DEPENDENCIES.md` — “There is no requirement to finish M04 provider tests before starting that independent foundation” and `docs/architecture/m01/M01_D08_CI_TEST_AND_CHANGE_GATES.md` — C7 “never made precondition for basic M01 bootstrap”).
- DR07 PARTIAL; DR08 PASS (user‑reported); DR09 identity confirmed but base must be rechecked when branching; DR10 NOT_GRANTED
- Exact “owner ratification” for M01 foundation is pending; no G4 is requested here

## 4) Immutable ownership and invariants preserved

- M04 CAP scope remains unchanged:
  - INCLUDED: CAP‑INV‑006 (multi‑line all‑or‑nothing), CAP‑FUL‑004 (all‑line prepare‑before‑reveal), CAP‑PAY‑010 (Stripe Connect architecture, account model PENDING_DETAIL)
  - EXCLUDED: CAP‑INV‑005 (shared pool/store quotas)
  - COMPOSITE CAP‑PAY‑012: wallets **DEFERRED**, Stripe Link **PENDING** (cannot share one exact status); ambos fuera de alcance sin nueva decisión explícita
- ADR precedence and decision‑register states are normative; this packet cannot supersede them
- No live Stripe, no Mongo schema/trust claims, no Kubernetes install implied

## 5) Decide now vs defer

Decidable now (requires owner ratification):
- Ratify that ADR‑M01‑001 + M01‑D01…D08 constitute the M01 foundation‑only G3 “documentary specification,” independent from M04 provider evidence
- Acknowledge DoR/acceptance AC01–AC14 as the exact acceptance gates for the future M01‑BOOTSTRAP‑01 implementation PR (all NOT_RUN today)
- Confirm exclusions above and that this G3 packet does not reclassify any M04 capability

Deferred by design:
- Provider/driver experiments and evidence (P0/P1/P2 audits) → M04 and related tasks
- Kubernetes/Mongo execution details (D04/D05 physicals) → later M01 slices
- Any live‑money enablement or irreversible operational privilege → out of scope

## 6) Reversible choices recorded

- Helm remains a subordinate D04 selection candidate; not a ratified standalone protocol
- Node/Nx/Nest/TS/pnpm version cohort remains a candidate until DR07 passes with a clean frozen‑lock install on the target host

## 7) Exact owner approval questions (answer Yes/No on the PR)

1. Ratify: “For M01‑BOOTSTRAP‑01, ADR‑M01‑001 and M01‑D01…D08 together are ACCEPTED as the documentary G3 foundation‑only specification. This does not alter any ADR/test/audit statuses.”
2. Confirm: “This scoped G3 acceptance does not change M04 scope: CAP‑INV‑006, CAP‑FUL‑004 and CAP‑PAY‑010 remain INCLUDED; CAP‑INV‑005 remains EXCLUDED; CAP‑PAY‑012 es compuesta: wallets DEFERRED, Link PENDING.”
3. Confirm: “AC01–AC14 serán requeridos para fusionar la futura PR de implementación de M01‑BOOTSTRAP‑01. La evidencia P0/P1 de proveedor permanece NOT_RUN y NO es requisito para esa PR de fundación; sí lo será para las PRs financieras de M04.”
4. Confirm: “G4 is NOT being granted by this packet. DR07/DR08/DR09 must be satisfied and an explicit DR10 authorization recorded before creating an implementation branch.”
5. Administrative: “A future branch, if authorized, will be based on current origin/main commit 346319f216f58506e4719c7b0ce65d488333bad3 (to be rechecked at branch creation) and will link #25/SER‑134.”

## 8) Checks executed for this packet (2026‑11‑06)

- JSON parse OK → `docs/architecture/m01/m01-bootstrap-01-readiness.json`; `docs/02-decisions/m01-kubernetes-first-decision-register.json`; `docs/02-decisions/decision-register.json`
- Structured links OK → `firstTask.definition` and `firstTask.structured` exist
- Policy cross‑checks (documentary):
  - `docs/00-governance/DESIGN_FIRST_G3_GATE.md` → gate OPEN; DR10 NOT_AUTHORIZED
  - `docs/00-governance/CURRENT_AUTHORITY_2026-10-30.md` + `CURRENT_STATE.md` → M01 DoR finalized; DR07–DR10 pending; implementation NOT AUTHORIZED

Known documentary note (non‑blocking): `CURRENT_STATE.md` cites historical base SHA 8140b11 from preflight; HEAD is 346319f (PR #29). DR09 requires base recheck when creating an implementation branch.

---

This packet is documentary. It cannot grant G3/G4 or change decision‑register statuses. If approved, proceed later with explicit DR10 for implementation; all audits remain unchanged and tests NOT_RUN. 
