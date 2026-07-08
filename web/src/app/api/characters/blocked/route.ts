import { NextResponse } from "next/server";
import { blockedCharacters } from "@/lib/blocks";
import { logUnlessMissingRelation } from "@/lib/db-errors";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

// GET /api/characters/blocked -> the signed-in reader's blocked companions,
// so they can review and undo blocks.
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    return NextResponse.json(await blockedCharacters(userId));
  } catch (e) {
    logUnlessMissingRelation("characters/blocked", e);
    return NextResponse.json([]);
  }
}
