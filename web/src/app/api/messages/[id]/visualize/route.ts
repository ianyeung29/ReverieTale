import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { characters, messages, threads } from "@/db/schema";
import { generateMomentImage, imageConfigured } from "@/lib/image";
import { screenImagePrompt } from "@/lib/moderation";
import { getCurrentUserId } from "@/lib/session";
import { ensureDailyDrip, spend, userBalance } from "@/lib/ledger";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MOMENT_IMAGE_PRICE = Number(process.env.MOMENT_IMAGE_PRICE || 5);
const DAILY_DRIP = Number(process.env.DAILY_DRIP || 20);

// POST /api/messages/:id/visualize -> illustrate a character reply (on demand,
// costs credits). Cached on the message row, so a second call is free and just
// returns the existing image.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const [row] = await db
    .select({
      role: messages.role,
      content: messages.content,
      hasImage: messages.imageBase64,
      threadId: messages.threadId,
      ownerId: threads.userId,
      characterId: threads.characterId,
    })
    .from(messages)
    .innerJoin(threads, eq(messages.threadId, threads.id))
    .where(eq(messages.id, id))
    .limit(1);
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (row.ownerId !== userId) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (row.role !== "character") return NextResponse.json({ error: "can only visualize a character reply" }, { status: 400 });

  if (row.hasImage) return NextResponse.json({ ok: true, balance: await userBalance(userId) });

  if (!imageConfigured()) return NextResponse.json({ error: "image generation not configured" }, { status: 503 });

  await ensureDailyDrip(userId, DAILY_DRIP);
  const balance = await userBalance(userId);
  if (balance.total < MOMENT_IMAGE_PRICE) {
    return NextResponse.json({ error: "insufficient_credits", price: MOMENT_IMAGE_PRICE, balance }, { status: 402 });
  }

  try {
    const [char] = await db.select({ image: characters.image, definition: characters.definition }).from(characters).where(eq(characters.id, row.characterId)).limit(1);
    const def = (char?.definition ?? {}) as Record<string, string>;

    if (screenImagePrompt(row.content).blocked) return NextResponse.json({ error: "blocked", reason: "safety_minor" }, { status: 422 });

    const gen = await generateMomentImage(def, row.content, char?.image ?? null);
    await db.update(messages).set({ imageBase64: gen.base64, imageMime: gen.mime }).where(eq(messages.id, id));

    const charge = await spend(userId, MOMENT_IMAGE_PRICE, { kind: "moment_image", messageId: id });
    if (!charge.ok) return NextResponse.json({ error: "insufficient_credits", price: MOMENT_IMAGE_PRICE, balance: charge.balance }, { status: 402 });

    return NextResponse.json({ ok: true, balance: charge.balance });
  } catch (e) {
    console.error("[visualize] failed:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "visualize failed" }, { status: 500 });
  }
}
