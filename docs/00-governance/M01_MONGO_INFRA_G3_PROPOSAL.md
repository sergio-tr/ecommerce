# Proposal — M01-MONGO-01 local MongoDB infrastructure G3

**Decision ID:** `PROP-2026-11-17-M01-MONGO-INFRA-01`  
**Task:** `M01-MONGO-01`  
**Status:** `G3_ACCEPTED_2026-11-17` for `M01-MONGO-01` local Compose infrastructure only / `G4_READY_PENDING_MERGE`  
**Date:** 2026-11-17  
**Accountable owner:** @sergio-tr  
**Linear:** [SER-138](https://linear.app/sergiotr/issue/SER-138/m01-mongo-01-local-compose-mongodb-infrastructure-g3)  
**GitHub issue:** not opened. Creating an issue in `sergio-tr/ecommerce` returned HTTP 403. This file does not invent an issue number.  
**Proposal base:** `origin/main` `ae4ccc5f3221c631230deff6cf1992c9943b71be`  
**Ratification base:** `origin/main` `d6e24c35f41c67e7d55bab10ba72e13ef5a667a1`, merge of [PR #50](https://github.com/sergio-tr/ecommerce/pull/50)  
**Image pin base:** `origin/main` `898fa77f69110ab97205245ded2716c48d35be9d`, merge of [PR #51](https://github.com/sergio-tr/ecommerce/pull/51). Push CI [Actions run 44203521366](https://github.com/sergio-tr/ecommerce/actions/runs/44203521366) `success`; jobs `validate`, `chart`, and `image` each `success`  
**Not this task:** [SER-126](https://linear.app/sergiotr/issue/SER-126) / GitHub #9 / `D-05-MONGO` / `AUD-P1-05`

## Owner ratification

On 2026-11-17 at 23:23 Europe/Amsterdam, after [PR #50](https://github.com/sergio-tr/ecommerce/pull/50) had merged, @sergio-tr posted `[CC_OWNER_RATIFICATION_M01_MONGO_INFRA_2026_11_17]` in the canonical Slack thread. That message accepts R1–R4 for this proposal and no other ADR. This section records those sentences. It does not run a registry inspect, start Compose, or make G4 effective.

| Check | Observed for this ratification |
|---|---|
| Open pull requests | none |
| Running Cursor agent on this repo | this documentation task only |
| `main` | `d6e24c35f41c67e7d55bab10ba72e13ef5a667a1`, merge of PR #50 by @sergio-tr at 2026-11-17 23:03 Europe/Amsterdam |
| Push CI of that SHA | [Actions run 44186124886](https://github.com/sergio-tr/ecommerce/actions/runs/44186124886) `success`; jobs `validate`, `chart`, and `image` each `success` |
| SER-138 | Linear status `Backlog` when this section was written. This file does not close it. GitHub issue still not opened; the earlier create returned HTTP 403 |

**G3** is `G3_ACCEPTED_2026-11-17` only for `M01-MONGO-01` local Docker Compose infrastructure. [ADR-M01-001](../02-decisions/ADR-M01-001-kubernetes-first-and-test-stripe.md) D-1 K2 stays the application runtime. The M01-D05 StatefulSet and PVC stay specified and unbuilt. DATA-A, NET-A, and STRIPE-A are not amended.

**G4** request `G4-REQUEST-2026-11-17-M01-MONGO-INFRA-01` was `G4_CONDITIONAL_NOT_EFFECTIVE` when the owner ratified it. The current status is `READY_PENDING_MERGE` in the image pin section. The same owner message grants it only after all three of these are true:

1. This ratification is in a reviewed and merged pull request. The merge of PR #50 does not count. That merge recorded the proposal and left R1–R4 unanswered.
2. A real OCI digest for `docker.io/library/mongo:8.0.38-noble` is copied from a registry inspect for the host platform and pinned. At ratification time this file had no digest. The image pin section records the later registry read. A digest written without that read does not count.
3. No normative conflict remains inside this slice. R1–R4 close the conflicts named below. `D-05-MONGO` stays PENDING and outside this slice. It is not accepted here, and it is not a reason to widen the slice.

While any of the three is false, Compose, a container, and the implementation unit stay forbidden. At the time this section was written, item 1 was false until the ratification pull request merged, and item 2 was false because the digest was unknown. Merging that ratification pull request satisfied item 1 only.

Later state, recorded in the image pin section: item 1 is true because [PR #51](https://github.com/sergio-tr/ecommerce/pull/51) is merged. Item 2 is written there and stays short of effective until that pin change itself is merged and its CI is green. Item 3 is unchanged. This file marks G4 `READY_PENDING_MERGE`. It does not mark G4 effective.

### Accepted sentences

**R1 — placement. ACCEPT.** "I accept MONGO-RUNTIME-COMPOSE for M01-MONGO-01 only. K2 remains the application runtime. The M01-D05 StatefulSet and PVC stay specified and unbuilt." Compose is an auxiliary local MongoDB path. It does not replace K2.

**R2 — volume and exposure. ACCEPT.** "I accept a Compose named volume and a 127.0.0.1 publish for M01-MONGO-01. That volume is not the DATA-A PVC, and the publish is not a ClusterIP." Loopback only. No public bind.

**R3 — slice width. ACCEPT NARROW.** "I accept that M01-MONGO-01 does not create commercecore_dev, commercecloud_dev, their users, or the backup drill." No business collection and no NestJS driver. A synthetic `infra_probe` database is the only probe this slice may use, and only in a later implementation.

**R4 — image line. ACCEPT CANDIDATE.** "I accept docker.io/library/mongo:8.0.38-noble as the candidate. The digest stays unresolved until real registry inspection." The tag is `docker.io/library/mongo:8.0.38-noble`. The image pin section is the later registry read. This ratification paragraph did not invent a digest.

## Proposal-time verdict

This file began as a documentation proposal for one local MongoDB process. The paragraphs under "Preconditions" and "What the accepted records already say" are that proposal. The owner ratification section above is the later record. Where they disagree on R1–R4, the ratification wins, and only for `M01-MONGO-01`.

[Change control](CHANGE_CONTROL.md) says a merge does not, by itself, ratify an undecided technical policy. PR #50 merged the proposal without accepting R1–R4. The sentences above are the separate owner message. This later pull request records them. It still does not start Compose.

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

The owner queue of 2026-11-17 selects M1–M10 as technical direction for this unit, subject to this reconciliation. That queue is the source of the candidate below. It is not a new ADR. The Fit column is the reading at proposal time. The owner answers are in the ratification section.

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
| M9 version and digest pin | M01-D05 patch and digest PENDING for the StatefulSet | R4. The OCI index digest is recorded in the image pin section for the Compose path only. G4 is `READY_PENDING_MERGE` and not effective. The M01-D05 StatefulSet digest stays pending |
| M10 manual pull-request merge | ADR-M01-001 follow-up 4; change control | Aligned. This proposal does not authorize an automatic merge |

## Ratification prompts, now answered

The prompts below are the text PR #50 asked the owner to answer. The answers are the sentences in the owner ratification section. They are not repeated here as a second decision. The reject and widen options were not chosen.

**R1 — placement.** Accept: "I accept MONGO-RUNTIME-COMPOSE for M01-MONGO-01 only. K2 remains the application runtime. The M01-D05 StatefulSet and PVC stay specified and unbuilt." Reject: "I reject Compose. The next Mongo unit stays the M01-D05 StatefulSet and PVC." Answer: accept.

**R2 — volume and exposure, only if R1 is accepted.** Accept: "I accept a Compose named volume and a `127.0.0.1` publish for M01-MONGO-01. That volume is not the DATA-A PVC, and the publish is not a ClusterIP." Rejecting R1 drops R2. Answer: accept.

**R3 — slice width.** Accept the narrow slice: "I accept that M01-MONGO-01 does not create `commercecore_dev`, `commercecloud_dev`, their users, or the backup drill." Or widen it: "Add the two empty databases and least-privilege users from M01-D05 to this unit, still with no domain collection." Answer: accept narrow.

**R4 — image line.** Accept: "I accept `docker.io/library/mongo:8.0.38-noble` as the candidate. The digest stays unresolved until the registry inspect below." Or name another linux simple tag from the same library file, for example `8.3.17-noble`. Do not answer with `latest`, `8`, or `8.0`. Answer: accept the candidate. The image pin section records the later registry read.

## Image candidate and digest method

Observed on 2026-11-17 from the Docker Official Images library file `https://raw.githubusercontent.com/docker-library/official-images/master/library/mongo`.

| Field | Observed value |
|---|---|
| Linux simple tags on the 8.0 stanza | `8.0.38-noble`, `8.0-noble` |
| Shared tags on that stanza | `8.0.38`, `8.0` |
| Architectures | `amd64`, `arm64v8` |
| `docker-library/mongo` GitCommit | `5fd7eb19024b73c9ec84644f1b23acbb33bee8b0` |

That GitCommit is the library commit that published the tag. It is not an OCI image digest. The 2026-11-17 proposal did not run a registry inspect. The image pin section below is the later read.

The same file, on the same read, points floating tag `8` at `8.3.17` and floating tag `latest` at `9.0.8`. Both are rejected for this slice. M01-D05 says an officially maintained MongoDB 8.x server and leaves the patch pending. `8.0.38-noble` stays on that 8.0 line and is a linux tag, so it does not select the Windows manifests that share `8.0.38`. `8.3.17-noble` is a newer minor. R4 did not choose it.

The verification method:

```text
docker buildx imagetools inspect docker.io/library/mongo:8.0.38-noble
```

Re-read the library file first. If the simple tag `8.0.38-noble` is gone, stop. Do not substitute `mongo:8`, `mongo:8.0`, or `mongo:latest`. Record the OCI index digest and the platform digest for the host (`linux/amd64` on the usual WSL2 machine, `linux/arm64` if that is the host). Pin the Compose image as `docker.io/library/mongo:8.0.38-noble@sha256:<index digest>`. Inside the container, `mongod --version` must report the same patch as the tag. That container check is still not run.

## Image pin, 2026-11-18

On 2026-11-18 at 01:57 Europe/Amsterdam this documentation task re-read the Docker Official Images library file and inspected the registry. Docker was not installed on this machine, so the inspect used the registry HTTP API. It is the same registry read `docker buildx imagetools inspect` performs. An earlier handoff had already run `docker buildx imagetools inspect docker.io/library/mongo:8.0.38-noble` with buildx v0.39.0, exit 0, at 2026-11-18 01:02 Europe/Amsterdam, and reported the same index digest. This section uses the HTTP re-check as the record. The earlier Slack report is not the proof by itself.

Library file `https://raw.githubusercontent.com/docker-library/official-images/master/library/mongo`, fetched at 2026-11-18 01:57:30Z. The `8.0.38-noble` stanza was still present: `Tags: 8.0.38-noble, 8.0-noble`, `SharedTags: 8.0.38, 8.0`, `Architectures: amd64, arm64v8`, `GitCommit: 5fd7eb19024b73c9ec84644f1b23acbb33bee8b0`. On that same read, floating tag `8` still points at `8.3.17` and floating tag `latest` still points at `9.0.8`. Both stay rejected.

Registry read, exit 0, same timestamp. Anonymous token from `https://auth.docker.io/token?service=registry.docker.io&scope=repository:library/mongo:pull`, then:

```text
GET https://registry-1.docker.io/v2/library/mongo/manifests/8.0.38-noble
Accept: application/vnd.oci.image.index.v1+json, application/vnd.docker.distribution.manifest.list.v2+json, application/vnd.oci.image.manifest.v1+json, application/vnd.docker.distribution.manifest.v2+json
```

The response was HTTP 200. `Content-Type` was `application/vnd.oci.image.index.v1+json`. `Docker-Content-Digest` was `sha256:76a93cc399d05709baeea4e55385749657aa0085ad5b497c851380778eccea2c`. The sha256 of the response body was the same value.

**Pinned reference.** This is the OCI index, not a single platform manifest:

`docker.io/library/mongo:8.0.38-noble@sha256:76a93cc399d05709baeea4e55385749657aa0085ad5b497c851380778eccea2c`

The tag stays in the reference so a reader can see which tag was inspected. The digest is the pin. A later pull of the tag without `@sha256:` is not this pin.

| Entry | Digest | Role |
|---|---|---|
| OCI index | `sha256:76a93cc399d05709baeea4e55385749657aa0085ad5b497c851380778eccea2c` | the pin |
| `linux/amd64` image manifest | `sha256:9b73c38e39783bd21335f603a9f08be60fe385f5c28933ea32bb4a9fa1fd6d23` | platform image, not the pin |
| `linux/arm64/v8` image manifest | `sha256:6afd815c86b1e213642b78fd3b9187498d5a0361f89bfdbbf0e87eed5290e8b3` | platform image, not the pin |
| `unknown/unknown` | `sha256:a0c5614c76fffe9503d09d365fe5129c564586e91ddba5642db9a5f570ca4b09` | attestation of the amd64 manifest (`vnd.docker.reference.type=attestation-manifest`), not an image |
| `unknown/unknown` | `sha256:94873b0e2f90dbe63b31100a3371d4d31730778605ecb1f937b9280c9b5fe5c6` | attestation of the arm64 manifest, not an image |

This inspect ran on `x86_64`. The usual WSL2 machine is also `linux/amd64`. Both linux platforms are in the index, so the index pin covers `linux/amd64` and `linux/arm64/v8`. Pinning only the amd64 manifest would drop arm64. That is why the pin is the index.

Each platform manifest was fetched from `GET /v2/library/mongo/manifests/<digest>` with `Accept: application/vnd.oci.image.manifest.v1+json`. Each response was HTTP 200, `Docker-Content-Digest` matched the index entry, and the sha256 of the body matched that digest. Config blobs, fetched at 2026-11-18 01:58 Europe/Amsterdam, matched their manifest config digests:

| Platform | Config digest | Config identity |
|---|---|---|
| `linux/amd64` | `sha256:850d4854394a8d1eae7b6ed9ed1e0913802bda6865af0dae099b75187fcb53e7` | `architecture=amd64`, `os=linux`, `MONGO_VERSION=8.0.38` |
| `linux/arm64/v8` | `sha256:331cc47a3fc9f4d65b88fee30dfba52085674558be01ba246df3eb01fb170b2d` | `architecture=arm64`, `os=linux`, `variant=v8`, `MONGO_VERSION=8.0.38` |

Both image-manifest annotations say `org.opencontainers.image.version=8.0.38-noble` and `org.opencontainers.image.revision=5fd7eb19024b73c9ec84644f1b23acbb33bee8b0`. That revision matches the library stanza GitCommit. It is not the digest.

No container was started. `mongod --version` was not run. MONGO-INFRA-T01 through T09 stay TEST_PLANNED / NOT_RUN.

### Do not start until this pin is merged

The digest above is a registry fact. It is not G4. Do not add a Compose file, do not run `docker compose up`, and do not pull the image from this document. G4 for this change is `READY_PENDING_MERGE` and not effective. It becomes effective only when this pin change is on `main`, the push CI of that merge is green, and no normative conflict remains. Typing a digest from memory, from a floating tag, or from the library GitCommit does not pin the image. The library GitCommit `5fd7eb19024b73c9ec84644f1b23acbb33bee8b0` is still not an OCI digest. This digest is not selected for the M01-D05 StatefulSet.

## Accepted local shape, not built

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
| MONGO-INFRA-T08 | read the Compose image reference | tag plus `@sha256:` equal to the pinned OCI index digest in the image pin section; `mongod --version` matches `8.0.38` | `latest`, floating `8`, a platform-manifest digest used as the pin, or a digest that was not printed by the registry read |
| MONGO-INFRA-T09 | teardown | default path keeps the named volume; the explicit destructive flag removes it | an undocumented volume delete |

M01-D05-T02, T03, T04, and T10 stay TEST_PLANNED/NOT_RUN on that specification. This matrix does not retire them.

## G4 request, ready pending merge

**Request ID:** `G4-REQUEST-2026-11-17-M01-MONGO-INFRA-01`  
**Status:** `READY_PENDING_MERGE`

The owner named this request ID on 2026-11-17 at 23:23 Europe/Amsterdam and granted it only after the three conditions in the owner ratification section. Merge of PR #50 is not that grant. Merge of PR #51 satisfied condition 1 only. The image pin section writes condition 2. This file does not mark the request effective, and it does not dispatch the implementation unit. The implementation unit still waits for this pin change to be merged, for that merge's push CI to be green, and for a later handoff that checks all three conditions against merged `main`.

When the three conditions are true, the grant covers only the Compose file, the pinned image, the named volume, the loopback publish, reading `.env.local`, the idempotent bootstrap, and a smoke for T01–T09. It does not cover a NestJS module, a Mongo driver in the API, a Helm database, a k3d StatefulSet, domain collections, Stripe, orders, payments, inventory, a cloud account, or a registry push. One member is not HA.

## Out of scope

- Changing K2, NET-A, DATA-A, or STRIPE-A.
- Editing `D-05-MONGO`, SER-126, or GitHub #9.
- Write concern, journaling, transactions, uncertain commit, Inbox, or Outbox. Those belong to the later design unit.
- Closing AUD-P0-01..04 or marking any of the 148 experiments run.
- Catalog routes. Catalog G4 stays not granted.
- A second replica, failover, or any HA claim.
