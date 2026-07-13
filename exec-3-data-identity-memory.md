# Execution Doc 3 - Data, Identity, Memory & Retention Architecture (v3)
### Companion to the Story + Companion Hybrid proposal (v4.1 final memo)

**Status:** approved as the architecture direction (v3 - incorporates two Codex review passes).
**Purpose:** pin the data architecture the build leans on earliest - data-class segregation, identity/age tokenization, the double-entry credit ledger, the character + per-reader memory model, the memory threat model, key management, and retention/deletion semantics.
**Encoding:** ASCII-only.

**What changed in v3 (Codex's second pass):** resolved the **compaction-vs-deletion** contradiction (the lineage invariant applies to user/legal deletion, not routine compaction); clarified **key granularity** (row/vector deletion for granular, crypto-shred for full thread/account/backup); classed **embeddings as sensitive**; made **character defs personal-data-aware** for the marketplace; added **vendor-side deletion**, **hardened tamper-evident audit logs**, **export scope**, **immutable consent/version records**, and **memory decay mechanics**.
**(v2 added:** key management, retention tiers, memory review/edit UX, strengthened never-store list, backup deletion, abuse-log minimization, creator k-anonymity, extraction safety gate, split jurisdiction, audit tables.**)**

---

## 1. Design principles
- **Segregate by data class.** PII, identity tokens, payment tokens, chat/memory, abuse/security/legal logs, and creator metadata live in separate stores/schemas with distinct access roles, **separate encryption-key hierarchies**, and retention. A breach or a deletion in one class must not cascade into another.
- **Minimize + tokenize.** Store the least data needed. Never store government IDs or raw card data - hold only vendor tokens.
- **Per-reader privacy.** Character definitions are shared/read-only; the relationship/memory state is private per (character x reader). Creators never see reader memory.
- **Raw chat is transient; memory is durable.** Keep raw intimate logs only briefly; persist the distilled, user-visible memory. (Section 8.1.)
- **Deletion is real, bounded only by legal duty.** User-facing deletion removes personalization; a separate, minimal abuse/legal log may be retained under a documented policy.
- **Recommended stores (not locked):** PostgreSQL core + pgvector (memory), Redis (cache/counters), S3-compatible adult-friendly object storage (media), self-hosted analytics. Logical separation can be schemas now, separate instances later.

## 2. Data-class segregation map
| Class | Contents | Store | Access role | Retention | User-deletion behavior |
|---|---|---|---|---|---|
| Identity/age | verification token, status, jurisdictions, timestamps | isolated schema/instance | auth service only | [SET] + re-verify cadence | revoke token |
| Payment | Segpay customer/subscription token | isolated; Segpay vault holds rest | billing only | per acquirer terms | detach token |
| Account/core | user, creator, settings, consents | Postgres core | app services | account lifetime | delete on closure |
| Character defs | shared character objects (versioned) | Postgres core | app; public read of published | retained (shared content) | shared content; unpublish/anonymize per creator terms + law |
| Chat/memory | raw messages, summaries, embeddings | Postgres + pgvector (encrypted) | chat service, owner-scoped | tiered (Section 8.1) | purged on forget/deletion |
| Credit ledger | accounts, transactions, entries | Postgres core (append-only) | billing/ledger service | financial-record [SET] | pseudonymize, not delete |
| Abuse/security/legal | evidence refs, classifier outputs, NCMEC refs, audit | isolated append-only, restricted | T&S named team only | legal-hold [SET] | RETAINED |
| Analytics | content-free events | self-hosted analytics | analytics/product | [SET] | drop user linkage |

**Notes:**
- **Abuse/legal log minimization:** this store is NOT a shadow copy of chat. Store only minimal evidence - refs, content **hashes**, classifier outputs, timestamps, account ids, and **quarantined excerpts only when necessary** for a specific case.
- **Analytics deletion:** events are content-free; account deletion drops the pseudonymous user linkage while **aggregate, non-personal metrics may remain.**

## 3. Identity & age-verification architecture
- Verification runs through the AV vendor (e.g., Persona/Yoti/Veriff). **We store only:** a `verification_token`, `status`, `method`, `verified_jurisdiction`, `verified_at`, `expires_at`. **We do NOT store** ID images, document numbers, or biometrics.
- **Store `verified_jurisdiction` and `current_access_jurisdiction` separately** - a user may verify in one place and later access from another; geo-blocking and legal behavior key on **current access**, not just where they verified.
- Re-verification cadence and step-up triggers [SET] (new jurisdiction, risk signals).
- Creators verify on the same flow (must be 18+); no extra financial KYC while rewards are credit-only.
- **Vendor-side deletion:** on account/data deletion we detach local tokens **and request vendor-side deletion** at the AV/payment vendor where legally/contractually available (per the vendor DPA). Document each vendor's deletion path.

## 4. Credit ledger (double-entry, authoritative)
Balances are **derived from immutable entries**, never mutated in place.

**Tables (sketch):**
- `ledger_account(id, owner_type[user|creator|platform|promo|reserve], owner_id, created_at)`
- `ledger_transaction(id, type[purchase|drip|spend|reward|clawback|expiry|refund|adjustment], idempotency_key UNIQUE, actor, created_at, metadata jsonb)`
- `ledger_entry(id, txn_id, account_id, credit_class[purchased|earned], amount_signed bigint, created_at)`

**Rules:**
- Every transaction writes **balanced entries summing to zero** (double-entry).
- **Balance** = sum(amount_signed) per (account, credit_class), via a materialized rollup.
- **Idempotency:** Segpay/webhook handlers key on `idempotency_key`; duplicate deliveries are no-ops.
- **Credit classes:** spends from `earned/dripped` credits generate **no** creator reward; only `purchased`-credit spends accrue the +1.
- **Reward lifecycle:** held -> cleared after settlement -> clawed back (reverse entries) on refund/chargeback; capped per unique paying reader/day; never on self-spend.
- **Expiry:** earned credits expire after [SET]; expiry posts an auditable `expiry` transaction.
- **Reconciliation:** periodic job reconciles ledger vs. Segpay settlement; discrepancies alert; breakage reported for accounting.

## 5. Character data model
- `character(id, creator_id, version, status[draft|in_review|published|disabled], definition jsonb, created_at, updated_at)`
- `definition` = personality, look, backstory, voice text, content tags. **Versioned and immutable per version** (a reader's history references the version they interacted with).
- Marketplace-ready now even though first-party only in Phase 0: same schema, `creator_id` = platform.
- **Personal-data note:** in Phase 0, first-party defs are not personal data, but **marketplace creator definitions may carry creator-authored personal info, likeness claims, or IP** - so published defs are governed by creator terms + law (unpublish/anonymization/DMCA), not treated as inert content.

## 6. Memory architecture (per character x reader)
**Tables (sketch):**
- `thread(id, user_id, character_id, character_version, created_at, last_active_at)`
- `message(id, thread_id, role[user|character], content_encrypted, token_count, created_at)`
- `memory_summary(id, thread_id, summary_encrypted, version, token_count, updated_at)`
- `memory_item(id, thread_id, embedding vector, item_type[fact|preference|event], text_encrypted, salience, confidence, source_message_id, created_at)`

**Retrieval flow per turn:**
1. Load rolling `memory_summary` + recent raw `message` window.
2. Vector-search `memory_item` within the thread for top-k by similarity x salience x confidence.
3. Assemble context: stable prefix (character def + summary) is **prompt-cached**; only the dynamic tail varies -> bounds per-turn cost.
4. After the turn, extract new candidate memories and update the summary on a rolling schedule.

**Extraction safety gate:** memory extraction is a **write path that must pass a classifier/policy layer before storage** - never rely on prompt instructions alone. Candidates hitting the never-store list (Section 7) are dropped at extraction, not stored-then-filtered.

**Standard vs. enhanced memory** (Phase 0 H4 lever): standard = summary + small-k; enhanced = larger-k + richer extraction. Test enhanced-vs-standard, not memory-vs-none.

**Cost bounding:** rolling summarization caps context growth; prompt caching the stable prefix; the daily credit drip caps per-user volume.

**Embeddings are sensitive personal data:** vectors can leak information and are hard to encrypt while remaining searchable. Treat them as **owner-scoped, access-controlled, deleted with their source memory, and NEVER exported to third-party analytics.** They live only in the owner-scoped chat/memory store.

**Memory decay mechanics (operational):** a scheduled job applies **salience decay** to aging items and **downgrades confidence** on items not reinforced by recent interaction; low-salience/low-confidence items are **ignored at retrieval** first, and **hard-deleted after [SET]** (decay-to-delete threshold). Decayed-but-not-deleted items remain user-visible/correctable until deletion.

## 7. Memory threat model
| Threat | Risk | Mitigation |
|---|---|---|
| Memory poisoning | false "facts" planted to steer behavior or bypass safety | provenance tracking; never trust in-chat assertions for safety-relevant fields; confidence scoring; safety re-checked at generation, not from memory |
| Hallucinated memories | model invents past events | store only extracted + validated memories; mark confidence; expose to user for correction |
| Unsafe inferred preferences | inferring sensitive/protected attributes | never-store list; do not infer real identity, age, health, protected attributes |
| Creator access breach | creator sees a reader's private memory | hard isolation: creators get zero thread/memory read access; only aggregate anonymized stats (k-anonymity below) |
| No user correction path | wrong memory persists | review/edit/delete UX (Section 8.2) |
| Over-confident retrieval | low-quality memory dominates | weight by confidence x salience; decay stale items |
| Cross-thread contamination | memory leaks across characters/readers | strict scoping by `thread_id`; no cross-thread retrieval |

**Never-store categories** (dropped at extraction): government IDs / document data; payment/financial-account details; credentials/secrets; precise location; contact info (phone/email/address); employment/school identifiers; biometric data; medical/mental-health details; anything identifying a real private person; real-person sexual allegations; any content suggesting a minor; inferred protected attributes.

**Creator-analytics k-anonymity:** creators see only aggregate, anonymized stats, and **no metric is shown unless at least k unique users contributed** ([SET] k) - prevents re-identification.

## 8. Retention, deletion & user control

### 8.1 Retention tiers (raw chat is NOT kept forever)
Principle: short raw-message retention + durable user-visible memory + user-controlled deletion. Do not turn the DB into a permanent archive of users' most sensitive conversations.
- **Recent raw messages:** retained for UX/context (recent window).
- **Older raw messages:** summarized into the rolling summary + memory items, then **deleted after [SET]** (this is *retention compaction* - see 8.4; the derived memory legitimately remains).
- **Memory summaries / items:** durable; retained until the user forgets them, they decay, or the account is deleted.

### 8.2 Memory review/edit UX (requirement, not optional)
Users can **view** stored memory items, **delete** individual items, and **correct** wrong ones. "Forget this" purges selected `memory_item`(s) and/or a `thread`, cascades to embeddings, and regenerates the affected summary. Live from day one.

### 8.3 Deletion semantics
- **Account deletion:** purge personalization (raw messages, summaries, embeddings, memory items); detach identity/payment tokens; destroy data keys (8.5). **Retain** only minimal abuse/security/legal records (pseudonymized where possible) under documented retention + legal hold - deletion must not erase evidence of a violation.
- **Ledger:** financial records not deleted; owner pseudonymized; entries retained per [SET].
- **Analytics:** account deletion drops user linkage; aggregate non-personal metrics may remain.

### 8.4 Deletion vs. compaction (two distinct cases - do not conflate)
- **Retention compaction (routine lifecycle):** a raw message is deleted *because it was already distilled* into the summary + memory items. Derived memory **may remain** - this is intended, and is how 8.1 keeps the product benefit without archiving raw chat.
- **User/legal deletion (the lineage invariant):** when a user (or a legal request) deletes a source message, thread, or memory item, **any derived summary/item must be regenerated or invalidated** - derived personal memory must not outlive *user-deleted* source data unless fully anonymized and non-personal.
- Implementation: the `memory_mutation` audit (Section 10) distinguishes `action=compaction` (system) from `action=delete` (user/legal) so the regeneration trigger only fires on the latter.

### 8.5 Backup, snapshot & replica deletion
Define how deleted data ages out of **backups, snapshots, DR replicas, and legal holds**: deletion propagates/ages out on a defined cycle [SET]; legal-hold data is exempt until released; where rewriting backups is impractical, **crypto-shredding** (destroying the data's encryption key) renders it unrecoverable.

### 8.6 GDPR/CCPA export + erasure
- **Export includes:** account profile, consents/acceptance records, chat/memory data, a ledger summary, and the deletion/retention caveats.
- **Export excludes:** abuse/legal evidence, internal classifier notes/scores, and any other user's data.
- Erasure honored end-to-end across personalization stores; the legal-log and ledger carve-outs are documented in the privacy policy.

## 9. Encryption, keys & access control
- Encryption at rest for sensitive stores (chat/memory, identity, payment tokens, abuse logs).
- **Key management:** **envelope encryption** for chat/memory (per-thread data keys wrapped by a KMS master key); **separate key hierarchies** for chat/memory vs. abuse/legal vs. identity/payment, so compromise or deletion in one domain doesn't touch another; **rotation** on [SET] cadence; keys held in a KMS/HSM, never in app config.
- **Deletion granularity (important):** per-thread keys cannot crypto-shred a *single* memory item. So - **granular deletion** (one item / one message) is done by **row + vector deletion** in the live store; **crypto-shredding** (destroying the data key) is reserved for **full thread / account deletion and backup aging**, where rewriting backups is impractical.
- Per-service least-privilege DB roles aligned to the Section 2 classes; the abuse/legal store is restricted to a named, trained team (ties to NCMEC workflow, Appendix A4).
- Audit logging on all access to sensitive classes (Section 10).

## 10. Audit & compliance tables (sketch)
Make sensitive-data governance first-class:
- `sensitive_access_log(id, actor_type[service|human], actor_id, data_class, record_ref, action, reason_code, break_glass bool, ts)` - every read/write of a sensitive class. **Tamper-evident** (append-only + hash-chained), **access-restricted**, and **content-free** (refs only). **Alert** on unusual reads (volume spikes, break-glass, off-hours human access).
- `consent_record(id, user_id, doc_type[terms|privacy|adult_ack|bot_disclosure|data_processing], doc_version, accepted_at)` - **immutable** acceptance records, by version.
- `deletion_request(id, user_id, scope, requested_at, completed_at, status)`
- `data_export_request(id, user_id, requested_at, delivered_at, status)`
- `legal_hold(id, subject_ref, reason, placed_by, placed_at, released_at)`
- `memory_mutation(id, thread_id, item_id, action[create|edit|delete|decay|compaction], actor[user|system|legal], ts)` - supports the review/edit UX + the 8.4 lineage trigger (regeneration fires on `delete`/legal, not `compaction`).

## 11. Open [SET] items
Retention periods per class; raw-message retention window; **memory decay-to-delete threshold**; AV re-verification cadence + step-up triggers; earned-credit expiry; ledger financial-record retention; embedding model + pgvector index params; standard-vs-enhanced memory params (k, extraction depth); key-rotation cadence + KMS/HSM choice; backup deletion cycle; creator-analytics k threshold; **vendor DPA deletion paths**; **consent doc versions**; when logical schemas graduate to separate instances.
