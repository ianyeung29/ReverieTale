"use client";

import { useEffect, useState } from "react";

type Char = { id: string; name: string; tagline: string };

const TONES = ["sweet", "playful", "mysterious", "adventurous", "cozy", "bittersweet"];

export default function StoryPage() {
  const [chars, setChars] = useState<Char[]>([]);
  const [charId, setCharId] = useState("");
  const [setting, setSetting] = useState("");
  const [tone, setTone] = useState("");
  const [busy, setBusy] = useState(false);
  const [story, setStory] = useState<{ id: string; title: string; content: string } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/characters").then((r) => r.json()).then((c: Char[]) => {
      setChars(c);
      if (c[0]) setCharId(c[0].id);
    }).catch(() => {});
  }, []);

  async function generate() {
    if (!charId || busy) return;
    setBusy(true);
    setError("");
    setStory(null);
    try {
      const res = await fetch("/api/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId: charId, setting: setting.trim() || undefined, tone: tone || undefined }),
      });
      const d = await res.json();
      if (res.ok && d.content) setStory({ id: d.storyId, title: d.title, content: d.content });
      else setError(d.error === "blocked" ? "That prompt isn't allowed." : d.error || "Something went wrong.");
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  }

  const active = chars.find((c) => c.id === charId);

  return (
    <main style={S.wrap}>
      <p style={S.eyebrow}>Begin a story</p>
      <h1 style={S.h1}>Meet someone new</h1>
      <p style={S.sub}>Pick a character and a mood. We'll write your first chapter together - then you can step in and talk to them.</p>

      <div style={S.controls}>
        <label style={S.field}>
          <span style={S.label}>Character</span>
          <select value={charId} onChange={(e) => setCharId(e.target.value)} style={S.select}>
            {chars.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label style={S.field}>
          <span style={S.label}>Mood</span>
          <select value={tone} onChange={(e) => setTone(e.target.value)} style={S.select}>
            <option value="">(any)</option>
            {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label style={{ ...S.field, flex: "1 1 100%" }}>
          <span style={S.label}>Setting (optional)</span>
          <input value={setting} onChange={(e) => setSetting(e.target.value)} placeholder="a rainy rooftop, a quiet bookshop at closing…" style={S.input} />
        </label>
      </div>

      <button style={{ ...S.cta, opacity: busy ? 0.6 : 1 }} onClick={generate} disabled={busy || !charId}>
        {busy ? "Writing…" : "Write my first chapter"}
      </button>
      {error ? <p style={S.err}>{error}</p> : null}

      {story ? (
        <article style={S.story}>
          <h2 style={S.storyTitle}>{story.title}</h2>
          {story.content.split(/\n{2,}/).map((p, i) => <p key={i} style={S.para}>{p}</p>)}
          <a style={S.chatBtn} href={`/chat?characterId=${charId}&fromStory=${story.id}`}>
            Now talk to {active?.name ?? "them"} →
          </a>
        </article>
      ) : null}
    </main>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 680, margin: "0 auto", padding: "56px 24px 80px", lineHeight: 1.6 },
  eyebrow: { letterSpacing: ".2em", textTransform: "uppercase", fontSize: 12, color: "#E9A06B", fontWeight: 700, margin: 0 },
  h1: { fontFamily: "Georgia, serif", fontSize: 44, margin: "10px 0 12px" },
  sub: { color: "#AC9CB0", margin: "0 0 28px" },
  controls: { display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 20 },
  field: { display: "flex", flexDirection: "column", gap: 6, flex: "1 1 200px" },
  label: { fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", color: "#8A7A90" },
  select: { background: "#231A2B", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 10, padding: "12px 12px", fontSize: 15 },
  input: { background: "#231A2B", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 10, padding: "12px 14px", fontSize: 15 },
  cta: { border: 0, cursor: "pointer", color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", borderRadius: 12, padding: "14px 24px", fontWeight: 650, fontSize: 16 },
  err: { color: "#E88", marginTop: 14 },
  story: { marginTop: 40, borderTop: "1px solid #3A2E44", paddingTop: 32 },
  storyTitle: { fontFamily: "Georgia, serif", fontSize: 30, margin: "0 0 18px", textAlign: "center" },
  para: { margin: "0 0 16px", color: "#EadFe6" },
  chatBtn: { display: "inline-block", marginTop: 18, color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", padding: "13px 24px", borderRadius: 12, fontWeight: 650, textDecoration: "none" },
};
