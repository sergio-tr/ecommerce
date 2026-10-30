# W1-SCOPE-B01 — Recorded Scope Ratification

**Approval date:** 2026-10-30 · **Owner:** @sergio-tr · **State:** `ACCEPTED — OPTION A SCOPE; TAX SUBDECISION PENDING` · **No implementation authorization.**

The user replied **“I approve it”** to the immediate request to choose W1-SCOPE-B01 Option A while selecting tax treatment separately between T1 and T2. This therefore ratifies **the bounded Store-local Catalog/Listing/Offer/Quote scope direction**, but **does not** choose the tax option or complete a technical specification.

| Capability ID | M04 functional disposition | Exact ratified limit | Historical approval status |
|---|---|---|---|
| CAP-CAT-003 | EXCLUDED | Postpone shared tenant-master propagation and multiple-store reuse only; keep tenant/store identity and future master-reference compatibility. | UNMODIFIED |
| CAP-CAT-004 | INCLUDED | Store-owned Product/Variant identity, validated sellable reference and link to one Listing/Offer; no general master import/override engine. | UNMODIFIED |
| CAP-CAT-005 | EXCLUDED | Runtime-extensible typed tenant attribute schemas postponed; fixed validated mandatory Product/Variant fields retained. | UNMODIFIED |
| CAP-CAT-006 | EXCLUDED | Master-to-local inheritance, propagation and versioned field overrides postponed; preserve explicit Store-owned values. | UNMODIFIED |
| CAP-CAT-008 | EXCLUDED | Product translation and managed media pipeline postponed; accurate product name and terms remain essential. | UNMODIFIED |
| CAP-MER-003 | EXCLUDED | Only multi-channel publication policies and projections postponed; one explicit storefront Listing/Offer publication gate is mandatory. | UNMODIFIED |
| CAP-PRC-004 | **UNRESOLVED** | Select T1 demonstration tax adapter or T2 explicitly disclosed synthetic tax fixture separately, preserving valid exact-money and accepted-Quote invariants | R0.3-08 remains `PROPOSED — SELECTED` |

## What must still be true

- Product/Variant identities, one Listing publication gate, one eligible Offer and immutable accepted Quote remain authoritative through their owned contexts; no hardcoded eGame-only bypass.
- Exact money and currency invariants apply regardless of which nonproduction tax treatment is chosen.
- The exclusion of advanced multi-store capabilities is **an M04 delivery-scope decision**, not an overruling of accepted `R0.2-02`, `R0.2-03`, `R0.2-07` or selected `R0.3-03` future framework requirements.
- `W1-AP-01` remains the full initial commercial journey including cancellation, refund, authorized license reveal and recovery.
- `AUD-P0-01..04` remain OPEN / BLOCKING. `AUD-P1-03` double retry windows remain NOT RATIFIED.
- No M00.1-R2, application code, infrastructure, implementation issue, Stripe or Mongo verification is authorized or created by this record.

## Tax choices left open

**T1 (recommended):** maintain historical `R0.3-08` demonstration tax port and a clearly non-production adapter. **T2:** explicitly approve an isolated synthetic tax calculation/fixture with adequate Quote semantics and conspicuous no-live-tax constraint. Neither can be inferred from the phrase “I approve it”. Choose one before the final M03 Quote specification or first M04 financial test-mode purchase.

## Trace

Original scope review: [M04_29_DECISION_REVIEW.md](M04_29_DECISION_REVIEW.md) → [M04_APPROVAL_BATCHES.md](M04_APPROVAL_BATCHES.md) → [M04_SCOPE_MATRIX.md](M04_SCOPE_MATRIX.md) → B01 Option A ratification. Governance: [APPROVAL_RECORD.md](APPROVAL_RECORD.md). Other batch decisions B02–B06 remain PENDING.
