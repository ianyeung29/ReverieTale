import type { Metadata } from "next";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { characters, stories, users } from "@/db/schema";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { EpisodeShelf } from "@/components/EpisodeShelf";
import { SceneStarter } from "@/components/SceneStarter";
import { RatingBar } from "@/components/RatingBar";
import { StarRating } from "@/components/StarRating";
import { HideToggle, ReportLink } from "@/components/TrustControls";
import { isCharacterBlocked } from "@/lib/blocks";
import { logUnlessMissingRelation } from "@/lib/db-errors";
import { ratingAggregates, userRating } from "@/lib/ratings";
import { getCurrentUserId } from "@/lib/session";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const [row] = await db.select({ definition: characters.definition, status: characters.status }).from(characters).where(eq(characters.id, id)).limit(1);
    if (!row || row.status !== "published") return { title: "Companion" };
    const def = (row.definition ?? {}) as Record<string, unknown>;
    const name = (def.name as string) || "Companion";
    const desc = String((def.persona as string) || (def.backstory as string) || "An AI companion who remembers you.").slice(0, 155);
    const img = `/api/characters/${id}/image`;
    return {
      title: name,
      description: desc,
      alternates: { canonical: `/c/${id}` },
      openGraph: { title: `${name} · ReverieTale`, description: desc, type: "profile", url: `/c/${id}`, images: [img] },
      twitter: { card: "summary_large_image", title: `${name} · ReverieTale`, description: desc, images: [img] },
    };
  } catch {
    return { title: "Companion" };
  }
}

