import { NextResponse } from "next/server";
import { eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { characters, stories } from "@/db/schema";
import { bookmarkedStoryIds } from "@/lib/bookmarks";
import { logUnlessMissingRelation } from "@/lib/db-errors";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

function chapterCount(content: string): number {
  const n = content.split(/\n{2,}·\s·\s·\n{2,}/).map((s) => s.trim()).filter(Boolean).length;
  return Math.max(1, n);
}

// GET /api/stories/saved -> the signed-in reader's bookmarked stories, most
// recently saved first (resumable "saved for later" library).
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let ids: string[] = [];
  try {
    ids = await bookmarkedStoryIds(userId);
  } catch (e) {
    logUnlessMissingRelation("stories/saved", e);
    return NextResponse.json([]);
  }
  if (ids.length === 0) return NextResponse.json([]);

  const rows = await db
    .select({
      id: stories.id,
      title: stories.title,
      content: stories.content,
      characterId: stories.characterId,
      name: sql<string>`${characters.definition}->>'name'`,
    })
    .from(stories)
    .innerJoin(characters, eq(stories.characterId, characters.id))
    .where(inArray(stories.id, ids));

  const byId = new Map(rows.map((r) => [r.id, r]));
  const ordered = ids.map((id) => byId.get(id)).filter((r): r is (typeof rows)[number] => Boolean(r));

  return NextResponse.json(
    ordered.map((r) => ({ id: r.id, title: r.title, name: r.name, characterId: r.characterId, chapters: chapterCount(r.content) })),
  );
}
