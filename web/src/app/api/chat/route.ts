import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { handleChat } from "@/lib/chat";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const Body = z.object({
  characterId: z.string().uuid(),
  threadId: z.string().uuid().optional(),
  message: z.string().min(1).max(4000),
  userId: z.string().uuid().optional(),
});

// Dev convenience: no auth yet in Phase 0, so fall back to a fixed dev user.
async function devUserId(): Promise<string> {
  const email = "dev@local.test";
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) return existing.id;
  const [u] = await db.insert(users).values({ email, ageVerified: true }).returning({ id: users.id });
  return u.id;
}

export async function POST(req: Request) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid request body" }, { status: 400 });
  }

  try {
    const userId = body.userId ?? (await devUserId());
    const result = await handleChat({
      userId,
      characterId: body.characterId,
      threadId: body.threadId,
      message: body.message,
    });
    if (result.blocked) return NextResponse.json({ error: "blocked", reason: result.reason }, { status: 422 });
    return NextResponse.json({ threadId: result.threadId, reply: result.reply });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "chat failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
