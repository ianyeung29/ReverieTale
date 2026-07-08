"use client";

import { useState } from "react";

// Mirrors REPORT_REASONS in src/lib/reports.ts (kept duplicated, not imported,
// since that module pulls in server-only DB code that can't reach the client).
const REASONS = [
  { value: "minor_safety", label: "Underage or age-ambiguous" },
  { value: "real_person", label: "Impersonates a real person" },
  { value: "illegal", label: "Illegal or non-consensual content" },
  { value: "hateful", label: "Hateful or abusive" },
  { value: "other", label: "Something else" },
];

/** A small "Report" link that opens a reason + note form. Works for any target. */
export function ReportLink({ targetType, targetId }: { targetType: "character" | "story"; targetId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0].value);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  async function submit() {
    if (busy) return;
    setBusy(true); setErr("");
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId, reason, note: note.trim() || undefined }),
      });
      if (res.ok) setDone(true);
      else setErr(res.status === 401 ? "Sign in to report content." : "Couldn't submit — try again.");
    } catch {
      setErr("Network error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" style={T.link} onClick={() => setOpen(true)}>⚑ Report</button>
      {open ? (
        <div style={T.overlay} onClick={() => setOpen(false)}>
          <div style={T.card} onClick={(e) => e.stopPropagation()}>
            {done ? (
              <>
                <p style={T.title}>Thanks for flagging this</p>
                <p style={T.body}>A moderator will take a look. This doesn&apos;t remove the content on its own.</p>
                <button type="button" style={T.primary} onClick={() => setOpen(false)}>Close</button>
              </>
            ) : (
              <>
                <p style={T.title}>Report this {targetType}</p>
                <label style={T.label}>Reason</label>
                <select style={T.select} value={reason} onChange={(e) => setReason(e.target.value)}>
                  {REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
                <label style={T.label}>Details (optional)</label>
                <textarea style={T.textarea} value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} placeholder="Anything else a moderator should know" />
                {err ? <p style={T.err}>{err}</p> : null}
                <div style={T.actions}>
                  <button type="button" style={{ ...T.primary, opacity: busy ? 0.6 : 1 }} onClick={submit} disabled={busy}>{busy ? "Sending…" : "Submit report"}</button>
                  <button type="button" style={T.cancel} onClick={() => setOpen(false)}>Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

/** Toggle hiding a companion from the viewer's own discovery surfaces. */
export function BlockToggle({ characterId, initialBlocked }: { characterId: string; initialBlocked: boolean }) {
  const [blocked, setBlocked] = useState(initialBlocked);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    const next = !blocked;
    setBlocked(next);
    try {
      const res = await fetch(`/api/characters/${characterId}/block`, { method: "POST" });
      const d = await res.json().catch(() => ({}));
      if (res.ok && typeof d.blocked === "boolean") setBlocked(d.blocked);
      else setBlocked(!next);
    } catch {
      setBlocked(!next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" style={T.link} onClick={toggle} title={blocked ? "Show them again in Browse/Home/Tags" : "Hide them from your Browse/Home/Tags"}>
      {blocked ? "✓ Blocked" : "🚫 Block"}
    </button>
  );
}

const T: Record<string, React.CSSProperties> = {
  link: { background: "transparent", border: 0, color: "#6f6276", cursor: "pointer", fontSize: 12.5, padding: 0, textDecoration: "underline", textUnderlineOffset: 3 },
  overlay: { position: "fixed", inset: 0, zIndex: 60, background: "rgba(10,7,13,.75)", display: "grid", placeItems: "center", padding: 20 },
  card: { width: "min(380px,100%)", background: "#150F1A", border: "1px solid #3A2E44", borderRadius: 16, padding: 22, display: "flex", flexDirection: "column", gap: 4 },
  title: { fontFamily: "Georgia, serif", fontSize: 18, margin: "0 0 6px", color: "#F4EAF0" },
  body: { color: "#AC9CB0", fontSize: 14, margin: "0 0 14px", lineHeight: 1.5 },
  label: { fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "#8A7A90", fontWeight: 700, margin: "10px 0 6px" },
  select: { width: "100%", background: "#1A121F", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 9, padding: "9px 11px", fontSize: 14 },
  textarea: { width: "100%", minHeight: 64, resize: "vertical", background: "#1A121F", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 9, padding: "9px 11px", fontSize: 14, boxSizing: "border-box", fontFamily: "inherit" },
  err: { color: "#E88", fontSize: 13, margin: "8px 0 0" },
  actions: { display: "flex", gap: 10, marginTop: 16 },
  primary: { border: 0, cursor: "pointer", color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", borderRadius: 10, padding: "10px 18px", fontWeight: 650, fontSize: 14 },
  cancel: { background: "transparent", border: 0, color: "#8A7A90", cursor: "pointer", fontSize: 14 },
};
