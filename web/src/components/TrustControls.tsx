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

/**
 * A small "Report" link that opens a reason + note form. Works for any target.
 * When `hideCharacterId` is given (and not already hidden), the form also
 * offers a one-click "hide this companion too" - the combined action a
 * reporter usually actually wants, instead of two separate trips.
 */
export function ReportLink({
  targetType,
  targetId,
  hideCharacterId,
  hideAlreadyHidden,
  hideLabel,
}: {
  targetType: "character" | "story";
  targetId: string;
  hideCharacterId?: string;
  hideAlreadyHidden?: boolean;
  hideLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0].value);
  const [note, setNote] = useState("");
  const [alsoHide, setAlsoHide] = useState(true);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [hidNow, setHidNow] = useState(false);
  const [err, setErr] = useState("");

  const offerHide = Boolean(hideCharacterId) && !hideAlreadyHidden;

  async function submit() {
    if (busy) return;
    setBusy(true); setErr("");
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId, reason, note: note.trim() || undefined }),
      });
      if (!res.ok) {
        setErr(res.status === 401 ? "Sign in to report content." : "Couldn't submit — try again.");
        return;
      }
      if (offerHide && alsoHide && hideCharacterId) {
        try {
          const hr = await fetch(`/api/characters/${hideCharacterId}/block`, { method: "POST" });
          const hd = await hr.json().catch(() => ({}));
          if (hr.ok && hd.blocked) setHidNow(true);
        } catch {
          /* the report itself still succeeded; hiding is a bonus step */
        }
      }
      setDone(true);
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
                <p style={T.body}>
                  A moderator will take a look. This doesn&apos;t remove the content on its own.
                  {hidNow ? ` ${hideLabel || "It"} is also now hidden from your Browse/Home/tags.` : ""}
                </p>
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
                {offerHide ? (
                  <label style={T.checkboxRow}>
                    <input type="checkbox" checked={alsoHide} onChange={(e) => setAlsoHide(e.target.checked)} />
                    Also hide {hideLabel || "this companion"} from my own Browse/Home/tags
                  </label>
                ) : null}
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

/**
 * Toggle hiding a companion from the viewer's own discovery surfaces. Named
 * (and worded) "Hide," not "Block" - it only affects what the viewer sees; it
 * doesn't touch chat, existing conversations, or anyone else's view. That
 * distinction is stated inline, not left to a tooltip or the guidelines page.
 */
export function HideToggle({ characterId, initialHidden }: { characterId: string; initialHidden: boolean }) {
  const [hidden, setHidden] = useState(initialHidden);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    const next = !hidden;
    setHidden(next);
    try {
      const res = await fetch(`/api/characters/${characterId}/block`, { method: "POST" });
      const d = await res.json().catch(() => ({}));
      if (res.ok && typeof d.blocked === "boolean") setHidden(d.blocked);
      else setHidden(!next);
    } catch {
      setHidden(!next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <span style={T.hideGroup}>
      <button type="button" style={T.link} onClick={toggle}>
        {hidden ? "✓ Hidden for you" : "🙈 Hide"}
      </button>
      {!hidden ? <span style={T.hideCaption}>only affects your own Browse/Home — no one else</span> : null}
    </span>
  );
}

const T: Record<string, React.CSSProperties> = {
  link: { background: "transparent", border: 0, color: "#6f6276", cursor: "pointer", fontSize: 12.5, padding: 0, textDecoration: "underline", textUnderlineOffset: 3 },
  hideGroup: { display: "inline-flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" },
  hideCaption: { color: "#4a3a50", fontSize: 11.5 },
  overlay: { position: "fixed", inset: 0, zIndex: 60, background: "rgba(10,7,13,.75)", display: "grid", placeItems: "center", padding: 20 },
  card: { width: "min(380px,100%)", background: "#150F1A", border: "1px solid #3A2E44", borderRadius: 16, padding: 22, display: "flex", flexDirection: "column", gap: 4 },
  title: { fontFamily: "Georgia, serif", fontSize: 18, margin: "0 0 6px", color: "#F4EAF0" },
  body: { color: "#AC9CB0", fontSize: 14, margin: "0 0 14px", lineHeight: 1.5 },
  label: { fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "#8A7A90", fontWeight: 700, margin: "10px 0 6px" },
  select: { width: "100%", background: "#1A121F", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 9, padding: "9px 11px", fontSize: 14 },
  textarea: { width: "100%", minHeight: 64, resize: "vertical", background: "#1A121F", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 9, padding: "9px 11px", fontSize: 14, boxSizing: "border-box", fontFamily: "inherit" },
  checkboxRow: { display: "flex", alignItems: "center", gap: 8, color: "#CBBBD0", fontSize: 13.5, margin: "12px 0 0", cursor: "pointer" },
  err: { color: "#E88", fontSize: 13, margin: "8px 0 0" },
  actions: { display: "flex", gap: 10, marginTop: 16 },
  primary: { border: 0, cursor: "pointer", color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", borderRadius: 10, padding: "10px 18px", fontWeight: 650, fontSize: 14 },
  cancel: { background: "transparent", border: 0, color: "#8A7A90", cursor: "pointer", fontSize: 14 },
};
