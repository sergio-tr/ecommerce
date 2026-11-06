# D-05-MONGO — Owner-local atomicity and ambiguous-commit design contract

**Scope:** AUD-P1-05 / GitHub #9 / Linear SER-126; dependencies AUD-P0-03 and Inventory/Order/CheckoutProcess local durability. **Status:** DESIGN-CONTRACT CANDIDATE FOR EXACT-ID APPROVAL, NOT TESTED, NOT RATIFIED. **Date:** 2026-10-30. No code, Mongo cluster or payment operation has been created.

## Selected physical policy for initial local learning milestone

1. MongoDB single-node replica set **only for local development**, using a separate owned logical database/user for CommerceCore and CommerceCloud, with context-owned collection sets. **Never claim HA/failover** for one member; true failure/quorum recovery requires a separately approved multi-member test environment.
2. Prefer one atomic owner document where an invariant can be enforced wholly without unbounded growth. For bounded **multi-document owner-local** transitions use a MongoDB transaction and **one owner transaction boundary**. Do not conflate "separate bounded contexts" with "cross-context transaction permission." CommerceCore contexts must not read/write another context's private collections as application logic.
3. Owner transaction commits use `writeConcern: { w: "majority" }`; transaction reads choose `readConcern: { level: "snapshot" }` when a consistent multi-document view is required, plus primary read preference. Durability/journaling behavior must be checked against the exact MongoDB server topology/version and storage engine before a formal guarantee. `majority` on a one-member replica set cannot protect against loss of that only host; exact `j` policy and majority write concern behavior remain configuration checks.
4. All mutating operations carry `tenantId, storeId?, ownerAggregateId, commandId/idempotencyKey, immutableRequestHash, expectedVersion, policyVersion?`, immutable event/operation identity and a unique index that enforces idempotency in the same owner transaction.
5. Persist owner authoritative mutation + locally deduplicated Inbox (if incoming) + owner Outbox (if outgoing) + immutable operation receipt atomically. The owner response may report `UNKNOWN_COMMIT`; it must never infer an external failure or repeat Stripe/reveal solely due to uncertainty.
6. Use short bounded transactions with no HTTP/provider calls, no cross-service RPC, no UI calls and no potentially long-running work inside transaction callbacks. Outbox workers dispatch only **after** committed intent is durably visible, with separate external possibly-sent ledger and fail-closed UNKNOWN guard.
7. Driver handling: `TransientTransactionError` may trigger a whole **local transaction** retry after assessing safe idempotency. `UnknownTransactionCommitResult` requires retry of the **commit path** according to driver semantics and/or readback by immutable `operationId`; do not blindly rerun the business callback or external effects. In callback/convenient APIs the driver can perform some retries; do not wrap another unbounded retry loop around it. Time budget and incident persistence prevent infinite retry.
8. Transient timeout/driver result differs from provider outcome. A failed local commit must not cause another collectible Stripe send; an unresolved possible-send remains protected. A successful Stripe charge when Ordering is down must preserve the pre-existing Order obligation and recover via Payments Outbox + Ordering Inbox without cross-context DB write.

## Owner-transaction map

| Owner | Proposed atomic unit | Uniqueness/version constraint | Unknown commit handling |
|---|---|---|---|
| Ordering | Order commercial decision + CheckoutProcess pending operation + Ordering Outbox/Inbox | `(tenant,orderId,version)`; unique `(tenant,operationId)` / event receipt | Re-read Order/CheckoutProcess by operation identity and evidence; no payment retry |
| Payments | Attempt/provider-operation admission + durable possible-send record + Payments Outbox | unique `(tenant,provider,account,mode,operationId)`, immutable hash + commercial generation; do not assume Stripe idempotency expiry is a DB TTL | Readback original op, keep possibly sent until positive reconciliation |
| Payments | Verified capture/refund fact + provider Inbox dedupe + Outbox | unique `(provider,account,mode,providerEventId)`, `(provider,account,chargeId,captureFactKind)` / Refund ID, preserving source semantics | Readback original captured/refund fact; do not erase captured history |
| Inventory | StockPool capacity/quota CAS + Reservation phase and command receipt | unique `(tenant,poolId)`, `(tenant,reservationId)`, operation scoped to pool+generation+version | Readback Pool+Reservation+receipt; no unsafe release |
| Fulfillment | Batch unique DigitalLicense assignment + all-lines preparation + owner operation receipt | unique license identity and immutable OrderLine binding scoped tenant/order; prepare-all before possible exposure | Readback all-line prepared set; never reissue possibly exposed license |
| Identity/Cloud | Authorized policy/Store revision publish + scoped Outbox | unique tenant/store policy version / operation ID | Readback specific published policy, no mutation of accepted Order snapshot |

