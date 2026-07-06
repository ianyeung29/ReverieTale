import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { characters, stories } from "@/db/schema";
import { Avatar } from "@/components/Avatar";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { listCharacters, trendingScore } from "@/lib/discovery";

export const dynamic = "force-dynamic";

async function trendingCompanions() {
  try {
    const cs = await listCharacters();
    return cs
      .sort((a, b) => trendingScore(b.reads, b.createdAt) - trendingScore(a.reads, a.createdAt))
      .slice(0, 6);
  } catch {
    return [];
  }
}

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
      .where(and(eq(stories.isPublic, true), eq(characters.status, "published")))
      .orderBy(desc(stories.createdAt))
      .limit(9);
    return rows.map((r) => ({ id: r.id, title: r.title, name: r.name, snippet: r.content.replace(/\s+/g, " ").slice(0, 150) }));
  } catch {
    return [];
  }
}

const STEPS = [
  { icon: "🎭", title: "Meet a companion", body: "Pick a character — or craft your own with a persona, look, and history." },
  { icon: "✍️", title: "Shape a story", body: "Write an opening chapter together and steer every twist that follows." },
  { icon: "💬", title: "Stay and talk", body: "Slip into conversation with someone who remembers your story — and you." },
];

export default async function Home() {
  const [feed, trending] = await Promise.all([recentStories(), trendingCompanions()]);
  const empty = trending.length === 0 && feed.length === 0;

  return (
    <main style={S.wrap}>
      <div style={S.glow} />

      <section style={S.hero}>
        <p style={S.eyebrow}>18+ · companions who remember you</p>
        <h1 style={S.h1}>Reverie</h1>
        <p style={S.sub}>Begin with a story. Meet a character. Then stay and talk to someone who remembers every word.</p>
        <div style={S.cta}>
          <a href="/story" style={btn(true)}>Begin a story →</a>
          <a href="/browse" style={btn(false)}>Browse companions</a>
          <a href="/create" style={btn(false)}>Create your own</a>
        </div>
      </section>

      <div style={S.steps}>
        {STEPS.map((s, i) => (
          <div key={i} style={S.step}>
            <div style={S.stepIcon}>{s.icon}</div>
            <div style={S.stepTitle}>{s.title}</div>
            <p style={S.stepBody}>{s.body}</p>
          </div>
        ))}
      </div>

      {trending.length > 0 ? (
        <>
          <p style={S.section}>Trending companions</p>
          <div style={S.grid}>
            {trending.map((c) => (
              <a key={c.id} href={`/c/${c.id}`} style={S.card}>
                <div style={S.cardHead}><CharacterAvatar characterId={c.id} name={c.name} size={34} /><div style={S.cardName}>{c.name}</div></div>
                {c.persona ? <p style={S.cardSnip}>{c.persona.slice(0, 120)}…</p> : null}
                <span style={S.with}>{c.reads} read{c.reads === 1 ? "" : "s"} · {c.stories} stor{c.stories === 1 ? "y" : "ies"}</span>
              </a>
            ))}
          </div>
        </>
      ) : null}

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

      {empty ? (
        <div style={S.emptyPanel}>
          <p style={S.emptyTitle}>The library is waiting for its first story.</p>
          <p style={S.emptyBody}>Create a companion and write their opening chapter — every reader who meets them earns you credits.</p>
          <div style={{ ...S.cta, justifyContent: "center" }}>
            <a href="/create" style={btn(true)}>Create a companion →</a>
            <a href="/story" style={btn(false)}>Begin a story</a>
          </div>
        </div>
      ) : null}

      <footer style={S.footer}>
        <span>Reverie · 18+ fiction</span>
        <span style={S.footLinks}>
          <a href="/browse" style={S.footLink}>Browse</a>
          <a href="/create" style={S.footLink}>Create</a>
          <a href="/credits" style={S.footLink}>Credits</a>
        </span>
      </footer>
    </main>
  );
}

function btn(primary: boolean): React.CSSProperties {
  return primary
    ? { color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", padding: "13px 24px", borderRadius: 12, fontWeight: 650, textDecoration: "none" }
    : { color: "#F4EAF0", background: "#231A2B", border: "1px solid #3A2E44", padding: "13px 24px", borderRadius: 12, fontWeight: 600, textDecoration: "none" };
}

const S: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 900, margin: "0 auto", padding: "64px 24px 40px", lineHeight: 1.6, position: "relative", overflow: "hidden" },
  glow: { position: "absolute", top: -160, left: "50%", transform: "translateX(-50%)", width: 640, height: 420, background: "radial-gradient(closest-side, rgba(212,106,139,.20), rgba(233,160,107,.08), transparent)", pointerEvents: "none", zIndex: 0 },
  hero: { position: "relative", zIndex: 1 },
  eyebrow: { letterSpacing: ".2em", textTransform: "uppercase", fontSize: 12, color: "#E9A06B", fontWeight: 700, margin: 0 },
  h1: { fontFamily: "Georgia, serif", fontSize: 58, margin: "12px 0 14px", letterSpacing: "-.01em" },
  sub: { color: "#C6B7CC", fontSize: 18, maxWidth: 540, lineHeight: 1.55 },
  cta: { display: "flex", gap: 12, marginTop: 26, flexWrap: "wrap" },
  steps: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14, margin: "48px 0 8px", position: "relative", zIndex: 1 },
  step: { background: "#1A1420", border: "1px solid #2f2438", borderRadius: 14, padding: "18px 18px 20px" },
  stepIcon: { fontSize: 24, lineHeight: 1 },
  stepTitle: { fontFamily: "Georgia, serif", fontSize: 18, margin: "12px 0 6px", color: "#F4EAF0" },
  stepBody: { color: "#AC9CB0", fontSize: 14, margin: 0, lineHeight: 1.5 },
  section: { fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "#8A7A90", fontWeight: 700, margin: "52px 0 16px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 16 },
  card: { display: "flex", flexDirection: "column", gap: 10, background: "#1C1422", border: "1px solid #3A2E44", borderRadius: 14, padding: 18, textDecoration: "none", color: "#F4EAF0" },
  cardHead: { display: "flex", alignItems: "center", gap: 10 },
  cardName: { fontFamily: "Georgia, serif", fontSize: 18, lineHeight: 1.2 },
  cardSnip: { color: "#AC9CB0", fontSize: 14, margin: 0, lineHeight: 1.5 },
  with: { color: "#E9A06B", fontSize: 12.5, letterSpacing: ".03em" },
  emptyPanel: { textAlign: "center", background: "#1A1420", border: "1px solid #2f2438", borderRadius: 18, padding: "40px 24px", margin: "40px 0 0" },
  emptyTitle: { fontFamily: "Georgia, serif", fontSize: 24, margin: "0 0 8px", color: "#F4EAF0" },
  emptyBody: { color: "#AC9CB0", fontSize: 15, margin: "0 auto", maxWidth: 460 },
  footer: { display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", alignItems: "center", color: "#6f6276", fontSize: 13, marginTop: 60, paddingTop: 22, borderTop: "1px solid #241a2b" },
  footLinks: { display: "flex", gap: 16 },
  footLink: { color: "#8A7A90", textDecoration: "none" },
};
