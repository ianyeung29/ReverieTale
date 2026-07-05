"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { EntryGate } from "@/components/EntryGate";

type Char = { id: string; name: string; tagline: string; persona: string; tags: string[] };

const RELATIONSHIPS = ["strangers", "old friends", "reconnecting", "quietly in love", "it's complicated"];
const GENRES = ["romance", "slice-of-life", "fantasy", "sci-fi", "mystery", "drama", "adventure", "comedy"];
const SCENARIOS = ["a chance encounter", "reuniting after years apart", "your first date", "she's your new neighbor", "stranded together", "a late-night confession"];
const MOODS = ["sweet", "playful", "flirty", "mysterious", "cozy", "adventurous", "bittersweet", "tense"];
const SETTINGS = ["a rainy rooftop at midnight", "a cozy bookshop at closing time", "a neon-lit arcade", "a quiet night train", "a beach bonfire", "a jazz bar after hours", "a snowed-in cabin"];

function rand<T>(a: T[]): T {
  return a[Math.floor(Math.random() * a.length)];
}

export default function StoryPage() {
  const [chars, setChars] = useState<Char[]>([]);
  const [charId, setCharId] = useState("");
  const [relationship, setRelationship] = useState("");
  const [genre, setGenre] = useState("");
  const [scenario, setScenario] = useState("");
  const [tone, setTone] = useState("");
  const [setting, setSetting] = useState("");
  const [details, setDetails] = useState("");
  const [length, setLength] = useState<"short" | "medium">("short");
  const [tier, setTier] = useState<"standard" | "explicit">("standard");
  const [explicitEnabled, setExplicitEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [authEmail, setAuthEmail] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setAuthEmail(d.user?.email ?? null)).catch(() => setAuthEmail(null));
  }, []);

  function shuffle() {
    setRelationship(rand(RELATIONSHIPS));
    setGenre(rand(GENRES));
    setScenario(rand(SCENARIOS));
    setTone(rand(MOODS));
    setSetting(rand(SETTINGS));
  }

  useEffect(() => {
    const urlChar = new URLSearchParams(window.location.search).get("characterId");
    fetch("/api/characters").then((r) => r.json()).then((c: Char[]) => {
      setChars(c);
      const preferred = urlChar && c.some((x) => x.id === urlChar) ? urlChar : c[0]?.id;
      if (preferred) setCharId(preferred);
    }).catch(() => {});
    fetch("/api/config").then((r) => r.json()).then((d) => setExplicitEnabled(!!d.explicitEnabled)).catch(() => {});
    shuffle(); // start with a fresh random combination each visit
  }, []);

  async function generate() {
    if (!charId || busy) return;
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId: charId,
          relationship: relationship || undefined,
          genre: genre || undefined,
          scenario: scenario || undefined,
          tone: tone || undefined,
          setting: setting.trim() || undefined,
          details: details.trim() || undefined,
          length,
          tier,
        }),
      });
      const d = await res.json();
      if (res.ok && d.storyId) { window.location.href = `/story/${d.storyId}`; return; }
      if (res.status === 401) { setAuthEmail(null); setBusy(false); return; }
      setError(d.error === "blocked" ? "That prompt isn't allowed." : d.error || "Something went wrong.");
      setBusy(false);
    } catch {
      setError("Network error.");
      setBusy(false);
    }
  }

  if (authEmail === undefined) return <main style={S.wrap}><p style={{ color: "#AC9CB0" }}>Loading…</p></main>;
  if (authEmail === null) return <EntryGate onDone={(e) => setAuthEmail(e)} subtitle="Sign in to create a story. 18+ only." />;

  const active = chars.find((c) => c.id === charId);

  return (
    <main style={S.wrap}>
      <p style={S.eyebrow}>Begin a story</p>
      <h1 style={S.h1}>Meet someone new</h1>
      <p style={S.sub}>Pick who you meet, then shape the moment - use a suggestion or write your own for any of it.</p>
      <button style={S.shuffle} onClick={shuffle} type="button">🎲 Shuffle elements</button>

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
      <Picker options={RELATIONSHIPS} value={relationship} onChange={setRelationship} placeholder="describe your own relationship" />

      <p style={S.section}>Genre</p>
      <Picker options={GENRES} value={genre} onChange={setGenre} placeholder="your own genre" />

      <p style={S.section}>How you meet</p>
      <Picker options={SCENARIOS} value={scenario} onChange={setScenario} placeholder="your own scenario" />

      <p style={S.section}>Mood</p>
      <Picker options={MOODS} value={tone} onChange={setTone} placeholder="your own mood" />

      <p style={S.section}>Setting</p>
      <Picker options={SETTINGS} value={setting} onChange={setSetting} placeholder="your own setting" />

      <p style={S.section}>Anything else? (optional)</p>
      <textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="a detail or idea to weave in - e.g. 'she just got back from a trip', 'we're hiding from the rain'…" style={S.textarea} maxLength={400} />

      <p style={S.section}>Length</p>
      <div style={S.chips}>
        {(["short", "medium"] as const).map((l) => (
          <button key={l} style={{ ...S.chip, ...(l === length ? S.chipOn : {}) }} onClick={() => setLength(l)}>{l}</button>
        ))}
      </div>

      {explicitEnabled ? (
        <>
          <p style={S.section}>Intensity</p>
          <div style={S.chips}>
            {(["standard", "explicit"] as const).map((t) => (
              <button key={t} style={{ ...S.chip, ...(t === tier ? S.chipOn : {}) }} onClick={() => setTier(t)}>{t === "standard" ? "sweet" : "spicy"}</button>
            ))}
          </div>
        </>
      ) : null}

      <button style={{ ...S.cta, opacity: busy ? 0.6 : 1 }} onClick={generate} disabled={busy || !charId}>
        {busy ? "Writing…" : `Write my first chapter with ${active?.name ?? "…"}`}
      </button>
      {error ? <p style={S.err}>{error}</p> : null}
    </main>
  );
}

