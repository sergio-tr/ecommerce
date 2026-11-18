# M01-MONGO-01 local Compose

**Status:** `G4_EFFECTIVE_SCOPED` for this local Compose path only.  
**Decision:** [PROP-2026-11-17-M01-MONGO-INFRA-01](../00-governance/M01_MONGO_INFRA_G3_PROPOSAL.md).  
**Linear:** [SER-138](https://linear.app/sergiotr/issue/SER-138/m01-mongo-01-local-compose-mongodb-infrastructure-g3).  
**Runtime rows:** MONGO-INFRA-T01 through T09 are `NOT_RUN`. This file does not claim G5.

One `mongod`, replica set `rs0`, one member. The image is the OCI index `docker.io/library/mongo:8.0.38-noble@sha256:76a93cc399d05709baeea4e55385749657aa0085ad5b497c851380778eccea2c`. The named volume is `commercecore-mongo-data`. The Compose network `commercecore-mongo` is internal. The only host publish is `127.0.0.1`.

K2 stays the application runtime. The M01-D05 StatefulSet and PVC stay specified and unbuilt. This path does not create `commercecore_dev`, `commercecloud_dev`, their users, or a backup drill. It does not add a NestJS driver. `D-05-MONGO` stays PENDING. One member is not HA.

## Secrets

Put `MONGO_INITDB_ROOT_USERNAME` and `MONGO_INITDB_ROOT_PASSWORD` in the gitignored `.env.local`. This repository sets neither value. Values cannot contain a newline or a double quote. No tracked example carries a password.

An authenticated replica set also needs a MongoDB keyfile. `mongo-up.sh` generates `tmp/mongo/keyfile` with mode `400`. `tmp/` is gitignored. The file is not a second database user and not a business credential. If `commercecore-mongo-data` already exists and the keyfile is missing, startup refuses to mint a replacement.

The official image starts as root so `docker-entrypoint.sh` can drop to uid 999. `entrypoint.sh` copies the Compose secret, which is mode `0444`, onto a mode-400 file owned by that user. `mongod` rejects a keyfile that is readable by group or other.

## Commands

```bash
bash tools/mongo/mongo-up.sh
bash tools/mongo/mongo-smoke.sh
bash tools/mongo/mongo-down.sh
bash tools/mongo/mongo-down.sh --destroy-volume
```

`mongo-up.sh` is idempotent. A second start on the same volume does not call `rs.initiate` again and does not delete the volume. Startup writes one document only from the smoke, in database `infra_probe`, collection `probe`: `{ "probe": "mongo-infra" }`.

`mongo-smoke.sh` runs T01 through T09. Without `--fresh`, an existing `commercecore-mongo-data` volume makes it exit 1 and it does not delete that volume. `--fresh` is the explicit destructive start: it removes the volume, then runs the rows. The T09 step inside the smoke uses the default down, which keeps the volume. `--destroy-volume` is the only flag that removes it.

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

`pnpm run mongo:check` reads the Compose file and the scripts. It checks a missing credential file, an empty password, a Docker-unavailable start, and the teardown plan. It does not start MongoDB and it does not mark T01 through T09 as run.

## Evidence on the implementation machine

On 2026-11-18 this implementation machine had no Docker daemon. `mongo-smoke.sh` was not executed against a container. T01 through T09 stay `NOT_RUN`. A later owner run is `WAITING_OWNER_LOCAL` until that smoke prints `mongo-infra-smoke: PASS` with exit 0. That future log is still not G5 until the separate evidence review says so.
