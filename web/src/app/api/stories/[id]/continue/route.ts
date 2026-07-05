import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { characters, stories } from "@/db/schema";
import { generateNextChapter } from "@/lib/story";
import { screen } from "@/lib/moderation";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// POST /api/stories/:id/continue -> generate the next chapter and append it.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [row] = await db
    .select({ content: stories.content, definition: characters.definition })
    .from(stories)
    .innerJoin(characters, eq(stories.characterId, characters.id))
    .where(eq(stories.id, id))
    .limit(1);
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });

  try {
    const def = (row.definition ?? {}) as Record<string, string>;
    const chapter = await generateNextChapter(def, row.content);
    if (screen(chapter).blocked) return NextResponse.json({ error: "blocked", reason: "safety_minor" }, { status: 422 });

    const updated = `${row.content}\n\n· · ·\n\n${chapter}`;
    await db.update(stories).set({ content: updated }).where(eq(stories.id, id));

    return NextResponse.json({ chapter });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "failed" }, { status: 500 });
  }
}
