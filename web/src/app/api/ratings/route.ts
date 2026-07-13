import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { characters, stories } from "@/db/schema";
import { ratingFor, submitRating, userRating, type RatingTarget } from "@/lib/ratings";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

const TARGETS = ["character", "story"] as const;

// Owner of the target (creator of a character, author of a story). Owners can't
// rate their own work. Returns null when there's no owner (first-party content).
async function ownerOf(targetType: RatingTarget, targetId: string): Promise<string | null | undefined> {
  if (targetType === "character") {
    const [c] = await db.select({ owner: characters.creatorId }).from(characters).where(eq(characters.id, targetId)).limit(1);
    return c ? c.owner : undefined; // undefined = not found
  }
  const [s] = await db.select({ owner: stories.userId }).from(stories).where(eq(stories.id, targetId)).limit(1);
  return s ? s.owner : undefined;
}

// GET /api/ratings?targetType=character&targetId=... -> { average, count, mine }
export async function GET(req: Request) {
  const url = new URL(req.url);
  const targetType = url.searchParams.get("targetType");
  const targetId = url.searchParams.get("targetId");
  if (!TARGETS.includes(targetType as RatingTarget) || !targetId) {
    return NextResponse.json({ error: "invalid params" }, { status: 400 });
  }
  const agg = await ratingFor(targetType as RatingTarget, targetId);
  const userId = await getCurrentUserId();
  const mine = userId ? await userRating(userId, targetType as RatingTarget, targetId) : null;
  return NextResponse.json({ ...agg, mine });
}

const Body = z.object({
  targetType: z.enum(TARGETS),
  targetId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
});

// POST /api/ratings -> upsert the signed-in user's rating for a target.
export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid request body" }, { status: 400 });
  }

  const owner = await ownerOf(body.targetType, body.targetId);
  if (owner === undefined) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (owner && owner === userId) return NextResponse.json({ error: "own_content" }, { status: 403 });

  await submitRating(userId, body.targetType, body.targetId, body.rating);
  const agg = await ratingFor(body.targetType, body.targetId);
  return NextResponse.json({ ...agg, mine: body.rating });
}
