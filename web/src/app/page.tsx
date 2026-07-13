import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { characters, stories, threads } from "@/db/schema";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { CharacterCard } from "@/components/CharacterCard";
import { StoryTile } from "@/components/StoryTile";
import { StarRating } from "@/components/StarRating";
import { listCharacters, trendingScore } from "@/lib/discovery";
import { ratingAggregates } from "@/lib/ratings";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

async function recentStories() {
  try {
    const rows = await db
      .select({
        id: stories.id,
        title: stories.title,
        content: stories.content,
        characterId: stories.characterId,
        reads: stories.reads,
        name: sql<string>`${characters.definition}->>'name'`,
      })
      .from(stories)
      .innerJoin(characters, eq(stories.characterId, characters.id))
      .where(and(eq(stories.isPublic, true), eq(characters.status, "published")))
      .orderBy(desc(stories.createdAt))
      .limit(9);
    let ratingByStory = new Map<string, { average: number; count: number }>();
    try {
      ratingByStory = await ratingAggregates("story", rows.map((r) => r.id));
    } catch {
      /* ratings table not migrated yet */
    }
    return rows.map((r) => {
      const rt = ratingByStory.get(r.id) ?? { average: 0, count: 0 };
      return { id: r.id, title: r.title, name: r.name, characterId: r.characterId, reads: r.reads, rating: rt.average, ratingCount: rt.count, snippet: r.content.replace(/\s+/g, " ").slice(0, 150) };
    });
  } catch {
    return [];
  }
}

// The signed-in reader's most recent conversations, one per companion (a
// companion might have several threads across different stories - only the
// latest one matters here), so "Continue" always resumes where they left off.
async function recentThreads(userId: string) {
  try {
    const rows = await db
      .select({
        characterId: threads.characterId,
        name: sql<string>`${characters.definition}->>'name'`,
        lastActiveAt: threads.lastActiveAt,
      })
      .from(threads)
      .innerJoin(characters, eq(threads.characterId, characters.id))
      .where(and(eq(threads.userId, userId), eq(characters.status, "published")))
      .orderBy(desc(threads.lastActiveAt))
      .limit(30);
    const seen = new Set<string>();
    const out: { characterId: string; name: string; lastActiveAt: Date }[] = [];
    for (const r of rows) {
      if (seen.has(r.characterId)) continue;
      seen.add(r.characterId);
      out.push(r);
      if (out.length >= 8) break;
    }
    return out;
  } catch {
    return [];
  }
}

/** A public story to send the "Read their story" spotlight CTA to - most-read first. */
async function topStoryFor(characterId: string): Promise<string | null> {
  try {
    const [row] = await db
      .select({ id: stories.id })
      .from(stories)
      .where(and(eq(stories.characterId, characterId), eq(stories.isPublic, true)))
      .orderBy(desc(stories.reads))
      .limit(1);
    return row?.id ?? null;
  } catch {
    return null;
  }
}

// Deterministic "random" pick that only changes once a day, so the spotlight
// doesn't reshuffle on every request - but a different seed (e.g. the viewer's
// id) gives different visitors a different pick on the same day.
function dailyPick<T>(list: T[], seed: string): T | null {
  if (!list.length) return null;
  const day = new Date().toISOString().slice(0, 10);
  let h = 0;
  for (const ch of day + seed) h = (h * 31 + ch.charCodeAt(0)) % 1_000_000;
  return list[h % list.length];
}

const STEPS = [
  { n: "01", icon: "🎭", title: "Meet a companion", body: "Pick a character — or craft your own with a persona, look, and history." },
  { n: "02", icon: "✍️", title: "Shape a story", body: "Write an opening chapter together and steer every twist that follows." },
  { n: "03", icon: "💬", title: "Stay and talk", body: "Slip into conversation with someone who remembers your story — and you." },
];

