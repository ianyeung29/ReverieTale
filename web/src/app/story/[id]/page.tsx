"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { ChatDock } from "@/components/ChatDock";

type Story = { id: string; title: string; content: string; characterId: string; characterName: string };

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

  useEffect(() => {
    fetch(`/api/stories/${id}`).then((r) => (r.ok ? r.json() : Promise.reject())).then((s: Story) => {
      setStory(s);
      setChapters(splitChapters(s.content));
    }).catch(() => setNotFound(true));
  }, [id]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [idx]);

  async function next() {
    if (busy) return;
    if (idx < chapters.length - 1) { setIdx(idx + 1); return; }
    // On the last chapter -> generate a new one.
    setBusy(true);
    try {
      const res = await fetch(`/api/stories/${id}/continue`, { method: "POST" });
      const d = await res.json();
      if (res.ok && d.chapter) {
        setChapters((c) => [...c, d.chapter.trim()]);
        setIdx((i) => i + 1);
      }
    } catch {} finally { setBusy(false); }
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

      <article key={idx} style={S.article}>
        {(chapters[idx] ?? "").split(/\n{2,}/).map((p, i) => <p key={i} style={S.para}>{p}</p>)}
      </article>

      <div style={S.nav}>
        <button style={{ ...S.navBtn, visibility: idx > 0 ? "visible" : "hidden" }} onClick={() => setIdx(idx - 1)}>← Previous</button>
        <span style={S.count}>{idx + 1} / {chapters.length}</span>
        <button style={{ ...S.navBtn, ...S.navPrimary, opacity: busy ? 0.6 : 1 }} onClick={next} disabled={busy}>
          {busy ? "Writing…" : last ? "Next chapter +" : "Next →"}
        </button>
      </div>

      <div style={S.talkRow}>
        <a style={S.talk} href={`/chat?characterId=${story.characterId}&fromStory=${story.id}`}>Open full chat with {story.characterName} →</a>
      </div>

      <ChatDock characterId={story.characterId} characterName={story.characterName} storyId={story.id} />
    </main>
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
  nav: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 34, borderTop: "1px solid #241a2b", paddingTop: 22 },
  navBtn: { background: "#231A2B", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 10, padding: "11px 16px", cursor: "pointer", fontSize: 14, fontWeight: 600 },
  navPrimary: { color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", border: "1px solid transparent" },
  count: { color: "#8A7A90", fontSize: 13, fontVariantNumeric: "tabular-nums" },
  talkRow: { marginTop: 22, textAlign: "center" },
  talk: { color: "#AC9CB0", textDecoration: "none", fontSize: 14 },
};
