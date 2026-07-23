import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { MobileNav } from "@/components/MobileNav";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { CookieConsent } from "@/components/CookieConsent";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { ReferralCapture } from "@/components/ReferralCapture";
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
@import url('https://fonts.googleapis.com/css2?family=Gloock&family=Onest:wght@400;500;600;700&display=swap');
@keyframes rvShimmer { to { background-position: 200% center; } }
@keyframes rvUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes rvTypingBlink { 0%, 100% { opacity: .35; } 50% { opacity: 1; } }
.rv-typing-indicator { animation: rvTypingBlink 1s ease-in-out infinite; }
.rv-title { color: #E9A06B; }
.rv-reveal { animation: rvUp .6s cubic-bezier(.2,.7,.2,1) both; }
.rv-d1 { animation-delay: .06s; } .rv-d2 { animation-delay: .14s; } .rv-d3 { animation-delay: .22s; }

/* Home: the after-hours character index. The lead is the product itself - one
   companion, one scene, and two next steps - rather than a generic billboard. */
.rv-home.rv-home-index { max-width: 1360px; margin: 0 auto; padding: 24px 28px 68px; color: #F4EAF0; font-family: Onest, system-ui, sans-serif; }
.rv-home-index a { text-decoration: none; }
.rv-home-entry { position: relative; isolation: isolate; min-height: 550px; overflow: hidden; padding: 0; background: #1B1320; border: 1px solid #3A2E44; border-radius: 16px; }
.rv-home-entry-copy { position: relative; z-index: 2; display: flex; width: min(48%, 560px); min-height: 550px; box-sizing: border-box; flex-direction: column; align-items: flex-start; justify-content: center; padding: 58px 34px 58px clamp(28px, 5vw, 76px); }
.rv-home-entry-kicker { width: 100%; display: flex; gap: 16px; color: #E9A06B; font-size: 11px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; }
.rv-home-entry-story-meta { margin: 24px 0 0; color: #E9A06B; font-size: 13px; font-weight: 600; line-height: 1.4; text-transform: capitalize; }
.rv-home-entry-story-meta span { color: #8A7A90; padding: 0 4px; }
.rv-home-entry h1, .rv-home-fallback h1 { max-width: 11ch; margin: 8px 0 0; font-family: Gloock, Georgia, serif; font-size: clamp(34px, 4vw, 44px); font-weight: 400; line-height: 1.02; letter-spacing: 0; color: #F4EAF0; }
.rv-home-entry-hook { max-width: 35ch; margin: 18px 0 0; color: #F4EAF0; font-family: Gloock, Georgia, serif; font-size: 23px; line-height: 1.25; }
.rv-home-entry-quote { max-width: 43ch; margin: 18px 0 0; padding-left: 12px; border-left: 1px solid #D87974; color: #CBBBD0; font-size: 14px; font-style: italic; line-height: 1.5; }
.rv-home-entry-tags { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 18px; }
.rv-home-entry-tags span { border: 1px solid #4A3A50; border-radius: 999px; padding: 4px 9px; color: #CBBBD0; font-size: 11px; line-height: 1; text-transform: capitalize; }
.rv-home-entry-actions { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 24px; }
.rv-home-entry-primary { background: #D87974 !important; color: #150F1A !important; border: 1px solid #D87974 !important; border-radius: 8px !important; padding: 11px 16px !important; font-weight: 700 !important; }
.rv-home-entry-secondary { background: transparent !important; color: #F4EAF0 !important; border: 1px solid #4A3A50 !important; border-radius: 8px !important; padding: 10px 14px !important; font-weight: 600 !important; }
.rv-home-entry-browse { margin-top: 17px; color: #E9A06B; font-size: 12px; font-weight: 700; }
.rv-home-entry-art { position: absolute; z-index: 0; inset: 0; display: grid; overflow: hidden; background: #211827; }
.rv-home-entry-art::before { content: ""; position: absolute; z-index: 1; inset: 0; background: linear-gradient(90deg, #1B1320 0%, rgba(27,19,32,.98) 25%, rgba(27,19,32,.82) 42%, rgba(27,19,32,.26) 64%, rgba(27,19,32,.06) 100%); pointer-events: none; }
.rv-home-entry-art::after { content: ""; position: absolute; z-index: 1; inset: 52% 0 0; background: linear-gradient(180deg, transparent, rgba(21,15,26,.72)); pointer-events: none; }
.rv-home-entry-art-frame, .rv-home-entry-art-frame > div { width: 100%; height: 100%; min-height: inherit; }
.rv-home-entry-art-frame > div { aspect-ratio: auto !important; border-radius: 0 !important; }
.rv-home-entry-art-frame img { border-radius: 0 !important; object-position: center 20% !important; }
.rv-home-entry-caption { position: absolute; z-index: 2; right: 28px; bottom: 24px; display: flex; flex-direction: column; align-items: flex-end; gap: 3px; color: #B9A9BF; font-size: 11px; letter-spacing: .12em; text-transform: uppercase; }
.rv-home-entry-caption strong { color: #F4EAF0; font-family: Gloock, Georgia, serif; font-size: 18px; font-weight: 400; letter-spacing: 0; text-transform: none; }
.rv-home-fallback { padding: 50px 0; border-bottom: 1px solid #3A2E44; }
.rv-home-fallback p { color: #E9A06B; font-size: 11px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; }
.rv-home-fallback .rv-btn { display: inline-block; margin-top: 22px; }
.rv-home-section-head { display: flex; align-items: end; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
.rv-home-section-head p { margin: 0; color: #F4EAF0; font-family: Gloock, Georgia, serif; font-size: 23px; line-height: 1.1; }
.rv-home-section-head span { display: block; max-width: 43ch; margin-top: 5px; color: #9A8AA0; font-size: 12px; line-height: 1.45; }
.rv-home-section-head > a { flex: 0 0 auto; color: #E9A06B; font-size: 12px; font-weight: 700; }
.rv-home-continue, .rv-home-filters, .rv-home-shelf { margin-top: 42px; }
.rv-home-continue-row { display: flex; gap: 18px; overflow-x: auto; padding: 2px 2px 8px; }
.rv-home-continue-item { display: flex; width: 72px; flex: 0 0 auto; flex-direction: column; align-items: center; gap: 5px; color: #F4EAF0; font-size: 12px; font-weight: 700; text-align: center; }
.rv-home-continue-ring { padding: 2px; border: 1px solid #D87974; border-radius: 999px; line-height: 0; }
.rv-home-continue-item small { color: #8A7A90; font-size: 10px; font-weight: 400; }
.rv-home-filter-strip { display: flex; gap: 8px; overflow-x: auto; padding: 2px 0 8px; }
.rv-home-filter { flex: 0 0 auto; border: 1px solid #3A2E44; background: #211827; border-radius: 999px; padding: 7px 11px; color: #CBBBD0; font-size: 12px; text-transform: capitalize; }
.rv-home-filter-current { flex: 0 0 auto; border: 1px solid #E9A06B; background: rgba(233,160,107,.1); border-radius: 999px; padding: 7px 11px; color: #E9A06B; font-size: 12px; font-weight: 700; }
.rv-home-moments { margin-top: 20px; padding-top: 24px; border-top: 1px solid #3A2E44; }
.rv-home-moments .rv-home-section-head { margin-bottom: 14px; }
.rv-home-moments .rv-home-section-head p { font-size: 23px; }
.rv-home-story-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; }
.rv-home-story-grid .rv-card { border-radius: 12px !important; }
.rv-home-community-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.rv-home-community-card { display: flex; min-height: 176px; flex-direction: column; gap: 12px; padding: 15px; border: 1px solid #3A2E44; border-radius: 12px; background: #211827; color: #F4EAF0; transition: border-color .16s ease, transform .16s ease; }
.rv-home-community-card:hover { transform: translateY(-2px); border-color: #6A5570; }
.rv-home-community-top { display: flex; align-items: center; gap: 9px; }
.rv-home-community-top > div { min-width: 0; }
.rv-home-community-top strong { display: block; overflow: hidden; color: #F4EAF0; font-family: Gloock, Georgia, serif; font-size: 17px; font-weight: 400; line-height: 1.15; text-overflow: ellipsis; white-space: nowrap; }
.rv-home-community-top span { display: block; margin-top: 2px; color: #E9A06B; font-size: 11px; }
.rv-home-community-card > p { display: -webkit-box; margin: 0; overflow: hidden; color: #B9A9BF; font-size: 12px; line-height: 1.5; -webkit-box-orient: vertical; -webkit-line-clamp: 3; }
.rv-home-community-meta { display: flex; align-items: center; gap: 4px; margin-top: auto; color: #8A7A90; font-size: 11px; }
.rv-home-empty { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; margin-top: 42px; padding: 24px 0; border-top: 1px solid #3A2E44; }
.rv-home-empty p { margin: 0; color: #F4EAF0; font-family: Gloock, Georgia, serif; font-size: 25px; }
.rv-home-empty > span { max-width: 50ch; color: #B9A9BF; font-size: 14px; }
.rv-home-empty > div { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 8px; }
@media (max-width: 760px) {
  .rv-home.rv-home-index { padding: 18px 16px 40px !important; }
  .rv-home-entry { min-height: min(620px, 148vw); border-radius: 12px; }
  .rv-home-entry-copy { width: 100%; min-height: min(620px, 148vw); justify-content: flex-end; padding: 210px 22px 24px; }
  .rv-home-entry-art { position: absolute; inset: 0; min-height: 0; }
  .rv-home-entry-art::before { background: linear-gradient(180deg, rgba(27,19,32,.08) 0%, rgba(27,19,32,.18) 32%, rgba(27,19,32,.88) 59%, #1B1320 100%); }
  .rv-home-entry-art::after { inset: 68% 0 0; background: linear-gradient(180deg, transparent, rgba(21,15,26,.72)); }
  .rv-home-entry-caption { right: 16px; top: 16px; bottom: auto; }
  .rv-home-entry-art-frame img { object-position: center 15% !important; }
  .rv-home-entry-story-meta { margin-top: 16px; }
  .rv-home-entry h1, .rv-home-fallback h1 { font-size: 34px; }
  .rv-home-entry-hook { margin-top: 10px; font-size: 18px; }
  .rv-home-entry-quote { font-size: 13px; }
  .rv-home-entry-tags { margin-top: 12px; }
  .rv-home-entry-actions { margin-top: 18px; }
  .rv-home-section-head { align-items: flex-start; }
  .rv-home-section-head p { font-size: 20px; }
  .rv-home-story-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .rv-home-community-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
}
@media (max-width: 480px) {
  .rv-home.rv-home-index { padding: 18px 14px 32px !important; }
  .rv-home-entry { min-height: 565px; }
  .rv-home-entry-copy { min-height: 565px; padding: 195px 18px 20px; }
  .rv-home-entry h1, .rv-home-fallback h1 { font-size: 30px; }
  .rv-home-entry-hook { font-size: 18px; }
  .rv-home-entry-actions { width: 100%; }
  .rv-home-entry-actions .rv-btn { flex: 1 1 auto; text-align: center; }
  .rv-home-section-head { gap: 10px; }
  .rv-home-section-head span { font-size: 11px; }
  .rv-home-section-head > a { font-size: 11px; }
  .rv-home-continue, .rv-home-filters, .rv-home-shelf { margin-top: 30px; }
  .rv-home-community-grid { grid-template-columns: 1fr; }
}

/* Scrollbars are part of the interface on desktop: keep their contrast useful
   while carrying the same dark-plum and warm-accent palette as the app. */
:root { scrollbar-color: #8B5B74 #120D16; scrollbar-width: thin; }
* { scrollbar-color: #8B5B74 #120D16; scrollbar-width: thin; }
::-webkit-scrollbar { width: 12px; height: 12px; }
::-webkit-scrollbar-track { background: #120D16; border: 1px solid #241A2B; }
::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #B67481, #7A506B);
  border: 3px solid #120D16;
  border-radius: 999px;
  min-height: 40px;
}
::-webkit-scrollbar-thumb:hover { background: linear-gradient(180deg, #E9A06B, #D46A8B); }
::-webkit-scrollbar-corner { background: #120D16; }
@media (pointer: coarse) {
  ::-webkit-scrollbar { width: 7px; height: 7px; }
  ::-webkit-scrollbar-thumb { border-width: 2px; }
}

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

/* Desktop chat: a return-to-conversation rail at left and a veiled portrait
   stage at right. The message column stays deliberately narrow and opaque
   enough to preserve comfortable reading. */
.rv-chat-rail, .rv-chat-stage-art { display: none; }
@media (min-width: 920px) {
  .rv-chat-shell { display: grid !important; grid-template-columns: 286px minmax(0, 1fr); max-width: none !important; }
  .rv-chat-rail { display: flex; position: sticky; top: 52px; align-self: start; height: calc(100dvh - 52px); box-sizing: border-box; min-height: 0; flex-direction: column; gap: 14px; padding: 18px 14px; background: #120D16; border-right: 1px solid #2A2033; }
  .rv-chat-main { min-width: 0; min-height: calc(100dvh - 52px); overflow: visible !important; }
  .rv-chat-head > div:first-child > button + button, .rv-chat-history { display: none !important; }
  .rv-chat-stage-art { display: block; position: fixed; top: 72px; right: 0; bottom: 0; z-index: 0; width: min(42vw, 520px); opacity: .56; pointer-events: none; filter: saturate(.92) contrast(.96); }
  .rv-chat-stage-art::after { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, #150F1A 0%, rgba(21,15,26,.78) 28%, rgba(21,15,26,.1) 72%, #150F1A 100%); }
  .rv-chat-stage-art > img { width: 100%; height: 100%; object-fit: contain; object-position: right bottom; display: block; }
  .rv-chat-head { position: relative; z-index: 1; background: rgba(21,15,26,.82); backdrop-filter: blur(12px); }
  .rv-chat-feed { position: relative; z-index: 1; width: min(720px, 66%) !important; max-width: none !important; align-self: flex-start; margin-left: clamp(22px, 6vw, 104px); box-sizing: border-box; }
  .rv-chat-bar-wrap { position: relative; z-index: 1; width: min(760px, 70%); margin-left: clamp(22px, 6vw, 104px); box-sizing: border-box; background: linear-gradient(90deg, rgba(21,15,26,.95), rgba(21,15,26,.72)); }
  .rv-chat-rail-item:hover { background: #211827 !important; border-color: #4A3A50 !important; }
}

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

/* Supporting navigation is shared across the app, not only the home feed. */
.rv-site-footer {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px;
  max-width: 1100px; margin: 0 auto; padding: 22px 24px 28px;
  box-sizing: border-box; border-top: 1px solid #241A2B;
  color: #6f6276; font-size: 13px;
}
.rv-site-footer-links { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 16px; }
.rv-site-footer-links a { color: #8A7A90; text-decoration: none; }
.rv-site-footer-links a:hover { color: #E9A06B; }
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
  .rv-site-footer { margin: 0 16px; padding: 20px 0 26px; align-items: flex-start; flex-direction: column; }
  .rv-site-footer-links { justify-content: flex-start; gap: 10px 14px; }
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
        <ReferralCapture />
        <SiteFooter />
        <MobileNav />
        {GA_MEASUREMENT_ID ? <><CookieConsent /><GoogleAnalytics measurementId={GA_MEASUREMENT_ID} /></> : null}
      </body>
    </html>
  );
}
