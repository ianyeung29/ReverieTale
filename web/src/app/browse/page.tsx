"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";

type Char = { id: string; name: string; tagline: string; persona: string; tags: string[] };

export default function BrowsePage() {
  const [chars, setChars] = useState<Char[]>([]);

  useEffect(() => {
    fetch("/api/characters").then((r) => r.json()).then((c: Char[]) => setChars(Array.isArray(c) ? c : [])).catch(() => {});
  }, []);

  return (
    <main style={S.wrap}>
      <p style={S.eyebrow}>Companions</p>
      <h1 style={S.h1}>Choose who to meet</h1>
      <p style={S.sub}>Everyone here remembers you. Start with a story, or jump straight into a conversation.</p>

      <div style={S.grid}>
        {chars.map((c) => (
          <div key={c.id} style={S.card}>
            <div style={S.head}><Avatar name={c.name} size={48} /><div><div style={S.name}>{c.name}</div><div style={S.tags}>{c.tags.map((t) => <span key={t} style={S.tag}>{t}</span>)}</div></div></div>
            <p style={S.persona}>{c.persona}</p>
            <p style={S.tagline}>{c.tagline}</p>
            <div style={S.actions}>
              <a style={S.primary} href={`/story?characterId=${c.id}`}>Begin a story</a>
              <a style={S.secondary} href={`/chat?characterId=${c.id}`}>Chat</a>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 960, margin: "0 auto", padding: "52px 24px 80px" },
  eyebrow: { letterSpacing: ".2em", textTransform: "uppercase", fontSize: 12, color: "#E9A06B", fontWeight: 700, margin: 0 },
  h1: { fontFamily: "Georgia, serif", fontSize: 44, margin: "10px 0 10px" },
  sub: { color: "#AC9CB0", margin: "0 0 30px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 18 },
  card: { background: "#1C1422", border: "1px solid #3A2E44", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 10 },
  head: { display: "flex", alignItems: "center", gap: 12 },
  name: { fontFamily: "Georgia, serif", fontSize: 22, color: "#F4EAF0" },
  tags: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 },
  tag: { fontSize: 11, color: "#E9A06B", border: "1px solid #4a3a50", borderRadius: 999, padding: "2px 9px" },
  persona: { color: "#CBBBD0", fontSize: 14.5, margin: 0, lineHeight: 1.5 },
  tagline: { color: "#8A7A90", fontSize: 13.5, margin: 0, fontStyle: "italic" },
  actions: { display: "flex", gap: 10, marginTop: 6 },
  primary: { flex: 1, textAlign: "center", color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", padding: "11px", borderRadius: 10, fontWeight: 650, textDecoration: "none", fontSize: 14 },
  secondary: { flex: 1, textAlign: "center", color: "#F4EAF0", background: "#231A2B", border: "1px solid #3A2E44", padding: "11px", borderRadius: 10, fontWeight: 600, textDecoration: "none", fontSize: 14 },
};
