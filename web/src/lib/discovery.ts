import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { characters, stories } from "@/db/schema";
import { ratingAggregates } from "@/lib/ratings";
import { blockedCharacterIds } from "@/lib/blocks";
import { logUnlessMissingRelation } from "@/lib/db-errors";
import { normalizeCompanionGender, type CompanionGender } from "@/lib/gender";

export type DiscoverChar = {
  id: string;
  name: string;
  persona: string;
  tagline: string; // backstory, used as a one-liner
  greeting: string; // their first line in their own voice, shown on cards/profile
  tags: string[];
  reads: number;
  stories: number;
  rating: number;
  ratingCount: number;
  hasImage: boolean;
  createdAt: string;
  creatorId: string | null;
  gender: CompanionGender | null;
};

/**
 * Published characters enriched with per-character engagement (total reads + public
 * story count), for the browse/discovery surfaces. Optional creator/tag narrowing.
 */
export async function listCharacters(opts?: { creatorId?: string; tag?: string; viewerId?: string; genders?: CompanionGender[] }): Promise<DiscoverChar[]> {
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
  } catch (e) {
    logUnlessMissingRelation("discovery ratings", e);
  }

  // Image column is optional (migration 0006); probe separately so a missing
  // column never breaks discovery.
  let imageByChar = new Map<string, boolean>();
  try {
    const imgRows = await db.select({ id: characters.id, h: sql<boolean>`(${characters.imageKey} is not null)` }).from(characters).where(eq(characters.status, "published"));
    imageByChar = new Map(imgRows.map((r) => [r.id, r.h]));
  } catch (e) {
    logUnlessMissingRelation("discovery image column", e);
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
      greeting: (def.greeting as string) ?? "",
      tags: Array.isArray(def.tags) ? (def.tags as string[]) : [],
      reads: a?.reads ?? 0,
      stories: a?.stories ?? 0,
      rating: rt.average,
      ratingCount: rt.count,
      hasImage: imageByChar.get(r.id) ?? false,
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
      creatorId: r.creatorId ?? null,
      gender: normalizeCompanionGender(def.gender),
    };
  });

  if (opts?.creatorId) list = list.filter((c) => c.creatorId === opts.creatorId);
  if (opts?.tag) {
    const t = opts.tag.toLowerCase();
    list = list.filter((c) => c.tags.some((x) => x.toLowerCase() === t));
  }
  if (opts?.genders?.length) {
    const requested = new Set(opts.genders);
    list = list.filter((c) => c.gender && requested.has(c.gender));
  }

  // Personal blocks are optional (migration 0012); never let a missing table
  // break discovery for everyone else.
  if (opts?.viewerId) {
    try {
      const blocked = new Set(await blockedCharacterIds(opts.viewerId));
      if (blocked.size) list = list.filter((c) => !blocked.has(c.id));
    } catch (e) {
      logUnlessMissingRelation("discovery blocks", e);
    }
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
