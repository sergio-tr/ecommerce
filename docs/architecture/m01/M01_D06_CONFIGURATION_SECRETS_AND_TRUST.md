# M01-D06 — Configuration, Secret Isolation and Local Identity Contract

**Status:** DESIGN SPECIFICATION COMPLETE FOR REVIEW; KUBERNETES/STRIPE VALIDATION NOT RUN.
**Owner:** @sergio-tr. **Accepted parent:** ADR-M01-001 K2/NET-A/DATA-A/STRIPE-A. **Implementation:** NOT AUTHORIZED.

## Threat model and initial trust boundaries

M01 development runs on an operator-owned local machine but must not train unsafe production habits. Assume a malicious repository commit, a compromised development Pod, accidental log publication, guessed tenant identifiers or exposed host ports. No actual buyer payment or game license is required in M01.

Only public, nonsecret defaults may appear in Git. Kubernetes `Secret.data` encoding is **not encryption**; by default Secrets may be unencrypted at rest in the control-plane datastore, and anyone with broad Kubernetes permissions or local Docker/host access can read them. Secrets are not allowed in GitHub PR logs, test fixtures, Helm values, app images, stack traces or diagnostics.

## Configuration and ownership decisions

| Class | Examples | Storage/injection | Required validation |
|---|---|---|---|
| App-public | `NODE_ENV`, ports, API base URL, tracing toggle | English nonsecret `.env.example` and validated ConfigMap/Helm values | type/range/required fields checked at startup |
| Service-private | DB scoped URI, authentication signing keys, later Stripe test secret/webhook signing key | ignored local secret source → Kubernetes Secret by approved local procedure → only owning Pod | fail closed on missing/invalid values; no secret dump |
| Provider-identity | Stripe account ID, `livemode=false`, accepted currency/payment profile | controlled CommerceCore config, signed/account-checked at Payments boundary | reject account mismatch; never trust request-supplied account ID |
| Buyer-private | session/claim token, personal identifiers | Identity/Ordering scoped storage when designed under M00.3 | never in ConfigMap/image/telemetry |
| Digital-license secrets | game activation codes | Fulfillment-owned secure storage when M00.2 is implemented, **not** a regular K8s static Secret per order | never log/display in infra diagnostics |

**Initial method selection:** `env.example` for public fields; a separately ignored `.env.local` or locally protected secret source for credentials; a **manual/local-only secret creation/import procedure** for first k3d. No secret manifests or `stringData` values committed. For long-term encrypted GitOps, consider SOPS/External Secrets in M08, not an unnecessary M01 prerequisite.

## Configuration verification contract

1. App startup validates explicit schema (NestJS `ConfigModule` + standard schema validation library, exact package chosen by M01-D01 peer lock). Invalid values fail before starting HTTP.
2. A local profile `local-test` rejects `sk_live_`, `pk_live_`, `livemode=true`, disallowed production URLs and unsafe fallback signing keys. This check belongs to a future Payments adapter; the bootstrap has **no Stripe secret**.
3. Strong default: bind user-facing k3d ports to loopback only; no public MongoDB Service and no cloud deployment credentials.
4. App ServiceAccounts are per Deployment, `automountServiceAccountToken: false` by default unless API access is explicitly required. No cluster-admin role for apps.
5. Use RBAC least privilege. No blanket permissions to list/get cluster Secrets; restrict Kubernetes admin creds to the developer machine.
6. Containers run non-root with read-only image filesystem when possible; no hostPath/host network, only necessary writable mounts.
7. Do not rely on Kubernetes Namespace alone to isolate tenants, secret access or data. Full NetworkPolicy enforcement requires supported CNI and explicit test.
8. Rotate a disposable DB app password through controlled secret replacement and Pod restart; document expected session invalidation. **No claim of zero-downtime secret rotation.**
9. Sensitive data cannot be returned by `/health`, exposed in CI artifacts, used in log correlation IDs, or stored in frontend bundles.

## Separate identities and exposures

- `egame-web` never receives Mongo credentials or Stripe secret keys.
- `commercecore-api` accesses its DB/user only; `commercecloud-api` its own DB/user only.
- `commercecore-worker` is disabled initially; when authorized it receives only owner-specific minimal credentials and dispatch rules.
- Buyer guest/claim permissions, OAuth/OIDC/Keycloak and operator MFA remain M00.3 contracts; this infrastructure document does **not** implement or implicitly bypass them.
- Stripe test merchant account is a later user-controlled manual setup; a Stripe Customer is *not* another Stripe merchant account.

## Required artifacts after implementation authorization

`docs/development/CONFIGURATION.md`, version-controlled secret-free example file, ignored local credentials procedure, validation schema, per-workload ServiceAccount/RBAC definitions, environment-rejection tests, secret hygiene scanner, threat assumptions and owner responsibility. Names are **planned outputs**, not current files.

## Planned negative/evidence tests

| ID | Scenario | PASS oracle |
|---|---|---|
| M01-D06-T01 | Missing required DB URI or invalid port | fail at startup with typed nonsecret error |
| T02 | `sk_live_` configured in test profile | reject startup before provider call |
| T03 | Image and bundle inspected for secrets | no private credentials or activation keys |
| T04 | Core app requests Cloud DB Secret/DB | access denied |
| T05 | eGame reads backend private env | no value available |
| T06 | App ServiceAccount requests Kubernetes Secrets list | denied |
| T07 | CI triggered by untrusted PR | no injected provider/deployment secrets |
| T08 | Invalid signature/guest header | future app denies unauthorized operation; M00.3 verification not inferred |
| T09 | Local Secret rotated | app restart uses new credential, old one revoked |
| T10 | Helm render with defaults | no literal real credentials, external credential refs valid |
| T11 | Health endpoint/log exception | secrets and PII redacted |
| T12 | Public ingress vs internal data port | Mongo/privileged endpoints not externally routed |

All `TEST_PLANNED / NOT_RUN`. Nothing in M01-D06 authorizes storing Stripe live keys or running a financial attempt.

## Evidence and risks

Kubernetes Secrets provide a controlled API resource, not automatic encryption: use local least-privilege and short-lived disposable credentials, plus explicit risk acceptance. Stronger encryption-at-rest, Secret controllers and supply-chain policy for public deployment are separately specified in M08. Helm templating must never hardcode the actual credential.

**Exit:** ownership and failure behavior specified; real RBAC/Secret/API and image inspection pending local implementation, and M00.3 operator/guest trust contract remains pending.

Official sources: https://kubernetes.io/docs/concepts/security/secrets-good-practices/ ; https://kubernetes.io/docs/concepts/security/rbac-good-practices/ ; https://kubernetes.io/docs/concepts/configuration/secret/ ; https://docs.stripe.com/keys
