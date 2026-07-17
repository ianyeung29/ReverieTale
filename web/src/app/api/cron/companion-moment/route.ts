import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { companionPosts } from "@/db/schema";
import { nextCompanionForDailyPost, publishCompanionPost } from "@/lib/companionPosts";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const url = new URL(req.url);
  return url.searchParams.get("key") === secret || req.headers.get("authorization") === `Bearer ${secret}`;
}

// GET /api/cron/companion-moment -> creates one safe profile Moment each day.
// The explicit feature flag avoids unplanned image-generation spend.
export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (process.env.DAILY_COMPANION_POSTS_ENABLED !== "true") {
    return NextResponse.json({ ok: false, skipped: "Daily companion Moments are disabled" });
  }

  const [latest] = await db.select({ postedAt: companionPosts.postedAt }).from(companionPosts).orderBy(desc(companionPosts.postedAt)).limit(1);
  if (latest && Date.now() - latest.postedAt.getTime() < 20 * 60 * 60 * 1000) {
    return NextResponse.json({ ok: true, skipped: "A companion Moment was posted recently" });
  }

  const characterId = await nextCompanionForDailyPost();
  if (!characterId) return NextResponse.json({ ok: false, skipped: "No published companion portrait is ready" });
  try {
    const post = await publishCompanionPost(characterId, true);
    return NextResponse.json({ ok: true, post });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "generation failed" }, { status: 500 });
  }
}
