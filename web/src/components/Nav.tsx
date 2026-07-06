"use client";

import { useEffect, useState } from "react";

export const NAV_H = 52;

type Me = { email?: string; isAdmin?: boolean; pendingReviews?: number } | null;

export function Nav() {
  const [me, setMe] = useState<Me>(null);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setMe(d.user ?? null)).catch(() => {});
  }, []);

  return (
    <nav style={S.nav}>
      <a href="/" style={S.brand}>Reverie</a>
      <div style={S.links}>
        <a href="/browse" style={S.link}>Browse</a>
        <a href="/create" style={S.link}>Create</a>
        <a href="/characters" style={S.link}>Companions</a>
        <a href="/library" style={S.link}>Stories</a>
        <a href="/chat" style={S.link}>Chat</a>
        {me?.isAdmin ? (
          <a href="/admin/review" style={S.review}>
            Review{me.pendingReviews ? <span style={S.count}>{me.pendingReviews}</span> : null}
          </a>
        ) : null}
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
    overflowX: "auto",
  },
  brand: { fontFamily: "Georgia, serif", fontSize: 19, color: "#F4EAF0", textDecoration: "none", fontWeight: 600, whiteSpace: "nowrap" },
  links: { display: "flex", alignItems: "center", gap: 16, marginLeft: "auto" },
  link: { color: "#AC9CB0", textDecoration: "none", fontSize: 14, fontWeight: 500, whiteSpace: "nowrap" },
  review: { color: "#E9A06B", textDecoration: "none", fontSize: 14, fontWeight: 650, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 6 },
  count: { background: "#D46A8B", color: "#1A1220", borderRadius: 999, padding: "1px 7px", fontSize: 12, fontWeight: 700 },
};
