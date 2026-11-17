# Decision — M01-K8S-01 listen address

**Decision ID:** `AUTH-2026-11-17-M01-K8S-01-LISTEN`  
**Status:** `G3_ACCEPTED_2026-11-17` / scoped G4 already granted / `G5_NOT_PASSED`  
**Accountable owner:** @sergio-tr  
**Linear:** [SER-137](https://linear.app/sergiotr/issue/SER-137/m01-k8s-01-local-api-image-helm-and-k3d-smoke)  
**Base reviewed:** `origin/main` `61997bc58fe78925a11515877bcdb95d16c1ae00`

## Owner decision

On 2026-11-17 the owner ratified LISTEN-B for the existing task `CC-M01-K8S-01-OWNER-G4-IMPLEMENTATION-30`.

The NestJS listen host is runtime configuration. The safe default remains `127.0.0.1` for a host-local process. The local Kubernetes Deployment is the only place that sets `COMMERCECORE_HTTP_HOST=0.0.0.0`, so kubelet probes can reach `GET /health/live` on the pod IP. Any other host value is invalid and the process exits before it listens. The rejected value is not copied into the error.

This does not add a public Ingress, a NodePort, a LoadBalancer, a host port, or a host network. The Service is ClusterIP. The developer reaches it with `kubectl port-forward` bound to `127.0.0.1`.

## Security tradeoff

`0.0.0.0` listens on every interface inside the pod network namespace. That is wider than loopback, and it is what makes the pod IP reachable. The chart keeps that exposure inside the cluster: one replica, non-root uid 1000, read-only root filesystem, dropped capabilities, no ServiceAccount token, and no registry pull (`imagePullPolicy: Never`). Setting `0.0.0.0` on the developer machine, or publishing the container port on a host interface, would expose the health route beyond loopback. The host-local example file does not do that.

Both probes call the existing `GET /health/live`. `/health/ready` stays absent. The route does not check a database or a provider, and `dependenciesChecked` remains false.

## What this grant still excludes

No production cluster, cloud account, credential, Stripe, MongoDB, CommerceCloud, eGame, catalog route, or business endpoint. Catalog G3 stays accepted and catalog G4 stays not granted. AUD-P0-01 through AUD-P0-04 stay OPEN/BLOCKING. The 148 original experiments stay TEST_PLANNED/NOT_RUN. M01-BOOTSTRAP-01 nonfinancial G5 stays the passed result already recorded for that foundation. M01-K8S-01 G5 is not passed by this decision. The next roadmap slice is MongoDB, and only after this slice is closed under its own gates.

## Evidence

Image build and k3d execution are recorded in [M01_K8S_01_LOCAL.md](../development/M01_K8S_01_LOCAL.md). A green chart render is not a cluster pass.
