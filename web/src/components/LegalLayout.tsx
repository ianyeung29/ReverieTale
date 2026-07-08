import { LAST_REVISED } from "@/lib/legal";

export function LegalLayout({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main style={S.wrap}>
      <a href="/legal" style={S.back}>← Legal information</a>
      <p style={S.mark}>{eyebrow}</p>
      <h1 style={S.h1}>{title}</h1>
      <p style={S.revised}>Last revised: {LAST_REVISED}</p>
      {intro ? <p style={S.sub}>{intro}</p> : null}
      {children}
    </main>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={S.section}>
      <h2 style={S.h2}>{title}</h2>
      {children}
    </section>
  );
}

export const S: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 720, margin: "0 auto", padding: "36px 24px 100px", lineHeight: 1.6 },
  back: { color: "#8A7A90", textDecoration: "none", fontSize: 14, letterSpacing: ".04em" },
  mark: { fontSize: 12, letterSpacing: ".2em", textTransform: "uppercase", color: "#E9A06B", fontWeight: 700, margin: "22px 0 0" },
  h1: { fontFamily: "Georgia, serif", fontSize: 34, margin: "4px 0 6px", lineHeight: 1.15 },
  revised: { color: "#6f6276", fontSize: 12.5, margin: "0 0 14px" },
  sub: { color: "#AC9CB0", margin: "0 0 8px", fontSize: 15, lineHeight: 1.65 },
  section: { marginTop: 28 },
  h2: { fontFamily: "Georgia, serif", fontSize: 19, color: "#F4EAF0", margin: "0 0 8px" },
  h3: { fontFamily: "Georgia, serif", fontSize: 16, color: "#F4EAF0", margin: "16px 0 6px" },
  p: { color: "#CBBBD0", fontSize: 14.5, margin: "0 0 10px", lineHeight: 1.7 },
  ul: { color: "#CBBBD0", fontSize: 14.5, lineHeight: 1.75, margin: "0 0 10px", paddingLeft: 20 },
  ol: { color: "#CBBBD0", fontSize: 14.5, lineHeight: 1.75, margin: "0 0 10px", paddingLeft: 20 },
  link: { color: "#E9A06B", textDecoration: "underline" },
  strong: { color: "#F4EAF0" },
  small: { color: "#8A7A90", fontSize: 13, lineHeight: 1.6 },
};