function Picker({ options, value, onChange, placeholder }: { options: string[]; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const isCustom = value !== "" && !options.includes(value);
  const [custom, setCustom] = useState(isCustom);
  const showInput = custom || isCustom;
  return (
    <div>
      <div style={S.chips}>
        {options.map((o) => (
          <button key={o} style={{ ...S.chip, ...(o === value ? S.chipOn : {}) }} onClick={() => { setCustom(false); onChange(o === value ? "" : o); }}>{o}</button>
        ))}
        <button style={{ ...S.chip, ...(showInput ? S.chipOn : {}) }} onClick={() => { setCustom(true); if (!isCustom) onChange(""); }}>＋ your own</button>
      </div>
      {showInput ? (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || "write your own"} style={S.input} />
      ) : null}
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 720, margin: "0 auto", padding: "52px 24px 80px", lineHeight: 1.6 },
  eyebrow: { letterSpacing: ".2em", textTransform: "uppercase", fontSize: 12, color: "#E9A06B", fontWeight: 700, margin: 0 },
  h1: { fontFamily: "Georgia, serif", fontSize: 44, margin: "10px 0 12px" },
  sub: { color: "#AC9CB0", margin: "0 0 16px" },
  shuffle: { background: "#231A2B", color: "#E9A06B", border: "1px solid #4a3a50", borderRadius: 999, padding: "9px 16px", cursor: "pointer", fontSize: 14, fontWeight: 600 },
  section: { fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "#8A7A90", fontWeight: 700, margin: "26px 0 12px" },
  cards: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12 },
  card: { textAlign: "left", background: "#1C1422", border: "1px solid #3A2E44", borderRadius: 14, padding: "14px 16px", cursor: "pointer", color: "#F4EAF0", display: "flex", flexDirection: "column", gap: 8 },
  cardOn: { border: "1px solid #E9A06B", background: "#241726", boxShadow: "0 0 0 1px #E9A06B inset" },
  cardHead: { display: "flex", alignItems: "center", gap: 10 },
  cardName: { fontFamily: "Georgia, serif", fontSize: 20 },
  cardPersona: { color: "#AC9CB0", fontSize: 13.5, lineHeight: 1.45 },
  tags: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2 },
  tag: { fontSize: 11, letterSpacing: ".04em", color: "#E9A06B", border: "1px solid #4a3a50", borderRadius: 999, padding: "2px 9px" },
  chips: { display: "flex", flexWrap: "wrap", gap: 8 },
  chip: { background: "#231A2B", color: "#CBBBD0", border: "1px solid #3A2E44", borderRadius: 999, padding: "9px 14px", cursor: "pointer", fontSize: 14 },
  chipOn: { background: "linear-gradient(100deg,#E9A06B,#D46A8B)", color: "#1A1220", border: "1px solid transparent", fontWeight: 600 },
  input: { width: "100%", marginTop: 10, background: "#1A121F", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 10, padding: "12px 14px", fontSize: 15, boxSizing: "border-box" },
  textarea: { width: "100%", minHeight: 70, resize: "vertical", background: "#1A121F", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 10, padding: "12px 14px", fontSize: 15, boxSizing: "border-box", fontFamily: "inherit" },
  cta: { marginTop: 30, border: 0, cursor: "pointer", color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", borderRadius: 12, padding: "15px 24px", fontWeight: 650, fontSize: 16, width: "100%" },
  err: { color: "#E88", marginTop: 14 },
  story: { marginTop: 44, borderTop: "1px solid #3A2E44", paddingTop: 32 },
  storyTitle: { fontFamily: "Georgia, serif", fontSize: 30, margin: "0 0 18px", textAlign: "center" },
  para: { margin: "0 0 16px", color: "#EadFe6" },
  chatBtn: { display: "inline-block", marginTop: 18, color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", padding: "13px 24px", borderRadius: 12, fontWeight: 650, textDecoration: "none" },
};
