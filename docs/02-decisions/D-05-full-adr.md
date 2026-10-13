# D-05 — Durability before Kafka

**Decision:** ACCEPTED (policy only; with expressly recorded qualifications). **Evidence:** TEST_PLANNED, except D-01 is also SPECIFIED at policy level; no experiment VERIFIED. **Primary source:** Texto pegado (7)(7).txt (original individual proposal). **Authority:** later explicit user ratification governs; the original proposal's initial PENDING heading is historical and must not be interpreted as today's status.

## Ratified policy and safety conditions

1. A potentially charge-generating Stripe API call must have an immutable, durable, recoverable local operation record BEFORE any external effect is enabled.
2. Payments owns financial truth and persists unknown outcomes until reconciled; local MongoDB failure must fail closed for new charge authorization.
3. Stripe webhook authenticity is verified before accepted; relevant verified event evidence must be durably recorded in an Inbox before returning 2xx.
4. An external webhook HTTP 2xx or internal ACK never proves commercial application, license delivery or refund completion.
5. Financial state transitions and required outgoing work must be locally atomic within Payments; Order incorporation and mandatory saga continuation likewise within Ordering.
6. At-least-once delivery, out-of-order events and duplicate webhook deliveries require semantic idempotence by underlying business fact, not just event ID.
7. Workers and future Kafka consumers must replay pending work safely, with conditional versions and idempotency under crashes, retries and restarts.
8. Proactive Stripe reconciliation remains necessary even if webhooks are never delivered or are delayed beyond provider retry windows.
9. No end-to-end exactly-once or distributed Stripe–Mongo transaction is assumed.
10. Kafka is not required in M04; durable Mongo-based polling/work queues can provide initial handoff and can later feed Kafka in M05.
11. No additional Outbox Publisher microservice or workflow engine is mandatory at the conceptual stage.
12. Separate financial identities for each tenant, store, Stripe account, test/live environment, provider operation and business generation.
13. Store enough evidence to recover unknown local commits, while not immediately issuing a second external operation when local persistence results are ambiguous.
14. Physical consistency, write concern, indexes, worker fencing, replay and escalation are later specifications; these remain real risks, not implicit ACCEPTED implementation.

## Alternatives retained in the ADR

- A — Deploy Kafka already in M04: not selected because Kafka still cannot atomically update Mongo with Stripe or its producer.
- B — Mongo-backed durable Inbox, Outbox and recoverable workers: ACCEPTED as the architectural durability direction.
- C — Synchronous webhook chain without Inbox: rejected because process failure and Stripe retries leave effects untracked.
- D — Add an external managed queue before Kafka: not justified; still requires Outbox and durable reconciliation.

## Consequences and trade-offs

Safety requires durable states, context-specific authority, bounded commercial flexibility and explicit investigation of external/unknown effects. Business throughput can be reduced when Stripe fails or evidence is ambiguous. That is deliberate: preserving financial/inventory correctness takes precedence over falsely declaring completion. No alternative or numbered clause above selects a Mongo schema, physical worker algorithm, standalone microservice, provider API version or globally atomic workflow.

## Scoped unresolved decisions and dependencies

- D-05-INBOX, D-05-OUTBOX and D-05-RECOVERY ACCEPTED.
- D-05-IMPL PROPOSED — SELECTED.
- D-05-CONCURRENCY, D-05-MONGO, D-05-OPS PENDING.
- AUD-P0-02 provider proof and AUD-P0-03 physical propagation blockers persist.

## Future verification

- Relevant planned tests: D05-T01..T10; AUD02-T01..T16; AUD03-T01..T16.
- Do not treat simulator success as proof of Stripe-internal behavior.
- Verify authoritative business facts, provider objects where applicable, isolation boundaries and lack of duplicated financial/fulfillment effects.
- Required status: TEST_PLANNED. No VERIFIED evidence exists.

## Source and change governance

The original source contains more discussion, interleavings and alternative rationale than this ratification-focused record. Preserve that source in custody and consult it for any fine-grained implementation specification. Later changes require scoped ratification and an English feature/bugfix branch + PR owned by @sergio-tr.
