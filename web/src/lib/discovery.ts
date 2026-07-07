import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { characters, stories } from "@/db/schema";
import { ratingAggregates } from "@/lib/ratings";

export type DiscoverChar = {
  id: string;
  name: string;
  persona: string;
  tagline: string; // backstory, used as a one-liner
  tags: string[];
  reads: number;
  stories: number;
  rating: number;
  ratingCount: number;
  hasImage: boolean;
  createdAt: string;
  creatorId: string | null;
};

/**
 * Published characters enriched with per-character engagement (total reads + public
 * story count), for the browse/discovery surfaces. Optional creator/tag narrowing.
 */
export async function listCharacters(opts?: { creatorId?: string; tag?: string }): Promise<DiscoverChar[]> {
  const rows = await db
    .select({ id: characters.id, definition: characters.definition, createdAt: characters.createdAt, creatorId: characters.creatorId })
    .from(characters)
    .where(eq(characters.status, "published"));

  const agg = await db
    .select({
      cid: stories.characterId,
      reads: sql<number>`coalesce(sum(${stories.reads}), 0)::int`,
      stories: sql<number>`count(*)::int`,
    })
    .from(stories)
    .where(eq(stories.isPublic, true))
    .groupBy(stories.characterId);
  const byChar = new Map(agg.map((a) => [a.cid, a]));

  // Ratings are optional (migration 0009); never let a missing table break discovery.
  let ratingByChar = new Map<string, { average: number; count: number }>();
  try {
    ratingByChar = await ratingAggregates("character", rows.map((r) => r.id));
  } catch {
    /* ratings table not migrated yet */
  }

  // Image column is optional (migration 0006); probe separately so a missing
  // column never breaks discovery.
  let imageByChar = new Map<string, boolean>();
  try {
    const imgRows = await db.select({ id: characters.id, h: sql<boolean>`(${characters.image} is not null)` }).from(characters).where(eq(characters.status, "published"));
    imageByChar = new Map(imgRows.map((r) => [r.id, r.h]));
  } catch {
    /* image column not migrated yet */
  }

  let list: DiscoverChar[] = rows.map((r) => {
    const def = (r.definition ?? {}) as Record<string, unknown>;
    const a = byChar.get(r.id);
    const rt = ratingByChar.get(r.id) ?? { average: 0, count: 0 };
    return {
      id: r.id,
      name: (def.name as string) ?? "Unknown",
      persona: (def.persona as string) ?? "",
      tagline: (def.backstory as string) ?? "",
      tags: Array.isArray(def.tags) ? (def.tags as string[]) : [],
      reads: a?.reads ?? 0,
      stories: a?.stories ?? 0,
      rating: rt.average,
      ratingCount: rt.count,
      hasImage: imageByChar.get(r.id) ?? false,
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
      creatorId: r.creatorId ?? null,
    };
  });

  if (opts?.creatorId) list = list.filter((c) => c.creatorId === opts.creatorId);
  if (opts?.tag) {
    const t = opts.tag.toLowerCase();
    list = list.filter((c) => c.tags.some((x) => x.toLowerCase() === t));
  }
  return list;
}

/**
 * Trending = engagement decayed by age (Hacker-News-style gravity). Recent characters
 * with reads rank highest; old ones fade even with a high total. Pure function so the
 * client can use the same formula.
 */
export function trendingScore(reads: number, createdAt: string): number {
  const hours = Math.max(0, (Date.now() - new Date(createdAt).getTime()) / 3.6e6);
  return (reads + 1) / Math.pow(hours + 2, 1.5);
}
