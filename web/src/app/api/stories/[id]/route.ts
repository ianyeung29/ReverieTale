import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { characters, stories } from "@/db/schema";
import { ratingFor, userRating } from "@/lib/ratings";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

// GET /api/stories/:id -> a single story to read (public front door). isOwner
// tells the client whether to offer creator controls (rewrite).
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [row] = await db
    .select({
      id: stories.id,
      title: stories.title,
      content: stories.content,
      characterId: stories.characterId,
      ownerId: stories.userId,
      backup: stories.backup,
      reads: stories.reads,
      definition: characters.definition,
    })
    .from(stories)
    .innerJoin(characters, eq(stories.characterId, characters.id))
    .where(eq(stories.id, id))
    .limit(1);

  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  const def = (row.definition ?? {}) as Record<string, string>;
  const userId = await getCurrentUserId();
  const isOwner = Boolean(row.ownerId && userId && row.ownerId === userId);
  // Count reads by anyone other than the creator (powers the "most read" sort).
  let reads = row.reads;
  if (!isOwner) {
    try {
      await db.update(stories).set({ reads: sql`${stories.reads} + 1` }).where(eq(stories.id, id));
      reads += 1;
    } catch {
      /* read counting must never break reading */
    }
  }

  const rating = await ratingFor("story", row.id);
  const mine = userId && !isOwner ? await userRating(userId, "story", row.id) : null;

  // Background column is optional (migration 0010); probe it separately so a
  // missing column never breaks reading the story.
  let hasBackground = false;
  try {
    const [bg] = await db.select({ h: sql<boolean>`(${stories.image} is not null)` }).from(stories).where(eq(stories.id, id)).limit(1);
    hasBackground = Boolean(bg?.h);
  } catch {
    /* image column not migrated yet */
  }

  return NextResponse.json({
    id: row.id,
    title: row.title,
    content: row.content,
    characterId: row.characterId,
    characterName: def.name ?? "Unknown",
    isOwner,
    hasBackup: isOwner && Boolean(row.backup),
    hasBackground,
    reads,
    rating: rating.average,
    ratingCount: rating.count,
    myRating: mine,
    canRate: Boolean(userId) && !isOwner,
  });
}
