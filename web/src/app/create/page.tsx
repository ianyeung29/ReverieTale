"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { EntryGate } from "@/components/EntryGate";

const TAG_SUGGESTIONS = ["romance", "flirty", "shy", "confident", "mysterious", "playful", "brooding", "warm", "witty", "protective", "adventurous", "artistic"];

export default function CreateCharacterPage() {
  const [authEmail, setAuthEmail] = useState<string | null | undefined>(undefined);
  const [name, setName] = useState("");
  const [look, setLook] = useState("");
  const [persona, setPersona] = useState("");
  const [backstory, setBackstory] = useState("");
  const [voice, setVoice] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setAuthEmail(d.user?.email ?? null)).catch(() => setAuthEmail(null));
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) return;
    setEditId(id);
    fetch(`/api/characters/${id}`).then((r) => (r.ok ? r.json() : null)).then((d) => {
      if (!d) return;
      setName(d.name || ""); setLook(d.look || ""); setPersona(d.persona || "");
      setBackstory(d.backstory || ""); setVoice(d.voice || ""); setTags(Array.isArray(d.tags) ? d.tags : []);
    }).catch(() => {});
  }, []);

  function toggleTag(t: string) {
    setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : cur.length >= 8 ? cur : [...cur, t]));
  }

  async function create() {
    if (!name.trim() || busy) return;
    setBusy(true); setError("");
    const payload = {
      name: name.trim(),
      look: look.trim() || undefined,
      persona: persona.trim() || undefined,
      backstory: backstory.trim() || undefined,
      voice: voice.trim() || undefined,
      tags: tags.length ? tags : undefined,
    };
    try {
      if (editId) {
        // Editing an existing companion: save in place and return to management.
        const res = await fetch(`/api/characters/${editId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const d = await res.json();
        if (res.ok) { window.location.href = "/characters"; return; }
        if (res.status === 401) { setAuthEmail(null); setBusy(false); return; }
        setError(d.error === "blocked" ? "That description isn't allowed." : d.error || "Something went wrong.");
        setBusy(false);
        return;
      }

      const res = await fetch("/api/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      // Combined flow: hand off to the story creator with her preselected, so the
      // creator's next step is writing her opening story.
      if (res.ok && d.id) { window.location.href = `/story?characterId=${d.id}`; return; }
      if (res.status === 401) { setAuthEmail(null); setBusy(false); return; }
      setError(d.error === "blocked" ? "That description isn't allowed." : d.error || "Something went wrong.");
      setBusy(false);
    } catch {
      setError("Network error.");
      setBusy(false);
    }
  }

  if (authEmail === undefined) return <main style={S.wrap}><p style={{ color: "#AC9CB0" }}>Loading…</p></main>;
  if (authEmail === null) return <EntryGate onDone={(e) => setAuthEmail(e)} subtitle="Sign in to create a companion. 18+ only." />;

  return (
    <main style={S.wrap}>
      <a href="/" style={S.back}>← Reverie</a>

      <div style={S.head}>
        <Avatar name={name || "?"} size={54} />
        <div>
          <p style={S.mark}>{editId ? "Edit companion" : "Create a companion"}</p>
          <h1 style={S.h1}>{name.trim() || "Your character"}</h1>
        </div>
      </div>
      <p style={S.sub}>{editId ? "Update how they look, sound, and behave. Changes apply to new chats and stories." : "Build them once. Every story you write and every reader who chats with them earns you credits."}</p>

      <label style={S.label}>Name</label>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mara, Kai, Sable…" style={S.input} maxLength={60} />

      <label style={S.label}>Look</label>
      <input value={look} onChange={(e) => setLook(e.target.value)} placeholder="how they appear — hair, style, the way they carry themselves" style={S.input} maxLength={400} />

      <label style={S.label}>Personality</label>
      <textarea value={persona} onChange={(e) => setPersona(e.target.value)} placeholder="who they are — warm and teasing? guarded but loyal? quick to laugh?" style={S.textarea} maxLength={600} />

      <label style={S.label}>Backstory</label>
      <textarea value={backstory} onChange={(e) => setBackstory(e.target.value)} placeholder="where they come from, what they want, what haunts them" style={S.textarea} maxLength={600} />

      <label style={S.label}>Voice &amp; style</label>
      <input value={voice} onChange={(e) => setVoice(e.target.value)} placeholder="how they talk — dry wit, soft-spoken, poetic, blunt…" style={S.input} maxLength={300} />

      <label style={S.label}>Tags <span style={S.hint}>({tags.length}/8)</span></label>
      <div style={S.chips}>
        {TAG_SUGGESTIONS.map((t) => (
          <button key={t} type="button" style={{ ...S.chip, ...(tags.includes(t) ? S.chipOn : {}) }} onClick={() => toggleTag(t)}>{t}</button>
        ))}
      </div>

      {error ? <p style={S.err}>{error}</p> : null}

      <div style={S.actions}>
        <button style={{ ...S.primary, opacity: !name.trim() || busy ? 0.55 : 1 }} onClick={create} disabled={!name.trim() || busy}>
          {busy ? (editId ? "Saving…" : "Creating…") : editId ? "Save changes" : "Create & write her first story →"}
        </button>
        <a href={editId ? "/characters" : "/"} style={S.cancel}>Cancel</a>
      </div>
      {editId ? null : <p style={S.foot}>Next you&apos;ll set the scene for her opening story. Writing a chapter costs credits; reading is always free.</p>}
    </main>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 560, margin: "0 auto", padding: "36px 24px 100px", lineHeight: 1.6 },
  back: { color: "#8A7A90", textDecoration: "none", fontSize: 14, letterSpacing: ".04em" },
  head: { display: "flex", alignItems: "center", gap: 15, margin: "24px 0 6px" },
  mark: { fontSize: 12, letterSpacing: ".2em", textTransform: "uppercase", color: "#E9A06B", fontWeight: 700, margin: 0 },
  h1: { fontFamily: "Georgia, serif", fontSize: 30, margin: "4px 0 0", lineHeight: 1.1 },
  sub: { color: "#AC9CB0", margin: "0 0 22px", fontSize: 14.5 },
  label: { display: "block", fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase", color: "#8A7A90", fontWeight: 700, margin: "18px 0 7px" },
  hint: { color: "#6f6276", letterSpacing: 0, textTransform: "none", fontWeight: 400 },
  input: { width: "100%", background: "#1A121F", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 10, padding: "12px 14px", fontSize: 15, boxSizing: "border-box", fontFamily: "inherit" },
  textarea: { width: "100%", minHeight: 74, resize: "vertical", background: "#1A121F", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 10, padding: "12px 14px", fontSize: 15, boxSizing: "border-box", fontFamily: "inherit", lineHeight: 1.5 },
  chips: { display: "flex", flexWrap: "wrap", gap: 8 },
  chip: { background: "#231A2B", color: "#CBBBD0", border: "1px solid #3A2E44", borderRadius: 999, padding: "8px 13px", cursor: "pointer", fontSize: 13.5 },
  chipOn: { background: "linear-gradient(100deg,#E9A06B,#D46A8B)", color: "#1A1220", border: "1px solid transparent", fontWeight: 600 },
  err: { color: "#E88", fontSize: 14, margin: "16px 0 0" },
  actions: { display: "flex", alignItems: "center", gap: 16, marginTop: 26 },
  primary: { border: 0, cursor: "pointer", color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", borderRadius: 12, padding: "13px 22px", fontWeight: 650, fontSize: 15.5 },
  cancel: { color: "#8A7A90", textDecoration: "none", fontSize: 14 },
  foot: { color: "#6f6276", fontSize: 13, marginTop: 18 },
};
