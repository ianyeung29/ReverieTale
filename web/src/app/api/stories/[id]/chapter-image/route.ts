import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { characters, chapterScenes, stories } from "@/db/schema";
import { buildChapterScenePrompt, generateChapterScene, characterImageUrl } from "@/lib/image";
import { screenImagePrompt } from "@/lib/moderation";
import { getCurrentUserId } from "@/lib/session";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SPLIT = /\n{2,}·\s·\s·\n{2,}/;

// GET /api/stories/:id/chapter-image?chapter=N -> the generated scene image for
// chapter N (0-based) of this story, or 404 if none. Public (stories are a
// public front door).
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const chapter = Number(new URL(req.url).searchParams.get("chapter") ?? "0");
  if (!Number.isInteger(chapter) || chapter < 0) return new Response("bad request", { status: 400 });

  let row: { image: string; mime: string | null } | undefined;
  try {
    [row] = await db
      .select({ image: chapterScenes.image, mime: chapterScenes.imageMime })
      .from(chapterScenes)
      .where(and(eq(chapterScenes.storyId, id), eq(chapterScenes.chapterIndex, chapter)))
      .limit(1);
  } catch {
    return new Response("not found", { status: 404 });
  }
  if (!row?.image) return new Response("not found", { status: 404 });

  const buf = Buffer.from(row.image, "base64");
  return new Response(buf, {
    headers: { "Content-Type": row.mime || "image/jpeg", "Cache-Control": "public, max-age=300" },
  });
}

// POST /api/stories/:id/chapter-image { chapter: N } -> (re)generate the scene
// image for one chapter and store it. Owner or admin only. Lets an admin fix
// individual broken/missing chapter images one at a time from the reader.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { chapter?: unknown };
  const chapter = Number(body.chapter);
  if (!Number.isInteger(chapter) || chapter < 0) return NextResponse.json({ error: "chapter (index) required" }, { status: 400 });

  const [row] = await db
    .select({ ownerId: stories.userId, content: stories.content, characterId: stories.characterId, definition: characters.definition, portrait: characters.image })
    .from(stories)
    .innerJoin(characters, eq(stories.characterId, characters.id))
    .where(eq(stories.id, id))
    .limit(1);
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });

  const owner = Boolean(row.ownerId && row.ownerId === userId);
  if (!owner && !(await isAdmin(userId))) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const chapters = row.content.split(SPLIT).map((c) => c.trim()).filter(Boolean);
  if (chapter >= chapters.length) return NextResponse.json({ error: "no such chapter" }, { status: 400 });

  const def = (row.definition ?? {}) as Record<string, string>;
  const sceneDef = { name: def.name, gender: def.gender, look: def.look, style: def.style };
  if (screenImagePrompt(buildChapterScenePrompt(sceneDef, chapters[chapter])).blocked) {
    return NextResponse.json({ error: "blocked", reason: "safety" }, { status: 422 });
  }

  try {
    const gen = await generateChapterScene(sceneDef, chapters[chapter], row.portrait, characterImageUrl(row.characterId));
    await db.delete(chapterScenes).where(and(eq(chapterScenes.storyId, id), eq(chapterScenes.chapterIndex, chapter)));
    await db.insert(chapterScenes).values({ storyId: id, chapterIndex: chapter, image: gen.base64, imageMime: gen.mime });
    return NextResponse.json({ ok: true, chapter });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "generation failed" }, { status: 500 });
  }
}
