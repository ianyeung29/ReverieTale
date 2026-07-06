import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { characters, stories } from "@/db/schema";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { listCharacters, trendingScore } from "@/lib/discovery";

export const dynamic = "force-dynamic";

async function recentStories() {
  try {
    const rows = await db
      .select({
        id: stories.id,
        title: stories.title,
        content: stories.content,
        characterId: stories.characterId,
        name: sql<string>`${characters.definition}->>'name'`,
      })
      .from(stories)
      .innerJoin(characters, eq(stories.characterId, characters.id))
      .where(and(eq(stories.isPublic, true), eq(characters.status, "published")))
      .orderBy(desc(stories.createdAt))
      .limit(9);
    return rows.map((r) => ({ id: r.id, title: r.title, name: r.name, characterId: r.characterId, snippet: r.content.replace(/\s+/g, " ").slice(0, 150) }));
  } catch {
    return [];
  }
}

async function storyCount() {
  try {
    const [row] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(stories)
      .innerJoin(characters, eq(stories.characterId, characters.id))
      .where(and(eq(stories.isPublic, true), eq(characters.status, "published")));
    return row?.n ?? 0;
  } catch {
    return 0;
  }
}

const STEPS = [
  { n: "01", icon: "🎭", title: "Meet a companion", body: "Pick a character — or craft your own with a persona, look, and history." },
  { n: "02", icon: "✍️", title: "Shape a story", body: "Write an opening chapter together and steer every twist that follows." },
  { n: "03", icon: "💬", title: "Stay and talk", body: "Slip into conversation with someone who remembers your story — and you." },
];

const CSS = `
@keyframes rvShimmer { to { background-position: 200% center; } }
@keyframes rvUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
.rv-title { background: linear-gradient(100deg,#F4EAF0 8%,#E9A06B 38%,#D46A8B 58%,#F4EAF0 88%); background-size: 200% auto; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; animation: rvShimmer 7s linear infinite; }
.rv-reveal { animation: rvUp .6s cubic-bezier(.2,.7,.2,1) both; }
.rv-d1 { animation-delay: .06s; } .rv-d2 { animation-delay: .14s; } .rv-d3 { animation-delay: .22s; }
.rv-card { transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease; }
.rv-card:hover { transform: translateY(-4px); border-color: #5a4560; box-shadow: 0 16px 40px rgba(0,0,0,.4); }
.rv-btn { transition: transform .15s ease, filter .15s ease, box-shadow .15s ease; }
.rv-btn:hover { transform: translateY(-2px); filter: brightness(1.07); }
.rv-btn-primary:hover { box-shadow: 0 12px 28px rgba(212,106,139,.38); }
`;

