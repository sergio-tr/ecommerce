# Wave 1 — Authoritative Baseline Assessment

**Artifact ID:** W1-BASE-001  
**Status:** WORKING DRAFT — FOR USER APPROVAL  
**Source snapshot:** \`feature/ser-131-architecture-knowledge-baseline-en\` at \`792e3001285d9e999898179973703fe8de7da993\`, inspected on 2026-10-21.  
**Accountable owner:** @sergio-tr.  
**Purpose:** factual coverage, conflict and evidence assessment without changing any historical or current decision status.

## 1. Source hierarchy and auditability

| Tier | Sources | Binding interpretation |
|---|---|---|
| S1 — explicit user ratifications | D-01–D-07 decisions; AUD-P0-01..04; AUD-P1-01..02; latest workflow/ownership rules | Authoritative for each expressly approved policy and stated reservation. Do **not** infer implementation approval. |
| S2 — historical accepted decisions | R0.1–R0.2 (26 individual records) | Preserve ACCEPTED status without silently enlarging scope. |
| S3 — historical selected proposals | R0.3–R0.10 (155 individual records), original M00.1-R1, proposed ARC catalog | Source of candidates and original rationale; PROPOSED — SELECTED is not an ACCEPTED design specification. |
| S4 — audits, counterexamples and assistant proposals | Global audit 4 P0 / 6 P1 / 3 P2; original 19-source manifest; proposed AUD-P1-03 | Findings are accepted as tracking targets. Suggested remedies require scoped approval. |
| S5 — implementation and experiment evidence | Reproducible test outputs, provider objects, commits, accepted run reports | No qualifying actual evidence is supplied for the 148 planned checkout/audit tests. |

The 19-source SHA-256 manifest is maintained in \`docs/00-governance/SOURCE_MANIFEST.md\`. These SHA-256 entries document source identity; **a hash does not prove clause-level translation or coverage**. The original user messages granting ratification are not all preserved as one exported, line-addressable source. English narrative files are reconstructions, not certified verbatim historical records.

## 2. Verified-on-repository inventory

| Check | Observed result | Interpretation |
|---|---|---|
| Historical decisions | 181 JSON rows: 26 ACCEPTED, 155 PROPOSED — SELECTED | Complete identifier inventory, not comprehensive contract maturity |
| Current scoped decision/audit register | 83 rows: 79 inherited scoped entries + 4 governance entries | Status fields present, not independently re-ratified by this assessment |
| Current register state histogram | ACCEPTED 26; PROPOSED — SELECTED 14; DEFERRED 1; PENDING 23; PENDING / BLOCKING 3; PROPOSED — NOT RATIFIED 3; OPEN / BLOCKING 4; OPEN 8; OPEN / NOT RATIFIED 1 | Count per heterogeneous decision/finding status; do not combine into a single approval-rate metric |
| Audit findings | AUD-P0-01..04 blocking; AUD-P1-01..06 open; AUD-P2-01..03 open | Four unresolved design closure gates |
| Planned tests | 148 TEST_PLANNED, zero evidence VERIFIED | This is a catalog of identifiers, not an executed suite |
| Test descriptions explicitly reconciled to original source tables | 38 of 148 | **110 still need source/oracle reconciliation**; do not assume their titles are verbatim |
| Original M00.1-R1 | Independent proposed source indexed, English overview present | A real source-based R1 comparison is possible; a full clause-by-clause ratification diff is not yet present |
| Issue tracking | GitHub #1–#13 ↔ Linear SER-118–SER-130, and baseline recovery #14 ↔ SER-131 | Reuse existing IDs; no implementation issue is created in Wave 1 |
| Existing English baseline | A reviewed source-derived working branch | The baseline branch is not yet merged to \`main\` and is not a final M00.1-R2 |

**Method limitation:** This assessment checks the current GitHub documents and structured records; the original file bytes and all original messages have not been retranslated line by line in this Wave 1 change. Therefore source fidelity and completeness are separate pending checks, not VERIFIED claims.

## 3. Ratified architectural constraints to preserve

1. CommerceCore is a reusable, headless commerce engine; CommerceCloud is a separate SaaS/Control Plane; eGame is the first digital-license consumer. Future standalone installation and a second independent consumer are validation objectives.
2. Trusted tenant/store boundaries govern every command, record, financial provider account, license assignment and buyer authorization.
3. Pricing creates exact-money accepted economic snapshots; Ordering persists the Order before enabling potentially collectible provider operations.
4. Inventory owns protected/committed/releasable capacity; availability cannot be released on timeout or presumed Stripe absence.
5. Payments exclusively owns admissions, Payment/Attempt/Refund and verified provider facts, including unknown or contradictory results.
6. CheckoutProcess coordinates durable saga work; a stale state or UI projection does not override Payments or Inventory authority.
7. Paid obligations must survive crashes and Ordering downtime through locally atomic financial records and recoverable propagation. Actual local Mongo physical guarantees remain unselected.
8. Fulfillment exclusively allocates/reveals DigitalLicenses, with unique allocation, secret protection and explicit treatment of potentially irreversible exposure.
9. Cancellation and incompatible fulfillment/refund resolution cannot bypass unresolved previously enabled external effects.
10. Outbox/Inbox and independent provider reconciliation are required before Kafka as a transport is added.
11. No cross-provider distributed transaction, globally exactly-once operation or test-mode proof is considered achieved simply because the protocol is described.
12. Public project artifacts must be English, changed on independent topic branches with Conventional Commits; @sergio-tr is the default accountable owner without external co-author credits.

These summarize **existing accepted directions**; do not infer that all physical algorithms, parameters, actors or infrastructure are accepted.

## 4. Contradictions, ambiguities and known gaps — DO NOT AUTO-RESOLVE

| Gap / contradiction | Evidence | Why it matters | Required follow-up |
|---|---|---|---|
| R1 Reservation extended FSM vs D-01-SM four-state candidate | M00.1-R1 vs AUD-P1-01 | Payment-settlement and release-review conditions could be accidentally discarded or duplicated | Finalize state/guard mapping and capacity ownership under AUD-P1-01 / M00.2 |
| R1 status formerly described as unavailable | Old handoff documents vs new 19-source manifest | A false “no diff possible” statement would lose a recoverable proposed specification | Produce formal R1 clause coverage matrix; keep R1 status PROPOSED |
| CheckoutProcess state naming overlaps Payment facts | R1 and AUD-P1-02 | A coordinator may become a second financial authority | Ratify concrete Checkout FSM and contracts; maintain AUD-P1-02-FSM-MIN PENDING |
| R0.5-02 trunk-based proposal vs later mandatory topic-branch workflow | Historical R0.5-02 and latest user instruction | Conflicting operational instructions in older documents | Apply new explicit governance; **preserve original row unchanged** and add a scoped supersession cross-reference |
| D-03 capture alias versus real policy ID | D-03-CAPTURE audit alias and AUD-P0-03-CAPTURE PENDING | Developers may treat \`requires_capture\` as funds captured | Normalize vocabulary and ratify capture evidence policy before M04 |
| D-03 payment methods and Connect fund-flow architecture | D-03 accepted card policy; D-08/Connect and D-04-CONNECT still PENDING | Stripe-account ownership and refunds can be incorrectly implemented | Ratify actual Connect charge architecture and store enforcement |
| Positive financial proof vs stale/external dispatcher | AUD-P0-01 and AUD-P0-02 | Local fencing cannot neutralize already-enabled Stripe POSTs | Keep both proof blockers open until a safe provider-aware resolution is defined |
| Unique license allocation and all-line disclosure | M00.2 and AUD-P0-04 | Capacity commitment is not key delivery; response loss can conceal exposure | Define allocation/exposure boundary and quiescence proof |
| 35-minute Session and two-attempt cap | D-02-P01, D-06-P01, AUD-P2-02 | Candidate defaults are incorrectly easy to present as validated policies | Explicit provider tests and commercial decision |
| AUD-P1-03 double-window proposal | AUD-P1-03 OPEN / NOT RATIFIED | Accidental automatic use would bypass the next user approval | Preserve as a proposal; request scoped ratification |
| Mongo consistency assumptions | D-05-MONGO PENDING, R0.6 local transaction candidates | “Durable” may remain a conceptual promise rather than a tested guarantee | Decide local atomicity, write concern, journaling, failover and unknown commit |
| 148 named tests vs 38 source-table matches | Structured test catalog | Names alone do not establish reproducibility or source fidelity | Reconcile remaining 110 and define independent observable oracles |
| 32 original ARC candidates vs 181 decisions vs current scoped ADRs | Discovery review and historical/active register | Distinct decision namespaces and overlaps may lead to duplication | Prepare ID crosswalk, preserve status and source, identify aliases rather than creating new canonical IDs |
| Milestone decomposition and M00.5 | English roadmap suggests M00.5 as design-readiness step | Could be mistaken for an historically ratified phase | Classify M00.5 as PROPOSED planning gate pending user approval |
| “Complete feature set” versus historical research ideas | R0.1–R0.10 contains product vision plus deferred technology experiments | Plan could convert ideas into unapproved MVP commitments | Ratify initial M04 feature boundary and distinct platform/administration requirements |
| Cloud and infrastructure alternatives | R0.8 historical tech selections | Design choices are not authorization to buy/deploy | Track provider/operation decisions in later milestones, not preapprove them |

## 5. Evidence quality classification

- **Recorded source fact:** an ID/status/source clause can be traced to a preserved source or structured register.
- **Ratified policy:** the user expressly approved the scoped behavior and conditions; independent implementation may still be PENDING.
- **Selected candidate:** an option was chosen for refinement without a final accepted specification.
- **Open question:** evidence, owner, parameter, contract, or implementation option is not settled.
- **Inference/new candidate:** useful planning decomposition not present as an accepted historical requirement. It must be labeled \`PROPOSED_SCOPE\` or \`PLANNING_ONLY\`.
- **Verified behavior:** requires actual run ID, inputs, environment, source version, observed state and result meeting a predeclared oracle. **None is claimed by this Wave 1 package.**

## 6. Required reconciliation work packages (not implementation tasks)

- \`W1-GAP-01\`: original R1 clause-to-policy mapping with retained/changed/discarded/unresolved classification.
- \`W1-GAP-02\`: original ratification condition check for D-01..07 and the P0/P1 follow-ups; mark any reconstructed wording uncertainty.
- \`W1-GAP-03\`: 181 historical/32 ARC/current 83-record identifier crosswalk without status mutation.
- \`W1-GAP-04\`: source fidelity and observable oracle verification of the remaining 110 tests.
- \`W1-GAP-05\`: functional-scope review distinguishing M04 mandatory, M04 candidate, post-M04 and explicitly deferred.
- \`W1-GAP-06\`: confirm milestone/epic taxonomy, source-of-truth policy and approval gate before planning any unapproved implementation.
- \`W1-GAP-07\`: merge/review path for the English baseline branch and this stacked Wave 1 planning change.

These W1-GAP IDs are **proposed planning identifiers only**, not new accepted ADRs or GitHub/Linear tickets.

## 7. Baseline completeness verdict

**Recoverable enough to plan the backlog, not mature enough to authorize M04 payment implementation.** The available material captures major product modules, historical selections and ratified safety directions, but does not provide complete ratification provenance at clause level, final context contracts, complete M04 functional scope or supplier/transactional proof. Every unresolved condition is carried forward rather than guessed.
