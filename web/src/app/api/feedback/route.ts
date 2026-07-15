import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { feedback } from "@/db/schema";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

const Body = z.object({
  kind: z.enum(["idea", "issue", "general"]),
  message: z.string().trim().min(5).max(1200),
  pagePath: z.string().trim().max(300).optional(),
});

// POST /api/feedback -> private product feedback from a signed-in reader.
// Accounts keep the inbox usable without collecting a second email address.
export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid request body" }, { status: 400 });
  }

  await db.insert(feedback).values({ userId, kind: body.kind, message: body.message, pagePath: body.pagePath || null });
  return NextResponse.json({ ok: true });
}
