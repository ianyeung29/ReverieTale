"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export const NAV_H = 52;

type Me = { email?: string; isAdmin?: boolean; pendingReviews?: number } | null;

const LINKS = [
  { href: "/browse", label: "Browse" },
  { href: "/stories", label: "Stories" },
  { href: "/create", label: "Create" },
  { href: "/characters", label: "Companions" },
  { href: "/library", label: "My library" },
  { href: "/chat", label: "Chat" },
];

export function Nav() {
  const [me, setMe] = useState<Me>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setMe(d.user ?? null)).catch(() => {});
    // Balance (also refreshes today's free drip). Only returns for signed-in users.
    fetch("/api/credits").then((r) => (r.ok ? r.json() : null)).then((d) => d && setCredits(d.balance?.total ?? 0)).catch(() => {});
  }, []);

  // Close the mobile menu on navigation.
  useEffect(() => { setOpen(false); }, [pathname]);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    window.location.href = "/";
  }

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <nav style={S.nav}>
      <a href="/" className="rv-title" style={S.brand}>ReverieTale</a>

      <button type="button" className="rv-nav-toggle" style={S.toggle} onClick={() => setOpen((v) => !v)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
        {open ? "✕" : "☰"}
      </button>

      <div className={`rv-nav-links${open ? " rv-nav-open" : ""}`}>
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} style={{ ...S.link, ...(isActive(l.href) ? S.linkOn : {}) }}>{l.label}</a>
        ))}
        {me?.isAdmin ? (
          <>
            <a href="/admin/review" style={{ ...S.review, ...(isActive("/admin/review") ? S.linkOn : {}) }}>
              Review{me.pendingReviews ? <span style={S.count}>{me.pendingReviews}</span> : null}
            </a>
            <a href="/admin/media" style={{ ...S.review, ...(isActive("/admin/media") ? S.linkOn : {}) }}>
              Media
            </a>
          </>
        ) : null}
        {credits !== null ? <a href="/credits" style={S.credits} title="Your credit balance — view history">◈ {credits}</a> : null}
        {me ? <a href="/profile" style={{ ...S.link, ...(isActive("/profile") ? S.linkOn : {}) }}>Profile</a> : null}
        {me ? <button type="button" style={S.signOut} onClick={signOut} title={me.email}>Sign out</button> : null}
      </div>
    </nav>
  );
}

const S: Record<string, React.CSSProperties> = {
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 30,
    height: NAV_H,
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    gap: 18,
    padding: "0 20px",
    background: "rgba(21,15,26,.92)",
    backdropFilter: "blur(8px)",
    borderBottom: "1px solid #2a2033",
  },
  brand: { fontFamily: "Georgia, serif", fontSize: 17.5, textDecoration: "none", fontWeight: 700, whiteSpace: "nowrap" },
  toggle: { marginLeft: "auto", background: "transparent", border: "1px solid #3A2E44", color: "#F4EAF0", borderRadius: 8, width: 36, height: 36, fontSize: 16, cursor: "pointer" },
  link: { color: "#AC9CB0", textDecoration: "none", fontSize: 14, fontWeight: 500, whiteSpace: "nowrap", padding: "6px 2px", borderBottom: "2px solid transparent" },
  linkOn: { color: "#F4EAF0", borderBottom: "2px solid #E9A06B" },
  review: { color: "#E9A06B", textDecoration: "none", fontSize: 14, fontWeight: 650, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 2px", borderBottom: "2px solid transparent" },
  count: { background: "#D46A8B", color: "#1A1220", borderRadius: 999, padding: "1px 7px", fontSize: 12, fontWeight: 700 },
  credits: { color: "#E9A06B", fontWeight: 700, fontSize: 14, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", borderLeft: "1px solid #3A2E44", paddingLeft: 16, textDecoration: "none" },
  signOut: { background: "transparent", color: "#8A7A90", border: "1px solid #3A2E44", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap" },
};
