import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { moments } from "@/db/schema";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

// DELETE /api/moments/:id -> remove a saved moment from the reader's gallery.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const [row] = await db.select({ userId: moments.userId }).from(moments).where(eq(moments.id, id)).limit(1);
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (row.userId !== userId) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  await db.delete(moments).where(eq(moments.id, id));
  return NextResponse.json({ ok: true });
}
