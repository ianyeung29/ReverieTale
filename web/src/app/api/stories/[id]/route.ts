import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { bookmarks, characters, chapterScenes, stories } from "@/db/schema";
import { ratingFor, userRating } from "@/lib/ratings";
import { isBookmarked } from "@/lib/bookmarks";
import { isCharacterBlocked } from "@/lib/blocks";
import { logUnlessMissingRelation } from "@/lib/db-errors";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

// GET /api/stories/:id -> a single story to read (public front door). isOwner
// tells the client whether to offer creator controls (rewrite).
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [row] = await db
    .select({
      id: stories.id,
      title: stories.title,
      content: stories.content,
      characterId: stories.characterId,
      ownerId: stories.userId,
      isPublic: stories.isPublic,
      backup: stories.backup,
      reads: stories.reads,
      elements: stories.elements,
      createdAt: stories.createdAt,
      chapterDates: stories.chapterDates,
      definition: characters.definition,
    })
    .from(stories)
    .innerJoin(characters, eq(stories.characterId, characters.id))
    .where(eq(stories.id, id))
    .limit(1);

  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  const def = (row.definition ?? {}) as Record<string, string>;
  const userId = await getCurrentUserId();
  const isOwner = Boolean(row.ownerId && userId && row.ownerId === userId);
  // Count reads by anyone other than the creator (powers the "most read" sort).
  let reads = row.reads;
  if (!isOwner) {
    try {
      await db.update(stories).set({ reads: sql`${stories.reads} + 1` }).where(eq(stories.id, id));
      reads += 1;
    } catch {
      /* read counting must never break reading */
    }
  }

  const rating = await ratingFor("story", row.id);
  const mine = userId && !isOwner ? await userRating(userId, "story", row.id) : null;

  // Background column is optional (migration 0010); probe it separately so a
  // missing column never breaks reading the story.
  let hasBackground = false;
  try {
    const [bg] = await db.select({ h: sql<boolean>`(${stories.image} is not null)` }).from(stories).where(eq(stories.id, id)).limit(1);
    hasBackground = Boolean(bg?.h);
  } catch {
    /* image column not migrated yet */
  }

  // Which chapters have a generated scene image (migration 0018) - the reader
  // renders one only where it exists. Optional; never break reading over it.
  let chapterImages: number[] = [];
  try {
    const rows = await db.select({ i: chapterScenes.chapterIndex }).from(chapterScenes).where(eq(chapterScenes.storyId, id));
    chapterImages = rows.map((r) => r.i).sort((a, b) => a - b);
  } catch {
    /* chapter_scenes not migrated yet */
  }

  // Bookmark state is optional (migration 0011); never break reading over it.
  let saved = false;
  if (userId) {
    try {
      saved = await isBookmarked(userId, row.id);
    } catch (e) {
      logUnlessMissingRelation("stories/:id bookmark check", e);
    }
  }

  // Whether the viewer has hidden this story's character (migration 0012) - lets
  // the client offer "also hide" in the report flow without accidentally
  // un-hiding an already-hidden character (the underlying action is a toggle).
  let characterHidden = false;
  if (userId) {
    try {
      characterHidden = await isCharacterBlocked(userId, row.characterId);
    } catch (e) {
      logUnlessMissingRelation("stories/:id block check", e);
    }
  }

  return NextResponse.json({
    id: row.id,
    title: row.title,
    content: row.content,
    characterId: row.characterId,
    characterName: def.name ?? "Unknown",
    characterTagline: def.backstory ?? "",
    characterTags: (row.definition as { tags?: string[] } | null)?.tags ?? [],
    tone: (row.elements as Record<string, string> | null)?.tone ?? "",
    createdAt: row.createdAt,
    chapterDates: row.chapterDates ?? [],
    chapterImages,
    isOwner,
    isPublic: row.isPublic,
    hasBackup: isOwner && Boolean(row.backup),
    hasBackground,
    reads,
    rating: rating.average,
    ratingCount: rating.count,
    myRating: mine,
    canRate: Boolean(userId) && !isOwner,
    isSaved: saved,
    canSave: Boolean(userId) && !isOwner,
    isCharacterHidden: characterHidden,
  });
}

// Confirm the signed-in user owns this story; returns its userId or an error
// response the caller can return directly.
async function requireOwner(id: string): Promise<{ ok: true } | { ok: false; res: NextResponse }> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, res: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  const [row] = await db.select({ ownerId: stories.userId }).from(stories).where(eq(stories.id, id)).limit(1);
  if (!row) return { ok: false, res: NextResponse.json({ error: "not found" }, { status: 404 }) };
  if (!row.ownerId || row.ownerId !== userId) return { ok: false, res: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  return { ok: true };
}

// PATCH /api/stories/:id -> owner-only. Currently just the public/hidden toggle:
// { isPublic: boolean }. Hiding keeps the story in the owner's library but drops
// it from the public feed.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const owner = await requireOwner(id);
  if (!owner.ok) return owner.res;

  const body = (await req.json().catch(() => ({}))) as { isPublic?: unknown };
  if (typeof body.isPublic !== "boolean") return NextResponse.json({ error: "isPublic (boolean) required" }, { status: 400 });

  await db.update(stories).set({ isPublic: body.isPublic }).where(eq(stories.id, id));
  return NextResponse.json({ ok: true, isPublic: body.isPublic });
}

// DELETE /api/stories/:id -> owner-only hard delete. Removes the story's
// dependent rows first (chapter scene images, bookmarks) so the FK constraints
// are satisfied. Threads keep a loose storyId (no FK) and are left untouched.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const owner = await requireOwner(id);
  if (!owner.ok) return owner.res;

  // Children of the story. Wrapped so a not-yet-migrated table never blocks the
  // delete of the story itself.
  try { await db.delete(chapterScenes).where(eq(chapterScenes.storyId, id)); } catch (e) { logUnlessMissingRelation("stories/:id delete chapter scenes", e); }
  try { await db.delete(bookmarks).where(eq(bookmarks.storyId, id)); } catch (e) { logUnlessMissingRelation("stories/:id delete bookmarks", e); }
  await db.delete(stories).where(eq(stories.id, id));
  return NextResponse.json({ ok: true });
}
