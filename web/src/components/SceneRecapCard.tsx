"use client";

import { useState } from "react";
import { CharacterAvatar } from "@/components/CharacterAvatar";

type Props = {
  storyId: string;
  title: string;
  characterId: string;
  characterName: string;
  chapterCount: number;
  excerpt: string;
  hasBackground: boolean;
};

export function SceneRecapCard({ storyId, title, characterId, characterName, chapterCount, excerpt, hasBackground }: Props) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}/story/${storyId}`;
    const text = `I just reached the end of “${title}” with ${characterName} on ReverieTale.`;
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // A cancelled native share should leave the reader exactly where they were.
    }
  }

  return (
    <section style={S.wrap}>
      {hasBackground ? <div aria-hidden style={{ ...S.image, backgroundImage: `url(/api/stories/${storyId}/background)` }} /> : null}
      <div style={S.scrim} />
      <div style={S.content}>
        <p style={S.eyebrow}>Scene complete · {chapterCount} chapter{chapterCount === 1 ? "" : "s"}</p>
        <div style={S.titleRow}>
          <CharacterAvatar characterId={characterId} name={characterName} size={42} />
          <div>
            <h2 style={S.title}>“{title}”</h2>
            <p style={S.by}>with {characterName}</p>
          </div>
        </div>
        <p style={S.excerpt}>{excerpt}</p>
        <div style={S.actions}>
          <button type="button" style={S.share} onClick={share}>{copied ? "Link copied" : "Share this scene"}</button>
          <a href={`/chat?characterId=${characterId}&fromStory=${storyId}&chapter=${chapterCount}`} style={S.talk}>Keep talking</a>
        </div>
      </div>
    </section>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { position: "relative", isolation: "isolate", overflow: "hidden", marginTop: 24, borderRadius: 16, border: "1px solid #4a3a50", minHeight: 210, background: "linear-gradient(120deg, #2c1d2a, #181d2c)" },
  image: { position: "absolute", zIndex: -2, inset: 0, backgroundPosition: "center", backgroundSize: "cover", opacity: .34 },
  scrim: { position: "absolute", zIndex: -1, inset: 0, background: "linear-gradient(100deg, rgba(22,14,27,.94), rgba(22,14,27,.78))" },
  content: { padding: "22px 22px 20px", maxWidth: 500 },
  eyebrow: { color: "#E9A06B", fontSize: 11, fontWeight: 700, letterSpacing: ".11em", textTransform: "uppercase", margin: 0 },
  titleRow: { display: "flex", alignItems: "center", gap: 11, marginTop: 12 },
  title: { color: "#F4EAF0", fontFamily: "Georgia, serif", fontSize: 24, lineHeight: 1.15, margin: 0 },
  by: { color: "#CBBBD0", fontSize: 13, margin: "3px 0 0" },
  excerpt: { color: "#DED2DF", fontFamily: "Georgia, serif", fontSize: 15, lineHeight: 1.55, margin: "16px 0", fontStyle: "italic", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" },
  actions: { display: "flex", flexWrap: "wrap", gap: 9 },
  share: { background: "#231A2B", color: "#F4EAF0", border: "1px solid #5b4660", borderRadius: 9, padding: "9px 13px", fontWeight: 650, fontSize: 13, cursor: "pointer" },
  talk: { background: "linear-gradient(100deg,#E9A06B,#D46A8B)", color: "#1A1220", borderRadius: 9, padding: "10px 13px", fontWeight: 700, fontSize: 13, textDecoration: "none" },
};
