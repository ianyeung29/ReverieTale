"use client";

import { useState } from "react";

// The Discover search bar: a big field plus a compact filter button. Both hand
// off to /browse (which owns the real search + tag filtering), seeding its
// query from the URL - so the home page stays a fast launch point, not a
// second place we have to keep filtering logic in sync.
export function DiscoverSearch() {
  const [q, setQ] = useState("");
  const go = () => {
    const query = q.trim();
    window.location.href = query ? `/browse?q=${encodeURIComponent(query)}` : "/browse";
  };
  return (
    <div style={S.wrap}>
      <input
        style={S.input}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") go(); }}
        placeholder="Search companions, stories, or a mood…"
        aria-label="Search"
      />
      <a href="/browse" style={S.filter} title="All filters" aria-label="Filters">⚙</a>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { display: "flex", gap: 10, alignItems: "stretch", position: "relative", zIndex: 1, margin: "26px 0 0" },
  input: { flex: 1, minWidth: 0, background: "#1A121F", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 12, padding: "13px 16px", fontSize: 15 },
  filter: { display: "flex", alignItems: "center", justifyContent: "center", width: 48, flexShrink: 0, background: "#231A2B", border: "1px solid #3A2E44", borderRadius: 12, color: "#CBBBD0", fontSize: 18, textDecoration: "none" },
};
