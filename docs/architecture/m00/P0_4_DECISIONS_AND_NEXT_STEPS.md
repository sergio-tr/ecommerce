# M00.1 P0 Design Decisions — Review, Closure Criteria and Merge Handoff

**Date:** 2026-10-30 · **Owner:** @sergio-tr · **Project intent:** educational, local-first, Stripe test mode, not initially a commercial product.  
**Decision provenance:** user requested the best recommended choices for the four P0 blockers and clearly identified next actions. This dossier makes those recommendations explicit, but does **not** claim that external provider behavior or fault-injection results were observed. Historical D/AUD status and test evidence are preserved.

## Final recommendation, in one sentence

**Use one Stripe card/3DS Checkout attempt per initial M04 Order, protected inventory before Stripe admission, a permanent potential-send record, owner-local transactional Inbox/Outbox, prepare-all-licenses-before-reveal, and fail-closed investigation whenever an external charge, refund or key disclosure could still occur.**

This is simpler than a generalized financial/compensation engine and compatible with the project being for learning, while preserving accepted D-01..07 safety invariants. It intentionally sacrifices some availability and automatic recovery instead of inventing guarantees that Stripe/browser/Mongo cannot supply.

## Four decisions — technically selected vs proven

| Existing audit | Recommended solution and selected initial scope | Alternatives rejected | Design state | Remaining proof / exact exit |
|---|---|---|---|---|
| AUD-P0-01 | Durable possible-send ledger and monotonic closure barrier; permit stock release only if **all** formerly enabled sends and provider effects are conclusively neutralized, otherwise keep protected | TTL release; expiring worker lease; purely in-process lock | DESIGN DECIDED FOR REVIEW | Actual paused-old-worker and Stripe create/expire tests, including unknown sends; OPEN/BLOCKING until observed |
| AUD-P0-02 | Immutable Stripe account/mode/idempotency metadata, no blind POST retry after response loss, positive reconciliation and incident quarantine of permanently unknown Session IDs | unbounded key reuse; negative search as proof | DESIGN DECIDED FOR REVIEW | Real Stripe loss/correlation and idempotency-window tests; inability to obtain negative proof is explicitly handled as permanent hold; OPEN/BLOCKING |
| AUD-P0-03 | Preexisting Order+CheckoutProcess; Payments captured fact and Outbox atomic; Ordering Inbox+commercial decision+saga continuation atomic; Mongo replica-set transactions with operation readback | browser redirect trust; event-before-persist; distributed transaction | DESIGN DECIDED FOR REVIEW | Real Mongo commit-unknown and Stripe testmode capture/out-of-order deliveries; OPEN/BLOCKING |
| AUD-P0-04 | Whole-Order license preparation before any reveal; record possible exposure **before sending**; no non-delivery full refund after possible key exposure; unique idempotent Refund against original captured payment | stale Order-based refund; JWT/lease used as sole fence; full refund of partly exposed keys | DESIGN DECIDED FOR REVIEW | Old reveal worker vs refund race, lost HTTP response, idempotent Refund tests; OPEN/BLOCKING |

## Scope limits consciously accepted for learning project

1. **No live-money transactions.** Use Stripe `sk_test_` and `whsec_` test-mode credentials only after separate local-implementation approval; never commit secrets. Test cards and simulated license keys only.
2. **One hosted Checkout Session per initial Order.** A second commercial PaymentAttempt under the *same obligation* is not exposed in the first vertical. The historical D-06 sequential retry policy and AUD-P1-03 double admission-window direction are retained for later work, not reinterpreted as false.
3. **No automatic stock release while unknown.** This could leave test inventory unavailable indefinitely; the operator must investigate, and may report an unresolved incident. It is intentionally not a promise of universal automatic cancellation.
4. **No automatic full refund when any key may already have been exposed.** The business resolution remains an incident; a lawful post-delivery return would require its own future policy.
5. **No claim of multiline atomic network delivery.** For any multiline purchase eventually enabled, prepare every line before exposure; until M00.2 validates this, initial single-line feature exposure is the recommended simplest build. The future framework retains the multiline obligation.
6. **One explicit merchant Stripe test account, card + 3DS and automatic capture candidate.** Multi-merchant Connect, production settlement/tax/legal questions are later milestones; actual effective payment methods and capture evidence must be verified.
7. **Short owner-local Mongo transactions on a local replica set.** A single-node replica set helps with transaction semantics in a developer environment but is **not** a high-availability/failover certification; use disposable multi-node topology for actual failover tests later.

