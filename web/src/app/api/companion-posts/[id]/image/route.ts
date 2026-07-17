import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { companionPosts } from "@/db/schema";
import { imageResponse } from "@/lib/media";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post] = await db
    .select({ imageKey: companionPosts.imageKey, imageMime: companionPosts.imageMime })
    .from(companionPosts)
    .where(eq(companionPosts.id, id))
    .limit(1);
  if (!post) return NextResponse.json({ error: "not found" }, { status: 404 });
  return imageResponse(post.imageKey, post.imageMime, "public, max-age=31536000, immutable");
}
