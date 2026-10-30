# M01-D07 — Developer Experience, Health and Observability Contract

**Status:** DOCUMENTARY G3 SPECIFICATION PREPARED / NOT EXECUTED. **Owner:** @sergio-tr.
**Scope:** initial local Kubernetes observability for CommerceCore API, CommerceCloud API and eGame; advanced cluster-wide SRE evidence remains M08.
**Dependencies:** M01-D02 app ownership, D03 networking, D04 health/image contract, D06 sensitive-data policy.

## Decision: incremental telemetry rather than a large monitoring platform on day one

- **Phase A (mandatory before first Kubernetes application review):** structured JSON logs to stdout/stderr, trace/request IDs, a deterministic `/health/live` endpoint, a separate `/health/ready` endpoint, `/health/startup` if necessary, Pod identity diagnostic limited to local-only test, `kubectl logs` and `kubectl describe` documented runbook. This is the M01 baseline.
- **Phase B (M01 follow-on, optional but valuable learning):** OpenTelemetry **traces/metrics** instrumentation for Node (OpenTelemetry JS tracing/metrics stable), a local Collector as Deployment, dashboards/alert review using Prometheus/Grafana if machine budget allows. No obligation to start Loki, Jaeger, Grafana, Prometheus, Tempo and a collector simultaneously just to prove one health endpoint.
- **Phase C (M08):** durable multi-instance monitoring, retention/backup, SLO calibration, centralized log storage/Loki, alert escalation, advanced tracing across extracted services and failure/chaos telemetry.

**Trade-off:** minimal low-memory baseline first, optional telemetry expansion once basic k3d workload starts. No fabricated SLO numbers or instant `observed` evidence.

## Log schema and data safety

Every application log event should contain:
`timestamp` (ISO 8601 UTC), `severity`, `service.name`, `service.version` (git commit), `environment`, `instance.id` (Pod), `requestId`, optional `traceId`/`spanId`, `event.name`, duration/error code and scoped non-sensitive identifiers where authorized.

Do **not** log Stripe API keys, webhook signing secrets, raw digital activation keys, access/guest tokens, Authorization headers, customer PII, raw Session payloads or Mongo connection passwords. Log error *classes* and correlation references, not complete sensitive objects. In development, redact consistently in success and exception logging.

**Instrumentation owner:** application uses standard OpenTelemetry APIs; runtime adapters configure the SDK/exporter. Domain layers do not import vendor telemetry SDKs directly. An absent collector is not fatal to starting a health-only application.

## Health probes and routing

| Endpoint / probe | Meaning | Dependencies | Kubernetes consequence |
|---|---|---|---|
| `/health/live` | HTTP process loop functioning | no external Stripe or heavy DB dependency | repeated failure may restart Pod |
| `/health/ready` | can safely accept supported current requests | only essential local dependencies for routes this Pod actually serves | remove Pod from Service ready endpoints |
| `/health/startup` (if needed) | bootstrap has completed and liveness can begin | transient initialization | suppress premature restart on slow boot |
| Local `/diagnostics/pod` | deterministic Pod/process identity to prove two-replica routing | only test mode; no tokens/secrets | demonstrate load distribution; disable in public profiles |

**No claim of zero downtime** when one Pod is deleted; measure actual response failures and times. Use structured tests against two ready Pods, check EndpointSlices and record observed responses.

## Planned instrumentation and alert candidates

| Signal | Minimum observable source | Meaning |
|---|---|---|
| `http.server.request.duration` | API request timer/histogram | latency, not proof of correctness |
| `http.server.active_requests` | API gauge/up-down counter | concurrency health |
| `process.memory.usage` and CPU | Node + kube metrics when available | local workload resource budget |
| `kube_deployment_status_replicas_available` | optional kube-state-metrics | replica health after component is installed |
| `outbox_pending_age` | future Payments/Ordering owner metric | **M04 only**, must not be faked in M01 |
| `payment_unknown_age` and `protected_stock_hold_age` | future authoritative owner metrics | never authorize timeout-based financial release |

Proposed local log retention: container runtime defaults for bootstrap, documented as **ephemeral**; persistence/central backend not falsely assumed. Any metrics cardinality limits and SLO thresholds remain based on measurements, not chosen blindly.

## Developer workflow objectives

- Clean clone + documented bootstrap commands, predictable local host mapping and cluster context check.
- Short iteration path: execute Nx unit/architecture tests without rebuilding Kubernetes every edit; build/import/redeploy image for integration experiments.
- `kubectl logs`, `kubectl describe`, rollout status and Service/EndpointSlice inspection instructions with known output patterns.
- Bounded local resources, safe teardown and preservation of documents/log evidence as non-sensitive artifacts.
- Failure triage: separate DNS/Ingress failure, Pod not Ready, image pull failure, Mongo connectivity, incompatible peer versions and exception crashes.

## Planned test/evidence matrix

| ID | Scenario | Required evidence |
|---|---|---|
| M01-D07-T01 | API healthy | liveness/ready 200 and consistent Pod health |
| T02 | Fake DB down after DB integration | readiness fails where necessary, liveness not killed by transient DB |
| T03 | Two Core Pods | requests show two different Pod identities |
| T04 | Delete one Pod | ready endpoint removes it; observed recovery time recorded |
| T05 | Unsupported log level | typed error/default policy, no secret leakage |
| T06 | Forced application exception | structured safe error event and request correlation |
| T07 | No OTel Collector | mandatory health endpoints still work and bounded exporter failure |
| T08 | Optional Collector installed | trace ID correlates inbound request and observed span |
| T09 | Access/secret value passed accidentally | log redaction check finds no raw secret |
| T10 | Missing Pod resource metrics server | health/CI unaffected; metrics capability shown as unavailable |
| T11 | One environment reset | repeatable app log/event and artifact cleanup path |
| T12 | Grafana/Loki optional backend absent | not claimed deployed or operational |

All `TEST_PLANNED / NOT_RUN`. M01-D07 produces observability scaffolding; it is not proof of finance or tenant isolation and cannot close AUD-P0-01..04.

## G3 status and references

**Phase A contract specified** (logging, health semantics, runbook, error codes and Pod distribution evidence). **Phase B tool versions, exporter/collector and retention configuration proposed**, not selected as mandatory foundation. Exact log schema in code and observed health semantics need G4 implementation/tests.

Official sources:
- https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/
- https://opentelemetry.io/docs/languages/js/
- https://opentelemetry.io/docs/platforms/kubernetes/helm/collector/
- https://grafana.com/docs/loki/latest/setup/install/helm/
