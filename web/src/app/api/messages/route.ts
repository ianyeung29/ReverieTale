import { NextResponse } from "next/server";
import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { messages, threads } from "@/db/schema";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

// GET /api/messages?threadId=... -> messages for a thread the user owns (oldest first).
export async function GET(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const threadId = new URL(req.url).searchParams.get("threadId");
  if (!threadId) return NextResponse.json({ error: "threadId required" }, { status: 400 });

  // Ownership check: only return messages for the caller's own thread.
  const [t] = await db.select({ userId: threads.userId }).from(threads).where(eq(threads.id, threadId)).limit(1);
  if (!t || t.userId !== userId) return NextResponse.json({ error: "not found" }, { status: 404 });

  const rows = await db
    .select({
      id: messages.id,
      role: messages.role,
      content: messages.content,
      hasImage: sql<boolean>`(${messages.imageKey} is not null)`,
      imageLocked: messages.imageLocked,
      imagePrice: messages.imagePrice,
    })
    .from(messages)
    .where(and(eq(messages.threadId, threadId)))
    .orderBy(asc(messages.createdAt));

  return NextResponse.json(rows);
}
