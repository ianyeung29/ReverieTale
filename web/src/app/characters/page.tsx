"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { EntryGate } from "@/components/EntryGate";

type Char = { id: string; name: string; persona: string; tags: string[]; status: string };

export default function MyCharactersPage() {
  const [authEmail, setAuthEmail] = useState<string | null | undefined>(undefined);
  const [items, setItems] = useState<Char[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [savedName, setSavedName] = useState("");
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      setAuthEmail(d.user?.email ?? null);
      setDisplayName(d.user?.displayName ?? "");
      setSavedName(d.user?.displayName ?? "");
    }).catch(() => setAuthEmail(null));
  }, []);

  async function saveName() {
    if (savingName || displayName === savedName) return;
    setSavingName(true);
    try {
      const res = await fetch("/api/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ displayName: displayName.trim() }) });
      if (res.ok) setSavedName(displayName.trim());
    } catch {} finally { setSavingName(false); }
  }

  function load() {
    fetch("/api/characters/mine").then((r) => (r.ok ? r.json() : [])).then((d: Char[]) => setItems(Array.isArray(d) ? d : [])).catch(() => setItems([]));
  }
  useEffect(() => { if (authEmail) load(); }, [authEmail]);

  async function toggle(c: Char) {
    if (busyId) return;
    const next = c.status === "published" ? "disabled" : "published";
    setBusyId(c.id);
    try {
      const res = await fetch(`/api/characters/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (res.ok) setItems((cur) => (cur ? cur.map((x) => (x.id === c.id ? { ...x, status: next } : x)) : cur));
    } catch {} finally { setBusyId(null); }
  }

  if (authEmail === undefined) return <main style={S.wrap}><p style={{ color: "#AC9CB0" }}>Loading…</p></main>;
  if (authEmail === null) return <EntryGate onDone={(e) => setAuthEmail(e)} subtitle="Sign in to manage your companions. 18+ only." />;

  return (
    <main style={S.wrap}>
      <a href="/" style={S.back}>← Reverie</a>
      <div style={S.titleRow}>
        <h1 style={S.h1}>Your companions</h1>
        <a href="/create" style={S.newBtn}>＋ Create a companion</a>
      </div>
      <p style={S.sub}>Every published companion can be met in stories and chats — and earns you credits when readers talk to them.</p>

      <div style={S.nameBox}>
        <label style={S.nameLabel}>Displayed as</label>
        <input style={S.nameInput} value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="a public creator name (optional)" maxLength={40} />
        <button style={{ ...S.nameSave, opacity: savingName || displayName.trim() === savedName.trim() ? 0.5 : 1 }} onClick={saveName} disabled={savingName || displayName.trim() === savedName.trim()}>
          {savingName ? "Saving…" : displayName.trim() === savedName.trim() ? "Saved" : "Save"}
        </button>
        <span style={S.nameHint}>Shown as the creator on your companions&apos; profiles. Blank = &quot;Anonymous creator.&quot; Your email is never shown.</span>
      </div>

      {items === null ? (
        <p style={S.muted}>Loading…</p>
      ) : items.length === 0 ? (
        <p style={S.muted}>You haven&apos;t created a companion yet. <a href="/create" style={S.link}>Create your first →</a></p>
      ) : (
        <div style={S.grid}>
          {items.map((c) => {
            const live = c.status === "published";
            return (
              <div key={c.id} style={S.card}>
                <div style={S.head}>
                  <Avatar name={c.name} size={40} />
                  <div style={S.headText}>
                    <div style={S.name}>{c.name}</div>
                    <span style={{ ...S.badge, ...(live ? S.badgeLive : S.badgeOff) }}>{live ? "Published" : "Unpublished"}</span>
                  </div>
                </div>
                {c.persona ? <p style={S.persona}>{c.persona}</p> : null}
                {c.tags.length ? <div style={S.tags}>{c.tags.map((t) => <span key={t} style={S.tag}>{t}</span>)}</div> : null}
                <div style={S.actions}>
                  <a href={`/create?id=${c.id}`} style={S.action}>Edit</a>
                  {live ? <a href={`/story?characterId=${c.id}`} style={S.action}>Write a story</a> : null}
                  <button style={{ ...S.action, ...S.toggle, opacity: busyId === c.id ? 0.5 : 1 }} onClick={() => toggle(c)} disabled={busyId === c.id}>
                    {live ? "Unpublish" : "Publish"}
                  </button>
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
  h1: { fontFamily: "Georgia, serif", fontSize: 38, margin: 0 },
  newBtn: { color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", padding: "10px 16px", borderRadius: 10, fontWeight: 650, textDecoration: "none", fontSize: 14, whiteSpace: "nowrap" },
  sub: { color: "#AC9CB0", margin: "0 0 20px", fontSize: 14.5 },
  nameBox: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, background: "#1C1422", border: "1px solid #3A2E44", borderRadius: 12, padding: "14px 16px", margin: "0 0 28px" },
  nameLabel: { fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase", color: "#8A7A90", fontWeight: 700 },
  nameInput: { flex: "1 1 200px", background: "#1A121F", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 9, padding: "9px 12px", fontSize: 14 },
  nameSave: { color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", border: 0, borderRadius: 9, padding: "9px 16px", cursor: "pointer", fontWeight: 650, fontSize: 13.5 },
  nameHint: { flexBasis: "100%", color: "#6f6276", fontSize: 12.5 },
  muted: { color: "#AC9CB0" },
  link: { color: "#E9A06B" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 },
  card: { display: "flex", flexDirection: "column", gap: 11, background: "#1C1422", border: "1px solid #3A2E44", borderRadius: 14, padding: 17 },
  head: { display: "flex", alignItems: "center", gap: 11 },
  headText: { display: "flex", flexDirection: "column", gap: 4 },
  name: { fontFamily: "Georgia, serif", fontSize: 18, lineHeight: 1.1, color: "#F4EAF0" },
  badge: { fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 700, padding: "2px 8px", borderRadius: 999, width: "fit-content" },
  badgeLive: { color: "#8FE0B0", background: "rgba(70,150,110,.16)", border: "1px solid #2f6b4c" },
  badgeOff: { color: "#AC9CB0", background: "rgba(120,110,130,.12)", border: "1px solid #4a3a50" },
  persona: { color: "#AC9CB0", fontSize: 13.5, margin: 0, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" },
  tags: { display: "flex", flexWrap: "wrap", gap: 6 },
  tag: { fontSize: 11.5, color: "#CBBBD0", background: "#231A2B", border: "1px solid #3A2E44", borderRadius: 999, padding: "3px 9px" },
  actions: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: "auto", paddingTop: 6 },
  action: { fontSize: 13, color: "#E9A06B", background: "transparent", border: "1px solid #4a3a50", borderRadius: 8, padding: "7px 12px", cursor: "pointer", textDecoration: "none" },
  toggle: { color: "#CBBBD0" },
};
