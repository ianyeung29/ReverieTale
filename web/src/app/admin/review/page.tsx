"use client";

import { useEffect, useState } from "react";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { Section } from "@/components/Section";

type Pending = {
  id: string;
  name: string;
  look: string;
  persona: string;
  backstory: string;
  voice: string;
  tags: string[];
  reviewNote: string;
  creator: string;
};

type Report = {
  id: string;
  targetType: "character" | "story";
  targetId: string;
  targetTitle: string;
  targetLive: boolean;
  reason: string;
  note: string;
  createdAt: string;
};

type ResolvedReport = {
  id: string;
  targetType: "character" | "story";
  targetId: string;
  targetTitle: string;
  reason: string;
  note: string;
  internalNote: string;
  resolution: string | null;
  resolvedAt: string | null;
  createdAt: string;
};

type Feedback = {
  id: string;
  kind: "idea" | "issue" | "general";
  message: string;
  pagePath: string | null;
  createdAt: string;
  email: string;
};

const REASON_LABELS: Record<string, string> = {
  minor_safety: "Underage or age-ambiguous",
  real_person: "Impersonates a real person",
  illegal: "Illegal or non-consensual content",
  hateful: "Hateful or abusive",
  other: "Something else",
};

const FEEDBACK_LABELS: Record<Feedback["kind"], string> = {
  idea: "Idea or feature request",
  issue: "Something is not working",
  general: "General feedback",
};

