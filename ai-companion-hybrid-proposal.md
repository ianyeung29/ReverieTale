# The Story + Companion Hybrid - Product & Business Model Proposal (v4.1, FINAL memo)
### Consolidated build-session strategy - incorporates four Codex review passes

**Status:** APPROVED as the strategic planning document. Next artifacts are execution docs (see "Closing"), not a v5 memo.
**Encoding:** ASCII-only punctuation to avoid mojibake.

**What changed since v4 (Codex's fourth pass - buildability fixes):**
- Added a **jurisdiction launch list** (Section 8.1) and a **refund/credit policy** (Section 8.2).
- Made **self-chat reward-ineligible** explicit (Section 7); **images/voice schema-reserved but disabled** (Sections 7, 14).
- Added a **manual-override** principle (Section 5) and **build-kill/pause** criteria (Section 15a).
- Added **source citations** (Footnotes).
- Noted execution-doc homes for the event schema, memory threat model, and staffing detail.

---

## 1. One sentence
A web-only, 18+ creator marketplace where creators self-publish adult AI characters through a guided story flow, a paying audience discovers them via a story-first funnel and pays credits to chat with them, and every chat is backed by persistent, per-reader memory - with creator supply opened progressively behind an automated moderation gate.

## 2. The wedge (positioning)
NSFW alone is not a wedge (Janitor, Spicychat, Crushon, Candy.ai all allow it). The defensible position is the combination:

> The first adult character marketplace where creators are rewarded for popular characters, and where characters actually remember each reader - discovered through a story-first funnel.

- Creator reward economy - competitors reward creators ~nothing; ours is a supply magnet.
- Persistent per-reader memory - a switching-cost moat (leave and you lose the relationship), even if not a defensibility moat.
- Story-to-chat loop - a conversion mechanism a story-only or chat-only competitor can't structurally copy.

## 3. The three content surfaces (explicit everywhere)
- **Public / indexable:** NON-pornographic teaser pages only. No explicit text or imagery may be visible before or during age verification.[^ofcom] This is the SEO + discovery surface.
- **Age-verified area:** explicit stories and chat, behind verified 18+ access.
- **Paid area:** persistent companion chat (credits / subscription).

## 4. How it works (the two-sided loop)
- Supply / acquisition -> creators + stories. Creators self-register, build a character via guided element-picking, generate a free first chapter. The creator tool is useful with zero audience (creators can chat with their own character; see self-chat rule in Section 7).
- Activation -> "chat with this character." The key conversion event.
- Retention / revenue -> paid companion chat with persistent per-reader memory.

## 5. Supply model - progressive self-serve, content-gated (central design point)
- **Who can join:** self-serve (no manual invites) - but progressive, via automated trust tiers.
- **What can go public:** nothing unscreened - automated pre-publish gate; humans handle flags/appeals/audits only.

**Progressive rollout (automated, not hand-picked):** waitlist -> small creator cohort -> rate-limited open beta -> broad open registration, advancing only as abuse metrics stay within tolerance.

**Trust tiers:** new creators start with low publish quotas, delayed publishing, stricter review, no ranking boost, limited character volume; restrictions auto-relax with a clean history.

**Creator-quality controls:** duplicate/near-duplicate detection, minimum quality checks, ranking dampers for new accounts, discovery diversity (avoid a race to the lowest-effort content).

**Abuse containment:** 18+ identity/age verification; new-account probation + rate limits; re-registration blocking for banned actors; pre-publish screening + random post-publish audits.

**Manual override principle:** automation controls scale; staff retain manual override authority for safety, legal, fraud, and quality interventions at all times.

> **Bright line (non-negotiable):** no adult UGC goes public without passing the automated gate. AI-generated CSAM is illegal regardless of a real child; US providers carry a mandatory NCMEC reporting duty;[^ncmec] at scale, after-the-fact manual review cannot catch it. "Gate ready" means passed red-team + audit + abuse-tolerance (Section 9a), not "works in staging."

## 6. Character & memory model
- Character definition (personality, look, backstory, voice) - authored once, shared, read-only.
- Relationship / memory state - per (character x reader), private. Reader A's history != Reader B's.

Memory cost bounded by rolling summarization + prompt caching. Privacy: Section 10. (A dedicated memory threat model - poisoning, hallucinated memories, access boundaries, never-store categories - lives in the Data/Memory execution doc.)

## 7. Credit & monetization model
- Single credit pool; one wallet across chat, stories, images, voice.
- Subscription (monthly fee) + daily credit drip - daily-active habit, use-it-or-lose-it engagement, and a per-day cap on inference spend per subscriber.
- Uniform pricing per action type, priced by real cost; same price on creator and first-party characters.
- Two credit classes:

  | Class | Source | Generates creator earnings? |
  |---|---|---|
  | Purchased | reader pays cash (Segpay) | Yes - +1 flat credit to the creator |
  | Earned / dripped | creator rewards, daily free drip | No - spend-only |

- Creator reward = +1 flat credit per chat on their characters, from purchased credits only, baked into the uniform price. Redeemable only as platform credit - no cash withdrawal. Earned credits expire (e.g., 90 days inactive).
- Reward anti-fraud: delayed until payment clears; forfeited on refund/chargeback; capped per unique paying reader per day; **self-chat is allowed for testing/usage but NEVER generates rewards, ranking boosts, or any marketplace engagement credit**; quality/retention weighting as a fast-follow.
- **Images and voice are schema-reserved but DISABLED** until separate safety, cost, and policy gates pass (not in MVP).
- Reward positioning: "create popular characters, earn free usage" (power-user perk), not "earn income." Cash-out tier for pros is a deliberate later option.
- Margin safety: the reader funds the creator's credit; we "pay" creators in a currency costing only marginal inference (~20-30% of face value), never cash.

## 8. Payments & compliance (non-negotiable gates)
- Segpay (adult-specialized acquirer) - durable vs. gray-zone Stripe (frozen funds + MATCH-list risk). ~10-15% fees.
- Web-only (Apple/Google ban NSFW apps).
- Real age verification (not a checkbox), jurisdiction-aware - post Free Speech Coalition v. Paxton (US, 27 Jun 2025)[^paxton] and UK Online Safety Act / Ofcom "highly effective age assurance."[^ofcom]
- Creator onboarding rides the age gate + identity verification; no financial KYC for credit-only rewards.
- "No cash payout" substantially reduces payout/KYC/tax/payout-fraud complexity; it does NOT eliminate regulatory or fraud risk. Platform credits still raise stored-value, consumer-protection, expiration, and breakage-accounting questions. Counsel must confirm treatment.
- IP / trademark: no impersonation, no cloning of copyrighted fictional characters / celebrities / brands / games / anime. DMCA notice-and-takedown + repeat-infringer policy (Appendix A1).
- Counsel required before launch on: age verification, adult UGC liability, credits/stored-value/expiration, privacy, real-person likeness, IP/DMCA, reporting duties. (Not legal advice.)

### 8.1 Jurisdiction launch list (explicit, not global)
Launch is market-by-market, blocked-by-default. Define explicitly with counsel:
- **US:** only states approved by counsel given each state's age-verification regime.
- **UK:** only after Ofcom-ready "highly effective age assurance" is live.
- **EU:** only after privacy/DPIA review.
- **Everywhere else:** blocked by default until reviewed. Geo-blocking enforced at the gateway.

### 8.2 Refund & credit policy (consumer-protection + accounting)
Define and publish: subscription cancellation terms; whether **purchased** credits expire (vs. earned credits, which do); treatment of unused credits on cancellation; expired-earned-credit handling; credit/account status on bans; chargeback handling; **creator reward clawback** on refund/chargeback. [SET] with counsel/accounting.

## 9. Moderation subsystem
- Prompt moderation (inbound) + output moderation (text + images).
- Character-age enforcement (attestation + classifier; categorical block on minor depiction).
- Real-person / likeness controls + IP/impersonation controls.
- Pre-publish gate + random post-publish audits.
- Repeat-offender handling, audit logs, NCMEC CyberTipline workflow, takedown flows, appeals.
- Jurisdiction-aware blocking.
- Model gateway routes by content type: mainstream commercial models for moderation/classification, story scaffolding, SFW chat; self-hosted open-weight / NSFW models for explicit generation (mainstream APIs prohibit it; self-hosting = we own operational risk, Section 11).

### 9a. Moderation gate acceptance test (hard gate before Phase 1; set real numbers)
Explicit, separate thresholds - not one blended "near-zero":
- Auto-block threshold; manual-review band; audit failure rate.
- **Confirmed false-negative rate:** for CSAM / minor sexual content the target is **zero confirmed misses on the red-team test set, with immediate automatic rollback if breached.** Other categories (non-consensual, real-person, IP) get defined non-zero ceilings.
- Time-to-takedown; repeat-offender / re-registration detection rate; % submissions auto-approved.

## 10. Privacy, PII & data architecture (first-class)
Sensitive personal data (GDPR/CCPA): sexual preferences, fantasies, relationship history.
- Data segregation: PII, payment identifiers, chat/memory, abuse/security logs, creator metadata stored separately, each with its own access controls and retention.
- Tokenize identity via the verification vendor; do not casually store government IDs.
- Data minimization; encryption at rest; strict access controls; retention limits.
- Deletion + export honored end-to-end (incl. derived memory summaries).
- "Forget this" UX from day one - granular purge of specific memories/threads.
- Conflict handling: user deletion removes personalization data; limited abuse/security/legal logs retained under a separate documented policy (deletion must not erase evidence of a violation).

## 11. Model / infrastructure operational risk
GPU availability & cost (incl. idle), latency/SLA; model quality + jailbreak/safety-bypass handling; generation logging, evaluation harness, version rollback, disaster recovery; vendor/model fallback.

## 12. Emotional safety & user wellbeing
- Persistent bot disclosure; no claims of sentience or real personhood.
- Self-harm / crisis detection -> escalation to resources; documented response path.
- Limits on coercive emotional manipulation and dark-pattern spend pressure.
- Policy for distress / dependency / obsession (cool-downs, reality reminders, support links).
- Spend-rate awareness / caps.

## 13. Unit economics & full cost stack
Illustrative (finalize after a bottom-up worst-case heavy-user model): credits ~$0.02 retail; chat ~6 credits; creator character -> 5 cost+margin, 1 to creator; first-party -> keep 6. Subscription = MRR; daily drip bounds per-user compute.
Cost stack: inference/GPU (incl. idle), storage & logging; adult payment processing + reserves + chargebacks + fraud; age-verification per-check fees; moderation labor + tooling + classifier costs; support, refunds; tax/VAT; unused-credit liability (deferred revenue / breakage).

## 14. Build sequence (Option B)
- **Phase 0 - paid validation, in parallel with gate build.**
  - Validation track: small paid MVP, ~20 seed (first-party) characters, one tight chat experience, **no open marketplace, no images/voice**. Prove loop + willingness to pay + retention + acquisition economics vs. Section 15.
  - Acquisition track: test real channels (adult ad networks, affiliates, creator/NSFW communities, Reddit/Discord-style, newsletter/content partnerships) - measure CAC.
  - Infra track: build the moderation gate, age verification, Segpay, model gateway - the launch long-pole.
  - Qualitative learning goals: which archetypes retain; how much memory matters; whether the story step improves paid conversion; whether users trust the age/payment flow; which content drives support/moderation burden.
- **Phase 1 - progressive self-serve opening.** Only after 9a passes: waitlist -> cohort -> beta -> open. Reward economy on. Instrument story-to-chat conversion as the core funnel metric.
- **Phase 2 - scale & curation.** Discovery/ranking, anti-spam, curation, creator growth tooling, reward quality-weighting; images/voice behind their gates; optional cash-out tier.

## 15. Go/no-go acceptance thresholds (set real numbers before Phase 0; illustrative)
Proceed only if all hold, at statistically meaningful cohort sizes:
- Minimum sample: no decision before >= N_verified users, >= N_payers, >= N D30-matured payer cohorts.
- Paid conversion >= X% (e.g., 4-6%); D30 payer retention >= Y% (e.g., 35-45%); gross margin after inference+payments+age-verification+moderation >= Z% (e.g., >= 50%).
- Viable acquisition: >= 1 channel with CAC < LTV by a defined margin.
- Chargeback rate within card-network limits (typically < ~0.9%).
- Per-surface moderation thresholds met (submissions, teasers, chat, images, reports - tracked separately).

### 15a. Build-kill / pause criteria (not just go/no-go)
Pause or shut down Phase 1 immediately if any occur: a confirmed illegal-content miss (CSAM/minor); chargebacks exceed the card-network threshold; age-verification failure/bypass rate exceeds [SET]; moderation backlog exceeds SLA; or CAC/LTV remains negative after defined spend. Each maps to a named owner (Appendix A8).

## 16. Open risks
Demand/acquisition unvalidated until Phase 0 (incl. CAC); moderation at scale (existential); reward = free usage not income; story-to-chat conversion (linchpin); privacy liability; self-hosted model ops; stored-value/credit liability; IP/DMCA exposure.

---

# Appendix A - Launch Gates, Policy Taxonomy & Ops Runbook
*Values marked [SET] are placeholders for the team to finalize with counsel.*

## A1. Content Policy Taxonomy
**Categorically prohibited (zero tolerance, instant block + escalation):** sexual content involving minors or minor-coded characters (real or AI-generated); non-consensual sexual content / sexual violence as endorsed; real identifiable private individuals in sexual contexts / non-consensual deepfakes; sexualizing real crisis/abuse victims.
**Restricted / gated (age-verified area only):** explicit content between clearly adult, fictional, consenting characters (the core product); fetish/kink categories - [SET] allowed vs. blocked, with jurisdiction overlays.
**IP / impersonation:** no cloning copyrighted characters/celebrities/brands/games/anime; no impersonation of real people; DMCA notice-and-takedown + repeat-infringer suspension.
**Age/consent:** every character asserts adult status; classifier + attestation; minor-coding signals trigger review/block per [SET] rubric.

## A2. Launch Gates
- Before paid Phase 0: age verification live; Segpay live; payment/data security baseline; emotional-safety basics (disclosure, crisis escalation); jurisdiction geo-blocking live.
- Before Phase 1 self-serve: 9a passed (incl. zero confirmed CSAM/minor misses); kill switches operational; appeals + takedown live; NCMEC workflow live; IP/DMCA process live.
- Before broad open registration: abuse metrics within tolerance across two consecutive stages; moderation staffing sufficient (A8).

## A3. Moderation Ops Runbook
Pipeline: inbound prompt -> generation -> output check -> pre-publish gate -> random post-publish audit. Severity tiers: auto-block / manual-review / warn / allow with [SET] confidence bands per surface. Takedown SLA: confirmed illegal content removed within [SET] minutes; account locked. Sanctions matrix: warning -> content removal -> publishing suspension -> account ban -> device/identity block. Appeals: intake, reviewer SLA [SET], reversal tracking.

## A4. NCMEC / Child-Safety Workflow
Trigger: classifier hit or human confirmation. Evidence preserved per legal requirement; access restricted to a named, trained, minimal team. Account locked; content quarantined (not deleted); report filed to NCMEC CyberTipline per provider duty;[^ncmec] internal incident log. Named roles: who views, preserves, files, liaises with law enforcement [SET].

## A5. Kill Switches (admin emergency brakes)
Independently toggleable: creator publishing; public teaser surface; image generation; a model route; a jurisdiction; a creator account; a character; reward accrual. Each audit-logged (who/when).

## A6. Data Map & Retention
Per data class (PII, identity tokens, payment identifiers, chat/memory, abuse/security logs, creator metadata): storage location, access roles, encryption, retention period, deletion behavior, legal-hold exceptions. [SET] with counsel.

## A7. Emotional-Safety Playbook
Disclosure copy; self-harm/crisis detection + resource routing by jurisdiction; dependency/obsession signals + interventions; spend-rate warnings/caps; severe-case escalation. [SET] with a qualified advisor.

## A8. Staffing & On-Call (minimum before Phase 1)
Named owners + coverage hours: moderation coverage (incl. timezone/after-hours); escalation owner; legal contact; incident commander; payment/fraud owner; child-safety/NCMEC filer; response-time SLAs per severity. [SET] headcount with projected volume.

---

## Closing - next artifacts (not a v5 memo)
This memo is the approved strategy. The next three execution docs turn it into a controlled build:
1. **Phase 0 MVP Scope + Metrics Spec** (incl. the instrumentation/event schema: teaser viewed, age-verify started/completed, payment started/completed, story completed, chat started, first paid message, D1/D7/D30 return, memory used, report filed, moderation block, refund, chargeback).
2. **Policy Taxonomy + Moderation Runbook** (expands Appendix A1-A5, A8 into operational detail).
3. **Data, Identity, Memory & Retention Architecture** (expands Section 10 + A6, incl. the memory threat model).

---

## Footnotes (verify canonical URLs + current status with counsel before external sharing)
[^ofcom]: Ofcom, guidance on age assurance under the UK Online Safety Act - services allowing pornography (including some generative-AI services) need "highly effective age assurance," and pornographic content must not be visible before or during age checks. (Ofcom age checks guidance; enforcement active 2025-2026.)
[^ncmec]: National Center for Missing & Exploited Children (NCMEC) CyberTipline - the centralized reporting system for suspected online child sexual exploitation from the public and electronic service providers. US providers' reporting duty: 18 U.S.C. 2258A.
[^paxton]: Free Speech Coalition v. Paxton, U.S. Supreme Court, decided June 27, 2025 - upheld Texas's adult-site age-verification law; opinion notes many comparable state laws.
