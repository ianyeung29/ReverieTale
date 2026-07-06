import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { characters } from "@/db/schema";
import { getCurrentUserId } from "@/lib/session";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

// POST /api/admin/review/:id { action: "approve" | "reject" } -> resolve a pending
// character (admin only). approve -> published, reject -> disabled.
const Body = z.object({ action: z.enum(["approve", "reject"]), note: z.string().max(300).optional() });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!(await isAdmin(userId))) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid request body" }, { status: 400 });
  }

  const [row] = await db.select({ id: characters.id }).from(characters).where(eq(characters.id, id)).limit(1);
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });

  const status = body.action === "approve" ? "published" : "disabled";
  const note = body.note?.trim() || (body.action === "approve" ? "Approved by admin." : "Rejected by admin.");
  await db.update(characters).set({ status, reviewNote: note, updatedAt: new Date() }).where(eq(characters.id, id));

  return NextResponse.json({ ok: true, status });
}
