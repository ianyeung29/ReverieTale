import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { characters, stories } from "@/db/schema";
import { createReport, REPORT_REASONS } from "@/lib/reports";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

const REASON_VALUES = REPORT_REASONS.map((r) => r.value) as [string, ...string[]];

const Body = z.object({
  targetType: z.enum(["character", "story"]),
  targetId: z.string().uuid(),
  reason: z.enum(REASON_VALUES),
  note: z.string().max(500).optional(),
});

async function targetExists(targetType: "character" | "story", targetId: string): Promise<boolean> {
  if (targetType === "character") {
    const [row] = await db.select({ id: characters.id }).from(characters).where(eq(characters.id, targetId)).limit(1);
    return Boolean(row);
  }
  const [row] = await db.select({ id: stories.id }).from(stories).where(eq(stories.id, targetId)).limit(1);
  return Boolean(row);
}

// POST /api/reports -> flag a character or story for a human to check. Always
// signed in (so reports can't be spammed anonymously); anyone can report,
// including the content's own creator/author.
export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid request body" }, { status: 400 });
  }

  if (!(await targetExists(body.targetType, body.targetId))) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  await createReport(userId, body.targetType, body.targetId, body.reason, body.note);
  return NextResponse.json({ ok: true });
}
