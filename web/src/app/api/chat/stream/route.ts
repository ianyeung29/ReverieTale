import { NextResponse } from "next/server";
import { z } from "zod";
import { chatStream } from "@/lib/model";
import { finalizeChat, prepareChat } from "@/lib/chat";
import { screen } from "@/lib/moderation";
import { ensureDailyDrip } from "@/lib/ledger";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DAILY_DRIP = Number(process.env.DAILY_DRIP || 20);

const Body = z.object({
  characterId: z.string().uuid(),
  threadId: z.string().uuid().optional(),
  message: z.string().min(1).max(4000),
  storyId: z.string().uuid().optional(),
  chapter: z.number().int().positive().max(1000).optional(),
});

function sse(obj: unknown) {
  return `data: ${JSON.stringify(obj)}\n\n`;
}

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid request body" }, { status: 400 });
  }

  await ensureDailyDrip(userId, DAILY_DRIP);

  // Pre-flight (charge, safety, prompt) BEFORE opening the stream, so blocked /
  // paywall come back as plain JSON the client handles like the non-stream path.
  let prep;
  try {
    prep = await prepareChat({ userId, characterId: body.characterId, threadId: body.threadId, message: body.message, storyId: body.storyId, chapter: body.chapter });
  } catch (e) {
    console.error("[chat/stream] failed:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "chat failed" }, { status: 500 });
  }
  if (prep.status === "blocked") return NextResponse.json({ error: "blocked", reason: prep.reason }, { status: 422 });
  if (prep.status === "paywall") return NextResponse.json({ error: "out_of_credits", balance: prep.balance }, { status: 402 });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let full = "";
      try {
        for await (const delta of chatStream(prep.msgs, { temperature: 0.9, maxTokens: 600 })) {
          full += delta;
          controller.enqueue(encoder.encode(sse({ delta })));
        }

        let reply = full || "...";
        let replaced = false;
        // Output safety re-check on the completed text (streaming moderation is
        // best-effort; the exec-2 classifier would be streaming-aware).
        if (screen(reply).blocked) {
          reply = "I can't go there - let's talk about something else.";
          replaced = true;
        }

        const { messageId, ...balance } = await finalizeChat({
          userId,
          char: prep.char,
          threadId: prep.threadId,
          userMessage: body.message,
          reply,
          usage: { inputTokens: 0, outputTokens: Math.ceil(full.length / 4) },
          charge: prep.charge,
        });

        controller.enqueue(encoder.encode(sse({ done: true, threadId: prep.threadId, messageId, balance, replace: replaced ? reply : undefined })));
      } catch {
        controller.enqueue(encoder.encode(sse({ error: "chat failed" })));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" },
  });
}
