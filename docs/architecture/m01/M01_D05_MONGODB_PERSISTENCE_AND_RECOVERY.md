# M01-D05 — MongoDB Local Persistence, Data Ownership and Restore Contract

**Status:** DESIGN SPECIFICATION COMPLETE FOR REVIEW; PHYSICAL VERSION/DIGEST AND TEST EVIDENCE PENDING.
**Decision:** DATA-A ACCEPTED in ADR-M01-001 (2026-10-30).
**Owner:** @sergio-tr. **Milestone:** M01, with D-05-MONGO/M00.1 and M00.2 still independently blocking financial/stock effects.
**Implementation:** NOT AUTHORIZED / NOT PERFORMED.

## Objective and hard exclusions

Provide one **disposable local MongoDB replica-set** infrastructure with persistent volumes, *independent database authority* for CommerceCore and CommerceCloud, reproducible initial configuration and a verifiable data survival/recovery procedure. M01 does **not** implement checkout, Payment, Reservation, key inventory, distributed transactions or production high availability.

A single-node replica set is selected initially because it allows transaction **development**, not failover proof. Mongo transactions with majority write concern are only atomic within MongoDB and only across database/collection records deliberately enlisted in the same owner-local transaction. They never include Stripe/HTTP/browser effects.

## Chosen topology (DATA-A refinement)

| Component | Proposed local decision | Evidence / caveat |
|---|---|---|
| MongoDB version | One officially maintained MongoDB 8.x server and corresponding official driver, **exact minor/patch and OCI digest PENDING** source/host compatibility check | Do not use `mongo:latest` or assume a given ARM/x86 image works |
| Server | One `mongod` container in Kubernetes StatefulSet with stable DNS and a single persistent volume | A one-member `rs0` has no automatic failover or node-loss redundancy |
| Databases | `commercecore_dev`, `commercecloud_dev` | Names are developer labels, not business tenant IDs |
| Users | `commercecore_app` scoped only to core DB; `commercecloud_app` scoped only to cloud DB; bootstrap admin credential separate | Validate permissions with negative tests; never mount admin creds in application Pods |
| Network | `ClusterIP` only, internal `commerce-data` namespace, no public Ingress or NodePort for Mongo | Namespaces alone do not enforce traffic isolation; NetworkPolicy requires functional CNI and tests |
| Credentials | Stored outside git and injected via Kubernetes Secret from ignored local source; TLS for internal DB traffic to be evaluated in M01-D06 security policy | Secret base64 is not encryption and node admins can access development secrets |
| Data volume | `PersistentVolumeClaim` using actual local k3d/K3s provisioner; finite request and documented capacity/delete behavior | Deleting cluster/volume may delete data; PVC is not backup |
| Initialization | Explicit *idempotent* one-time bootstrap operation/Job to initialize rs0 and per-database least-privilege roles | Must handle rerun, auth enabled, and no hardcoded admin passwords |
| Client connection | Scoped URI, explicit replicaSet=rs0, timeouts and no `directConnection` bypass unless tested for required host DNS | Replica-set hostname must resolve from relevant Pods |

**No enforced MongoDB 8.x patch chosen yet:** the physical server version, platform image and exact driver peer versions must be resolved using the actual OCI/registry metadata before a runnable chart is created.

## M01 data lifecycle

1. Create isolated test credentials and the database-owned service identity; ensure neither Core nor Cloud loads the other's secret.
2. Apply a StatefulSet/PVC only after secret/namespace/D03 network gates are reviewed. Initialize replica-set exactly once using a guarded operation.
3. Create a non-sensitive fixture in each DB; record a schema version and fixture ID, not real game keys, customer PII or live payment data.
4. Restart the Mongo Pod; re-read the same fixture by each authorized app identity.
5. Back up using a MongoDB-consistent method (e.g., `mongodump`/restore for the small learning dataset) to a separate *approved local path* outside ephemeral cluster storage; document auth, encryption/permissions and selected versions.
6. Perform a **destructive restore drill only against a disposable test namespace/database**: stop writers; restore; verify records/counts/checksums, ownership, no private data crossing.
7. Provide explicit reset modes: app-only reset, test fixture reseed, storage-preserving restart and full cluster/volume deletion; require an explicit opt-in for destructive storage removal.

## Domain-specific transaction contract, NOT settled by M01

Original D-05-MONGO requires exact owner-local atomicity for Order+CheckoutProcess+Outbox, Payment+Inbox+Outbox, StockPool+Reservation. D05 prepares a compatible infrastructure, but does **not** approve aggregation, indexes, transaction retry rules, durable dispatch claims or cross-context writes. Driver behavior under `UnknownTransactionCommitResult` must be tested in M00.1. Real failover evidence requires a separate multi-member lab in M08.

## Planned tests (no results asserted)

| ID | Fault/input | Acceptance oracle |
|---|---|---|
| M01-D05-T01 | Replica set bootstrap from empty PVC | one PRIMARY and stable `rs0`; rerun is idempotent |
| T02 | Connect as CommerceCore DB user to its DB | successful controlled fixture read/write |
| T03 | Core user attempts CommerceCloud DB write/read | permission denied |
| T04 | Cloud user attempts Core DB read/write | permission denied |
| T05 | Mongo Service inspected | no external LoadBalancer/Ingress/NodePort |
| T06 | Restart DB Pod with PVC intact | fixture persists |
| T07 | Delete Pod during connection usage | API reports transient unavailability; no false HA claim |
| T08 | Database client URI hostname mismatch | fails with actionable diagnostics; no insecure fallback |
| T09 | Wrong Secret or missing Secret | controlled startup failure, no default superuser |
| T10 | Back up fixture and restore to new isolated DB | exact logical content and app permissions validated |
| T11 | Full cluster teardown | retention/deletion behavior matches explicit documented mode |
| T12 | Unsupported Mongo image/driver combination | version policy prevents silent mutable image upgrade |

**Execution status:** all `TEST_PLANNED / NOT_RUN`. A successful restart test does not verify crash-consistent multi-document financial transactions.

## Dependencies, open inputs and G3 outcome

- Needs M01-D01 actual Docker/WSL architecture and image digest, D03 Kubernetes StorageClass/CNI, D06 credential/Secret injection policy.
- Physical Mongo major/minor/patch, driver release and volume capacity require an actual compatibility lock.
- **Contract/DoR status:** D05 scope and negative oracles specified; physical compatibility and local execution pending. No G4 implementation authorization.

**Official references:** https://www.mongodb.com/docs/manual/core/transactions/ ; https://www.mongodb.com/docs/manual/reference/read-concern-majority/ ; https://www.mongodb.com/docs/manual/tutorial/deploy-replica-set/ ; https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/ ; https://kubernetes.io/docs/concepts/storage/persistent-volumes/
