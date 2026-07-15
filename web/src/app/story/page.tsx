"use client";

import { useEffect, useState } from "react";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { EntryGate } from "@/components/EntryGate";
import { MIN_AGE } from "@/lib/legal";

type Char = { id: string; name: string; tagline: string; persona: string; tags: string[] };

// Each suggestion category is a big pool split into everyday ("common") and
// unexpected ("creative") options. On each visit we sample a fresh blend of both,
// so the chips shown are different every time - some familiar, some surprising.
type Pool = { common: string[]; creative: string[] };

const POOLS: Record<"relationship" | "genre" | "scenario" | "mood" | "setting", Pool> = {
  relationship: {
    common: ["new teammates", "old friends", "neighbors", "club partners", "fellow travelers", "research partners", "friendly rivals", "pen pals", "a sibling's friend", "friends with a secret"],
    creative: ["two people sharing the same dream", "a ghost and the one who sees them", "a time traveler and a local", "a knight and a mapmaker", "sworn rivals on the same side", "a detective and an eyewitness", "a musician and their newest fan", "two strangers with the same clue", "a crew with one empty seat", "the person who knows your secret hobby"],
  },
  genre: {
    common: ["mystery", "fantasy", "sci-fi", "adventure", "comedy", "cozy", "music", "gaming"],
    creative: ["cyberpunk mystery", "cozy fantasy", "space adventure", "dark academia", "magical realism", "post-apocalyptic hope", "steampunk", "supernatural mystery", "fairy-tale retelling", "found-family adventure"],
  },
  scenario: {
    common: ["a chance encounter", "a missing item", "an unexpected invitation", "assigned as partners", "a citywide scavenger hunt", "a rumor nobody can verify", "a project that goes wrong"],
    creative: ["a wrong-number text with a clue", "both reaching for the same hidden book", "sharing one umbrella in a downpour", "you catch them talking to a stray robot", "a map appears in your notebook", "you find a message from the future", "the elevator stops on a floor that should not exist", "a radio call meant for someone else", "a game level starts changing on its own"],
  },
  mood: {
    common: ["sweet", "playful", "curious", "mysterious", "cozy", "adventurous", "bittersweet", "tense"],
    creative: ["electric", "wistful", "mischievous", "tender", "dizzying", "haunting", "giddy", "hopeful", "aching", "dreamy"],
  },
  setting: {
    common: ["a rainy rooftop", "a cozy bookshop", "a neon-lit arcade", "a quiet train station", "a community greenhouse", "a campus observatory", "a maker lab"],
    creative: ["a lighthouse during a storm", "a greenhouse full of glowing flowers", "a ferris wheel stuck at the top", "a museum after a power cut", "a record shop that smells of rain", "a tiny boat under a meteor shower", "a rooftop garden above a sleepless city", "a library with a hidden room", "a community radio booth"],
  },
};

function rand<T>(a: T[]): T {
  return a[Math.floor(Math.random() * a.length)];
}
function pick<T>(a: T[], n: number): T[] {
  return [...a].sort(() => Math.random() - 0.5).slice(0, n);
}
// A shuffled blend of common + creative options for one category.
function mix(pool: Pool, nCommon: number, nCreative: number): string[] {
  return pick([...pick(pool.common, nCommon), ...pick(pool.creative, nCreative)], nCommon + nCreative);
}
// Deterministic first render (avoids SSR/client hydration mismatch); the real
// random blend is rolled on mount in the client.
function firstOptions(pool: Pool, nCommon: number, nCreative: number): string[] {
  return [...pool.common.slice(0, nCommon), ...pool.creative.slice(0, nCreative)];
}

type OptionSet = { relationship: string[]; genre: string[]; scenario: string[]; mood: string[]; setting: string[] };
function buildOptions(fn: (pool: Pool, a: number, b: number) => string[]): OptionSet {
  return {
    relationship: fn(POOLS.relationship, 4, 3),
    genre: fn(POOLS.genre, 4, 3),
    scenario: fn(POOLS.scenario, 3, 3),
    mood: fn(POOLS.mood, 4, 3),
    setting: fn(POOLS.setting, 3, 3),
  };
}

