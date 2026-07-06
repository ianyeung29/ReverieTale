"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { ChatDock } from "@/components/ChatDock";

type Story = { id: string; title: string; content: string; characterId: string; characterName: string; isOwner: boolean; hasBackup: boolean };

const MOODS = ["sweet", "playful", "flirty", "tender", "tense", "mysterious", "dramatic"];
const TWISTS = ["a confession", "an interruption", "a secret revealed", "they almost kiss", "a misunderstanding", "a bold move", "someone arrives"];
const WHAT_HAPPENS = ["she says how she really feels", "the moment nearly breaks", "you're left alone together", "a memory resurfaces", "the tension finally snaps", "an unexpected visitor arrives"];

function rand<T>(a: T[]): T { return a[Math.floor(Math.random() * a.length)]; }
function splitChapters(content: string): string[] {
  const parts = content.split(/\n{2,}·\s·\s·\n{2,}/).map((s) => s.trim()).filter(Boolean);
  return parts.length ? parts : [content.trim()];
}

export default function StoryReadPage() {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);
  const [busy, setBusy] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [whatHappens, setWhatHappens] = useState("");
  const [mood, setMood] = useState("");
  const [twist, setTwist] = useState("");
  const [setting, setSetting] = useState("");
  const [backupText, setBackupText] = useState<string | null>(null);
  const [showBackup, setShowBackup] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/stories/${id}`).then((r) => (r.ok ? r.json() : Promise.reject())).then((s: Story) => {
      setStory(s); setChapters(splitChapters(s.content));
    }).catch(() => setNotFound(true));
  }, [id]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [idx]);

  function resetForm() { setWhatHappens(""); setMood(""); setTwist(""); setSetting(""); setShowForm(false); }
  function surprise() { setWhatHappens(rand(WHAT_HAPPENS)); setTwist(rand(TWISTS)); setMood(rand(MOODS)); setSetting(""); }

  async function writeNext() {
    if (busy) return;
    setBusy(true); setNotice(null);
    try {
      const res = await fetch(`/api/stories/${id}/continue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatHappens: whatHappens.trim() || undefined, mood: mood || undefined, twist: twist || undefined, setting: setting.trim() || undefined }),
      });
      const d = await res.json();
      if (res.status === 402) { setNotice(`You need ${d.price ?? 10} credits to write a chapter — you have ${d.balance?.total ?? 0}. Add credits to keep going.`); return; }
      if (res.ok && d.chapter) { setChapters((c) => [...c, d.chapter.trim()]); setIdx((i) => i + 1); resetForm(); }
    } catch {} finally { setBusy(false); }
  }

  async function rewrite() {
    if (busy) return;
    const after = chapters.length - idx - 1;
    if (after > 0 && !confirm(`Rewriting this chapter will remove the ${after} chapter${after === 1 ? "" : "s"} after it, because they were written to follow the old version. Continue?`)) return;
    setBusy(true); setNotice(null);
    try {
      const res = await fetch(`/api/stories/${id}/rewrite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterIndex: idx }),
      });
      const d = await res.json();
      if (res.status === 402) { setNotice(`You need ${d.price ?? 10} credits to rewrite a chapter — you have ${d.balance?.total ?? 0}. Add credits to keep going.`); return; }
      // Rewrite truncates downstream chapters (branch point) - mirror that locally.
      if (res.ok && d.chapter) {
        setChapters((c) => [...c.slice(0, idx), d.chapter.trim()]);
        setStory((s) => (s ? { ...s, hasBackup: true } : s)); // a backup now exists
      }
    } catch {} finally { setBusy(false); }
  }

  async function readBackup() {
    try {
      const d = await fetch(`/api/stories/${id}/backup`).then((r) => r.json());
      if (d.content) { setBackupText(d.content); setShowBackup(true); }
    } catch {}
  }

  async function restore() {
    if (!confirm("Restore the previous version? This replaces the current story with your saved backup.")) return;
    try {
      const res = await fetch(`/api/stories/${id}/backup`, { method: "POST" }); // POST = restore
      const d = await res.json();
      if (res.ok && d.content) {
        const ch = splitChapters(d.content);
        setChapters(ch); setIdx(ch.length - 1);
        setStory((s) => (s ? { ...s, hasBackup: false } : s));
        setShowBackup(false);
      }
    } catch {}
  }

  if (notFound) return <main style={S.wrap}><p style={{ color: "#AC9CB0" }}>Story not found. <a href="/" style={S.link}>Home</a></p></main>;
  if (!story) return <main style={S.wrap}><p style={{ color: "#AC9CB0" }}>Loading…</p></main>;

  const last = idx === chapters.length - 1;

  return (
    <main style={S.wrap}>
      <a href="/" style={S.back}>← Reverie</a>
      <div style={S.head}>
        <Avatar name={story.characterName} size={46} />
        <div>
          <h1 style={S.title}>{story.title}</h1>
          <p style={S.by}>with {story.characterName} · chapter {idx + 1} of {chapters.length}</p>
        </div>
      </div>

      {story.isOwner && story.hasBackup ? (
        <div style={S.backupBanner}>
          <span>A previous version is saved.</span>
          <button style={S.bkBtn} onClick={readBackup}>Read it</button>
          <button style={S.bkBtn} onClick={restore}>Restore</button>
        </div>
      ) : null}

      <article key={idx + ":" + (chapters[idx] ?? "").length} style={S.article}>
        {(chapters[idx] ?? "").split(/\n{2,}/).map((p, i) => <p key={i} style={S.para}>{p}</p>)}
      </article>

      {story.isOwner ? (
        <button style={{ ...S.rewrite, opacity: busy ? 0.6 : 1 }} onClick={rewrite} disabled={busy}>↻ {busy ? "Rewriting…" : "Rewrite this chapter"}</button>
      ) : null}

      <div style={S.nav}>
        <button style={{ ...S.navBtn, visibility: idx > 0 ? "visible" : "hidden" }} onClick={() => { setShowForm(false); setIdx(idx - 1); }}>← Previous</button>
        <span style={S.count}>{idx + 1} / {chapters.length}</span>
        {!last ? (
          <button style={{ ...S.navBtn, ...S.navPrimary }} onClick={() => setIdx(idx + 1)}>Next →</button>
        ) : story.isOwner ? (
          <button style={{ ...S.navBtn, ...S.navPrimary }} onClick={() => setShowForm((v) => !v)}>Next chapter +</button>
        ) : (
          <span style={{ ...S.navBtn, visibility: "hidden" }} aria-hidden />
        )}
      </div>

      {notice ? <p style={S.notice}>{notice}</p> : null}

      {last && showForm ? (
        <div style={S.form}>
          <div style={S.formTop}>
            <p style={S.formTitle}>Shape the next chapter</p>
            <button style={S.surprise} onClick={surprise} type="button">🎲 Surprise me</button>
          </div>

          <label style={S.label}>What happens next?</label>
          <textarea value={whatHappens} onChange={(e) => setWhatHappens(e.target.value)} placeholder="e.g. she finally says how she feels… we get caught in the rain…" style={S.textarea} maxLength={400} />

          <label style={S.label}>Add a twist</label>
          <Chips options={TWISTS} value={twist} onPick={(v) => setTwist(v === twist ? "" : v)} />

          <label style={S.label}>Mood</label>
          <Chips options={MOODS} value={mood} onPick={(v) => setMood(v === mood ? "" : v)} />

          <label style={S.label}>Move to a new setting (optional)</label>
          <input value={setting} onChange={(e) => setSetting(e.target.value)} placeholder="e.g. a quiet balcony, the last train home…" style={S.input} />

          <div style={S.formActions}>
            <button style={{ ...S.write, opacity: busy ? 0.6 : 1 }} onClick={writeNext} disabled={busy}>{busy ? "Writing…" : "Write this chapter →"}</button>
            <button style={S.cancel} onClick={resetForm} disabled={busy}>Cancel</button>
          </div>
        </div>
      ) : null}

      <div style={S.talkRow}>
        <a style={S.talk} href={`/chat?characterId=${story.characterId}&fromStory=${story.id}&chapter=${idx + 1}`}>Open full chat with {story.characterName} →</a>
      </div>

      {showBackup && backupText ? (
        <div style={S.overlay} onClick={() => setShowBackup(false)}>
          <div style={S.overlayCard} onClick={(e) => e.stopPropagation()}>
            <div style={S.overlayHead}>
              <span style={S.overlayTitle}>Previous version</span>
              <button style={S.overlayClose} onClick={() => setShowBackup(false)}>×</button>
            </div>
            <div style={S.overlayBody}>
              {backupText.split(/\n{2,}/).map((p, i) => (p.trim() === "· · ·" ? <p key={i} style={S.divider}>· · ·</p> : <p key={i} style={S.para}>{p}</p>))}
            </div>
            <div style={S.overlayActions}>
              <button style={S.write} onClick={restore}>Restore this version</button>
              <button style={S.cancel} onClick={() => setShowBackup(false)}>Close</button>
            </div>
          </div>
        </div>
      ) : null}

      <ChatDock characterId={story.characterId} characterName={story.characterName} storyId={story.id} chapter={idx + 1} />
    </main>
  );
}

function Chips({ options, value, onPick }: { options: string[]; value: string; onPick: (v: string) => void }) {
  return (
    <div style={S.chips}>
      {options.map((o) => <button key={o} style={{ ...S.chip, ...(o === value ? S.chipOn : {}) }} onClick={() => onPick(o)}>{o}</button>)}
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 640, margin: "0 auto", padding: "36px 24px 120px", lineHeight: 1.7 },
  back: { color: "#8A7A90", textDecoration: "none", fontSize: 14, letterSpacing: ".04em" },
  link: { color: "#E9A06B" },
  head: { display: "flex", alignItems: "center", gap: 14, margin: "24px 0 28px" },
  title: { fontFamily: "Georgia, serif", fontSize: 32, margin: 0, lineHeight: 1.15 },
  by: { color: "#AC9CB0", margin: "4px 0 0", fontSize: 14 },
  article: { minHeight: 200 },
  para: { margin: "0 0 16px", color: "#EadFe6", fontSize: 17 },
  divider: { textAlign: "center", color: "#6f6276", letterSpacing: ".5em", margin: "24px 0" },
  backupBanner: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", background: "#1C1422", border: "1px solid #3A2E44", borderRadius: 12, padding: "10px 14px", margin: "18px 0", color: "#AC9CB0", fontSize: 14 },
  bkBtn: { background: "transparent", color: "#E9A06B", border: "1px solid #4a3a50", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 13 },
  overlay: { position: "fixed", inset: 0, zIndex: 50, background: "rgba(10,7,13,.7)", display: "grid", placeItems: "center", padding: 20 },
  overlayCard: { width: "min(620px, 100%)", maxHeight: "85vh", display: "flex", flexDirection: "column", background: "#150F1A", border: "1px solid #3A2E44", borderRadius: 16, overflow: "hidden" },
  overlayHead: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid #3A2E44" },
  overlayTitle: { fontFamily: "Georgia, serif", fontSize: 18, color: "#F4EAF0" },
  overlayClose: { background: "transparent", border: 0, color: "#AC9CB0", fontSize: 22, cursor: "pointer", lineHeight: 1 },
  overlayBody: { overflowY: "auto", padding: "18px 22px" },
  overlayActions: { display: "flex", gap: 10, padding: "14px 18px", borderTop: "1px solid #3A2E44" },
  rewrite: { marginTop: 18, background: "transparent", color: "#8A7A90", border: "1px solid #3A2E44", borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 13.5 },
  nav: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 22, borderTop: "1px solid #241a2b", paddingTop: 22 },
  navBtn: { background: "#231A2B", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 10, padding: "11px 16px", cursor: "pointer", fontSize: 14, fontWeight: 600 },
  navPrimary: { color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", border: "1px solid transparent" },
  count: { color: "#8A7A90", fontSize: 13, fontVariantNumeric: "tabular-nums" },
  form: { marginTop: 20, background: "#1C1422", border: "1px solid #3A2E44", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 8 },
  formTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 },
  formTitle: { fontFamily: "Georgia, serif", fontSize: 20, margin: 0 },
  surprise: { background: "#231A2B", color: "#E9A06B", border: "1px solid #4a3a50", borderRadius: 999, padding: "7px 13px", cursor: "pointer", fontSize: 13, fontWeight: 600 },
  label: { fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase", color: "#8A7A90", fontWeight: 700, marginTop: 10 },
  textarea: { width: "100%", minHeight: 64, resize: "vertical", background: "#1A121F", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 10, padding: "11px 13px", fontSize: 15, boxSizing: "border-box", fontFamily: "inherit" },
  input: { width: "100%", background: "#1A121F", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 10, padding: "11px 13px", fontSize: 15, boxSizing: "border-box" },
  chips: { display: "flex", flexWrap: "wrap", gap: 8 },
  chip: { background: "#231A2B", color: "#CBBBD0", border: "1px solid #3A2E44", borderRadius: 999, padding: "8px 13px", cursor: "pointer", fontSize: 13.5 },
  chipOn: { background: "linear-gradient(100deg,#E9A06B,#D46A8B)", color: "#1A1220", border: "1px solid transparent", fontWeight: 600 },
  formActions: { display: "flex", gap: 10, marginTop: 16, alignItems: "center" },
  write: { border: 0, cursor: "pointer", color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", borderRadius: 10, padding: "12px 20px", fontWeight: 650, fontSize: 15 },
  cancel: { background: "transparent", border: 0, color: "#8A7A90", cursor: "pointer", fontSize: 14 },
  notice: { marginTop: 14, background: "#2A1A1E", border: "1px solid #6b3a44", borderRadius: 10, padding: "10px 14px", color: "#F0C9B0", fontSize: 14 },
  talkRow: { marginTop: 22, textAlign: "center" },
  talk: { color: "#AC9CB0", textDecoration: "none", fontSize: 14 },
};
