import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { screen } from "@/lib/moderation";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

// POST /api/profile { displayName } -> set the public creator handle. Empty string
// clears it (falls back to "Anonymous creator" on profiles).
const Body = z.object({ displayName: z.string().trim().max(40) });

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid request body" }, { status: 400 });
  }

  if (body.displayName && screen(body.displayName).blocked) {
    return NextResponse.json({ error: "blocked", reason: "safety_minor" }, { status: 422 });
  }

  await db.update(users).set({ displayName: body.displayName || null }).where(eq(users.id, userId));
  return NextResponse.json({ displayName: body.displayName });
}