export default async function Home() {
  const [feed, allChars, storyTotal] = await Promise.all([recentStories(), listCharacters().catch(() => []), storyCount()]);
  const trending = [...allChars].sort((a, b) => trendingScore(b.reads, b.createdAt) - trendingScore(a.reads, a.createdAt)).slice(0, 6);
  const companions = allChars.length;
  const empty = trending.length === 0 && feed.length === 0;
  const hasStats = companions > 0 || storyTotal > 0;

  return (
    <main style={S.wrap}>
      <style>{CSS}</style>
      <div style={S.auroraA} />
      <div style={S.auroraB} />

      <section style={S.hero} className="rv-reveal">
        <p style={S.eyebrow}>18+ · companions who remember you</p>
        <h1 style={S.h1}><span className="rv-title">Reverie</span></h1>
        <p style={S.sub}>Begin with a story. Meet a character. Then stay and talk to someone who remembers every word.</p>
        {hasStats ? (
          <p style={S.stat}>{companions} companion{companions === 1 ? "" : "s"} · {storyTotal} stor{storyTotal === 1 ? "y" : "ies"} · always remembering</p>
        ) : null}
        <div style={S.cta}>
          <a href="/story" className="rv-btn rv-btn-primary" style={btn(true)}>Begin a story →</a>
          <a href="/browse" className="rv-btn" style={btn(false)}>Browse companions</a>
          <a href="/create" className="rv-btn" style={btn(false)}>Create your own</a>
        </div>
      </section>

      <div style={S.steps} className="rv-reveal rv-d1">
        {STEPS.map((s) => (
          <div key={s.n} style={S.step}>
            <div style={S.stepTop}><span style={S.stepIcon}>{s.icon}</span><span style={S.stepNum}>{s.n}</span></div>
            <div style={S.stepTitle}>{s.title}</div>
            <p style={S.stepBody}>{s.body}</p>
          </div>
        ))}
      </div>

      {trending.length > 0 ? (
        <section className="rv-reveal rv-d2">
          <div style={S.sectionRow}><p style={{ ...S.section, margin: 0 }}>✦ Trending companions</p><a href="/browse" style={S.seeAll}>See all →</a></div>
          <div style={S.grid}>
            {trending.map((c) => (
              <a key={c.id} href={`/c/${c.id}`} className="rv-card" style={S.card}>
                <div style={S.cardHead}>
                  <CharacterAvatar characterId={c.id} name={c.name} size={44} />
                  <div style={S.cardHeadText}>
                    <div style={S.cardName}>{c.name}</div>
                    <span style={S.with}>{c.reads} read{c.reads === 1 ? "" : "s"} · {c.stories} stor{c.stories === 1 ? "y" : "ies"}</span>
                  </div>
                </div>
                {c.persona ? <p style={S.cardSnip}>{c.persona.slice(0, 110)}…</p> : null}
                {c.tags.length ? <div style={S.tags}>{c.tags.slice(0, 3).map((t) => <span key={t} style={S.tag}>{t}</span>)}</div> : null}
              </a>
            ))}
          </div>
        </section>
      ) : null}

      {feed.length > 0 ? (
        <section className="rv-reveal rv-d3">
          <p style={S.section}>✦ Fresh from the community</p>
          <div style={S.grid}>
            {feed.map((s) => (
              <a key={s.id} href={`/story/${s.id}`} className="rv-card" style={S.card}>
                <div style={S.cardHead}><CharacterAvatar characterId={s.characterId} name={s.name} size={40} /><div style={S.cardName}>{s.title}</div></div>
                <p style={S.cardSnip}>{s.snippet}…</p>
                <span style={S.with}>with {s.name}</span>
              </a>
            ))}
          </div>
        </section>
      ) : null}

      {empty ? (
        <div style={S.emptyPanel} className="rv-reveal rv-d1">
          <p style={S.emptyTitle}>The library is waiting for its first story.</p>
          <p style={S.emptyBody}>Create a companion and write their opening chapter — every reader who meets them earns you credits.</p>
          <div style={{ ...S.cta, justifyContent: "center" }}>
            <a href="/create" className="rv-btn rv-btn-primary" style={btn(true)}>Create a companion →</a>
            <a href="/story" className="rv-btn" style={btn(false)}>Begin a story</a>
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
  wrap: { maxWidth: 940, margin: "0 auto", padding: "68px 24px 40px", lineHeight: 1.6, position: "relative", overflow: "hidden" },
  auroraA: { position: "absolute", top: -180, left: "18%", width: 520, height: 420, background: "radial-gradient(closest-side, rgba(233,160,107,.18), transparent)", pointerEvents: "none", zIndex: 0, filter: "blur(6px)" },
  auroraB: { position: "absolute", top: -120, right: "10%", width: 480, height: 400, background: "radial-gradient(closest-side, rgba(212,106,139,.20), transparent)", pointerEvents: "none", zIndex: 0, filter: "blur(6px)" },
  hero: { position: "relative", zIndex: 1 },
  eyebrow: { letterSpacing: ".22em", textTransform: "uppercase", fontSize: 12, color: "#E9A06B", fontWeight: 700, margin: 0 },
  h1: { fontFamily: "Georgia, serif", fontSize: 66, margin: "14px 0 16px", letterSpacing: "-.015em", lineHeight: 1 },
  sub: { color: "#C6B7CC", fontSize: 19, maxWidth: 560, lineHeight: 1.55, margin: 0 },
  stat: { color: "#8A7A90", fontSize: 13.5, margin: "16px 0 0", letterSpacing: ".02em", fontVariantNumeric: "tabular-nums" },
  cta: { display: "flex", gap: 12, marginTop: 26, flexWrap: "wrap" },
  steps: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14, margin: "52px 0 8px", position: "relative", zIndex: 1 },
  step: { background: "linear-gradient(180deg,#1C1524,#171120)", border: "1px solid #2f2438", borderRadius: 16, padding: "18px 18px 20px" },
  stepTop: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  stepIcon: { fontSize: 24, lineHeight: 1 },
  stepNum: { fontFamily: "Georgia, serif", fontSize: 15, color: "#5a4560", fontWeight: 700 },
  stepTitle: { fontFamily: "Georgia, serif", fontSize: 18, margin: "12px 0 6px", color: "#F4EAF0" },
  stepBody: { color: "#AC9CB0", fontSize: 14, margin: 0, lineHeight: 1.5 },
  sectionRow: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, margin: "52px 0 16px" },
  section: { fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "#9A8AA0", fontWeight: 700, margin: "52px 0 16px" },
  seeAll: { color: "#E9A06B", textDecoration: "none", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 16 },
  card: { display: "flex", flexDirection: "column", gap: 11, background: "#1C1422", border: "1px solid #3A2E44", borderRadius: 16, padding: 18, textDecoration: "none", color: "#F4EAF0" },
  cardHead: { display: "flex", alignItems: "center", gap: 11 },
  cardHeadText: { display: "flex", flexDirection: "column", gap: 2, minWidth: 0 },
  cardName: { fontFamily: "Georgia, serif", fontSize: 18, lineHeight: 1.2 },
  cardSnip: { color: "#AC9CB0", fontSize: 14, margin: 0, lineHeight: 1.5 },
  tags: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: "auto" },
  tag: { fontSize: 11, color: "#E9A06B", border: "1px solid #4a3a50", borderRadius: 999, padding: "2px 9px" },
  with: { color: "#E9A06B", fontSize: 12.5, letterSpacing: ".03em" },
  emptyPanel: { textAlign: "center", background: "linear-gradient(180deg,#1C1524,#171120)", border: "1px solid #2f2438", borderRadius: 20, padding: "48px 24px", margin: "44px 0 0", position: "relative", zIndex: 1 },
  emptyTitle: { fontFamily: "Georgia, serif", fontSize: 26, margin: "0 0 8px", color: "#F4EAF0" },
  emptyBody: { color: "#AC9CB0", fontSize: 15, margin: "0 auto 4px", maxWidth: 460 },
  footer: { display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", alignItems: "center", color: "#6f6276", fontSize: 13, marginTop: 64, paddingTop: 22, borderTop: "1px solid #241a2b" },
  footLinks: { display: "flex", gap: 16 },
  footLink: { color: "#8A7A90", textDecoration: "none" },
};
