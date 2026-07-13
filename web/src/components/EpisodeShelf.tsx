"use client";

import { useEffect, useState } from "react";

export type Episode = {
  id: string;
  title: string;
  hook: string;
  chapters: number;
  readMin: number;
  reads: number;
};

// localStorage key the reader writes the furthest-read chapter index to.
export const progressKey = (storyId: string) => `rv_progress_${storyId}`;

function CoverImg({ storyId }: { storyId: string }) {
  const [failed, setFailed] = useState(false);
  // Gradient fallback underneath; the story's background scene reveals on load.
  let h = 0;
  for (const ch of storyId) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", overflow: "hidden", background: `linear-gradient(135deg, hsl(${h} 55% 40%), hsl(${(h + 50) % 360} 50% 28%))` }}>
      {!failed ? (
        <img
          src={`/api/stories/${storyId}/background`}
          alt=""
          onError={() => setFailed(true)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : null}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(15,10,19,0) 55%, rgba(15,10,19,.85) 100%)" }} />
    </div>
  );
}

/**
 * An "episode shelf" of a character's stories: each story is an illustrated
 * cover with a short hook, chapter count, reading time, and a state-aware CTA
 * (Start / Continue chapter N / Read again) computed from the reader's saved
 * progress in localStorage.
 */
export function EpisodeShelf({ items }: { items: Episode[] }) {
  const [progress, setProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    const p: Record<string, number> = {};
    for (const it of items) {
      const raw = localStorage.getItem(progressKey(it.id));
      if (raw != null) p[it.id] = Number(raw);
    }
    setProgress(p);
  }, [items]);

  function cta(it: Episode): { label: string; strong: boolean } {
    // p = furthest chapter index reached (0-based); the reader resumes there.
    const p = progress[it.id];
    if (p == null) return { label: "Start the opening scene", strong: true };
    if (p >= it.chapters - 1) return { label: "Read again", strong: false };
    return { label: `Continue chapter ${p + 1}`, strong: true };
  }

  return (
    <div className="rv-tile-grid">
      {items.map((it) => {
        const c = cta(it);
        return (
          <a key={it.id} href={`/story/${it.id}`} className="rv-card" style={S.card}>
            <CoverImg storyId={it.id} />
            <div style={S.body}>
              <div style={S.title}>{it.title}</div>
              <p style={S.hook}>{it.hook}…</p>
              <span style={S.meta}>{it.chapters} chapter{it.chapters === 1 ? "" : "s"} · ~{it.readMin} min · {it.reads} view{it.reads === 1 ? "" : "s"}</span>
              <span style={{ ...S.cta, ...(c.strong ? S.ctaStrong : {}) }}>{c.label} →</span>
            </div>
          </a>
        );
      })}
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  card: { display: "flex", flexDirection: "column", background: "#241B2D", border: "1px solid #3A2E44", borderRadius: 14, overflow: "hidden", textDecoration: "none", color: "#F4EAF0" },
  body: { padding: "13px 14px 14px", display: "flex", flexDirection: "column", gap: 6 },
  title: { fontFamily: "Georgia, serif", fontSize: 16.5, lineHeight: 1.2 },
  hook: { color: "#AC9CB0", fontSize: 12.5, margin: 0, lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  meta: { color: "#8A7A90", fontSize: 11.5 },
  cta: { color: "#CBBBD0", fontSize: 12.5, fontWeight: 600, marginTop: 2 },
  ctaStrong: { color: "#E9A06B", fontWeight: 700 },
};
