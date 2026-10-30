# M00.1 — Recommended executable design contracts for all 13 audits

**Iteration:** 2026-10-30. **Status:** RECOMMENDED BASELINE FOR OWNER REVIEW, **NOT** new unilateral ratifications, implementation, closed audits or G5 evidence. **Owner:** @sergio-tr. **Issues:** GitHub #1–#13 / Linear SER-118–SER-130. This supplements, rather than overwrites, the ratified D-01..D-07 and AUD-P1-02 ownership/C-01..C-08 policies. The original acceptance checklists remain open.

## Cross-cutting execution principles

1. **Facts and decisions are not interchangeable:** Stripe payment/Refund facts belong to Payments; accepted commercial obligation and commercial resolution belong to Ordering/Order; durable saga operations and incorporated results belong to Ordering/CheckoutProcess; protected/committed stock belongs to Inventory; secret assignment/disclosure belongs to Fulfillment; a read projection is NEVER a command guard.
2. Every side-effect candidate must have immutable `operationId`, tenant/store/account/mode, source Order and generation, parameter hash, policy version, causation/correlation, attempts and durable send/response/evidence records. Store both operations that *may* have executed and known provider effects. No browser success or absence of webhook proves no charge.
3. A local owner transaction may atomically persist its state transition + Inbox deduplication + Outbox work. It must not cross another context's private collections. HTTP/provider calls occur **outside** the transaction.
4. Never translate timeout/lease expiration into external-effect cancellation. Concurrency fences can prohibit *future newly admitted* work; they cannot retract an old network send already initiated or paused after a final DB check.
5. If positive evidence is missing, preserve outstanding obligation/protected capacity and investigate. Safety takes priority over automatic cleanup; all indefinite holds have an operational owner and audit trail.
6. Begin with Stripe **test mode**, one seller account, cards/3DS, one commercial attempt per Order and one key per OrderLine; keep model and ports capable of later configurable methods, retries, multiple stores and other fulfillment types.
7. State names below are **aggregate-local suggested vocabulary**; not an invented universal global checkout FSM. Command guards depend on authoritative persisted records rather than one projected status.

## Design packet by existing finding

### AUD-P0-01 / #1 / SER-118 — Financial exclusion and Inventory release

**Recommendation:** Payment admission in Payments requires a persistently versioned `FinancialOpportunity` bound to tenant/store/Order/generation/Reservation and an immutable send-intent record **before** the worker can invoke Stripe. Ordering's cancellation creates monotonic closure intent, prohibits *new* admissions and requests reconciliation of all older possibly sent operations. Inventory releases only with a positive, operation-scoped `ReleasePermit` referencing every relevant send and the exact reservation version. **Never** infer release from TTL, expired lease, a successful close write or `Order.PENDING_PAYMENT`.

**Race policy:** old worker after DB check but before actual HTTP can still send; a cancellation barrier alone does not make it impossible. If that old operation cannot be conclusively neutralized, hold the capacity / incident even if its business window has elapsed. Explicitly separate (a) no new work admitted, (b) no already-sent collectible opportunities, (c) provider effect reconciled, (d) permit consumable by Inventory. No distributed transaction claim.

**Alternative:** automatically free stock on deadline/lease -> rejected (double-charge/oversell). Dedicated single durable provider dispatcher with serialized send permits -> possible future optimization, not universal network quiescence proof. **Oracle:** pause worker before HTTP, cancel, resume, attempt release; release must fail unless every old send is positively neutralized. **Residual:** provider/worker timing proof G5 OPEN/BLOCKING.

### AUD-P0-02 / #2 / SER-119 — Unknown Stripe Checkout Session ID

**Recommendation:** immutable `ProviderOperation` records test/live mode, Stripe account, API version, idempotency key, hashed request body, metadata correlation, attempted send and any provider IDs. Distinguish request **unknown outcome**, known Session open/expired, PaymentIntent charge/captured, and future POST admissibility. Webhook inbox records provider account, signature validation, event ID, version and provider evidence before acknowledgement.

