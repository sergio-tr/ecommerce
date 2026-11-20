# Proposal — M01-MONGO-01 local MongoDB infrastructure G3

**Decision ID:** `PROP-2026-11-17-M01-MONGO-INFRA-01`  
**Task:** `M01-MONGO-01`  
**Status:** `G3_ACCEPTED_2026-11-17` for `M01-MONGO-01` local Compose infrastructure only / `G4_EFFECTIVE_SCOPED` / scoped local G5 `PASSED_LOCAL` after the post-merge check below  
**Date:** 2026-11-17  
**Accountable owner:** @sergio-tr  
**Linear:** [SER-138](https://linear.app/sergiotr/issue/SER-138/m01-mongo-01-local-compose-mongodb-infrastructure-g3)  
**GitHub issue:** not opened. Creating an issue in `sergio-tr/ecommerce` returned HTTP 403. This file does not invent an issue number.  
**Proposal base:** `origin/main` `ae4ccc5f3221c631230deff6cf1992c9943b71be`  
**Ratification base:** `origin/main` `d6e24c35f41c67e7d55bab10ba72e13ef5a667a1`, merge of [PR #50](https://github.com/sergio-tr/ecommerce/pull/50)  
**Image pin base:** `origin/main` `898fa77f69110ab97205245ded2716c48d35be9d`, merge of [PR #51](https://github.com/sergio-tr/ecommerce/pull/51). Push CI [Actions run 44203521366](https://github.com/sergio-tr/ecommerce/actions/runs/44203521366) `success`; jobs `validate`, `chart`, and `image` each `success`  
**G4 evidence base:** `origin/main` `ae55c22aa82a8148bfeea3bcb867d85ecf4a5b19`, merge of [PR #52](https://github.com/sergio-tr/ecommerce/pull/52) by @sergio-tr at 2026-11-18 06:45 Europe/Amsterdam. Push CI [Actions run 44246479138](https://github.com/sergio-tr/ecommerce/actions/runs/44246479138) `success`; jobs `validate`, `chart`, and `image` each `success`  
**G5-A record base:** `origin/main` `455ca288024d01f61ce004dde2a7ed8ed0606795`, merge of [PR #59](https://github.com/sergio-tr/ecommerce/pull/59). Push CI [Actions run 44762498521](https://github.com/sergio-tr/ecommerce/actions/runs/44762498521) `success`; jobs `validate`, `chart`, and `image` each `success`. That merge recorded the excerpt and left G5 unpassed. `PASSED_LOCAL` waits for a manual merge of the acceptance record and a green push CI of that merge. The post-merge check section is the later result of that wait. This file does not close SER-138.  
**Not this task:** [SER-126](https://linear.app/sergiotr/issue/SER-126) / GitHub #9 / `D-05-MONGO` / `AUD-P1-05`. The durability design is separately `G3_ACCEPTED — DESIGN_ONLY` in [PROP-2026-11-20-D05-MONGO-01](D05_MONGO_DURABILITY_G3_PROPOSAL.md). This infrastructure file does not grant a durability G4 and does not close AUD-P1-05.

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

**G4** request `G4-REQUEST-2026-11-17-M01-MONGO-INFRA-01` was `G4_CONDITIONAL_NOT_EFFECTIVE` when the owner ratified it. The image pin section first marked it `READY_PENDING_MERGE`. The same owner message grants it only after all three of these are true:

1. This ratification is in a reviewed and merged pull request. The merge of PR #50 does not count. That merge recorded the proposal and left R1–R4 unanswered.
2. A real OCI digest for `docker.io/library/mongo:8.0.38-noble` is copied from a registry inspect for the host platform and pinned. At ratification time this file had no digest. The image pin section records the later registry read. A digest written without that read does not count.
3. No normative conflict remains inside this slice. R1–R4 close the conflicts named below. `D-05-MONGO` stays outside this slice. It is not accepted here, and it is not a reason to widen the slice.

While any of the three is false, Compose, a container, and the implementation unit stay forbidden. At the time this section was written, item 1 was false until the ratification pull request merged, and item 2 was false because the digest was unknown. Merging that ratification pull request satisfied item 1 only. The G4 effective scoped section records the later check in which all three are true.

Later state, recorded in the image pin section: item 1 is true because [PR #51](https://github.com/sergio-tr/ecommerce/pull/51) is merged. That section marked item 2 as written and still short of effective until the pin change itself was merged and its CI was green. The G4 effective scoped section below is the check after that merge. `READY_PENDING_MERGE` is the earlier label, not the current one.

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

`AUD-P0-01` through `AUD-P0-04` stay OPEN/BLOCKING. The 148 original experiments stay TEST_PLANNED/NOT_RUN. Catalog G4 stays not granted. `D-05-MONGO` stays outside this slice. The audit register still says `AUD-P1-05` is OPEN. Linear showed SER-126 as `In Review` when this file was written. Neither tracker was edited.

## What the accepted records already say

| Source | Status | What it selects | What it leaves open |
|---|---|---|---|
| [ADR-M01-001](../02-decisions/ADR-M01-001-kubernetes-first-and-test-stripe.md) D-1 | ACCEPTED K2 | k3d/K3s is the local M01 application runtime | K1, Compose as the sole environment, is rejected |
| ADR-M01-001 D-3 | ACCEPTED DATA-A | one local MongoDB replica set, separate Core/Cloud databases and credentials, durable PVC, not HA | `D-05-MONGO` transaction, write concern, and unknown commit |
| [M01-D03](../architecture/m01/M01_D03_K8S_TOPOLOGY_AND_NETWORK.md) | documentary spec | one member, PVC, ClusterIP in `commerce-data`, no NodePort or LoadBalancer | image digest not selected; host not inspected when the spec was written |
| [M01-D05](../architecture/m01/M01_D05_MONGODB_PERSISTENCE_AND_RECOVERY.md) | documentary spec | StatefulSet, `rs0`, `commercecore_dev` and `commercecloud_dev`, least-privilege users, idempotent bootstrap, MongoDB 8.x with patch and digest pending | no G4; T01–T12 are TEST_PLANNED/NOT_RUN |
| [M01-D06](../architecture/m01/M01_D06_CONFIGURATION_SECRETS_AND_TRUST.md) | documentary spec | credentials outside git; loopback for host ports; no secret in the repo | Kubernetes Secret injection is the specified path |
| [D-05](../02-decisions/D-05-full-adr.md) | ACCEPTED policy only | durable local record before an external effect; Inbox/Outbox direction | `D-05-MONGO` is `G3_ACCEPTED — DESIGN_ONLY` in its own record. No schema and no physical write concern in this slice |
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
| M9 version and digest pin | M01-D05 patch and digest PENDING for the StatefulSet | R4. The OCI index digest is recorded in the image pin section for the Compose path only. G4 for that path is `G4_EFFECTIVE_SCOPED`. The M01-D05 StatefulSet digest stays pending |
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

### G4 effective, scoped, 2026-11-18

The pin paragraph above said G4 stayed `READY_PENDING_MERGE` until the pin change was on `main`, the push CI of that merge was green, and no normative conflict remained. That check was made against `ae55c22aa82a8148bfeea3bcb867d85ecf4a5b19`.

| Condition | Result |
|---|---|
| Ratification merged | True. [PR #51](https://github.com/sergio-tr/ecommerce/pull/51) is an ancestor of `ae55c22aa82a8148bfeea3bcb867d85ecf4a5b19`. R1–R4 stay the accepted sentences |
| Digest pinned and CI green | True. [PR #52](https://github.com/sergio-tr/ecommerce/pull/52) merged at that SHA. [Actions run 44246479138](https://github.com/sergio-tr/ecommerce/actions/runs/44246479138) concluded `success` for `validate`, `chart`, and `image`. The pin remains the OCI index in the image pin section |
| Normative conflict inside this slice | None found. K2 stays the application runtime. The M01-D05 StatefulSet and PVC stay specified and unbuilt. The Compose named volume is not that PVC. `D-05-MONGO` stays outside this slice |

`G4-REQUEST-2026-11-17-M01-MONGO-INFRA-01` is therefore `G4_EFFECTIVE_SCOPED`. The scope is the Compose file, the pinned image, the named volume, the loopback publish, reading `.env.local`, the idempotent bootstrap, and the T01–T09 smoke. It does not cover a NestJS module, a Mongo driver in the API, a Helm database, a k3d StatefulSet, domain collections, Stripe, orders, payments, inventory, a cloud account, or a registry push. One member is not HA. This status is not G5. At this 2026-11-18 check the owner smoke on `92a8f7d1a541fd0a465a0976504a9b2196f1d2a3` had exited 1, T01 was not passed, and T02–T09 were `NOT_RUN`. The 2026-11-20 evidence record is later. It does not widen this G4 scope and it does not pass G5. The G5-A section does not widen this G4 scope.

The library GitCommit `5fd7eb19024b73c9ec84644f1b23acbb33bee8b0` is still not an OCI digest. This digest is not selected for the M01-D05 StatefulSet.

An authenticated replica set needs a keyfile. That file is generated under gitignored `tmp/mongo/` and is not a new decision ID, a second database user, or a tracked secret. The runbook is [M01_MONGO_01_LOCAL.md](../development/M01_MONGO_01_LOCAL.md).

## Accepted local shape

The files that carry this shape are under `tools/mongo/`. The operator steps are in [M01_MONGO_01_LOCAL.md](../development/M01_MONGO_01_LOCAL.md). Building those files did not execute T01–T09.

One Compose project, one `mongod`, replica set name `rs0`, one member. Auth is required. The root username and password come from `.env.local`, which `.gitignore` already ignores through `.env.*`. The keys are `MONGO_INITDB_ROOT_USERNAME` and `MONGO_INITDB_ROOT_PASSWORD`. This document sets no value. No compose file may contain a password literal. No tracked example may contain a password.

The only published port is `127.0.0.1:27017`. If that port is taken, the implementation records another loopback port. It never publishes `0.0.0.0`.

The Compose network keeps the name `commercecore-mongo`. It is a dedicated bridge and `internal` is false. R2 is the loopback publish, not a ClusterIP and not a public bind. On Docker 29 an internal-only network accepts `HostConfig.PortBindings` and leaves `NetworkSettings.Ports` null, so that publish is not installed. The owner inspect on 2026-11-18 showed `{"27017/tcp":null}`, a requested bind of `127.0.0.1:27017`, an empty gateway, and container `7121f393320f` attached only to `commercecore-mongo`. The merged file at that time had `internal: true`. This correction turns that flag off so the loopback bind can exist. The container can open outbound connections, because that gateway is what Docker uses to install the publish. R1 is unchanged. K2 stays the application runtime. The M01-D05 StatefulSet and PVC stay specified and unbuilt. This agent did not recreate the container and did not delete the volume.

The data volume is the named volume `commercecore-mongo-data`. It is not a bind mount of the repository and not a PVC. Default teardown removes the container and keeps the volume. Removing the volume requires an explicit destructive flag.

The member host stored by initiate is `mongo`, the Compose service name, which resolves inside the Compose network. The host does not resolve that name by itself. The pass path is an in-container `rs.status()` that shows one PRIMARY named `mongo:27017`, plus a host client that uses the documented URI. If that URI needs the name `mongo`, the operator's untracked hosts file maps it to `127.0.0.1`. `directConnection=true` is not a pass. A second start on the same volume must not initiate again and must not wipe data.

The smoke may write one document `{ "probe": "mongo-infra" }` in database `infra_probe`, collection `probe`. That database is not `commercecore_dev` and holds no order, payment, inventory, or catalog document. A clean T01 writes that document. `--resume` reads it and does not delete the volume. NestJS is not a client. The API chart is not changed. The Compose network is not attached to k3d.

## Acceptance matrix

The rows below are the contract. They are not marked G5-passed. `pnpm run mongo:check` is a static file and script check. It does not mark a row as run. Exit 2, `WAITING_OWNER_LOCAL`, is not a pass. `mongo-infra-smoke: REVALIDATION_ONLY` is not a pass and does not claim T01. The 2026-11-20 owner excerpt is the evidence record after this table. Live T01 stays `NOT_CLAIMED`. Merging the excerpt does not pass G5. The G5-A section is the later owner decision and stays `G5_PROPOSED_PENDING_MERGE` until that record is manually merged and its push CI succeeds. The post-merge check section is the later result of that condition.

On 2026-11-18 the owner ran `bash tools/mongo/mongo-smoke.sh` on WSL2 x86_64, Docker 29.1.3 and Compose 5.3.0, against `92a8f7d1a541fd0a465a0976504a9b2196f1d2a3`. Before that run the named volume was absent, the container was absent, and port 27017 was free. The reported log showed T01 clean start, `mongo-up: PASS`, then `mongo-infra-smoke: anonymous ping succeeded`, and exit 1. T02–T09 did not run. That run is not a T01 pass and not G5. `{ ping: 1 }` is not an authorization check. The oracle is an unauthenticated read of `infra_probe.probe`. The same read is the T05 check. This correction does not change `--auth` to make ping fail.

After that run the volume `commercecore-mongo-data` existed. The read-only inspect showed container `7121f393320f` healthy, `NetworkSettings.Ports={"27017/tcp":null}`, and `HostConfig.PortBindings` requesting `127.0.0.1:27017`. `--resume` is the non-destructive revalidation. `--fresh` deletes the volume and is not the recovery for that volume. The next owner `mongo-up` can recreate the container to apply the network change. It keeps the named volume. This agent did not run that command.

On 2026-11-18 the owner ran `bash tools/mongo/mongo-smoke.sh --resume` against `15e46e5f94e1b21b517a7b673240079914a14508`. Exit 0. The console excerpt showed T02–T09 on the existing volume, `port 127.0.0.1:27017`, `t01=NOT_CLAIMED`, `matrix=NOT_CLAIMED`, `REVALIDATION_ONLY`, and `g5: NOT_CLAIMED`. No full log and no `mongod` version line were supplied. That revalidation is not a clean T01 and not G5.

A clean T01 that does not touch the live volume is `tools/mongo/mongo-t01-isolated.sh`. It uses project `commercecore-mongo-t01`, logical volume key `t01-data`, physical volume `commercecore-mongo-t01-data`, and `127.0.0.1:27018`. It reads `.env.local` and does not write that file. If the isolated volume, container, network, or project already exists, it exits before changing Docker and does not delete them. On `8e34cc7083f0b33cfec6e52bdc402016569d1fa5` the owner ran it and it exited 1 before Mongo started, because `config --volumes` printed `t01-data` and the check compared that key with the physical name. That run is not `T01_ISOLATED_PASS` and not G5. `T01_ISOLATED_PASS` would still not claim the live T01 or G5.

| ID | When | Pass | Fail |
|---|---|---|---|
| MONGO-INFRA-T01 | clean start on an empty volume | one PRIMARY in `rs0`; the credentialed `infra_probe` write succeeds; an unauthenticated read of `infra_probe.probe` is rejected with an authorization error. A ping response is not the oracle | a second member, an unauthenticated read that is accepted, or a network error counted as rejection |
| MONGO-INFRA-T02 | start again on the same volume | already-initialized set is left in place; the probe document is still there | initiate error treated as success by deleting the volume |
| MONGO-INFRA-T03 | restart the container | the same probe document is readable | data present only in memory |
| MONGO-INFRA-T04 | new container, same named volume | the probe document survives | a fresh empty volume silently replaces the named one |
| MONGO-INFRA-T05 | missing `.env.local` or empty password | non-zero exit before Docker changes the server; the unauthenticated `infra_probe` read is still rejected | a default user, an unauthenticated read that is accepted, or a network error counted as rejection |
| MONGO-INFRA-T06 | inspect the published port | `127.0.0.1` only | `0.0.0.0` or any non-loopback bind |
| MONGO-INFRA-T07 | read `rs.conf()` inside the container and connect from the host with the documented URI | member host resolves in the container; host check succeeds without `directConnection=true` | pass claimed through `directConnection=true` |
| MONGO-INFRA-T08 | read the Compose image reference | tag plus `@sha256:` equal to the pinned OCI index digest in the image pin section; `mongod --version` matches `8.0.38` | `latest`, floating `8`, a platform-manifest digest used as the pin, or a digest that was not printed by the registry read |
| MONGO-INFRA-T09 | teardown | default path keeps the named volume; the explicit destructive flag removes it | an undocumented volume delete |

M01-D05-T02, T03, T04, and T10 stay TEST_PLANNED/NOT_RUN on that specification. This matrix does not retire them.

### 2026-11-20 owner excerpt

**SHA:** `93ef364f05e8fcbcecc96ed2f7c54f7481763e50`  
**G5:** the excerpt left this gate `NOT_PASSED`. The commands printed `g5: NOT_CLAIMED`. This record does not convert that token into a pass. The G5-A section is the later owner decision.  
**Provenance:** owner WSL2 sanitized console excerpt posted on 2026-11-20. The report does not give a separate clock time for the commands. Full logs `/tmp/mongo-t01-final.log` and `/tmp/mongo-resume-final.log` were not copied into this repository and were not read for this record. No credential value is recorded.

| Row | Excerpt | Limit |
|---|---|---|
| Live T01 | `t01-live=NOT_CLAIMED` and `t01=NOT_CLAIMED` | The isolated pass is not a fresh start of `commercecore-mongo-data` |
| Isolated T01 | `exit=0`, `publish=127.0.0.1:27018`, `anonymous infra_probe read rejected`, `isolated volume kept`, `T01_ISOLATED_PASS`, `matrix=NOT_CLAIMED`, `g5: NOT_CLAIMED` | No `mongod --version` line and no separate `rs.status()` line in this excerpt |
| T02–T04 | `--resume` exit 0: start again, restart, recreate | Existing live volume. `REVALIDATION_ONLY`, not `mongo-infra-smoke: PASS` |
| T05 | missing env and empty password rejected; anonymous read rejected | Same resume. Not a clean matrix |
| T06 | `127.0.0.1:27017` | Same resume |
| T07 | host client completed | The excerpt does not quote `rs.conf()` |
| T08 | `db version v8.0.38` and the pinned image check | This version line is from `--resume`, not from the isolated T01 excerpt |
| T09 | `mongo-down: volume kept`, then `mongo-up: PASS` | The live volume stayed |
| G5 | `g5: NOT_CLAIMED` on both commands | The excerpt alone left this gate `NOT_PASSED`. It has no isolated `mongod --version` or `rs.status()` line, and the full logs are not in the repository. The G5-A section is the later decision |

Before the commands, `docker compose ls --all` showed live `commercecore-mongo` as `exited(1)`. That is not the isolated T01 result. Node was `v24.22.2`. Docker was available. The isolated volume, container, and network were absent, and port 27018 was free. `.env.t01.local` and `.env.local` were nonempty and gitignored.

`tools/mongo/compose.yaml` and `tools/mongo/compose.t01.yaml` at this SHA share the OCI index `docker.io/library/mongo:8.0.38-noble@sha256:76a93cc399d05709baeea4e55385749657aa0085ad5b497c851380778eccea2c`, hostname `mongo`, the same bootstrap and probe files, `mongod --replSet rs0 --bind_ip_all --auth --keyFile`, the one-member primary healthcheck, `internal: false`, and a loopback publish. They differ in project, container, volume, and network names, in the runtime env and keyfile variables, and in host port `27017` versus `27018`. That source comparison supports R4 D1 for this scoped local clean start. It is not a fresh start of the live volume. R4 D2 is the separate env file. R4 D3 is the same SHA. R4 D4 is that both named volumes stayed. AUD-P0-01..04 stay OPEN/BLOCKING. The 148 experiments stay `TEST_PLANNED/NOT_RUN`. Catalog G4 stays not granted. `D-05-MONGO` and SER-126 stay outside this record. One member is not HA.

### 2026-11-20 owner G5-A

**Status:** `G5_PROPOSED_PENDING_MERGE`.  
**Decision:** `[CC_OWNER_G5_A_ACCEPTED]`, posted by @sergio-tr on 2026-11-20 at 17:05 Europe/Amsterdam, after [PR #59](https://github.com/sergio-tr/ecommerce/pull/59) had merged.  
**Executable SHA:** `93ef364f05e8fcbcecc96ed2f7c54f7481763e50`. The runbook copy is [M01_MONGO_01_LOCAL.md](../development/M01_MONGO_01_LOCAL.md).

`PASSED_LOCAL` applies only to this local Compose infrastructure slice, and only after @sergio-tr reviews this section and merges it by hand, and the push CI of that merge succeeds. Until then the status in this file stays `G5_PROPOSED_PENDING_MERGE`. This section does not set Linear SER-138 to Done and does not widen `G4_EFFECTIVE_SCOPED`.

The owner accepts R4 D1 for the isolated clean start as the scoped local clean start. The program tokens stay exact: `T01_ISOLATED_PASS` is followed by `t01-live=NOT_CLAIMED`, `matrix=NOT_CLAIMED`, and `g5: NOT_CLAIMED`. The same SHA `--resume` stays `REVALIDATION_ONLY` with `t01=NOT_CLAIMED`, `matrix=NOT_CLAIMED`, and `g5: NOT_CLAIMED`. This decision does not say the scripts printed a G5 pass and does not say the live volume had a fresh T01.

The accepted record is the owner WSL2 excerpt on that SHA, the source checks below, and one later no-volume image command. The isolated command used the gitignored `.env.t01.local` through `MONGO_ENV_FILE`, exited 0, published `127.0.0.1:27018`, rejected the anonymous `infra_probe` read, and kept `commercecore-mongo-t01-data`. The `--resume` exited 0, revalidated T02–T09, printed `db version v8.0.38` on the live volume, published `127.0.0.1:27017`, and kept `commercecore-mongo-data`. The owner reported the live container healthy. This section does not repeat a container inspect.

`tools/mongo/bootstrap.js` returns success only when `rs.status().ok === 1`, `status.set === 'rs0'`, `status.myState === 1`, one member is named `mongo:27017`, and `rs.conf()` has `_id === 'rs0'` with that same single host. `bootstrap.sh` runs that file. The isolated script prints `T01_ISOLATED_PASS` only after that exit 0, the credentialed probe write, `AUTH_REJECTED` on the unauthenticated read, and cleanup that removes only the container and network created by that start. It does not print `rs.status()` or `mongod --version`.

Both Compose files pin `docker.io/library/mongo:8.0.38-noble@sha256:76a93cc399d05709baeea4e55385749657aa0085ad5b497c851380778eccea2c` and share the bootstrap, entrypoint, auth flags, hostname `mongo`, and one-member primary healthcheck. They differ in project, container, volume, and network names, in the gitignored credentials and keyfile, and in host port `27018` versus `27017`.

The owner then ran `docker run --rm --network none --entrypoint mongod docker.io/library/mongo:8.0.38-noble@sha256:76a93cc399d05709baeea4e55385749657aa0085ad5b497c851380778eccea2c --version` with no volume and no secret environment. The owner reported `db version v8.0.38`, gitVersion `b2f7afe3a6838999fd375c7a7ea678189f795568`, OpenSSL 3.0.13, distmod `ubuntu2404`, and `x86_64`. That report is the pinned image binary, not a read of the isolated data volume. This agent did not run Docker.

One member is not HA. K2 stays the application runtime. The M01-D05 StatefulSet and PVC stay specified and unbuilt. `D-05-MONGO` stays outside this infrastructure pass. SER-126 stays separate. AUD-P0-01..04 stay OPEN/BLOCKING. The 148 experiments stay `TEST_PLANNED/NOT_RUN`. Catalog G4 stays not granted.

### 2026-11-20 post-merge check of the G5-A condition

**Status:** `PASSED_LOCAL` for this local Compose infrastructure slice only.

The G5-A section says `PASSED_LOCAL` applies after @sergio-tr merges that record by hand and the push CI of that merge succeeds. [PR #60](https://github.com/sergio-tr/ecommerce/pull/60) is that merge, at `1b589e5ac5db51c49169f1ea5df80249bbd9e091`, on 2026-11-20 at 17:14 Europe/Amsterdam. Push CI [Actions run 44771417719](https://github.com/sergio-tr/ecommerce/actions/runs/44771417719) completed `success` at 17:15 Europe/Amsterdam. Jobs `validate`, `chart`, and `image` each completed `success`. This paragraph records that check. It does not rerun Docker.

The script tokens stay `g5: NOT_CLAIMED`, `t01-live=NOT_CLAIMED`, and `matrix=NOT_CLAIMED`. The live volume still has no fresh T01. One member is not HA. Linear SER-138 was already `Done` when this paragraph was written (`completedAt` 2026-11-20 20:16 Europe/Amsterdam). This paragraph did not set that status. The durability design is [PROP-2026-11-20-D05-MONGO-01](D05_MONGO_DURABILITY_G3_PROPOSAL.md). The owner later accepted it as `G3_ACCEPTED — DESIGN_ONLY`. That acceptance is not part of this infrastructure pass and is not G4.

## G4 request, effective for the local Compose path

**Request ID:** `G4-REQUEST-2026-11-17-M01-MONGO-INFRA-01`  
**Status:** `G4_EFFECTIVE_SCOPED`

The owner named this request ID on 2026-11-17 at 23:23 Europe/Amsterdam and granted it only after the three conditions in the owner ratification section. Merge of PR #50 is not that grant. Merge of PR #51 satisfied condition 1 only. The image pin section wrote condition 2 and, before PR #52 merged, left the label `READY_PENDING_MERGE`. The G4 effective scoped section records that all three conditions are true on `ae55c22aa82a8148bfeea3bcb867d85ecf4a5b19`.

The grant covers only the Compose file, the pinned image, the named volume, the loopback publish, reading `.env.local`, the idempotent bootstrap, and a smoke for T01–T09. It does not cover a NestJS module, a Mongo driver in the API, a Helm database, a k3d StatefulSet, domain collections, Stripe, orders, payments, inventory, a cloud account, or a registry push. One member is not HA. The owner smoke on `92a8f7d1a541fd0a465a0976504a9b2196f1d2a3` exited 1 before T02. That sentence is the 2026-11-18 check. The G5-A section is the later scoped decision and stays `G5_PROPOSED_PENDING_MERGE` until its own merge condition. The post-merge check section is that later result. It does not widen this grant.

## Out of scope

- Changing K2, NET-A, DATA-A, or STRIPE-A.
- Editing `D-05-MONGO`, SER-126, or GitHub #9.
- Write concern, journaling, transactions, uncertain commit, Inbox, or Outbox. Those belong to [PROP-2026-11-20-D05-MONGO-01](D05_MONGO_DURABILITY_G3_PROPOSAL.md), which is `G3_ACCEPTED — DESIGN_ONLY` and not a change to this infrastructure slice.
- Closing AUD-P0-01..04 or marking any of the 148 experiments run.
- Catalog routes. Catalog G4 stays not granted.
- A second replica, failover, or any HA claim.
