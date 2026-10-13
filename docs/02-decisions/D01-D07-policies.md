# D-01 through D-07 — Accepted Checkout Policy Index

These seven main policies are ACCEPTED with explicit user qualifications, **not** blanket approvals of their physical state machines, retry values or provider behavior. The detailed authoritative English records are linked below.

| Policy | Ratified direction | Full rationale and alternatives |
|---|---|---|
| D-01 | Financially protected Reservation, evidence-gated commit/release | [D-01](D-01-full-adr.md) |
| D-02 | Configurable/versioned Stripe Session expiration with actual expires_at | [D-02](D-02-full-adr.md) |
| D-03 | Hosted Stripe Checkout, cards and 3D Secure, no delayed methods initially | [D-03](D-03-full-adr.md) |
| D-04 | Preserve commercial obligation, safely recover stock, full refund on proven inability to fulfill | [D-04](D-04-full-adr.md) |
| D-05 | Durable Stripe operation, verified Inbox, atomic Outbox and saga recovery before Kafka | [D-05](D-05-full-adr.md) |
| D-06 | Exclusive limited sequential commercial payment attempts | [D-06](D-06-full-adr.md) |
| D-07 | Authorized explicit cancellation, early Session expiry when possible, mandatory reconciliation | [D-07](D-07-full-adr.md) |

See [Scoped Decision Register](decision-register.json), [Financial Invariants](../architecture/FINANCIAL_INVARIANTS.md) and [Global Audit](../04-audit/REGISTER.md). No P0 is closed. No experiment is VERIFIED.

**Examples of unratified details:** D-01-SM is a four-state candidate only; D-02-P01 35-minute value is selected but unratified; D-06-P01 two-session maximum is selected but unratified; capture policy, Mongo write guarantees, guest cancellation authorization, financial dispatch neutralization, Stripe recovery and fulfillment/refund quiescence remain unresolved.