function cap(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function chapterCount(content: string): number {
  const n = content.split(/\n{2,}·\s·\s·\n{2,}/).map((s) => s.trim()).filter(Boolean).length;
  return Math.max(1, n);
}

type Profile = {
  id: string;
  name: string;
  gender: string;
  age: number | null;
  look: string;
  persona: string;
  backstory: string;
  greeting: string;
  tags: string[];
  isOwner: boolean;
  creator: string; // display attribution ("ReverieTale" for first-party)
  creatorId: string | null; // links to the creator catalog; null = first-party
  rating: number; ratingCount: number; myRating: number | null; canRate: boolean;
  canModerate: boolean; isBlocked: boolean;
  hasScene: boolean;
  stories: { id: string; title: string; hook: string; chapters: number; readMin: number; reads: number; rating: number; ratingCount: number; hasCover: boolean }[];
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

    // Attribution: first-party (no creator) shows as ReverieTale; a creator shows
    // their chosen display name, or "Anonymous creator" if they haven't set one.
    // The email is never exposed.
    let creator = "ReverieTale";
    if (char.creatorId) {
      const [c] = await db.select({ dn: users.displayName }).from(users).where(eq(users.id, char.creatorId)).limit(1);
      creator = c?.dn?.trim() || "Anonymous creator";
    }

    const rows = await db
      .select({ id: stories.id, title: stories.title, content: stories.content, reads: stories.reads, hasCover: sql<boolean>`(${stories.imageKey} is not null)` })
      .from(stories)
      .where(and(eq(stories.characterId, id), eq(stories.isPublic, true)))
      .orderBy(desc(stories.createdAt))
      .limit(24);

    // Character scene art is optional (migration 0018); probe it separately so a
    // missing column never breaks the profile.
    let hasScene = false;
    try {
      const [sc] = await db.select({ h: sql<boolean>`(${characters.sceneImageKey} is not null)` }).from(characters).where(eq(characters.id, id)).limit(1);
      hasScene = Boolean(sc?.h);
    } catch {
      /* scene_image column not migrated yet */
    }

    // Ratings: this character's aggregate + the viewer's own, plus per-story aggregates.
    const charRating = (await ratingAggregates("character", [char.id])).get(char.id) ?? { average: 0, count: 0 };
    const myRating = userId ? await userRating(userId, "character", char.id) : null;
    const storyRatings = await ratingAggregates("story", rows.map((r) => r.id));

    // Blocked state is optional (migration 0012); never let a missing table break the profile.
    let blocked = false;
    if (userId && !isOwner) {
      try {
        blocked = await isCharacterBlocked(userId, char.id);
      } catch (e) {
        logUnlessMissingRelation("c/:id block check", e);
      }
    }

    return {
      id: char.id,
      name: (def.name as string) ?? "Unknown",
      gender: (def.gender as string) ?? "",
      age: typeof def.age === "number" ? def.age : null,
      look: (def.look as string) ?? "",
      persona: (def.persona as string) ?? "",
      backstory: (def.backstory as string) ?? "",
      greeting: (def.greeting as string) ?? "",
      tags: Array.isArray(def.tags) ? (def.tags as string[]) : [],
      isOwner,
      creator,
      creatorId: char.creatorId ?? null,
      rating: charRating.average,
      ratingCount: charRating.count,
      myRating,
      canRate: Boolean(userId) && !isOwner,
      canModerate: Boolean(userId) && !isOwner,
      isBlocked: blocked,
      hasScene,
      stories: rows.map((r) => {
        const sr = storyRatings.get(r.id) ?? { average: 0, count: 0 };
        const words = r.content.trim().split(/\s+/).length;
        return {
          id: r.id,
          title: r.title,
          hook: r.content.replace(/\s+/g, " ").slice(0, 110),
          chapters: chapterCount(r.content),
          readMin: Math.max(1, Math.round(words / 200)),
          reads: r.reads,
          rating: sr.average,
          ratingCount: sr.count,
          hasCover: Boolean(r.hasCover),
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
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          url: absoluteUrl(`/c/${p.id}`),
          mainEntity: {
            "@type": "Person",
            name: p.name,
            description: p.persona || p.backstory,
            image: absoluteUrl(`/api/characters/${p.id}/image`),
            knowsAbout: p.tags,
          },
        }}
      />
      <main style={S.wrap}>
      <a href="/browse" style={S.back}>← Companions</a>

      <section style={S.hero} className="rv-reveal">
        <div aria-hidden style={S.heroBgLayer}>
          <div style={{ ...S.heroBgImage, backgroundImage: `url(/api/characters/${p.id}/${p.hasScene ? "scene" : "image"})` }} />
          <div style={S.heroScrim} />
        </div>
        <div style={S.heroInner} className="rv-profile-head">
          <div style={S.heroPortrait} className="rv-profile-portrait">
            <CharacterAvatar characterId={p.id} name={p.name} shape="rect" enlargeable />
          </div>
          <div style={S.heroText}>
            <h1 style={S.name}>{p.name}</h1>
            <p style={S.by}>by {p.creatorId ? <a href={`/creator/${p.creatorId}`} style={S.byLink}>{p.creator}</a> : p.creator}</p>
            {p.backstory ? <p style={S.premise}>{p.backstory}</p> : null}
            {p.greeting ? <p style={S.greeting}>&ldquo;{p.greeting}&rdquo;</p> : null}
            <div style={S.heroCta}>
              <a href={`/story?characterId=${p.id}`} className="rv-btn rv-btn-primary" style={S.primary}>Enter the story →</a>
              <a href={`/chat?characterId=${p.id}`} className="rv-btn" style={S.secondary}>Talk to {p.name}</a>
              {p.isOwner ? <a href={`/create?id=${p.id}`} className="rv-btn" style={S.secondary}>Edit</a> : null}
            </div>
          </div>
        </div>
      </section>

      <div style={S.signals} className="rv-reveal rv-d1">
        {[p.age ? `Age ${p.age}` : null, p.gender ? cap(p.gender) : null, ...p.tags].filter(Boolean).map((sig, i) => (
          <span key={i} style={S.signal}>{sig}</span>
        ))}
        <span style={S.signalRating}><StarRating value={p.rating} count={p.ratingCount} size={13} /></span>
      </div>

      <div id="scene-starters" className="rv-reveal rv-d1">
        <SceneStarter character={{ id: p.id, name: p.name, tags: p.tags, tagline: p.backstory }} />
      </div>

      {p.canModerate ? (
        <div style={S.trustRow}>
          <HideToggle characterId={p.id} initialHidden={p.isBlocked} />
          <span style={S.trustDot}>·</span>
          <ReportLink targetType="character" targetId={p.id} hideCharacterId={p.id} hideAlreadyHidden={p.isBlocked} hideLabel={p.name} />
        </div>
      ) : null}

      {p.canRate ? (
        <div style={S.rateBox} className="rv-reveal rv-d1">
          <RatingBar targetType="character" targetId={p.id} average={p.rating} count={p.ratingCount} mine={p.myRating} canRate={p.canRate} label={`Rate ${p.name}`} showAverage={false} />
        </div>
      ) : null}

      {p.persona ? (<><p style={S.section}>About</p><p style={S.body}>{p.persona}</p></>) : null}
      {p.backstory ? (<><p style={S.section}>Backstory</p><p style={S.body}>{p.backstory}</p></>) : null}

      <p style={S.section}>Episodes with {p.name}{p.stories.length ? ` · ${p.stories.length}` : ""}</p>
      {p.stories.length === 0 ? (
        <p style={S.muted}>No stories yet. <a href={`/story?characterId=${p.id}`} style={S.link}>Write the first →</a></p>
      ) : (
        <EpisodeShelf items={p.stories} />
      )}
      </main>
    </>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 760, margin: "0 auto", padding: "36px 24px 90px", lineHeight: 1.6 },
  back: { color: "#8A7A90", textDecoration: "none", fontSize: 14, letterSpacing: ".04em" },
  link: { color: "#E9A06B" },
  hero: { position: "relative", margin: "20px 0 0", borderRadius: 22, overflow: "hidden", border: "1px solid #3A2E44", minHeight: 300 },
  heroBgLayer: { position: "absolute", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" },
  heroBgImage: { position: "absolute", inset: -30, backgroundSize: "cover", backgroundPosition: "center 25%", filter: "blur(14px) brightness(.42) saturate(1.15)", transform: "scale(1.12)" },
  heroScrim: { position: "absolute", inset: 0, background: "linear-gradient(120deg, rgba(21,15,26,.78), rgba(21,15,26,.5))" },
  heroInner: { position: "relative", zIndex: 1, display: "flex", alignItems: "flex-start", gap: 22, padding: 24 },
  heroPortrait: { flexShrink: 0, width: 172 },
  heroText: { display: "flex", flexDirection: "column", gap: 8, minWidth: 0, flex: 1 },
  name: { fontFamily: "Georgia, serif", fontSize: 38, margin: 0, lineHeight: 1.05, color: "#F4EAF0" },
  by: { color: "#AC9CB0", margin: 0, fontSize: 13.5 },
  byLink: { color: "#E9A06B", textDecoration: "none" },
  premise: { color: "#D9CBDE", margin: "2px 0 0", fontSize: 15, lineHeight: 1.5, maxWidth: 480 },
  greeting: { color: "#EadFe6", fontSize: 15.5, fontStyle: "italic", margin: "4px 0 2px", lineHeight: 1.5, borderLeft: "2px solid #E9A06B", paddingLeft: 12, maxWidth: 480 },
  heroCta: { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8 },
  signals: { display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", margin: "16px 0 28px" },
  signal: { fontSize: 12, color: "#CBBBD0", background: "#241B2D", border: "1px solid #3A2E44", borderRadius: 999, padding: "5px 12px", textTransform: "capitalize" },
  signalRating: { marginLeft: 2 },
  rateBox: { background: "#241B2D", border: "1px solid #3A2E44", borderRadius: 14, padding: "14px 16px", margin: "0 0 30px" },
  tags: { display: "flex", flexWrap: "wrap", gap: 6 },
  tag: { fontSize: 11.5, color: "#E9A06B", border: "1px solid #4a3a50", borderRadius: 999, padding: "2px 9px", textDecoration: "none" },
  cta: { display: "flex", flexWrap: "wrap", gap: 10, margin: "0 0 30px" },
  trustRow: { display: "flex", alignItems: "center", gap: 8, margin: "-20px 0 30px" },
  trustDot: { color: "#4a3a50" },
  primary: { color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", padding: "12px 20px", borderRadius: 11, fontWeight: 650, textDecoration: "none", fontSize: 15 },
  secondary: { color: "#F4EAF0", background: "#231A2B", border: "1px solid #3A2E44", padding: "12px 18px", borderRadius: 11, fontWeight: 600, textDecoration: "none", fontSize: 15 },
  section: { fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "#8A7A90", fontWeight: 700, margin: "28px 0 12px" },
  body: { color: "#EadFe6", fontSize: 15.5, margin: 0, whiteSpace: "pre-wrap" },
  muted: { color: "#AC9CB0" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 14 },
  card: { display: "flex", flexDirection: "column", gap: 8, background: "#241B2D", border: "1px solid #3A2E44", borderRadius: 14, padding: 16, textDecoration: "none", color: "#F4EAF0" },
  cardTitle: { fontFamily: "Georgia, serif", fontSize: 17, lineHeight: 1.2 },
  cardSnip: { color: "#AC9CB0", fontSize: 13.5, margin: 0, lineHeight: 1.5 },
  cardMeta: { color: "#8A7A90", fontSize: 12, marginTop: "auto", display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" },
};
