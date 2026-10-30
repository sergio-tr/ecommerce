# W1-SCOPE-B02 — Next Scope Ratification Package: Security and CommerceCloud

**Status:** PROPOSED / NOT RATIFIED. **Date:** 2026-10-30. **Owner:** @sergio-tr. **Original W1-AP-01 scope:** one secure, recoverable Stripe test-mode eGame license purchase. All actual guest/operator permissions and tenant isolation are mandatory even if comprehensive identity/administration workflows are deferred.

## Seven individually undecided M04 CAP entries

| ID | Exact minimum requirement | Suggested M04 disposition | Explicitly not approved |
|---|---|---|---|
| CAP-SEC-001 | Distinguish buyer, Store operator and Platform actor permissions; enforce domain authority | EXCLUDE physical full B2B/B2C dual-realm deployment | Any reduction of roles or cross-tenant isolation |
| CAP-SEC-002 | Secure guest session, authorized account claim, privileged operator authentication and CSRF protections | STILL UNRESOLVED exact OIDC/BFF mechanism | Treating Stripe testmode as permission for anonymous admin/refund/key access |
| CAP-SEC-003 | Govern fixed initial Store operator permissions, actor proofs and revocation expectations | EXCLUDE self-service multiuser membership lifecycle from M04 | Default all-access actors |
| CAP-SEC-011 | Strong admin operator authentication, MFA/recovery rule and explicitly limited high-risk actions | STILL UNRESOLVED exact initial admin MFA/identity approach | Silently dropping historic R0.7-09 MFA proposal |
| CAP-CLOUD-001 | Configured Tenant/Brand/Store identity and effective policies with stable scope | EXCLUDE full self-service provisioning and lifecycle UI | CommerceCore trusting unscoped Store identity |
| CAP-CLOUD-004 | A restricted pre-authorized initial operator model | EXCLUDE invitation and membership administration workflow | Operator access without role authority |
| CAP-CLOUD-008 | CommerceCore depends on a public tenant/Store configuration contract, not Cloud private tables | STILL UNRESOLVED initial separate Control Plane persistence/runtime arrangement | Allowing CommerceCore to own CommerceCloud private DB or financial truth |

These are source-scoped proposals: R0.7-01/03/06/09/10, R0.1-01, R0.2-01 and R0.4-02. The historical R0.7 identity choices are generally PROPOSED — SELECTED; user acceptance of a secure M04 journey does not automatically ratify physical Keycloak topology.

## Alternatives

- **B02-A (recommended):** minimal but real actor/guest security, authorized operator access, trusted tenant scope and a versioned CommerceCloud-to-Core configuration port. Defer full tenant self-service, invitations and physical dual-realm rollout. Ratify actual guest/session, privileged MFA and Cloud storage contract **separately**.
- **B02-B:** implement the full B2B/B2C realm topology, provisioners, membership controls and independent SaaS UI as part of M04. Expands schedule and security surface without proving Checkout correctness faster.
- **B02-C:** use hardcoded shared privileges, skip buyer claims or let eGame/Stripe redirect authorize operations. **Reject:** violates tenant isolation, refund authorization and secret-disclosure controls.

## Non-negotiable acceptance oracles

1. An unauthenticated user cannot act as Store operator; a buyer cannot invoke refund authorization, import/license management or protected stock release.
2. Guest capability is bound to a specific Store, Order and buyer verification policy, expires/revokes as specified and cannot be replayed across identities.
3. Key-disclosure authorization must be checked at time of potential reveal; a stale UI claim cannot authorize real exposure.
4. Tenant/Store/provider account identities are derived from trusted context; forged headers, event metadata or guessed IDs cannot cross the boundary.
5. CSRF, redirect, session fixation/replay, MFA expectations, token/secret storage and lost-recovery paths have explicit failure oracles.
6. CommerceCore cannot mutate CommerceCloud's private persistence; commercial payment and inventory are not delegated to the Control Plane.
7. No operator manual repair bypasses AUD-P0-01..04 durable effect exclusion.

## Exact decisions to request next

- Ratify B02-A **as a functional scope boundary only** for seven CAP entries.
- Decide a concrete secure guest-and-operator session/authorization model before M04 API implementation (M00.3).
- Decide whether/how the initially privileged operator must meet the historically proposed MFA rule, or record a formally approved alternative.
- Decide the initial CommerceCloud independent-storage/interface contract separately from whether a full Cloud runtime is deployed.

**Current status:** B02 remains PENDING. No implementation authorization, new aggregate, endpoint or runnable identity system follows from this review. Continue AUD-P1-03 as the next independent original architecture audit, without treating its double retry-window proposal as approved.
