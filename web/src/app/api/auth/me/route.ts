import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { characters, users } from "@/db/schema";
import { getCurrentUserId } from "@/lib/session";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ user: null });
  const [u] = await db.select({ email: users.email, displayName: users.displayName, portraitGens: users.portraitGens }).from(users).where(eq(users.id, userId)).limit(1);
  const admin = await isAdmin(userId);
  const portraitFreeRemaining = Math.max(0, Number(process.env.FREE_PORTRAITS || 2) - (u?.portraitGens ?? 0));

  let pendingReviews = 0;
  if (admin) {
    const [c] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(characters)
      .where(eq(characters.status, "in_review"));
    pendingReviews = c?.n ?? 0;
  }

  return NextResponse.json({ user: u ? { email: u.email, displayName: u.displayName ?? "", isAdmin: admin, pendingReviews, portraitFreeRemaining } : null });
}
