import { NextResponse, after } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { characters, chapterScenes, stories } from "@/db/schema";
import { generateStory } from "@/lib/story";
import { screen, screenImagePrompt } from "@/lib/moderation";
import { buildScenePrompt, buildChapterScenePrompt, generateChapterScene, generateImage, imageConfigured, shouldGenerateChapterScene, characterImageUrl } from "@/lib/image";
import { getCurrentUserId } from "@/lib/session";
import { ensureDailyDrip, spend, userBalance } from "@/lib/ledger";
import { mediaStorageConfigured, readImageBase64, storeImage } from "@/lib/media";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const CHAPTER_PRICE = Number(process.env.CHAPTER_PRICE || 5);
const DAILY_DRIP = Number(process.env.DAILY_DRIP || 10);

const Body = z.object({
  characterId: z.string().uuid(),
  setting: z.string().max(200).optional(),
  tone: z.string().max(60).optional(),
  scenario: z.string().max(120).optional(),
  relationship: z.string().max(80).optional(),
  genre: z.string().max(60).optional(),
  details: z.string().max(400).optional(),
  length: z.enum(["short", "medium"]).optional(),
});

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid request body" }, { status: 400 });
  }

  // Input safety gate on user-supplied elements.
  if (screen([body.setting, body.tone, body.scenario, body.relationship, body.genre, body.details].filter(Boolean).join(" ")).blocked) {
    return NextResponse.json({ error: "blocked", reason: "safety_minor" }, { status: 422 });
  }

  // Chapters cost credits. Refresh the daily drip, then make sure the writer can
  // afford this one before we spend a model call on it.
  await ensureDailyDrip(userId, DAILY_DRIP);
  const balance = await userBalance(userId);
  if (balance.total < CHAPTER_PRICE) {
    return NextResponse.json({ error: "insufficient_credits", price: CHAPTER_PRICE, balance }, { status: 402 });
  }

  try {
    const [char] = await db.select().from(characters).where(eq(characters.id, body.characterId)).limit(1);
    if (!char) return NextResponse.json({ error: "character not found" }, { status: 404 });

    const def = (char.definition ?? {}) as Record<string, string>;
    const { title, content } = await generateStory(def, {
      setting: body.setting,
      tone: body.tone,
      scenario: body.scenario,
      relationship: body.relationship,
      genre: body.genre,
      details: body.details,
      length: body.length,
    });

    // Output safety gate.
    if (screen(`${title} ${content}`).blocked) {
      return NextResponse.json({ error: "blocked", reason: "safety_minor" }, { status: 422 });
    }

    const [story] = await db
      .insert(stories)
      .values({
        characterId: char.id,
        userId, // nullable - story is a public front-door
        title,
        content,
        chapterDates: [new Date().toISOString()],
        elements: {
          setting: body.setting ?? null,
          tone: body.tone ?? null,
          scenario: body.scenario ?? null,
          relationship: body.relationship ?? null,
          genre: body.genre ?? null,
          details: body.details ?? null,
          length: body.length ?? null,
          tier: "standard",
        },
      })
      .returning({ id: stories.id });

    // Charge only after a successful, safety-cleared generation + save.
    const charge = await spend(userId, CHAPTER_PRICE, { kind: "chapter", storyId: story.id, chapter: 0 });
    if (!charge.ok) return NextResponse.json({ error: "insufficient_credits", price: CHAPTER_PRICE, balance: charge.balance }, { status: 402 });

    // Draw an ambient background from the setting in the BACKGROUND so reading
    // starts instantly; the scene fades in when it lands. Best-effort — the story
    // reads fine without it, and the image gate keeps disallowed scenes out. Only
    // when the writer actually gave a setting, so we don't spend credits on a
    // generic scene nobody asked for.
    if (body.setting?.trim() && imageConfigured() && mediaStorageConfigured()) {
      const scenePrompt = buildScenePrompt({ setting: body.setting, genre: body.genre, tone: body.tone, scenario: body.scenario });
      if (!screenImagePrompt(scenePrompt).blocked) {
        after(async () => {
          try {
            const gen = await generateImage(scenePrompt);
            const imageKey = await storeImage({ scope: "stories", ownerId: story.id, base64: gen.base64, mime: gen.mime });
            await db.update(stories).set({ imageKey, imageMime: gen.mime }).where(eq(stories.id, story.id));
          } catch (err) {
            console.error("[story] background generation failed:", err instanceof Error ? err.message : err);
          }
        });
      }
    }

    // A scene image for the opening chapter (chapter 0), in the background -
    // only when scene images are enabled (SCENE_IMAGES=opening|all).
    if (shouldGenerateChapterScene(0) && mediaStorageConfigured()) {
      const chapterPrompt = buildChapterScenePrompt({ name: def.name, gender: def.gender, look: def.look, style: def.style }, content);
      if (!screenImagePrompt(chapterPrompt).blocked) {
        after(async () => {
          try {
            const portraitBase64 = await readImageBase64(char.imageKey);
            const gen = await generateChapterScene({ name: def.name, gender: def.gender, look: def.look, style: def.style }, content, portraitBase64, portraitBase64 ? characterImageUrl(body.characterId) : null);
            const imageKey = await storeImage({ scope: "chapters", ownerId: `${story.id}/0`, base64: gen.base64, mime: gen.mime });
            await db.insert(chapterScenes).values({ storyId: story.id, chapterIndex: 0, imageKey, imageMime: gen.mime }).onConflictDoNothing();
          } catch (err) {
            console.error("[story] chapter scene generation failed:", err instanceof Error ? err.message : err);
          }
        });
      }
    }

    return NextResponse.json({ storyId: story.id, title, content, balance: charge.balance });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "story generation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