**Recovery:** retrieve only positively identified objects; use webhooks, bound lookups and account-scoped searches as hints. A search miss is not positive proof of absence; idempotency-key retention is not indefinite and replay can itself create a new effect. When identity/negative proof cannot be established, quarantine and forbid replacement attempt and unsafe release. Disabled recovery URLs in initial slice; if enabled later, treat them as new possibly collectible opportunities.

**Alternative:** blind retry with same key after response loss -> rejected; periodic metadata scan as authority -> rejected. **Oracle:** lost Session create response + old delayed POST + key retention expiry; no second collectible admission. **Residual:** provider evidence capability G5 OPEN/BLOCKING.

### AUD-P0-03 / #3 / SER-120 — Captured funds and durable Order obligation

**Recommendation:** create immutable Order identity and accepted Quote snapshot **before** Payment authorization. Persist Payment/Attempt/provider capture evidence + Payments Outbox in one Payments owner-local transaction; persist Ordering Inbox + incorporated captured fact + Order commercial resolution/CheckoutProcess continuation in one Ordering owner-local transaction (or one Ordering aggregate document if physically viable). No cross-context atomic write, no event-before-commit.

**Semantics:** Checkout Session `complete`, `payment_status=paid`, PaymentIntent `requires_capture` and a final captured Charge are different provider observations. Map into Payments' durable `CapturedFundsFact` only after account-scoped evidence meets the chosen capture contract; later refunded/disputed facts do **not** erase historical capture. `Order.PENDING_PAYMENT` is not negative proof; `Order.PAID_AWAITING_ALLOCATION` retains the outstanding delivery/compensation obligation. Idempotent Inbox handles duplicates, unordered events and downtime. Unknown DB commit -> readback by operation ID.

**Alternative:** business effect from browser return, direct write to Ordering from Payments, global DB transaction across contexts -> rejected. **Oracle:** payments capture while Ordering offline; replay/out-of-order webhook and uncertain transaction commit reconstruct exactly one obligation. **Residual:** actual Stripe/Mongo G5 OPEN/BLOCKING.

### AUD-P0-04 / #4 / SER-121 — Irreversible secret exposure vs refund

**Recommendation:** Ordering is the exclusive commercial-resolution authority: delivery path versus refund authorization, never both incompatibly. Fulfillment prepares **all** required keys and durable assignments before any exposure. Before sending a response containing secrets, persist `POSSIBLE_DISCLOSURE` for exact license/actor/grant/op version; once possible, it is not saleable or automatically refundable under a `not delivered` assumption. Payments executes a uniquely identified authorized Refund and reports actual provider state; `Refund.PENDING/UNKNOWN` is NOT compensation done.

**Concurrency:** effect permits use generation/version + durable operation state, never only a lease or JWT expiry. A worker delayed after a release authorization may still disclose; inability to prove revocation/quiescence means halt automatic refund, investigate, retain evidence. Legal/voluntary refund after disclosed license is a separately authorized policy (does not reuse the key).

**Alternative:** immediate refund after delivery HTTP timeout; refund based solely on stale Order view -> rejected. **Oracle:** worker prepared to reveal, timeout/refund race, then old worker resumes; no contradictory automatic disposition. **Residual:** real disclosure and refund fault tests G5 OPEN/BLOCKING.

### AUD-P1-01 / #5 / SER-122 — Reservation and StockPool

**Recommendation:** Inventory owns StockPool + Reservation and a single logical capacity ledger. Proposed local Reservation capacity semantics `RESERVED` (reviewable TTL), `PAYMENT_PROTECTED`, `COMMITTED`, `RELEASED` with versioned, guarded, monotonic transitions; no payment states in Inventory. Atomic StockPool compare-and-swap/counter and Reservation/command deduplication in one owner-local Mongo transaction for separate documents. Global supply and each explicit store quota must remain nonnegative. Actual `TTL` merely schedules review, never deletes protected holds. **Alternative:** event-only eventual decrement; one giant shared multi-tenant document -> rejected for default; keep single-document atomicity as future optimization when invariant fully contained. **Oracle:** last-unit reservation / duplicate commit / two stores and crash.

