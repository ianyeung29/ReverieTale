// Deterministic gradient avatar from a name - no image assets needed.
// (Real images arrive with the character-media feature later.)
export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360;
  const h2 = (h + 40) % 360;
  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        color: "#1A1220",
        fontWeight: 700,
        fontFamily: "Georgia, serif",
        fontSize: Math.round(size * 0.42),
        background: `linear-gradient(135deg, hsl(${h} 70% 64%), hsl(${h2} 62% 54%))`,
        flexShrink: 0,
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
