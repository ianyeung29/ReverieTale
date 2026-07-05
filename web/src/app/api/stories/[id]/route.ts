import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { characters, stories } from "@/db/schema";

export const dynamic = "force-dynamic";

// GET /api/stories/:id -> a single story to read (public front door).
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [row] = await db
    .select({
      id: stories.id,
      title: stories.title,
      content: stories.content,
      characterId: stories.characterId,
      definition: characters.definition,
    })
    .from(stories)
    .innerJoin(characters, eq(stories.characterId, characters.id))
    .where(eq(stories.id, id))
    .limit(1);

  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  const def = (row.definition ?? {}) as Record<string, string>;
  return NextResponse.json({
    id: row.id,
    title: row.title,
    content: row.content,
    characterId: row.characterId,
    characterName: def.name ?? "Unknown",
  });
}
