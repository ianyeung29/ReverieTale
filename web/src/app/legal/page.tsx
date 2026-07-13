export const metadata = { title: "Legal Information" };

const DOCS = [
  { href: "/legal/terms", title: "Terms of Service", desc: "The rules for using Reverie." },
  { href: "/legal/privacy", title: "Privacy Notice", desc: "What we collect and why." },
  { href: "/legal/cookies", title: "Cookies Notice", desc: "The one cookie we actually use." },
  { href: "/legal/underage", title: "Underage Policy", desc: "Age requirements and how we enforce them." },
  { href: "/guidelines", title: "Community Guidelines", desc: "What's allowed, what's not, and how moderation works." },
  { href: "/legal/blocked-content", title: "Blocked Content Policy", desc: "Content that's never allowed on Reverie." },
  { href: "/legal/content-removal", title: "Content Removal Policy", desc: "If AI content resembles a real person." },
  { href: "/legal/dmca", title: "DMCA Policy", desc: "Reporting copyright infringement." },
  { href: "/legal/complaints", title: "Complaint Policy", desc: "How to file a complaint and what happens next." },
  { href: "/legal/2257-exemption", title: "18 U.S.C. § 2257 Exemption", desc: "Why record-keeping law doesn't apply here." },
];

export default function LegalHubPage() {
  return (
    <main style={S.wrap}>
      <a href="/" style={S.back}>← Reverie</a>
      <p style={S.mark}>Legal</p>
      <h1 style={S.h1}>Legal information</h1>
      <p style={S.sub}>Every policy that governs Reverie, in one place.</p>

      <div style={S.grid}>
        {DOCS.map((d) => (
          <a key={d.href} href={d.href} className="rv-card" style={S.card}>
            <div style={S.cardTitle}>{d.title}</div>
            <p style={S.cardDesc}>{d.desc}</p>
          </a>
        ))}
      </div>
    </main>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 860, margin: "0 auto", padding: "36px 24px 100px", lineHeight: 1.6 },
  back: { color: "#8A7A90", textDecoration: "none", fontSize: 14, letterSpacing: ".04em" },
  mark: { fontSize: 12, letterSpacing: ".2em", textTransform: "uppercase", color: "#E9A06B", fontWeight: 700, margin: "22px 0 0" },
  h1: { fontFamily: "Georgia, serif", fontSize: 36, margin: "4px 0 10px", lineHeight: 1.1 },
  sub: { color: "#AC9CB0", margin: "0 0 26px", fontSize: 15 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 },
  card: { display: "flex", flexDirection: "column", gap: 6, background: "#241B2D", border: "1px solid #3A2E44", borderRadius: 14, padding: 18, textDecoration: "none", color: "#F4EAF0" },
  cardTitle: { fontFamily: "Georgia, serif", fontSize: 17, lineHeight: 1.25 },
  cardDesc: { color: "#8A7A90", fontSize: 13, margin: 0, lineHeight: 1.5 },
};