export default async function Home() {
  const viewerId = await getCurrentUserId();
  const [feed, allChars, continueWith] = await Promise.all([
    recentStories(),
    listCharacters({ viewerId: viewerId ?? undefined }).catch(() => []),
    viewerId ? recentThreads(viewerId) : Promise.resolve([]),
  ]);
  const trending = [...allChars].sort((a, b) => trendingScore(b.reads, b.createdAt) - trendingScore(a.reads, a.createdAt)).slice(0, 6);
  const empty = trending.length === 0 && feed.length === 0;

  // Spotlight: a companion with a real portrait, rotated once a day. Personalized
  // when signed in - prefer someone the reader hasn't met yet (a discovery nudge;
  // the "Continue" row already covers who they already know), falling back to the
  // full catalog once they've tried everyone. A per-viewer seed means different
  // readers can get a different pick on the same day, not just one global choice.
  const withImage = allChars.filter((c) => c.hasImage);
  const knownIds = new Set(continueWith.map((c) => c.characterId));
  const undiscovered = withImage.filter((c) => !knownIds.has(c.id));
  const spotlightPool = undiscovered.length > 0 ? undiscovered : withImage;
  const spotlight = dailyPick(spotlightPool, viewerId ?? "anon");
  const spotlightStoryId = spotlight ? await topStoryFor(spotlight.id) : null;

  // "Choose a world": image-forward story-moment tiles. Portraits carry these,
  // so prefer companions that have one; fall back to the rest if few do, and
  // keep the current spotlight out of the row so it isn't shown twice.
  const worldPool = (withImage.length >= 4 ? withImage : allChars).filter((c) => c.id !== spotlight?.id);
  const worlds = worldPool.slice(0, 8);

  // "Pick tonight's mood": the most common tags across the live catalog, so every
  // chip is guaranteed to lead somewhere populated.
  const moodCounts = new Map<string, number>();
  for (const c of allChars) for (const t of c.tags) moodCounts.set(t, (moodCounts.get(t) ?? 0) + 1);
  const moods = [...moodCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([t]) => t);

  return (
    <main style={S.wrap}>
      <div style={S.auroraA} />
      <div style={S.auroraB} />

      <section style={S.hero} className="rv-reveal">
        <div style={S.heroTop}>
          <div style={S.heroTitleCol}>
            <p style={S.eyebrow}>companions who remember you</p>
            <h1 style={S.h1}><span className="rv-title">Reverie</span></h1>
          </div>
          <p style={S.sub}>Begin with a story. Meet a character. Then stay and talk to someone who remembers every word.</p>
        </div>
        <div style={S.cta}>
          <a href="/story" className="rv-btn rv-btn-primary" style={btn(true)}>Begin a story →</a>
          <a href="/browse" className="rv-btn" style={btn(false)}>Browse companions</a>
          <a href="/create" className="rv-btn" style={btn(false)}>Create your own</a>
        </div>
      </section>

      {spotlight ? (
        <section style={S.spot} className="rv-reveal rv-d1">
          <div aria-hidden style={S.spotBgLayer}>
            <div style={{ ...S.spotBgImage, backgroundImage: `url(/api/characters/${spotlight.id}/image)` }} />
            <div style={S.spotScrim} />
          </div>
          <div style={S.spotPortrait}>
            <CharacterAvatar characterId={spotlight.id} name={spotlight.name} shape="rect" />
          </div>
          <div style={S.spotBody}>
            <p style={S.spotEyebrow}>Tonight&apos;s spotlight</p>
            <h2 style={S.spotName}>{spotlight.name}</h2>
            {spotlight.tagline ? <p style={S.spotHook}>{spotlight.tagline}</p> : null}
            {spotlight.tags.length ? (
              <div style={S.spotTags}>
                {spotlight.tags.slice(0, 4).map((t) => <span key={t} style={S.spotTag}>{t}</span>)}
              </div>
            ) : null}
            {spotlight.greeting ? <p style={S.spotQuote}>&ldquo;{spotlight.greeting}&rdquo;</p> : null}
            <div style={S.spotCta}>
              {spotlightStoryId ? (
                <a href={`/story/${spotlightStoryId}`} className="rv-btn rv-btn-primary" style={btn(true)}>Read their story →</a>
              ) : (
                <a href={`/story?characterId=${spotlight.id}`} className="rv-btn rv-btn-primary" style={btn(true)}>Begin their story →</a>
              )}
              <a href={`/chat?characterId=${spotlight.id}`} className="rv-btn" style={btn(false)}>Chat with {spotlight.name}</a>
            </div>
          </div>
        </section>
      ) : null}

      {continueWith.length > 0 ? (
        <section className="rv-reveal rv-d1">
          <p style={{ ...S.section, margin: "36px 0 14px" }}>Continue</p>
          <div style={S.continueRow}>
            {continueWith.map((c) => (
              <a key={c.characterId} href={`/chat?characterId=${c.characterId}`} style={S.continueItem}>
                <div style={S.continueRing}><CharacterAvatar characterId={c.characterId} name={c.name} size={64} /></div>
                <span style={S.continueName}>{c.name}</span>
                <span style={S.continueWhen}>{new Date(c.lastActiveAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
              </a>
            ))}
          </div>
        </section>
      ) : null}

      {moods.length ? (
        <div style={S.tabStrip} className="rv-reveal rv-d1">
          <a href="/browse" className="rv-chip" style={{ ...S.tab, ...S.tabLead }}>All companions</a>
          {moods.map((t) => (
            <a key={t} href={`/tag/${encodeURIComponent(t)}`} className="rv-chip" style={S.tab}>{t}</a>
          ))}
        </div>
      ) : null}

      {worlds.length > 0 ? (
        <section className="rv-reveal rv-d2">
          <div style={S.sectionRow}><p style={{ ...S.section, margin: 0 }}>✦ Choose a world</p><a href="/browse" style={S.seeAll}>See all →</a></div>
          <div className="rv-tile-grid">
            {worlds.map((c) => (
              <StoryTile key={c.id} t={{ id: c.id, name: c.name, hook: c.tagline, tags: c.tags, hasImage: c.hasImage }} />
            ))}
          </div>
        </section>
      ) : null}

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
              <CharacterCard key={c.id} c={c} />
            ))}
          </div>
        </section>
      ) : null}

      {feed.length > 0 ? (
        <section className="rv-reveal rv-d3">
          <div style={S.sectionRow}><p style={{ ...S.section, margin: 0 }}>✦ Fresh from the community</p><a href="/stories" style={S.seeAll}>Browse stories →</a></div>
          <div style={S.grid}>
            {feed.map((s) => (
              <a key={s.id} href={`/story/${s.id}`} className="rv-card" style={S.card}>
                <div style={S.cardHead}><CharacterAvatar characterId={s.characterId} name={s.name} size={40} /><div style={S.cardName}>{s.title}</div></div>
                <p style={S.cardSnip}>{s.snippet}…</p>
                <span style={S.with}>
                  with {s.name} · {s.reads} view{s.reads === 1 ? "" : "s"}
                  {s.ratingCount ? <> · <StarRating value={s.rating} count={s.ratingCount} size={11} showNumber={false} /> {s.rating.toFixed(1)}</> : null}
                </span>
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
        <span>Reverie · interactive fiction</span>
        <span style={S.footLinks}>
          <a href="/browse" style={S.footLink}>Companions</a>
          <a href="/stories" style={S.footLink}>Stories</a>
          <a href="/create" style={S.footLink}>Create</a>
          <a href="/credits" style={S.footLink}>Credits</a>
          <a href="/guidelines" style={S.footLink}>Guidelines</a>
          <a href="/legal" style={S.footLink}>Legal</a>
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
  hero: { position: "relative", zIndex: 1, padding: 4, borderRadius: 24, overflow: "hidden" },
  eyebrow: { position: "relative", letterSpacing: ".22em", textTransform: "uppercase", fontSize: 12, color: "#E9A06B", fontWeight: 700, margin: 0 },
  h1: { position: "relative", fontFamily: "Georgia, serif", fontSize: 66, margin: "14px 0 16px", letterSpacing: "-.015em", lineHeight: 1 },
  heroTop: { position: "relative", zIndex: 1, display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px 40px" },
  heroTitleCol: { minWidth: 0 },
  sub: { position: "relative", color: "#C6B7CC", fontSize: 18, maxWidth: 360, lineHeight: 1.55, margin: 0, flex: "1 1 280px" },
  stat: { position: "relative", color: "#8A7A90", fontSize: 13.5, margin: "16px 0 0", letterSpacing: ".02em", fontVariantNumeric: "tabular-nums" },
  cta: { position: "relative", display: "flex", gap: 12, marginTop: 26, flexWrap: "wrap" },
  spot: { position: "relative", zIndex: 1, marginTop: 40, borderRadius: 24, overflow: "hidden", border: "1px solid #3A2E44", display: "flex", flexWrap: "wrap", gap: 28, padding: 28 },
  spotBgLayer: { position: "absolute", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" },
  spotBgImage: { position: "absolute", inset: -30, backgroundSize: "cover", backgroundPosition: "center 20%", filter: "blur(16px) brightness(.4) saturate(1.15)", transform: "scale(1.12)" },
  spotScrim: { position: "absolute", inset: 0, background: "linear-gradient(100deg, rgba(21,15,26,.72), rgba(21,15,26,.5))" },
  spotPortrait: { position: "relative", zIndex: 1, width: 260, maxWidth: "100%", flexShrink: 0 },
  spotBody: { position: "relative", zIndex: 1, flex: "1 1 320px", minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 8 },
  spotEyebrow: { letterSpacing: ".18em", textTransform: "uppercase", fontSize: 11.5, color: "#E9A06B", fontWeight: 700, margin: 0 },
  spotName: { fontFamily: "Georgia, serif", fontSize: 38, margin: "2px 0 0", color: "#F4EAF0" },
  spotHook: { color: "#C6B7CC", fontSize: 15, margin: 0, maxWidth: 480 },
  spotTags: { display: "flex", flexWrap: "wrap", gap: 6, margin: "2px 0" },
  spotTag: { fontSize: 11.5, color: "#F4EAF0", background: "rgba(233,160,107,.16)", border: "1px solid rgba(233,160,107,.4)", borderRadius: 999, padding: "3px 10px", textTransform: "capitalize" },
  spotQuote: { color: "#EadFe6", fontSize: 15.5, fontStyle: "italic", margin: "6px 0 4px", lineHeight: 1.5, borderLeft: "2px solid #E9A06B", paddingLeft: 12, maxWidth: 480 },
  spotCta: { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 10 },
  continueRow: { display: "flex", gap: 18, overflowX: "auto", paddingBottom: 4, position: "relative", zIndex: 1 },
  continueItem: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textDecoration: "none", flexShrink: 0, width: 76 },
  continueRing: { padding: 3, borderRadius: "50%", background: "linear-gradient(135deg,#E9A06B,#D46A8B)" },
  continueName: { color: "#F4EAF0", fontSize: 12.5, fontWeight: 600, textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 76 },
  continueWhen: { color: "#6f6276", fontSize: 11 },
  tabStrip: { display: "flex", gap: 9, alignItems: "center", margin: "26px 0 0", position: "relative", zIndex: 1, overflowX: "auto", paddingBottom: 4 },
  tab: { fontSize: 13, color: "#CBBBD0", background: "#241B2D", border: "1px solid #3A2E44", borderRadius: 999, padding: "8px 15px", textDecoration: "none", textTransform: "capitalize", whiteSpace: "nowrap", flexShrink: 0 },
  tabLead: { color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", border: "1px solid transparent", fontWeight: 650 },
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
  card: { display: "flex", flexDirection: "column", gap: 11, background: "#241B2D", border: "1px solid #3A2E44", borderRadius: 16, padding: 18, textDecoration: "none", color: "#F4EAF0" },
  cardHead: { display: "flex", alignItems: "center", gap: 11 },
  cardHeadText: { display: "flex", flexDirection: "column", gap: 2, minWidth: 0 },
  cardName: { fontFamily: "Georgia, serif", fontSize: 18, lineHeight: 1.2 },
  cardSnip: { color: "#AC9CB0", fontSize: 14, margin: 0, lineHeight: 1.5 },
  tags: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: "auto" },
  tag: { fontSize: 11, color: "#E9A06B", border: "1px solid #4a3a50", borderRadius: 999, padding: "2px 9px" },
  with: { color: "#E9A06B", fontSize: 12.5, letterSpacing: ".03em", display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" },
  emptyPanel: { textAlign: "center", background: "linear-gradient(180deg,#1C1524,#171120)", border: "1px solid #2f2438", borderRadius: 20, padding: "48px 24px", margin: "44px 0 0", position: "relative", zIndex: 1 },
  emptyTitle: { fontFamily: "Georgia, serif", fontSize: 26, margin: "0 0 8px", color: "#F4EAF0" },
  emptyBody: { color: "#AC9CB0", fontSize: 15, margin: "0 auto 4px", maxWidth: 460 },
  footer: { display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", alignItems: "center", color: "#6f6276", fontSize: 13, marginTop: 64, paddingTop: 22, borderTop: "1px solid #241a2b" },
  footLinks: { display: "flex", gap: 16 },
  footLink: { color: "#8A7A90", textDecoration: "none" },
};
