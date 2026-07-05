import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { characters, stories, users } from "@/db/schema";
import { generateNextChapter } from "@/lib/story";
import { resolveTier, type Tier } from "@/lib/model";
import { screen } from "@/lib/moderation";
import { getCurrentUserId } from "@/lib/session";
import { ensureDailyDrip, spend, userBalance } from "@/lib/ledger";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const CHAPTER_PRICE = Number(process.env.CHAPTER_PRICE || 10);
const DAILY_DRIP = Number(process.env.DAILY_DRIP || 20);

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
    .select({ ownerId: stories.userId, content: stories.content, elements: stories.elements, definition: characters.definition })
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
    // Match the story's tier, but still gated: explicit only if configured AND caller age-verified.
    const [u] = await db.select({ av: users.ageVerified }).from(users).where(eq(users.id, userId)).limit(1);
    const ageVerified = Boolean(u?.av);
    const storedTier = ((row.elements ?? {}) as { tier?: Tier }).tier;
    const tier = resolveTier(storedTier, { ageVerified });

    const def = (row.definition ?? {}) as Record<string, string>;
    const chapter = await generateNextChapter(def, row.content, dir, tier);
    if (screen(chapter).blocked) return NextResponse.json({ error: "blocked", reason: "safety_minor" }, { status: 422 });

    const updated = `${row.content}\n\n· · ·\n\n${chapter}`;
    await db.update(stories).set({ content: updated }).where(eq(stories.id, id));

    // Charge only after a successful, safety-cleared generation + save.
    const charge = await spend(userId, CHAPTER_PRICE, { kind: "chapter", storyId: id });
    if (!charge.ok) return NextResponse.json({ error: "insufficient_credits", price: CHAPTER_PRICE, balance: charge.balance }, { status: 402 });

    return NextResponse.json({ chapter, balance: charge.balance });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "failed" }, { status: 500 });
  }
}