## Requirements to convert the decisions into code

Before a financial implementation issue is G3-ready, approve exact fields/preconditions/guards and response/error contracts in:
- [AUD-P0-01 dispatch/closure](P0_01_FINAL_DESIGN_DECISION.md)
- [AUD-P0-02 provider recovery](P0_02_FINAL_DESIGN_DECISION.md)
- [AUD-P0-03 capture and obligation](P0_03_FINAL_DESIGN_DECISION.md)
- [AUD-P0-04 license exposure/refund](P0_04_FINAL_DESIGN_DECISION.md)
- [shared authority and commands](CROSS_CONTEXT_CONTRACTS_AND_EXIT_GATES.md)
- [Inventory/Mongo persistence boundary](MONGO_INVENTORY_LOCAL_ATOMICITY.md)

Each future issue must link its existing original audit/Linear/GitHub tracking ID, exact behavioral contract, owners, invariant, failure injection and expected persisted evidence. No new issues are created in this document.

## Distinguish types of readiness

- **Document merge:** Allowed after user reviews this trade-off record, checks no historical decision was silently promoted, and accepts that four P0s may remain OPEN/BLOCKING as **verification questions** while design choices are documented.
- **M01 local engineering implementation:** Can be authorized separately after exact tooling/module/CI specifications; does not require actual Stripe P0 test evidence.
- **M04 payment/reveal implementation:** Needs approved G3 command/physical contracts. Certain P0 tests by nature require implementation in a disposable local test environment; do not require G5 before writing the *testable implementation*, but do require G5 before calling the capability verified.
- **Production/live money:** Not in project scope and never implied by documentation merge.

## Next expected USER actions — explicit and sequential

1. **Review four decisions** (especially indefinite held stock, one Session per Order, conservative potentially exposed keys, and one-test-merchant profile). You have delegated use of the recommended options; no additional decision is required to retain these defaults. If you disagree, specify the exact alternative by audit ID and the accepted risk.
2. **Review [PR #21](https://github.com/sergio-tr/ecommerce/pull/21)** once the four decisions and this handoff are in it. Check it targets `main`, contains only English design/governance files, and does not modify historical R0.x statuses or falsely mark tests VERIFIED. **Merge is your separate choice**; do not mark M00.1-R2 VERIFIED because docs merged.
3. **Approve the first local M01 atomic implementation slice** (workspace, toolchain lock, module boundaries, CI/testing) under its own feature branch. Confirm exact runtime/dependency versions and working OS/environment.
4. **Implement a deterministic payment-provider simulator and fake browser disclosure fault injection** behind separate hexagonal ports, then an authorized Stripe test-mode adapter. The simulator proves application guards under injected faults; it is **not** authoritative evidence of Stripe semantics.
5. **Run Stripe test-mode and Mongo transaction/failover evidence suite** with captured logs, test commit, expected/observed financial account/mode, persisted operation IDs and screenshots or structured logs. Only then ask to close the corresponding P0 audit as VERIFIED.
6. **Resolve M00.2–M00.4 concrete FSM, tenant/security and contract details** before the corresponding Inventory, Identity and Checkout feature implementation. Do not invent final DTOs based on this prose alone.
7. **Update Linear/GitHub audit issues and readiness gates** only based on actual reviewed contracts and executed evidence. Each reopened issue includes exact test case + observed result.

## Outstanding user choices (deferred, not blocking design documentation merge)

- Exact Stripe Session expiration and D-06 maximum Sessions; for M04 initial **one attempt** means successor policy remains disabled.
- Provider-effective disabling of Link/wallets and Stripe Connect merchant topology: recommended one test merchant for first slice, but exact Stripe test account setup must be inspected.
- Exact security/session/MFA, accessibility, pricing rounding and Mongo physical index/transaction schema.
- Whether to later prioritize operator self-service recovery or accept permanent rare UNKNOWN quarantines for an educational demo.

**Bottom line:** The four *design decisions* can be reviewed and accepted in a documentation merge without fraudulent closure of their *provider and system-level verification obligations*. The user is not being asked to buy services, deploy live systems, or write application code at this stage.
