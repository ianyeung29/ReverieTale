import { NextResponse, after } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { characters, chapterScenes, stories } from "@/db/schema";
import { generateNextChapter } from "@/lib/story";
import { screen, screenImagePrompt } from "@/lib/moderation";
import { buildChapterScenePrompt, generateChapterScene, shouldGenerateChapterScene, characterImageUrl } from "@/lib/image";
import { getCurrentUserId } from "@/lib/session";
import { ensureDailyDrip, spend, userBalance } from "@/lib/ledger";
import { mediaStorageConfigured, readImageBase64, storeImage } from "@/lib/media";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const CHAPTER_PRICE = Number(process.env.CHAPTER_PRICE || 5);
const DAILY_DRIP = Number(process.env.DAILY_DRIP || 10);

const Body = z.object({
  whatHappens: z.string().max(400).optional(),
  mood: z.string().max(60).optional(),
  twist: z.string().max(80).optional(),
  setting: z.string().max(200).optional(),
});

// POST /api/stories/:id/continue -> generate the next chapter (reader-steered) and append it.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Continuing a story is a creator action and costs credits.
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let dir: z.infer<typeof Body> = {};
  try {
    dir = Body.parse(await req.json());
  } catch {
    /* empty/invalid body is fine - continue with no direction */
  }

  // Safety gate on reader-supplied direction.
  if (screen([dir.whatHappens, dir.mood, dir.twist, dir.setting].filter(Boolean).join(" ")).blocked) {
    return NextResponse.json({ error: "blocked", reason: "safety_minor" }, { status: 422 });
  }

  const [row] = await db
    .select({ ownerId: stories.userId, content: stories.content, elements: stories.elements, chapterDates: stories.chapterDates, definition: characters.definition, portraitKey: characters.imageKey, characterId: stories.characterId })
    .from(stories)
    .innerJoin(characters, eq(stories.characterId, characters.id))
    .where(eq(stories.id, id))
    .limit(1);
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (row.ownerId !== userId) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  // Refresh the daily drip, then make sure the writer can afford this chapter.
  await ensureDailyDrip(userId, DAILY_DRIP);
  const balance = await userBalance(userId);
  if (balance.total < CHAPTER_PRICE) {
    return NextResponse.json({ error: "insufficient_credits", price: CHAPTER_PRICE, balance }, { status: 402 });
  }

  try {
    const def = (row.definition ?? {}) as Record<string, string>;
    const chapter = await generateNextChapter(def, row.content, dir);
    if (screen(chapter).blocked) return NextResponse.json({ error: "blocked", reason: "safety_minor" }, { status: 422 });

    const newIndex = row.content.split(/\n{2,}·\s·\s·\n{2,}/).map((c) => c.trim()).filter(Boolean).length;
    const updated = `${row.content}\n\n· · ·\n\n${chapter}`;
    const chapterDates = [...(row.chapterDates ?? []), new Date().toISOString()];
    await db.update(stories).set({ content: updated, chapterDates }).where(eq(stories.id, id));

    // Charge only after a successful, safety-cleared generation + save.
    const charge = await spend(userId, CHAPTER_PRICE, { kind: "chapter", storyId: id });
    if (!charge.ok) return NextResponse.json({ error: "insufficient_credits", price: CHAPTER_PRICE, balance: charge.balance }, { status: 402 });

    // A scene image for the new chapter, in the background - only when scene
    // images are enabled for this chapter (SCENE_IMAGES=all covers later chapters).
    if (shouldGenerateChapterScene(newIndex) && mediaStorageConfigured()) {
      const prompt = buildChapterScenePrompt({ name: def.name, gender: def.gender, look: def.look, outfit: def.outfit, style: def.style }, chapter);
      if (!screenImagePrompt(prompt).blocked) {
        after(async () => {
          try {
            const portraitBase64 = await readImageBase64(row.portraitKey);
            const gen = await generateChapterScene({ name: def.name, gender: def.gender, look: def.look, outfit: def.outfit, style: def.style }, chapter, portraitBase64, portraitBase64 ? characterImageUrl(row.characterId) : null);
            const imageKey = await storeImage({ scope: "chapters", ownerId: `${id}/${newIndex}`, base64: gen.base64, mime: gen.mime });
            await db.insert(chapterScenes).values({ storyId: id, chapterIndex: newIndex, imageKey, imageMime: gen.mime }).onConflictDoNothing();
          } catch (err) {
            console.error("[continue] chapter scene generation failed:", err instanceof Error ? err.message : err);
          }
        });
      }
    }

    return NextResponse.json({ chapter, balance: charge.balance });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "failed" }, { status: 500 });
  }
}
