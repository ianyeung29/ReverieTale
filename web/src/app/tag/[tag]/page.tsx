import type { Metadata } from "next";
import { CharacterCard } from "@/components/CharacterCard";
import { listCharacters, trendingScore } from "@/lib/discovery";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }): Promise<Metadata> {
  const { tag } = await params;
  const t = decodeURIComponent(tag);
  return { title: `#${t} companions`, description: `Browse companions tagged ${t} on Reverie.` };
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag: raw } = await params;
  const tag = decodeURIComponent(raw);

  const viewerId = await getCurrentUserId();
  let chars: Awaited<ReturnType<typeof listCharacters>> = [];
  try {
    chars = await listCharacters({ tag, viewerId: viewerId ?? undefined });
    chars.sort((a, b) => trendingScore(b.reads, b.createdAt) - trendingScore(a.reads, a.createdAt));
  } catch {
    /* empty state */
  }

  return (
    <main style={S.wrap}>
      <a href="/browse" style={S.back}>← Companions</a>
      <p style={S.eyebrow}>Tag</p>
      <h1 style={S.h1}>#{tag}</h1>

      {chars.length === 0 ? (
        <p style={{ color: "#AC9CB0", marginTop: 12 }}>No companions tagged “{tag}” yet. <a href="/browse" style={S.link}>Browse all →</a></p>
      ) : (
        <>
          <p style={S.sub}>{chars.length} companion{chars.length === 1 ? "" : "s"}</p>
          <div style={S.grid}>
            {chars.map((c) => (
              <CharacterCard key={c.id} c={c} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 900, margin: "0 auto", padding: "40px 24px 90px", lineHeight: 1.6 },
  back: { color: "#8A7A90", textDecoration: "none", fontSize: 14, letterSpacing: ".04em" },
  eyebrow: { letterSpacing: ".2em", textTransform: "uppercase", fontSize: 12, color: "#E9A06B", fontWeight: 700, margin: "22px 0 0" },
  h1: { fontFamily: "Georgia, serif", fontSize: 40, margin: "8px 0 6px" },
  sub: { color: "#AC9CB0", margin: "0 0 26px", fontSize: 14.5 },
  link: { color: "#E9A06B" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 15 },
};
