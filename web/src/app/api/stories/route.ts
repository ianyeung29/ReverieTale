import { NextResponse } from "next/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { characters, stories } from "@/db/schema";
import { ratingAggregates } from "@/lib/ratings";

export const dynamic = "force-dynamic";

function chapterCount(content: string): number {
  const n = content.split(/\n{2,}·\s·\s·\n{2,}/).map((s) => s.trim()).filter(Boolean).length;
  return Math.max(1, n);
}

// GET /api/stories -> public stories for the story browser, with genre + engagement.
export async function GET() {
  const rows = await db
    .select({
      id: stories.id,
      title: stories.title,
      content: stories.content,
      characterId: stories.characterId,
      reads: stories.reads,
      elements: stories.elements,
      createdAt: stories.createdAt,
      characterName: sql<string>`${characters.definition}->>'name'`,
    })
    .from(stories)
    .innerJoin(characters, eq(stories.characterId, characters.id))
    .where(and(eq(stories.isPublic, true), eq(characters.status, "published")))
    .orderBy(desc(stories.createdAt))
    .limit(200);

  // Ratings are optional (migration 0009); never let a missing table break the list.
  let ratingByStory = new Map<string, { average: number; count: number }>();
  try {
    ratingByStory = await ratingAggregates("story", rows.map((r) => r.id));
  } catch {
    /* ratings table not migrated yet */
  }

  const list = rows.map((r) => {
    const el = (r.elements ?? {}) as Record<string, unknown>;
    const rt = ratingByStory.get(r.id) ?? { average: 0, count: 0 };
    return {
      id: r.id,
      title: r.title,
      characterId: r.characterId,
      characterName: r.characterName ?? "Unknown",
      genre: typeof el.genre === "string" ? (el.genre as string) : "",
      tone: typeof el.tone === "string" ? (el.tone as string) : "",
      snippet: r.content.replace(/\s+/g, " ").slice(0, 150),
      chapters: chapterCount(r.content),
      reads: r.reads,
      rating: rt.average,
      ratingCount: rt.count,
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
    };
  });
  return NextResponse.json(list);
}
