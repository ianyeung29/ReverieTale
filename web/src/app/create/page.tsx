"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { EntryGate } from "@/components/EntryGate";

const TAG_SUGGESTIONS = [
  "romance", "flirty", "shy", "confident", "mysterious", "playful", "brooding", "warm", "witty", "protective",
  "adventurous", "artistic", "sarcastic", "gentle", "dominant", "sweet", "cold-but-caring", "nerdy", "rebellious",
  "royalty", "vampire", "childhood-friend", "rival", "villain", "hero", "fantasy", "sci-fi", "modern", "historical", "supernatural",
];

export default function CreateCharacterPage() {
  const [authEmail, setAuthEmail] = useState<string | null | undefined>(undefined);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [outfit, setOutfit] = useState("");
  const [look, setLook] = useState("");
  const [persona, setPersona] = useState("");
  const [backstory, setBackstory] = useState("");
  const [voice, setVoice] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [genBusy, setGenBusy] = useState<string | null>(null); // which field(s) are generating
  const [tagInput, setTagInput] = useState("");
  const [previewMsg, setPreviewMsg] = useState("");
  const [previewReply, setPreviewReply] = useState<string | null>(null);
  const [previewBusy, setPreviewBusy] = useState(false);
  const [imageEnabled, setImageEnabled] = useState(false);
  const [portrait, setPortrait] = useState<{ image: string; mime: string } | null>(null); // freshly generated
  const [hasImage, setHasImage] = useState(false); // existing portrait (edit mode)
  const [portraitBusy, setPortraitBusy] = useState(false);
  const [portraitFree, setPortraitFree] = useState<number | null>(null);
  const [portraitPrice, setPortraitPrice] = useState(5);
  const [portraitPaywall, setPortraitPaywall] = useState(false);
  const [portraitErr, setPortraitErr] = useState("");
  const [previewErr, setPreviewErr] = useState("");
  const [genErr, setGenErr] = useState<{ where: string; msg: string } | null>(null);
  const [loadErr, setLoadErr] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => { setAuthEmail(d.user?.email ?? null); if (d.user) setPortraitFree(d.user.portraitFreeRemaining ?? null); }).catch(() => setAuthEmail(null));
    fetch("/api/config").then((r) => r.json()).then((d) => { setImageEnabled(!!d.imageEnabled); if (d.pricing?.portrait) setPortraitPrice(d.pricing.portrait); }).catch(() => {});
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) return;
    setEditId(id);
    fetch(`/api/characters/${id}`).then((r) => (r.ok ? r.json() : Promise.reject(r.status))).then((d) => {
      setName(d.name || ""); setLook(d.look || ""); setPersona(d.persona || "");
      setBackstory(d.backstory || ""); setVoice(d.voice || ""); setTags(Array.isArray(d.tags) ? d.tags : []);
      setAge(d.age ? String(d.age) : "");
      setHasImage(!!d.hasImage);
    }).catch(() => setLoadErr(true));
  }, []);

  async function generatePortrait() {
    if (portraitBusy) return;
    setPortraitBusy(true); setPortraitErr(""); setPortraitPaywall(false);
    try {
      const res = await fetch("/api/characters/portrait", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId: editId || undefined, name: name.trim() || undefined, age: ageOk ? ageNum : undefined, outfit: outfit.trim() || undefined, look: look.trim() || undefined, persona: persona.trim() || undefined, tags: tags.length ? tags : undefined }),
      });
      const d = await res.json();
      if (res.status === 401) { setAuthEmail(null); return; }
      if (res.status === 402) { setPortraitErr(`You need ${d.price ?? portraitPrice} credits for another portrait — you have ${d.balance?.total ?? 0}.`); setPortraitPaywall(true); return; }
      if (res.ok && d.image) { setPortrait({ image: d.image, mime: d.mime || "image/jpeg" }); if (typeof d.freeRemaining === "number") setPortraitFree(d.freeRemaining); }
      else if (d.error === "blocked") setPortraitErr(d.reason || "That description isn't allowed for a portrait.");
      else setPortraitErr(d.error ? `Portrait failed: ${d.error}` : "Couldn't generate a portrait — try again.");
    } catch {
      setPortraitErr("Network error while generating the portrait.");
    } finally {
      setPortraitBusy(false);
    }
  }

  function toggleTag(t: string) {
    setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : cur.length >= 8 ? cur : [...cur, t]));
  }
  function addTag(raw: string) {
    const t = raw.trim().toLowerCase();
    if (!t) return;
    setTags((cur) => (cur.includes(t) || cur.length >= 8 ? cur : [...cur, t]));
    setTagInput("");
  }

  async function preview() {
    if (previewBusy) return;
    setPreviewBusy(true); setPreviewErr("");
    try {
      const res = await fetch("/api/characters/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          look: look.trim() || undefined,
          persona: persona.trim() || undefined,
          backstory: backstory.trim() || undefined,
          voice: voice.trim() || undefined,
          message: previewMsg.trim() || undefined,
        }),
      });
      const d = await res.json();
      if (res.status === 401) { setAuthEmail(null); return; }
      if (res.ok && d.reply) setPreviewReply(d.reply);
      else setPreviewErr(d.error === "blocked" ? "That message isn't allowed." : "Couldn't preview just now — try again.");
    } catch {
      setPreviewErr("Network error while previewing.");
    } finally {
      setPreviewBusy(false);
    }
  }

  // AI-assist: generate one or more fields from the details so far.
  async function suggest(targets: ("look" | "voice" | "persona" | "backstory")[]) {
    if (genBusy) return;
    const where = targets.length > 1 ? "all" : targets[0];
    setGenBusy(where);
    setGenErr(null);
    try {
      const res = await fetch("/api/characters/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          look: look.trim() || undefined,
          persona: persona.trim() || undefined,
          backstory: backstory.trim() || undefined,
          voice: voice.trim() || undefined,
          tags: tags.length ? tags : undefined,
          targets,
        }),
      });
      const d = await res.json();
      if (res.status === 401) { setAuthEmail(null); return; }
      if (res.ok && d.fields) {
        if (d.fields.look !== undefined) setLook(d.fields.look);
        if (d.fields.voice !== undefined) setVoice(d.fields.voice);
        if (d.fields.persona !== undefined) setPersona(d.fields.persona);
        if (d.fields.backstory !== undefined) setBackstory(d.fields.backstory);
      } else {
        setGenErr({ where, msg: "Couldn't generate just now — try again." });
      }
    } catch {
      setGenErr({ where, msg: "Network error while generating." });
    } finally {
      setGenBusy(null);
    }
  }

  const ageNum = Number(age);
  const ageOk = Number.isFinite(ageNum) && ageNum >= 18 && ageNum <= 120;
  const canSave = Boolean(name.trim()) && ageOk;

  async function create() {
    if (!canSave || busy) return;
    setBusy(true); setError("");
    const payload = {
      name: name.trim(),
      age: ageNum,
      look: look.trim() || undefined,
      persona: persona.trim() || undefined,
      backstory: backstory.trim() || undefined,
      voice: voice.trim() || undefined,
      tags: tags.length ? tags : undefined,
      image: portrait?.image,
      imageMime: portrait?.mime,
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
      if (res.ok && d.id) {
        // Auto-approved -> straight into writing her first story. Held for review
        // -> show a confirmation instead (she isn't public yet).
        if (d.status === "published") { window.location.href = `/story?characterId=${d.id}`; return; }
        setSubmitted(d.name || name.trim()); setBusy(false); return;
      }
      if (res.status === 401) { setAuthEmail(null); setBusy(false); return; }
      setError(d.error === "blocked" ? `This didn't pass our safety check: ${d.reason || "not allowed"}.` : d.error || "Something went wrong.");
      setBusy(false);
    } catch {
      setError("Network error.");
      setBusy(false);
    }
  }

  if (authEmail === undefined) return <main style={S.wrap}><p style={{ color: "#AC9CB0" }}>Loading…</p></main>;
  if (authEmail === null) return <EntryGate onDone={(e) => setAuthEmail(e)} subtitle="Sign in to create a companion. 18+ only." />;

  if (submitted) {
    return (
      <main style={S.wrap}>
        <a href="/" style={S.back}>← Reverie</a>
        <div style={S.head}>
          <Avatar name={submitted} size={54} />
          <div>
            <p style={S.mark}>Submitted for review</p>
            <h1 style={S.h1}>{submitted}</h1>
          </div>
        </div>
        <p style={S.sub}>Thanks! {submitted} is in a quick safety review before going public. You&apos;ll find them under Your companions — once approved, they&apos;ll show up in browse and stories.</p>
        <div style={S.actions}>
          <a href="/characters" style={S.primary}>Go to your companions →</a>
          <a href="/create" style={S.cancel}>Create another</a>
        </div>
      </main>
    );
  }

  const portraitSrc = portrait
    ? `data:${portrait.mime};base64,${portrait.image}`
    : editId && hasImage
    ? `/api/characters/${editId}/image`
    : null;

  return (
    <main style={S.wrap}>
      <a href="/" style={S.back}>← Reverie</a>

      <div style={S.head}>
        {portraitSrc ? <img src={portraitSrc} alt={name} style={S.headPortrait} /> : <Avatar name={name || "?"} size={54} />}
        <div>
          <p style={S.mark}>{editId ? "Edit companion" : "Create a companion"}</p>
          <h1 style={S.h1}>{name.trim() || "Your character"}</h1>
        </div>
      </div>
      <p style={S.sub}>{editId ? "Update how they look, sound, and behave. Changes apply to new chats and stories." : "Build them once. Every story you write and every reader who chats with them earns you credits."}</p>

      {loadErr ? <p style={S.fieldErr}>Couldn&apos;t load this companion&apos;s details. Refresh to try again.</p> : null}

      {imageEnabled && editId ? (
        <div style={S.portraitRow}>
          {portraitSrc ? <img src={portraitSrc} alt="portrait" style={S.portraitBig} /> : <div style={S.portraitPlaceholder}>no portrait yet</div>}
          <div style={S.portraitCol}>
            <input value={outfit} onChange={(e) => setOutfit(e.target.value)} placeholder="outfit & style (optional) — e.g. red silk dress, cozy knit" style={S.portraitOutfit} maxLength={200} />
            <button type="button" style={{ ...S.portraitBtn, opacity: portraitBusy ? 0.6 : 1 }} onClick={generatePortrait} disabled={portraitBusy}>
              {portraitBusy ? "🎨 Generating…" : portraitSrc ? "🎨 Regenerate portrait" : "🎨 Generate portrait"}
            </button>
            <p style={S.genHint}>
              {editId
                ? hasImage || portrait
                  ? `Regenerating costs ${portraitPrice} credits.`
                  : "This character's first portrait is free."
                : portraitFree != null && portraitFree > 0
                ? `${portraitFree} free portrait${portraitFree === 1 ? "" : "s"} left while creating, then ${portraitPrice} credits each.`
                : `Costs ${portraitPrice} credits per portrait.`}
            </p>
            {portraitErr ? <p style={S.fieldErr}>{portraitErr}{portraitPaywall ? <> <a href="/credits" style={S.errLink}>Get credits →</a></> : null}</p> : null}
          </div>
        </div>
      ) : null}

      <button type="button" style={{ ...S.genAll, opacity: genBusy ? 0.6 : 1 }} onClick={() => suggest(["look", "voice", "persona", "backstory"])} disabled={!!genBusy}>
        {genBusy === "all" ? "✨ Generating…" : "✨ Generate details for me"}
      </button>
      <p style={S.genHint}>Fills look, personality, backstory &amp; voice from the name and tags. Edit anything after.</p>
      {genErr?.where === "all" ? <p style={S.fieldErr}>{genErr.msg}</p> : null}

      <label style={S.label}>Name</label>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mara, Kai, Sable…" style={S.input} maxLength={60} />

      <label style={S.label}>Age <span style={S.hint}>(must be 18+)</span></label>
      <input value={age} onChange={(e) => setAge(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))} placeholder="e.g. 24" style={S.input} inputMode="numeric" />
      {age && !ageOk ? <p style={S.fieldErr}>Characters must be adults — enter an age of 18 or older.</p> : null}

      <FieldLabel label="Look" onSuggest={() => suggest(["look"])} busy={genBusy === "look"} disabled={!!genBusy} />
      <input value={look} onChange={(e) => setLook(e.target.value)} placeholder="how they appear — hair, style, the way they carry themselves" style={S.input} maxLength={400} />
      {genErr?.where === "look" ? <p style={S.fieldErr}>{genErr.msg}</p> : null}

      <FieldLabel label="Personality" onSuggest={() => suggest(["persona"])} busy={genBusy === "persona"} disabled={!!genBusy} />
      <textarea value={persona} onChange={(e) => setPersona(e.target.value)} placeholder="who they are — warm and teasing? guarded but loyal? quick to laugh?" style={S.textarea} maxLength={600} />
      {genErr?.where === "persona" ? <p style={S.fieldErr}>{genErr.msg}</p> : null}

      <FieldLabel label="Backstory" onSuggest={() => suggest(["backstory"])} busy={genBusy === "backstory"} disabled={!!genBusy} />
      <textarea value={backstory} onChange={(e) => setBackstory(e.target.value)} placeholder="where they come from, what they want, what haunts them" style={S.textarea} maxLength={600} />
      {genErr?.where === "backstory" ? <p style={S.fieldErr}>{genErr.msg}</p> : null}

      <FieldLabel label="Voice & style" onSuggest={() => suggest(["voice"])} busy={genBusy === "voice"} disabled={!!genBusy} />
      <input value={voice} onChange={(e) => setVoice(e.target.value)} placeholder="how they talk — dry wit, soft-spoken, poetic, blunt…" style={S.input} maxLength={300} />
      {genErr?.where === "voice" ? <p style={S.fieldErr}>{genErr.msg}</p> : null}

      <label style={S.label}>Tags <span style={S.hint}>({tags.length}/8)</span></label>
      {tags.length ? (
        <div style={S.chips}>
          {tags.map((t) => (
            <button key={t} type="button" style={{ ...S.chip, ...S.chipOn }} onClick={() => toggleTag(t)} title="remove">{t} ✕</button>
          ))}
        </div>
      ) : null}
      <div style={S.tagAddRow}>
        <input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(tagInput); } }}
          placeholder="add your own tag"
          style={S.tagInput}
          maxLength={30}
        />
        <button type="button" style={{ ...S.tagAdd, opacity: !tagInput.trim() || tags.length >= 8 ? 0.5 : 1 }} onClick={() => addTag(tagInput)} disabled={!tagInput.trim() || tags.length >= 8}>Add</button>
      </div>
      <div style={S.chips}>
        {TAG_SUGGESTIONS.filter((t) => !tags.includes(t)).map((t) => (
          <button key={t} type="button" style={S.chip} onClick={() => toggleTag(t)}>+ {t}</button>
        ))}
      </div>

      <label style={S.label}>Preview a reply</label>
      <div style={S.previewBox}>
        <div style={S.tagAddRow}>
          <input
            value={previewMsg}
            onChange={(e) => setPreviewMsg(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); preview(); } }}
            placeholder="say something to them… (optional)"
            style={S.tagInput}
            maxLength={500}
          />
          <button type="button" style={{ ...S.tagAdd, opacity: previewBusy ? 0.5 : 1 }} onClick={preview} disabled={previewBusy}>{previewBusy ? "…" : "Preview"}</button>
        </div>
        {previewReply ? (
          <div style={S.previewReply}>
            <Avatar name={name || "?"} size={26} />
            <p style={S.previewText}>{previewReply}</p>
          </div>
        ) : (
          <p style={S.genHint}>Hear how they respond before publishing — uses the details above.</p>
        )}
        {previewErr ? <p style={S.fieldErr}>{previewErr}</p> : null}
      </div>

      {error ? <p style={S.err}>{error}</p> : null}

      <div style={S.actions}>
        <button style={{ ...S.primary, opacity: !canSave || busy ? 0.55 : 1 }} onClick={create} disabled={!canSave || busy}>
          {busy ? (editId ? "Saving…" : "Creating & drawing portrait…") : editId ? "Save changes" : "Create & write her first story →"}
        </button>
        <a href={editId ? "/characters" : "/"} style={S.cancel}>Cancel</a>
      </div>
      {editId ? null : <p style={S.foot}>We&apos;ll draw a default portrait from these details automatically — you can regenerate it later from the edit page. Next you&apos;ll set the scene for her opening story. Writing a chapter costs credits; reading is always free.</p>}
    </main>
  );
}

