import { eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { characterLikes, messages, threads } from "@/db/schema";
import { logUnlessMissingRelation } from "@/lib/db-errors";

export type CompanionEngagement = {
  likes: Map<string, number>;
  messages: Map<string, number>;
  likedByViewer: Set<string>;
};

const EMPTY: CompanionEngagement = { likes: new Map(), messages: new Map(), likedByViewer: new Set() };

/** Public, aggregate-only engagement for discovery surfaces. */
export async function companionEngagement(characterIds: string[], viewerId?: string): Promise<CompanionEngagement> {
  if (!characterIds.length) return EMPTY;

  const [messageRows, likeResult] = await Promise.all([
    db
      .select({ characterId: threads.characterId, count: sql<number>`count(${messages.id})::int` })
      .from(threads)
      .innerJoin(messages, eq(messages.threadId, threads.id))
      .where(inArray(threads.characterId, characterIds))
      .groupBy(threads.characterId),
    (async () => {
      try {
        const [likes, viewerLikes] = await Promise.all([
          db
            .select({ characterId: characterLikes.characterId, count: sql<number>`count(*)::int` })
            .from(characterLikes)
            .where(inArray(characterLikes.characterId, characterIds))
            .groupBy(characterLikes.characterId),
          viewerId
            ? db
                .select({ characterId: characterLikes.characterId })
                .from(characterLikes)
                .where(eq(characterLikes.userId, viewerId))
            : Promise.resolve([]),
        ]);
        return { likes, viewerLikes };
      } catch (e) {
        logUnlessMissingRelation("companion likes", e);
        return { likes: [], viewerLikes: [] };
      }
    })(),
  ]);

  return {
    messages: new Map(messageRows.map((row) => [row.characterId, row.count])),
    likes: new Map(likeResult.likes.map((row) => [row.characterId, row.count])),
    likedByViewer: new Set(likeResult.viewerLikes.map((row) => row.characterId)),
  };
}
