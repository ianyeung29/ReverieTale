import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUserId } from "@/lib/session";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ user: null });
  const [u] = await db.select({ email: users.email, displayName: users.displayName }).from(users).where(eq(users.id, userId)).limit(1);
  const admin = await isAdmin(userId);
  return NextResponse.json({ user: u ? { email: u.email, displayName: u.displayName ?? "", isAdmin: admin } : null });
}
