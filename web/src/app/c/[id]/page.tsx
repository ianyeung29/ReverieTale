import type { Metadata } from "next";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { characters, stories, users } from "@/db/schema";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { RatingBar } from "@/components/RatingBar";
import { StarRating } from "@/components/StarRating";
import { ratingAggregates, userRating } from "@/lib/ratings";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const [row] = await db.select({ definition: characters.definition, status: characters.status }).from(characters).where(eq(characters.id, id)).limit(1);
    if (!row || row.status !== "published") return { title: "Companion · Reverie" };
    const def = (row.definition ?? {}) as Record<string, unknown>;
    const name = (def.name as string) || "Companion";
    const desc = String((def.persona as string) || (def.backstory as string) || "An AI companion who remembers you.").slice(0, 155);
    return { title: `${name} · Reverie`, description: desc, openGraph: { title: `${name} · Reverie`, description: desc } };
  } catch {
    return { title: "Companion · Reverie" };
  }
}

function chapterCount(content: string): number {
  const n = content.split(/\n{2,}·\s·\s·\n{2,}/).map((s) => s.trim()).filter(Boolean).length;
  return Math.max(1, n);
}

type Profile = {
  id: string;
  name: string;
  age: number | null;
  look: string;
  persona: string;
  backstory: string;
  tags: string[];
  isOwner: boolean;
  creator: string; // display attribution ("Reverie" for first-party)
  creatorId: string | null; // links to the creator catalog; null = first-party
  rating: number; ratingCount: number; myRating: number | null; canRate: boolean;
  stories: { id: string; title: string; snippet: string; chapters: number; reads: number; rating: number; ratingCount: number }[];
};

async function loadProfile(id: string): Promise<Profile | null> {
  try {
    const [char] = await db
      .select({ id: characters.id, definition: characters.definition, status: characters.status, creatorId: characters.creatorId })
      .from(characters)
      .where(eq(characters.id, id))
      .limit(1);
    if (!char) return null;

    const userId = await getCurrentUserId();
    const isOwner = Boolean(char.creatorId && userId && char.creatorId === userId);
    // Unpublished companions are only visible to their creator.
    if (char.status !== "published" && !isOwner) return null;

    const def = (char.definition ?? {}) as Record<string, unknown>;

    // Attribution: first-party (no creator) shows as Reverie; a creator shows
    // their chosen display name, or "Anonymous creator" if they haven't set one.
    // The email is never exposed.
    let creator = "Reverie";
    if (char.creatorId) {
      const [c] = await db.select({ dn: users.displayName }).from(users).where(eq(users.id, char.creatorId)).limit(1);
      creator = c?.dn?.trim() || "Anonymous creator";
    }

    const rows = await db
      .select({ id: stories.id, title: stories.title, content: stories.content, reads: stories.reads })
      .from(stories)
      .where(and(eq(stories.characterId, id), eq(stories.isPublic, true)))
      .orderBy(desc(stories.createdAt))
      .limit(24);

    // Ratings: this character's aggregate + the viewer's own, plus per-story aggregates.
    const charRating = (await ratingAggregates("character", [char.id])).get(char.id) ?? { average: 0, count: 0 };
    const myRating = userId ? await userRating(userId, "character", char.id) : null;
    const storyRatings = await ratingAggregates("story", rows.map((r) => r.id));

    return {
      id: char.id,
      name: (def.name as string) ?? "Unknown",
      age: typeof def.age === "number" ? def.age : null,
      look: (def.look as string) ?? "",
      persona: (def.persona as string) ?? "",
      backstory: (def.backstory as string) ?? "",
      tags: Array.isArray(def.tags) ? (def.tags as string[]) : [],
      isOwner,
      creator,
      creatorId: char.creatorId ?? null,
      rating: charRating.average,
      ratingCount: charRating.count,
      myRating,
      canRate: Boolean(userId) && !isOwner,
      stories: rows.map((r) => {
        const sr = storyRatings.get(r.id) ?? { average: 0, count: 0 };
        return {
          id: r.id,
          title: r.title,
          snippet: r.content.replace(/\s+/g, " ").slice(0, 140),
          chapters: chapterCount(r.content),
          reads: r.reads,
          rating: sr.average,
          ratingCount: sr.count,
        };
      }),
    };
  } catch {
    return null;
  }
}

