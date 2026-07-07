import { NextResponse, after } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { characters, stories, users } from "@/db/schema";
import { generateStory } from "@/lib/story";
import { resolveTier } from "@/lib/model";
import { screen, screenImagePrompt } from "@/lib/moderation";
import { buildScenePrompt, generateImage, imageConfigured } from "@/lib/image";
import { getCurrentUserId } from "@/lib/session";
import { ensureDailyDrip, spend, userBalance } from "@/lib/ledger";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const CHAPTER_PRICE = Number(process.env.CHAPTER_PRICE || 10);
const DAILY_DRIP = Number(process.env.DAILY_DRIP || 20);

const Body = z.object({
  characterId: z.string().uuid(),
  setting: z.string().max(200).optional(),
  tone: z.string().max(60).optional(),
  scenario: z.string().max(120).optional(),
  relationship: z.string().max(80).optional(),
  genre: z.string().max(60).optional(),
  details: z.string().max(400).optional(),
  length: z.enum(["short", "medium"]).optional(),
  tier: z.enum(["standard", "explicit"]).optional(),
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
    // Content tier is gated: explicit only if requested AND the operator has enabled
    // + configured the explicit lane AND the user is age-verified. Anonymous or
    // unverified -> standard, regardless of what's requested.
    const [u] = await db.select({ av: users.ageVerified }).from(users).where(eq(users.id, userId)).limit(1);
    const tier = resolveTier(body.tier, { ageVerified: Boolean(u?.av) });

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
    }, tier);

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
        elements: {
          setting: body.setting ?? null,
          tone: body.tone ?? null,
          scenario: body.scenario ?? null,
          relationship: body.relationship ?? null,
          genre: body.genre ?? null,
          details: body.details ?? null,
          length: body.length ?? null,
          tier,
        },
      })
      .returning({ id: stories.id });

    // Charge only after a successful, safety-cleared generation + save.
    const charge = await spend(userId, CHAPTER_PRICE, { kind: "chapter", storyId: story.id, chapter: 0 });
    if (!charge.ok) return NextResponse.json({ error: "insufficient_credits", price: CHAPTER_PRICE, balance: charge.balance }, { status: 402 });

    // Draw an ambient background from the setting in the BACKGROUND so reading
    // starts instantly; the scene fades in when it lands. Best-effort — the story
    // reads fine without it, and the image gate keeps disallowed scenes out.
    if (imageConfigured()) {
      const scenePrompt = buildScenePrompt({ setting: body.setting, genre: body.genre, tone: body.tone, scenario: body.scenario });
      if (!screenImagePrompt(scenePrompt).blocked) {
        after(async () => {
          try {
            const gen = await generateImage(scenePrompt);
            await db.update(stories).set({ image: gen.base64, imageMime: gen.mime }).where(eq(stories.id, story.id));
          } catch (err) {
            console.error("[story] background generation failed:", err instanceof Error ? err.message : err);
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
