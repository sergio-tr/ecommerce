# D-03 — Initial payment-method surface

**Decision:** ACCEPTED (policy only; with expressly recorded qualifications). **Evidence:** TEST_PLANNED, except D-01 is also SPECIFIED at policy level; no experiment VERIFIED. **Primary source:** Texto pegado (5)(20261013-170142).txt (original individual proposal). **Authority:** later explicit user ratification governs; the original proposal's initial PENDING heading is historical and must not be interpreted as today's status.

## Ratified policy and safety conditions

1. The initial eGame vertical uses hosted Stripe Checkout in test mode for credit/debit cards including issuer-required 3D Secure.
2. Do not silently enable delayed methods, direct debits, financing or unsupported alternative providers.
3. Apple Pay and Google Pay are deliberately postponed, not structurally prohibited; Stripe Link is separately undecided.
4. Store-configured commercial payment policies must be enforced by the effective Stripe adapter, not inferred from presentation settings alone.
5. Provider-specific API versions and method selection mechanisms must be tested; avoid hard-coding obsolete Stripe parameter names as permanent domain contracts.
6. Payment, PaymentAttempt and financial evidence remain provider-neutral within the domain; the Stripe adapter owns translation.
7. Card rejection inside a Session or 3DS challenge does not by itself end the entire commercial charge opportunity.
8. Browser return, cancel_url and hosted Checkout display state cannot establish actual capture.
9. An issuer/card payment may temporarily be unknown or processing; protecting inventory is still required.
10. Financial authorization versus capture must be explicitly decided before any event authorizes license delivery.
11. Payment methods and credentials must be isolated by tenant, store, environment and Stripe account.

## Alternatives retained in the ADR

- A — Cards and 3DS only: ACCEPTED for initial eGame.
- B — Card-backed wallets: deferred for an explicitly controlled expansion.
- C — Stripe dynamic methods without business restrictions: not selected; configuration could enable incompatible settlement windows.
- D — Cards plus delayed methods: outside initial scope because of prolonged protection and reconciliation complexity.

## Consequences and trade-offs

Safety requires durable states, context-specific authority, bounded commercial flexibility and explicit investigation of external/unknown effects. Business throughput can be reduced when Stripe fails or evidence is ambiguous. That is deliberate: preserving financial/inventory correctness takes precedence over falsely declaring completion. No alternative or numbered clause above selects a Mongo schema, physical worker algorithm, standalone microservice, provider API version or globally atomic workflow.

## Scoped unresolved decisions and dependencies

- D-03-WALLET DEFERRED.
- D-03-LINK PENDING.
- D-03-CONFIG PENDING: API-version-specific enforcement.
- D-03-CAPTURE is an audit reference for PENDING capture mode, not a separately ratified canonical identifier.
- Stripe Connect charge owner and merchant model remain PENDING.

## Future verification

- Relevant planned tests: Provider integration tests; AUD03-T15; AUD-P1-04 review.
- Do not treat simulator success as proof of Stripe-internal behavior.
- Verify authoritative business facts, provider objects where applicable, isolation boundaries and lack of duplicated financial/fulfillment effects.
- Required status: TEST_PLANNED. No VERIFIED evidence exists.

## Source and change governance

The original source contains more discussion, interleavings and alternative rationale than this ratification-focused record. Preserve that source in custody and consult it for any fine-grained implementation specification. Later changes require scoped ratification and an English feature/bugfix branch + PR owned by @sergio-tr.
