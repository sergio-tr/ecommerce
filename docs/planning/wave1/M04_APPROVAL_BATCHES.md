# Wave 1 — M04 Scope Approval Batches

**Status: ALL BATCHES PENDING INDIVIDUAL USER DECISIONS.** These alternatives are planning-level choices only. No CAP currently marked UNRESOLVED is auto-upgraded in the master inventory, and no implementation/architecture protocol is approved by selecting a batch.

## W1-SCOPE-B01 — Catalog and accepted price baseline

- **Sequence/priority:** 1 / P0 / M04 contract boundary.
- **Capabilities:** CAP-CAT-003, CAP-CAT-004, CAP-CAT-005, CAP-CAT-006, CAP-CAT-008, CAP-MER-003, CAP-PRC-004.
- **Bounded contexts:** Catalog, Merchandising, Pricing, CommerceCloud.
- **Recommended option A:** Select one Store-local Product/Variant + one published Listing/Offer + immutable Quote; postpone shared master propagation, dynamic schemas, inheritance, multi-channel targeting and media/i18n; choose a separately explicit demo tax policy.
- **Alternatives:** A — constrained initial Store catalog with a truthful demo-tax contract (recommended); B — fully implement multi-store master/local inheritance and extensible attributes; C — manually fixed price/stock without explicit catalog/Offer/Quote (reject: violates CommerceCore domain identity).
- **Trade-offs:** A preserves ratified one-store sale with smaller surface; B improves early framework breadth but raises Catalog/Cloud requirements; C creates an eGame-only shortcut and must not be accepted.
- **Genuine first-sale blockers:** Tax treatment and truthful total is a G3 input, but media/master overrides are not first-sale blockers.
- **Ratification exit:** Approve each of seven dispositions, select valid demo tax/quote contract with no live-tax claim; direct R0.2-07/R0.3-03/R0.3-08 references noted.
- **Original references:** R0.2-03, R0.2-07, R0.3-03, R0.3-04/05/06/08
- **Approval state:** PENDING, including every child scope question.

## W1-SCOPE-B02 — Actor security and CommerceCloud boundary

- **Sequence/priority:** 2 / P0 / M00.3.
- **Capabilities:** CAP-SEC-001, CAP-SEC-002, CAP-SEC-003, CAP-SEC-011, CAP-CLOUD-001, CAP-CLOUD-004, CAP-CLOUD-008.
- **Bounded contexts:** Identity, CommerceCloud, Ordering, Fulfillment.
- **Recommended option A:** Approve trusted Store/buyer/operator authorization, guest/session protection and a controlled initial Store configuration. Separately decide whether complete Keycloak realms, OIDC BFF, admin MFA or independently running Cloud storage are necessary in initial testmode.
- **Alternatives:** A — smallest explicit actor/session/Control Plane port satisfying every security invariant, with physical infrastructure decisions flagged (recommended); B — full multi-tenant self-service and realm provisioning in first vertical; C — no auth/security because testmode (reject).
- **Trade-offs:** A retains authorization and avoids premature Cloud provisioning; B brings full platform lifecycle forward; C exposes key/refund/tenant failures.
- **Genuine first-sale blockers:** Guest claim/cancellation/key access authorization and privileged operator session MUST be decided before M04; provisioning UI need not.
- **Ratification exit:** Ratify role-action matrix, operator MFA/session approach and CommerceCloud-to-Core authority boundary without forcing Cloud private DB writes.
- **Original references:** R0.7-01/03/06/09/10, R0.1-01, R0.2-01, R0.4-02
- **Approval state:** PENDING, including every child scope question.

## W1-SCOPE-B03 — Buyer status, operational evidence and administration

- **Sequence/priority:** 3 / P0/P1 / M04 recovery.
- **Capabilities:** CAP-ORD-009, CAP-INV-007, CAP-EGAME-007, CAP-EGAME-009, CAP-ADMIN-001, CAP-ADMIN-002, CAP-ADMIN-007, CAP-ADMIN-008.
- **Bounded contexts:** Ordering, Inventory, Fulfillment, eGame, Administration, Security.
- **Recommended option A:** Require durable financial history, current-order buyer status and auditable privileged recovery, while avoiding full admin consoles and broad stock editing; define minimum accessibility acceptance.
- **Alternatives:** A — mandatory domain evidence and minimal privileged commands with narrowly scoped UI (recommended); B — full catalog/tenant/admin dashboards and history screens; C — entirely no operator/audit capability (reject).
- **Trade-offs:** A keeps safe reconciliation and exposure history; B increases UI footprint; C violates unknown-payment and refund accountability.
- **Genuine first-sale blockers:** Authoritative history, guest-buyer status, safe incident controls and accessible core actions block completion; UI breadth does not.
- **Ratification exit:** Ratify the eight CAP dispositions and composite separation; link authority, audit integrity, accessibility and security test oracles.
- **Original references:** D-04, D-05, AUD-P0-03/04, R0.7-08/19, R0.2-09
- **Approval state:** PENDING, including every child scope question.

