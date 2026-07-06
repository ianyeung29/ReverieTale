"use client";

import { useEffect, useState } from "react";
import { CharacterAvatar } from "@/components/CharacterAvatar";

type Item = { id: string; title: string; name: string; chapters: number; characterId: string };

export default function LibraryPage() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [earned, setEarned] = useState(0);

  useEffect(() => {
    fetch("/api/stories/mine").then((r) => r.json()).then((d: Item[]) => setItems(Array.isArray(d) ? d : [])).catch(() => setItems([]));
    fetch("/api/credits").then((r) => (r.ok ? r.json() : null)).then((d) => d && setEarned(d.earnedFromReaders ?? 0)).catch(() => {});
  }, []);

  return (
    <main style={S.wrap}>
      <a href="/" style={S.back}>← Reverie</a>
      <h1 style={S.h1}>Your stories</h1>
      <p style={S.sub}>Everything you've started - pick up any chapter where you left off.</p>

      {earned > 0 ? (
        <div style={S.earn}>
          <span style={S.earnStar}>★</span>
          <span><b style={S.earnNum}>{earned}</b> credit{earned === 1 ? "" : "s"} earned from readers chatting with your characters.</span>
        </div>
      ) : null}

      {items === null ? (
        <p style={S.muted}>Loading…</p>
      ) : items.length === 0 ? (
        <div style={S.emptyPanel}>
          <div style={S.emptyIcon}>📖</div>
          <p style={S.emptyTitle}>No stories yet</p>
          <p style={S.emptyBody}>Pick a companion and write your first chapter — it&apos;ll live here so you can pick up any time.</p>
          <div style={S.emptyCta}>
            <a href="/story" className="rv-btn rv-btn-primary" style={S.primary}>Begin a story →</a>
            <a href="/browse" className="rv-btn" style={S.secondary}>Browse companions</a>
          </div>
        </div>
      ) : (
        <div style={S.grid}>
          {items.map((s) => (
            <a key={s.id} href={`/story/${s.id}`} className="rv-card" style={S.card}>
              <div style={S.head}><CharacterAvatar characterId={s.characterId} name={s.name} size={34} /><div style={S.title}>{s.title}</div></div>
              <span style={S.meta}>with {s.name} · {s.chapters} chapter{s.chapters === 1 ? "" : "s"}</span>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 820, margin: "0 auto", padding: "44px 24px 90px", lineHeight: 1.6 },
  back: { color: "#8A7A90", textDecoration: "none", fontSize: 14 },
  h1: { fontFamily: "Georgia, serif", fontSize: 40, margin: "22px 0 8px" },
  sub: { color: "#AC9CB0", margin: "0 0 28px" },
  emptyPanel: { textAlign: "center", background: "#1A1420", border: "1px solid #2f2438", borderRadius: 18, padding: "44px 24px" },
  emptyIcon: { fontSize: 34 },
  emptyTitle: { fontFamily: "Georgia, serif", fontSize: 24, margin: "10px 0 6px", color: "#F4EAF0" },
  emptyBody: { color: "#AC9CB0", fontSize: 15, margin: "0 auto 20px", maxWidth: 420 },
  emptyCta: { display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" },
  primary: { color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", padding: "12px 20px", borderRadius: 11, fontWeight: 650, textDecoration: "none", fontSize: 14.5 },
  secondary: { color: "#F4EAF0", background: "#231A2B", border: "1px solid #3A2E44", padding: "12px 18px", borderRadius: 11, fontWeight: 600, textDecoration: "none", fontSize: 14.5 },
  earn: { display: "flex", alignItems: "center", gap: 10, background: "#241826", border: "1px solid #4a3350", borderRadius: 12, padding: "12px 16px", margin: "0 0 24px", color: "#EadFe6", fontSize: 14.5 },
  earnStar: { color: "#D46A8B", fontSize: 18 },
  earnNum: { color: "#E9A06B" },
  muted: { color: "#AC9CB0" },
  hint: { color: "#6f6276", fontSize: 13 },
  link: { color: "#E9A06B" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 },
  card: { display: "flex", flexDirection: "column", gap: 10, background: "#1C1422", border: "1px solid #3A2E44", borderRadius: 14, padding: 16, textDecoration: "none", color: "#F4EAF0" },
  head: { display: "flex", alignItems: "center", gap: 10 },
  title: { fontFamily: "Georgia, serif", fontSize: 17, lineHeight: 1.2 },
  meta: { color: "#8A7A90", fontSize: 12.5 },
};
