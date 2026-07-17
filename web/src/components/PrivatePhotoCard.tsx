"use client";

type Props = {
  characterId: string;
  characterName: string;
  price: number;
  revealing?: boolean;
  compact?: boolean;
  onReveal: () => void;
};

/** A teaser uses the existing companion portrait, never the protected image.
 * That keeps the paid image inaccessible until the reader explicitly unlocks it. */
export function PrivatePhotoCard({ characterId, characterName, price, revealing = false, compact = false, onReveal }: Props) {
  return (
    <section style={{ ...S.card, ...(compact ? S.compact : {}) }} aria-label={`Private photo from ${characterName}`}>
      <img src={`/api/characters/${characterId}/image`} alt="" style={S.preview} />
      <div style={S.shade} />
      <div style={S.copy}>
        <p style={S.kicker}>Private photo ready</p>
        <p style={S.title}>{characterName} sent you a candid moment.</p>
        <button type="button" style={{ ...S.button, opacity: revealing ? 0.65 : 1 }} disabled={revealing} onClick={onReveal}>
          {revealing ? "Revealing..." : `Reveal photo · ${price} credits`}
        </button>
      </div>
    </section>
  );
}

const S: Record<string, React.CSSProperties> = {
  card: { position: "relative", width: "min(310px, 100%)", minHeight: 174, marginTop: 8, overflow: "hidden", borderRadius: 14, border: "1px solid #5A3A53", background: "#231A2B", color: "#F4EAF0" },
  compact: { minHeight: 154, width: "min(270px, 100%)" },
  preview: { position: "absolute", inset: -18, width: "calc(100% + 36px)", height: "calc(100% + 36px)", objectFit: "cover", filter: "blur(16px) saturate(.8)", opacity: 0.6, transform: "scale(1.07)" },
  shade: { position: "absolute", inset: 0, background: "linear-gradient(145deg, rgba(20,12,24,.45), rgba(20,12,24,.92))" },
  copy: { position: "relative", zIndex: 1, minHeight: "inherit", display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "flex-end", gap: 7, padding: 16 },
  kicker: { margin: 0, color: "#E9A06B", fontSize: 11, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase" },
  title: { margin: 0, fontFamily: '"Palatino Linotype", Georgia, serif', fontSize: 16, lineHeight: 1.25 },
  button: { border: 0, borderRadius: 9, padding: "8px 11px", color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", fontSize: 12.5, fontWeight: 750, cursor: "pointer" },
};
