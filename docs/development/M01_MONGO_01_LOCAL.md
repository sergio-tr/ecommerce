# M01-MONGO-01 local Compose

**Status:** `G4_EFFECTIVE_SCOPED` for this local Compose path only.  
**Decision:** [PROP-2026-11-17-M01-MONGO-INFRA-01](../00-governance/M01_MONGO_INFRA_G3_PROPOSAL.md).  
**Linear:** [SER-138](https://linear.app/sergiotr/issue/SER-138/m01-mongo-01-local-compose-mongodb-infrastructure-g3).  
**Runtime rows:** T01 is not passed. On 2026-11-18 the owner reported `bash tools/mongo/mongo-smoke.sh --resume` on `15e46e5f94e1b21b517a7b673240079914a14508` with exit 0, T02 through T09 revalidated, `t01=NOT_CLAIMED`, `matrix=NOT_CLAIMED`, and `g5: NOT_CLAIMED`. That report is not a clean T01 and not G5. `mongo-t01-isolated.sh` is `NOT_RUN` in this change. This file does not claim G5.

One `mongod`, replica set `rs0`, one member. The image is the OCI index `docker.io/library/mongo:8.0.38-noble@sha256:76a93cc399d05709baeea4e55385749657aa0085ad5b497c851380778eccea2c`. The named volume is `commercecore-mongo-data`. The Compose network `commercecore-mongo` is a dedicated bridge and is not internal. Docker 29 does not install a host publish on an internal-only network. The only host publish is `127.0.0.1`.

K2 stays the application runtime. The M01-D05 StatefulSet and PVC stay specified and unbuilt. This path does not create `commercecore_dev`, `commercecloud_dev`, their users, or a backup drill. It does not add a NestJS driver. `D-05-MONGO` stays PENDING. One member is not HA.

## Secrets

Put `MONGO_INITDB_ROOT_USERNAME` and `MONGO_INITDB_ROOT_PASSWORD` in the gitignored `.env.local`. This repository sets neither value. Values cannot contain a newline or a double quote. No tracked example carries a password.

An authenticated replica set also needs a MongoDB keyfile. `mongo-up.sh` generates `tmp/mongo/keyfile` with mode `400`. `tmp/` is gitignored. The file is not a second database user and not a business credential. If `commercecore-mongo-data` already exists and the keyfile is missing, startup refuses to mint a replacement.

The official image starts as root so `docker-entrypoint.sh` can drop to uid 999. `entrypoint.sh` copies the Compose secret, which is mode `0444`, onto a mode-400 file owned by that user. `mongod` rejects a keyfile that is readable by group or other.

## Commands

```bash
bash tools/mongo/mongo-up.sh
bash tools/mongo/mongo-smoke.sh
bash tools/mongo/mongo-smoke.sh --resume
bash tools/mongo/mongo-t01-isolated.sh
bash tools/mongo/mongo-down.sh
bash tools/mongo/mongo-down.sh --destroy-volume
```

`mongo-up.sh` is idempotent. A second start on the same volume does not call `rs.initiate` again and does not delete the volume. A clean T01 writes one document in database `infra_probe`, collection `probe`: `{ "probe": "mongo-infra" }`. Changing the network from internal to the dedicated bridge can make the next `mongo-up` recreate the container. That recreate keeps the named volume.

`mongo-smoke.sh` without arguments runs T01 through T09 and can print `mongo-infra-smoke: PASS` only when the named volume starts absent. That line is still not G5. If `commercecore-mongo-data` already exists, the script exits 1, does not delete the volume, and does not claim T01. `--resume` revalidates the unauthenticated `infra_probe` read and T02 through T09 on that volume. T04 in that revalidation recreates the container and keeps the volume. It prints `t01=NOT_CLAIMED` and `mongo-infra-smoke: REVALIDATION_ONLY`. It does not print `PASS`. `--fresh` deletes the volume. It is not the recovery for the volume left by the 2026-11-18 owner run. The T09 step inside the smoke uses the default down, which keeps the volume. `--destroy-volume` is the only flag that removes it.

The authorization check is an unauthenticated read of `infra_probe.probe`. `{ ping: 1 }` is not the oracle. Only an authorization rejection passes that check. A connection error does not. The read does not send the root username or password.

`mongo-t01-isolated.sh` is the clean T01 that can run while `commercecore-mongo-data` already exists. It takes no arguments and rejects `--fresh`. It uses a second Compose project, `commercecore-mongo-t01`, container `commercecore-mongo-t01`, Docker volume `commercecore-mongo-t01-data`, network `commercecore-mongo-t01`, runtime directory `tmp/mongo-t01`, and publish `127.0.0.1:27018`. The replica-set member host stays `mongo:27017` inside that container. The image, `--auth`, and one-member `rs0` stay the canonical ones. The command mints its own keyfile and password under `tmp/mongo-t01` and does not read `.env.local` or `tmp/mongo/keyfile`. Before `up` it renders the Compose config and refuses any project, container, volume, network, or bind that is not that isolated set. A success removes only the isolated project. A failure leaves the isolated project in place and does not delete it. If `commercecore-mongo-t01-data`, the isolated container, or the isolated network already exists, the command stops and leaves it. This command does not run T02 through T09, does not claim T06 or T08, and prints `t01=ISOLATED_PASS` only for that separate empty volume. `mongo-infra-smoke: PASS` is not one of its lines. Exit 0 is not G5.

The canonical names stay in `compose.yaml`. K2 stays the application runtime. The M01-D05 StatefulSet and PVC stay specified and unbuilt. Port `27018` is loopback for this harness only. It is not a second ratified publish of the owner container, and it is not a T07 host-client pass. T07 still requires `127.0.0.1:27017`.

If Docker is missing or the daemon is unreachable, `mongo-up.sh` and `mongo-smoke.sh` exit 2 and print `WAITING_OWNER_LOCAL`. Exit 2 is not a pass and not G5.

The default publish is `127.0.0.1:27017`. If that port is taken, set `MONGO_PUBLISH_PORT` to another integer from 1 to 65535. The bind address stays `127.0.0.1`. The replica-set member host stays `mongo:27017`, so the T07 host client is specified only when the published port is 27017. Do not report an alternate port as a T07 pass.

## Host client

Inside the Compose network the member host is `mongo:27017`. A host client uses the same name. Add an untracked hosts entry that maps `mongo` to `127.0.0.1`. The URI is:

```text
mongodb://mongo:27017/infra_probe?replicaSet=rs0&authSource=admin
```

The username and password are not part of that URI. `directConnection` is not a pass. The smoke's host leg runs a short-lived container on the host network with `mongo` mapped to `127.0.0.1`, using the pinned image and this URI.

`--bind_ip_all` is the listen address inside the container network namespace. It lets the Compose name and the published port reach `mongod`. It is not a host publish on every interface.

## Static checks

`pnpm run mongo:check` reads the Compose file and the scripts. It checks a missing credential file, an empty password, a Docker-unavailable start, the teardown plan, the unauthenticated-read classifier, and that the loopback publish is not paired with `internal: true`. It also checks that the isolated T01 command refuses `--fresh`, an existing isolated volume, and a failed bootstrap without `down -v`, using a fake Docker client. It does not start MongoDB and it does not mark T01 through T09 as run.

## Evidence

On 2026-11-18 the owner ran `bash tools/mongo/mongo-smoke.sh` on WSL2 x86_64, Docker 29.1.3 and Compose 5.3.0, against `92a8f7d1a541fd0a465a0976504a9b2196f1d2a3`. Before the run the named volume was absent, the container was absent, and port 27017 was free. The reported result was T01 clean start, `mongo-up: PASS`, then `mongo-infra-smoke: anonymous ping succeeded`, and exit 1. T02 through T09 did not run. That log is not a T01 pass and not G5.

The same run left volume `commercecore-mongo-data` and container `7121f393320f` up and healthy. `docker ps` showed `27017/tcp` with no host mapping. `docker port commercecore-mongo 27017/tcp` reported that no public port was published. The read-only inspect showed `NetworkSettings.Ports={"27017/tcp":null}`, `HostConfig.PortBindings` requesting `127.0.0.1:27017`, gateway empty, and the container attached only to `commercecore-mongo`. The file at that SHA had `internal: true`.

This correction does not delete that volume, does not rewrite `.env.local` or the keyfile, and does not recreate the container. The implementation machine for this change had no Docker daemon, so the corrected smoke was not executed here. A later `--resume` is revalidation only. It is not a T01 through T09 pass and not G5.

On 2026-11-18 the owner ran `bash tools/mongo/mongo-smoke.sh --resume` on WSL2 against `15e46e5f94e1b21b517a7b673240079914a14508`. The reported console excerpt showed exit 0, `mongo-infra-smoke: resume existing volume`, `t01=NOT_CLAIMED`, `mongo-up: PASS`, an unauthenticated `infra_probe` read rejected, the existing probe document read, T02 through T09 revalidated, `port 127.0.0.1:27017`, `matrix=NOT_CLAIMED`, `REVALIDATION_ONLY`, and `g5: NOT_CLAIMED`. No full log and no `mongod --version` line were supplied. That report is not a clean T01 and not G5. The named volume `commercecore-mongo-data` stays. `--fresh` is not the next step.

The isolated harness was not executed on that machine or on the implementation machine. Docker was not installed here, so `mongo-t01-isolated.sh` cannot be reported as a pass from this change. After this change is merged, the owner command is `bash tools/mongo/mongo-t01-isolated.sh` on that merged SHA, with Docker running, `127.0.0.1:27018` free, and the isolated volume, container, and network absent. The closing lines that match this harness are `t01=ISOLATED_PASS`, `t02-t09=NOT_RUN`, `matrix=NOT_CLAIMED`, and `g5: NOT_CLAIMED`, with exit 0. `v8.0.38` has to appear in that log. Those lines still do not claim G5. If the isolated names already exist, the command exits 1 and does not delete them. Removing those names is a separate owner decision and must not be applied to `commercecore-mongo-data`, `commercecore-mongo`, or `tmp/mongo`.