export default async function CharacterProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await loadProfile(id);

  if (!p) {
    return (
      <main style={S.wrap}>
        <a href="/browse" style={S.back}>← Companions</a>
        <p style={{ color: "#AC9CB0", marginTop: 24 }}>This companion isn&apos;t available. <a href="/browse" style={S.link}>Browse others →</a></p>
      </main>
    );
  }

  return (
    <main style={S.wrap}>
      <a href="/browse" style={S.back}>← Companions</a>

      <div style={S.head} className="rv-reveal">
        <CharacterAvatar characterId={p.id} name={p.name} size={72} />
        <div style={S.headText}>
          <h1 style={S.name}>{p.name}</h1>
          <p style={S.by}>by {p.creatorId ? <a href={`/creator/${p.creatorId}`} style={S.byLink}>{p.creator}</a> : p.creator}</p>
          {p.age || p.look ? <p style={S.look}>{[p.age ? `Age ${p.age}` : null, p.look || null].filter(Boolean).join(" · ")}</p> : null}
          <div style={S.headRating}><StarRating value={p.rating} count={p.ratingCount} size={15} /></div>
          {p.tags.length ? <div style={S.tags}>{p.tags.map((t) => <a key={t} href={`/tag/${encodeURIComponent(t)}`} style={S.tag}>{t}</a>)}</div> : null}
        </div>
      </div>

      <div style={S.cta} className="rv-reveal rv-d1">
        <a href={`/story?characterId=${p.id}`} className="rv-btn rv-btn-primary" style={S.primary}>Begin a story with {p.name} →</a>
        <a href={`/chat?characterId=${p.id}`} className="rv-btn" style={S.secondary}>Chat</a>
        {p.isOwner ? <a href={`/create?id=${p.id}`} className="rv-btn" style={S.secondary}>Edit</a> : null}
      </div>

      {p.canRate ? (
        <div style={S.rateBox} className="rv-reveal rv-d1">
          <RatingBar targetType="character" targetId={p.id} average={p.rating} count={p.ratingCount} mine={p.myRating} canRate={p.canRate} label={`Rate ${p.name}`} showAverage={false} />
        </div>
      ) : null}

      {p.persona ? (<><p style={S.section}>About</p><p style={S.body}>{p.persona}</p></>) : null}
      {p.backstory ? (<><p style={S.section}>Backstory</p><p style={S.body}>{p.backstory}</p></>) : null}

      <p style={S.section}>Stories with {p.name}{p.stories.length ? ` · ${p.stories.length}` : ""}</p>
      {p.stories.length === 0 ? (
        <p style={S.muted}>No stories yet. <a href={`/story?characterId=${p.id}`} style={S.link}>Write the first →</a></p>
      ) : (
        <div style={S.grid}>
          {p.stories.map((s) => (
            <a key={s.id} href={`/story/${s.id}`} className="rv-card" style={S.card}>
              <div style={S.cardTitle}>{s.title}</div>
              <p style={S.cardSnip}>{s.snippet}…</p>
              <span style={S.cardMeta}>
                {s.chapters} chapter{s.chapters === 1 ? "" : "s"} · {s.reads} view{s.reads === 1 ? "" : "s"}
                {s.ratingCount ? <> · <StarRating value={s.rating} count={s.ratingCount} size={12} showNumber={false} /> {s.rating.toFixed(1)}</> : null}
              </span>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 760, margin: "0 auto", padding: "36px 24px 90px", lineHeight: 1.6 },
  back: { color: "#8A7A90", textDecoration: "none", fontSize: 14, letterSpacing: ".04em" },
  link: { color: "#E9A06B" },
  head: { display: "flex", alignItems: "center", gap: 18, margin: "24px 0 20px" },
  headText: { display: "flex", flexDirection: "column", gap: 8 },
  name: { fontFamily: "Georgia, serif", fontSize: 36, margin: 0, lineHeight: 1.1 },
  by: { color: "#8A7A90", margin: 0, fontSize: 13.5 },
  byLink: { color: "#E9A06B", textDecoration: "none" },
  look: { color: "#AC9CB0", margin: 0, fontSize: 14.5 },
  headRating: { marginTop: 2 },
  rateBox: { background: "#1C1422", border: "1px solid #3A2E44", borderRadius: 14, padding: "14px 16px", margin: "0 0 30px" },
  tags: { display: "flex", flexWrap: "wrap", gap: 6 },
  tag: { fontSize: 11.5, color: "#E9A06B", border: "1px solid #4a3a50", borderRadius: 999, padding: "2px 9px", textDecoration: "none" },
  cta: { display: "flex", flexWrap: "wrap", gap: 10, margin: "0 0 30px" },
  primary: { color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", padding: "12px 20px", borderRadius: 11, fontWeight: 650, textDecoration: "none", fontSize: 15 },
  secondary: { color: "#F4EAF0", background: "#231A2B", border: "1px solid #3A2E44", padding: "12px 18px", borderRadius: 11, fontWeight: 600, textDecoration: "none", fontSize: 15 },
  section: { fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "#8A7A90", fontWeight: 700, margin: "28px 0 12px" },
  body: { color: "#EadFe6", fontSize: 15.5, margin: 0, whiteSpace: "pre-wrap" },
  muted: { color: "#AC9CB0" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 14 },
  card: { display: "flex", flexDirection: "column", gap: 8, background: "#1C1422", border: "1px solid #3A2E44", borderRadius: 14, padding: 16, textDecoration: "none", color: "#F4EAF0" },
  cardTitle: { fontFamily: "Georgia, serif", fontSize: 17, lineHeight: 1.2 },
  cardSnip: { color: "#AC9CB0", fontSize: 13.5, margin: 0, lineHeight: 1.5 },
  cardMeta: { color: "#8A7A90", fontSize: 12, marginTop: "auto", display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" },
};
