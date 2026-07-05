export default function Home() {
  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "80px 24px", lineHeight: 1.6 }}>
      <p style={{ letterSpacing: ".2em", textTransform: "uppercase", fontSize: 12, color: "#E9A06B", fontWeight: 700 }}>
        18+ · companions who remember you
      </p>
      <h1 style={{ fontFamily: "Georgia, serif", fontSize: 48, margin: "12px 0 16px" }}>Reverie</h1>
      <p style={{ color: "#AC9CB0", fontSize: 18 }}>
        Begin with a story. Meet a character. Then stay and talk to someone who remembers every word.
      </p>
      <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
        <a href="/story" style={btn(true)}>Begin a story →</a>
        <a href="/chat" style={btn(false)}>Skip to chat</a>
      </div>
      <p style={{ color: "#6f6276", fontSize: 13, marginTop: 40 }}>
        Health: <a href="/api/health" style={{ color: "#8A7A90" }}>/api/health</a>
      </p>
    </main>
  );
}

function btn(primary: boolean): React.CSSProperties {
  return primary
    ? { color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", padding: "13px 24px", borderRadius: 12, fontWeight: 650, textDecoration: "none" }
    : { color: "#F4EAF0", background: "#231A2B", border: "1px solid #3A2E44", padding: "13px 24px", borderRadius: 12, fontWeight: 600, textDecoration: "none" };
}
