import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CharacterCard } from "@/components/CharacterCard";
import { listCharacters, trendingScore } from "@/lib/discovery";
import type { CompanionGender } from "@/lib/gender";
import { absoluteUrl } from "@/lib/site";

const PAGES: Record<string, { gender: CompanionGender; label: string; description: string }> = {
  female: { gender: "female", label: "Female characters", description: "Meet original female characters for interactive stories, creative scenes, and ongoing conversations." },
  male: { gender: "male", label: "Male characters", description: "Meet original male characters for interactive stories, creative scenes, and ongoing conversations." },
  "non-binary": { gender: "non-binary", label: "Non-binary characters", description: "Meet original non-binary characters for interactive stories, creative scenes, and ongoing conversations." },
};

export async function generateMetadata({ params }: { params: Promise<{ gender: string }> }): Promise<Metadata> {
  const { gender } = await params;
  const page = PAGES[gender];
  if (!page) return { title: "Companions", robots: { index: false, follow: false } };
  const path = `/companions/${gender}`;
  return { title: page.label, description: page.description, alternates: { canonical: path }, openGraph: { title: `${page.label} | ReverieTale`, description: page.description, url: absoluteUrl(path) } };
}

export default async function GenderCompanionsPage({ params }: { params: Promise<{ gender: string }> }) {
  const { gender } = await params;
  const page = PAGES[gender];
  if (!page) notFound();
  const companions = (await listCharacters({ genders: [page.gender] })).sort((a, b) => trendingScore(b.reads, b.createdAt) - trendingScore(a.reads, a.createdAt));
  return (
    <main style={S.wrap}>
      <a href="/browse" style={S.back}>Browse all companions</a>
      <p style={S.eyebrow}>Explore companions</p>
      <h1 style={S.title}>{page.label}</h1>
      <p style={S.copy}>{page.description}</p>
      <nav style={S.links} aria-label="Companion groups"><a href="/companions/female" style={{ ...S.link, ...(gender === "female" ? S.linkOn : {}) }}>Women</a><a href="/companions/male" style={{ ...S.link, ...(gender === "male" ? S.linkOn : {}) }}>Men</a><a href="/companions/non-binary" style={{ ...S.link, ...(gender === "non-binary" ? S.linkOn : {}) }}>Non-binary</a></nav>
      {companions.length ? <div className="rv-companion-grid" style={S.grid}>{companions.map((companion) => <CharacterCard key={companion.id} c={companion} />)}</div> : <p style={S.empty}>New companions are on their way. <a href="/browse" style={S.back}>Browse everyone</a>.</p>}
    </main>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 1100, margin: "0 auto", padding: "54px 24px 88px" },
  back: { color: "#E9A06B", textDecoration: "none", fontSize: 13.5, fontWeight: 650 },
  eyebrow: { margin: "28px 0 7px", color: "#E9A06B", fontSize: 12, letterSpacing: ".18em", textTransform: "uppercase", fontWeight: 700 },
  title: { margin: 0, color: "#F4EAF0", fontFamily: "Georgia, serif", fontSize: 42, lineHeight: 1.1 },
  copy: { maxWidth: 630, color: "#CBBBD0", fontSize: 16, lineHeight: 1.6, margin: "12px 0 20px" },
  links: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 26 },
  link: { color: "#CBBBD0", textDecoration: "none", background: "#211827", border: "1px solid #3A2E44", borderRadius: 999, padding: "7px 12px", fontSize: 13 },
  linkOn: { color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", borderColor: "transparent", fontWeight: 700 },
  grid: { display: "grid", gap: 16 },
  empty: { color: "#AC9CB0" },
};
