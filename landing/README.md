# Reverie - Demand Validation Landing Page

A self-contained, single-file landing page for the demand-validation test in `exec-0-demand-validation-spec.md`.
It is **non-explicit**: it *describes* an 18+ product, it does not host or generate adult content. That keeps the legal footprint light (a waitlist page, not an adult platform).

"Reverie" is a **placeholder brand name** - swap it for your own throughout `index.html`.

## What it does
- 18+ age gate (click-through, remembered via localStorage).
- Hero with the memory promise + inline waitlist form.
- Three wedge pillars (memory / creators earn / story-to-chat).
- Optional "I'd pay for early access" checkbox = a free intent-to-pay signal (no money taken).
- Content-free analytics stubs and a headline A/B by URL.

## 1. Wire the waitlist form
Open `index.html`, find `var FORM_ENDPOINT = ""` near the bottom and set it to a form/email service endpoint. Cheap options that need no backend:
- Formspree, Buttondown, ConvertKit, Mailchimp embedded form, or Google Forms.
Leaving it empty still "works" (shows the success state) - useful for previewing, but it won't capture emails until you set it.

## 2. Wire analytics
In the `track()` function, forward events to your analytics (self-hosted **PostHog** or **Plausible** recommended for privacy). Keep events **content-free** (no names/emails in event props). Events emitted:
`landing_view`, `age_gate_pass`, `wedge_section_view`, `waitlist_signup` (with `variant` and `intent_to_pay`).

## 3. A/B the wedge (this is the point of the test)
The headline + subhead swap by URL param so you can test which framing converts:
- `/?v=memory`   - "She remembers every word."
- `/?v=creators` - "Create her. Others pay to meet her."
- `/?v=story`    - "Every story becomes a conversation."
Point each ad campaign at a different `?v=` and compare signup rate. `variant` rides on every event.

## 4. Deploy (free tiers, adult-friendly hosts)
It's one static file - deploy anywhere:
- **Cloudflare Pages**, **Netlify**, or **Vercel** (drag-drop or connect the repo; serve the `landing/` folder).
- Point your domain at it.
Note: choose an **adult-permitting** host/CDN (Cloudflare is fine for a non-explicit page like this).

## 5. Legal copy (draft with the legal plugins)
The footer links `/terms.html` and `/privacy.html` are placeholders. Draft them locally with the `claude-for-legal` plugins:
- Terms of Service  -> `commercial-legal`
- Privacy policy (email capture + analytics; GDPR/CCPA) -> `privacy-legal`
- 18+ gate + disclaimer wording -> `commercial-legal` / `product-legal`
- Marketing-claims sanity check (don't over-promise) -> `product-legal`
Counsel is **not** required for a waitlist page. It becomes required before any real explicit/UGC launch.

## 6. Run the test
Set budgets/targets/decision-date (`exec-0` section 9), run capped ads on adult-friendly channels (mainstream ad networks will reject this), and read CAC-to-signup by channel + the A/B result. Go/no-go per `exec-0` section 7.
