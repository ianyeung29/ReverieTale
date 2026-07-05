"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Avatar } from "@/components/Avatar";

type Story = { id: string; title: string; content: string; characterId: string; characterName: string };

export default function StoryReadPage() {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<Story | null>(null);
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/stories/${id}`).then((r) => (r.ok ? r.json() : Promise.reject())).then((s: Story) => {
      setStory(s); setContent(s.content);
    }).catch(() => setNotFound(true));
  }, [id]);

  async function nextChapter() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/stories/${id}/continue`, { method: "POST" });
      const d = await res.json();
      if (res.ok && d.chapter) {
        setContent((c) => `${c}\n\n· · ·\n\n${d.chapter}`);
        setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }), 60);
      }
    } catch {} finally { setBusy(false); }
  }

  if (notFound) return <main style={S.wrap}><p style={{ color: "#AC9CB0" }}>Story not found. <a href="/" style={S.link}>Home</a></p></main>;
  if (!story) return <main style={S.wrap}><p style={{ color: "#AC9CB0" }}>Loading…</p></main>;

  return (
    <main style={S.wrap}>
      <a href="/" style={S.back}>← Reverie</a>
      <div style={S.head}>
        <Avatar name={story.characterName} size={46} />
        <div>
          <h1 style={S.title}>{story.title}</h1>
          <p style={S.by}>with {story.characterName}</p>
        </div>
      </div>

      <article>
        {content.split(/\n{2,}/).map((p, i) =>
          p.trim() === "· · ·" ? <p key={i} style={S.divider}>· · ·</p> : <p key={i} style={S.para}>{p}</p>,
        )}
      </article>

      <div style={S.actions}>
        <button style={{ ...S.next, opacity: busy ? 0.6 : 1 }} onClick={nextChapter} disabled={busy}>
          {busy ? "Writing…" : "Next chapter"}
        </button>
        <a style={S.talk} href={`/chat?characterId=${story.characterId}&fromStory=${story.id}`}>Talk to {story.characterName} →</a>
      </div>
    </main>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 640, margin: "0 auto", padding: "36px 24px 90px", lineHeight: 1.7 },
  back: { color: "#8A7A90", textDecoration: "none", fontSize: 14, letterSpacing: ".04em" },
  link: { color: "#E9A06B" },
  head: { display: "flex", alignItems: "center", gap: 14, margin: "24px 0 28px" },
  title: { fontFamily: "Georgia, serif", fontSize: 32, margin: 0, lineHeight: 1.15 },
  by: { color: "#AC9CB0", margin: "4px 0 0", fontSize: 14 },
  para: { margin: "0 0 16px", color: "#EadFe6", fontSize: 17 },
  divider: { textAlign: "center", color: "#6f6276", letterSpacing: ".5em", margin: "26px 0" },
  actions: { display: "flex", gap: 12, marginTop: 34, flexWrap: "wrap" },
  next: { border: "1px solid #E9A06B", color: "#E9A06B", background: "transparent", borderRadius: 12, padding: "13px 22px", fontWeight: 600, cursor: "pointer", fontSize: 15 },
  talk: { color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", padding: "13px 22px", borderRadius: 12, fontWeight: 650, textDecoration: "none", fontSize: 15 },
};
