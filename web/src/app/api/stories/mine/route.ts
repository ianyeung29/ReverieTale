import { NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { characters, stories } from "@/db/schema";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

// GET /api/stories/mine -> the logged-in user's own stories (resumable library).
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json([]);

  const rows = await db
    .select({
      id: stories.id,
      title: stories.title,
      content: stories.content,
      name: sql<string>`${characters.definition}->>'name'`,
      createdAt: stories.createdAt,
    })
    .from(stories)
    .innerJoin(characters, eq(stories.characterId, characters.id))
    .where(eq(stories.userId, userId))
    .orderBy(desc(stories.createdAt))
    .limit(50);

  return NextResponse.json(
    rows.map((r) => ({
      id: r.id,
      title: r.title,
      name: r.name,
      chapters: (r.content.match(/\n{2,}·\s·\s·\n{2,}/g)?.length ?? 0) + 1,
    })),
  );
}
