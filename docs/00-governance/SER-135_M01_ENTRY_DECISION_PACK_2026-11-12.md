# M01‑BOOTSTRAP‑01 — Scoped entry decision pack (design‑first hold)

As-of (Europe/Amsterdam): 2026-11-12 20:00 CET  
Main (observed): origin/main @ 5be6c448291f74e76291d64adf8d0a4356bc2377

Identity
- Work item: M01‑BOOTSTRAP‑01 — [GitHub #25](https://github.com/sergio-tr/ecommerce/issues/25) / Linear SER‑134  
- Source: docs/architecture/m01/M01_BOOTSTRAP_01_DEFINITION_OF_READY.md  
- Readiness JSON: docs/architecture/m01/m01-bootstrap-01-readiness.json

Gate status (documentary only)
- g3State: M01_DOCUMENTED; CROSS_PROJECT_DESIGN_FIRST_GATE_PENDING  
- g4Authorization: NOT_GRANTED  
- executionStatus: BLOCKED_BY_M00_G3_DESIGN_REVIEW  
- designGate: [#27](https://github.com/sergio-tr/ecommerce/issues/27) / SER‑135 — NOT_PASSED; requiredBeforeG4: true

DR07–DR10 snapshot
- DR07 PARTIAL — isolated mise Node 24.22.2 / pnpm 11.10.0; Nx/Nest/TS peers frozen install PASS; actual Nx scaffold NOT_RUN.  
- DR08 PASS (user‑reported host): Ubuntu 22.04.5 WSL2; Docker installed; K8s tools deferred.  
- DR09 identity confirmed: GitHub #25 / SER‑134; base SHA recheck before branching.  
- DR10 NOT_AUTHORIZED — explicit owner G4 still required.

Acceptance criteria (planned; not executed)
- AC01–AC14 in DoR (install, build/typecheck, /health/live, architecture boundary negative test, minimal CI, evidence hygiene).

Scope and explicit exclusions
- Independent Nx/Nest workspace with one API and one pure Domain lib.  
- No MongoDB/Stripe/Kubernetes/business code; no provider calls, secrets, or deployment.

Owner decision needed
- Explicit G3 review outcome on #27; optionally authorize a narrow M01 foundation‑only G4 without implying any finance G3/G5.

