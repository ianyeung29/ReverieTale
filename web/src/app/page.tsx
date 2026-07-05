import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { characters, stories } from "@/db/schema";
import { Avatar } from "@/components/Avatar";

export const dynamic = "force-dynamic";

async function recentStories() {
  try {
    const rows = await db
      .select({
        id: stories.id,
        title: stories.title,
        content: stories.content,
        name: sql<string>`${characters.definition}->>'name'`,
      })
      .from(stories)
      .innerJoin(characters, eq(stories.characterId, characters.id))
      .where(eq(stories.isPublic, true))
      .orderBy(desc(stories.createdAt))
      .limit(9);
    return rows.map((r) => ({ id: r.id, title: r.title, name: r.name, snippet: r.content.replace(/\s+/g, " ").slice(0, 150) }));
  } catch {
    return [];
  }
}

export default async function Home() {
  const feed = await recentStories();

  return (
    <main style={S.wrap}>
      <p style={S.eyebrow}>18+ · companions who remember you</p>
      <h1 style={S.h1}>Reverie</h1>
      <p style={S.sub}>Begin with a story. Meet a character. Then stay and talk to someone who remembers every word.</p>
      <div style={S.cta}>
        <a href="/story" style={btn(true)}>Begin a story →</a>
        <a href="/browse" style={btn(false)}>Browse companions</a>
        <a href="/library" style={btn(false)}>Your stories</a>
        <a href="/chat" style={btn(false)}>Skip to chat</a>
      </div>

      {feed.length > 0 ? (
        <>
          <p style={S.section}>Fresh from the community</p>
          <div style={S.grid}>
            {feed.map((s) => (
              <a key={s.id} href={`/story/${s.id}`} style={S.card}>
                <div style={S.cardHead}><Avatar name={s.name} size={34} /><div style={S.cardName}>{s.title}</div></div>
                <p style={S.cardSnip}>{s.snippet}…</p>
                <span style={S.with}>with {s.name}</span>
              </a>
            ))}
          </div>
        </>
      ) : null}
    </main>
  );
}

function btn(primary: boolean): React.CSSProperties {
  return primary
    ? { color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", padding: "13px 24px", borderRadius: 12, fontWeight: 650, textDecoration: "none" }
    : { color: "#F4EAF0", background: "#231A2B", border: "1px solid #3A2E44", padding: "13px 24px", borderRadius: 12, fontWeight: 600, textDecoration: "none" };
}

const S: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 900, margin: "0 auto", padding: "72px 24px 90px", lineHeight: 1.6 },
  eyebrow: { letterSpacing: ".2em", textTransform: "uppercase", fontSize: 12, color: "#E9A06B", fontWeight: 700, margin: 0 },
  h1: { fontFamily: "Georgia, serif", fontSize: 52, margin: "12px 0 14px" },
  sub: { color: "#AC9CB0", fontSize: 18, maxWidth: 560 },
  cta: { display: "flex", gap: 12, marginTop: 26, flexWrap: "wrap" },
  section: { fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "#8A7A90", fontWeight: 700, margin: "56px 0 16px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 16 },
  card: { display: "flex", flexDirection: "column", gap: 10, background: "#1C1422", border: "1px solid #3A2E44", borderRadius: 14, padding: 18, textDecoration: "none", color: "#F4EAF0" },
  cardHead: { display: "flex", alignItems: "center", gap: 10 },
  cardName: { fontFamily: "Georgia, serif", fontSize: 18, lineHeight: 1.2 },
  cardSnip: { color: "#AC9CB0", fontSize: 14, margin: 0, lineHeight: 1.5 },
  with: { color: "#E9A06B", fontSize: 12.5, letterSpacing: ".03em" },
};
