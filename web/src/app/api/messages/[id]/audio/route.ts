import { eq } from "drizzle-orm";
import { db } from "@/db";
import { messages, threads } from "@/db/schema";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_TTS_CHARS = 2000;

// GET /api/messages/:id/audio -> synthesize a private companion reply through
// Deepgram. We intentionally don't persist audio yet: the client caches it
// for the current visit, avoiding database media growth while keeping each
// conversation private.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) return new Response("unauthorized", { status: 401 });

  const [row] = await db
    .select({ content: messages.content, role: messages.role, ownerId: threads.userId })
    .from(messages)
    .innerJoin(threads, eq(messages.threadId, threads.id))
    .where(eq(messages.id, id))
    .limit(1);
  if (!row || row.ownerId !== userId) return new Response("not found", { status: 404 });
  if (row.role !== "character") return new Response("not a companion reply", { status: 400 });

  const key = process.env.DEEPGRAM_API_KEY?.trim();
  if (!key) return new Response("Deepgram is not configured", { status: 503 });

  const text = row.content.replace(/\s+/g, " ").trim().slice(0, MAX_TTS_CHARS);
  if (!text) return new Response("empty reply", { status: 400 });

  try {
    const upstream = await fetch(`https://api.deepgram.com/v1/speak?model=${encodeURIComponent(process.env.DEEPGRAM_TTS_MODEL?.trim() || "aura-2-thalia-en")}`, {
      method: "POST",
      headers: { Authorization: `Token ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!upstream.ok || !upstream.body) {
      console.error("[tts] Deepgram failed", { status: upstream.status, messageId: id });
      return new Response("speech generation failed", { status: 502 });
    }
    return new Response(upstream.body, {
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "audio/mpeg",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("[tts] Deepgram request failed", error instanceof Error ? error.message : error);
    return new Response("speech generation failed", { status: 502 });
  }
}
