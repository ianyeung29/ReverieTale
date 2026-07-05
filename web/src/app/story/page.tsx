"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";

type Char = { id: string; name: string; tagline: string; persona: string; tags: string[] };

const RELATIONSHIPS = ["strangers", "old friends", "reconnecting", "quietly in love", "it's complicated"];
const MOODS = ["sweet", "playful", "flirty", "mysterious", "cozy", "adventurous", "bittersweet", "tense"];
const SCENARIOS = [
  "a chance encounter",
  "reuniting after years apart",
  "your first date",
  "she's your new neighbor",
  "stranded together",
  "a late-night confession",
];
const SETTINGS = [
  "a rainy rooftop at midnight",
  "a cozy bookshop at closing time",
  "a neon-lit arcade",
  "a quiet night train",
  "a beach bonfire",
  "a jazz bar after hours",
  "a snowed-in cabin",
];

export default function StoryPage() {
  const [chars, setChars] = useState<Char[]>([]);
  const [charId, setCharId] = useState("");
  const [setting, setSetting] = useState("");
  const [tone, setTone] = useState("");
  const [scenario, setScenario] = useState("");
  const [relationship, setRelationship] = useState("");
  const [busy, setBusy] = useState(false);
  const [story, setStory] = useState<{ id: string; title: string; content: string } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const urlChar = new URLSearchParams(window.location.search).get("characterId");
    fetch("/api/characters").then((r) => r.json()).then((c: Char[]) => {
      setChars(c);
      const preferred = urlChar && c.some((x) => x.id === urlChar) ? urlChar : c[0]?.id;
      if (preferred) setCharId(preferred);
    }).catch(() => {});
  }, []);

  async function generate() {
    if (!charId || busy) return;
    setBusy(true); setError(""); setStory(null);
    try {
      const res = await fetch("/api/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId: charId, setting: setting.trim() || undefined, tone: tone || undefined, scenario: scenario || undefined, relationship: relationship || undefined }),
      });
      const d = await res.json();
      if (res.ok && d.content) setStory({ id: d.storyId, title: d.title, content: d.content });
      else setError(d.error === "blocked" ? "That prompt isn't allowed." : d.error || "Something went wrong.");
    } catch {
      setError("Network error.");
    } finally { setBusy(false); }
  }

  const active = chars.find((c) => c.id === charId);

  return (
    <main style={S.wrap}>
      <p style={S.eyebrow}>Begin a story</p>
      <h1 style={S.h1}>Meet someone new</h1>
      <p style={S.sub}>Pick who you meet, then shape the moment. We'll write your first chapter - and you can step in and talk to them after.</p>

      <p style={S.section}>Who you meet</p>
      <div style={S.cards}>
        {chars.map((c) => (
          <button key={c.id} style={{ ...S.card, ...(c.id === charId ? S.cardOn : {}) }} onClick={() => setCharId(c.id)}>
            <div style={S.cardHead}><Avatar name={c.name} size={38} /><div style={S.cardName}>{c.name}</div></div>
            <div style={S.cardPersona}>{c.persona}</div>
            <div style={S.tags}>{c.tags.map((t) => <span key={t} style={S.tag}>{t}</span>)}</div>
          </button>
        ))}
      </div>

      <p style={S.section}>Your relationship</p>
      <Chips options={RELATIONSHIPS} value={relationship} onPick={(v) => setRelationship(v === relationship ? "" : v)} />

      <p style={S.section}>How you meet</p>
      <Chips options={SCENARIOS} value={scenario} onPick={(v) => setScenario(v === scenario ? "" : v)} />

      <p style={S.section}>Mood</p>
      <Chips options={MOODS} value={tone} onPick={(v) => setTone(v === tone ? "" : v)} />

      <p style={S.section}>Setting</p>
      <Chips options={SETTINGS} value={setting} onPick={(v) => setSetting(v === setting ? "" : v)} />
      <input value={setting} onChange={(e) => setSetting(e.target.value)} placeholder="…or describe your own setting" style={S.input} />

      <button style={{ ...S.cta, opacity: busy ? 0.6 : 1 }} onClick={generate} disabled={busy || !charId}>
        {busy ? "Writing…" : `Write my first chapter with ${active?.name ?? "…"}`}
      </button>
      {error ? <p style={S.err}>{error}</p> : null}

      {story ? (
        <article style={S.story}>
          <h2 style={S.storyTitle}>{story.title}</h2>
          {story.content.split(/\n{2,}/).map((p, i) => <p key={i} style={S.para}>{p}</p>)}
          <a style={S.chatBtn} href={`/chat?characterId=${charId}&fromStory=${story.id}`}>Now talk to {active?.name ?? "them"} →</a>
        </article>
      ) : null}
    </main>
  );
}

