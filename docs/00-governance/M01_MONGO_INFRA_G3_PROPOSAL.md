# Proposal — M01-MONGO-01 local MongoDB infrastructure G3

**Decision ID:** `PROP-2026-11-17-M01-MONGO-INFRA-01`  
**Task:** `M01-MONGO-01`  
**Status:** `G3_PROPOSED` / `G4_NOT_GRANTED`  
**Date:** 2026-11-17  
**Accountable owner:** @sergio-tr  
**Linear:** [SER-138](https://linear.app/sergiotr/issue/SER-138/m01-mongo-01-local-compose-mongodb-infrastructure-g3)  
**GitHub issue:** not opened. Creating an issue in `sergio-tr/ecommerce` returned HTTP 403. This file does not invent an issue number.  
**Base reviewed:** `origin/main` `ae4ccc5f3221c631230deff6cf1992c9943b71be`  
**Not this task:** [SER-126](https://linear.app/sergiotr/issue/SER-126) / GitHub #9 / `D-05-MONGO` / `AUD-P1-05`

## Verdict

This is a documentation proposal for one local MongoDB process. It does not pass G3. It does not grant G4. It does not start Compose, a container, NestJS, or a database.

Three owner sentences are still required before anyone can treat the placement, the image line, or the narrowed slice as accepted. Merging this pull request records the proposal. [Change control](CHANGE_CONTROL.md) says a merge does not, by itself, ratify an undecided technical policy.

## Preconditions checked for this proposal

| Check | Observed |
|---|---|
| Open pull requests | none |
| Running Cursor agent on this repo | this documentation task only |
| `main` | `ae4ccc5f3221c631230deff6cf1992c9943b71be`, merge of [PR #49](https://github.com/sergio-tr/ecommerce/pull/49) by @sergio-tr at 2026-11-17 22:33 Europe/Amsterdam |
| Push CI of that SHA | [Actions run 44181117124](https://github.com/sergio-tr/ecommerce/actions/runs/44181117124) `success`; jobs `validate`, `chart`, and `image` each `success` |
| Scoped local K8S G5 | `PASSED_LOCAL` for one k3d server and `GET /health/live`, from the owner report on `affde2ce87e7569595598f7bc116819e65a67785` (`exit=0`, `k3d-smoke: PASS`). Recorded in [M01_K8S_01_LOCAL.md](../development/M01_K8S_01_LOCAL.md). This agent did not rerun it |
| SER-137 | Linear status `Done`, `completedAt` 2026-11-17 22:33 Europe/Amsterdam. The closure paragraph in the k3d note still says `Todo`; that sentence is the earlier text, not this check |
| GitHub #45 | closed by @sergio-tr at 2026-11-17 22:05 Europe/Amsterdam, `state_reason` `completed`. The body still says K8S G5 is not passed. This proposal does not edit it |

`AUD-P0-01` through `AUD-P0-04` stay OPEN/BLOCKING. The 148 original experiments stay TEST_PLANNED/NOT_RUN. Catalog G4 stays not granted. `D-05-MONGO` stays PENDING. The audit register still says `AUD-P1-05` is OPEN. Linear showed SER-126 as `In Review` when this file was written. Neither tracker was edited.

## What the accepted records already say

| Source | Status | What it selects | What it leaves open |
|---|---|---|---|
| [ADR-M01-001](../02-decisions/ADR-M01-001-kubernetes-first-and-test-stripe.md) D-1 | ACCEPTED K2 | k3d/K3s is the local M01 application runtime | K1, Compose as the sole environment, is rejected |
| ADR-M01-001 D-3 | ACCEPTED DATA-A | one local MongoDB replica set, separate Core/Cloud databases and credentials, durable PVC, not HA | `D-05-MONGO` transaction, write concern, and unknown commit |
| [M01-D03](../architecture/m01/M01_D03_K8S_TOPOLOGY_AND_NETWORK.md) | documentary spec | one member, PVC, ClusterIP in `commerce-data`, no NodePort or LoadBalancer | image digest not selected; host not inspected when the spec was written |
| [M01-D05](../architecture/m01/M01_D05_MONGODB_PERSISTENCE_AND_RECOVERY.md) | documentary spec | StatefulSet, `rs0`, `commercecore_dev` and `commercecloud_dev`, least-privilege users, idempotent bootstrap, MongoDB 8.x with patch and digest pending | no G4; T01–T12 are TEST_PLANNED/NOT_RUN |
| [M01-D06](../architecture/m01/M01_D06_CONFIGURATION_SECRETS_AND_TRUST.md) | documentary spec | credentials outside git; loopback for host ports; no secret in the repo | Kubernetes Secret injection is the specified path |
| [D-05](../02-decisions/D-05-full-adr.md) | ACCEPTED policy only | durable local record before an external effect; Inbox/Outbox direction | `D-05-MONGO` PENDING. No schema and no physical write concern |
| [Roadmap](../06-planning/ROADMAP.md) | accepted direction | K2, DATA-A, Mongo as a later M01 deliverable after the local Kubernetes health slice | the 2026-10-30 paragraph that says no chart exists is historical. It is not updated here |

The owner queue of 2026-11-17 selects M1–M10 as technical direction for this unit, subject to this reconciliation. That queue is the source of the candidate below. It is not a new ADR.

## M1–M10 against the decision IDs

| Owner item | Decision IDs | Fit |
|---|---|---|
| M1 Compose before k3d | K2 ACCEPTED; K1 REJECTED; M01-D05 StatefulSet | Conflict R1. Compose is proposed only for this database process. The API stays on the accepted k3d path |
| M2 one member, local only | DATA-A; M01-D05; D-05 contract candidate point 1, not ratified | Aligned. One member is not HA and does not ratify `D-05-MONGO` |
| M3 named persistent volume | DATA-A PVC; M01-D03 PVC | Conflict R2. A Compose named volume can persist a restart. It is not a PVC |
| M4 private network and `127.0.0.1` | M01-D03 ClusterIP only; M01-D06 loopback | Partial R2. Loopback matches the host-port rule. It is not internal ClusterIP DNS |
| M5 local auth, untracked secrets | M01-D05; M01-D06 | Aligned on the secrecy rule. The injection path differs until R1 is ratified |
| M6 idempotent replica-set bootstrap and host/container DNS | M01-D05 initialization and client hostname | Aligned as a requirement. Specified below. Not implemented |
| M7 connectivity, restart, persistence, negative config, teardown | M01-D05 T01, T05, T06, T08, T09, T11, T12 | Partial R3. Those oracles are the matrix below. T02–T04 and T10 stay in M01-D05 |
| M8 NestJS integration deferred | M01-D02; bootstrap handoff | Aligned. No driver and no module |
| M9 version and digest pin | M01-D05 patch and digest PENDING | R4. Method aligned. The digest is unresolved. No digest is written in this file |
| M10 manual pull-request merge | ADR-M01-001 follow-up 4; change control | Aligned. This proposal does not authorize an automatic merge |

## Unresolved ratification

Reply with the sentence. A merge without the sentence leaves the row unresolved.

**R1 — placement.** Accept: "I accept MONGO-RUNTIME-COMPOSE for M01-MONGO-01 only. K2 remains the application runtime. The M01-D05 StatefulSet and PVC stay specified and unbuilt." Reject: "I reject Compose. The next Mongo unit stays the M01-D05 StatefulSet and PVC."

**R2 — volume and exposure, only if R1 is accepted.** Accept: "I accept a Compose named volume and a `127.0.0.1` publish for M01-MONGO-01. That volume is not the DATA-A PVC, and the publish is not a ClusterIP." Rejecting R1 drops R2.

**R3 — slice width.** Accept the narrow slice: "I accept that M01-MONGO-01 does not create `commercecore_dev`, `commercecloud_dev`, their users, or the backup drill." Or widen it: "Add the two empty databases and least-privilege users from M01-D05 to this unit, still with no domain collection."

**R4 — image line.** Accept: "I accept `docker.io/library/mongo:8.0.38-noble` as the candidate. The digest stays unresolved until the registry inspect below." Or name another linux simple tag from the same library file, for example `8.3.17-noble`. Do not answer with `latest`, `8`, or `8.0`.

Until R1, R3, and R4 have an explicit answer, and R2 as well when R1 is accepted, G3 stays `G3_PROPOSED`.

## Image candidate and digest method

Observed on 2026-11-17 from the Docker Official Images library file `https://raw.githubusercontent.com/docker-library/official-images/master/library/mongo`.

| Field | Observed value |
|---|---|
| Linux simple tags on the 8.0 stanza | `8.0.38-noble`, `8.0-noble` |
| Shared tags on that stanza | `8.0.38`, `8.0` |
| Architectures | `amd64`, `arm64v8` |
| `docker-library/mongo` GitCommit | `5fd7eb19024b73c9ec84644f1b23acbb33bee8b0` |

That GitCommit is the library commit that published the tag. It is not an OCI image digest. This task did not run a registry inspect and does not print a `sha256` digest.

The same file, on the same read, points floating tag `8` at `8.3.17` and floating tag `latest` at `9.0.8`. Both are rejected for this slice. M01-D05 says an officially maintained MongoDB 8.x server and leaves the patch pending. `8.0.38-noble` stays on that 8.0 line and is a linux tag, so it does not select the Windows manifests that share `8.0.38`. `8.3.17-noble` is a newer minor. It is a different choice and needs R4 if the owner wants it.

At G4, and only after R4 names the tag, the implementer re-reads the library file. If the named simple tag is gone, stop. Do not substitute `mongo:8` or `mongo:latest`. Then run:

```text
docker buildx imagetools inspect docker.io/library/mongo:8.0.38-noble
```

Record the manifest-list digest and the platform digest for the host (`linux/amd64` on the usual WSL2 machine, `linux/arm64` if that is the host). Pin the Compose image as `docker.io/library/mongo:<tag>@sha256:<digest>` using the digest that command printed. Inside the container, `mongod --version` must report the same patch as the tag. This G3 did not run that command.

## Proposed local shape, if R1–R4 are accepted

One Compose project, one `mongod`, replica set name `rs0`, one member. Auth is required. The root username and password come from `.env.local`, which `.gitignore` already ignores through `.env.*`. The keys are `MONGO_INITDB_ROOT_USERNAME` and `MONGO_INITDB_ROOT_PASSWORD`. This document sets no value. No compose file may contain a password literal. No tracked example may contain a password.

The only published port is `127.0.0.1:27017`. If that port is taken, the implementation records another loopback port. It never publishes `0.0.0.0`.

The data volume is the named volume `commercecore-mongo-data`. It is not a bind mount of the repository and not a PVC. Default teardown removes the container and keeps the volume. Removing the volume requires an explicit destructive flag.

The member host stored by initiate is `mongo`, the Compose service name, which resolves inside the Compose network. The host does not resolve that name by itself. The pass path is an in-container `rs.status()` that shows one PRIMARY named `mongo:27017`, plus a host client that uses the documented URI. If that URI needs the name `mongo`, the operator's untracked hosts file maps it to `127.0.0.1`. `directConnection=true` is not a pass. A second start on the same volume must not initiate again and must not wipe data.

The smoke may write one document `{ "probe": "mongo-infra" }` in database `infra_probe`, collection `probe`. That database is not `commercecore_dev` and holds no order, payment, inventory, or catalog document. NestJS is not a client. The API chart is not changed. The Compose network is not attached to k3d.

## Acceptance matrix

Every row is TEST_PLANNED / NOT_RUN. Nothing below was executed.

| ID | When | Pass | Fail |
|---|---|---|---|
| MONGO-INFRA-T01 | clean start on an empty volume | one PRIMARY in `rs0`; credentialed ping succeeds; anonymous ping fails | a second member, or a ready port without auth |
| MONGO-INFRA-T02 | start again on the same volume | already-initialized set is left in place; the probe document is still there | initiate error treated as success by deleting the volume |
| MONGO-INFRA-T03 | restart the container | the same probe document is readable | data present only in memory |
| MONGO-INFRA-T04 | new container, same named volume | the probe document survives | a fresh empty volume silently replaces the named one |
| MONGO-INFRA-T05 | missing `.env.local` or empty password | non-zero exit; no anonymous ready port | a default user or an open unauthenticated port |
| MONGO-INFRA-T06 | inspect the published port | `127.0.0.1` only | `0.0.0.0` or any non-loopback bind |
| MONGO-INFRA-T07 | read `rs.conf()` inside the container and connect from the host with the documented URI | member host resolves in the container; host check succeeds without `directConnection=true` | pass claimed through `directConnection=true` |
| MONGO-INFRA-T08 | read the Compose image reference | tag plus `@sha256:` equal to the recorded imagetools output; `mongod --version` matches the tag | `latest`, floating `8`, or a digest that was not printed by imagetools |
| MONGO-INFRA-T09 | teardown | default path keeps the named volume; the explicit destructive flag removes it | an undocumented volume delete |

M01-D05-T02, T03, T04, and T10 stay TEST_PLANNED/NOT_RUN on that specification. This matrix does not retire them.

## G4 request, not a grant

**Request ID:** `G4-REQUEST-2026-11-17-M01-MONGO-INFRA-01`  
**Status:** `NOT_GRANTED`

A later grant has to name this request ID in its own owner message. Merge of this proposal is not that message. Dispatch of the implementation unit also waits for explicit answers to R1 and R4.

If that grant is given, it covers only the Compose file, the pinned image, the named volume, the loopback publish, reading `.env.local`, the idempotent bootstrap, and a smoke for T01–T09. It does not cover a NestJS module, a Mongo driver in the API, a Helm database, a k3d StatefulSet, domain collections, Stripe, orders, payments, inventory, a cloud account, or a registry push.

## Out of scope

- Changing K2, NET-A, DATA-A, or STRIPE-A.
- Editing `D-05-MONGO`, SER-126, or GitHub #9.
- Write concern, journaling, transactions, uncertain commit, Inbox, or Outbox. Those belong to the later design unit.
- Closing AUD-P0-01..04 or marking any of the 148 experiments run.
- Catalog routes. Catalog G4 stays not granted.
- A second replica, failover, or any HA claim.
