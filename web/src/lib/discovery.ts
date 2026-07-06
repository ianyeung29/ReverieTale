import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { characters, stories } from "@/db/schema";

export type DiscoverChar = {
  id: string;
  name: string;
  persona: string;
  tagline: string; // backstory, used as a one-liner
  tags: string[];
  reads: number;
  stories: number;
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

  let list: DiscoverChar[] = rows.map((r) => {
    const def = (r.definition ?? {}) as Record<string, unknown>;
    const a = byChar.get(r.id);
    return {
      id: r.id,
      name: (def.name as string) ?? "Unknown",
      persona: (def.persona as string) ?? "",
      tagline: (def.backstory as string) ?? "",
      tags: Array.isArray(def.tags) ? (def.tags as string[]) : [],
      reads: a?.reads ?? 0,
      stories: a?.stories ?? 0,
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
