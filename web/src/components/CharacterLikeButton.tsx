"use client";

import { useState } from "react";

export function CharacterLikeButton({ characterId, initialLiked, initialLikes }: { characterId: string; initialLiked: boolean; initialLikes: number }) {
  const [liked, setLiked] = useState(initialLiked);
  const [likes, setLikes] = useState(initialLikes);
  const [pending, setPending] = useState(false);

  async function update() {
    if (pending) return;
    const next = !liked;
    setPending(true);
    try {
      const response = await fetch(`/api/characters/${characterId}/like`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ liked: next }),
      });
      if (response.status === 401) {
        // Profile owns the shared sign-in screen. Keep this destination simple
        // rather than sending readers to a route that does not exist.
        window.location.assign("/profile");
        return;
      }
      if (!response.ok) return;
      const result = await response.json() as { liked: boolean; likes: number };
      setLiked(result.liked);
      setLikes(result.likes);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={update}
      disabled={pending}
      aria-pressed={liked}
      aria-label={liked ? "Unlike companion" : "Like companion"}
      title={liked ? "Unlike" : "Like"}
      style={{ ...S.button, ...(liked ? S.liked : {}) }}
    >
      <span aria-hidden>{liked ? "♥" : "♡"}</span>
      <span>{formatCount(likes)}</span>
    </button>
  );
}

export function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}K`;
  return String(value);
}

const S: Record<string, React.CSSProperties> = {
  button: { display: "inline-flex", alignItems: "center", gap: 5, border: "1px solid #4A394F", borderRadius: 999, background: "rgba(30,21,36,.78)", color: "#CBBBD0", padding: "5px 9px", fontSize: 12, lineHeight: 1, cursor: "pointer", fontVariantNumeric: "tabular-nums" },
  liked: { borderColor: "#D46A8B", color: "#F08BAB", background: "rgba(212,106,139,.13)" },
};
