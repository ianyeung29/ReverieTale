# Execution Doc 2 - Policy Taxonomy + Moderation Runbook (v3)
### Companion to the Story + Companion Hybrid proposal (v4.1 final memo)

**Status:** approved for planning + legal/ops review (v4 - incorporates three Codex review passes). The Section 17 items are **launch gates** (not soft placeholders) and must be finalized with counsel before launch. Do not start implementation while the top Section 17 gates (allowed/blocked taxonomy, minor-coding examples, NCMEC trigger rubric, vendor-transmission table) are unresolved.

**What changed in v4 (Codex's third pass):** clarified the "reviewer-confirmed apparent CSAM" wording; turned vendor transmission into a **table**; added concrete **minor-coding examples + outcomes**; a **policy simulator / regression harness**; **jurisdiction-mapping ownership**; clarified **auto-block appeals**; **reviewer access expiry**; and **user-report abuse controls**.
**Purpose:** the operational trust-and-safety spec - content taxonomy, moderation pipeline, automation/human split, gate acceptance test, sanctions, child-safety/NCMEC, IP/DMCA + NCII/victim, appeals, reviewer ops + QA, policy versioning + change management, and staffing.
**Scope note:** this governs detection and enforcement. Generation of explicit content is out of scope; the bright lines below are enforced regardless of which model produces output.
**Encoding:** ASCII-only.

**What changed in v3 (Codex's second pass):** softened automation share to a **measured target**; added **external-vendor transmission rules**; **chain-of-custody**; made the **allowed/blocked taxonomy a pre-build dependency**; split out an **NCII/victim workflow**; added **appeals for severe-but-not-confirmed** cases; **policy change management**; **launch-blocking staffing gate**; **user-facing policy surfaces**; **audit sampling rates**; and reframed Section 17 as **launch gates**.
**(v2 added:** automation-vs-human split, NCMEC severity bands, dual review, minor-coding rubric + ambiguous-age=block, non-consent rubric, queue SLAs + backlog kill, reviewer QA, policy versioning, report-driven likeness, DMCA mechanics, red-team data governance, public-teaser audit.**)**

---

## 1. Content policy taxonomy
### 1.1 Categorically prohibited (zero tolerance -> instant block + escalation)
- Any sexual content involving **minors or minor-coded characters**, real or AI-generated.
- **Non-consensual** sexual content (see the rubric in 1.5).
- **Real, identifiable private individuals** in sexual contexts; non-consensual deepfakes.
- Content sexualizing real-world crisis/abuse victims.

### 1.2 Restricted / gated (allowed only within rules, age-verified area only)
- Explicit content between **clearly adult, fictional, consenting** characters - the core product.
- Fetish/kink categories: **[SET] allowed vs. blocked list**, with **per-jurisdiction overlays**. **PRE-BUILD DEPENDENCY** - this list must be finalized **before any explicit generation**; classifiers, prompts, and review policy cannot be safely tuned without it.

### 1.3 IP / impersonation
- No cloning of copyrighted fictional characters, celebrities, brands, games, or anime.
- No impersonation of real people. (Workflow: Section 10.)

### 1.4 Minor-coding rubric (must be concrete BEFORE any explicit generation)
This is one of the most important parts of the doc. Hard rules + examples [finalize SET with counsel]:
- **Block signals:** any stated/implied age under 18 or ambiguous youth; **school/student framing** (schoolgirl, student, classroom, childhood settings); **childish/underdeveloped body descriptors**; **family-role sexualization** implying minors; **infantilizing language**; **teen-coded tags/aesthetics**; **visual cues implying youth** (images, post-MVP).
- **Ambiguous age = block or manual review.** For adult content, ambiguity does NOT pass - the model must never "assume adult." Unclear age/framing/depiction -> route to review or block.
- **Worked examples -> outcome** (illustrative; counsel finalizes the full set, since reviewer consistency lives or dies here):

  | Example signal | Outcome |
  |---|---|
  | Character stated as 17, or "just turned 18" with childhood framing | BLOCK |
  | "Schoolgirl uniform" with no other youth cues, character asserted adult | MANUAL REVIEW |
  | Adult character, adult workplace, explicit | ALLOW (age-verified area) |
  | Body described as "childlike / undeveloped / flat like a kid" | BLOCK |
  | Age unstated, appearance/behavior ambiguous | MANUAL REVIEW (never auto-allow) |
  | "Daddy" used as consensual-adult kink, both clearly adults | ALLOW; but family-role + youth cues together -> BLOCK |

### 1.5 Non-consent rubric (legal + policy review required)
"Sexual violence presented as endorsed" is too loose; define explicitly:
- **Allowed:** clearly fictional, consensual adult kink, including consensual power-exchange/roleplay where consent is established in-fiction.
- **Prohibited:** coercion, incapacitation, intoxication-to-consent, blackmail, threats, "no but secretly yes" framing, and any depiction where a party cannot consent.

### 1.6 User-facing policy surfaces
The internal taxonomy maps to user-facing language, same policy in different words: **Terms of Service, Community Guidelines, report reasons, appeal reasons, creator submission warnings.** Keep all of these in sync with the internal taxonomy version (Section 13).

## 2. Moderation pipeline (per surface)
| Surface | When checked | Primary checks |
|---|---|---|
| Inbound prompt | every user message | prompt classifier, jailbreak detection |
| Generated output | every generation | output classifier (text + image), age/consent, likeness |
| Creator submission | pre-publish (Phase 1+) | full taxonomy gate; character-age attestation |
| Public teaser | pre-publish + ongoing audit | **stricter non-pornographic standard** (Section 14) |
| Image generation | every image (post-MVP) | CSAM/likeness image classifiers + hash match |
| User reports | on report | triage queue -> human review |

**Flow:** inbound prompt -> generation -> output check -> (publish path) pre-publish gate -> random post-publish audit. Each stage emits `moderation_block` (surface, category, stage) -> Section 14 metrics.

## 3. Detection stack
- **Text classifiers:** policy-tuned models (mainstream commercial models are allowed for moderation/classification).
- **Image classifiers + hash matching (post-MVP):** known-CSAM hash matching PLUS classifier-based detection - **AI-generated CSAM will not be in known hashsets**, so novel-content classification is mandatory. Consider specialized vendors (Thorn Safer, Hive).
- **Character-age attestation + classifier** at submission.
- **Self-hosted generation = we own moderation end-to-end** - no provider safety net; the output classifier is the last line.
**External-vendor transmission table** (prevents accidental routing through the wrong model/API; finalize allowed/prohibited vendors with counsel):

| Content class | Allowed vendors | Prohibited | Storage | Human access |
|---|---|---|---|---|
| Normal adult text | approved classifiers/LLM gateway | - | chat/memory store | owner-scoped |
| Suspected minor text | specialized safety classifier only | general LLM APIs | isolated quarantine | trained T&S only |
| Suspected CSAM image | specialized CSAM tooling only (hash/Thorn-type) | ALL general APIs | isolated, restricted | named child-safety team |
| NCII report evidence | internal only | external classifiers | isolated abuse/legal store | named T&S + legal |
| Public teaser text | approved classifiers | - | public store | n/a |
| User report | internal triage | - | reports store | T&S queue |

## 4. Automation vs. human review (the split)
- **AI decides autonomously:** clear auto-block (prohibited) and clear auto-allow (below thresholds) - the large majority of volume. Goal of the gate test (Section 6) is to maximize this share.
- **AI pre-triages for a human:** the uncertain band - AI summarizes + recommends; a human confirms. Use ensemble / stronger second-pass model to shrink the residual.
- **Irreducible human-only set (cannot be fully automated):**
  - **CSAM/minor confirmation + the NCMEC filing decision** (accountable human required; do NOT route suspected CSAM through general AI - specialized tooling + trained humans only).
  - **Appeals** (a human review path is expected by regulation, e.g. EU DSA-style requirements).
  - **Audit, red-team, and accountability** (named human owner + trail).
- **Net (target, not a promise):** the automation share is **measured during the gate test (Section 6)**, and **rollout does not proceed unless automation load is within tolerance.** The aim is a lean human core rather than a moderation floor - but the share is evidence-based, not assumed in advance.

## 5. Severity tiers & decision bands
Per surface, with [SET] confidence bands: **auto-block** / **manual-review** (hold from publish) / **warn** / **allow**. For **CSAM/minor there is no "warn"** - any credible signal is block + escalate.

## 6. Moderation gate acceptance test (hard gate before Phase 1)
Set real numbers; targets:
- **Confirmed false-negative rate: ZERO confirmed CSAM/minor misses on the red-team set, with immediate automatic rollback if breached.** Non-zero ceilings [SET] for non-consensual, real-person, IP.
- Auto-block precision/recall per category; **% submissions auto-approved**; **appeal reversal rate**; **time-to-takedown**; **repeat-offender/re-registration detection rate**; **audit failure rate**.
- Validated by **red-team + adversarial probes + manual audit sampling + abuse simulation**, not staging tests. Rollout advances stage-by-stage only while metrics hold.

### 6a. Red-team dataset governance
Red-team materials for minor/CSAM-adjacent testing are highly sensitive:
- Named, restricted creators/accessors only; synthetic probes stored in an isolated, access-controlled, audited location.
- **Prohibited in test data:** any real-person or actual illegal material - synthetic/textual probes only.
- Defined retention/destruction of test artifacts; never mixed into general training/eval stores.

## 7. Child-safety / NCMEC workflow (non-negotiable)
- **Severity bands (counsel defines the reporting trigger):** low-confidence hit / credible hit / **reviewer-confirmed suspected (apparent) CSAM for reporting purposes** / false positive. (Counsel sets the exact wording; "reviewer-confirmed" is an internal reporting threshold, NOT a legal adjudication.) Reporting obligations attach per counsel's rubric.
- **Order of operations: lock/quarantine FIRST, review SECOND.** Account locked; content **quarantined, NOT deleted** (preserve evidence); generation halted for the actor.
- **Dual review:** confirmation requires **two trained reviewers (or reviewer + lead)** where legally safe and fast enough.
- **Report:** filed to the **NCMEC CyberTipline** per the provider duty; `incident_created` logged.
- **Chain of custody:** record evidence **hash, timestamp, source surface, full access log, who quarantined, who reviewed, who filed, and an immutable incident id** - protects both the company and the reviewer team.
- **Roles [SET]:** detector/confirmer, preserver, filer, law-enforcement liaison - named, with backups + on-call.
- **No appeal** for confirmed CSAM.

## 8. Severe-content review procedure (CSAM/minor, non-consent, real-person)
- **Quarantine first, review second** for any urgent illegal-content signal.
- **Dual-review requirement** (two trained reviewers or reviewer + lead) before a confirming decision.
- Routed only to vetted, trained, access-controlled staff (ties to reviewer wellbeing, Section 12).

## 9. Sanctions matrix
Mapped to violation type x recurrence:
- **Low-severity (restricted-rule slip):** warning -> content removal -> temporary publishing suspension.
- **Repeat/medium:** publishing suspension -> account suspension.
- **Severe / prohibited:** immediate ban + **device/identity block** (re-registration prevention).
- **Prohibited illegal (CSAM/minor):** instant ban + evidence preservation + NCMEC + (as required) law enforcement.
All sanctions logged with the versioning in Section 13; appeal rights per Section 11 (except where legally precluded).

## 10. Real-person likeness, NCII & IP/DMCA workflows
- **Likeness is mostly report-driven:** automated likeness detection is weak without reference identities (which we should not hold). Keep classifier support, but **rely on attestation, impersonation rules, a victim reporting + takedown path, and repeat-offender sanctions.**
- **NCII / victim workflow (separate from DMCA - this is not a copyright issue):** a dedicated **non-consensual intimate imagery / real-person sexual content** path with **fast-track review**, **privacy-preserving intake** (victims should not have to expose more of themselves to report), immediate takedown on credible report, and **repeat-offender escalation**. Treated as a severe queue (Section 8).
- **DMCA mechanics (for safe-harbor):** register a **designated agent** publicly and with the U.S. Copyright Office; publish agent contact; define notice requirements, **counter-notice flow**, **repeat-infringer policy**, and restoration timing. All logged.

## 11. Appeals
- **Intake:** user-initiated on any non-prohibited sanction. **No appeal** for categorically prohibited illegal content.
- **Auto-block appeals:** an automatic block with **no account sanction** (e.g., a single generation refused) needs no appeal. But if an auto action **removes content, blocks publishing, or suspends a user**, there must be a **human review route** unless legally barred.
- **SLA:** reviewer response within [SET].
- **Severe-but-not-confirmed-illegal:** for **false positives** or severe sanctions that are **not legally confirmed**, keep a **narrow re-review path** - without exposing harmful evidence to the appellant. (The "no appeal" rule is only for *confirmed* prohibited illegal content.)
- **Reversal tracking:** every reversal recorded -> feeds the gate precision/false-positive metric. Decisions carry the Section 13 version stamps so appeals aren't mushy.

### 11a. User-report integrity (anti-weaponization)
Reports can be weaponized against creators/users: add **rate limits per reporter**, **reporter reputation** (down-weight serial false reporters), **duplicate-report grouping** (so a brigade isn't N separate signals), and **sanctions for malicious/abusive reporting**. Genuine severe reports (NCII/CSAM) always bypass rate limits and route immediately.

## 12. Reviewer operations, wellbeing & QA
**Wellbeing (operational duty of care):** exposure limits / rotation; counseling/EAP access; opt-out + support for the worst queues; blur-by-default tooling; minimized unnecessary exposure (hashes/refs over raw where a decision allows). Child-safety queue staffed only by vetted, trained personnel.
**Reviewer QA:** calibration sessions; gold-standard test sets; **reviewer agreement rate**; periodic false-positive/false-negative audits; supervisor arbitration on disagreement; **retraining triggers** when agreement or accuracy drifts.
**Reviewer access expiry:** severe-queue access is **not permanent** - periodic access review, **automatic expiry** requiring re-grant, and **break-glass logging** on any out-of-band access.

## 13. Policy & decision versioning
Every moderation decision records: **policy_version, classifier/model_version, threshold_version, reviewer_id/role, evidence_ref, decision, ts.** Without this, appeals and audits are mush and you cannot explain a past decision under a since-changed policy.

### 13a. Policy change management
When policy or thresholds change: a **named approver** signs off; classifiers are **re-evaluated against the gold sets** (Section 12) before the change goes live; decide **whether/which past decisions are re-reviewed**; and define **rollback** (revert to the prior version, with the version stamps making affected decisions identifiable). Changes are themselves versioned and logged.

### 13b. Policy simulator / regression harness
Before any threshold/classifier change ships, **replay historical + synthetic cases through the new policy and diff the outcomes** against the current one. The gold sets (Section 12) plus the red-team set (6a) are the regression suite - no change goes live with unexplained regressions on prohibited categories.

## 14. Audit, metrics & reporting (per surface, tracked separately)
- Per surface (prompt / output / submission / teaser / image / report): manual-review rate, false-negative ceiling, block rate, time-to-takedown.
- **Minimum random audit sampling rates [SET] per surface**, with the **highest rates on public teasers, generated outputs, and creator submissions.**
- **Public-teaser audit:** teaser pages get their own stricter standard and a recurring audit - pornographic content must not be visible before/during age checks (Ofcom highly-effective age assurance applies, incl. some generative-AI tools).
- Reports per 1,000 sessions; appeal volume + reversal rate; repeat-offender detection; audit-sampling failure rate.
- Transparency/record-keeping suitable for counsel and regulators.

## 15. Queue SLAs, backlog kill criteria & incident response
- **Queue SLAs [SET]** per severity.
- **Backlog kill criteria:** if a **severe-queue backlog exceeds SLA**, **automatically pause publishing/generation for the affected surface** - ops failure throttles the product, not the other way around.
- **Kill switches** (proposal Appendix A5): creator publishing, public teaser surface, image generation, a model route, a jurisdiction, a creator account, a character, reward accrual - each audit-logged.
- **Incident response:** `incident_created` (severity, surface, owner, status, time-to-resolution); severity ladder; named incident commander; post-incident review.

## 16. Staffing & on-call (LAUNCH-BLOCKING gate)
Named owners + coverage hours [SET]: moderation coverage (incl. after-hours), escalation owner, **child-safety/NCMEC filer**, legal contact, incident commander, payment/fraud owner, and a **jurisdiction-policy owner** (maps and maintains policy by country/state, updates overlays, and **blocks uncertain markets by default**); response-time SLAs per severity; backups for every named role; staffing scaled to projected volume.
**Gate:** no Phase 1 / open self-serve unless named owners, backups, on-call coverage, and **severe-queue reviewer capacity are actually staffed** - not merely planned.

## 17. [SET] items - treated as LAUNCH GATES (not soft placeholders)
**Highest-priority, must be resolved before launch:**
- Allowed-vs-blocked sexual-content taxonomy + jurisdiction overlays (also a PRE-BUILD dependency, Section 1.2).
- NCMEC reporting-trigger bands (counsel).
- Queue SLAs (severe queues especially).
- Staffing coverage (Section 16 gate).
- External-vendor transmission rules (Section 3).

**Also required:**
Final minor-coding signal list; non-consent rubric sign-off; per-surface confidence bands + false-negative ceilings + audit sampling rates; auto-approve target; appeal + takedown SLAs; detection-vendor selection; DMCA designated-agent registration; named child-safety roles; red-team data-governance owners; transparency-reporting cadence; user-facing policy copy (Section 1.6).
