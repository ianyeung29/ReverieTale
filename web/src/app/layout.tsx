import type { Metadata } from "next";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "Reverie - Phase 0",
  description: "AI companion with persistent memory (Phase 0 foundation).",
};

// Shared motion/hover utilities used across pages (inline styles can't do :hover).
const GLOBAL_CSS = `
@keyframes rvShimmer { to { background-position: 200% center; } }
@keyframes rvUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
.rv-title { background: linear-gradient(100deg,#F4EAF0 8%,#E9A06B 38%,#D46A8B 58%,#F4EAF0 88%); background-size: 200% auto; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; animation: rvShimmer 7s linear infinite; }
.rv-reveal { animation: rvUp .6s cubic-bezier(.2,.7,.2,1) both; }
.rv-d1 { animation-delay: .06s; } .rv-d2 { animation-delay: .14s; } .rv-d3 { animation-delay: .22s; }
.rv-card { transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease; }
.rv-card:hover { transform: translateY(-4px); border-color: #5a4560; box-shadow: 0 16px 40px rgba(0,0,0,.4); }
.rv-btn { transition: transform .15s ease, filter .15s ease, box-shadow .15s ease; }
.rv-btn:hover { transform: translateY(-2px); filter: brightness(1.07); }
.rv-btn-primary:hover { box-shadow: 0 12px 28px rgba(212,106,139,.38); }
@media (prefers-reduced-motion: reduce) { .rv-reveal, .rv-title { animation: none; } .rv-card:hover, .rv-btn:hover { transform: none; } }
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
