# M01-D04 — Reproducible Images, Kubernetes Deployments and Helm Release Contract

**Status:** G3 DOCUMENTARY SPECIFICATION / NO IMPLEMENTATION OR TEST EXECUTION. **Owner:** @sergio-tr. **Accepted scope:** ADR-M01-001 K2 + NET-A + DATA-A; **dependencies:** M01-D01/02/03. **Delivery tool:** Helm 4.3.1 (documented support for Kubernetes 1.37).

## Compared deployment manifest choices

- **A — Helm 4** with one small umbrella/dev chart and versioned individual app templates: **RECOMMENDED** because user wants independently configurable Deployments, release/rollback experiments and eventual framework distribution; documented `helm template` or `helm lint` are the verification gates.
- **B — Kustomize overlays** for M01: viable, lower templating complexity, less release/package practice; can complement charts later, but avoid maintaining two competing sources of truth.
- **C — raw duplicated YAML per app/environment**: rejected for drift and upgrade complexity.

**Status of this subordinate implementation-tool choice:** DESIGN_RECOMMENDED, not a historical user-ratified standalone decision; require review before generating files.

## Candidate release chart model (not created)

```text
deploy/
  helm/
    commerce-platform-dev/
      Chart.yaml          # Helm chart v2 metadata, exact dependency and app chart versions
      values.yaml         # purely nonsecret defaults
      values.local.yaml.example
      templates/
        commercecore-deployment.yaml
        commercecore-service.yaml
        commercecloud-deployment.yaml
        commercecloud-service.yaml
        egame-deployment.yaml
        egame-service.yaml
        ingress.yaml
        serviceaccounts.yaml
        configmaps.yaml
        resourcequota.yaml
    # mongo operator/StatefulSet chart scoped to M01-D05 after explicit approval
```

Each workload Deployment has a unique name, image repository/tag/digest, `app.kubernetes.io/name`, instance, part-of, version, managed-by labels, declared ServiceAccount, resource requests and limits, security context and health probes. Do not put a Stripe secret, DB password or real game key in any `values*.yaml` tracked by Git.

## Image reproducibility requirements

- **Multi-stage OCI image builds**: separate dependency/build stage and minimal runtime stage; Node base pinned to an official verified digest, not just `node:latest` or an unverified `:24` mutable tag. Image for Angular static assets must be static web only and not contain `sk_test_` or merchant-only configuration.
- **Pinned dependency lock**: `pnpm-lock.yaml` frozen in CI; the same versioned workspace/packageManager key as M01-D01. No runtime package installation from uncontrolled latest tags.
- **Tag strategy**: `<app>:git-<sha12>` for developer visibility, actual deployed image pinned by OCI immutable digest in release manifest after build; keep original commit/manifest/chart provenance.
- **Image security**: run non-root where runtime permits, disable privilege escalation, drop Linux capabilities, read-only rootfs where app runtime supports it, no host network or hostPath for application pods; explicit writable tmpdir if required by runtime.
- **Cloud credentials**: not needed in M01; no Docker Hub auto-public push by default. k3d local image import or separately approved local registry used for dev deployments.
- **Supply chain**: GitHub Actions permissions minimal, no untrusted PR secret access, pin action revisions after separate audit; vulnerability scan can be configured as an independent G3 quality contract.

## First M01 deployment values to review

| Workload | Initial replicas | Probe contract | Resource placeholders, NOT measured |
|---|---|---|---|
| CommerceCore API | 1; increase to 2 for Service balance acceptance | `GET /health/live` process up; `GET /health/ready` dependencies necessary for traffic | request 100m CPU/128Mi; limit 500m CPU/512Mi, to profile |
| CommerceCloud API | 1 | distinct `/health/live`, `/health/ready`, no admin data exposed | request 100m/128Mi; limit 500m/512Mi, to profile |
| eGame static frontend | 1 | simple static health, accurate asset base URL | request 25m/64Mi; limit 200m/256Mi, to profile |
| Core worker | 0 by default in M01 bootstrap; enable 1 after Outbox port/locking contracts | readiness only if required for worker admission | TBD; no financial dispatcher in bootstrap |
| MongoDB | D05-owned StatefulSet, one replica-set member | database health/replica-set readiness, separate DB secret | TBD from measured db/memory resources |
| Ingress Traefik | K3s-managed, avoid duplicate Helm deployment | actual controller readiness | read actual selected K3s chart |

