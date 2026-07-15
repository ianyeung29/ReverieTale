"use client";

import { buildSceneStarters, type SceneStarterCharacter } from "@/lib/scene-starters";

export function SceneStarter({ character, compact = false }: { character: SceneStarterCharacter & { id: string }; compact?: boolean }) {
  const starters = buildSceneStarters(character);

  return (
    <section style={compact ? S.compactWrap : S.wrap} className={compact ? "rv-scene-starter rv-scene-starter-compact" : "rv-scene-starter"}>
      <div style={S.heading}>
        <p style={S.eyebrow}>{compact ? "Choose the first move" : "Your opening moment"}</p>
        {!compact ? <h2 style={S.title}>How does the scene begin?</h2> : null}
      </div>
      <div style={compact ? S.compactChoices : S.choices} className={compact ? "rv-scene-starter-choices rv-scene-starter-choices-compact" : "rv-scene-starter-choices"}>
        {starters.map((starter, index) => (
          <a
            key={starter.id}
            href={`/story?characterId=${character.id}&starter=${starter.id}`}
            style={compact ? S.compactChoice : S.choice}
            className="rv-scene-starter-choice"
          >
            <span style={S.number}>0{index + 1}</span>
            <span style={S.choiceCopy}>
              <strong style={S.choiceTitle}>{starter.title}</strong>
              {!compact ? <span style={S.choiceDescription}>{starter.description}</span> : null}
            </span>
            <span style={S.arrow} aria-hidden>&rarr;</span>
          </a>
        ))}
      </div>
      {!compact ? <a href={`/story?characterId=${character.id}`} style={S.custom}>Write a different opening &rarr;</a> : null}
    </section>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { margin: "28px 0 0", padding: "22px", background: "linear-gradient(120deg, rgba(233,160,107,.12), rgba(36,27,45,.96))", border: "1px solid #4a3a50", borderRadius: 16 },
  compactWrap: { marginTop: 22, width: "100%" },
  heading: { display: "flex", flexDirection: "column", gap: 2 },
  eyebrow: { margin: 0, color: "#E9A06B", fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase" },
  title: { margin: 0, color: "#F4EAF0", fontFamily: "Georgia, serif", fontSize: 24, lineHeight: 1.2 },
  choices: { display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10, marginTop: 16 },
  compactChoices: { display: "grid", gap: 8, marginTop: 10 },
  choice: { display: "grid", gridTemplateColumns: "auto minmax(0,1fr) auto", gap: 10, alignItems: "start", padding: "14px", minHeight: 112, borderRadius: 12, border: "1px solid #4A3A50", background: "rgba(20,14,24,.52)", color: "#F4EAF0", textDecoration: "none" },
  compactChoice: { display: "grid", gridTemplateColumns: "auto minmax(0,1fr) auto", gap: 9, alignItems: "center", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(233,160,107,.35)", background: "rgba(20,14,24,.45)", color: "#F4EAF0", textDecoration: "none" },
  number: { color: "#E9A06B", fontSize: 11, fontWeight: 700, letterSpacing: ".1em", lineHeight: 1.55 },
  choiceCopy: { display: "flex", flexDirection: "column", gap: 4, minWidth: 0 },
  choiceTitle: { fontSize: 14, lineHeight: 1.3 },
  choiceDescription: { color: "#BCAFC1", fontSize: 12.5, lineHeight: 1.45 },
  arrow: { color: "#E9A06B", fontSize: 16, lineHeight: 1.2 },
  custom: { display: "inline-block", marginTop: 15, color: "#E9A06B", fontSize: 13.5, fontWeight: 650, textDecoration: "none" },
};
