import { CharacterAvatar } from "./CharacterAvatar";

export type StoryTileData = {
  id: string;
  name: string;
  hook: string; // one-line scenario / backstory
  tags: string[];
  hasImage?: boolean;
};

/**
 * An image-forward "story moment" tile for discovery: the companion's portrait
 * fills the frame, with their name, a one-line scenario, and a clear invitation
 * ("Romance · 1 min opening") overlaid at the bottom. Unlike a portrait-only
 * card, every tile reads as a door into a story, not just a face to tap.
 */
export function StoryTile({ t }: { t: StoryTileData }) {
  const genre = t.tags[0] ? t.tags[0][0].toUpperCase() + t.tags[0].slice(1) : "Story";
  return (
    <a href={`/story?characterId=${t.id}`} className="rv-card" style={S.tile}>
      <div style={S.media}>
        <CharacterAvatar characterId={t.id} name={t.name} shape="rect" />
        <div style={S.scrim} />
        <div style={S.overlay}>
          <div style={S.name}>{t.name}</div>
          {t.hook ? <p style={S.hook}>{t.hook}</p> : null}
          <span style={S.invite}>{genre} · 1 min opening →</span>
        </div>
      </div>
    </a>
  );
}

const S: Record<string, React.CSSProperties> = {
  tile: { display: "block", background: "#241B2D", border: "1px solid #3A2E44", borderRadius: 16, overflow: "hidden", textDecoration: "none", color: "#F4EAF0" },
  media: { position: "relative" },
  scrim: { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(15,10,19,0) 40%, rgba(15,10,19,.94) 100%)", pointerEvents: "none", borderRadius: 14 },
  overlay: { position: "absolute", left: 0, right: 0, bottom: 0, padding: "14px 14px 13px", display: "flex", flexDirection: "column", gap: 5 },
  name: { fontFamily: "Georgia, serif", fontSize: 19, color: "#F4EAF0", lineHeight: 1.15, textShadow: "0 1px 4px rgba(0,0,0,.5)" },
  hook: { color: "#D9CBDE", fontSize: 12.5, margin: 0, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textShadow: "0 1px 3px rgba(0,0,0,.6)" },
  invite: { color: "#E9A06B", fontSize: 11.5, fontWeight: 700, letterSpacing: ".02em", marginTop: 2 },
};
