# Execution Doc 1 - Phase 0 MVP Scope + Metrics Spec (v3)
### Companion to the Story + Companion Hybrid proposal (v4.1 final memo)

**Status:** approved as the Phase 0 execution spec (v3 - incorporates two Codex review passes).
**Purpose:** define exactly what Phase 0 builds, what it measures, and the decision rules that gate Phase 1. No open marketplace, no creator registration, no images, no voice.
**Encoding:** ASCII-only.

**What changed in v3 (Codex's second pass):** added **randomization/assignment rules** + **sample-size ownership**; made **memory testing staggered-by-default** and **standard-vs-enhanced** (not on/off); added **free-allowance economics**, **support & incident events**, and **per-character/archetype guardrails**; made the **card-network threshold an acquirer-sourced placeholder**.
**(v2 added:** the story-vs-direct experiment, per-turn cost telemetry, payment/ledger reliability scope, admin console, fraud/velocity controls, legal-onboarding events, MVP duration/budget caps, conservative-LTV, H6 caveat, Phase 1 wording fix.**)**

---

## 1. What Phase 0 is testing (hypotheses)
- **H1 (willingness to pay):** verified users convert to paid at a viable rate.
- **H2 (retention):** payers come back and keep spending (D7/D30).
- **H3 (the loop):** the story step lifts paid conversion **vs. dropping users straight into chat** (tested by experiment, Section 5).
- **H4 (memory matters):** persistent per-reader memory measurably improves retention/spend.
- **H5 (acquisition):** at least one channel acquires verified users at **CAC < conservative LTV**.
- **H6 (moderation/ops load):** *user-side* content/support burden is operationally sane. **Caveat:** Phase 0 first-party content validates live chat/output moderation load only; **creator-submission (UGC) abuse is NOT validated here** - that comes later via red-team + staged self-serve.

If these don't hold at meaningful sample sizes (Section 9), we do not proceed.

## 2. In scope / out of scope
**In scope:**
- ~20 hand-made **seed (first-party) characters** spanning a few archetypes (bridge content; not a marketplace).
- One web chat experience with **persistent per-reader memory** (rolling summary + retrieval).
- Guided **story** entry + the **two experiments** in Section 5.
- One **subscription tier** (monthly + daily credit drip) + **credit top-up packs**, on a **double-entry ledger**.
- **Payment/ledger reliability** states (Section 6) - the boring failure paths.
- **Age verification**, **Segpay**, **geo-blocking** to launch jurisdictions.
- Moderation on the chat path (prompt + output) + **emotional-safety basics**.
- **Minimum admin console** (Section 7) and **fraud/velocity controls** (Section 8).
- Full **event instrumentation incl. cost telemetry** (Section 6) on **self-hosted analytics**.

**Out of scope (deferred):** open creator registration/publishing/marketplace/creator payouts; images and voice (schema-reserved, disabled); discovery/ranking; native apps (web-only).

## 3. Minimum compliance gates (before any paid user)
Age verification live (no explicit content before/during the check); Segpay live; no raw card data stored; geo-blocking to counsel-approved markets, blocked-by-default elsewhere; emotional-safety basics (persistent bot disclosure, no-sentience copy, self-harm/crisis escalation); privacy basics (tokenized identity, data minimization, "forget this" live).

## 4. User flow (the funnel to instrument)
Public SFW teaser -> age verification -> account creation -> (experiment split) -> story or direct chat -> paywall -> purchase -> first paid message -> D1/D7/D30 return with memory across sessions.

## 5. Experiments (the core of Phase 0)

### 5.1 Primary experiment - H3 (story vs. direct)
- `story_first`: teaser -> free first chapter -> chat.
- `direct_chat`: teaser -> chat preview / free message allowance (no story).
- **Primary metric:** verified-user paid conversion. **Guardrails:** refund rate, chat satisfaction, moderation blocks, D1 return.
- Hold **memory = standard** constant across both buckets to avoid confounding.

### 5.2 Randomization & assignment
- **User-level** assignment, fixed at **account creation (or first teaser interaction)**, **persisted**; never change a user's bucket mid-experience.
- **No crossover:** a user does not later see the other path; if crossover is unavoidable, flag and **exclude crossover users from the H3 readout** (crossover muddies H3).
- Log `story_bucket` on every event for clean splits.

### 5.3 Memory experiment - H4 (staggered by default)
- **Default: run memory testing AFTER the H3 readout** (stagger), not concurrently - a 2x2 (story x memory) needs ~4x the sample. Run a concurrent 2x2 only if traffic is surprisingly strong.
- **Test standard vs. enhanced memory, NOT memory vs. none** - fully disabling memory may ship a visibly worse product and bias the result against the core value prop.

### 5.4 Sample-size ownership (before launch)
A named **analyst/owner computes the required N per bucket** for the minimum detectable effect on paid conversion and D30 retention **before launch**. Without this, the test can run and still be inconclusive. Feeds the Section 10 cohort minimums.

### 5.5 Free-allowance economics
Define explicitly: the size of the **free message/chapter allowance**; whether it requires **age verification first**; and a **cost cap per verified non-payer** (free usage can quietly eat the acquisition budget). Track non-payer free-usage cost via `generation_turn`.

## 6. Event instrumentation schema
Fire to **self-hosted analytics** (PostHog/ClickHouse). **Never** put raw chat content, fantasies, or PII in properties - IDs, enums, counts, booleans only. Envelope: `event_id, user_id (pseudonymous), session_id, ts, platform, jurisdiction, story_bucket, memory_bucket`.

**Product/funnel events:**
| Event | Fires when | Key properties |
|---|---|---|
| `teaser_viewed` | teaser loads | character_id, channel_enum |
| `age_verify_started` / `_completed` | AV flow | result, vendor, latency_ms |
| `account_created` | signup | channel_enum |
| `story_started` / `story_completed` | free chapter | character_id, archetype, duration_s |
| `chat_started` | first message | character_id, story_bucket, memory_bucket |
| `paywall_viewed` | paywall shown | trigger |
| `payment_started` / `payment_completed` | checkout / Segpay confirm | product, amount, credits_granted, first_purchase |
| `first_paid_message` | first credit-paid message | character_id |
| `credit_spent` | credit-consuming action | action_type, credits, balance_after, credit_class |
| `memory_used` / `memory_forgotten` | retrieval / purge | character_id, items_recalled / scope |
| `session_return` | returning session | days_since_signup |
| `moderation_block` | content blocked | surface, category, stage |
| `report_filed` | user report | surface, reason_code |
| `subscription_canceled` | cancel | tenure_days, reason_code |

**Legal/trust onboarding events:** `terms_accepted`, `privacy_accepted`, `adult_content_acknowledged`, `bot_disclosure_seen`, `crisis_resource_shown`.

**Cost telemetry event** `generation_turn` (content-free; needed for real margin): `model_route, input_tokens, output_tokens, moderation_calls, retrieval_count, latency_ms, est_cost, cache_hit`.

**Payment/ledger reliability events:** `payment_webhook_received` (idempotency_key, dedup_result), `ledger_entry_posted` (txn_type, double-entry pair id), `refund_issued`, `chargeback_received`, `reward_clawback` (reserved), `subscription_renewal_failed`, `credit_expired`, `admin_adjustment` (actor, reason).

**Support & incident events:** `support_ticket_created` (category_enum [av / payment / privacy / moderation / other], refund_requested, resolution_time_s, status); `incident_created` (severity, surface, owner, status, time_to_resolution_s).

**Privacy rule:** sanitize acquisition data - store `channel_enum`, not raw referrer/URL; strip/normalize UTMs (they can carry sensitive terms); avoid full URLs.

## 7. Minimum admin console (must exist, need not be elegant)
User lookup; account lock; character disable; refund visibility; moderation-event review; memory-deletion verification; **kill switches** (per Appendix A5); payment/**ledger audit** view.

## 8. Fraud / abuse velocity controls (before paid launch)
Account-creation rate limits; payment-attempt limits; free-message abuse limits; VPN/proxy risk scoring (if AV/payment vendor supports); suspicious refund/chargeback monitoring; re-registration blocking.

## 9. Metrics & KPIs
**Funnel:** teaser->AV start; AV completion; signup; story completion; **story->chat conversion**; chat->paid; **verified-user paid conversion** (H1).
**Experiment readouts:** **story_first vs direct_chat** paid-conversion lift (H3); **memory_on vs off** retention/spend lift (H4).
**Retention/engagement:** D1/D7/**D30**; **D30 payer retention** (H2); messages/payer/day; sessions/week.
**Economics:** ARPU/ARPPU; **gross margin per payer** after inference (from `generation_turn`) + payments + age-verify + moderation; refund rate; **chargeback rate**.
**LTV (conservative proxy - we will NOT know true LTV in Phase 0):** D30 gross profit per payer; projected **payback period**; sensitivity ranges. Decisions require **CAC < conservative LTV**, never optimistic LTV.
**Moderation/ops (H6, user-side only):** blocks per 1,000 generations; manual-review rate per surface; reports per 1,000 sessions; audit false-negative findings; time-to-takedown.
**Per-character / per-archetype guardrails:** track paid conversion, retention, moderation blocks, refunds, and gross margin **by character_id and archetype**. With only ~20 seed characters, one breakout or one weak archetype can skew the aggregate - **rotate teaser exposure** so a result isn't just "one character won," and inspect the distribution, not only the mean.

## 10. Go/no-go thresholds + cohort minimums
Proceed only if **all** hold, at statistically meaningful size. [SET] real numbers; illustrative below.
- **Minimum sample:** >= N_verified, >= N_payers, >= N D30-matured payer cohorts (account for the experiment cell count - a 2x2 needs ~4x).
- Verified-user paid conversion >= **X%** (4-6%); D30 payer retention >= **Y%** (35-45%); gross margin >= **Z%** (>=50%).
- **Story_first beats direct_chat** on paid conversion by >= [SET] (validates H3, the loop).
- >= 1 channel with **CAC < conservative LTV** by a defined margin.
- Chargeback rate within the **operating threshold sourced from Segpay / acquirer / card-program terms** ([SET]; "< ~0.9%" is only a memo-level placeholder, not the operating number).

## 11. MVP duration, budget & decision date (no endless experiments)
- **Minimum runtime:** long enough for a D30 payer cohort to mature [SET weeks].
- **Max spend per acquisition channel:** [SET]; **max total infra/ops burn:** [SET].
- **Hard decision date:** [SET] - at which the go/no-go review runs regardless.

## 12. Build-kill / pause criteria (monitored continuously)
Any confirmed CSAM/minor miss -> hard stop + rollback; chargebacks exceed card-network threshold; AV failure/bypass rate exceeds [SET]; moderation backlog exceeds SLA; CAC/LTV negative after defined spend. Each -> named owner (Appendix A8).

## 13. Acquisition test plan
Channels in parallel, capped budgets, tracked via `channel_enum`: adult ad networks; affiliates; creator/NSFW communities; Reddit/Discord-style; newsletter/content partnerships. Measure CAC to **verified user** and to **payer**. Output: per-channel CAC vs. conservative LTV table; identify >= 1 viable channel (H5).

## 14. Qualitative learning goals
Which archetypes retain; how much memory matters (back the A/B with feedback); whether/how story improves conversion; trust in age/payment flow (drop-off + tickets); which content categories drive support/moderation burden.

## 15. Privacy & data handling in Phase 0
Tokenized identity (no stored IDs); data segregation (PII / payment tokens / chat-memory / abuse logs separate); self-hosted analytics with content-free events + sanitized channels; "forget this" live; documented retention; abuse/legal logs separate from deletable user data.

## 16. Exit criteria & decision
At cohort maturity / decision date (Sections 10-11):
- **Go:** thresholds met -> **continue/complete the moderation gate to its 9a acceptance test, then begin progressive self-serve (Phase 1).** (Gate/infra build runs in parallel during Phase 0, so this is completion, not a cold start.)
- **Iterate:** fixable near-miss -> one defined iteration, re-measure.
- **No-go:** structural failure (no viable CAC, weak retention, untenable moderation load) -> stop or pivot.

## 17. Open [SET] items
Threshold numbers + cohort minimums; **required-N per bucket (computed pre-launch, Section 5.4)**; story-lift target; prices/credit values + drip amount; **free-allowance size + non-payer cost cap**; AV vendor; launch jurisdictions; per-surface moderation bands; acquisition budgets; runtime + decision date; AV failure-rate kill threshold; **operating chargeback threshold (from acquirer terms)**.