## W1-SCOPE-B04 — Optional purchase notifications

- **Sequence/priority:** 4 / P2 / following initial M04.
- **Capabilities:** CAP-NOTIF-001, CAP-NOTIF-002, CAP-NOTIF-003.
- **Bounded contexts:** Notifications, Ordering, Fulfillment, Identity.
- **Recommended option A:** Permit authenticated/claimed order status and key access without an email channel; avoid revealing keys in messages; plan messaging later.
- **Alternatives:** A — defer all optional email/provider/template delivery until a separately approved milestone (recommended); B — include safe notice-only emails in M04; C — send license keys in email (reject).
- **Trade-offs:** A simplifies initial delivery while maintaining an active buyer status channel; B needs durable messaging and no-key privacy validation; C breaches license confidentiality policy.
- **Genuine first-sale blockers:** No optional email feature blocks the first testmode sale, but secure on-site access must exist.
- **Ratification exit:** User decides notifications' release timing without altering D-05 mandatory financial Outbox.
- **Original references:** R0.3-23, R0.4-03
- **Approval state:** PENDING, including every child scope question.

## W1-SCOPE-B05 — Engineering governance and release constraints

- **Sequence/priority:** 5 / P1 / M01 plus M04 operational quality.
- **Capabilities:** CAP-ENG-015, CAP-DIST-007, CAP-DIST-008, CAP-OPS-003.
- **Bounded contexts:** Engineering, Framework Distribution, SRE, Governance.
- **Recommended option A:** Keep spending authorization and internal contract compatibility as early design foundations; separately decide public open-source license and initial recovery/alert acceptance targets.
- **Alternatives:** A — early governance controls and testmode recovery objectives; defer full SDK/SRE rollout (recommended); B — full public framework release and production SLOs before eGame; C — omit version/cost/observability controls (reject).
- **Trade-offs:** A prevents accidental spending, source drift and uninvestigable operations; B slows initial learning; C contradicts accepted governance and commercial recovery.
- **Genuine first-sale blockers:** Basic safe operational observability and contract versions block M04 acceptance; exact public license blocks distribution rather than the test purchase.
- **Ratification exit:** Approve four dispositions, choose public license before publication and explicit initial recovery objective or retain a named blocker.
- **Original references:** R0.1-08, R0.8-19, R0.10-13, R0.4-15, R0.9-10
- **Approval state:** PENDING, including every child scope question.

## W1-SCOPE-B06 — Stripe wallet/Link composite (outside the 29)

- **Sequence/priority:** 6 / P1 / before provider config in M04.
- **Capabilities:** CAP-PAY-012 (not part of 29).
- **Bounded contexts:** Payments, CommerceCloud.
- **Recommended option A:** Keep wallets deferred and Stripe Link PENDING until the actual provider configuration explicitly enforces accepted initial card/3DS instruments.
- **Alternatives:** A — confirm card/3DS-only provider methods in testmode, Link remains disabled until ratified (recommended); B — ratify effective Link conditions separately; C — rely on Stripe default dynamic methods without review (reject).
- **Trade-offs:** A respects D-03 while maintaining a complete hosted checkout; B may widen provider scope and tests; C risks unauthorized payment methods.
- **Genuine first-sale blockers:** Actual method enforcement D-03-CONFIG is a M04 design requirement even if Link excluded.
- **Ratification exit:** Do not alter D-03-WALLET DEFERRED or D-03-LINK PENDING without explicit provider-side evidence and user decision.
- **Original references:** D-03-WALLET, D-03-LINK, D-03-CONFIG
- **Approval state:** PENDING, including every child scope question.

## Approval mechanism

A batch-level YES accepts only its expressly itemized functional dispositions and caveats; any standalone technical subdecision (tax evidence, guest session, admin MFA, effective Stripe methods, SLO value) remains PENDING unless explicitly selected in the same ratification. When a composite item is involved, quote the individual component, not a blanket parent approval.

**First proposed batch for review:** W1-SCOPE-B01. The actionable selection includes (i) constrained Store-local Product/Variant with Listing/Offer and immutable Quote, (ii) deferral of master sync, dynamic attributes/inheritance, multi-channel and rich assets, and (iii) separately selecting either a demonstration tax port/adaptor (historical R0.3-08) or a precisely disclosed synthetic tax fixture. Neither value nor implementation is presumed.

**Next original architectural audit:** AUD-P1-03 remains the first individually unratified historical audit. Scope review and that audit must not be conflated, and financial P0s remain OPEN/BLOCKING.
