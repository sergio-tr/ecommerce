# Proposal — D-05-MONGO owner-local atomicity and durability G3

**Decision ID:** `PROP-2026-11-20-D05-MONGO-01`  
**Task:** `CC-MONGO-DURABILITY-DESIGN-46`, recorded by `CC-D05-MONGO-G3-RATIFICATION-47`  
**Status:** `G3_ACCEPTED — DESIGN_ONLY`  
**Date:** 2026-11-20  
**Accountable owner:** @sergio-tr  
**Linear:** [SER-126](https://linear.app/sergiotr/issue/SER-126/aud-p1-05-atomicidad-y-durabilidad-mongodb) (`In Review`; this file does not change it)  
**GitHub issue:** [#9](https://github.com/sergio-tr/ecommerce/issues/9) (open; this file does not close it)  
**Audit:** `AUD-P1-05` stays OPEN. `D-05-MONGO` is `G3_ACCEPTED — DESIGN_ONLY`. That is not G4.  
**Proposal base:** `origin/main` `1b589e5ac5db51c49169f1ea5df80249bbd9e091`, merge of [PR #60](https://github.com/sergio-tr/ecommerce/pull/60). Push CI [Actions run 44771417719](https://github.com/sergio-tr/ecommerce/actions/runs/44771417719) `success`; jobs `validate`, `chart`, and `image` each `success`.  
**Ratification base:** `origin/main` `db807664fab19de643e3483555ddec8744a25d6d`, merge of [PR #61](https://github.com/sergio-tr/ecommerce/pull/61). Push CI [Actions run 44803692671](https://github.com/sergio-tr/ecommerce/actions/runs/44803692671) `success`; jobs `validate`, `chart`, and `image` each `success`.

[PR #61](https://github.com/sergio-tr/ecommerce/pull/61) merged this proposal and did not accept `D-05-MONGO`. The owner sentence on 2026-11-20 at 19:42 Europe/Amsterdam does. It does not close `AUD-P1-05`, does not grant G4, and does not authorize an implementation.

## Owner ratification, 2026-11-20

@sergio-tr ratified `PROP-2026-11-20-D05-MONGO-01` with Q1=A, Q2=A, Q3=A, Q4=A, Q5=A, and Q6=A. The sentence is [CC_OWNER_D05_MONGO_G3_RATIFIED](https://sergiotr.slack.com/archives/C0C8YHEPASV/p1795203760044739). This section is the repository record of that sentence. It does not add a second choice.

| Id | Accepted sentence |
|---|---|
| Q1 | Owner-local transaction on the one-member local `rs0`: commit `writeConcern` `w: "majority"`, snapshot read concern, primary read preference, one immutable scoped operation receipt inside the transaction, deterministic readback, and no new external action after `UnknownTransactionCommitResult`. Design only. |
| Q2 | Majority on this one member is that member's own journaled acknowledgement, subject to the server setting. It is not a second durability copy and it is not HA. |
| Q3 | DATA-A stays. `commercecore_dev`, `commercecloud_dev`, their users, and the Kubernetes StatefulSet and PVC stay uncreated. |
| Q4 | The driver transaction retry stays bounded. There is no second unbounded retry loop. An uncertain commit fails closed and is resolved by reading the receipt. |
| Q5 | `D-05-CONCURRENCY` stays PENDING for worker leases and fences. `D-05-OPS` stays PENDING. The receipt is not proof of a worker lease. |
| Q6 | A live `getDefaultRWConcern` read stays `TEST_PLANNED`. It has not been measured. The manual default is not a server printout. |

`D-05` clauses 1–14 stay the already accepted policy. This ratification does not accept a new financial policy, a schema, a worker, or a G4. `D05-T01` through `D05-T10` stay `NOT_RUN`. The 148 historical experiments stay `TEST_PLANNED` / `NOT_RUN`. `AUD-P0-01` through `AUD-P0-04` stay OPEN/BLOCKING. Catalog G4 stays not granted. Local Compose G5 stays `PASSED_LOCAL` for that infrastructure slice only. The scripts still print `g5: NOT_CLAIMED`, `t01-live=NOT_CLAIMED`, and `matrix=NOT_CLAIMED`.

Dated snapshots written before this sentence, including the 2026-11-12 dependency matrix, still say `D-05-MONGO` PENDING. The register row changed in this record is the later status for this id only.

## Trace and definition of done for the ratification

The decision row is `D-05-MONGO` in [decision-register.json](../02-decisions/decision-register.json). The ADR note is [D-05-full-adr.md](../02-decisions/D-05-full-adr.md). The audit row is `AUD-P1-05` in [REGISTER.md](../04-audit/REGISTER.md), and it stays OPEN. SER-126 stays `In Review`. GitHub #9 stays open. The index row is [status-matrix.md](../02-decisions/status-matrix.md).

This ratification unit is done when all of the following are true.

- The six answers above match the owner sentence and are not widened.
- `D-05-MONGO` is `G3_ACCEPTED — DESIGN_ONLY` in the register and in the ADR note.
- `D-05` itself is not newly accepted. Clauses 1–14 were already accepted policy.
- `D-05-CONCURRENCY` and `D-05-OPS` stay PENDING.
- `AUD-P1-05` stays OPEN. SER-126 stays `In Review`. GitHub #9 stays open.
- `AUD-P0-01` through `AUD-P0-04` stay OPEN/BLOCKING.
- `D05-T01` through `D05-T10` and the 148 catalog experiments stay `NOT_RUN`.
- No collection, index, NestJS module, Compose change, secret, volume change, or StatefulSet was added.
- G4 for this design is not granted.
- An independent reader can see that one member is not HA.

`CC-NEXT-GATE` waits until this ratification record is merged and the push CI of that merge is green, and until no other agent or pull request is open. This file does not start that unit.

## What is already accepted

These statements are policy. This proposal does not reopen them.

| Source | Status | What it already selects |
|---|---|---|
| [D-05](../02-decisions/D-05-full-adr.md) clauses 1–14 | ACCEPTED policy | A durable local record exists before a charge-capable Stripe call. Inbox evidence is durable before webhook 2xx. Owner-local financial and commercial transitions are atomic with their required outgoing work. Delivery is at-least-once. Semantic idempotence follows the business fact, not only an event id. No Stripe–Mongo distributed transaction and no end-to-end exactly-once. Kafka is not required in M04. No extra workflow engine is required. |
| `D-05-INBOX`, `D-05-OUTBOX`, `D-05-RECOVERY` | ACCEPTED | Durable inbox, outbox, and recovery are the direction. |
| `D-05-IMPL` | PROPOSED — SELECTED | Mongo-backed polling and workers are the candidate mechanism. Not a physical algorithm. |
| [ADR-M01-001](../02-decisions/ADR-M01-001-kubernetes-first-and-test-stripe.md) D-1 K2 | ACCEPTED | The application runtime is local Kubernetes. Compose is not that runtime. |
| ADR-M01-001 D-3 DATA-A | ACCEPTED, not amended | One local replica set, separate Core and Cloud authority, not HA. The exact transaction contract stays an independent decision. |
| `PROP-2026-11-17-M01-MONGO-INFRA-01` R1–R4 | ACCEPTED for `M01-MONGO-01` only | Compose is an auxiliary local database path. The named volume and `127.0.0.1` publish are not the DATA-A PVC or a ClusterIP. That slice does not create `commercecore_dev`, `commercecloud_dev`, their users, or a backup drill. |

`D-05-CONCURRENCY` and `D-05-OPS` stay PENDING. This proposal does not select a worker lease, a fence token, a poll interval, or an alert route.

## What this proposal does not treat as durability evidence

The local Compose gate is infrastructure evidence only.

[M01_MONGO_INFRA_G3_PROPOSAL.md](M01_MONGO_INFRA_G3_PROPOSAL.md) says scoped `PASSED_LOCAL` applies after a manual merge of the G5-A record and a green push CI of that merge. [PR #60](https://github.com/sergio-tr/ecommerce/pull/60) is that merge, at `1b589e5ac5db51c49169f1ea5df80249bbd9e091`. [Actions run 44771417719](https://github.com/sergio-tr/ecommerce/actions/runs/44771417719) completed `success` on 2026-11-20 at 17:15 Europe/Amsterdam. Jobs `validate`, `chart`, and `image` each completed `success`. The post-merge paragraph in the infrastructure file records that check.

That pass is one local `mongod`, replica set `rs0`, one member. The executable SHA was `93ef364f05e8fcbcecc96ed2f7c54f7481763e50`. The owner reported isolated `T01_ISOLATED_PASS` with exit 0 and a same-SHA `--resume` of T02–T09 with exit 0. Both named volumes stayed. The scripts still print `g5: NOT_CLAIMED`, `t01-live=NOT_CLAIMED`, and `matrix=NOT_CLAIMED`. Those tokens stay exact. The isolated run did not print a raw `rs.status()` document or `mongod --version`. The owner later ran `mongod --version` on the pinned image with `--network none` and no volume and reported `db version v8.0.38`. That is the image binary, not a read of either data volume.

`tools/mongo/bootstrap.js` returns success only when `rs.status().ok === 1`, `status.set === 'rs0'`, `status.myState === 1`, one member is `mongo:27017`, and `rs.conf()` has the same single host. The isolated script prints `T01_ISOLATED_PASS` only after that return. This proposal uses that source rule as the infrastructure oracle. It does not add a new measurement.

The pinned image is `docker.io/library/mongo:8.0.38-noble@sha256:76a93cc399d05709baeea4e55385749657aa0085ad5b497c851380778eccea2c`. One member is not HA, not a failover test, and not the unbuilt M01-D05 StatefulSet. K2 stays the application runtime. No business collection was created. `infra_probe` is not an owner aggregate.

[PR #28](https://github.com/sergio-tr/ecommerce/pull/28) merged on 2026-10-30 and [PR #29](https://github.com/sergio-tr/ecommerce/pull/29) merged on 2026-11-06. They put the candidate contract in [D_05_MONGO_EXACT_OWNER_TRANSACTION_CONTRACT.md](../architecture/m00/D_05_MONGO_EXACT_OWNER_TRANSACTION_CONTRACT.md). That file is still `NOT RATIFIED`. This record does not edit it and does not promote it. Where this file and that candidate disagree, the owner sentence accepts the last column for this design only.

## Conflict with the earlier candidate

| Topic | Earlier text | Later constraint | Accepted for this design |
|---|---|---|---|
| Databases | DATA-A and the 2026-10-30 candidate name separate CommerceCore and CommerceCloud databases | R3: `M01-MONGO-01` does not create `commercecore_dev`, `commercecloud_dev`, or their users | Do not create them in this design. DATA-A is not amended. They remain specified for the unbuilt Kubernetes path. |
| Topology | The candidate allows a one-member set for local learning | The running set is that one member, with a named volume | Use that set as the only local target this design may talk about. Do not call it HA. |
| Journal | The candidate left `j` as a configuration check | No owner log printed `writeConcernMajorityJournalDefault` or `getDefaultRWConcern` | Cite the server manual default. Do not claim it was read from the running process. |
| Cross-context transaction | One `mongod` can include two databases in one transaction | Accepted policy forbids one transaction that writes two owners' private collections | Refuse the cross-owner transaction even though the server could run it. |

## Recommended default

The owner accepted this default as the design on 2026-11-20. The acceptance is design only. The default is an owner-local MongoDB transaction on the existing one-member `rs0`, with an explicit commit concern and an immutable operation receipt. It is not a driver module.

1. **Boundary.** One transaction belongs to one owner: Ordering, Payments, Inventory, or Fulfillment. The transaction may update that owner's documents, that owner's inbox receipt, and that owner's outbox rows. It must not write another context's private collections. It must not call Stripe, another service, or the clock of an external provider.
2. **When a transaction is required.** Use one document when the whole invariant fits in that document. Use a transaction when the owner fact and the inbox or outbox are separate documents, or when two of that owner's documents must change together. Inventory StockPool and Reservation stay separate documents if the later inventory contract still says so. This proposal does not choose their schema.
3. **Commit concern.** Set `writeConcern: { w: "majority" }` on the transaction commit. On this one voting member, majority is that member. The acknowledgement means that member accepted the commit. It does not mean a second copy exists. Losing that member's volume loses the acknowledged write. The named volume survives a container restart. It is not a second replica.
4. **Journal.** MongoDB's replica-set default is `writeConcernMajorityJournalDefault: true`. With that default, a majority write waits for the journal on the acknowledging member. This proposal relies on that documented default and still sets `w: "majority"` explicitly. It does not claim the running `rs.conf()` was printed. A future read may print `getDefaultRWConcern` and the setting. Until that read exists, the journal wait is a manual default, not a measured setting. `w: 1` is not the recommended commit for an owner fact: the server can acknowledge it before the journal is durable on that same member.
5. **Read concern.** Set `readConcern: { level: "snapshot" }` and primary read preference for the transaction, so the documents inside it are one point in time on that member. Snapshot on one member is not a multi-node proof. After the commit is known, a worker may read the outbox outside the producer transaction. That later read is a committed read. It is not a second durability copy.
6. **Operation receipt.** The same transaction inserts one receipt for the command or the incoming fact. The receipt carries the scoped operation id, the owner, the tenant boundary, and a hash of the immutable request. It does not carry a secret, a card number, or a license body. A unique index on the scoped id makes a second insert fail. The caller then reads the first receipt and returns it.
7. **Version constraint.** The owner document update matches the expected version inside the same transaction. A concurrent writer of another version does not both commit. A unique index on the aggregate and the next version is the recommended backstop if a later implementation mis-states the filter. This proposal does not create the index.
8. **Unknown commit.** `UnknownTransactionCommitResult` means the commit may have been applied. It is not an abort. Retry the commit the way the driver labels that error. If the process died and there is no error object, the next start reads the receipt. If the receipt exists, return it and do not repeat the business write. If the receipt is absent after the retry budget, keep an incident and stop. Do not start a new Stripe call, a new refund, or a license reveal because the local result was unknown.
9. **Transient retry.** `TransientTransactionError` may retry the whole local transaction. The transaction body can therefore run more than once. That is safe only because the receipt and the version check are in the transaction. The body must not perform an external effect. Do not put a second unbounded retry loop around the driver helper. When the helper stops and the receipt is still unknown, persist the incident. `D05-T10` is that case. It stays `NOT_RUN`.
10. **Retryable writes.** A write inside a transaction is not an independent retryable write. The transaction is the retry unit. Retryable writes do not replace the receipt.
11. **Inbox and outbox.** The incoming receipt, the owner change, and any mandatory outgoing row commit together or not at all. The worker runs only after that commit is known. A crash before commit leaves no outbox row; the sender retries the local command by operation id. A crash after commit and before dispatch leaves the row; the worker sends it. A crash after the HTTP call and before the sent mark is at-least-once. The provider idempotency key covers that second send. An unknown HTTP result stays possibly sent. It does not become a new operation.
12. **Reorder and duplicates.** A repeated provider event hits the unique receipt and does not apply twice. An event that arrives out of order is judged by the business fact, which is the accepted D-05 rule, not by arrival order. A command for another tenant or another provider account does not match the scoped key and must not update the first owner's document.
13. **Saga.** Each owner recovers its own committed facts and its own outbox. Ordering learns a Payments fact from a committed Payments outbox and its own inbox, not from a shared transaction. No workflow engine is added. Worker fencing stays `D-05-CONCURRENCY` PENDING, so this file does not define a lease. The receipt is the proposed fence for the local effect. Two workers of one operation id still need a later concurrency decision before `D05-T04` can pass.

## Alternatives

| Id | Option | Why it is not the default |
|---|---|---|
| A | Recommended default above | Selected for review only. |
| B | Single-document writes and no transaction, with the outbox embedded in the aggregate | Enough for one small document. It does not cover two owner documents that must commit together, and it pushes unbounded work into the aggregate. Keep it for a command that truly fits one document. |
| C | `w: 1` without a journal wait | Rejected for owner facts. An acknowledgement can precede the journal on the only member, and it is the concern the server can roll back across a failover that this topology does not even have. |
| D | One Mongo transaction that writes Payments and Ordering | Rejected. The server on one replica set could do it. Accepted policy does not allow one owner to write the other's private collections. |
| E | A distributed transaction with Stripe, or Kafka as the atomic boundary | Rejected by accepted D-05. Stripe is not a participant in the Mongo commit. Kafka is not required in M04. |
| F | Add a second and third replica member now and call majority multi-node durability | Deferred. That is a new infrastructure decision, a new G4, and a different test. This one member cannot supply that proof. |
| G | Choose PostgreSQL for the same owner port | Not selected. A later adapter would still need the same owner boundary, receipt, and fail-closed external effect. |

## Failure matrix

Every row is `TEST_PLANNED` / `NOT_RUN`. None of these runs happened for this proposal. The existing catalog ids stay the oracle names. This table does not mark them executed.

| Case | Local result | Required behavior | Catalog id |
|---|---|---|---|
| Crash before the transaction starts | No receipt | The same operation id may start once | D05-T09 |
| Crash after the writes and before the commit reaches the server | The server aborts the transaction | No receipt. Retry the local transaction. No external effect | D05-T09 |
| Commit reaches the server and the client loses the answer | Unknown commit | Retry the commit. Read the receipt. Do not repeat Stripe, refund, or reveal | D05-T01, D05-T09 |
| Process dies during a transient retry | The helper may have committed | Next start reads the receipt. One owner result | D05-T09, D05-T10 |
| Helper budget ends and the receipt is still unreadable | Incident | Keep the case. Do not erase it and do not send a new external operation | D05-T10 |
| Same command or webhook delivered twice | Duplicate key on the receipt | Return the first result. One business effect | D05-T03 |
| Events arrive out of order | Each fact has its own receipt | No regression of an accepted financial fact because a later message was older | D05-T03 |
| Two workers take one outbox row | Concurrency decision still PENDING | One semantic effect. The mechanism is not selected here | D05-T04 |
| Capture is durable in Payments and Ordering is down | Payments receipt and outbox exist | The obligation remains. Ordering applies it once from its inbox after recovery | D05-T02, D05-T05, D05-T06 |
| Refund HTTP times out | Local possible-send stays | Reconcile that operation. Do not create a second refund id | D05-T07 |
| Event is for another account or tenant | Scoped key does not match | No write to the first owner's document | D05-T08 |
| The only member's volume is destroyed | The acknowledged majority write is gone | This is data loss, not failover. Do not describe it as HA recovery | No new id. Not a pass of any D05 test |
| A second replica member is absent | No election and no second copy | Do not record a failover, stepdown, or quorum result | Deferred with alternative F |

## Observability the later implementation would need

A future implementation would record the operation id, the owner, and the outcome class: committed, duplicate, version conflict, unknown commit, or incident. It would not record credentials, card data, or license material. A log line is not the receipt. The receipt document is the local evidence. Driver error labels are the classification. This proposal does not add a logger, a metric, or a dashboard.

## Definition of done for the proposal unit

[PR #61](https://github.com/sergio-tr/ecommerce/pull/61) met this bar while the status was `G3_PROPOSED`. The ratification section is the later status. These checks still hold except the old PENDING line, which that section replaces.

- This file lists the accepted policy, the recommended default, the rejected alternatives, and the conflicts with DATA-A and R3.
- `AUD-P1-05` is still OPEN in [REGISTER.md](../04-audit/REGISTER.md).
- `AUD-P0-01` through `AUD-P0-04` stay OPEN/BLOCKING.
- The 148 catalog experiments stay `TEST_PLANNED` / `NOT_RUN`.
- Catalog G4 stays not granted.
- No collection, index, NestJS module, Compose change, secret, or StatefulSet was added.
- An independent reader can see that one member is not HA and that the infrastructure G5 is not a durability pass.
- The owner questions below were unanswered when [PR #61](https://github.com/sergio-tr/ecommerce/pull/61) merged. The ratification section above is the later owner sentence.

A later evidence unit may run the matrix only after a separate G4. This record does not grant that G4.

## Owner questions

These were the questions in the proposal. The ratification section records the owner sentence. The recommended answers were accepted as written there, still design only.

| Id | Question | Owner answer |
|---|---|---|
| Q1 | Accept the recommended default as the `D-05-MONGO` design for a future application integration? | A. Design only. No implementation and no G4. |
| Q2 | Accept that majority on this one-member set is one journaled acknowledgement on that member, not multi-node durability? | A. HA stays unclaimed. |
| Q3 | Leave `commercecore_dev` and `commercecloud_dev` uncreated, and leave DATA-A and the StatefulSet unamended? | A. |
| Q4 | Keep the driver helper's retry budget and refuse an extra unbounded loop? | A. A different numeric cap would be a new choice. |
| Q5 | Leave worker leasing in `D-05-CONCURRENCY` PENDING? | A. The receipt is not a worker lease. `D-05-OPS` stays PENDING. |
| Q6 | Treat a measured `getDefaultRWConcern` read as a later evidence item rather than a fact already proved? | A. The manual default is not a server printout. The read stays `TEST_PLANNED`. |

## Out of scope

- Creating a collection, an index, a database user, or a NestJS Mongo module.
- Editing Compose, the pinned image, the volumes, or the smoke scripts.
- A Kubernetes StatefulSet or a second replica member.
- Orders, payments, inventory, fulfillment, Stripe, or license effects.
- Closing SER-126, GitHub #9, or any AUD-P0.
- `CC-NEXT-GATE`. That unit waits until this ratification record is merged and the push CI of that merge is green.
