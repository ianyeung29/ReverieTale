import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { stories } from "@/db/schema";
import { toggleBookmark } from "@/lib/bookmarks";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

// POST /api/stories/:id/bookmark -> toggle saving this story to the reader's
// library. Distinct from authorship (stories.userId) - anyone signed in can
// save any public story to come back to later.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const [row] = await db.select({ id: stories.id }).from(stories).where(eq(stories.id, id)).limit(1);
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });

  const bookmarked = await toggleBookmark(userId, id);
  return NextResponse.json({ bookmarked });
}
