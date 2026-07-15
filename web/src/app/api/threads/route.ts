import { NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { characters, stories, threads } from "@/db/schema";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

// GET /api/threads -> the logged-in user's recent conversations (for the resume list).
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json([]);

  const rows = await db
    .select({
      id: threads.id,
      characterId: threads.characterId,
      name: sql<string>`${characters.definition}->>'name'`,
      lastActiveAt: threads.lastActiveAt,
      storyId: threads.storyId,
      storyContext: threads.storyContext,
      storyContextChapter: threads.storyContextChapter,
      storyTitle: stories.title,
    })
    .from(threads)
    .innerJoin(characters, eq(threads.characterId, characters.id))
    .leftJoin(stories, eq(threads.storyId, stories.id))
    .where(eq(threads.userId, userId))
    .orderBy(desc(threads.lastActiveAt))
    .limit(30);

  return NextResponse.json(rows);
}
