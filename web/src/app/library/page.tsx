"use client";

import { useEffect, useState } from "react";
import { CharacterAvatar } from "@/components/CharacterAvatar";

type Item = { id: string; title: string; name: string; chapters: number; characterId: string; isPublic?: boolean };
type Moment = { id: string; characterId: string; name: string; dialogue: string; setting: string | null; hasImage: boolean; createdAt: string };

function StoryGrid({
  items,
  owned,
  onDelete,
  onToggleHide,
}: {
  items: Item[];
  owned?: boolean;
  onDelete?: (id: string) => void;
  onToggleHide?: (s: Item) => void;
}) {
  return (
    <div style={S.grid}>
      {items.map((s) => (
        <a key={s.id} href={`/story/${s.id}`} className="rv-card" style={S.card}>
          <div style={S.head}><CharacterAvatar characterId={s.characterId} name={s.name} size={34} /><div style={S.title}>{s.title}</div></div>
          <span style={S.meta}>
            with {s.name} · {s.chapters} chapter{s.chapters === 1 ? "" : "s"}
            {owned && s.isPublic === false ? <span style={S.hiddenTag}>Hidden</span> : null}
          </span>
          {owned ? (
            <div style={S.ownerRow}>
              <button
                style={S.ownerBtn}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleHide?.(s); }}
              >
                {s.isPublic === false ? "Unhide" : "Hide"}
              </button>
              <button
                style={{ ...S.ownerBtn, ...S.ownerDelete }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (confirm(`Delete “${s.title}”? This can't be undone.`)) onDelete?.(s.id);
                }}
              >
                Delete
              </button>
            </div>
          ) : null}
        </a>
      ))}
    </div>
  );
}

