# Execution Doc 0 - Demand Validation Spec (the affordable first step)
### Companion to the Story + Companion Hybrid proposal - runs BEFORE any product build

**Status:** draft for review.
**Purpose:** prove - for a few hundred dollars, before any compliance spend - that (a) you can acquire users affordably and (b) the wedge resonates. This gates whether to fund the real build.
**Why this exists:** the full explicit/UGC product needs a real compliance stack (adult counsel, Segpay, age verification, CSAM handling) that is intrinsic and unavoidable. Validate demand first, then use the evidence to fund or raise for that build.
**Encoding:** ASCII-only.

---

## 1. What this validates (and what it deliberately does NOT build)
The market already proves people pay for explicit AI companions (Candy.ai, Crushon, etc. are profitable). So we do NOT need to re-prove that. The unproven, expensive-to-get-wrong questions are:
- **D1 (acquisition):** can we acquire interested users at a viable cost (CAC)?
- **D2 (wedge resonance):** does our specific angle - creators + persistent memory + story-to-chat - make people choose us over incumbents?
- **D3 (intent to pay):** do interested users signal willingness to pay (waitlist -> pre-commit)?

**Not built here:** no chat product, no explicit content hosted or generated, no models, no accounts, no payments infrastructure. This is a marketing-funnel test, not a product.

## 2. The build (tiny)
- **A landing page** with honest explicit *positioning* (tasteful, clearly 18+) that describes the product and the wedge - NOT hosting or generating any explicit content. No nudity/porn on the page; describe, don't display.
- **An 18+ age gate** (self-attestation click-through is sufficient here since no adult content is served) + a short disclaimer.
- **A waitlist capture** (email) with a clear value prop and a "what makes this different" section (the wedge).
- **Optional stronger signal:** a "founding member" pre-commit. WARNING - taking money against an adult-positioned product can trip mainstream processors; a free email waitlist is the safe default, a paid pre-sale is a riskier upgrade to attempt only if you accept that risk.
- **Basic analytics** (self-hosted or privacy-friendly) with content-free events.

## 3. Legal footprint (light - what the legal plugins can draft)
Because nothing adult is hosted/generated, this needs only startup-grade legal - draft with the local `claude-for-legal` plugins, no counsel required for this step:
- **Terms of Service** (waitlist/marketing) -> `commercial-legal`
- **Privacy policy** (email capture, analytics, GDPR/CCPA basics) -> `privacy-legal`
- **18+ gate + disclaimer copy** -> `commercial-legal` / `product-legal`
- **Marketing-claims sanity check** (don't over-promise) -> `product-legal`
- (Counsel is NOT required for a waitlist - it becomes required before any real explicit/UGC launch.)

## 4. The funnel to instrument
`ad impression -> click -> landing page view -> age gate -> waitlist signup -> (optional) pre-commit`

Content-free events: `ad_click` (channel, campaign), `landing_view`, `age_gate_pass`, `waitlist_signup`, `wedge_section_view`, `precommit_started`, `precommit_completed`.

## 5. Metrics & targets ([SET] real numbers before spend)
- **CAC to signup** = ad spend / waitlist signups, per channel. Primary number.
- **Landing -> signup conversion rate** (page resonates?).
- **Wedge engagement** - do people read/click the "what's different" section? (D2 signal.)
- **Intent to pay** - pre-commit rate among signups, if the paid variant is run (D3).
- **Channel comparison** - CAC by source, to find at least one viable channel.

## 6. Acquisition channels to test (small, capped budgets)
Only channels that accept adult-adjacent advertising - mainstream ad networks (Google/Meta) largely will NOT:
- Adult ad networks (TrafficJunky, ExoClick, etc.).
- Adult/NSFW communities (relevant subreddits, Discord servers) - organic + promoted, per each community's rules.
- Affiliate/creator shout-outs.
- Newsletter/content partnerships in the space.
Track each with a distinct `channel` tag; cap spend per channel [SET].

## 7. Go / no-go (what the result means)
- **Strong signup rate + at least one channel with viable CAC (+ decent pre-commit if tested):** demand is real -> you now have evidence to **fund the minimal explicit MVP** (with its justified adult stack) or **raise capital** for it. Engage counsel THEN.
- **Weak signups or brutal CAC everywhere:** you learned the acquisition economics don't work - for a few hundred dollars instead of the full build. Pivot or stop.
- **Ambiguous:** iterate the positioning/wedge copy once and re-measure.

## 8. A/B tests worth running on the page (cheap, high-signal)
- **Wedge framing:** "characters that remember you" vs. "creators earn from characters" vs. "your story becomes a chat" - which drives signups? Directly tests D2.
- **Positioning intensity:** how explicit the positioning is vs. signup rate (also informs later compliance posture).

## 9. Budget & decision (no endless test)
- Total test budget [SET] (target: a few hundred dollars).
- Minimum signups before reading results [SET] (avoid noise).
- Hard decision date [SET].

## 10. What happens after a GO
Only then does the full plan re-activate, in order: engage scoped counsel -> stand up age verification + Segpay + moderation gate + model gateway (Exec Doc 2/3) -> build the Phase 0 paid MVP (Exec Doc 1). The demand evidence is what justifies (and funds) that spend.

## 11. Open [SET] items
Landing copy + wedge variants; whether to run the paid pre-commit; analytics tool; per-channel budgets + total cap; CAC/signup targets; minimum sample; decision date.
