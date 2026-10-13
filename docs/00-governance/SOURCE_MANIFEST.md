# Source Artifact Manifest — 2026-10-13

**19 independent source artifacts have been identified and hash-registered.** The original sources were supplied by the user; files in this public repository are English reconstructions, not exact original language reproductions. Source status is *as of each document*. Later explicit user ratifications have precedence over earlier proposal headings.

| Source ID | Original filename (archive identity) | SHA-256 | Scope | Source class |
|---|---|---|---|---|
| R0.10-MASTER | CommerceCore_Decisiones_Maestro_R0.10(1).docx | ecccb7042c3ddd0a98325b17bda2d5787baba1c0f8b8943b4e265062907a4d00 | 181 original selections, ownership, DDD, P0/P1, M00-M09 roadmap | HISTORICAL_SELECTIONS |
| R0.10-CONSOLIDATION | Markdown pegado(1).md | a22ef829b7589f1324cbff5655ecb72cadbd9919ce4d0b56eba1bb773021413c | 32 candidate normalized architectural decisions and discovery synthesis | DISCOVERY_PROPOSAL |
| M00.1-R1 | Texto pegado (2)(20261013-170114).txt | 7636dc6d34487f5971b53d4d4b66ed8aa55e32939571cbc1689136cc4f8896c4 | Original M00.1-R1 candidate checkout architecture, domain and FSM | PROPOSED_SOURCE |
| D-01 | Texto pegado (3)(20261013-170123).txt | 9741c0240b672c2f2dfaee31a1760165e90f4fa29d012d7702e069a20d07c111 | Reservation versus Stripe collectible window alternatives, tests and candidate FSM | REVIEW_SOURCE |
| D-02 | Texto pegado (4)(20261013-170131).txt | b799e2fa564782a2f7853af7b3ff6e1a8a40d51e4ea7dc684edbfc1a44590368 | Session expiration policy alternatives and provider API constraints | REVIEW_SOURCE |
| D-03 | Texto pegado (5)(20261013-170142).txt | 8e950fc8a20f13db8841dd9612571f0440d8a061725472c2b71ef12da87c8dfa | Card, 3DS, wallet, Link and dynamic-method alternatives | REVIEW_SOURCE |
| D-04 | Texto pegado (6)(20261013-170152).txt | 92210efd7023951480cb5c15e870fedfc6295406cfe0cc764fbf7cecca61bced | Paid-but-unfulfillable commercial resolution and refund alternatives | REVIEW_SOURCE |
| D-05 | Texto pegado (7)(7).txt | f14b456c23bc0026bb03816bff5ac06a1e57544f5ac0b31526890ad78660edce | Pre-Kafka durability, Outbox/Inbox and experiments | REVIEW_SOURCE |
| D-06 | Texto pegado (8)(4).txt | 25feed52fd4595ef284dc7a5f0b15dd39a16edf34195b3338bf8591ab4fff8c5 | Commercial Attempt semantics, sequential Sessions and tests | REVIEW_SOURCE |
| D-07 | Texto pegado (9)(1).txt | 1c935cb09ecd741cbbecc582b8e186bad11e259ab0c9ef7b8bb3a25bb9546f83 | Authorized cancellation, early expiry and safe Inventory release | REVIEW_SOURCE |
| M00.1-GLOBAL-AUDIT | Texto pegado (10)(1).txt | 154c17af6d55c9fa67c5b817b1ab344ad912e20ff32cc5cd3a825ccab0a30554 | Four P0, six P1, three P2, contradictions and closure gate | AUDIT_SOURCE |
| AUD-P0-01 | Texto pegado (11)(1).txt | 821894b044748c57437dee5ac45e04817b41021f3d6e3b3900c99603a1a258e7 | Financial admission, cancellation and release exclusion | AUDIT_REVIEW |
| AUD-P0-01-DISPATCH | Texto pegado (12)(1).txt | ef416b35c7874d55e0fa51647d0b17d995acce68f947bde51b3d2cee53975e5f | Suspended workers, Stripe POST late dispatch, neutralization alternatives | AUDIT_REVIEW |
| AUD-P0-02 | Texto pegado (13).txt | 825dd27c5cba2feba58f927a398aca00efeaa36261317dbe321692b5feb976c1 | Session ID loss, idempotency key lifetime, metadata and positive proof | AUDIT_REVIEW |
| AUD-P0-03 | Texto pegado (14).txt | b2ed8c1808418f9d738aecc0f9302c04473a1454a3692a444039c5af98190696 | Order preexistence and financial obligation propagation | AUDIT_REVIEW |
| AUD-P0-04 | Texto pegado (15).txt | fc7132daabad6647d4a83a91806a1927d318a03b59f0fb60dcb6cd440a2088fc | Fulfillment vs refund effects already enabled or delivered | AUDIT_REVIEW |
| AUD-P1-01 | Texto pegado (16).txt | ef738f61785c4754dd81f24bb0f6e9bca14089a82169976e87a09469792a41c8 | Reservation capacity-only FSM vs R1 and StockPool invariants | AUDIT_REVIEW |
| AUD-P1-02 | Texto pegado (17).txt | ae79d0901d9579b3c7df41e6aab90a3d57b607345facabaafe6a27f55a837298 | Order/CheckoutProcess/Payment authority and durable coordination | AUDIT_REVIEW |
| AUD-P1-03 | Texto pegado (18).txt | 40e4d7c954dd3a6b9b3e31cc67f99cc17623affff4bd182b4a362befc92a18ad | Proposed double-window commercial retry policy, unratified | AUDIT_REVIEW |

## Preservation and gaps

- Preserve original Spanish files separately, byte-for-byte, in the original custody archive. English translations are editorial renderings, not 1:1 literal certified translations.
- The M00.1-R1 source is now available independently. Prior statements about R1 being unavailable are obsolete.
- Source proposals contain draft tests, reasoning and candidate FSMs; they do not prove the final ratified policy or successful execution.
- The user ratifications with extra conditions govern policy statuses. Source assistant reviews are never enough by themselves to promote ACCEPTED.
- Reuse source SHA-256 to identify the specific source version when performing a future strict original-to-R2 clause comparison.
