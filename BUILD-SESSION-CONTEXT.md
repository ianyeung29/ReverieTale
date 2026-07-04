# Build Session Context (continuation handoff)
### Read this first to continue the Story + Companion Hybrid build session

ASCII-only. Orients a fresh session (local Claude Code or any agent) on what's decided and what's next.

## Product in one line
A web-only, 18+ creator marketplace: creators self-publish adult AI characters via a guided story flow; a paying audience discovers them through a story-first funnel and pays credits to chat; every chat has persistent per-reader memory. Creator supply opens progressively behind an automated moderation gate.

## Canonical docs (committed to this branch)
- `ai-companion-hybrid-proposal.md` - approved strategy memo (v4.1). Source of truth for all decisions.
- `exec-1-phase0-mvp-spec.md` - Exec Doc 1: Phase 0 MVP scope + metrics spec.
- `exec-2-policy-moderation-runbook.md` - Exec Doc 2: policy taxonomy + moderation runbook.
- `exec-3-data-identity-memory.md` - Exec Doc 3: data/identity/memory/retention architecture.
All four were pressure-tested across multiple external (Codex) review passes.

## Key locked decisions (see the proposal for detail)
- Wedge = creator reward economy + persistent per-reader memory + story-to-chat loop (NSFW alone is not a wedge).
- Supply = progressive self-serve (no manual inviting) behind an automated pre-publish moderation gate.
- Credits: single pool; subscription + daily drip; uniform per-action pricing; +1 flat creator reward baked into price; platform-credit-only rewards (no cash payout); two credit classes (purchased = earn-generating, earned/dripped = spend-only); double-entry ledger.
- Payments = Segpay (adult acquirer) for the full product; web-only; real age verification; jurisdiction launch list, blocked-by-default.
- Models = mainstream APIs for moderation/SFW/scaffolding; self-hosted open-weight/NSFW for explicit generation, behind one gateway.
- Sequencing = Option B: paid validation in parallel with building the moderation gate, then progressive self-serve.
- Tech (recommended, not locked): PostgreSQL + pgvector + Redis; S3-compatible adult-friendly object storage; self-hosted analytics; TypeScript/Next.js web + Python AI services.

## LATEST DIRECTION - budget pivot (important, supersedes naive "build now")
Full explicit adult UGC launch requires a real compliance stack (adult counsel ~low 5 figures, Segpay, age verification, CSAM/NCMEC handling). Given a tight budget, the decision is:
- **Do NOT build the full explicit/UGC product yet.** Its legal/compliance cost is intrinsic to the category and cannot be skipped (CSAM handling is criminal-liability, offshore hosting does not avoid it, competitors are funded companies that did this work).
- **Validate demand cheaply FIRST**, then use that evidence to fund or raise for the real build.
- Note: the user believes non-explicit "spicy only" will NOT convert to paying (willingness-to-pay is driven by explicit). The market already proves people pay for explicit AI companions (Candy.ai etc. are profitable) - so the unproven risks are (a) can WE acquire users affordably (CAC), and (b) does our wedge differentiate. Those can be tested without hosting explicit content.
- **Cheapest next step = a Demand Validation effort:** landing page + waitlist with honest explicit positioning (NOT hosting/generating explicit content), + small paid-ad tests to measure CAC and signup intent. Light legal only (18+ gate, disclaimers, privacy policy).

## Legal tooling
- Local Claude Code has the `claude-for-legal` plugins installed + enabled: `privacy-legal`, `ip-legal`, `commercial-legal`, `product-legal`, `regulatory-legal` (skills, triggered by asking in natural language - not slash commands).
- Use them to DRAFT the light legal for the waitlist (ToS, privacy policy, 18+ gate) and to prep documents to reduce counsel hours later.
- They produce drafts for attorney review - NOT a substitute for counsel on the criminal/existential items (CSAM/NCMEC, age-verification legality). Those still need a licensed lawyer before any explicit launch.

## Local toolchain (everything is in local Claude Code, not the remote web session)
- Codex plugin (reviews), the 5 legal plugins (drafting), the repo, and Claude itself all run locally. The remote web session cannot access local plugins - so continue this work locally.

## Doc set status
- [x] Strategy memo
- [x] Exec Doc 1 - Phase 0 MVP Spec
- [x] Exec Doc 2 - Policy + Moderation Runbook
- [x] Exec Doc 3 - Data/Identity/Memory
- [ ] Demand Validation Spec (RECOMMENDED NEXT) - landing page + waitlist + ad-CAC test; the affordable step to prove demand before the big spend.

## Working conventions
- Branch: `claude/ai-companion-hybrid-review-g9hc4k` -> PR #1. Commit docs here.
- Docs are ASCII-only. `[SET]` marks placeholders to finalize with counsel/ops - not open strategy questions.
- Safety bright lines are non-negotiable at every tier: 18+ verification; categorical block on any minor/CSAM, non-consensual, or real-person sexual content; NCMEC reporting duty. Explicit-content generation itself is out of scope for these planning docs.

## Recommended next action
Draft the Demand Validation Spec (landing page + waitlist + ad-CAC test), then use the local legal plugins to draft the light ToS/privacy/age-gate it needs. Only pursue the full explicit/UGC build if demand + CAC validate and funding is in place.