function MomentGrid({ items, onDelete }: { items: Moment[]; onDelete: (id: string) => void }) {
  return (
    <div style={S.grid}>
      {items.map((m) => (
        <div key={m.id} className="rv-card" style={S.momentCard}>
          {m.hasImage ? <img src={`/api/moments/${m.id}/image`} alt="" style={S.momentImg} /> : null}
          <div style={S.head}><CharacterAvatar characterId={m.characterId} name={m.name} size={28} /><span style={S.momentName}>{m.name}</span></div>
          <p style={S.momentQuote}>&ldquo;{m.dialogue}&rdquo;</p>
          {m.setting ? <p style={S.meta}>{m.setting}</p> : null}
          <div style={S.momentFoot}>
            <span style={S.meta}>{new Date(m.createdAt).toLocaleDateString()}</span>
            <button style={S.momentDelete} onClick={() => onDelete(m.id)}>Remove</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LibraryPage() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [saved, setSaved] = useState<Item[] | null>(null);
  const [moments, setMoments] = useState<Moment[] | null>(null);
  const [earned, setEarned] = useState(0);

  useEffect(() => {
    fetch("/api/stories/mine").then((r) => r.json()).then((d: Item[]) => setItems(Array.isArray(d) ? d : [])).catch(() => setItems([]));
    fetch("/api/stories/saved").then((r) => (r.ok ? r.json() : [])).then((d: Item[]) => setSaved(Array.isArray(d) ? d : [])).catch(() => setSaved([]));
    fetch("/api/moments").then((r) => (r.ok ? r.json() : [])).then((d: Moment[]) => setMoments(Array.isArray(d) ? d : [])).catch(() => setMoments([]));
    fetch("/api/credits").then((r) => (r.ok ? r.json() : null)).then((d) => d && setEarned(d.earnedFromReaders ?? 0)).catch(() => {});
  }, []);

  async function removeMoment(id: string) {
    setMoments((cur) => (cur ? cur.filter((m) => m.id !== id) : cur));
    await fetch(`/api/moments/${id}`, { method: "DELETE" }).catch(() => {});
  }

  async function deleteStory(id: string) {
    setItems((cur) => (cur ? cur.filter((s) => s.id !== id) : cur));
    await fetch(`/api/stories/${id}`, { method: "DELETE" }).catch(() => {});
  }

  async function toggleHideStory(s: Item) {
    const nextPublic = s.isPublic === false; // if currently hidden, unhide (make public)
    setItems((cur) => (cur ? cur.map((x) => (x.id === s.id ? { ...x, isPublic: nextPublic } : x)) : cur));
    await fetch(`/api/stories/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublic: nextPublic }),
    }).catch(() => {});
  }

  return (
    <main style={S.wrap}>
      <a href="/" style={S.back}>← Reverie</a>
      <h1 style={S.h1}>Your library</h1>
      <p style={S.sub}>Everything you've started or saved - pick up any chapter where you left off.</p>

      {earned > 0 ? (
        <div style={S.earn}>
          <span style={S.earnStar}>★</span>
          <span><b style={S.earnNum}>{earned}</b> credit{earned === 1 ? "" : "s"} earned from readers chatting with your characters.</span>
        </div>
      ) : null}

      {items === null ? (
        <p style={S.muted}>Loading…</p>
      ) : items.length === 0 ? (
        <div style={S.emptyPanel}>
          <div style={S.emptyIcon}>📖</div>
          <p style={S.emptyTitle}>No stories yet</p>
          <p style={S.emptyBody}>Pick a companion and write your first chapter — it&apos;ll live here so you can pick up any time.</p>
          <div style={S.emptyCta}>
            <a href="/story" className="rv-btn rv-btn-primary" style={S.primary}>Begin a story →</a>
            <a href="/browse" className="rv-btn" style={S.secondary}>Browse companions</a>
          </div>
        </div>
      ) : (
        <StoryGrid items={items} owned onDelete={deleteStory} onToggleHide={toggleHideStory} />
      )}

      {saved && saved.length > 0 ? (
        <>
          <p style={S.section}>Saved for later · {saved.length}</p>
          <StoryGrid items={saved} />
        </>
      ) : null}

      {moments && moments.length > 0 ? (
        <>
          <p style={S.section}>Shared moments · {moments.length}</p>
          <p style={S.hint}>Replies you've visualized or saved from your conversations.</p>
          <MomentGrid items={moments} onDelete={removeMoment} />
        </>
      ) : null}
    </main>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 820, margin: "0 auto", padding: "44px 24px 90px", lineHeight: 1.6 },
  back: { color: "#8A7A90", textDecoration: "none", fontSize: 14 },
  h1: { fontFamily: "Georgia, serif", fontSize: 40, margin: "22px 0 8px" },
  sub: { color: "#AC9CB0", margin: "0 0 28px" },
  section: { fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "#9A8AA0", fontWeight: 700, margin: "40px 0 14px" },
  emptyPanel: { textAlign: "center", background: "#1A1420", border: "1px solid #2f2438", borderRadius: 18, padding: "44px 24px" },
  emptyIcon: { fontSize: 34 },
  emptyTitle: { fontFamily: "Georgia, serif", fontSize: 24, margin: "10px 0 6px", color: "#F4EAF0" },
  emptyBody: { color: "#AC9CB0", fontSize: 15, margin: "0 auto 20px", maxWidth: 420 },
  emptyCta: { display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" },
  primary: { color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", padding: "12px 20px", borderRadius: 11, fontWeight: 650, textDecoration: "none", fontSize: 14.5 },
  secondary: { color: "#F4EAF0", background: "#231A2B", border: "1px solid #3A2E44", padding: "12px 18px", borderRadius: 11, fontWeight: 600, textDecoration: "none", fontSize: 14.5 },
  earn: { display: "flex", alignItems: "center", gap: 10, background: "#241826", border: "1px solid #4a3350", borderRadius: 12, padding: "12px 16px", margin: "0 0 24px", color: "#EadFe6", fontSize: 14.5 },
  earnStar: { color: "#D46A8B", fontSize: 18 },
  earnNum: { color: "#E9A06B" },
  muted: { color: "#AC9CB0" },
  hint: { color: "#6f6276", fontSize: 13 },
  link: { color: "#E9A06B" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 },
  card: { display: "flex", flexDirection: "column", gap: 10, background: "#241B2D", border: "1px solid #3A2E44", borderRadius: 14, padding: 16, textDecoration: "none", color: "#F4EAF0" },
  head: { display: "flex", alignItems: "center", gap: 10 },
  title: { fontFamily: "Georgia, serif", fontSize: 17, lineHeight: 1.2 },
  meta: { color: "#8A7A90", fontSize: 12.5 },
  hiddenTag: { marginLeft: 8, color: "#C9A98A", fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", background: "rgba(120,110,130,.14)", border: "1px solid #4a3a50", borderRadius: 999, padding: "1px 7px" },
  ownerRow: { display: "flex", gap: 8, marginTop: 4 },
  ownerBtn: { background: "transparent", border: "1px solid #3A2E44", color: "#AC9CB0", borderRadius: 8, padding: "4px 11px", fontSize: 12, fontWeight: 600, cursor: "pointer" },
  ownerDelete: { color: "#E08A8A", borderColor: "#5a3540" },
  momentCard: { display: "flex", flexDirection: "column", gap: 8, background: "#241B2D", border: "1px solid #3A2E44", borderRadius: 14, padding: 16, color: "#F4EAF0" },
  momentImg: { width: "100%", aspectRatio: "4/3", objectFit: "cover", borderRadius: 10 },
  momentName: { fontFamily: "Georgia, serif", fontSize: 15 },
  momentQuote: { color: "#CBBBD0", fontSize: 13.5, fontStyle: "italic", lineHeight: 1.5, margin: 0 },
  momentFoot: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2 },
  momentDelete: { background: "transparent", border: "1px solid #3A2E44", color: "#8A7A90", borderRadius: 8, padding: "3px 9px", fontSize: 12, cursor: "pointer" },
};
