"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";

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

export default function AdminReviewPage() {
  const [items, setItems] = useState<Pending[] | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    fetch("/api/admin/review")
      .then((r) => {
        if (r.status === 403) { setForbidden(true); return []; }
        return r.ok ? r.json() : [];
      })
      .then((d: Pending[]) => setItems(Array.isArray(d) ? d : []))
      .catch(() => setItems([]));
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

  if (forbidden) {
    return <main style={S.wrap}><a href="/" style={S.back}>← Reverie</a><p style={{ color: "#AC9CB0", marginTop: 24 }}>This page is for moderators only.</p></main>;
  }

  return (
    <main style={S.wrap}>
      <a href="/" style={S.back}>← Reverie</a>
      <h1 style={S.h1}>Review queue</h1>
      <p style={S.sub}>Companions held for a human check. Approve to publish, reject to keep them off the platform.</p>

      {items === null ? (
        <p style={S.muted}>Loading…</p>
      ) : items.length === 0 ? (
        <p style={S.muted}>Nothing waiting. The queue is clear. ✨</p>
      ) : (
        <div style={S.list}>
          {items.map((c) => (
            <div key={c.id} style={S.card}>
              <div style={S.head}>
                <Avatar name={c.name} size={44} />
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
  card: { background: "#1C1422", border: "1px solid #3A2E44", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 12 },
  head: { display: "flex", alignItems: "center", gap: 12 },
  name: { fontFamily: "Georgia, serif", fontSize: 21, color: "#F4EAF0" },
  by: { color: "#8A7A90", fontSize: 13 },
  flag: { background: "#2A1A1E", border: "1px solid #6b3a44", borderRadius: 10, padding: "9px 13px", color: "#F0C9B0", fontSize: 13.5 },
  tags: { display: "flex", flexWrap: "wrap", gap: 6 },
  tag: { fontSize: 11.5, color: "#E9A06B", border: "1px solid #4a3a50", borderRadius: 999, padding: "2px 9px" },
  field: { display: "flex", flexDirection: "column", gap: 3 },
  fieldLabel: { fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "#8A7A90", fontWeight: 700 },
  fieldValue: { color: "#EadFe6", fontSize: 14.5, margin: 0, whiteSpace: "pre-wrap" },
  actions: { display: "flex", gap: 10, marginTop: 4 },
  approve: { border: 0, cursor: "pointer", color: "#1A1220", background: "linear-gradient(100deg,#7BD6A0,#4FB3C9)", borderRadius: 10, padding: "10px 20px", fontWeight: 650, fontSize: 14 },
  reject: { border: "1px solid #6b3a44", cursor: "pointer", color: "#F0A9B0", background: "transparent", borderRadius: 10, padding: "10px 20px", fontWeight: 600, fontSize: 14 },
};
