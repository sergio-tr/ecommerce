# SER-135 — Explicit dependency DAG (post-PR32/PR33)

As-of (Europe/Amsterdam): 2026-11-12 20:00 CET  
Main (observed): origin/main @ 5be6c448291f74e76291d64adf8d0a4356bc2377  
Scope: Documentary DAG from decision-backlog.json and governance docs; no status change.

```mermaid
flowchart TD
  subgraph P0 [P0 financial blockers]
    A1[AUD-P0-01]
    A2[AUD-P0-02]
    A3[AUD-P0-03]
    A4[AUD-P0-04]
  end

  D05[D-05-MONGO (PENDING)]
  D06W[D-06-RETRY-WINDOW (policy accepted; values pending)]

  %% Hard prerequisites (decision-backlog.json)
  D05 --> A1
  A2 --> A3
  D05 --> A3
  A1 --> A4

  subgraph P1 [P1 design]
    B1[AUD-P1-01]
    B2[AUD-P1-02]
    B3[AUD-P1-03]
    B4[AUD-P1-04]
    B5[AUD-P1-05]
    B6[AUD-P1-06]
  end

  %% P1 edges
  A1 --> B1
  A3 --> B2
  D05 --> B2
  A1 --> B3
  D06W --> B3
  A3 --> B4
  D05 --> B5
  A4 --> B6
  B1 --> B6

  subgraph P2 [P2 documentary]
    C1[AUD-P2-01]
    C2[AUD-P2-02]
    C3[AUD-P2-03]
  end

  B2 --> C1
  C2deps[D-06-P01 & D-02-P01] --> C2

  %% Independent foundation gate (design-first)
  M01[M01-BOOTSTRAP-01 (DESIGN_FIRST_HOLD, G4 NOT_GRANTED)]
  SER135[#27 / SER-135 design gate]
  SER135 --> M01
```

Key readings
- M01 is technically independent but remains gated by #27 owner decision (DESIGN_FIRST_G3_GATE.md; m01-bootstrap-01-readiness.json).  
- P0 items are OPEN/BLOCKING for business finance; closing any P1/P2 does not imply P0 runtime proof.