**Probe caveats:** liveness must not depend on Stripe availability or deep Mongo operations in a way that restarts healthy processes during an external outage; readiness may fail if dependency actually prevents safe serving, but document what endpoints are disabled vs healthy. No buyer/secret information returned from health endpoints.

## Release lifecycle and rollback

1. Before a release, `helm lint` + `helm template` validate generated objects with the selected values and schema; schema/Kubernetes server-side dry-run only after local K3s exists.
2. `kubectl rollout status` and readiness show the new ReplicaSet as available before declaring deploy PASS. Use RollingUpdate with explicit `maxSurge` and `maxUnavailable` for HTTP stateless apps; initial candidate `maxSurge:1`, `maxUnavailable:0` for Core API 2-replica exercise, resource headroom mandatory.
3. Rollback via immutable image release/Helm release to previous version; **do not** claim DB schema or external payment state is rolled back automatically.
4. Stop/start/scale tests manipulate stateless health only. Domain worker rollout with in-flight Stripe effects needs P0-01 dispatch/neutralization proof before allowing multiple workers or automatic termination semantics.
5. Document secure config separately and never log secrets, full Stripe webhook payloads containing PII or digital-license plaintext.

## Planned acceptance test catalog

| ID | Procedure (future) | Objective oracle |
|---|---|---|
| M01-D04-T01 | Build OCI image from clean pinned lock | deterministic version/commit provenance; no unpinned production runtime deps |
| T02 | Scan image config/layers | no `sk_test`, `sk_live`, webhook secret or raw license |
| T03 | Helm lint/template with local values | correct Deployment/Service/Ingress names/selectors, immutable images and no secret literals |
| T04 | Start one API Pod and verify probes | liveliness/readiness distinction observed |
| T05 | Increase Core replicas to two | two ready EndpointSlice targets and distinguishable response identities |
| T06 | Kill one Core Pod | old connection may fail but new requests route to ready replica; no false perfect zero downtime claim |
| T07 | Change image and observe rollout | new revision adopted, image digest and commit logged |
| T08 | Helm rollback application-only | previous image re-established; explicitly no Mongo rollback |
| T09 | No privileged/missing Stripe/DB Secret | app fails securely or starts in explicitly nonfinancial demo mode; no unsafe defaults |
| T10 | Remove ingress and attempt unknown host route | no admin endpoint exposed via default backend |
| T11 | Helm chart API minor pair | Helm 4.3.1 + K3s 1.37 output and server-side validation agree |
| T12 | k3d local teardown | no remote spend; PVC/data retention consequences documented and checked |

All cases **TEST_PLANNED / NOT_RUN**, no Helm chart or Kubernetes manifest currently created.

## G3 completeness and next action

**SPECIFIED:** image/release ownership, health contracts, workload separation, helm source-of-truth candidate, readiness/rollout/rollback oracles and secret prohibition. **PENDING:** exact trusted image digests, measured resource limits, Helm final chart version/structure, approved health semantics per service, actual install/rollout evidence. M01-D04 cannot be declared G5 VERIFIED and is not executable without separate G4 authorization.

## Source verification

- https://docs.helm.sh/el/docs/topics/version_skew/ — Helm 4.3.x supports Kubernetes 1.37 through 1.34.
- https://github.com/helm/helm/releases — Helm v4.3.1 published Oct 2026.
- https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
- https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/
- https://kubernetes.io/docs/concepts/containers/images/
- https://docs.k3s.io/networking/networking-services