function FieldLabel({ label, onSuggest, busy, disabled }: { label: string; onSuggest: () => void; busy: boolean; disabled: boolean }) {
  return (
    <div style={S.labelRow}>
      <label style={{ ...S.label, margin: 0 }}>{label}</label>
      <button type="button" style={{ ...S.suggest, opacity: disabled ? 0.5 : 1 }} onClick={onSuggest} disabled={disabled}>
        {busy ? "✨ …" : "✨ Suggest"}
      </button>
    </div>
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
  labelRow: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10, margin: "18px 0 7px" },
  suggest: { background: "#231A2B", color: "#E9A06B", border: "1px solid #4a3a50", borderRadius: 999, padding: "5px 11px", cursor: "pointer", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" },
  genAll: { marginTop: 20, background: "#231A2B", color: "#E9A06B", border: "1px solid #4a3a50", borderRadius: 10, padding: "11px 16px", cursor: "pointer", fontSize: 14.5, fontWeight: 650, width: "100%" },
  genHint: { color: "#6f6276", fontSize: 12.5, margin: "8px 0 0", textAlign: "center" },
  headPortrait: { width: 54, height: 54, borderRadius: "50%", objectFit: "cover", display: "block", flexShrink: 0 },
  portraitRow: { display: "flex", alignItems: "center", gap: 16, marginTop: 18, background: "#1A121F", border: "1px solid #3A2E44", borderRadius: 14, padding: 16 },
  portraitBig: { width: 96, height: 128, borderRadius: 12, objectFit: "cover", display: "block", flexShrink: 0, background: "#231A2B" },
  portraitPlaceholder: { width: 96, height: 128, borderRadius: 12, display: "grid", placeItems: "center", textAlign: "center", background: "#231A2B", border: "1px dashed #4a3a50", color: "#6f6276", fontSize: 12, flexShrink: 0, padding: 8 },
  portraitCol: { display: "flex", flexDirection: "column", gap: 2 },
  portraitBtn: { background: "#231A2B", color: "#E9A06B", border: "1px solid #4a3a50", borderRadius: 10, padding: "10px 16px", cursor: "pointer", fontSize: 14, fontWeight: 650, alignSelf: "flex-start" },
  portraitOutfit: { width: "100%", background: "#1A121F", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 9, padding: "9px 12px", fontSize: 13.5, boxSizing: "border-box", marginBottom: 10 },
  tagAddRow: { display: "flex", gap: 8, margin: "0 0 10px" },
  tagInput: { flex: 1, background: "#1A121F", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 9, padding: "9px 12px", fontSize: 14, boxSizing: "border-box" },
  tagAdd: { background: "#231A2B", color: "#E9A06B", border: "1px solid #4a3a50", borderRadius: 9, padding: "9px 15px", cursor: "pointer", fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap" },
  previewBox: { background: "#1A121F", border: "1px solid #3A2E44", borderRadius: 12, padding: 14 },
  previewReply: { display: "flex", gap: 10, marginTop: 12, alignItems: "flex-start" },
  previewText: { margin: 0, color: "#EadFe6", fontSize: 14.5, lineHeight: 1.5, background: "#231A2B", border: "1px solid #3A2E44", borderRadius: 12, borderTopLeftRadius: 3, padding: "10px 13px" },
  hint: { color: "#6f6276", letterSpacing: 0, textTransform: "none", fontWeight: 400 },
  input: { width: "100%", background: "#1A121F", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 10, padding: "12px 14px", fontSize: 15, boxSizing: "border-box", fontFamily: "inherit" },
  textarea: { width: "100%", minHeight: 74, resize: "vertical", background: "#1A121F", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 10, padding: "12px 14px", fontSize: 15, boxSizing: "border-box", fontFamily: "inherit", lineHeight: 1.5 },
  chips: { display: "flex", flexWrap: "wrap", gap: 8 },
  chip: { background: "#231A2B", color: "#CBBBD0", border: "1px solid #3A2E44", borderRadius: 999, padding: "8px 13px", cursor: "pointer", fontSize: 13.5 },
  chipOn: { background: "linear-gradient(100deg,#E9A06B,#D46A8B)", color: "#1A1220", border: "1px solid transparent", fontWeight: 600 },
  err: { color: "#E88", fontSize: 14, margin: "16px 0 0" },
  errLink: { color: "#E9A06B", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" },
  fieldErr: { color: "#E88", fontSize: 13, margin: "6px 0 0" },
  actions: { display: "flex", alignItems: "center", gap: 16, marginTop: 26 },
  primary: { border: 0, cursor: "pointer", color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", borderRadius: 12, padding: "13px 22px", fontWeight: 650, fontSize: 15.5 },
  cancel: { color: "#8A7A90", textDecoration: "none", fontSize: 14 },
  foot: { color: "#6f6276", fontSize: 13, marginTop: 18 },
};
