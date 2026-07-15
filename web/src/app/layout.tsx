import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { MobileNav } from "@/components/MobileNav";
import { JsonLd } from "@/components/JsonLd";
import { CookieConsent } from "@/components/CookieConsent";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { SITE_URL } from "@/lib/site";

const SITE_DESC =
  "Explore 13+ interactive stories, meet original characters, and continue the conversation after the scene ends.";
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ReverieTale — Interactive stories and AI characters",
    template: "%s · ReverieTale",
  },
  description: SITE_DESC,
  applicationName: "ReverieTale",
  category: "Interactive fiction",
  keywords: ["interactive fiction", "interactive stories", "AI characters", "character chat", "story games", "original characters", "teen fiction"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "ReverieTale",
    title: "ReverieTale — Interactive stories and AI characters",
    description: SITE_DESC,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "ReverieTale — Interactive stories and AI characters",
    description: SITE_DESC,
  },
  robots: { index: true, follow: true },
  referrer: "origin-when-cross-origin",
  // Google Search Console ownership verification (this token is public - it's
  // meant to be embedded in the page). Override via GOOGLE_SITE_VERIFICATION.
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION || "Oh45qBmntmTRq3ahKHL7KaEJ4wKedwEdUyEJ_nragbc" },
};

// Shared motion/hover/focus utilities used across pages (inline styles can't do
// :hover/:focus-visible). Cards/chips/buttons deliberately look distinct from
// each other here - cards read as raised panels at rest, chips are flat pills
// that light up on interaction, buttons get a visible press/hover response -
// so the eye doesn't have to work to tell them apart.
const GLOBAL_CSS = `
@keyframes rvShimmer { to { background-position: 200% center; } }
@keyframes rvUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
.rv-title { background: linear-gradient(100deg,#F4EAF0 8%,#E9A06B 38%,#D46A8B 58%,#F4EAF0 88%); background-size: 200% auto; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; animation: rvShimmer 7s linear infinite; }
.rv-reveal { animation: rvUp .6s cubic-bezier(.2,.7,.2,1) both; }
.rv-d1 { animation-delay: .06s; } .rv-d2 { animation-delay: .14s; } .rv-d3 { animation-delay: .22s; }

/* Cards: raised at rest (not just on hover), lift further + brighten border on hover. */
.rv-card { box-shadow: 0 1px 0 rgba(255,255,255,.02) inset, 0 10px 24px rgba(0,0,0,.22); transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease; }
.rv-card:hover { transform: translateY(-4px); border-color: #5a4560; box-shadow: 0 1px 0 rgba(255,255,255,.03) inset, 0 16px 40px rgba(0,0,0,.45); }

/* Buttons: obvious press/hover feedback. */
.rv-btn { transition: transform .15s ease, filter .15s ease, box-shadow .15s ease, border-color .15s ease; }
.rv-btn:hover { transform: translateY(-2px); filter: brightness(1.07); }
.rv-btn:active { transform: translateY(0); filter: brightness(0.97); }
.rv-btn-primary:hover { box-shadow: 0 12px 28px rgba(212,106,139,.38); }

/* Chips/tags: flat pills that only light up on interaction, so they read as
   lighter-weight than a real button even though both are pill-shaped. */
.rv-chip { transition: background-color .12s ease, border-color .12s ease, color .12s ease, transform .12s ease; }
.rv-chip:hover { border-color: #6a5570; color: #F4EAF0; }
.rv-chip:active { transform: scale(.97); }

/* Keyboard focus: one visible, on-brand ring everywhere, replacing the
   browser default so it doesn't clash with the dark theme. */
a:focus-visible, button:focus-visible, input:focus-visible, textarea:focus-visible, [tabindex]:focus-visible {
  outline: 2px solid #E9A06B; outline-offset: 2px; border-radius: 4px;
}

@media (prefers-reduced-motion: reduce) { .rv-reveal, .rv-title { animation: none; } .rv-card:hover, .rv-btn:hover, .rv-chip:hover { transform: none; } }

/* Nav: a real collapsing mobile menu instead of a horizontally-scrolling row.
   Layout lives entirely in these classes (not inline styles) so the mobile
   override below can actually win - an inline style attribute always beats a
   stylesheet rule of any specificity, media query or not. */
.rv-nav-toggle { display: none; }
.rv-nav-links { display: flex; align-items: center; gap: 16px; margin-left: auto; overflow-x: auto; }
@media (max-width: 760px) {
  .rv-nav-toggle { display: inline-flex; align-items: center; justify-content: center; width: 32px !important; height: 32px !important; font-size: 14px !important; }
  .rv-title { font-size: 16px !important; }
  .rv-nav-links { display: none; }
  .rv-nav-links.rv-nav-open {
    display: flex; flex-direction: column; align-items: stretch; gap: 2px;
    position: absolute; top: 100%; left: 0; right: 0;
    background: #150F1A; border-bottom: 1px solid #2a2033;
    padding: 6px 20px 16px; box-shadow: 0 20px 40px rgba(0,0,0,.5);
  }
  .rv-nav-links.rv-nav-open a, .rv-nav-links.rv-nav-open button { width: 100%; box-sizing: border-box; }
  .rv-nav-links.rv-nav-open a { padding: 12px 4px; border-bottom: 1px solid #241a2b !important; }
  .rv-nav-links.rv-nav-open > :last-child { border-bottom: 0; }

  /* The nav collapses at 760px, so the home lead needs to become compact at
     the same point. This also covers desktop windows used at a larger zoom. */
  .rv-home { padding: 24px 18px 28px !important; }
  .rv-home-hero { margin-top: 20px !important; }
  .rv-home-hero h1 { font-size: 30px !important; line-height: 1.08 !important; margin: 8px 0 10px !important; }
  .rv-home-hero > p:not(:first-child) { font-size: 15px !important; line-height: 1.48 !important; }
  .rv-home-hero-cta { gap: 10px !important; margin-top: 16px !important; }
  .rv-home-hero-cta .rv-btn { padding: 10px 14px !important; border-radius: 10px !important; min-height: 0 !important; font-size: 13.5px !important; }
  .rv-home-hero-cta a:not(.rv-btn) { font-size: 13.5px !important; }
}

/* Character-create wizard: stacked on narrow screens, form + sticky live
   preview side-by-side on wide ones. */
.rv-wizard-grid { grid-template-columns: 1fr; }
@media (min-width: 860px) {
  .rv-wizard-grid { grid-template-columns: 1fr 300px; }
}

/* Character profile hero: portrait beside details on wide screens, stacked
   (portrait on top, capped width) on narrow ones. */
.rv-profile-head { flex-direction: row; }
.rv-profile-portrait { width: 148px; }
@media (max-width: 560px) {
  .rv-profile-head { flex-direction: column; }
  .rv-profile-portrait { width: min(280px, 78vw); max-width: 100%; align-self: center; }
}

/* Edit-mode collapsible sections: a chevron that rotates on [open] - state
   that lives on the <details> element itself, not in React, so it can only
   be styled from a real stylesheet rule (an inline style has no way to
   express an attribute selector like [open] at all). */
.rv-section { background: #241B2D; border: 1px solid #3A2E44; border-radius: 14px; margin-bottom: 14px; overflow: hidden; }
.rv-section > summary {
  list-style: none; cursor: pointer; padding: 16px 18px;
  display: flex; align-items: center; justify-content: space-between;
  font-family: Georgia, serif; font-size: 16px; color: #F4EAF0;
}
.rv-section > summary::-webkit-details-marker { display: none; }
.rv-section > summary::after { content: "⌄"; color: #8A7A90; font-size: 18px; transition: transform .15s ease; }
.rv-section[open] > summary::after { transform: rotate(180deg); }
.rv-section > summary:hover { background: #2a2033; }
.rv-section-body { padding: 2px 18px 18px; }

/* Story reader companion rail: a sticky portrait beside the article, only
   where there's actually room for it beside a comfortable reading column. */
.rv-reader-rail { display: none; }
@media (min-width: 1180px) {
  .rv-reader-rail { display: flex; }
}

/* Chat dock trigger: a small pill bottom-right on wide screens (position/size
   set here, not inline, so the mobile override below can actually win - see
   the nav note above for why). On narrow screens it becomes a full-width
   sticky bar instead, so the companion is always a thumb-reach away. */
.rv-chatdock-fab {
  position: fixed; right: 20px; bottom: 20px; z-index: 40;
  display: flex; align-items: center; gap: 10px;
  background: #231A2B; color: #F4EAF0; border: 1px solid #4a3a50; border-radius: 999px;
  padding: 8px 16px 8px 8px; cursor: pointer; box-shadow: 0 10px 30px rgba(0,0,0,.4);
  font-size: 14px; font-weight: 600;
}
@media (max-width: 640px) {
  .rv-chatdock-fab {
    left: 0; right: 0; bottom: 0; width: 100%; box-sizing: border-box;
    border-radius: 0; border-width: 1px 0 0; justify-content: flex-start;
    padding: 12px 18px; box-shadow: 0 -8px 24px rgba(0,0,0,.35);
  }
}

/* Open chat panel position lives here (not inline) so the mobile override can
   lift it clear of the bottom nav - an inline style would always win. */
.rv-chatdock-panel { bottom: 20px; }

/* Story-moment tile grid: two columns on phones (the Emochi-style editorial
   look), more as the viewport grows. */
.rv-tile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (min-width: 620px) { .rv-tile-grid { grid-template-columns: repeat(3, 1fr); gap: 14px; } }
@media (min-width: 900px) { .rv-tile-grid { grid-template-columns: repeat(4, 1fr); gap: 16px; } }

/* Companion discovery uses the same image-forward density as story moments:
   enough portrait presence to create curiosity without turning mobile into an
   endless column of desktop cards. */
.rv-companion-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
@media (min-width: 620px) { .rv-companion-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; } }
@media (min-width: 920px) { .rv-companion-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; } }
@media (max-width: 560px) {
  /* Story creation needs a compact lead-in on narrow or zoomed layouts: the
     character picker should arrive quickly, not below a billboard-sized title. */
  .rv-story-start { padding: 18px 16px 68px !important; }
  .rv-story-start-title { font-size: 28px !important; line-height: 1.08 !important; margin: 5px 0 7px !important; }
  .rv-story-start-sub { font-size: 14px !important; line-height: 1.45 !important; margin-bottom: 8px !important; }
  .rv-story-start-character-section { margin-top: 14px !important; }
  .rv-story-start-cards { gap: 10px !important; }
  .rv-home-hero .rv-btn { padding: 11px 16px !important; border-radius: 10px !important; }
  .rv-character-card { border-radius: 12px !important; }
  .rv-character-card-media > div { border-radius: 11px !important; }
  .rv-character-card-media-text { padding: 10px !important; gap: 4px !important; }
  .rv-character-card-media-text > div:first-child { font-size: 17px !important; }
  .rv-character-card-media-text span { font-size: 10px !important; padding: 2px 7px !important; }
  .rv-character-card-body { padding: 10px !important; min-height: 0 !important; }
  .rv-character-card-copy, .rv-character-card-meta { display: none !important; }
}

/* Home discovery: compact mobile hierarchy. The primary action stays easy to
   reach without becoming a full-width banner, while the spotlight becomes one
   focused character moment instead of a squeezed desktop layout. */
@media (max-width: 560px) {
  .rv-home { padding: 24px 16px 24px !important; }
  .rv-home-hero h1 { font-size: 28px !important; line-height: 1.08 !important; margin: 8px 0 10px !important; }
  .rv-home-hero > p:not(:first-child) { font-size: 14px !important; line-height: 1.48 !important; }
  .rv-home-hero-cta { gap: 10px !important; margin-top: 18px !important; }
  .rv-home-hero-cta .rv-btn { display: inline-flex; align-items: center; justify-content: center; min-height: 42px; }
  .rv-home-spotlight { margin-top: 24px !important; padding: 10px !important; gap: 12px !important; flex-direction: row !important; flex-wrap: nowrap !important; align-items: stretch !important; border-radius: 14px !important; }
  .rv-home-spotlight-portrait { width: 108px !important; min-width: 108px !important; align-self: stretch; }
  .rv-home-spotlight-portrait > div { height: 152px !important; aspect-ratio: auto !important; border-radius: 9px !important; }
  .rv-home-spotlight-body { gap: 5px !important; padding: 2px 2px 2px 0 !important; justify-content: center !important; }
  .rv-home-spotlight-body h2 { font-size: 25px !important; }
  .rv-home-spotlight-body > p { font-size: 13px !important; }
  .rv-home-spotlight-body .rv-home-spotlight-chat { display: none !important; }
  .rv-home-spotlight-body .rv-btn { padding: 11px 15px !important; border-radius: 9px !important; font-size: 13.5px !important; }
  .rv-home-moods > div:first-child { margin-top: 28px !important; }
}

/* Explore: lead with one full scene, then keep the rest of the catalogue dense
   and thumb-friendly. Sorting stays available as a horizontal strip instead of
   expanding into a row of oversized mobile buttons. */
@media (max-width: 680px) {
  .rv-explore { padding: 30px 16px 82px !important; }
  .rv-explore-hero h1 { font-size: 40px !important; }
  .rv-explore-controls { display: grid !important; grid-template-columns: minmax(0, 1fr); }
  .rv-explore-controls input { min-width: 0 !important; width: 100%; box-sizing: border-box; }
  .rv-explore-sort {
    width: 100%; box-sizing: border-box; overflow-x: auto; scrollbar-width: none;
  }
  .rv-explore-sort::-webkit-scrollbar { display: none; }
  .rv-explore-sort button { flex: 0 0 auto; }
  .rv-explore-tags { flex-wrap: nowrap !important; overflow-x: auto; padding: 2px 0 6px; scrollbar-width: none; }
  .rv-explore-tags::-webkit-scrollbar { display: none; }
  .rv-explore-tags button { flex: 0 0 auto; }
  .rv-explore-feature { grid-template-columns: minmax(0, 1fr) !important; min-height: 0 !important; margin-bottom: 28px !important; }
  .rv-explore-feature-media { min-height: 0 !important; }
  .rv-explore-feature-media > div { height: min(82vw, 330px) !important; aspect-ratio: auto !important; }
  .rv-explore-feature-body { padding: 24px 20px 26px !important; }
  .rv-explore-feature-body h2 { font-size: 34px !important; }
  .rv-explore-feature-body p { max-width: none !important; }
  .rv-explore-grid { gap: 12px !important; }
  .rv-explore-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
  .rv-moment-card > div { min-height: 0 !important; }
  .rv-moment-card h2 { font-size: 18px !important; }
  .rv-moment-card p { font-size: 12px !important; }
  .rv-scene-starter-choices:not(.rv-scene-starter-choices-compact) { grid-template-columns: minmax(0, 1fr) !important; }
  .rv-scene-starter-choice { min-height: 0 !important; }
}

/* Mobile bottom navigation: the primary nav on small screens (desktop keeps
   the top bar). Hidden by default, shown only under the mobile breakpoint.
   Create is a raised central action. */
.rv-mobilenav { display: none; }
.rv-mobilenav-item, .rv-mobilenav-center {
  display: flex; flex-direction: column; align-items: center; gap: 3px;
  text-decoration: none; color: #8A7A90; font-size: 10.5px; font-weight: 600;
  flex: 1; padding: 4px 0; min-width: 0;
}
.rv-mobilenav-icon { font-size: 18px; line-height: 1; }
.rv-mobilenav-on { color: #E9A06B; }
.rv-mobilenav-center { color: #E9A06B; }
.rv-mobilenav-center-btn {
  display: flex; align-items: center; justify-content: center;
  width: 42px; height: 42px; margin-top: -19px; border-radius: 50%;
  background: linear-gradient(135deg,#E9A06B,#D46A8B); color: #1A1220;
  font-size: 20px; box-shadow: 0 8px 20px rgba(212,106,139,.45);
}
@media (max-width: 760px) {
  .rv-mobilenav {
    display: flex; align-items: flex-end; justify-content: space-around;
    position: fixed; left: 0; right: 0; bottom: 0; z-index: 45;
    height: 58px; box-sizing: border-box; padding: 6px 6px 8px;
    background: rgba(21,15,26,.97); backdrop-filter: blur(10px);
    border-top: 1px solid #2a2033;
  }
  body { padding-bottom: 58px; }
  .rv-chatdock-fab { bottom: 58px; }
  .rv-chatdock-panel { bottom: 66px; }
  .rv-cookie-consent { bottom: 68px !important; }
}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "ReverieTale",
            url: SITE_URL,
            description: SITE_DESC,
            inLanguage: "en",
            audience: { "@type": "PeopleAudience", suggestedMinAge: 13 },
          }}
        />
      </head>
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          background: "#150F1A",
          color: "#F4EAF0",
        }}
      >
        <Nav />
        {children}
        <MobileNav />
        {GA_MEASUREMENT_ID ? <><CookieConsent /><GoogleAnalytics measurementId={GA_MEASUREMENT_ID} /></> : null}
      </body>
    </html>
  );
}
