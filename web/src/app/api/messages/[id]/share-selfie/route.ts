import { NextResponse } from "next/server";
import { and, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { characters, messages, threads } from "@/db/schema";
import { characterImageUrl, generateCompanionSelfie, imageConfigured } from "@/lib/image";
import { screenImagePrompt } from "@/lib/moderation";
import { getCurrentUserId } from "@/lib/session";
import { mediaStorageConfigured, readImageBase64, storeImage } from "@/lib/media";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// A small cadence creates anticipation without turning the conversation into an
// image feed. Operators can tune it without a deploy.
const SHARE_INTERVAL = Math.max(4, Number(process.env.COMPANION_SELFIE_INTERVAL || 6));

// POST /api/messages/:id/share-selfie -> a free, occasional, private companion
// snapshot. The client calls this after every reply; the server owns cadence.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const [message] = await db
    .select({
      role: messages.role,
      content: messages.content,
      imageKey: messages.imageKey,
      threadId: messages.threadId,
      characterId: threads.characterId,
      ownerId: threads.userId,
    })
    .from(messages)
    .innerJoin(threads, eq(messages.threadId, threads.id))
    .where(eq(messages.id, id))
    .limit(1);

  if (!message) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (message.ownerId !== userId) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (message.role !== "character") return NextResponse.json({ error: "can only share a companion reply" }, { status: 400 });
  if (message.imageKey) return NextResponse.json({ ok: true, shared: true });

  const [usage] = await db
    .select({ total: count() })
    .from(messages)
    .where(and(eq(messages.threadId, message.threadId), eq(messages.role, "user")));
  if (!usage?.total || usage.total % SHARE_INTERVAL !== 0) return NextResponse.json({ ok: true, shared: false });

  if (!imageConfigured() || !mediaStorageConfigured()) return NextResponse.json({ error: "image generation or R2 storage is not configured" }, { status: 503 });
  if (screenImagePrompt(message.content).blocked) return NextResponse.json({ ok: true, shared: false });

  try {
    const [character] = await db
      .select({ definition: characters.definition, portraitKey: characters.imageKey })
      .from(characters)
      .where(eq(characters.id, message.characterId))
      .limit(1);
    if (!character?.portraitKey) return NextResponse.json({ ok: true, shared: false });

    const portraitBase64 = await readImageBase64(character.portraitKey);
    if (!portraitBase64) return NextResponse.json({ ok: true, shared: false });

    const definition = (character.definition ?? {}) as Record<string, string>;
    const image = await generateCompanionSelfie(
      definition,
      message.content,
      portraitBase64,
      characterImageUrl(message.characterId),
    );
    if (!image.base64 || image.base64.length < 500) throw new Error("provider returned an empty selfie");

    const imageKey = await storeImage({ scope: "messages", ownerId: id, base64: image.base64, mime: image.mime });
    await db.update(messages).set({ imageKey, imageMime: image.mime }).where(eq(messages.id, id));
    return NextResponse.json({ ok: true, shared: true });
  } catch (error) {
    console.error("[share-selfie] failed", { messageId: id, error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: "selfie generation failed" }, { status: 500 });
  }
}
