"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";

type Item = { id: string; title: string; name: string; chapters: number };

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
        <p style={S.muted}>You haven't created a story yet. <a href="/story" style={S.link}>Begin one →</a><br /><span style={S.hint}>(Sign in first from the chat so your stories are saved to your account.)</span></p>
      ) : (
        <div style={S.grid}>
          {items.map((s) => (
            <a key={s.id} href={`/story/${s.id}`} style={S.card}>
              <div style={S.head}><Avatar name={s.name} size={34} /><div style={S.title}>{s.title}</div></div>
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