### AUD-P1-02 / #6 / SER-123 — Three authorities and saga

**Recommendation:** retain accepted ownership: Order identity/quote/obligation/resolution; CheckoutProcess durable saga pending operations and incorporated outcomes; Payments financial records and provider evidence. Specify local Ordering transaction boundaries and idempotent command/event guards; no extra `CheckoutStatus` aggregate and no global minimal FSM without acceptance. Candidate Order phases serve **commercial decisions**; CheckoutProcess phases serve **coordinator progress**, never provider authority. Persist PendingOperation + Outbox together; recompute actions after crash using durable inputs. **Alternative:** CheckoutProcess as source of payment truth -> rejected. **Oracle:** late captured fact after cancellation request; result incorporated without erasing debt.

### AUD-P1-03 / #7 / SER-124 — Retry admission

**Recommendation:** preserve accepted *policy* alternative D: a new commercial attempt requires proven-negative previous opportunity plus a relative deadline anchored to proven closure and an absolute deadline anchored to original Order intent; both must permit the attempt. No newly collectible attempt in first vertical (one-Session slice). Candidate numeric duration/maximum sessions stay configurable and **not ratified**; monotonic business cutoff never substitutes for provider-effect proof. Clock source, reference time, policy-version snapshot and support override require explicit contract before expanding the slice. **Alternative:** retry on browser timeout or stock TTL -> rejected. **Oracle:** ambiguous prior attempt, edge timestamps and replay.

### AUD-P1-04 / #8 / SER-125 — Provider account, capture and methods

**Recommendation:** initial Stripe test account explicitly identified by configured `accountId + mode + API version`, hosted card with 3DS and automatic capture, no delayed methods, no Connect funds flow initially. Explicitly request/enforce an allowed method set and verify effective Checkout behavior against the account's runtime payment-method configuration. Link, wallets and alternative methods must not silently expand the first slice; defer or explicitly disable where the provider allows, fail closed otherwise. Abstract `PaymentProviderPort` and `MerchantAccountRef` for later Connect/adapters, but don't build a speculative general settlement engine. **Alternative:** Connect from day one; unbounded auto-enabled methods -> deferred/rejected for first slice. **Oracle:** unauthorized method not offered/accepted; captured amount/account matches invariant.

### AUD-P1-05 / #9 / SER-126 — Mongo D-05 physical contract

**Recommendation:** Mongo replica-set with transactional collections per context; short owner-local transactions with `readConcern: snapshot` where needed and transaction commit `writeConcern: majority` plus explicit journaling compatibility/driver inspection. Every owner-local multi-document operation includes command/Inbox/Outbox identity and version/unique indexes. Unknown commit is **NOT** classified as failure: retry commit according to driver's labels when appropriate, and read back by immutable operation ID before deciding to reissue only the local command. Never repeat Stripe HTTP or reveal as a consequence of uncertain commit. A **one-member replica set is a local learning environment**, not HA/failover evidence. **Alternative:** distributed Mongo + Stripe transaction -> impossible; blind rerun -> rejected. **Oracle:** kill between write/commit ACK/restart; unique effects and recovery, with multi-node durability proof deferred to relevant deployment.

### AUD-P1-06 / #10 / SER-127 — Multiline all-or-nothing

