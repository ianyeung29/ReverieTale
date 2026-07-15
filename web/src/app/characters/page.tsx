"use client";

import { useEffect, useState } from "react";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { EntryGate } from "@/components/EntryGate";
import { MIN_AGE } from "@/lib/legal";

type Char = { id: string; name: string; persona: string; greeting?: string; tags: string[]; status: string };

export default function MyCharactersPage() {
  const [authEmail, setAuthEmail] = useState<string | null | undefined>(undefined);
  const [items, setItems] = useState<Char[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      setAuthEmail(d.user?.email ?? null);
    }).catch(() => setAuthEmail(null));
  }, []);

  function load() {
    fetch("/api/characters/mine").then((r) => (r.ok ? r.json() : [])).then((d: Char[]) => setItems(Array.isArray(d) ? d : [])).catch(() => setItems([]));
  }
  useEffect(() => { if (authEmail) load(); }, [authEmail]);

  async function patchStatus(c: Char, target: "published" | "disabled") {
    if (busyId) return;
    setBusyId(c.id);
    try {
      const res = await fetch(`/api/characters/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: target }),
      });
      const d = await res.json().catch(() => ({}));
      // Resubmit may auto-publish or land back in review; trust the server's status.
      if (res.ok) setItems((cur) => (cur ? cur.map((x) => (x.id === c.id ? { ...x, status: d.status ?? target } : x)) : cur));
    } catch {} finally { setBusyId(null); }
  }

  async function deleteChar(c: Char) {
    if (busyId) return;
    if (!confirm(`Delete ${c.name}? If anyone has already written a story or chatted with them, ${c.name} will be hidden instead of removed, to keep that content intact.`)) return;
    setBusyId(c.id);
    try {
      const res = await fetch(`/api/characters/${c.id}`, { method: "DELETE" });
      const d = await res.json().catch(() => ({}));
      if (res.ok && d.deleted) {
        setItems((cur) => (cur ? cur.filter((x) => x.id !== c.id) : cur));
      } else if (res.ok && d.hidden) {
        // Couldn't hard-delete (character has activity) - it was hidden instead.
        setItems((cur) => (cur ? cur.map((x) => (x.id === c.id ? { ...x, status: "disabled" } : x)) : cur));
      }
    } catch {} finally { setBusyId(null); }
  }

  if (authEmail === undefined) return <main style={S.wrap}><p style={{ color: "#AC9CB0" }}>Loading…</p></main>;
  if (authEmail === null) return <EntryGate onDone={(e) => setAuthEmail(e)} subtitle={`Sign in to manage your companions. ${MIN_AGE}+ only.`} />;

  return (
    <main style={S.wrap}>
      <a href="/" style={S.back}>← ReverieTale</a>
      <div style={S.titleRow}>
        <h1 style={S.h1}>Your companions</h1>
        <div style={S.titleActions}>
          <a href="/create" className="rv-btn rv-btn-primary" style={S.newBtn}>＋ Create a companion</a>
        </div>
      </div>
      <p style={S.sub}>Every published companion can be met in stories and chats — and earns you credits when readers talk to them. Your creator name and hidden companions live on your <a href="/profile" style={S.link}>profile</a>.</p>

      {items === null ? (
        <p style={S.muted}>Loading…</p>
      ) : items.length === 0 ? (
        <div style={S.emptyPanel}>
          <div style={S.emptyIcon}>🎭</div>
          <p style={S.emptyTitle}>No companions yet</p>
          <p style={S.emptyBody}>Create your first companion — give them a look, a voice, and a story. Readers who chat with them earn you credits.</p>
          <a href="/create" style={S.emptyBtn}>Create a companion →</a>
        </div>
      ) : (
        <div style={S.grid}>
          {items.map((c) => {
            const inReview = c.status === "in_review";
            const live = c.status === "published";
            const badge = live ? { label: "Published", st: S.badgeLive } : inReview ? { label: "In review", st: S.badgeReview } : { label: "Unpublished", st: S.badgeOff };
            return (
              <div key={c.id} className="rv-card" style={S.card}>
                <div style={S.head}>
                  <div style={S.portraitWrap}><CharacterAvatar characterId={c.id} name={c.name} shape="rect" /></div>
                  <div style={S.headText}>
                    <div style={S.name}>{c.name}</div>
                    <span style={{ ...S.badge, ...badge.st }}>{badge.label}</span>
                  </div>
                </div>
                {c.greeting ? <p style={S.greeting}>&ldquo;{c.greeting}&rdquo;</p> : c.persona ? <p style={S.persona}>{c.persona}</p> : null}
                {inReview ? <p style={S.reviewHint}>Awaiting a safety check before it goes public.</p> : null}
                {c.tags.length ? <div style={S.tags}>{c.tags.map((t) => <span key={t} style={S.tag}>{t}</span>)}</div> : null}
                <div style={S.actions}>
                  <a href={`/create?id=${c.id}`} style={S.action}>Edit</a>
                  {live ? <a href={`/story?characterId=${c.id}`} style={S.action}>Write a story</a> : null}
                  {live ? (
                    <button style={{ ...S.action, ...S.toggle, opacity: busyId === c.id ? 0.5 : 1 }} onClick={() => patchStatus(c, "disabled")} disabled={busyId === c.id}>Unpublish</button>
                  ) : c.status === "disabled" ? (
                    <button style={{ ...S.action, opacity: busyId === c.id ? 0.5 : 1 }} onClick={() => patchStatus(c, "published")} disabled={busyId === c.id}>Resubmit</button>
                  ) : null}
                  <button style={{ ...S.action, ...S.delete, opacity: busyId === c.id ? 0.5 : 1 }} onClick={() => deleteChar(c)} disabled={busyId === c.id}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 820, margin: "0 auto", padding: "40px 24px 90px", lineHeight: 1.6 },
  back: { color: "#8A7A90", textDecoration: "none", fontSize: 14, letterSpacing: ".04em" },
  titleRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", margin: "22px 0 6px" },
  titleActions: { display: "flex", alignItems: "center", gap: 12 },
  h1: { fontFamily: "Georgia, serif", fontSize: 38, margin: 0 },
  newBtn: { color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", padding: "10px 16px", borderRadius: 10, fontWeight: 650, textDecoration: "none", fontSize: 14, whiteSpace: "nowrap" },
  sub: { color: "#AC9CB0", margin: "0 0 20px", fontSize: 14.5 },
  muted: { color: "#AC9CB0" },
  link: { color: "#E9A06B" },
  emptyPanel: { textAlign: "center", background: "#1A1420", border: "1px solid #2f2438", borderRadius: 18, padding: "44px 24px" },
  emptyIcon: { fontSize: 34 },
  emptyTitle: { fontFamily: "Georgia, serif", fontSize: 24, margin: "10px 0 6px", color: "#F4EAF0" },
  emptyBody: { color: "#AC9CB0", fontSize: 15, margin: "0 auto 20px", maxWidth: 440 },
  emptyBtn: { color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", padding: "12px 20px", borderRadius: 11, fontWeight: 650, textDecoration: "none", fontSize: 14.5 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 },
  card: { display: "flex", flexDirection: "column", gap: 11, background: "#241B2D", border: "1px solid #3A2E44", borderRadius: 14, padding: 17 },
  head: { display: "flex", alignItems: "flex-start", gap: 12 },
  portraitWrap: { width: 64, flexShrink: 0 },
  headText: { display: "flex", flexDirection: "column", gap: 4, paddingTop: 2 },
  name: { fontFamily: "Georgia, serif", fontSize: 18, lineHeight: 1.1, color: "#F4EAF0" },
  badge: { fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 700, padding: "2px 8px", borderRadius: 999, width: "fit-content" },
  badgeLive: { color: "#8FE0B0", background: "rgba(70,150,110,.16)", border: "1px solid #2f6b4c" },
  badgeReview: { color: "#F0C99A", background: "rgba(180,130,70,.16)", border: "1px solid #6b5330" },
  badgeOff: { color: "#AC9CB0", background: "rgba(120,110,130,.12)", border: "1px solid #4a3a50" },
  reviewHint: { color: "#C9A98A", fontSize: 12.5, margin: 0 },
  persona: { color: "#AC9CB0", fontSize: 13.5, margin: 0, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" },
  greeting: { color: "#CBBBD0", fontSize: 13.5, fontStyle: "italic", margin: 0, lineHeight: 1.5, borderLeft: "2px solid #E9A06B", paddingLeft: 9 },
  tags: { display: "flex", flexWrap: "wrap", gap: 6 },
  tag: { fontSize: 11.5, color: "#CBBBD0", background: "#231A2B", border: "1px solid #3A2E44", borderRadius: 999, padding: "3px 9px" },
  actions: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: "auto", paddingTop: 6 },
  action: { fontSize: 13, color: "#E9A06B", background: "transparent", border: "1px solid #4a3a50", borderRadius: 8, padding: "7px 12px", cursor: "pointer", textDecoration: "none" },
  toggle: { color: "#CBBBD0" },
  delete: { color: "#E08A8A", borderColor: "#5a3540", marginLeft: "auto" },
};
