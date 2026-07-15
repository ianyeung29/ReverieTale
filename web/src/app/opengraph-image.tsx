import { ImageResponse } from "next/og";

export const alt = "ReverieTale - interactive stories with AI companions";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          color: "#F4EAF0",
          background: "linear-gradient(135deg, #150F1A 12%, #271B2A 55%, #1D2832 100%)",
        }}
      >
        <div style={{ display: "flex", color: "#E9A06B", fontSize: 26, fontWeight: 700, letterSpacing: 5, textTransform: "uppercase" }}>
          Interactive stories
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 920 }}>
          <div style={{ display: "flex", fontFamily: "serif", fontSize: 96, fontWeight: 700, lineHeight: 1 }}>ReverieTale</div>
          <div style={{ display: "flex", color: "#D8C8D9", fontSize: 38, lineHeight: 1.3 }}>
            Meet a character at the moment something changes. Decide what happens next.
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, color: "#E9A06B", fontSize: 28 }}>
          <div style={{ display: "flex", width: 18, height: 18, borderRadius: 999, background: "#D46A8B" }} />
          Stories, scenes, and conversations that continue with you.
        </div>
      </div>
    ),
    size,
  );
}