export default function StoryPage() {
  const [chars, setChars] = useState<Char[]>([]);
  const [charId, setCharId] = useState("");
  // When you arrive from a character page (?characterId=…), start focused on
  // just that companion; the full picker is revealed on demand.
  const [showAllChars, setShowAllChars] = useState(true);
  const [relationship, setRelationship] = useState("");
  const [genre, setGenre] = useState("");
  const [scenario, setScenario] = useState("");
  const [tone, setTone] = useState("");
  const [setting, setSetting] = useState("");
  const [details, setDetails] = useState("");
  const [chapterPrice, setChapterPrice] = useState(10);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [paywall, setPaywall] = useState(false);
  const [authEmail, setAuthEmail] = useState<string | null | undefined>(undefined);
  const [opts, setOpts] = useState<OptionSet>(() => buildOptions(firstOptions));

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setAuthEmail(d.user?.email ?? null)).catch(() => setAuthEmail(null));
  }, []);

  // Resample the whole suggestion palette (a fresh common+creative blend) AND
  // preselect a random one from each new set.
  function roll() {
    const o = buildOptions(mix);
    setOpts(o);
    setRelationship(rand(o.relationship));
    setGenre(rand(o.genre));
    setScenario(rand(o.scenario));
    setTone(rand(o.mood));
    setSetting(rand(o.setting));
  }

  useEffect(() => {
    const urlChar = new URLSearchParams(window.location.search).get("characterId");
    fetch("/api/characters").then((r) => r.json()).then((c: Char[]) => {
      setChars(c);
      const cameFromCharacter = Boolean(urlChar && c.some((x) => x.id === urlChar));
      const preferred = cameFromCharacter ? urlChar! : c[0]?.id;
      if (preferred) setCharId(preferred);
      // Arrived for a specific companion -> collapse the list to just them.
      if (cameFromCharacter) setShowAllChars(false);
    }).catch(() => {});
    fetch("/api/config").then((r) => r.json()).then((d) => { if (d.pricing?.chapter) setChapterPrice(d.pricing.chapter); }).catch(() => {});
    roll(); // fresh blend of suggestions + a random combination each visit
  }, []);

  async function generate() {
    if (!charId || busy) return;
    setBusy(true); setError(""); setPaywall(false);
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
        }),
      });
      const d = await res.json();
      if (res.ok && d.storyId) { window.location.href = `/story/${d.storyId}`; return; }
      if (res.status === 401) { setAuthEmail(null); setBusy(false); return; }
      if (res.status === 402) { setError(`You need ${d.price ?? 10} credits to write a chapter — you have ${d.balance?.total ?? 0}. Free credits refresh daily.`); setPaywall(true); setBusy(false); return; }
      setError(d.error === "blocked" ? "That prompt isn't allowed." : d.error || "Something went wrong.");
      setBusy(false);
    } catch {
      setError("Network error.");
      setBusy(false);
    }
  }

  if (authEmail === undefined) return <main style={S.wrap}><p style={{ color: "#AC9CB0" }}>Loading…</p></main>;
  if (authEmail === null) return <EntryGate onDone={(e) => setAuthEmail(e)} subtitle={`Sign in to create a story. ${MIN_AGE}+ only.`} />;

  const active = chars.find((c) => c.id === charId);

  return (
    <main style={S.wrap} className="rv-story-start">
      <p style={S.eyebrow} className="rv-story-start-eyebrow">Enter a scene</p>
      <h1 style={S.h1} className="rv-story-start-title">Meet someone new</h1>
      <p style={S.sub} className="rv-story-start-sub">Choose a character and shape one vivid opening moment. When the scene ends, the conversation is yours to continue.</p>
      <button style={S.shuffle} onClick={roll} type="button">🎲 Shuffle suggestions</button>

      <div style={S.sectionRow} className="rv-story-start-character-section">
        <p style={S.section}>Who you meet</p>
        <a href="/create" style={S.createLink}>＋ Create your own</a>
      </div>
      <div style={S.cards} className="rv-story-start-cards">
        {(showAllChars ? chars : chars.filter((c) => c.id === charId)).map((c) => (
          <button key={c.id} style={{ ...S.card, ...(c.id === charId ? S.cardOn : {}) }} onClick={() => setCharId(c.id)}>
            <div style={S.cardHead}><CharacterAvatar characterId={c.id} name={c.name} size={38} /><div style={S.cardName}>{c.name}</div></div>
            <div style={S.cardPersona}>{c.persona}</div>
            <div style={S.tags}>{c.tags.map((t) => <span key={t} style={S.tag}>{t}</span>)}</div>
          </button>
        ))}
      </div>
      {!showAllChars && chars.length > 1 ? (
        <button style={S.otherChar} onClick={() => setShowAllChars(true)} type="button">Choose a different companion →</button>
      ) : null}

      <p style={S.section}>Your connection</p>
      <Picker options={opts.relationship} value={relationship} onChange={setRelationship} placeholder="describe your own relationship" />

      <p style={S.section}>Genre</p>
      <Picker options={opts.genre} value={genre} onChange={setGenre} placeholder="your own genre" />

      <p style={S.section}>How you meet</p>
      <Picker options={opts.scenario} value={scenario} onChange={setScenario} placeholder="your own scenario" />

      <p style={S.section}>Mood</p>
      <Picker options={opts.mood} value={tone} onChange={setTone} placeholder="your own mood" />

      <p style={S.section}>Setting</p>
      <Picker options={opts.setting} value={setting} onChange={setSetting} placeholder="your own setting" />

      <p style={S.section}>Anything else? (optional)</p>
      <textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="a detail or idea to weave in - e.g. 'she just got back from a trip', 'we're hiding from the rain'…" style={S.textarea} maxLength={400} />

      <button style={{ ...S.cta, opacity: busy ? 0.6 : 1 }} onClick={generate} disabled={busy || !charId}>
        {busy ? "Creating your scene…" : `Create an opening scene with ${active?.name ?? "…"}`}
      </button>
      <p style={S.cost}>Costs {chapterPrice} credits · reading is always free</p>
      {error ? <p style={S.err}>{error}{paywall ? <> <a href="/credits" style={S.errLink}>Get credits →</a></> : null}</p> : null}
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
          <button key={o} className="rv-chip" style={{ ...S.chip, ...(o === value ? S.chipOn : {}) }} onClick={() => { setCustom(false); onChange(o === value ? "" : o); }}>{o}</button>
        ))}
        <button className="rv-chip" style={{ ...S.chip, ...(showInput ? S.chipOn : {}) }} onClick={() => { setCustom(true); if (!isCustom) onChange(""); }}>＋ your own</button>
      </div>
      {showInput ? (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || "write your own"} style={S.input} />
      ) : null}
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 720, margin: "0 auto", padding: "40px 24px 72px", lineHeight: 1.6 },
  eyebrow: { letterSpacing: ".2em", textTransform: "uppercase", fontSize: 12, color: "#E9A06B", fontWeight: 700, margin: 0 },
  h1: { fontFamily: "Georgia, serif", fontSize: 40, margin: "8px 0 10px", lineHeight: 1.12 },
  sub: { color: "#AC9CB0", margin: "0 0 12px", fontSize: 15.5 },
  shuffle: { background: "#231A2B", color: "#E9A06B", border: "1px solid #4a3a50", borderRadius: 999, padding: "9px 16px", cursor: "pointer", fontSize: 14, fontWeight: 600 },
  section: { fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "#8A7A90", fontWeight: 700, margin: "22px 0 10px" },
  sectionRow: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 },
  createLink: { color: "#E9A06B", textDecoration: "none", fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap" },
  cards: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12 },
  otherChar: { marginTop: 12, background: "#231A2B", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 11, padding: "10px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  card: { textAlign: "left", background: "#241B2D", border: "1px solid #3A2E44", borderRadius: 14, padding: "14px 16px", cursor: "pointer", color: "#F4EAF0", display: "flex", flexDirection: "column", gap: 8 },
  cardOn: { border: "1px solid #E9A06B", background: "#241726", boxShadow: "0 0 0 1px #E9A06B inset" },
  cardHead: { display: "flex", alignItems: "center", gap: 10 },
  cardName: { fontFamily: "Georgia, serif", fontSize: 20 },
  cardPersona: { color: "#AC9CB0", fontSize: 13.5, lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  tags: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2 },
  tag: { fontSize: 11, letterSpacing: ".04em", color: "#E9A06B", border: "1px solid #4a3a50", borderRadius: 999, padding: "2px 9px" },
  chips: { display: "flex", flexWrap: "wrap", gap: 8 },
  chip: { background: "#231A2B", color: "#CBBBD0", border: "1px solid #3A2E44", borderRadius: 999, padding: "9px 14px", cursor: "pointer", fontSize: 14 },
  chipOn: { background: "linear-gradient(100deg,#E9A06B,#D46A8B)", color: "#1A1220", border: "1px solid transparent", fontWeight: 600 },
  input: { width: "100%", marginTop: 10, background: "#1A121F", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 10, padding: "12px 14px", fontSize: 15, boxSizing: "border-box" },
  textarea: { width: "100%", minHeight: 70, resize: "vertical", background: "#1A121F", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 10, padding: "12px 14px", fontSize: 15, boxSizing: "border-box", fontFamily: "inherit" },
  cta: { marginTop: 30, border: 0, cursor: "pointer", color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", borderRadius: 12, padding: "15px 24px", fontWeight: 650, fontSize: 16, width: "100%" },
  cost: { color: "#8A7A90", fontSize: 13, textAlign: "center", margin: "10px 0 0" },
  err: { color: "#E88", marginTop: 14 },
  errLink: { color: "#E9A06B", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" },
  story: { marginTop: 44, borderTop: "1px solid #3A2E44", paddingTop: 32 },
  storyTitle: { fontFamily: "Georgia, serif", fontSize: 30, margin: "0 0 18px", textAlign: "center" },
  para: { margin: "0 0 16px", color: "#EadFe6" },
  chatBtn: { display: "inline-block", marginTop: 18, color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", padding: "13px 24px", borderRadius: 12, fontWeight: 650, textDecoration: "none" },
};
