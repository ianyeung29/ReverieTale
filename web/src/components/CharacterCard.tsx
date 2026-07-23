import type { ReactNode } from "react";
import { CharacterAvatar } from "./CharacterAvatar";
import { StarRating } from "./StarRating";
import { CharacterLikeButton, formatCount } from "./CharacterLikeButton";

export type CharacterCardData = {
  id: string;
  name: string;
  tags: string[];
  tagline?: string;
  greeting?: string;
  persona?: string;
  reads?: number;
  stories?: number;
  rating?: number;
  ratingCount?: number;
  age?: number | null;
  likes?: number;
  messages?: number;
  likedByViewer?: boolean;
};

/**
 * Portrait-forward character card shared by every discovery surface (browse,
 * tag, creator, home). The image fills the top of the card with name/tags
 * overlaid on a gradient scrim, and the character's own greeting - not a form
 * scene premise - is the first thing read below it, so a companion reads as a
 * doorway into a story instead of a spec sheet with an initials icon.
 */
export function CharacterCard({ c, actions }: { c: CharacterCardData; actions?: ReactNode }) {
  const hasStats = Boolean(c.reads || c.stories || c.ratingCount || c.messages || c.likes);
  return (
    <div className="rv-card rv-character-card" style={S.card}>
      <a href={`/c/${c.id}`} className="rv-character-card-media-link" style={S.mediaLink}>
        <div className="rv-character-card-media" style={S.media}>
          <CharacterAvatar characterId={c.id} name={c.name} shape="rect" />
          <div style={S.scrim} />
          <div className="rv-character-card-media-text" style={S.mediaText}>
            <div style={S.name}>{c.name}{c.age ? `, ${c.age}` : ""}</div>
            {c.tags.length ? (
              <div style={S.tags}>
                {c.tags.slice(0, 3).map((t) => (
                  <span key={t} style={S.tag}>{t}</span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </a>
      <div className="rv-character-card-body" style={S.body}>
        {c.tagline?.trim() ? (
          <p className="rv-character-card-copy" style={S.tagline}>{c.tagline.trim()}</p>
        ) : c.greeting?.trim() ? (
          <p className="rv-character-card-copy" style={S.greeting}>&ldquo;{c.greeting.trim()}&rdquo;</p>
        ) : c.persona ? (
          <p className="rv-character-card-copy" style={S.persona}>{c.persona}</p>
        ) : null}
        {hasStats ? (
          <div className="rv-character-card-meta" style={S.meta}>
            {c.reads ? <>{c.reads} read{c.reads === 1 ? "" : "s"}</> : null}
            {c.reads && c.stories ? " · " : null}
            {c.stories ? <>{c.stories} stor{c.stories === 1 ? "y" : "ies"}</> : null}
            {c.ratingCount ? (
              <>
                {(c.reads || c.stories) ? " · " : null}
                <StarRating value={c.rating ?? 0} count={c.ratingCount} size={12} showNumber={false} /> {(c.rating ?? 0).toFixed(1)} ({c.ratingCount})
              </>
            ) : null}
          </div>
        ) : null}
        <div style={S.engagement}>
          <span title="Messages exchanged">▢ {formatCount(c.messages ?? 0)} messages</span>
          <CharacterLikeButton characterId={c.id} initialLiked={Boolean(c.likedByViewer)} initialLikes={c.likes ?? 0} />
        </div>
        {actions ? <div style={S.actions}>{actions}</div> : null}
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  card: { background: "#241B2D", border: "1px solid #3A2E44", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", padding: 0 },
  mediaLink: { display: "block", textDecoration: "none", color: "inherit" },
  media: { position: "relative" },
  scrim: { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(15,10,19,0) 45%, rgba(15,10,19,.92) 100%)", pointerEvents: "none" },
  mediaText: { position: "absolute", left: 0, right: 0, bottom: 0, padding: "16px 16px 14px", display: "flex", flexDirection: "column", gap: 6 },
  name: { fontFamily: "Georgia, serif", fontSize: 21, color: "#F4EAF0", lineHeight: 1.15, textShadow: "0 1px 4px rgba(0,0,0,.4)" },
  tags: { display: "flex", flexWrap: "wrap", gap: 6 },
  tag: { fontSize: 11, color: "#F4EAF0", background: "rgba(20,14,24,.55)", border: "1px solid rgba(244,234,240,.3)", borderRadius: 999, padding: "2px 9px", backdropFilter: "blur(2px)" },
  body: { padding: 16, display: "flex", flexDirection: "column", gap: 10 },
  tagline: { color: "#D9CBDE", fontSize: 13.5, margin: 0, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" },
  greeting: { color: "#EadFe6", fontSize: 13.5, fontStyle: "italic", margin: 0, lineHeight: 1.5, borderLeft: "2px solid #E9A06B", paddingLeft: 10 },
  persona: { color: "#CBBBD0", fontSize: 13.5, margin: 0, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  meta: { color: "#8A7A90", fontSize: 12, fontVariantNumeric: "tabular-nums", display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" },
  engagement: { color: "#A996AD", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, fontVariantNumeric: "tabular-nums" },
  actions: { display: "flex", gap: 10, marginTop: 2 },
};
