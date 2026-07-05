import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { handleChat } from "@/lib/chat";
import { ensureDailyDrip, grantDrip } from "@/lib/ledger";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const WELCOME_CREDITS = Number(process.env.WELCOME_CREDITS || 50);
const DAILY_DRIP = Number(process.env.DAILY_DRIP || 50);

const Body = z.object({
  characterId: z.string().uuid(),
  threadId: z.string().uuid().optional(),
  message: z.string().min(1).max(4000),
  userId: z.string().uuid().optional(),
  storyId: z.string().uuid().optional(),
});

// Dev convenience: no auth yet in Phase 0. Fall back to a fixed dev user, and
// grant a welcome balance the first time so chat works out of the box.
async function devUserId(): Promise<string> {
  const email = "dev@local.test";
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) return existing.id;
  const [u] = await db.insert(users).values({ email, ageVerified: true }).returning({ id: users.id });
  await grantDrip(u.id, WELCOME_CREDITS, `welcome:${u.id}`);
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
    await ensureDailyDrip(userId, DAILY_DRIP); // top up today's free credits if due
    const result = await handleChat({
      userId,
      characterId: body.characterId,
      threadId: body.threadId,
      message: body.message,
      storyId: body.storyId,
    });

    if (result.status === "blocked") return NextResponse.json({ error: "blocked", reason: result.reason }, { status: 422 });
    if (result.status === "paywall")
      return NextResponse.json({ error: "out_of_credits", balance: result.balance }, { status: 402 });
    return NextResponse.json({ threadId: result.threadId, reply: result.reply, balance: result.balance });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "chat failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
