# M00-G3 — 110 source-table translations for review

**Status:** ENGLISH TECHNICAL TRANSLATION DRAFT. A recommended, editable initial translation of the original audit scenario/oracle meaning into test case titles and actual observable outcomes. Read alongside [the original 110-row Spanish/English side-by-side source crosswalk](M00_G3_ORIGINAL_SOURCE_ORACLE_CROSSWALK.md). These statements are not results of executing any test, not a rehash of original Library bytes and not human-certified equivalence. Existing test IDs, coverage, no-provider-proof and unratified AUD13 policy remain unchanged.

| Test ID | Proposed English scenario | Proposed observable acceptance oracle | Editorial status |
|---|---|---|---|
| AUD01-T01 | ProtectReservation races the initial reservation expiry | Exactly one transition wins; no Checkout Session is created after protection is lost. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD01-T02 | A stale AuthorizeAttempt arrives after the closing barrier | Reject it without creating an external Session. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD01-T03 | Cancellation races a new payment admission | No new collectible opportunity remains enabled after financial closure is sealed. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD01-T04 | Worker pauses after recording a possible external send | Do not authorize Inventory release solely because the worker lease expired. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD01-T05 | Stripe Session is created after cancellation was requested | Identify and reconcile the Session; never release Inventory prematurely. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD01-T06 | 3DS confirmation races Session expiration | Preserve the captured payment fact and commercial obligation if money was collected. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD01-T07 | Release authorization is replayed | Inventory applies the release exactly once. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD01-T08 | Release permit references wrong Reservation or versions | Inventory rejects it without changing capacity. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD01-T09 | Crash between financial close seal and Inventory release | Recover the release using the original durable operation identity. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD01-T10 | Two workers race using a stale financial command | Only one valid payment admission is recorded; no extra Sessions result. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD01-T11 | Stripe outcome stays unknown for hours | No successor attempt and no unsafe capacity release. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD01-T12 | Conceptually extract Payments into a separate service | Preserve all invariants without cross-context private writes. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD01-DT01 | Worker pauses before enabling external dispatch | The financial barrier prevents any later authorization. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD01-DT02 | Worker pauses after dispatch is enabled but before POST | Do not release Inventory while an old external send remains possible. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD01-DT03 | An expired lease is followed by resumption of the old worker | Lease expiry alone does not classify the external operation as neutralized. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD01-DT04 | Stripe receives POST but the response is lost | No second collectible attempt; retain the operation dossier and reconciliation. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD01-DT05 | Process terminates immediately after sending POST | Process termination is not accepted as proof of absent external effect. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD01-DT06 | Worker resumes a POST after 24 hours | Do not reuse an idempotency key unsafely after possible provider-side pruning. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD01-DT07 | Expired Session followed by late re-execution of the same POST | No Inventory release until additional external Session creation is ruled out. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD01-DT08 | Cancellation races authorization to make an external send | Only one admission branch wins, while prior enabled operations remain recorded. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD01-DT09 | Stripe unavailable with a prolonged unknown operation | Keep Inventory protected, retain the case and escalate to an operator. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD01-DT10 | Evaluate immutable absolute expiration for a late POST | Determine experimentally whether Stripe rejects late dispatch and under exactly which bounds. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD02-T01 | Create a Checkout Session and lose the response | Recover the same Session without creating a second collectible opportunity. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD02-T02 | Repeat a request while its idempotency key is retained | Verify the actual provider idempotency and parameter-matching behavior. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD02-T03 | Original request never executed; a retry would now execute it | Show that a replay may create the Session and the protocol prevents it after closure. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD02-T04 | Stripe returns a key-associated 500 response | Keep UNKNOWN when the response does not prove absence of an external effect. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD02-T05 | Session exists but PaymentIntent is absent or not yet referenced | Investigation must not depend exclusively on PaymentIntent search. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD02-T06 | Find a Session by time-bounded listing | Correlate exactly with operation identity, account, amount and currency. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD02-T07 | PaymentIntent search is delayed by provider propagation | An empty result never triggers Inventory release. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD02-T08 | Webhook arrives after an initially negative search | Recover the financial fact without regressing authoritative state. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD02-T09 | Two candidate Sessions share the same correlation fields | Investigate both without applying the commercial effect twice. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD02-T10 | Retry after the provider may have purged the idempotency key | Do not perform a potentially unsafe new POST. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD02-T11 | Known Session expired but an older worker can still POST | Do not release stock until the possibility of another send is resolved. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD02-T12 | Stripe is unavailable during reconciliation | Keep the operation dossier and protected capacity; record escalation. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD02-T13 | Provider search uses the wrong account or environment | Do not attribute external evidence to another Store or merchant. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD02-T14 | Cancellation races unknown Session creation | Recovery must not issue another Session creation. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD02-T15 | Crash after discovering Session ID but before persisting it | Recover original identity without a duplicate charge. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD02-T16 | Validate an absolute expires_at bound for external dispatch | Establish which late-dispatch delays Stripe rejects and which it accepts. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD03-T01 | Stripe confirms capture while Ordering is down | Payments retains the captured fact and pending durable work. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD03-T02 | Payments crashes after persisting capture but before notification | Recover and deliver the original financial notification without loss. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD03-T03 | Ordering incorporates payment but loses the acknowledgment | Retry does not duplicate commercial state transitions or effects. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD03-T04 | Duplicate webhooks for one PaymentIntent | Record exactly one authoritative financial fact. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD03-T05 | External provider events arrive out of order | No illegitimate regression of financial outcome. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD03-T06 | PaymentAttempt exists but the Order cannot be accessed | Retain potential financial exposure and retry correlation. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD03-T07 | A charge has no provable previously authorized Order | Raise an incident; do not invent an Order automatically. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD03-T08 | Order remains PENDING_PAYMENT despite Payments capture | Do not release stock or admit an incompatible charge. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD03-T09 | Captured payment arrives after a cancellation decision | Preserve the economic fact and start safe commercial resolution. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD03-T10 | Captured amount or currency differs from accepted Order snapshot | Do not mark Order paid automatically; retain and investigate operation. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD03-T11 | Crash while recording Order state and mandatory follow-on work | Preserve recoverable saga continuation. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD03-T12 | MongoDB times out during transaction commit | Reconcile durable commit result before repeating an incompatible operation. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD03-T13 | Two workers deliver PaymentConfirmed concurrently | Apply the commercial incorporation once. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD03-T14 | Charge from another Store or Stripe account targets this Order | Reject attribution and record the incident. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD03-T15 | Checkout completion without confirmed funds capture | Do not authorize fulfillment prematurely. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD03-T16 | Payments is extracted and interprocess messaging fails | Preserve ownership, idempotency and recovery without shared writes. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD04-T01 | Two workers compete to authorize fulfillment versus refund | Authorize only one compatible commercial resolution. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD04-T02 | Fulfillment delivers a license but its response is lost | Do not authorize non-delivery refund merely due to timeout. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD04-T03 | Stripe receives CreateRefund but the response is lost | Do not authorize incompatible delivery or a duplicate refund. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD04-T04 | Fulfillment worker pauses before exposing a license | Lease expiry alone does not neutralize its possible future disclosure. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD04-T05 | Stale delivery command arrives after branch-change attempt | No incompatible effect; if delivery remained enabled, the branch switch was not authorized. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD04-T06 | Refund is pending while capacity becomes available again | Keep incompatible delivery blocked. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD04-T07 | Confirmed refund webhook is delivered twice | Apply commercial compensation exactly once. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD04-T08 | Refund fails or remains unknown | Keep obligation open for repair; no automatic switch of resolution branch. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD04-T09 | Already exposed license is refunded as an alleged delivery failure | Escalate exceptional incident; no automatic D-04 non-delivery refund. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD04-T10 | Two-line Order has an unallocatable line before disclosure | Recover all lines or perform safe full compensation without exposure. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD04-T11 | An Order has already been partially delivered | Do not apply standard full compensation without reviewing performed delivery. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD04-T12 | Crash after choosing resolution, before sending its command | Resume original operation; never choose the opposite branch. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD04-T13 | Crash after arming an irreversible effect but before result | Preserve potential exposure until reconciliation. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD04-T14 | Operation belongs to another tenant, Store or Stripe account | Reject effects and record the security/financial incident. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD04-T15 | Two different messages refer to the same Refund | Apply exactly one financial fact. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD04-T16 | Conceptually extract Fulfillment and Payments | Preserve owner guards and idempotency without private cross-context writes. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD11-T01 | Two concurrent reservations compete for the last unit | Prevent overselling. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD11-T02 | Initial Reservation expiry races financial protection | Exactly one valid transition wins. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD11-T03 | Stripe Session remains active after 15 minutes | Do not release Reservation solely because initial TTL elapsed. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD11-T04 | Session expired but financial outcome is still unknown | Keep capacity protected. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD11-T05 | First Session is proven negative and a second attempt is eligible | Do not implicitly restart initial TTL or lose protection. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD11-T06 | Inventory release races a new collectible admission | No charge is created against released capacity. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD11-T07 | Payment confirmed but Inventory response is lost | Recover commitment idempotently. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD11-T08 | Stale worker tries to release committed Reservation | Reject with no capacity mutation. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD11-T09 | Attempt to reactivate a RELEASED Reservation | Reject; create a new commercial operation if allowed. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD11-T10 | Refund occurs after inventory commitment | Do not automatically return capacity to available stock. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD11-T11 | One line lacks stock in a multiline Order | Do not claim full reservation protection that never occurred. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD11-T12 | Crash during StockPool and Reservation update | No permanent divergence between authoritative capacity and reservations. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD12-T01 | Payment confirmed while Order is still pending | Deny successor charge and prevent Inventory release. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD12-T02 | CheckoutProcess receives the same event twice | Incorporate its commercial effect once. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD12-T03 | Different external events represent one captured charge | Credit one financial fact and one commercial incorporation. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD12-T04 | Ordering crashes after incorporation but before ACK | Recover idempotently without duplicating saga continuation. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD12-T05 | Refund requested and Stripe response lost | Order is not treated as already compensated. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD12-T06 | Refund confirmed after original capture | Preserve both captured and refunded historical facts. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD12-T07 | CANCELED_UNPAID contradicts a late captured charge | Explicit incident; never hide the payment. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD12-T08 | Stale CheckoutProcess requests another payment | Reject using Payments authoritative admission guards. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD12-T09 | Read projection is stale | Projection cannot authorize a commercial effect. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD12-T10 | Financial outcome changes after initial observation | Preserve historical evidence and prevent illegitimate regression. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD12-T11 | Event belongs to a different tenant or Store | Reject attribution and any effect. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD12-T12 | Payments moves to another process | Cross-context contracts and guards preserve invariants without shared writes. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD13-T01 | First Session closes negatively and buyer retries within relative window | Authorize only if every other admission guard is valid. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD13-T02 | Buyer requests a retry after relative deadline | Reject without another Session. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD13-T03 | Relative window remains open but global cutoff expired | Do not admit a new Session. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD13-T04 | Global cutoff expires while Session A is still open | Do not release Inventory. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD13-T05 | Retry races closure at the exact deadline | Only one valid admission outcome; no orphan collectible Session. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD13-T06 | Time window expires while Payments is unavailable | Closure stays pending and Inventory protected. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD13-T07 | Stripe confirms a charge after the commercial deadline | Preserve captured funds and the obligation. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD13-T08 | Unknown previous attempt outlives all deadlines | Do not release; reconcile and escalate. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD13-T09 | Second attempt is authorized while original Reservation protected | Do not restart TTL or allocate another Reservation implicitly. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD13-T10 | Original Reservation released but browser shows retry still available | Reject reusing released capacity. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD13-T11 | Payment policy changes during active checkout | Honor effective version and prior authorizations. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD13-T12 | Multiple checkouts reference the same commercial intent | Do not duplicate Reservations during idempotent retries. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD13-T13 | Buyer legitimately places another Order for same product | Do not block legitimate separate purchase without a reason. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD13-T14 | Deadline expires while Ordering to Payments communication pending | No contradictory closure or unsafe Inventory release. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD13-T15 | Worker restarts after recording window end but before sealing admission | Recover pending closure. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |
| AUD13-T16 | Reservation remains protected abnormally long | Create detectable, attributable and escalatable incident. | DRAFT_TRANSLATION_FOR_OWNER_REVIEW |

**Source of truth:** original Spanish scenario/oracle table per hash-registered Library source, current accepted policies at exact decision ID and final owner review. This file never upgrades `TEST_PLANNED/NOT_RUN` to `VERIFIED`.
