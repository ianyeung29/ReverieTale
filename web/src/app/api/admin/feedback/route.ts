import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { feedback, users } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!(await isAdmin(userId))) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const rows = await db
    .select({ id: feedback.id, kind: feedback.kind, message: feedback.message, pagePath: feedback.pagePath, createdAt: feedback.createdAt, email: users.email })
    .from(feedback)
    .innerJoin(users, eq(feedback.userId, users.id))
    .where(eq(feedback.status, "open"))
    .orderBy(desc(feedback.createdAt));
  return NextResponse.json(rows);
}
