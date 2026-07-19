import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { companionPhotoReveals, companionPosts } from "@/db/schema";
import { imageResponse } from "@/lib/media";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post] = await db
    .select({ imageKey: companionPosts.imageKey, imageMime: companionPosts.imageMime, isLocked: companionPosts.isLocked })
    .from(companionPosts)
    .where(eq(companionPosts.id, id))
    .limit(1);
  if (!post) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (post.isLocked) {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "photo_locked" }, { status: 401 });
    const [reveal] = await db
      .select({ id: companionPhotoReveals.id })
      .from(companionPhotoReveals)
      .where(and(eq(companionPhotoReveals.postId, id), eq(companionPhotoReveals.userId, userId)))
      .limit(1);
    if (!reveal) return NextResponse.json({ error: "photo_locked" }, { status: 423 });
  }
  return imageResponse(post.imageKey, post.imageMime, post.isLocked ? "private, max-age=300" : "public, max-age=31536000, immutable");
}
