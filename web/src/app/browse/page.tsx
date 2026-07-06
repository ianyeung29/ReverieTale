"use client";

import { useEffect, useMemo, useState } from "react";
import { CharacterAvatar } from "@/components/CharacterAvatar";

type Char = { id: string; name: string; tagline: string; persona: string; tags: string[]; reads: number; stories: number; createdAt: string };
type Sort = "trend" | "newest" | "read";

// Same gravity formula as lib/discovery.trendingScore (kept inline so this client
// component doesn't import the server-only discovery module).
function trending(reads: number, createdAt: string): number {
  const hours = Math.max(0, (Date.now() - new Date(createdAt).getTime()) / 3.6e6);
  return (reads + 1) / Math.pow(hours + 2, 1.5);
}

export default function BrowsePage() {
  const [chars, setChars] = useState<Char[]>([]);
  const [q, setQ] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [sort, setSort] = useState<Sort>("trend");

  useEffect(() => {
    fetch("/api/characters").then((r) => r.json()).then((c: Char[]) => setChars(Array.isArray(c) ? c : [])).catch(() => {});
  }, []);

  // All tags present, most common first, for the filter row.
  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of chars) for (const t of c.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
  }, [chars]);

  function toggleTag(t: string) {
    setActiveTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));
  }

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = chars.filter((c) => {
      const matchesText = !needle || c.name.toLowerCase().includes(needle) || c.persona.toLowerCase().includes(needle) || c.tags.some((t) => t.toLowerCase().includes(needle));
      const matchesTags = activeTags.every((t) => c.tags.includes(t)); // AND across selected tags
      return matchesText && matchesTags;
    });
    list = list.slice().sort((a, b) => {
      if (sort === "read") return b.reads - a.reads || b.stories - a.stories;
      if (sort === "trend") return trending(b.reads, b.createdAt) - trending(a.reads, a.createdAt);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return list;
  }, [chars, q, activeTags, sort]);

  return (
    <main style={S.wrap}>
      <p style={S.eyebrow}>Companions</p>
      <h1 style={S.h1}>Choose who to meet</h1>
      <p style={S.sub}>Everyone here remembers you. Start with a story, or jump straight into a conversation.</p>

      <div style={S.controls}>
        <input style={S.search} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, personality, or tag…" />
        <div style={S.sortWrap}>
          <button style={{ ...S.sortBtn, ...(sort === "trend" ? S.sortOn : {}) }} onClick={() => setSort("trend")}>Trending</button>
          <button style={{ ...S.sortBtn, ...(sort === "newest" ? S.sortOn : {}) }} onClick={() => setSort("newest")}>Newest</button>
          <button style={{ ...S.sortBtn, ...(sort === "read" ? S.sortOn : {}) }} onClick={() => setSort("read")}>Most read</button>
        </div>
      </div>

      {allTags.length ? (
        <div style={S.tagRow}>
          {activeTags.length ? <button style={S.clearTags} onClick={() => setActiveTags([])}>Clear</button> : null}
          {allTags.map((t) => (
            <button key={t} style={{ ...S.filterTag, ...(activeTags.includes(t) ? S.filterTagOn : {}) }} onClick={() => toggleTag(t)}>{t}</button>
          ))}
        </div>
      ) : null}

      {chars.length === 0 ? (
        <p style={S.empty}>No companions have been published yet. <a href="/create" style={S.reset}>Create the first →</a></p>
      ) : shown.length === 0 ? (
        <p style={S.empty}>No companions match. <button style={S.reset} onClick={() => { setQ(""); setActiveTags([]); }}>Reset filters</button></p>
      ) : (
        <div style={S.grid}>
          {shown.map((c) => (
            <div key={c.id} style={S.card}>
              <a href={`/c/${c.id}`} style={S.headLink}>
                <div style={S.head}><CharacterAvatar characterId={c.id} name={c.name} size={48} /><div><div style={S.name}>{c.name}</div><div style={S.tags}>{c.tags.map((t) => <span key={t} style={S.tag}>{t}</span>)}</div></div></div>
              </a>
              <p style={S.persona}>{c.persona}</p>
              <p style={S.tagline}>{c.tagline}</p>
              <div style={S.meta}>{c.reads} read{c.reads === 1 ? "" : "s"} · {c.stories} stor{c.stories === 1 ? "y" : "ies"}</div>
              <div style={S.actions}>
                <a style={S.primary} href={`/story?characterId=${c.id}`}>Begin a story</a>
                <a style={S.secondary} href={`/chat?characterId=${c.id}`}>Chat</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 960, margin: "0 auto", padding: "52px 24px 80px" },
  eyebrow: { letterSpacing: ".2em", textTransform: "uppercase", fontSize: 12, color: "#E9A06B", fontWeight: 700, margin: 0 },
  h1: { fontFamily: "Georgia, serif", fontSize: 44, margin: "10px 0 10px" },
  sub: { color: "#AC9CB0", margin: "0 0 24px" },
  controls: { display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 14 },
  search: { flex: "1 1 260px", background: "#1A121F", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 11, padding: "12px 15px", fontSize: 15 },
  sortWrap: { display: "flex", gap: 6, background: "#1A121F", border: "1px solid #3A2E44", borderRadius: 11, padding: 4 },
  sortBtn: { background: "transparent", color: "#AC9CB0", border: 0, borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13.5, fontWeight: 600 },
  sortOn: { background: "#2E2136", color: "#F4EAF0" },
  tagRow: { display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 26 },
  clearTags: { background: "transparent", color: "#E9A06B", border: 0, cursor: "pointer", fontSize: 13, fontWeight: 600, padding: "4px 6px" },
  filterTag: { fontSize: 12.5, color: "#CBBBD0", background: "#231A2B", border: "1px solid #3A2E44", borderRadius: 999, padding: "6px 12px", cursor: "pointer" },
  filterTagOn: { background: "linear-gradient(100deg,#E9A06B,#D46A8B)", color: "#1A1220", border: "1px solid transparent", fontWeight: 650 },
  empty: { color: "#AC9CB0" },
  reset: { background: "transparent", color: "#E9A06B", border: 0, cursor: "pointer", fontSize: 15, textDecoration: "underline" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 18 },
  card: { background: "#1C1422", border: "1px solid #3A2E44", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 10 },
  headLink: { textDecoration: "none", color: "inherit", display: "block" },
  head: { display: "flex", alignItems: "center", gap: 12 },
  name: { fontFamily: "Georgia, serif", fontSize: 22, color: "#F4EAF0" },
  tags: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 },
  tag: { fontSize: 11, color: "#E9A06B", border: "1px solid #4a3a50", borderRadius: 999, padding: "2px 9px" },
  persona: { color: "#CBBBD0", fontSize: 14.5, margin: 0, lineHeight: 1.5 },
  tagline: { color: "#8A7A90", fontSize: 13.5, margin: 0, fontStyle: "italic" },
  meta: { color: "#8A7A90", fontSize: 12.5, fontVariantNumeric: "tabular-nums" },
  actions: { display: "flex", gap: 10, marginTop: 6 },
  primary: { flex: 1, textAlign: "center", color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", padding: "11px", borderRadius: 10, fontWeight: 650, textDecoration: "none", fontSize: 14 },
  secondary: { flex: 1, textAlign: "center", color: "#F4EAF0", background: "#231A2B", border: "1px solid #3A2E44", padding: "11px", borderRadius: 10, fontWeight: 600, textDecoration: "none", fontSize: 14 },
};
