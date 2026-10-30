# Complete AUD-P0/P1/P2 Resolution Matrix — 13 Findings

**State:** User-requested recommended design alternatives selected for documentary review; recorded test evidence still NOT_RUN. **Owner:** @sergio-tr. **Preservation:** original audit statuses are authoritative; not automatically overwritten by this matrix.

| Audit | Recommended design resolution | Status of decision versus proof | First applicable milestone | Existing issue |
|---|---|---|---|---|
| AUD-P0-01 | Persist immutable financial intent and version-bound dispatch close; treat all past possibly sent POSTs as collectible until neutralized or hold indefinitely | DESIGN SELECTED; PROVIDER QUIESCENCE NOT VERIFIED; OPEN/BLOCKING | M00.1 | #1 / SER-118 |
| AUD-P0-02 | Provider-correlation ledger; account/mode/metadata/idempotency evidence; unknown ID never retried blindly or treated negative by search miss | DESIGN SELECTED; NEGATIVE-PROOF UNAVAILABLE; OPEN/BLOCKING | M00.1 | #2 / SER-119 |
| AUD-P0-03 | Original Order & CheckoutProcess durable before charge; Payments captured evidence with owner-local Outbox, Ordering local Inbox/recovery | DESIGN SELECTED; CAPTURE/FAILOVER TESTS PENDING; OPEN/BLOCKING | M00.1 | #3 / SER-120 |
| AUD-P0-04 | All-line preparation and strict potentially exposed/license versus refund commercial branch barriers; evidence/incident when effects in flight | DESIGN SELECTED; CROSS-EFFECT QUIESCENCE PENDING; OPEN/BLOCKING | M00.1/2 | #4 / SER-121 |
| AUD-P1-01 | 4-state D-01-SM candidate and owner-local StockPool/Reservation atomic conservation with CAS/version and idempotent ledger | FSM policy accepted; physical aggregate/transactions and tests pending; OPEN | M00.2 | #5 / SER-122 |
| AUD-P1-02 | Order commercial authority, CheckoutProcess coordination, Payments financial facts; independent Inbox/Outbox and specific FSM not yet finalized | Ownership policy accepted; executable saga FSM pending; OPEN | M00.4 | #6 / SER-123 |
| AUD-P1-03 | Relative post-proven-negative and absolute new-admission deadline (option D); no implicit capacity release | Policy accepted; durations and fencing/clock semantics pending; OPEN | M00.1 | #7 / SER-124 |
| AUD-P1-04 | Single scoped Stripe test-mode account first, hosted card/3DS and automatic capture, delayed methods OFF, no multi-merchant Connect in M04 | DESIGN PROPOSED; exact merchant charge model, Link suppression and capture proof pending; OPEN | M00.1/M04 | #8 / SER-125 |
| AUD-P1-05 | Mongo replica-set owner-local multidocument transactions (when multiple owned documents), majority durable commit, operation readback on ambiguous result | DESIGN PROPOSED; real failover and journal semantics pending; OPEN | M00.1 | #9 / SER-126 |
| AUD-P1-06 | For enabled multi-line Orders, prepare/atomically assign every unique license before any exposure; avoid routine partial delivery; incident if partial effect externally occurred | DESIGN PROPOSED; physical constraints and concurrency tests pending; OPEN | M00.2 | #10 / SER-127 |
| AUD-P2-01 | Define separately Session=Stripe hosted opportunity, Attempt=Payments commercial attempt, Payment=financial record, Refund=financial reversal, Order=obligation, CheckoutProcess=saga, Reservation=capacity | GLOSSARY PROPOSED; contract schema and semantics review pending; OPEN | M00.4 | #11 / SER-128 |
| AUD-P2-02 | No unconditional 35m payment promise; persist actual Stripe `expires_at`. Initial proposed two Session max only after proved-negative previous; validate effective provider range then ratify defaults | VALUES PROPOSED, NOT VERIFIED; 35m/two Session not silently accepted; OPEN | M00.1 | #12 / SER-129 |
| AUD-P2-03 | One immutable trace graph: original source + approval → ADR/guard → context contract → G3 task/test oracle → Linear/GitHub/branch/PR → actual evidence | GOVERNANCE PROPOSED; 110 source/oracle comparisons and executed evidence pending; OPEN | M00.4/M01 | #13 / SER-130 |

## Exact domain glossary (non-duplicated authority)

- **CommercialObligation:** *a concept*, not an extra aggregate; one Order's accepted economic obligation to supply or compensate.
- **Order:** Ordering's durable identity, accepted Quote snapshot, commercial decision and delivery obligation.
- **CheckoutProcess:** Ordering-owned durable operations, incorporated facts and saga repair; not a second ledger of provider events.
- **Payment:** Payments' authoritative record of a financial transfer/capture; captured and subsequently refunded are both preserved.
- **PaymentAttempt:** one commercial attempt to obtain a payment (may have one known or unknown provider Session); UNKNOWN blocks new collectible attempts unless independently closed.
- **Stripe Checkout Session:** hosted payment opportunity with provider statuses open/complete/expired and actual expires_at; completion is not always captured-funds proof.
- **Refund:** Payments' specific operation against original Charge/PaymentIntent; PENDING/UNKNOWN is not commercial compensation.
- **Reservation:** Inventory's capacity commitment/protection/terminality, independent of Stripe.
- **StockPool:** Inventory's source of authorized saleable capacity and conservation accounting; shared supply and quotas require atomicity.
- **DigitalLicense:** Fulfillment's individually assignable and potentially exposed secret; cannot be made saleable merely because a payment was refunded.
- **Commercial generation:** version/fence of buyer-authorized Order execution; never reopens released stock or erases an old possibly sent provider operation.
- **Read projection:** eventually consistent UI data, not authority to send Stripe API requests, reveal keys, release stock or initiate refunds.

## Selected trade-offs requiring genuine evidence

1. **Availability versus non-double-charge:** choose HOLD/INVESTIGATE over stock reuse when Stripe negative proof is impossible. This may mean indefinite reservation and human intervention; do not invent guaranteed automatic recovery.
2. **Owner-local Mongo transactions versus one-document aggregate:** choose transactions only within a bounded owner, and do not count them as Stripe/external HTTP atomicity.
3. **Test-mode single merchant versus Connect:** choose one explicit account for initial vertical only. Multi-store payment settlement/charge ownership remains a distinct architecture review for later CommerceCloud milestones.
4. **Two attempts versus one:** recommend a maximum two sequential attempts as a *candidate*, not proof, each requiring positively proven previous closure and the accepted D-06/AUD-P1-03 conditions. No unconditional 35-minute Session expiry promise.
5. **Fully atomic outside-world delivery:** reject as unachievable across independent network responses; prepare all credentials before reveal, record possible effects conservatively and investigate anomalous partial delivery.

## Audit closure rubric

An audit finding may be changed from OPEN to SPECIFIED/REVIEWED only when user formally approves **its exact full contract** and the dependency graph is updated. It may be changed to VERIFIED only after an executed provider/database/worker fault-injection test with actual observed authoritative state. Planned examples and documentation alone do not meet this. Accordingly, none of AUD-P0-01..04 are marked closed by this proposal.

The user can begin *separately approved independent M01 foundation work* without pretending the M04 financial proof gates have passed. For implementation of M04 financial external effects, G3 remains blocked.
