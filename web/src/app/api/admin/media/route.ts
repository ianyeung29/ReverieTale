import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { characters, chapterScenes, stories } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import {
  buildChapterScenePrompt,
  buildCharacterScenePrompt,
  buildScenePrompt,
  characterImageUrl,
  generateChapterScene,
  generateCharacterScene,
  generateImage,
} from "@/lib/image";
import { mediaStorageConfigured, readImageBase64, storeImage } from "@/lib/media";
import { screenImagePrompt } from "@/lib/moderation";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const CHAPTER_SPLIT = /\n{2,}(?:·|Â·)\s*(?:·|Â·)\s*(?:·|Â·)\n{2,}/;

type Definition = { name?: string; gender?: string; look?: string; outfit?: string; backstory?: string; tags?: string[]; style?: string };

function asDefinition(value: unknown): Definition {
  return (value && typeof value === "object" ? value : {}) as Definition;
}

function asElements(value: unknown): Record<string, string> {
  return (value && typeof value === "object" ? value : {}) as Record<string, string>;
}

// GET /api/admin/media -> compact catalogue used by the admin-only media studio.
export async function GET() {
  const userId = await getCurrentUserId();
  if (!(await isAdmin(userId))) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const [characterRows, storyRows] = await Promise.all([
    db.select({ id: characters.id, definition: characters.definition, hasScene: characters.sceneImageKey })
      .from(characters)
      .where(eq(characters.status, "published")),
    db.select({ id: stories.id, title: stories.title, characterName: characters.definition, content: stories.content, hasBackground: stories.imageKey, createdAt: stories.createdAt })
      .from(stories)
      .innerJoin(characters, eq(stories.characterId, characters.id))
      .where(eq(stories.isPublic, true))
      .orderBy(desc(stories.createdAt)),
  ]);

  return NextResponse.json({
    characters: characterRows
      .map((row) => ({ id: row.id, name: asDefinition(row.definition).name || "Untitled companion", hasScene: Boolean(row.hasScene) }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    stories: storyRows.map((row) => ({
      id: row.id,
      title: row.title,
      characterName: asDefinition(row.characterName).name || "Unknown companion",
      chapters: Math.max(1, row.content.split(CHAPTER_SPLIT).filter(Boolean).length),
      hasBackground: Boolean(row.hasBackground),
    })),
  });
}

// POST /api/admin/media -> run one manually selected image job. These are admin
// jobs: they do not spend reader credits and only replace an asset after success.
export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!(await isAdmin(userId))) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!mediaStorageConfigured()) return NextResponse.json({ error: "Cloudflare R2 storage is not configured" }, { status: 503 });

  const body = (await req.json().catch(() => ({}))) as { action?: unknown; characterId?: unknown; storyId?: unknown; chapter?: unknown };
  const action = typeof body.action === "string" ? body.action : "";

  try {
    if (action === "character_scene") {
      const characterId = typeof body.characterId === "string" ? body.characterId : "";
      if (!characterId) return NextResponse.json({ error: "characterId required" }, { status: 400 });

      const [row] = await db.select({ id: characters.id, definition: characters.definition, portraitKey: characters.imageKey })
        .from(characters).where(eq(characters.id, characterId)).limit(1);
      if (!row) return NextResponse.json({ error: "companion not found" }, { status: 404 });
      if (!row.portraitKey) return NextResponse.json({ error: "Generate the companion portrait first" }, { status: 422 });

      const definition = asDefinition(row.definition);
      const prompt = buildCharacterScenePrompt(definition);
      if (screenImagePrompt(prompt).blocked) return NextResponse.json({ error: "blocked", reason: "safety" }, { status: 422 });

      const portrait = await readImageBase64(row.portraitKey);
      const image = await generateCharacterScene(definition, portrait, characterImageUrl(row.id));
      const imageKey = await storeImage({ scope: "characters", ownerId: `${row.id}/scene`, base64: image.base64, mime: image.mime });
      await db.update(characters).set({ sceneImageKey: imageKey, sceneImageMime: image.mime }).where(eq(characters.id, row.id));
      return NextResponse.json({ ok: true, imageUrl: `/api/characters/${row.id}/scene?rev=${Date.now()}` });
    }

    const storyId = typeof body.storyId === "string" ? body.storyId : "";
    if (!storyId) return NextResponse.json({ error: "storyId required" }, { status: 400 });

    if (action === "story_background") {
      const [row] = await db.select({ id: stories.id, title: stories.title, content: stories.content, elements: stories.elements })
        .from(stories).where(eq(stories.id, storyId)).limit(1);
      if (!row) return NextResponse.json({ error: "story not found" }, { status: 404 });

      const elements = asElements(row.elements);
      const prompt = buildScenePrompt({
        setting: elements.setting || elements.scenario || `an atmospheric environment inspired by ${row.title}: ${row.content.slice(0, 500)}`,
        genre: elements.genre,
        tone: elements.tone,
        scenario: elements.scenario,
      });
      if (screenImagePrompt(prompt).blocked) return NextResponse.json({ error: "blocked", reason: "safety" }, { status: 422 });

      const image = await generateImage(prompt);
      const imageKey = await storeImage({ scope: "stories", ownerId: row.id, base64: image.base64, mime: image.mime });
      await db.update(stories).set({ imageKey, imageMime: image.mime }).where(eq(stories.id, row.id));
      return NextResponse.json({ ok: true, imageUrl: `/api/stories/${row.id}/background?rev=${Date.now()}` });
    }

    if (action === "chapter_scene") {
      const chapter = Number(body.chapter ?? 0);
      if (!Number.isInteger(chapter) || chapter < 0) return NextResponse.json({ error: "valid chapter index required" }, { status: 400 });
      const [row] = await db.select({ id: stories.id, content: stories.content, characterId: stories.characterId, definition: characters.definition, portraitKey: characters.imageKey })
        .from(stories).innerJoin(characters, eq(stories.characterId, characters.id)).where(eq(stories.id, storyId)).limit(1);
      if (!row) return NextResponse.json({ error: "story not found" }, { status: 404 });

      const chapters = row.content.split(CHAPTER_SPLIT).map((part) => part.trim()).filter(Boolean);
      if (chapter >= chapters.length) return NextResponse.json({ error: "no such chapter" }, { status: 400 });
      const definition = asDefinition(row.definition);
      const prompt = buildChapterScenePrompt(definition, chapters[chapter]);
      if (screenImagePrompt(prompt).blocked) return NextResponse.json({ error: "blocked", reason: "safety" }, { status: 422 });

      const portrait = await readImageBase64(row.portraitKey);
      const image = await generateChapterScene(definition, chapters[chapter], portrait, portrait ? characterImageUrl(row.characterId) : null);
      const imageKey = await storeImage({ scope: "chapters", ownerId: `${row.id}/${chapter}`, base64: image.base64, mime: image.mime });
      await db.delete(chapterScenes).where(and(eq(chapterScenes.storyId, row.id), eq(chapterScenes.chapterIndex, chapter)));
      await db.insert(chapterScenes).values({ storyId: row.id, chapterIndex: chapter, imageKey, imageMime: image.mime });
      return NextResponse.json({ ok: true, imageUrl: `/api/stories/${row.id}/chapter-image?chapter=${chapter}&rev=${Date.now()}` });
    }

    return NextResponse.json({ error: "unknown action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "generation failed" }, { status: 500 });
  }
}
