import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { characters, stories, users } from "@/db/schema";
import { generateNextChapter, generateStory, type StoryElements } from "@/lib/story";
import { resolveTier, type Tier } from "@/lib/model";
import { screen } from "@/lib/moderation";
import { getCurrentUserId } from "@/lib/session";
import { ensureDailyDrip, spend, userBalance } from "@/lib/ledger";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const CHAPTER_PRICE = Number(process.env.CHAPTER_PRICE || 10);
const DAILY_DRIP = Number(process.env.DAILY_DRIP || 20);

const SEP = "\n\n· · ·\n\n";
const Body = z.object({
  chapterIndex: z.number().int().min(0),
  direction: z.object({ whatHappens: z.string().max(400).optional(), mood: z.string().max(60).optional(), twist: z.string().max(80).optional(), setting: z.string().max(200).optional() }).optional(),
});

// POST /api/stories/:id/rewrite -> regenerate one chapter in place. Creator only.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const dir = body.direction ?? {};
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

  // A rewrite regenerates a chapter, so it costs the same as writing one.
  await ensureDailyDrip(userId, DAILY_DRIP);
  const balance = await userBalance(userId);
  if (balance.total < CHAPTER_PRICE) {
    return NextResponse.json({ error: "insufficient_credits", price: CHAPTER_PRICE, balance }, { status: 402 });
  }

  try {
    const [u] = await db.select({ av: users.ageVerified }).from(users).where(eq(users.id, userId)).limit(1);
    const elements = (row.elements ?? {}) as StoryElements & { tier?: Tier };
    const tier = resolveTier(elements.tier, { ageVerified: Boolean(u?.av) });
    const def = (row.definition ?? {}) as Record<string, string>;

    const chapters = row.content.split(/\n{2,}·\s·\s·\n{2,}/).map((s) => s.trim()).filter(Boolean);
    if (body.chapterIndex >= chapters.length) return NextResponse.json({ error: "chapter out of range" }, { status: 400 });

    let newChapter: string;
    if (body.chapterIndex === 0) {
      const { content } = await generateStory(def, elements, tier); // keep original title; swap the opening prose
      newChapter = content;
    } else {
      const soFar = chapters.slice(0, body.chapterIndex).join(SEP);
      newChapter = await generateNextChapter(def, soFar, dir, tier);
    }
    if (screen(newChapter).blocked) return NextResponse.json({ error: "blocked", reason: "safety_minor" }, { status: 422 });

    // Rewriting a chapter is a branch point: chapters after it were written to
    // follow the OLD version, so they're dropped (the client confirms first).
    // Save the pre-rewrite version as a one-level backup the creator can restore.
    const kept = [...chapters.slice(0, body.chapterIndex), newChapter.trim()];
    await db.update(stories).set({ content: kept.join(SEP), backup: row.content, backupAt: new Date() }).where(eq(stories.id, id));

    // Charge only after a successful, safety-cleared rewrite + save.
    const charge = await spend(userId, CHAPTER_PRICE, { kind: "rewrite", storyId: id, chapter: body.chapterIndex });
    if (!charge.ok) return NextResponse.json({ error: "insufficient_credits", price: CHAPTER_PRICE, balance: charge.balance }, { status: 402 });

    return NextResponse.json({ chapter: newChapter.trim(), total: kept.length, balance: charge.balance });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "failed" }, { status: 500 });
  }
}
