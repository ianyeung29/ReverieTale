import { CharacterAvatar } from "@/components/CharacterAvatar";

export type StoryMemory = {
  storyId: string;
  title: string;
  summary: string;
  chapter: number;
};

type Props = {
  memory: StoryMemory;
  characterId: string;
  characterName: string;
};

export function StoryMemoryCard({ memory, characterId, characterName }: Props) {
  return (
    <aside style={S.wrap} aria-label="Story context">
      <CharacterAvatar characterId={characterId} name={characterName} size={34} />
      <div style={S.copy}>
        <p style={S.eyebrow}>Story so far · Chapter {Math.max(1, memory.chapter)}</p>
        <a href={`/story/${memory.storyId}`} style={S.title}>“{memory.title}”</a>
        <p style={S.summary}>{memory.summary}</p>
      </div>
      <a href={`/story/${memory.storyId}`} style={S.read}>Read</a>
    </aside>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: {
    position: "sticky", top: 0, zIndex: 2, display: "flex", alignItems: "center", gap: 10,
    padding: "10px 12px", border: "1px solid #4a3a50", borderRadius: 12,
    background: "rgba(35,26,43,.96)", boxShadow: "0 8px 20px rgba(0,0,0,.16)",
    backdropFilter: "blur(10px)",
  },
  copy: { minWidth: 0, flex: 1 },
  eyebrow: { margin: 0, color: "#E9A06B", fontSize: 10.5, fontWeight: 700, letterSpacing: ".09em", textTransform: "uppercase" },
  title: { display: "block", color: "#F4EAF0", fontFamily: "Georgia, serif", fontSize: 15, lineHeight: 1.2, textDecoration: "none", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  summary: { color: "#AC9CB0", fontSize: 12.5, lineHeight: 1.35, margin: "3px 0 0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  read: { color: "#E9A06B", fontSize: 12, fontWeight: 700, textDecoration: "none", padding: "7px 3px", flexShrink: 0 },
};
