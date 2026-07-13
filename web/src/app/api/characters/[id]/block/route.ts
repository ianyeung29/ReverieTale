import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { characters } from "@/db/schema";
import { toggleCharacterBlock } from "@/lib/blocks";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

// POST /api/characters/:id/block -> toggle hiding this companion from the
// signed-in reader's own discovery surfaces (browse/home/tags). A personal
// preference, not a takedown - the creator and everyone else is unaffected.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const [row] = await db.select({ creatorId: characters.creatorId }).from(characters).where(eq(characters.id, id)).limit(1);
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (row.creatorId === userId) return NextResponse.json({ error: "own_content" }, { status: 403 });

  const blocked = await toggleCharacterBlock(userId, id);
  return NextResponse.json({ blocked });
}
