import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { messages, threads } from "@/db/schema";
import { spend } from "@/lib/ledger";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

// POST /api/messages/:id/reveal-photo unlocks a generated private photo.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const [message] = await db
    .select({ imageKey: messages.imageKey, imageLocked: messages.imageLocked, imagePrice: messages.imagePrice, ownerId: threads.userId })
    .from(messages)
    .innerJoin(threads, eq(messages.threadId, threads.id))
    .where(eq(messages.id, id))
    .limit(1);

  if (!message || message.ownerId !== userId) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (!message.imageLocked) return NextResponse.json({ ok: true, alreadyUnlocked: true });
  if (!message.imageKey) return NextResponse.json({ error: "photo is still being prepared" }, { status: 409 });

  const price = Math.max(1, message.imagePrice ?? 10);
  const charged = await spend(userId, price, { kind: "private_photo", messageId: id });
  if (!charged.ok) return NextResponse.json({ error: "out_of_credits", balance: charged.balance }, { status: 402 });

  await db.update(messages).set({ imageLocked: false }).where(eq(messages.id, id));
  return NextResponse.json({ ok: true, balance: charged.balance });
}
