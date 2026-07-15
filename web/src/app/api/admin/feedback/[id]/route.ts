import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { feedback } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!(await isAdmin(userId))) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  const result = await db.update(feedback).set({ status: "reviewed", reviewedAt: new Date(), reviewedBy: userId }).where(eq(feedback.id, id)).returning({ id: feedback.id });
  if (!result.length) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
