# Orthogonal decision, audit and evidence states

**Policy decisions:** ACCEPTED (explicitly ratified within its scope), PROPOSED — SELECTED (chosen candidate without final ratification), PENDING (undecided), DEFERRED (deliberate postponement), REJECTED (evaluated and not selected), SUPERSEDED (replaced by an explicit later decision without erasing history).

**Audit findings:** OPEN, OPEN / BLOCKING, or explicitly resolved following accepted closure criteria. A policy associated with a finding may be ACCEPTED while the finding is still OPEN/BLOCKING.

**Evidence:** NOT_EVALUATED, SPECIFIED, TEST_PLANNED, VERIFIED, FAILED or NOT_APPLICABLE. These form a separate axis. VERIFIED requires actual recorded experiments, provider/environment references where applicable, exact acceptance oracles and result evidence. A mocked provider response or proposed algorithm is never proof of actual Stripe behavior.

**Historical specificity:** 26 original ACCEPTED, 155 original PROPOSED — SELECTED, never bulk-upgraded. D-01-SM candidate is still not final. AUD-P1-02-FSM-MIN is PENDING. AUD-P1-03 double-window policy is NOT RATIFIED. D-05-MONGO, AUD-P0-01-DISPATCH-NEUTRALIZATION, AUD-P0-02-PROVIDER-PROOF and AUD-P0-04-QUIESCENCE remain unresolved.

**Nonstandard inherited display value:** The previous scoped register used PROPOSED — NOT RATIFIED for AUD-P1-03 sub-items. Preserve that string for compatibility and treat it as a non-accepted proposal description, not a new canonical governance status.
