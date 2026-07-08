import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { bookmarks } from "@/db/schema";

export async function isBookmarked(userId: string, storyId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: bookmarks.id })
    .from(bookmarks)
    .where(and(eq(bookmarks.userId, userId), eq(bookmarks.storyId, storyId)))
    .limit(1);
  return Boolean(row);
}

// Toggle: saves it if not already saved, un-saves it if it is. Returns the new state.
export async function toggleBookmark(userId: string, storyId: string): Promise<boolean> {
  const already = await isBookmarked(userId, storyId);
  if (already) {
    await db.delete(bookmarks).where(and(eq(bookmarks.userId, userId), eq(bookmarks.storyId, storyId)));
    return false;
  }
  await db.insert(bookmarks).values({ userId, storyId }).onConflictDoNothing();
  return true;
}

export async function bookmarkedStoryIds(userId: string): Promise<string[]> {
  const rows = await db
    .select({ storyId: bookmarks.storyId })
    .from(bookmarks)
    .where(eq(bookmarks.userId, userId))
    .orderBy(desc(bookmarks.createdAt));
  return rows.map((r) => r.storyId);
}
