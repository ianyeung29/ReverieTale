export const metadata = { title: "Community guidelines · Reverie" };

export default function GuidelinesPage() {
  return (
    <main style={S.wrap}>
      <a href="/" style={S.back}>← Reverie</a>
      <p style={S.mark}>Trust &amp; safety</p>
      <h1 style={S.h1}>Community guidelines</h1>
      <p style={S.sub}>Reverie is an 18+ fiction platform. Everyone here — readers and creators — is expected to follow these rules.</p>

      <Section title="Who this is for">
        <p style={S.p}>You must be 18 or older to use Reverie. Every account confirms this when signing up. This is currently a self-attestation, not an independent age-verification check — real verification is planned before any wider or explicit-content launch.</p>
      </Section>

      <Section title="What's allowed">
        <p style={S.p}>Adult, romantic, or suggestive stories and companions are welcome, as long as every character is clearly a fictional, clearly-adult creation. Tasteful is the default; explicit content is a separate, currently-disabled tier pending further safeguards.</p>
      </Section>

      <Section title="What's never allowed">
        <ul style={S.ul}>
          <li>Any character who is, could be, or is written to resemble a minor — including age-ambiguous characters. This is a hard, zero-tolerance line with no exceptions.</li>
          <li>Impersonating a real, identifiable person — a celebrity or a private individual.</li>
          <li>Illegal activity, real-world non-consensual harm, or content that glorifies it.</li>
          <li>Hateful or dehumanizing content targeting a protected group.</li>
        </ul>
      </Section>

      <Section title="How review works">
        <p style={S.p}>Every new or edited companion passes through a hybrid check before it's public:</p>
        <ol style={S.ol}>
          <li><b>A hard filter</b> blocks obvious minor-safety violations outright — instantly, no exceptions.</li>
          <li><b>An automated classifier</b> then reads the rest: clearly-fine characters are approved immediately, clear violations are rejected, and anything ambiguous is held for a human moderator.</li>
          <li><b>A human reviews</b> anything held, before it ever goes public.</li>
        </ol>
        <p style={S.p}>Creators never publish directly — every character passes through this gate first.</p>
      </Section>

      <Section title="Reporting content">
        <p style={S.p}>Every companion and story has a <b>⚑ Report</b> option. Reporting flags it for a moderator — it doesn't remove anything on its own, so don't hesitate to use it if something looks wrong.</p>
      </Section>

      <Section title="Blocking a companion">
        <p style={S.p}>You can <b>🚫 Block</b> any companion from its profile page. This is personal — it just hides that companion from your own Browse, Home, and tag pages. It doesn't notify anyone or affect what others see. Unblock any time from that same page.</p>
      </Section>

      <Section title="For creators">
        <p style={S.p}>Give your companions a real age (18+) and keep their description clearly fictional and clearly adult — that's what keeps a character in the auto-approve lane instead of the review queue. Characters that repeatedly draw reports or violate these rules can be unpublished or removed.</p>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={S.section}>
      <h2 style={S.h2}>{title}</h2>
      {children}
    </section>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 680, margin: "0 auto", padding: "36px 24px 100px", lineHeight: 1.6 },
  back: { color: "#8A7A90", textDecoration: "none", fontSize: 14, letterSpacing: ".04em" },
  mark: { fontSize: 12, letterSpacing: ".2em", textTransform: "uppercase", color: "#E9A06B", fontWeight: 700, margin: "22px 0 0" },
  h1: { fontFamily: "Georgia, serif", fontSize: 36, margin: "4px 0 10px", lineHeight: 1.1 },
  sub: { color: "#AC9CB0", margin: "0 0 8px", fontSize: 15 },
  section: { marginTop: 30 },
  h2: { fontFamily: "Georgia, serif", fontSize: 20, color: "#F4EAF0", margin: "0 0 8px" },
  p: { color: "#CBBBD0", fontSize: 15, margin: "0 0 8px", lineHeight: 1.65 },
  ul: { color: "#CBBBD0", fontSize: 15, lineHeight: 1.7, margin: 0, paddingLeft: 20 },
  ol: { color: "#CBBBD0", fontSize: 15, lineHeight: 1.7, margin: "0 0 8px", paddingLeft: 20 },
};
