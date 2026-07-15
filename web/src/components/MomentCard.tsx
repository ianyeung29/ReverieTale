import { CharacterAvatar } from "./CharacterAvatar";

export type MomentCardData = {
  id: string;
  name: string;
  tags: string[];
  tagline?: string;
  persona?: string;
  greeting?: string;
};

/** A visual invitation into a character's world, rather than a profile summary. */
export function MomentCard({ character }: { character: MomentCardData }) {
  const hook = character.tagline?.trim() || character.greeting?.trim() || character.persona?.trim() || `A new moment with ${character.name}.`;
  const genre = character.tags[0] ? character.tags[0][0].toUpperCase() + character.tags[0].slice(1) : "Interactive story";

  return (
    <a href={`/c/${character.id}#scene-starters`} style={S.card} className="rv-card rv-moment-card">
      <div style={S.media}>
        <CharacterAvatar characterId={character.id} name={character.name} shape="rect" />
        <div style={S.scrim} />
        <div style={S.overlay}>
          <span style={S.genre}>{genre}</span>
          <h2 style={S.name}>A moment with {character.name}</h2>
          <p style={S.hook}>{hook}</p>
          <span style={S.start}>Choose a start &rarr;</span>
        </div>
      </div>
    </a>
  );
}

const S: Record<string, React.CSSProperties> = {
  card: { display: "block", background: "#241B2D", border: "1px solid #3A2E44", borderRadius: 16, overflow: "hidden", color: "#F4EAF0", textDecoration: "none" },
  media: { position: "relative", aspectRatio: "4 / 5", overflow: "hidden" },
  scrim: { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(15,10,19,.02) 28%, rgba(15,10,19,.94) 100%)", pointerEvents: "none" },
  overlay: { position: "absolute", left: 0, right: 0, bottom: 0, padding: "18px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 7 },
  genre: { color: "#E9A06B", fontSize: 10.5, letterSpacing: ".12em", fontWeight: 700, textTransform: "uppercase" },
  name: { margin: 0, color: "#F4EAF0", fontFamily: "Georgia, serif", fontSize: 23, lineHeight: 1.1 },
  hook: { margin: 0, color: "#D9CBDE", fontSize: 13, lineHeight: 1.42, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  start: { marginTop: 3, color: "#E9A06B", fontSize: 12.5, fontWeight: 700 },
};