**Index design caution:** do not store raw buyer/license/credential data inside idempotency keys. Store hash+scope; choose compound indexes according to actual query shapes and size limits. Unique keys must enforce tenant/account boundaries; some global provider event IDs are provider-scoped and do not share the same uniqueness scope as Order commands. Physical shape must be tested, not asserted because shown conceptually.

## Transaction pseudo-contract (documentation, not code)

```text
executeOwnerCommand(command):
  verify actor / scope and immutable payload hash
  check durable previous result by scoped operationId
  begin owner-local transaction (snapshot / majority at commit)
    compare expectedVersion and business guard against authoritative owner facts
    update owner aggregate(s) and unique operation receipt
    persist Inbox deduplication if command came from an external event
    persist mandatory Outbox event(s) and/or next durable work
  commit
  on successful commit: return durable receipt
  on transient transaction error: safely re-evaluate local transaction as allowed
  on unknown commit result: retry commit per driver contract; readback operation receipt
      if committed: return original result
      if inconclusive: retain UNKNOWN state and reconcile/escalate
  after confirmed local commit: worker MAY dispatch already persisted outbound work
      before HTTP: record possible-send authorization separately
      after unknown HTTP: retain possible external effect; no blind new operation
```

## Explicit rejection / upgrade seams

- REJECT: `w:1` local acknowledgment as sufficient evidence of safe cross-context financial recovery after failover; no majority policy; blind retry of entire Stripe admission after uncertain commit; a global Mongo transaction that spans Payments and Ordering ownership; network calls within transaction; release based only on expired worker lease.
- DEFER: multi-member replica set/real failover testing, exact Mongo image+Node driver SHA/version, sharding, tenant-dedicated clusters, KMS and operational restore topology. They need their own target environment and G3/G4 later, not bootstrap-01.
- REPLACEABLE: Mongo adapter via owner repository/UnitOfWork port, but an alternative PostgreSQL implementation must preserve the same owner-local atomicity, operation receipts and fail-closed external effect behavior.

## Failure-oracle checklist (planned)

1. Kill process before/after local transaction commit and lose ACK; owner operation receipt identifies one commercial result and never repeats Stripe/secret.
2. Concurrent Reserve final unit; one StockPool CAS succeeds, balances/Reservation stay conserved.
3. Two duplicate provider events for same Charge; one Payments fact and one Outbox/Ordering incorporation.
4. Mongo write conflict/primary stepdown with callback retries; no duplicate owner effect or inconsistent event envelope.
5. Ordering unavailable after capture; Payments durable fact and work survive restart.
6. Fulfillment batch key preparation crash; either all assignments durably prepared or no disclosure authorization.
7. Transaction timeouts on single member and separately on multi-member failover; do not falsely equate the former to quorum/HA evidence.
8. Check journal, majority and snapshot semantics with exact server/driver versions and relevant platform settings.

All checks **TEST_PLANNED/NOT_RUN**. Closing #9 requires owner approval of this exact policy and real driver/physical failure evidence according to the audit's original closure rules, not simply a merged doc.

## Official source constraints

- MongoDB [drivers transaction handling](https://www.mongodb.com/docs/manual/core/transactions-in-applications/): callback API retries transient transaction and unknown commit according to driver semantics; core API requires explicit retry handling.
- MongoDB [transactions and commit behavior](https://www.mongodb.com/docs/manual/core/transactions/) and [session commitTransaction](https://www.mongodb.com/docs/manual/reference/method/session.committransaction/): transaction commits are atomic for owned documents, not external Stripe/network operations; `w:1` may roll back on failover.
- MongoDB [retryable writes](https://www.mongodb.com/docs/manual/core/retryable-writes/): individual writes inside transactions are not independently retryable.
