import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { ratings } from "@/db/schema";

export type RatingTarget = "character" | "story";
export type RatingAgg = { average: number; count: number };

const EMPTY: RatingAgg = { average: 0, count: 0 };

// Average + count for many targets of one type, keyed by target id. Missing ids
// simply don't appear in the map (treat as { average: 0, count: 0 }).
export async function ratingAggregates(targetType: RatingTarget, ids: string[]): Promise<Map<string, RatingAgg>> {
  const map = new Map<string, RatingAgg>();
  const unique = [...new Set(ids)];
  if (unique.length === 0) return map;
  const rows = await db
    .select({
      targetId: ratings.targetId,
      avg: sql<number>`avg(${ratings.rating})::float`,
      count: sql<number>`count(*)::int`,
    })
    .from(ratings)
    .where(and(eq(ratings.targetType, targetType), inArray(ratings.targetId, unique)))
    .groupBy(ratings.targetId);
  for (const r of rows) map.set(r.targetId, { average: Number(r.avg) || 0, count: r.count });
  return map;
}

export async function ratingFor(targetType: RatingTarget, targetId: string): Promise<RatingAgg> {
  return (await ratingAggregates(targetType, [targetId])).get(targetId) ?? EMPTY;
}

// The current user's own rating for a target, or null if they haven't rated it.
export async function userRating(userId: string, targetType: RatingTarget, targetId: string): Promise<number | null> {
  const [row] = await db
    .select({ rating: ratings.rating })
    .from(ratings)
    .where(and(eq(ratings.userId, userId), eq(ratings.targetType, targetType), eq(ratings.targetId, targetId)))
    .limit(1);
  return row?.rating ?? null;
}

// Upsert a rating (1-5). Re-rating overwrites the previous value.
export async function submitRating(userId: string, targetType: RatingTarget, targetId: string, value: number): Promise<void> {
  await db
    .insert(ratings)
    .values({ userId, targetType, targetId, rating: value })
    .onConflictDoUpdate({
      target: [ratings.userId, ratings.targetType, ratings.targetId],
      set: { rating: value, updatedAt: new Date() },
    });
}
