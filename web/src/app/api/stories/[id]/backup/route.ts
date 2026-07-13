import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { stories } from "@/db/schema";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

// GET /api/stories/:id/backup -> the saved pre-rewrite version (creator only).
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const [row] = await db.select({ ownerId: stories.userId, backup: stories.backup }).from(stories).where(eq(stories.id, id)).limit(1);
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (row.ownerId !== userId) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!row.backup) return NextResponse.json({ error: "no backup" }, { status: 404 });

  return NextResponse.json({ content: row.backup });
}

// POST /api/stories/:id/restore -> revert to the backup, then clear it (creator only).
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const [row] = await db.select({ ownerId: stories.userId, backup: stories.backup }).from(stories).where(eq(stories.id, id)).limit(1);
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (row.ownerId !== userId) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!row.backup) return NextResponse.json({ error: "no backup" }, { status: 404 });

  await db.update(stories).set({ content: row.backup, backup: null, backupAt: null }).where(eq(stories.id, id));
  return NextResponse.json({ content: row.backup });
}
