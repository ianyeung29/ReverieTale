import { NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { characterLikes, characters } from "@/db/schema";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

// POST /api/characters/:id/like
// The desired state makes repeated clicks and retries safe.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "sign in to like companions" }, { status: 401 });

  const { id } = await params;
  let liked: boolean;
  try {
    const body = await req.json() as { liked?: unknown };
    if (typeof body.liked !== "boolean") throw new Error("invalid state");
    liked = body.liked;
  } catch {
    return NextResponse.json({ error: "invalid request body" }, { status: 400 });
  }

  const [character] = await db
    .select({ id: characters.id })
    .from(characters)
    .where(and(eq(characters.id, id), eq(characters.status, "published")))
    .limit(1);
  if (!character) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (liked) {
    await db.insert(characterLikes).values({ userId, characterId: id }).onConflictDoNothing();
  } else {
    await db.delete(characterLikes).where(and(eq(characterLikes.userId, userId), eq(characterLikes.characterId, id)));
  }

  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(characterLikes)
    .where(eq(characterLikes.characterId, id));
  return NextResponse.json({ liked, likes: row?.count ?? 0 });
}