export default function AdminReviewPage() {
  const [items, setItems] = useState<Pending[] | null>(null);
  const [reports, setReports] = useState<Report[] | null>(null);
  const [resolved, setResolved] = useState<ResolvedReport[] | null>(null);
  const [feedback, setFeedback] = useState<Feedback[] | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  function load() {
    fetch("/api/admin/review")
      .then((r) => {
        if (r.status === 403) { setForbidden(true); return []; }
        return r.ok ? r.json() : [];
      })
      .then((d: Pending[]) => setItems(Array.isArray(d) ? d : []))
      .catch(() => setItems([]));
    fetch("/api/admin/reports")
      .then((r) => (r.ok ? r.json() : []))
      .then((d: Report[]) => setReports(Array.isArray(d) ? d : []))
      .catch(() => setReports([]));
    fetch("/api/admin/reports?status=resolved")
      .then((r) => (r.ok ? r.json() : []))
      .then((d: ResolvedReport[]) => setResolved(Array.isArray(d) ? d : []))
      .catch(() => setResolved([]));
    fetch("/api/admin/feedback")
      .then((r) => (r.ok ? r.json() : []))
      .then((d: Feedback[]) => setFeedback(Array.isArray(d) ? d : []))
      .catch(() => setFeedback([]));
  }
  useEffect(() => { load(); }, []);

  async function resolve(id: string, action: "approve" | "reject") {
    if (busyId) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/review/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) setItems((cur) => (cur ? cur.filter((x) => x.id !== id) : cur));
    } catch {} finally { setBusyId(null); }
  }

  // Resolving a report can also take the target down in the same step
  // ("unpublish"), and always records the moderator's note for the record -
  // "Mark resolved" alone used to be the only trace a report was ever acted on.
  async function act(id: string, action: "unpublish" | "dismiss") {
    if (busyId) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note: notes[id]?.trim() || undefined }),
      });
      if (res.ok) {
        setReports((cur) => (cur ? cur.filter((x) => x.id !== id) : cur));
        setNotes((cur) => { const c = { ...cur }; delete c[id]; return c; });
        fetch("/api/admin/reports?status=resolved").then((r) => (r.ok ? r.json() : [])).then((d: ResolvedReport[]) => setResolved(Array.isArray(d) ? d : [])).catch(() => {});
      }
    } catch {} finally { setBusyId(null); }
  }

  async function reviewFeedback(id: string) {
    if (busyId) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/feedback/${id}`, { method: "POST" });
      if (res.ok) setFeedback((cur) => (cur ? cur.filter((item) => item.id !== id) : cur));
    } catch {} finally { setBusyId(null); }
  }

  if (forbidden) {
    return <main style={S.wrap}><a href="/" style={S.back}>← ReverieTale</a><p style={{ color: "#AC9CB0", marginTop: 24 }}>This page is for moderators only.</p></main>;
  }

  return (
    <main style={S.wrap}>
      <a href="/" style={S.back}>← ReverieTale</a>
      <h1 style={S.h1}>Review queue</h1>
      <p style={S.sub}>Companions held for a human check. Approve to publish, reject to keep them off the platform.</p>

      {items === null ? (
        <p style={S.muted}>Loading…</p>
      ) : items.length === 0 ? (
        <p style={S.muted}>Nothing waiting. The queue is clear. ✨</p>
      ) : (
        <div style={S.list}>
          {items.map((c) => (
            <div key={c.id} className="rv-card" style={S.card}>
              <div style={S.head}>
                <CharacterAvatar characterId={c.id} name={c.name} size={44} />
                <div>
                  <div style={S.name}>{c.name}</div>
                  <div style={S.by}>by {c.creator}</div>
                </div>
              </div>

              {c.reviewNote ? <div style={S.flag}>⚑ {c.reviewNote}</div> : null}
              {c.tags.length ? <div style={S.tags}>{c.tags.map((t) => <span key={t} style={S.tag}>{t}</span>)}</div> : null}
              {c.look ? <Field label="Look" value={c.look} /> : null}
              {c.persona ? <Field label="Personality" value={c.persona} /> : null}
              {c.backstory ? <Field label="Backstory" value={c.backstory} /> : null}
              {c.voice ? <Field label="Voice" value={c.voice} /> : null}

              <div style={S.actions}>
                <button style={{ ...S.approve, opacity: busyId === c.id ? 0.5 : 1 }} onClick={() => resolve(c.id, "approve")} disabled={busyId === c.id}>Approve</button>
                <button style={{ ...S.reject, opacity: busyId === c.id ? 0.5 : 1 }} onClick={() => resolve(c.id, "reject")} disabled={busyId === c.id}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h1 style={{ ...S.h1, marginTop: 44 }}>Reports</h1>
      <p style={S.sub}>Content readers have flagged. Unpublish removes it from discovery in the same step; either way, your note is kept with the report.</p>

      {reports === null ? (
        <p style={S.muted}>Loading…</p>
      ) : reports.length === 0 ? (
        <p style={S.muted}>No open reports. ✨</p>
      ) : (
        <div style={S.list}>
          {reports.map((r) => (
            <div key={r.id} className="rv-card" style={S.card}>
              <div style={S.head}>
                <div>
                  <div style={S.name}>
                    <a href={r.targetType === "character" ? `/c/${r.targetId}` : `/story/${r.targetId}`} style={S.targetLink}>{r.targetTitle}</a>
                    <span style={{ ...S.liveBadge, ...(r.targetLive ? S.liveBadgeOn : S.liveBadgeOff) }}>
                      {r.targetLive ? (r.targetType === "character" ? "Published" : "Public") : (r.targetType === "character" ? "Disabled" : "Unlisted")}
                    </span>
                  </div>
                  <div style={S.by}>{r.targetType} · reported {new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              <div style={S.flag}>⚑ {REASON_LABELS[r.reason] ?? r.reason}</div>
              {r.note ? <Field label="Reporter's note" value={r.note} /> : null}

              <label style={S.noteLabel}>Internal note <span style={S.hint}>(kept with the report, not shown to anyone)</span></label>
              <textarea
                value={notes[r.id] ?? ""}
                onChange={(e) => setNotes((cur) => ({ ...cur, [r.id]: e.target.value }))}
                placeholder="what you checked and why — e.g. reviewed the profile, no minors depicted, dismissing"
                style={S.noteInput}
                maxLength={1000}
              />

              <div style={S.actions}>
                {r.targetLive ? (
                  <>
                    <button style={{ ...S.reject, opacity: busyId === r.id ? 0.5 : 1 }} onClick={() => act(r.id, "unpublish")} disabled={busyId === r.id}>Unpublish &amp; resolve</button>
                    <button style={{ ...S.approve, opacity: busyId === r.id ? 0.5 : 1 }} onClick={() => act(r.id, "dismiss")} disabled={busyId === r.id}>Leave live &amp; resolve</button>
                  </>
                ) : (
                  <button style={{ ...S.approve, opacity: busyId === r.id ? 0.5 : 1 }} onClick={() => act(r.id, "dismiss")} disabled={busyId === r.id}>Resolve</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <h1 style={{ ...S.h1, marginTop: 44 }}>Feedback</h1>
      <p style={S.sub}>Private notes about the product from signed-in readers. Marking an item reviewed clears it from this inbox.</p>
      {feedback === null ? (
        <p style={S.muted}>Loading...</p>
      ) : feedback.length === 0 ? (
        <p style={S.muted}>No open feedback. Nice and quiet.</p>
      ) : (
        <div style={S.list}>
          {feedback.map((item) => (
            <div key={item.id} className="rv-card" style={S.card}>
              <div style={S.name}>{FEEDBACK_LABELS[item.kind]}</div>
              <div style={S.by}>{item.email} · {new Date(item.createdAt).toLocaleDateString()}{item.pagePath ? ` · from ${item.pagePath}` : ""}</div>
              <p style={S.fieldValue}>{item.message}</p>
              <div style={S.actions}>
                <button style={{ ...S.approve, opacity: busyId === item.id ? 0.5 : 1 }} onClick={() => reviewFeedback(item.id)} disabled={busyId === item.id}>Mark reviewed</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Section title={`Recently resolved${resolved?.length ? ` · ${resolved.length}` : ""}`} defaultOpen={false}>
        {resolved === null ? (
          <p style={S.muted}>Loading…</p>
        ) : resolved.length === 0 ? (
          <p style={S.muted}>Nothing resolved yet.</p>
        ) : (
          <div style={S.list}>
            {resolved.map((r) => (
              <div key={r.id} style={S.historyRow}>
                <div style={S.head}>
                  <div>
                    <div style={S.name}>
                      <a href={r.targetType === "character" ? `/c/${r.targetId}` : `/story/${r.targetId}`} style={S.targetLink}>{r.targetTitle}</a>
                      <span style={{ ...S.liveBadge, ...(r.resolution === "unpublished" ? S.liveBadgeOff : S.liveBadgeOn) }}>
                        {r.resolution === "unpublished" ? "Unpublished" : "Dismissed"}
                      </span>
                    </div>
                    <div style={S.by}>
                      {r.targetType} · {REASON_LABELS[r.reason] ?? r.reason} · resolved {r.resolvedAt ? new Date(r.resolvedAt).toLocaleDateString() : ""}
                    </div>
                  </div>
                </div>
                {r.internalNote ? <p style={S.historyNote}>{r.internalNote}</p> : null}
              </div>
            ))}
          </div>
        )}
      </Section>
    </main>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={S.field}>
      <span style={S.fieldLabel}>{label}</span>
      <p style={S.fieldValue}>{value}</p>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 720, margin: "0 auto", padding: "40px 24px 90px", lineHeight: 1.6 },
  back: { color: "#8A7A90", textDecoration: "none", fontSize: 14, letterSpacing: ".04em" },
  h1: { fontFamily: "Georgia, serif", fontSize: 36, margin: "22px 0 6px" },
  sub: { color: "#AC9CB0", margin: "0 0 26px", fontSize: 14.5 },
  muted: { color: "#AC9CB0" },
  list: { display: "flex", flexDirection: "column", gap: 16 },
  card: { background: "#241B2D", border: "1px solid #3A2E44", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 12 },
  head: { display: "flex", alignItems: "center", gap: 12 },
  name: { fontFamily: "Georgia, serif", fontSize: 21, color: "#F4EAF0", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  targetLink: { color: "#F4EAF0", textDecoration: "none" },
  by: { color: "#8A7A90", fontSize: 13 },
  flag: { background: "#2A1A1E", border: "1px solid #6b3a44", borderRadius: 10, padding: "9px 13px", color: "#F0C9B0", fontSize: 13.5 },
  tags: { display: "flex", flexWrap: "wrap", gap: 6 },
  tag: { fontSize: 11.5, color: "#E9A06B", border: "1px solid #4a3a50", borderRadius: 999, padding: "2px 9px" },
  field: { display: "flex", flexDirection: "column", gap: 3 },
  fieldLabel: { fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "#8A7A90", fontWeight: 700 },
  liveBadge: { fontFamily: "inherit", fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase", fontWeight: 700, padding: "2px 8px", borderRadius: 999 },
  liveBadgeOn: { color: "#8FE0B0", background: "rgba(70,150,110,.16)", border: "1px solid #2f6b4c" },
  liveBadgeOff: { color: "#AC9CB0", background: "rgba(120,110,130,.12)", border: "1px solid #4a3a50" },
  noteLabel: { fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "#8A7A90", fontWeight: 700, margin: 0 },
  hint: { color: "#6f6276", letterSpacing: 0, textTransform: "none", fontWeight: 400 },
  noteInput: { width: "100%", minHeight: 56, resize: "vertical", background: "#1A121F", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 9, padding: "9px 12px", fontSize: 13.5, boxSizing: "border-box", fontFamily: "inherit", lineHeight: 1.5 },
  historyRow: { display: "flex", flexDirection: "column", gap: 8, borderBottom: "1px solid #2f2438", paddingBottom: 14 },
  historyNote: { color: "#AC9CB0", fontSize: 13, margin: 0, lineHeight: 1.5 },
  fieldValue: { color: "#EadFe6", fontSize: 14.5, margin: 0, whiteSpace: "pre-wrap" },
  actions: { display: "flex", gap: 10, marginTop: 4 },
  approve: { border: 0, cursor: "pointer", color: "#1A1220", background: "linear-gradient(100deg,#7BD6A0,#4FB3C9)", borderRadius: 10, padding: "10px 20px", fontWeight: 650, fontSize: 14 },
  reject: { border: "1px solid #6b3a44", cursor: "pointer", color: "#F0A9B0", background: "transparent", borderRadius: 10, padding: "10px 20px", fontWeight: 600, fontSize: 14 },
};
