import { NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { characters, stories } from "@/db/schema";

export const dynamic = "force-dynamic";

// GET /api/stories -> recent public stories for the community feed (no auth - front door).
export async function GET() {
  const rows = await db
    .select({
      id: stories.id,
      title: stories.title,
      content: stories.content,
      characterId: stories.characterId,
      characterName: sql<string>`${characters.definition}->>'name'`,
      createdAt: stories.createdAt,
    })
    .from(stories)
    .innerJoin(characters, eq(stories.characterId, characters.id))
    .where(eq(stories.isPublic, true))
    .orderBy(desc(stories.createdAt))
    .limit(24);

  const list = rows.map((r) => ({
    id: r.id,
    title: r.title,
    snippet: r.content.replace(/\s+/g, " ").slice(0, 160),
    characterId: r.characterId,
    characterName: r.characterName,
  }));
  return NextResponse.json(list);
}
