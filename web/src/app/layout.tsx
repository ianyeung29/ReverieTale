import type { Metadata } from "next";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "Reverie - Phase 0",
  description: "AI companion with persistent memory (Phase 0 foundation).",
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
  .rv-nav-toggle { display: inline-flex; align-items: center; justify-content: center; }
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
}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
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
      </body>
    </html>
  );
}
