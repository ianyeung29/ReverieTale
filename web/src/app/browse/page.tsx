"use client";

import { useEffect, useMemo, useState } from "react";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { MomentCard } from "@/components/MomentCard";
import { SceneStarter } from "@/components/SceneStarter";

type Char = {
  id: string;
  name: string;
  tagline: string;
  persona: string;
  greeting: string;
  tags: string[];
  reads: number;
  stories: number;
  rating: number;
  ratingCount: number;
  createdAt: string;
  hasImage?: boolean;
};
type Sort = "trend" | "newest" | "read" | "rated";

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
    fetch("/api/characters")
      .then((r) => r.json())
      .then((c: Char[]) => setChars(Array.isArray(c) ? c : []))
      .catch(() => {});
    const initial = new URLSearchParams(window.location.search).get("q");
    if (initial) setQ(initial);
  }, []);

  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of chars) for (const t of c.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
  }, [chars]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = chars.filter((c) => {
      const matchesText = !needle || c.name.toLowerCase().includes(needle) || c.persona.toLowerCase().includes(needle) || c.tags.some((t) => t.toLowerCase().includes(needle));
      return matchesText && activeTags.every((t) => c.tags.includes(t));
    });
    return list.slice().sort((a, b) => {
      if (sort === "read") return b.reads - a.reads || b.stories - a.stories;
      if (sort === "rated") return b.rating - a.rating || b.ratingCount - a.ratingCount;
      if (sort === "trend") return trending(b.reads, b.createdAt) - trending(a.reads, a.createdAt);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [chars, q, activeTags, sort]);

  function toggleTag(tag: string) {
    setActiveTags((current) => current.includes(tag) ? current.filter((value) => value !== tag) : [...current, tag]);
  }

  const featured = shown[0];

  return (
    <main style={S.wrap} className="rv-explore">
      <section style={S.hero} className="rv-explore-hero">
        <p style={S.eyebrow}>Explore companions</p>
        <h1 style={S.h1}>Find your next scene.</h1>
        <p style={S.sub}>
          Open a short story with someone new, then decide what happens next. {" "}
          <a href="/stories" style={S.crossLink}>Browse all stories &rarr;</a>
        </p>
      </section>

      <div style={S.controls} className="rv-explore-controls">
        <input style={S.search} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, personality, or tag..." />
        <div style={S.sortWrap} className="rv-explore-sort" aria-label="Sort companions">
          <button className="rv-chip" style={{ ...S.sortBtn, ...(sort === "trend" ? S.sortOn : {}) }} onClick={() => setSort("trend")}>Trending</button>
          <button className="rv-chip" style={{ ...S.sortBtn, ...(sort === "newest" ? S.sortOn : {}) }} onClick={() => setSort("newest")}>Newest</button>
          <button className="rv-chip" style={{ ...S.sortBtn, ...(sort === "read" ? S.sortOn : {}) }} onClick={() => setSort("read")}>Most read</button>
          <button className="rv-chip" style={{ ...S.sortBtn, ...(sort === "rated" ? S.sortOn : {}) }} onClick={() => setSort("rated")}>Top rated</button>
        </div>
      </div>

      {allTags.length ? (
        <div style={S.tagRow} className="rv-explore-tags">
          {activeTags.length ? <button className="rv-chip" style={S.clearTags} onClick={() => setActiveTags([])}>Clear</button> : null}
          {allTags.map((tag) => (
            <button key={tag} className="rv-chip" style={{ ...S.filterTag, ...(activeTags.includes(tag) ? S.filterTagOn : {}) }} onClick={() => toggleTag(tag)}>{tag}</button>
          ))}
        </div>
      ) : null}

      {chars.length === 0 ? (
        <p style={S.empty}>No companions have been published yet. <a href="/create" style={S.reset}>Create the first &rarr;</a></p>
      ) : shown.length === 0 ? (
        <p style={S.empty}>No companions match. <button style={S.reset} onClick={() => { setQ(""); setActiveTags([]); }}>Reset filters</button></p>
      ) : (
        <>
          {featured ? (
            <section style={S.feature} className="rv-explore-feature">
              <a href={`/c/${featured.id}`} style={S.featureMedia} className="rv-explore-feature-media" aria-label={`Meet ${featured.name}`}>
                <CharacterAvatar characterId={featured.id} name={featured.name} shape="rect" />
                <div style={S.featureScrim} />
                <span style={S.featureBadge}>Featured scene</span>
              </a>
              <div style={S.featureBody}>
                <p style={S.featureEyebrow}>Start somewhere unexpected</p>
                <h2 style={S.featureName}>{featured.name}</h2>
                <p style={S.featureHook}>{featured.tagline || featured.persona}</p>
                {featured.greeting ? <p style={S.featureQuote}>&ldquo;{featured.greeting}&rdquo;</p> : null}
                <div style={S.featureTags}>
                  {featured.tags.slice(0, 3).map((tag) => <span key={tag} style={S.featureTag}>{tag}</span>)}
                </div>
                <SceneStarter character={featured} compact />
                <div style={S.featureActions}>
                  <a href={`/c/${featured.id}`} style={S.featureLink}>See {featured.name}&apos;s profile &rarr;</a>
                </div>
              </div>
            </section>
          ) : null}

          <div style={S.resultsHead}>
            <p style={S.resultsTitle}>{shown.length > 1 ? "More moments to enter" : "Your moment"}</p>
            <span style={S.resultsCount}>{shown.length} companion{shown.length === 1 ? "" : "s"}</span>
          </div>
          <div style={S.grid} className="rv-companion-grid rv-explore-grid">
            {shown.slice(featured ? 1 : 0).map((c) => <MomentCard key={c.id} character={c} />)}
          </div>
        </>
      )}
    </main>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 1100, margin: "0 auto", padding: "58px 24px 88px" },
  hero: { maxWidth: 690 },
  eyebrow: { letterSpacing: ".2em", textTransform: "uppercase", fontSize: 12, color: "#E9A06B", fontWeight: 700, margin: 0 },
  h1: { fontFamily: "Georgia, serif", fontSize: 52, margin: "10px 0 10px", lineHeight: 1.04 },
  sub: { color: "#AC9CB0", margin: "0 0 28px", maxWidth: 610, fontSize: 16 },
  crossLink: { color: "#E9A06B", textDecoration: "none", fontWeight: 650, whiteSpace: "nowrap" },
  controls: { display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 14 },
  search: { flex: "1 1 280px", background: "#1A121F", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 10, padding: "12px 15px", fontSize: 15 },
  sortWrap: { display: "flex", gap: 4, background: "#1A121F", border: "1px solid #3A2E44", borderRadius: 10, padding: 4 },
  sortBtn: { background: "transparent", color: "#AC9CB0", border: 0, borderRadius: 7, padding: "8px 12px", cursor: "pointer", fontSize: 13, fontWeight: 650, whiteSpace: "nowrap" },
  sortOn: { background: "#2E2136", color: "#F4EAF0" },
  tagRow: { display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 28 },
  clearTags: { background: "transparent", color: "#E9A06B", border: 0, cursor: "pointer", fontSize: 13, fontWeight: 650, padding: "4px 6px" },
  filterTag: { fontSize: 12.5, color: "#CBBBD0", background: "#231A2B", border: "1px solid #3A2E44", borderRadius: 999, padding: "6px 12px", cursor: "pointer", textTransform: "capitalize" },
  filterTagOn: { background: "linear-gradient(100deg,#E9A06B,#D46A8B)", color: "#1A1220", border: "1px solid transparent", fontWeight: 700 },
  empty: { color: "#AC9CB0" },
  reset: { background: "transparent", color: "#E9A06B", border: 0, cursor: "pointer", fontSize: 15, textDecoration: "underline" },
  feature: { display: "grid", gridTemplateColumns: "minmax(250px, .82fr) minmax(0, 1.18fr)", minHeight: 402, background: "#211827", border: "1px solid #433247", borderRadius: 18, overflow: "hidden", margin: "6px 0 34px", boxShadow: "0 18px 46px rgba(0,0,0,.28)" },
  featureMedia: { display: "block", position: "relative", minHeight: 402, textDecoration: "none", color: "inherit", overflow: "hidden" },
  featureScrim: { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(15,10,19,.02), rgba(15,10,19,.52))", pointerEvents: "none" },
  featureBadge: { position: "absolute", top: 14, left: 14, padding: "5px 9px", borderRadius: 999, background: "rgba(21,15,26,.76)", border: "1px solid rgba(244,234,240,.34)", color: "#F4EAF0", fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" },
  featureBody: { display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", padding: "34px 38px", minWidth: 0 },
  featureEyebrow: { color: "#E9A06B", fontSize: 11.5, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", margin: 0 },
  featureName: { fontFamily: "Georgia, serif", fontSize: 40, lineHeight: 1.05, color: "#F4EAF0", margin: "9px 0 10px" },
  featureHook: { color: "#D9CBDE", fontSize: 16, lineHeight: 1.55, maxWidth: 500, margin: 0 },
  featureQuote: { color: "#F4EAF0", fontSize: 15, fontStyle: "italic", lineHeight: 1.5, margin: "18px 0 0", paddingLeft: 12, borderLeft: "2px solid #E9A06B" },
  featureTags: { display: "flex", flexWrap: "wrap", gap: 7, marginTop: 20 },
  featureTag: { color: "#E9A06B", border: "1px solid #5A414F", borderRadius: 999, padding: "3px 10px", textTransform: "capitalize", fontSize: 11.5 },
  featureActions: { display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", marginTop: 25 },
  featurePrimary: { color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", padding: "12px 17px", borderRadius: 9, fontWeight: 700, textDecoration: "none", fontSize: 14 },
  featureLink: { color: "#E9A06B", fontSize: 14, fontWeight: 650, textDecoration: "none" },
  resultsHead: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, margin: "0 0 14px" },
  resultsTitle: { color: "#F4EAF0", fontFamily: "Georgia, serif", fontSize: 24, margin: 0 },
  resultsCount: { color: "#8A7A90", fontSize: 13, whiteSpace: "nowrap" },
  grid: { display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 16 },
  primary: { width: "100%", boxSizing: "border-box", textAlign: "center", color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", padding: "11px", borderRadius: 9, fontWeight: 700, textDecoration: "none", fontSize: 13.5 },
};
