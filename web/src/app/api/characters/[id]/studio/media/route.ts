import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { chapterScenes, characterLivingPortraits, characters, companionPosts, stories } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { publishCompanionPost } from "@/lib/companionPosts";
import { buildChapterScenePrompt, buildScenePrompt, characterImageUrl, cutOutPortraitForChat, generateChapterScene, generateCharacterScene, generateImage } from "@/lib/image";
import { activateLivingPortrait, queueLivingPortrait } from "@/lib/livingPortraits";
import { mediaStorageConfigured, readImageBase64, storeImage } from "@/lib/media";
import { getCurrentUserId } from "@/lib/session";
import { screenImagePrompt } from "@/lib/moderation";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

type Definition = {
  name?: string;
  gender?: string;
  look?: string;
  outfit?: string;
  backstory?: string;
  tags?: string[];
  style?: string;
};

function asElements(value: unknown): Record<string, string> {
  return (value && typeof value === "object" ? value : {}) as Record<string, string>;
}

function asDefinition(value: unknown): Definition {
  return (value && typeof value === "object" ? value : {}) as Definition;
}

async function managedCharacter(characterId: string, userId: string) {
  const [character] = await db
    .select({
      id: characters.id,
      creatorId: characters.creatorId,
      definition: characters.definition,
      portraitKey: characters.imageKey,
      sceneKey: characters.sceneImageKey,
      chatPoseKey: characters.chatPoseImageKey,
    })
    .from(characters)
    .where(eq(characters.id, characterId))
    .limit(1);
  if (!character) return { error: "Companion not found" as const };

  const admin = await isAdmin(userId);
  if (character.creatorId !== userId && !admin) {
    return { error: "You do not have permission to manage this companion" as const };
  }
  return { character, admin };
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const result = await managedCharacter(id, userId);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.error === "Companion not found" ? 404 : 403 });
  }

  let living: { id: string; status: string; isActive: boolean; createdAt: Date; error: string | null; videoKey: string | null }[] = [];
  let photoCount = 0;
  let storyMedia: { id: string; title: string; hasBackground: boolean; hasOpeningScene: boolean }[] = [];
  try {
    living = await db
      .select({
        id: characterLivingPortraits.id,
        status: characterLivingPortraits.status,
        isActive: characterLivingPortraits.isActive,
        createdAt: characterLivingPortraits.createdAt,
        error: characterLivingPortraits.error,
        videoKey: characterLivingPortraits.videoKey,
      })
      .from(characterLivingPortraits)
      .where(eq(characterLivingPortraits.characterId, id))
      .orderBy(desc(characterLivingPortraits.createdAt));
  } catch {
    // The rest of the studio remains useful until migration 0031 is present.
  }
  try {
    const rows = await db.select({ id: companionPosts.id }).from(companionPosts).where(eq(companionPosts.characterId, id));
    photoCount = rows.length;
  } catch {
    // Photo diary is optional in older deployments.
  }
  try {
    const ownedStories = await db
      .select({ id: stories.id, title: stories.title, userId: stories.userId, hasBackground: stories.imageKey })
      .from(stories)
      .where(eq(stories.characterId, id));
    const visibleStories = result.admin ? ownedStories : ownedStories.filter((story) => story.userId === userId);
    const openingScenes = await db.select({ storyId: chapterScenes.storyId }).from(chapterScenes).where(eq(chapterScenes.chapterIndex, 0));
    const openingIds = new Set(openingScenes.map((scene) => scene.storyId));
    storyMedia = visibleStories.map((story) => ({ id: story.id, title: story.title, hasBackground: Boolean(story.hasBackground), hasOpeningScene: openingIds.has(story.id) }));
  } catch {
    // Story media is optional in older deployments.
  }

  return NextResponse.json({
    canUseMedia: mediaStorageConfigured(),
    isAdmin: result.admin,
    hasPortrait: Boolean(result.character.portraitKey),
    hasScene: Boolean(result.character.sceneKey),
    hasChatPose: Boolean(result.character.chatPoseKey),
    photoCount,
    stories: storyMedia,
    living: living.map((render) => ({
      id: render.id,
      status: render.status,
      isActive: render.isActive,
      error: render.error,
      createdAt: render.createdAt.toISOString(),
      videoUrl: render.status === "ready" && render.videoKey ? `/api/living-portraits/${render.id}/video` : null,
    })),
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const result = await managedCharacter(id, userId);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.error === "Companion not found" ? 404 : 403 });
  }
  if (!mediaStorageConfigured()) return NextResponse.json({ error: "Cloudflare R2 storage is not configured" }, { status: 503 });

  const body = (await request.json().catch(() => ({}))) as { action?: unknown; renderId?: unknown; storyId?: unknown };
  const action = typeof body.action === "string" ? body.action : "";

  try {
    if (action === "living_portrait") {
      const render = await queueLivingPortrait(id, userId);
      return NextResponse.json({ ok: true, renderId: render.id, status: render.status, pollAfterMs: 3000 }, { status: 202 });
    }

    if (action === "select_living_portrait") {
      const renderId = typeof body.renderId === "string" ? body.renderId : "";
      if (!renderId) return NextResponse.json({ error: "renderId required" }, { status: 400 });
      const render = await activateLivingPortrait(id, renderId);
      return NextResponse.json({ ok: true, renderId: render.id, status: render.status });
    }

    if (action === "story_background" || action === "chapter_scene") {
      const storyId = typeof body.storyId === "string" ? body.storyId : "";
      if (!storyId) return NextResponse.json({ error: "storyId required" }, { status: 400 });
      const [story] = await db
        .select({ id: stories.id, userId: stories.userId, title: stories.title, content: stories.content, elements: stories.elements })
        .from(stories)
        .where(and(eq(stories.id, storyId), eq(stories.characterId, id)))
        .limit(1);
      if (!story) return NextResponse.json({ error: "Story not found" }, { status: 404 });
      if (!result.admin && story.userId !== userId) return NextResponse.json({ error: "You can only manage artwork for your own stories" }, { status: 403 });

      if (action === "story_background") {
        const elements = asElements(story.elements);
        const prompt = buildScenePrompt({
          setting: elements.setting || elements.scenario || `an atmospheric environment inspired by ${story.title}: ${story.content.slice(0, 500)}`,
          genre: elements.genre,
          tone: elements.tone,
          scenario: elements.scenario,
        });
        if (screenImagePrompt(prompt).blocked) return NextResponse.json({ error: "The background prompt did not pass safety checks" }, { status: 422 });
        const image = await generateImage(prompt);
        const imageKey = await storeImage({ scope: "stories", ownerId: story.id, base64: image.base64, mime: image.mime });
        await db.update(stories).set({ imageKey, imageMime: image.mime }).where(eq(stories.id, story.id));
        return NextResponse.json({ ok: true, imageUrl: `/api/stories/${story.id}/background?rev=${Date.now()}` });
      }

      if (!result.character.portraitKey) return NextResponse.json({ error: "Generate the main portrait first" }, { status: 422 });
      const definition = asDefinition(result.character.definition);
      const prompt = buildChapterScenePrompt(definition, story.content);
      if (screenImagePrompt(prompt).blocked) return NextResponse.json({ error: "The opening scene prompt did not pass safety checks" }, { status: 422 });
      const portrait = await readImageBase64(result.character.portraitKey);
      const image = await generateChapterScene(definition, story.content, portrait, characterImageUrl(id));
      const imageKey = await storeImage({ scope: "chapters", ownerId: `${story.id}/0`, base64: image.base64, mime: image.mime });
      await db.delete(chapterScenes).where(and(eq(chapterScenes.storyId, story.id), eq(chapterScenes.chapterIndex, 0)));
      await db.insert(chapterScenes).values({ storyId: story.id, chapterIndex: 0, imageKey, imageMime: image.mime });
      return NextResponse.json({ ok: true, imageUrl: `/api/stories/${story.id}/chapter-image?chapter=0&rev=${Date.now()}` });
    }

    if (!result.character.portraitKey) {
      return NextResponse.json({ error: "Generate the main portrait first" }, { status: 422 });
    }

    if (action === "scene") {
      const portrait = await readImageBase64(result.character.portraitKey);
      const image = await generateCharacterScene(asDefinition(result.character.definition), portrait, characterImageUrl(id));
      const imageKey = await storeImage({ scope: "characters", ownerId: `${id}/scene`, base64: image.base64, mime: image.mime });
      await db.update(characters).set({ sceneImageKey: imageKey, sceneImageMime: image.mime, updatedAt: new Date() }).where(eq(characters.id, id));
      return NextResponse.json({ ok: true, imageUrl: `/api/characters/${id}/scene?rev=${Date.now()}` });
    }

    if (action === "chat_pose") {
      const portraitUrl = characterImageUrl(id);
      if (!portraitUrl) {
        return NextResponse.json({ error: "Set APP_URL or PUBLIC_IMAGE_BASE to a public site URL before making a chat portrait" }, { status: 422 });
      }
      const image = await cutOutPortraitForChat(portraitUrl);
      const imageKey = await storeImage({ scope: "characters", ownerId: `${id}/chat-pose`, base64: image.base64, mime: image.mime });
      await db.update(characters).set({ chatPoseImageKey: imageKey, chatPoseImageMime: image.mime, updatedAt: new Date() }).where(eq(characters.id, id));
      return NextResponse.json({ ok: true, imageUrl: `/api/characters/${id}/chat-pose?rev=${Date.now()}` });
    }

    if (action === "photo") {
      const post = await publishCompanionPost(id, false);
      return NextResponse.json({ ok: true, imageUrl: `/api/companion-posts/${post.id}/image?rev=${Date.now()}` });
    }

    return NextResponse.json({ error: "Unknown media action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to generate media" }, { status: 500 });
  }
}
