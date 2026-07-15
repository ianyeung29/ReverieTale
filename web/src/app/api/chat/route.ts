import { NextResponse } from "next/server";
import { z } from "zod";
import { handleChat } from "@/lib/chat";
import { ensureDailyDrip } from "@/lib/ledger";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DAILY_DRIP = Number(process.env.DAILY_DRIP || 10);

const Body = z.object({
  characterId: z.string().uuid(),
  threadId: z.string().uuid().optional(),
  message: z.string().min(1).max(4000),
  storyId: z.string().uuid().optional(),
  chapter: z.number().int().positive().max(1000).optional(),
});

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid request body" }, { status: 400 });
  }

  try {
    await ensureDailyDrip(userId, DAILY_DRIP); // top up today's free credits if due
    const result = await handleChat({
      userId,
      characterId: body.characterId,
      threadId: body.threadId,
      message: body.message,
      storyId: body.storyId,
      chapter: body.chapter,
    });

    if (result.status === "blocked") return NextResponse.json({ error: "blocked", reason: result.reason }, { status: 422 });
    if (result.status === "paywall")
      return NextResponse.json({ error: "out_of_credits", balance: result.balance }, { status: 402 });
    return NextResponse.json({ threadId: result.threadId, reply: result.reply, messageId: result.messageId, balance: result.balance });
  } catch (e) {
    console.error("[chat] failed:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "chat failed" }, { status: 500 });
  }
}
