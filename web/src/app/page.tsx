export default function Home() {
  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "64px 24px", lineHeight: 1.6 }}>
      <p style={{ letterSpacing: ".18em", textTransform: "uppercase", fontSize: 12, color: "#E9A06B", fontWeight: 700 }}>
        Phase 0 - foundation
      </p>
      <h1 style={{ fontFamily: "Georgia, serif", fontSize: 40, margin: "10px 0 16px" }}>Reverie</h1>
      <p style={{ color: "#AC9CB0" }}>
        Backend foundation is running. Milestone 1 (scaffold, schema, adapters) is in place. Next milestones:
        chat + memory retrieval, credit ledger, age gate + moderation hooks, then the chat UI.
      </p>
      <p style={{ color: "#AC9CB0" }}>
        Health check: <a href="/api/health" style={{ color: "#E9A06B" }}>/api/health</a>
      </p>
    </main>
  );
}
