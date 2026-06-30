# Build Session Context (continuation handoff)
### Read this first to continue the Story + Companion Hybrid build session

ASCII-only. This file orients a fresh session (local Claude Code or any agent) on what's decided and what's next.

## Product in one line
A web-only, 18+ creator marketplace: creators self-publish adult AI characters via a guided story flow; a paying audience discovers them through a story-first funnel and pays credits to chat; every chat has persistent per-reader memory. Creator supply opens progressively behind an automated moderation gate.

## Canonical docs (committed to this branch)
- `ai-companion-hybrid-proposal.md` - the approved strategy memo (v4.1). Source of truth for all decisions.
- `exec-1-phase0-mvp-spec.md` - Execution Doc 1: Phase 0 MVP scope + metrics spec (Codex-approved).

## Key locked decisions (see the proposal for detail)
- Wedge = creator reward economy + persistent per-reader memory + story-to-chat loop (NSFW alone is not a wedge).
- Supply = progressive self-serve (no manual inviting) behind an automated pre-publish moderation gate.
- Credits: single pool; subscription + daily drip; uniform per-action pricing; +1 flat creator reward baked into price; rewards are platform-credit only (no cash payout); two credit classes (purchased = earn-generating, earned/dripped = spend-only); double-entry ledger.
- Payments = Segpay (adult acquirer); web-only; real age verification; jurisdiction launch list, blocked-by-default.
- Models = mainstream APIs for moderation/SFW/scaffolding; self-hosted open-weight/NSFW for explicit generation, behind one gateway.
- Sequencing = Option B: paid validation (seed first-party characters) in parallel with building the moderation gate, then flip to progressive self-serve.
- Tech (recommended, not locked): PostgreSQL core + pgvector (memory) + Redis; S3-compatible adult-friendly object storage; self-hosted analytics; TypeScript/Next.js web + Python AI services. Decide for real in Exec Doc 3.

## Doc set status
- [x] Strategy memo
- [x] Execution Doc 1 - Phase 0 MVP Scope + Metrics Spec
- [ ] Execution Doc 2 - Policy Taxonomy + Moderation Runbook (expands proposal Appendix A1-A5, A8)
- [ ] Execution Doc 3 - Data, Identity, Memory & Retention Architecture (RECOMMENDED NEXT: memory is both the differentiator and the top privacy risk; includes the double-entry ledger schema, per-reader memory tables, data-class separation, retention map, and a memory threat model)

## Working conventions
- Branch: `claude/ai-companion-hybrid-review-g9hc4k` -> PR #1. Commit docs here.
- Review loop: Claude drafts a doc -> Codex reviews (`/codex:review <file>`) -> incorporate -> commit. Going forward both run locally, so no copy-paste.
- Docs are ASCII-only (avoid mojibake). `[SET]` marks placeholders to finalize with counsel/ops/analytics - not open strategy questions.
- Safety bright lines are non-negotiable: 18+ verification; categorical block on any minor/CSAM, non-consensual, or real-person sexual content; NCMEC reporting duty. Explicit-content generation itself is out of scope for these planning docs.

## Recommended next action
Draft Execution Doc 3 (Data, Identity, Memory & Retention Architecture), then have Codex review it off disk.
