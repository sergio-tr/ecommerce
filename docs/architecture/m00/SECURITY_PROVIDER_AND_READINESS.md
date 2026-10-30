# M00 — Guest Security, Provider Boundary and Readiness Decisions

**Status:** Recommended design contracts, not implementation authorization. Owner @sergio-tr. D-03 B02/B06 directions and M00.3/M00.4 remain subordinate to explicit protocol/verification decisions.

## Tenant, actor and guest boundary

Single eGame Store for initial test mode does not eliminate tenant isolation. Every command checks trusted tenantId, StoreId, authenticated actor/guest claim and resource ownership. Never trust tenant supplied directly by the browser or a Stripe metadata claim. External Stripe evidence is bound to an expected account, environment, Order generation and immutable Quote.

Proposed guest purchase model: cryptographically strong, unpredictable opaque claim token stored only as a server-side hash, bound to tenant/Store/order/purpose, with expiration, revocation, renewal and replay policy. Buyer must verify possession through the controlled claim process; Order status and license reveal authorizations are separate. Use same-site hardened HTTP-only sessions, CSRF controls and short-lived privileged grants. Operator action (refund, finance investigation, key import, capacity repair) requires authentication, MFA direction and per-action authorization. Password-less guest flow does not grant administrative scope.

B2B/B2C realm deployment and invitation UI deferred. CommerceCloud owns Tenant/Store policy/configuration, CommerceCore consumes a versioned public configuration contract (not Cloud's private tables). A single configured Store is valid only with isolation and authenticated effective policies.

## Stripe initial provider profile

Prefer **one explicitly configured Stripe test-mode merchant account for the initial single Store** while treating Connect topology/funds ownership as a separate later, user-reviewed requirement. Do not claim this is a production multi-merchant funds flow. Contract provider accountId, API version, livemode=false, currency, charge/capture mode, refund source and API capability per Store.

Candidate: Stripe-hosted Checkout, payment mode, automatic capture, `card` with required 3DS if issuer requests, delayed methods OFF, `after_expiration.recovery` OFF, wallets and Stripe Link NOT ENABLED by effective configuration. A configured `payment_method_types=['card']` alone is not proof the actual hosted UI excludes all wallet/Link options under the Stripe account's effective settings; verify in test mode. Record the real Session expires_at rather than assuming 35 minutes. No second Session while any prior Session/attempt remains potentially collectible, including UNKNOWN.

`checkout.session.completed` is not independently sufficient if capture/delayed semantics have not been confirmed. Payments verifies Session payment_status, PaymentIntent/Charge captured evidence, exact amount and currency, account/mode; protect Inventory until authoritative facts are incorporated. Browser redirect triggers reads only.

## Readiness and limitations

- G0: original R1 clause-level and user ratification lineage pending; all 110 source-matched audit IDs still need English scenario/oracle fidelity.
- G1: all 140 capability scope classifications selected, but actor/accessibility and precise pricing acceptance oracles still need ratified detail.
- G2: user accepted high-level recommended policies; P0 effect protocols and physical Mongo/Stripe design still reviewable candidates rather than empirically ratified guarantees.
- G3: individual cross-context commands, schemas, case-specific interleavings, source code acceptance criteria and provider evidence incomplete.
- G4: implementation issues/branches can only begin with explicitly accepted task-specific scope; independent M01 foundation planning can proceed before financial P0 proof.
- G5: 148 tests remain TEST_PLANNED/NOT_RUN. Actual Stripe test-mode, Mongo failover and key reveal fault-injection experiments must execute later.
- G6: production/live-money not authorized.

**No universal closure by choosing a fail-closed incident.** UNKNOWN is a correct and recoverable *safe condition*, but it can hold capacity indefinitely; the system must offer investigation and accountable escalation, not promise automatic liveness.

Sources: https://docs.stripe.com/api/checkout/sessions/create ; https://docs.stripe.com/api/checkout/sessions/object ; https://docs.stripe.com/webhooks ; https://docs.stripe.com/api/refunds/create