function Chips({ options, value, onPick }: { options: string[]; value: string; onPick: (v: string) => void }) {
  return (
    <div style={S.chips}>
      {options.map((o) => (
        <button key={o} style={{ ...S.chip, ...(o === value ? S.chipOn : {}) }} onClick={() => onPick(o)}>{o}</button>
      ))}
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 720, margin: "0 auto", padding: "52px 24px 80px", lineHeight: 1.6 },
  eyebrow: { letterSpacing: ".2em", textTransform: "uppercase", fontSize: 12, color: "#E9A06B", fontWeight: 700, margin: 0 },
  h1: { fontFamily: "Georgia, serif", fontSize: 44, margin: "10px 0 12px" },
  sub: { color: "#AC9CB0", margin: "0 0 12px" },
  section: { fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "#8A7A90", fontWeight: 700, margin: "26px 0 12px" },
  cards: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12 },
  card: { textAlign: "left", background: "#1C1422", border: "1px solid #3A2E44", borderRadius: 14, padding: "14px 16px", cursor: "pointer", color: "#F4EAF0", display: "flex", flexDirection: "column", gap: 8 },
  cardOn: { borderColor: "#E9A06B", background: "#241726", boxShadow: "0 0 0 1px #E9A06B inset" },
  cardHead: { display: "flex", alignItems: "center", gap: 10 },
  cardName: { fontFamily: "Georgia, serif", fontSize: 20 },
  cardPersona: { color: "#AC9CB0", fontSize: 13.5, lineHeight: 1.45 },
  tags: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2 },
  tag: { fontSize: 11, letterSpacing: ".04em", color: "#E9A06B", border: "1px solid #4a3a50", borderRadius: 999, padding: "2px 9px" },
  chips: { display: "flex", flexWrap: "wrap", gap: 8 },
  chip: { background: "#231A2B", color: "#CBBBD0", border: "1px solid #3A2E44", borderRadius: 999, padding: "9px 14px", cursor: "pointer", fontSize: 14 },
  chipOn: { background: "linear-gradient(100deg,#E9A06B,#D46A8B)", color: "#1A1220", border: "1px solid transparent", fontWeight: 600 },
  input: { width: "100%", marginTop: 10, background: "#1A121F", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 10, padding: "12px 14px", fontSize: 15, boxSizing: "border-box" },
  cta: { marginTop: 30, border: 0, cursor: "pointer", color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", borderRadius: 12, padding: "15px 24px", fontWeight: 650, fontSize: 16, width: "100%" },
  err: { color: "#E88", marginTop: 14 },
  story: { marginTop: 44, borderTop: "1px solid #3A2E44", paddingTop: 32 },
  storyTitle: { fontFamily: "Georgia, serif", fontSize: 30, margin: "0 0 18px", textAlign: "center" },
  para: { margin: "0 0 16px", color: "#EadFe6" },
  chatBtn: { display: "inline-block", marginTop: 18, color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", padding: "13px 24px", borderRadius: 12, fontWeight: 650, textDecoration: "none" },
};
