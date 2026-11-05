# PR #29 independent architecture review — 2026-11-05

**Reviewer role:** independent documentation review of [PR #29](https://github.com/sergio-tr/ecommerce/pull/29) against `main` `1c1550fc25374149ae8c8e58c2804b34cc7d5d27` and GitHub issues #1–#13. **Owner:** @sergio-tr. **Tracking:** GitHub #27. Linear SER-135 was **not re-read**; Linear access was declined for this review, so no Linear workflow state below is normative.

**This review does not complete the design gate, grant G4, authorize product code, merge the PR, or change any `TEST_PLANNED` / `NOT_RUN` result.** The four financial P0 audits stay `OPEN / BLOCKING`.

## What was checked

- Issue bodies and unchecked acceptance criteria for #1–#13 and #25.
- Decision register statuses for `D-01-SM`, `D-02-P01`, `D-03-CONFIG`, `D-03-LINK`, `D-05-MONGO`, `D-06-P01`, `AUD-P1-02-FSM-MIN`, and `AUD-P0` / `AUD-P1` / `AUD-P2` rows.
- M04 dispositions in `functional-inventory.json`, especially `CAP-INV-005`, `CAP-INV-006`, `CAP-FUL-004`, `CAP-PAY-010` and `CAP-PAY-012`.
- Accepted D-01 policy in `docs/02-decisions/D-01-full-adr.md` against the new Reservation transition table.
- The new Stripe, glossary, Mongo, Inventory, Ordering, R1 and 140-CAP documents on this branch.

## Material inconsistencies and the correction in this review

| ID | Source-backed inconsistency | Correction in this branch | What was not changed |
|---|---|---|---|
| REV-01 | `M00_G3_PLANNING_RECOMMENDATIONS.md` still said the exposed MVP is one line, after the PR had corrected two other documents. `CAP-INV-006` and `CAP-FUL-004` are `INCLUDED`. | The planning row now keeps both capabilities in final M04. One line is only an earlier development increment. | Inventory JSON dispositions were not edited. |
| REV-02 | Stripe and closure text said Connect is deferred, while `CAP-PAY-010` is `INCLUDED` with `missingDefinition` "Direct/destination/other selection" and approval `PLANNING_DRAFT_NOT_RATIFIED`. `CAP-PAY-012` wallets are `EXCLUDED`. | First-increment text may omit Connect fund routing, but it no longer deletes `CAP-PAY-010`. Wallets stay excluded. | No Connect account model was selected. |
| REV-03 | `CAP-INV-005` is `EXCLUDED`, but the Reservation contract required store quotas and shared same-tenant pools in the included equation. | Quotas are labeled an excluded seam. Included conservation remains `S = A + H + C + D`. | `CAP-INV-005` was not reclassified as included. |
| REV-04 | `ProtectForPayment` told Inventory to verify a financial possible-send admission. Accepted D-01 point 2 requires Inventory to protect capacity **before** Payments enables a collectible operation. | Inventory protects on its own versioned guard and does not judge Stripe admission. Commit consumes an Ordering permit and does not call Stripe. | `D-01-SM` stays `PROPOSED — SELECTED`. The state name `PAYMENT_PROTECTED` is still unratified. |
| REV-05 | Glossary and Ordering text asserted Linear "In Review" for SER-128 and SER-123. | Those sentences now say GitHub issues remain OPEN and Linear was not re-read. | No Linear issue was edited. |
| REV-06 | Stripe HTTP 400 and API version `2026-09-30.endive` were written as current provider fact. A support-page fetch on this review confirmed only the article title. | The contract marks those statements `UNVERIFIED_PROVIDER_BEHAVIOR`. The project API version is `UNSELECTED`. | No Stripe request was sent. `D-02-P01` and `D-06-P01` stay `PROPOSED — SELECTED`. `D-03-CONFIG` and `D-03-LINK` stay `PENDING`. |
| REV-07 | The R1 crosswalk cites line numbers of a Spanish source file that is not in Git, and several headings sound like executed Stripe verification. | The crosswalk now says the locators cannot be rechecked from this repository and that those headings are not provider proof. | The 90-row table was not rewritten into sentence-level dispositions. |
| REV-08 | GitHub issue #10's design comment still says to expose one-line checkout for initial M04. Issue comments on #5–#9 say `P0: OPEN/BLOCKING` for P1 findings. | Recorded here only. Issue bodies were not edited, because an issue edit is not a PR review and could be mistaken for closure. | Decision-register statuses were not edited. P1 findings stay `OPEN`, not `OPEN / BLOCKING`. |

Historical banners that still say PR #28 is an unmerged draft are retained as earlier snapshots. The later banner on this branch records that PR #28 merged at `1c1550fc25374149ae8c8e58c2804b34cc7d5d27`.

## Closure eligibility

Labels:

- **DOC:** whether the issue's own documentary acceptance checklist is satisfied.
- **OWNER:** whether the specific owner approval the checklist requires is present.
- **RUNTIME:** whether actual execution evidence is still required before closure.
- A document's existence never satisfies a checkbox by itself.

| Issue | Audit | DOC | OWNER | RUNTIME | Eligible to close now |
|---|---|---|---|---|---|
| [#1](https://github.com/sergio-tr/ecommerce/issues/1) | AUD-P0-01 | NOT_SATISFIED. Versioned close, neutralization versus reconciliation, and release without a distributed transaction are recommendations. The checklist is unchecked and no superseding ADR is accepted. | MISSING | REQUIRED. Suspended-worker and provider tests. AUD01-* stay `TEST_PLANNED` / `NOT_RUN`. | No. Remains `OPEN / BLOCKING`. |
| [#2](https://github.com/sergio-tr/ecommerce/issues/2) | AUD-P0-02 | NOT_SATISFIED. Correlation and "negative search is not absence" are drafted, not accepted as the ADR. | MISSING | REQUIRED. Unknown Session recovery in the target account and API version. | No. Remains `OPEN / BLOCKING`. |
| [#3](https://github.com/sergio-tr/ecommerce/issues/3) | AUD-P0-03 | NOT_SATISFIED. Order-before-capture and separate Payments/Ordering transactions are drafted. Capture semantics are not an accepted protocol. | MISSING | REQUIRED. Crash, Inbox/Outbox and captured-funds evidence. | No. Remains `OPEN / BLOCKING`. |
| [#4](https://github.com/sergio-tr/ecommerce/issues/4) | AUD-P0-04 | NOT_SATISFIED. Possible disclosure and refund exclusion are drafted. Quiescence is not proven and the ADR is not accepted. | MISSING | REQUIRED. Paused-worker disclosure and refund races. | No. Remains `OPEN / BLOCKING`. |
| [#5](https://github.com/sergio-tr/ecommerce/issues/5) | AUD-P1-01 | PARTIAL. Invariants, alternatives and guards exist in the Reservation contract, including the D-01 correction above. The checklist still requires an express ratification and a register update. | MISSING. `D-01-SM` remains `PROPOSED — SELECTED`. | REQUIRED for owner-local atomicity and last-unit races. | No. Remains `OPEN`. Not `OPEN / BLOCKING`. |
| [#6](https://github.com/sergio-tr/ecommerce/issues/6) | AUD-P1-02 | PARTIAL. Owner split and local commands are drafted. `AUD-P1-02-FSM-MIN` is still `PENDING`, so the exact transition checklist is not satisfied. | MISSING | REQUIRED for concurrency and recovery tests AUD12-*. | No. Remains `OPEN`. |
| [#7](https://github.com/sergio-tr/ecommerce/issues/7) | AUD-P1-03 | PARTIAL. Option D policy is recorded as accepted. Numerical windows, dispatch fencing and successor rules are not. | PARTIAL. Policy only. Protocol approval missing. | REQUIRED. Window expiry must not be treated as proof of no charge. | No. Remains `OPEN`. |
| [#8](https://github.com/sergio-tr/ecommerce/issues/8) | AUD-P1-04 | NOT_SATISFIED. The method contract is a candidate. API version is UNSELECTED. `D-03-CONFIG` and `D-03-LINK` are `PENDING`. `CAP-PAY-010` is still unresolved. | MISSING | REQUIRED. Test-mode method, capture, Link and wallet observations. | No. Remains `OPEN`. |
| [#9](https://github.com/sergio-tr/ecommerce/issues/9) | AUD-P1-05 | PARTIAL. The Mongo candidate names snapshot, majority, unknown commit and owner boundaries. `D-05-MONGO` is still `PENDING`, so the register was not updated. | MISSING | REQUIRED. Driver crash and readback. A one-member replica set is not that proof. | No. Remains `OPEN`. |
| [#10](https://github.com/sergio-tr/ecommerce/issues/10) | AUD-P1-06 | PARTIAL. All-or-nothing reserve and prepare-before-reveal are drafted, and the one-line conflict with `CAP-INV-006` / `CAP-FUL-004` is corrected in Git. The issue comment is still stale, and the register is unchanged. | MISSING | REQUIRED. Multi-line shortage, duplicate key and partial-disclosure races. | No. Remains `OPEN`. |
| [#11](https://github.com/sergio-tr/ecommerce/issues/11) | AUD-P2-01 | PARTIAL. The glossary proposes one owner per term. Static cases VOC-01..08 are specified, not run, and the exact decision is not recorded. | MISSING | Static conformance is required before documentary closure. Provider runtime is not a substitute for that review. | No. Remains `OPEN`. |
| [#12](https://github.com/sergio-tr/ecommerce/issues/12) | AUD-P2-02 | NOT_SATISFIED. 35 minutes and two Sessions stay unratified candidates. No `expires_at` was observed. | MISSING | REQUIRED. Test-mode Session expiry and stale POST. | No. Remains `OPEN`. |
| [#13](https://github.com/sergio-tr/ecommerce/issues/13) | AUD-P2-03 | NOT_SATISFIED. 140/402 ID resolution and a 90-heading crosswalk are progress. Clause-level fidelity, owner semantic review of 110 oracles, and evidence links are open. | MISSING | The 148 executions stay `NOT_RUN`. ID integrity is not that evidence. | No. Remains `OPEN`. |
| [#27](https://github.com/sergio-tr/ecommerce/issues/27) | M00-G3 gate | NOT_SATISFIED. Draft contracts exist for all 13 audits. Exact acceptance, deferrals, and the human decision to lift or keep the design-first hold do not. | MISSING | Not a substitute for P0 proof, and not itself G5. | No. Do not close. |
| [#25](https://github.com/sergio-tr/ecommerce/issues/25) | M01-BOOTSTRAP-01 | Out of the 13 audits. DR10 remains NOT_AUTHORIZED. | MISSING G4 | AC01–AC14 not run. | No code. |

GitHub #14 and #24 are already closed as documentary tasks. This review does not reopen them and does not treat their closure as audit closure.

## Remaining blockers

1. Owner acceptance, or an explicit deferral, of each exact contract above. Merge of this PR is not that acceptance.
2. `D-01-SM`, `AUD-P1-02-FSM-MIN`, `D-05-MONGO`, `D-03-CONFIG`, `D-03-LINK`, `D-02-P01` and `D-06-P01` stay at their current register statuses.
3. P0 #1–#4 stay `OPEN / BLOCKING` until the original provider, worker and disclosure evidence exists.
4. `CAP-INV-006`, `CAP-FUL-004` and `CAP-PAY-010` stay INCLUDED and unimplemented. `CAP-INV-005` stays EXCLUDED. `CAP-PAY-012` stays EXCLUDED.
5. Stripe API version is UNSELECTED. Cited parameter behavior is unverified.
6. R1 line locators and 140 capability links are not clause-level source approval.
7. The 148 catalog rows stay `TEST_PLANNED` / `NOT_RUN`.
8. M01 G4 is not granted. The design-first hold on #27 remains in force.
9. Stale GitHub issue comments listed in REV-08 still need a human edit if the owner wants the issue text to match Git.

**No product implementation, Nx workspace, payment, secret, deployment, G4 grant or merge is authorized by this file.**
