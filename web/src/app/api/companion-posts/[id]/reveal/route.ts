import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { companionPhotoReveals, companionPosts } from "@/db/schema";
import { spend } from "@/lib/ledger";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

// POST /api/companion-posts/:id/reveal unlocks one safe companion moment for
// the current reader. The post itself remains shared; the reveal record is not.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const [post] = await db
    .select({ isLocked: companionPosts.isLocked, revealPrice: companionPosts.revealPrice })
    .from(companionPosts)
    .where(eq(companionPosts.id, id))
    .limit(1);
  if (!post) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (!post.isLocked) return NextResponse.json({ ok: true, alreadyUnlocked: true });

  const [existing] = await db
    .select({ id: companionPhotoReveals.id })
    .from(companionPhotoReveals)
    .where(and(eq(companionPhotoReveals.postId, id), eq(companionPhotoReveals.userId, userId)))
    .limit(1);
  if (existing) return NextResponse.json({ ok: true, alreadyUnlocked: true });

  const price = Math.max(1, post.revealPrice ?? 5);
  const charged = await spend(userId, price, { kind: "companion_photo", postId: id });
  if (!charged.ok) return NextResponse.json({ error: "out_of_credits", balance: charged.balance, price }, { status: 402 });

  try {
    await db.insert(companionPhotoReveals).values({ postId: id, userId });
  } catch (error) {
    // A second concurrent click may have won the unique insert. The ledger is
    // immutable, so surface the successful unlock instead of charging again on retry.
    const code = (error as { code?: string; cause?: { code?: string } })?.cause?.code ?? (error as { code?: string })?.code;
    if (code !== "23505") throw error;
  }
  return NextResponse.json({ ok: true, balance: charged.balance, price });
}
