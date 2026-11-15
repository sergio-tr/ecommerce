# SER-128 — Static terminology conformance (docs-only)

Status: REVIEW DOCS-ONLY; no runtime/provider verification. Owner acceptance, G3 and G4 remain NOT_PASSED.

## Context
- Source branch: cursor/ser-128-static-evidence-link-repair-23
- Base main SHA: 9333abf98fb89ccced2e017d77d2fdd8c7bb6d94
- Method: repository documentation inspection only; quotes and line anchors below cite current main.
- Scope: VOC-01..VOC-08 from `docs/architecture/m00/AUD_P2_01_EXACT_GLOSSARY_CONTRACT.md` “Contract/static review cases”. No policy changes.

## Results matrix

| ID | Verdict | Path:Line(s) | Quoted evidence |
|---|---|---|---|
| VOC-01 | PASS | docs/03-domain/context-map.md:L37 | “Order.PENDING_PAYMENT … no es prueba de que Stripe no haya cobrado.” |
|  |  | docs/architecture/m00/M00_G3_PUBLIC_PORTS_AND_EVOLUTION_CONTRACTS.md:L11 | “`Order.PENDING_PAYMENT` is not evidence of non-payment” |
| VOC-02 | PASS | docs/04-audit/AUD-P1-02-authority-and-coordination.md:L40 | “those views cannot authorize financial or fulfillment effects.” |
| VOC-03 | PASS | docs/03-domain/context-map.md:L40 | “Refund.PENDING … not completed commercial compensation.” |
|  |  | docs/architecture/m00/M00_G3_PUBLIC_PORTS_AND_EVOLUTION_CONTRACTS.md:L11 | “`Refund.PENDING` is not settled refund” |
| VOC-04 | PASS | docs/architecture/m00/M00_G3_PUBLIC_PORTS_AND_EVOLUTION_CONTRACTS.md:L51 | “Ordering Inbox … updated atomically | Duplicate idempotent; … no erasure of capture” |
| VOC-05 | PASS | docs/04-audit/AUD-P1-02-authority-and-coordination.md:L40 | “those views cannot authorize … effects.” |
|  |  | docs/architecture/m00/M00_G3_PUBLIC_PORTS_AND_EVOLUTION_CONTRACTS.md:L84 | “Do not compress these owner-local states into `CheckoutStatus`” |
| VOC-06 | PASS | docs/architecture/m00/M00_G3_PUBLIC_PORTS_AND_EVOLUTION_CONTRACTS.md:L13 | “Tenant and Store IDs are validated against trusted actor context.” |
| VOC-07 | PASS | docs/architecture/FINANCIAL_INVARIANTS.md:L51 | “requires_capture is not equivalent to capture.” |
|  |  | docs/architecture/m00/AUD_P1_04_P2_02_STRIPE_API_COMPATIBILITY_AND_TIME_POLICY.md:L34 | “on unexpected `requires_capture` … retain obligation … never disclose a key.” |
| VOC-08 | PASS | docs/architecture/m00/M00_G3_PUBLIC_PORTS_AND_EVOLUTION_CONTRACTS.md:L55 | “Persist POSSIBLE_DISCLOSURE … Lost response means maybe exposed; never reset saleable” |

Notes and limitations:
- This is a static documentation check. No Stripe/Mongo/worker calls executed. VOC results are not runtime VERIFIED.
- Owner decision for #11 (AUD-P2-01) remains OPEN; 13 audits OPEN (four P0 BLOCKING); 148 experiments TEST_PLANNED/NOT_RUN; G3 NOT_PASSED; G4 NOT_GRANTED.

## Commands and outputs (repro)

```
# JSON validity
jq -e . docs/02-decisions/decision-register.json

# Link check for corrected ledger and this file (relative resolution only)
rg -No "\[[^\]]*\]\(([^)]+)\)" docs/00-governance/M00_G3_RECOMMENDATION_REVIEW_LEDGER.md | wc -l
rg -No "\[[^\]]*\]\(([^)]+)\)" docs/00-governance/SER-128_STATIC_TERMINOLOGY_CONFORMANCE_2026-11-15.md | wc -l
```

