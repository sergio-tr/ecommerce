# M00 — Mongo Local Atomicity, Reservation Conservation and DigitalLicense Uniqueness

**Status:** SPECIFICATION CANDIDATE (recommended), not repository-executed or ratified physical schema. Owner @sergio-tr. Preserves D-05, D-01-SM selected candidate, AUD-P1-01 and M00.2 open contracts.

## MongoDB physical recommendation

Use a **local MongoDB replica set**, not a standalone server, for independently owned bounded-context transactional writes. Employ short owner-local multidocument transactions when one commercial transition modifies multiple documents, such as Order+CheckoutProcess+Outbox, Payment+Outbox+Inbox, and StockPool capacity+Reservation. Set explicit documented commit durability with majority write concern and compatible snapshot/majority semantics and journaling policy; verify actual server/driver release behavior. A MongoDB write conflict or UNKNOWN commit result must cause **read-back by durable operation ID** and safe reapplication (semantic idempotency), never blind financial effect repetition.

Context-specific document/collection boundaries are independent by ownership even in the monolith. No transaction is assumed to span Mongo and Stripe or another service. Network I/O never takes place while holding a DB transaction open. If you later extract bounded contexts, owner-local Outbox/Inbox semantics remain, without cross-context DB writes.

**Alternative reviewed:** embedding all Reservation and StockPool capacity mutations into one document can provide single-document atomicity for narrow one-SKU pools, but complicates shared pools, multi-line reservation and aggregate growth. Recommend separate physical records **only with an owner-local transaction and StockPool CAS/version constraints**. Final Mongo schema must be reviewed under D-05-MONGO and tested for failures.

## Inventory conservation

For a StockPool, capacity definitions must distinguish authorized supply, already committed sold units, outstanding initial/protected holds, disabled/unusable keys and explicit audited adjustments. Conservation is calculated from a monotonic movement ledger or authoritative counters reconciled to unique actual DigitalLicense records; never independently add reserved/committed counts to licensed supply without a single shared accounting rule.

Candidate initial Reservation FSM: `RESERVED -> PAYMENT_PROTECTED -> COMMITTED` or `RELEASED`; `RESERVED -> RELEASED` is permitted after initial TTL eligibility and valid financial absence. No implicit COMMITTED->RELEASED or re-open of RELEASED. Do not mirror Stripe Session/payment statuses inside Inventory.

All stock operations have tenant/Store/StockPool, reservationId, commercial generation, expected version and command idempotency key. Conditional update of StockPool balance/rights and Reservation state occurs atomically within Inventory. Last-unit competition must commit at most one saleable hold. If crash/unknown commit, read back durable operation ID and reconcile balance before admitting another.

Initial 15-minute TTL is an **expiration-review eligibility** for RESERVED; it is not a delete TTL on protected Inventory, and not a Stripe payment Session expiry. PAYMENT_PROTECTED survives past the initial TTL until safe financial release or COMMITTED.

## DigitalLicense uniqueness and reveal boundary

Use an immutable unique assignment identity (tenant, Store, licenseId) and unique OrderLine binding at the Fulfillment authority with actual unique-index constraints and semantic idempotency. A DigitalLicense can be allocated only once and never reused after potential disclosure. It is not a fungible StockPool unit after delivery.

Proposed stages for *evidence*, not necessarily a global FSM: AVAILABLE -> ASSIGNED -> ACCESS_PREPARED -> DISCLOSURE_PERMITTED/POTENTIALLY_EXPOSED -> DELIVERED_EVIDENCED; explicit incident when external effect unknown. The exact formal FSM remains to be ratified in M00.2. Do not claim browser ACK establishes disclosure absent; mark potential exposure before any response containing secret.

For multiline Order, prepare all required unique keys before enabling any key disclosure; if all-lines preparation cannot be durably guaranteed, leave keys unexposed and block/reconcile. No routine partly delivered + full refund branch.

## Invariants and failure-oracle checklist

- Two concurrent Reservations for last unit: at most one commits capacity hold; no balance negative.
- Three Stores sharing authorized pool quotas: aggregate reservations obey global capacity and each quota.
- Duplicate CreateReservation command: one Reservation and one capacity decrement.
- Unknown Mongo commit: no duplicate StockPool decrement, no duplicate OrderLine assignment.
- Payment-protected hold beyond 15-minute initial TTL: remains protected.
- Release versus late financial admission: one authoritative safe outcome, otherwise hold/escalate.
- Two workers allocate same key: only one OrderLine assignment succeeds.
- One key exposed and HTTP response lost: cannot return key to AVAILABLE.
- Two-line order second key missing: no first key disclosure and commercial resolution remains recoverable.
- Refund on committed capacity: does not automatically restock an exposed key.

## Evidence boundary

MongoDB docs establish owner-local transaction atomicity under configured transaction/write concerns; they do not prove these guards are correctly applied in the proposed application or that a transaction protects an external Stripe call.

Sources: https://www.mongodb.com/docs/manual/core/transactions/ ; https://www.mongodb.com/docs/manual/reference/command/committransaction/ ; https://www.mongodb.com/docs/manual/reference/read-concern-majority/
