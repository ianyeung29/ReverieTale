"use client";

import { useEffect, useMemo, useState } from "react";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { StarRating } from "@/components/StarRating";

type Story = {
  id: string; title: string; characterId: string; characterName: string;
  genre: string; tone: string; snippet: string; chapters: number;
  reads: number; rating: number; ratingCount: number; createdAt: string;
};
type Sort = "newest" | "read" | "rated";

export default function StoriesPage() {
  const [items, setItems] = useState<Story[]>([]);
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState("");
  const [sort, setSort] = useState<Sort>("newest");

  useEffect(() => {
    fetch("/api/stories").then((r) => r.json()).then((d: Story[]) => setItems(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  // Genres present, most common first, for the filter row.
  const genres = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of items) if (s.genre) counts.set(s.genre, (counts.get(s.genre) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([g]) => g);
  }, [items]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = items.filter((s) => {
      const matchesText = !needle || s.title.toLowerCase().includes(needle) || s.characterName.toLowerCase().includes(needle) || s.snippet.toLowerCase().includes(needle);
      const matchesGenre = !genre || s.genre.toLowerCase() === genre.toLowerCase();
      return matchesText && matchesGenre;
    });
    list = list.slice().sort((a, b) => {
      if (sort === "read") return b.reads - a.reads || b.rating - a.rating;
      if (sort === "rated") return b.rating - a.rating || b.ratingCount - a.ratingCount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return list;
  }, [items, q, genre, sort]);

  return (
    <main style={S.wrap}>
      <p style={S.eyebrow}>Stories</p>
      <h1 style={S.h1}>Find a story to fall into</h1>
      <p style={S.sub}>Browse what the community has written. Reading is always free — pick up any story and steer where it goes next. <a href="/browse" style={S.crossLink}>Browse companions →</a></p>

      <div style={S.controls}>
        <input style={S.search} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title, companion, or text…" />
        <div style={S.sortWrap}>
          <button className="rv-chip" style={{ ...S.sortBtn, ...(sort === "newest" ? S.sortOn : {}) }} onClick={() => setSort("newest")}>Newest</button>
          <button className="rv-chip" style={{ ...S.sortBtn, ...(sort === "read" ? S.sortOn : {}) }} onClick={() => setSort("read")}>Most read</button>
          <button className="rv-chip" style={{ ...S.sortBtn, ...(sort === "rated" ? S.sortOn : {}) }} onClick={() => setSort("rated")}>Top rated</button>
        </div>
      </div>

      {genres.length ? (
        <div style={S.genreRow}>
          <button className="rv-chip" style={{ ...S.genre, ...(genre === "" ? S.genreOn : {}) }} onClick={() => setGenre("")}>All genres</button>
          {genres.map((g) => (
            <button key={g} className="rv-chip" style={{ ...S.genre, ...(genre === g ? S.genreOn : {}) }} onClick={() => setGenre(g === genre ? "" : g)}>{g}</button>
          ))}
        </div>
      ) : null}

      {items.length === 0 ? (
        <p style={S.empty}>No stories yet. <a href="/story" style={S.reset}>Begin the first →</a></p>
      ) : shown.length === 0 ? (
        <p style={S.empty}>No stories match. <button style={S.reset} onClick={() => { setQ(""); setGenre(""); }}>Reset filters</button></p>
      ) : (
        <div style={S.grid}>
          {shown.map((s) => (
            <a key={s.id} href={`/story/${s.id}`} className="rv-card" style={S.card}>
              <div style={S.head}>
                <CharacterAvatar characterId={s.characterId} name={s.characterName} size={40} />
                <div style={S.headText}>
                  <div style={S.title}>{s.title}</div>
                  <span style={S.with}>with {s.characterName}</span>
                </div>
              </div>
              <p style={S.snip}>{s.snippet}…</p>
              {s.genre ? <div style={S.tagRow}><span style={S.tag}>{s.genre}</span>{s.tone ? <span style={S.tag}>{s.tone}</span> : null}</div> : null}
              <div style={S.meta}>
                {s.chapters} chapter{s.chapters === 1 ? "" : "s"} · {s.reads} view{s.reads === 1 ? "" : "s"}
                {s.ratingCount ? <> · <StarRating value={s.rating} count={s.ratingCount} size={12} showNumber={false} /> {s.rating.toFixed(1)}</> : null}
              </div>
            </a>
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
  sub: { color: "#AC9CB0", margin: "0 0 24px", maxWidth: 560 },
  crossLink: { color: "#E9A06B", textDecoration: "none", fontWeight: 600, whiteSpace: "nowrap" },
  controls: { display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 14 },
  search: { flex: "1 1 260px", background: "#1A121F", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 11, padding: "12px 15px", fontSize: 15 },
  sortWrap: { display: "flex", gap: 6, background: "#1A121F", border: "1px solid #3A2E44", borderRadius: 11, padding: 4 },
  sortBtn: { background: "transparent", color: "#AC9CB0", border: 0, borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13.5, fontWeight: 600 },
  sortOn: { background: "#2E2136", color: "#F4EAF0" },
  genreRow: { display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 26 },
  genre: { fontSize: 12.5, color: "#CBBBD0", background: "#231A2B", border: "1px solid #3A2E44", borderRadius: 999, padding: "6px 12px", cursor: "pointer", textTransform: "capitalize" },
  genreOn: { background: "linear-gradient(100deg,#E9A06B,#D46A8B)", color: "#1A1220", border: "1px solid transparent", fontWeight: 650 },
  empty: { color: "#AC9CB0" },
  reset: { background: "transparent", color: "#E9A06B", border: 0, cursor: "pointer", fontSize: 15, textDecoration: "underline" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 18 },
  card: { background: "#241B2D", border: "1px solid #3A2E44", borderRadius: 16, padding: 18, display: "flex", flexDirection: "column", gap: 10, textDecoration: "none", color: "#F4EAF0" },
  head: { display: "flex", alignItems: "center", gap: 11 },
  headText: { display: "flex", flexDirection: "column", gap: 2, minWidth: 0 },
  title: { fontFamily: "Georgia, serif", fontSize: 19, lineHeight: 1.2 },
  with: { color: "#E9A06B", fontSize: 12.5 },
  snip: { color: "#AC9CB0", fontSize: 14, margin: 0, lineHeight: 1.5 },
  tagRow: { display: "flex", flexWrap: "wrap", gap: 6 },
  tag: { fontSize: 11, color: "#E9A06B", border: "1px solid #4a3a50", borderRadius: 999, padding: "2px 9px", textTransform: "capitalize" },
  meta: { color: "#8A7A90", fontSize: 12.5, marginTop: "auto", display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap", fontVariantNumeric: "tabular-nums" },
};