**Recommendation:** capability must be modelled as an atomic business admission: all lines reserved or none, every license uniquely assigned and all lines prepared before *any* key can be revealed. Use Inventory owner-local batch holds in one transaction; Fulfillment owner-local batch uniqueness and prepared evidence; Ordering saga coordinates them durably, not a fiction of one cross-context transaction. For initial M04, expose **one-line checkout** only until actual multiline safety tests; preserve general `OrderLine[]` snapshot and contract evolvability. Partial exposure discovered externally -> incident/manual settlement, never reissue the same key. **Alternative:** best-effort partial shipment with automatic full refund -> rejected. **Oracle:** insufficient one line, duplicate license assignment and worker loss after first possible secret reveal.

### AUD-P2-01 / #11 / SER-128 — Glossary

**Recommendation:** `Order` commercial obligation, `CheckoutProcess` coordinator, `PaymentAttempt` commercial try, `ProviderOperation` concrete HTTP send/effect, `CheckoutSession` Stripe hosted payment opportunity, `Payment` captured/money history, `Refund` payment reversal, `Reservation` protected Inventory capacity, `DigitalLicense` Fulfillment secret assignment. Explicit `known provider status` / `locally incorporated fact` / `read model` wrappers prevent semantic leakage. **Alternative:** reusing `PAID` or `CANCELLED` as ubiquitous global truth -> rejected. **Oracle:** terminology schema/contract lints and inconsistent-state examples.

### AUD-P2-02 / #12 / SER-129 — Session clock and limits

**Recommendation:** persist provider-returned exact `expires_at` and observed status. Never hardcode 35 minutes as universally supported nor infer financial closure from expiration; documented Stripe Checkout range currently shown by current SDKs as 30min–24h, subject to API/mode verification (see linked vendor source). One session / initial Order, **no successor** until safe negative proof and explicit policy approval. Store configured effective bounds and policy version, no provider session future-send assumption. **Alternative:** universal 35m/two-Sessions as immutable guarantee -> rejected. **Oracle:** provider-specific expires_at, recovery link, races at expiry and stale send.

### AUD-P2-03 / #13 / SER-130 — Traceability and provenance

**Recommendation:** one canonical ID per requirement/decision/finding, a versioned mapping original artifact + checksum → accepted policy/ADR → bounded-context contract/guards → GitHub/Linear task → test oracle → executed log/result link. Keep `RECOMMENDED`, `ACCEPTED`, `PENDING`, `TEST_PLANNED`, `VERIFIED` separate; do not translate issue state to decision state. Resolve the 110 English-oracle semantic comparisons against original sources before claiming equivalence, never change original 148 results. **Alternative:** loose prose + GitHub checkbox as source of truth -> rejected. **Oracle:** missing/duplicate IDs and incorrect evidence-state lint.

## Dependency and acceptance graph

`D-05-MONGO + M00.2 Inventory` → `AUD-P0-03, P1-01, P1-05, P1-06`; `AUD-P0-01 + P0-02` → `P1-03, D-07-CONCURRENCY`; `M00.2 license frontier + P0-01` → `P0-04`; `P0-03 + P1-02` → commercial saga contract; `M00.3` → guest/tenant authorization; `M00.4` → compatible public command/event schemas. Co-design cycles are resolved in one contract review; hard G5 execution dependencies remain future evidence, not documentary ratification.

**Human sign-off rule:** this dossier is a technical recommendation, not an automatic approval of the unresolved audited statuses or a blanket authorization. Owner acceptance is necessary to update exact canonical decision IDs. Tests remain TEST_PLANNED / NOT_RUN. No provider, driver or worker experiment has been performed by this drafting step.

## Technical sources (vendor docs are constraints, not proof)

- [Stripe Checkout Session model](https://docs.stripe.com/api/checkout/sessions/object), [Stripe create Session](https://docs.stripe.com/api/checkout/sessions/create), [Stripe idempotency](https://docs.stripe.com/api/idempotent_requests); actual configured account/API version and behavior still require test-mode verification.
- [MongoDB transactions](https://www.mongodb.com/docs/manual/core/transactions/), [MongoDB write concern](https://www.mongodb.com/docs/manual/reference/write-concern/); `majority` is not HA for a single member and is not Stripe atomicity.
