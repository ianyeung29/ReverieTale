"use client";

import { useState } from "react";

type Photo = {
  id: string;
  caption: string;
  postedAt: string;
  isLocked: boolean;
  isUnlocked: boolean;
  revealPrice: number;
};

export function CompanionPhotoGallery({ characterId, name, photos }: { characterId: string; name: string; photos: Photo[] }) {
  const [items, setItems] = useState(photos);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function reveal(post: Photo) {
    if (busyId) return;
    setBusyId(post.id);
    setNotice(null);
    try {
      const response = await fetch(`/api/companion-posts/${post.id}/reveal`, { method: "POST" });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        setNotice("Sign in to reveal companion moments.");
        return;
      }
      if (response.status === 402) {
        setNotice(`You need ${data.price ?? post.revealPrice} credits to reveal this moment.`);
        return;
      }
      if (!response.ok) throw new Error(data.error || "Could not reveal this moment.");
      setItems((current) => current.map((item) => item.id === post.id ? { ...item, isUnlocked: true } : item));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not reveal this moment.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section aria-label={`${name}'s photo diary`}>
      <div style={S.grid}>
        {items.map((post, index) => {
          const locked = post.isLocked && !post.isUnlocked;
          const reply = "I saw your new moment. What happened next?";
          return (
            <article key={post.id} style={S.card}>
              {locked ? (
                <div style={{ ...S.teaser, ...teaserFor(index) }} aria-label="A locked companion photo preview">
                  <div style={S.blurOrb} />
                  <div style={S.teaserShade} />
                  <div style={S.lockLabel}><span aria-hidden>✦</span> New moment</div>
                </div>
              ) : (
                <img src={`/api/companion-posts/${post.id}/image`} alt={`${name}'s photo`} style={S.image} loading="lazy" />
              )}
              <div style={S.body}>
                <p style={S.caption}>{locked ? `${name} shared a new moment.` : post.caption}</p>
                <div style={S.foot}>
                  <span>{new Date(post.postedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                  {locked ? (
                    <button type="button" onClick={() => reveal(post)} disabled={busyId === post.id} style={{ ...S.reveal, opacity: busyId === post.id ? 0.65 : 1 }}>
                      {busyId === post.id ? "Revealing..." : `Reveal · ${post.revealPrice} credits`}
                    </button>
                  ) : (
                    <a href={`/chat?characterId=${characterId}&prefill=${encodeURIComponent(reply)}`} style={S.reply}>Reply in chat →</a>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {notice ? <p style={S.notice}>{notice} {notice.startsWith("You need") ? <a href="/credits" style={S.noticeLink}>Get credits →</a> : null}</p> : null}
    </section>
  );
}

function teaserFor(index: number): React.CSSProperties {
  const hues = ["#CA6D8B", "#5B83B9", "#BC8F54", "#7E69B4"];
  const hue = hues[index % hues.length];
  return { background: `linear-gradient(145deg, ${hue}, #241B2D 68%)` };
}

const S: Record<string, React.CSSProperties> = {
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 },
  card: { overflow: "hidden", border: "1px solid #3A2E44", borderRadius: 14, background: "#241B2D", minWidth: 0 },
  image: { width: "100%", display: "block", aspectRatio: "4 / 3", objectFit: "cover", background: "#1A121F" },
  teaser: { position: "relative", overflow: "hidden", aspectRatio: "4 / 3", isolation: "isolate" },
  blurOrb: { position: "absolute", width: "72%", aspectRatio: "1", borderRadius: "50%", left: "18%", top: "8%", background: "rgba(255,242,235,.7)", filter: "blur(28px)", transform: "rotate(-18deg)" },
  teaserShade: { position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(14,10,20,.12),rgba(14,10,20,.78))", backdropFilter: "blur(12px) saturate(.8)" },
  lockLabel: { position: "absolute", left: 12, bottom: 12, color: "#F4EAF0", fontSize: 12, fontWeight: 750, letterSpacing: ".08em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 },
  body: { padding: "12px 13px 13px" },
  caption: { color: "#EadFe6", margin: 0, fontSize: 14, lineHeight: 1.45, minHeight: 40 },
  foot: { color: "#8A7A90", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 12, fontSize: 12 },
  reveal: { border: "1px solid #E9A06B", borderRadius: 999, padding: "6px 10px", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", color: "#1A1220", fontWeight: 750, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" },
  reply: { color: "#E9A06B", textDecoration: "none", fontWeight: 700, whiteSpace: "nowrap" },
  notice: { color: "#E9A06B", fontSize: 13, margin: "12px 0 0" },
  noticeLink: { color: "#F4EAF0", fontWeight: 700, textDecoration: "none" },
};
