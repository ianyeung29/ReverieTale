import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { characters, messages, threads } from "@/db/schema";
import { characterImageUrl, generateRequestedPrivatePhoto, imageConfigured } from "@/lib/image";
import { screenImagePrompt } from "@/lib/moderation";
import {
  addRequestedImageToPool,
  findRequestedImagePoolMatch,
  noteRequestedImagePoolUse,
  poolableRequestedMoment,
} from "@/lib/requestedImagePool";
import { getCurrentUserId } from "@/lib/session";
import { mediaStorageConfigured, readImageBase64, storeImage } from "@/lib/media";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// POST /api/messages/:id/request-private-photo starts a safe, requested
// companion snapshot. It remains locked until the reader chooses to reveal it.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const [message] = await db
    .select({
      role: messages.role,
      content: messages.content,
      imageKey: messages.imageKey,
      imageLocked: messages.imageLocked,
      imagePrice: messages.imagePrice,
      threadId: messages.threadId,
      characterId: threads.characterId,
      ownerId: threads.userId,
    })
    .from(messages)
    .innerJoin(threads, eq(messages.threadId, threads.id))
    .where(eq(messages.id, id))
    .limit(1);

  if (!message || message.ownerId !== userId) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (message.role !== "character" || !message.imageLocked) return NextResponse.json({ error: "not a pending private photo" }, { status: 400 });
  if (message.imageKey) return NextResponse.json({ ok: true, ready: true, price: message.imagePrice });
  if (!imageConfigured() || !mediaStorageConfigured()) return NextResponse.json({ error: "image generation or R2 storage is not configured" }, { status: 503 });

  try {
    // Only generic, safe requests may be reused. A request involving the reader
    // stays private and is generated without adding it to the shared asset pool.
    const [latestReaderRequest] = await db
      .select({ content: messages.content })
      .from(messages)
      .where(and(eq(messages.threadId, message.threadId), eq(messages.role, "user")))
      .orderBy(desc(messages.createdAt))
      .limit(1);
    const rawRequest = latestReaderRequest?.content ?? "";
    if (rawRequest && screenImagePrompt(rawRequest).blocked) {
      return NextResponse.json({ error: "This photo request needs a safer, age-appropriate description." }, { status: 422 });
    }
    const requestedMoment = rawRequest ? poolableRequestedMoment(rawRequest) : null;

    if (requestedMoment) {
      const cached = await findRequestedImagePoolMatch(message.characterId, requestedMoment);
      if (cached) {
        await db.update(messages).set({ imageKey: cached.imageKey, imageMime: cached.imageMime }).where(eq(messages.id, id));
        await noteRequestedImagePoolUse(message.characterId, cached.imageKey);
        return NextResponse.json({ ok: true, ready: true, reused: true, price: message.imagePrice });
      }
    }

    const [character] = await db
      .select({ definition: characters.definition, portraitKey: characters.imageKey })
      .from(characters)
      .where(eq(characters.id, message.characterId))
      .limit(1);
    if (!character?.portraitKey) return NextResponse.json({ error: "companion portrait is unavailable" }, { status: 409 });

    const portraitBase64 = await readImageBase64(character.portraitKey);
    if (!portraitBase64) return NextResponse.json({ error: "companion portrait is unavailable" }, { status: 409 });

    const image = await generateRequestedPrivatePhoto(
      (character.definition ?? {}) as Record<string, string>,
      message.content,
      portraitBase64,
      characterImageUrl(message.characterId),
      requestedMoment ?? undefined,
    );
    if (!image.base64 || image.base64.length < 500) throw new Error("provider returned an empty photo");

    const imageKey = await storeImage({
      scope: requestedMoment ? "requested-pool" : "messages",
      ownerId: requestedMoment ? message.characterId : id,
      base64: image.base64,
      mime: image.mime,
    });
    await db.update(messages).set({ imageKey, imageMime: image.mime }).where(eq(messages.id, id));
    if (requestedMoment) {
      try {
        await addRequestedImageToPool({
          characterId: message.characterId,
          requestedMoment,
          imageKey,
          imageMime: image.mime,
        });
      } catch (poolError) {
        // The reader's image is already ready; cache failures should not turn a
        // completed generation into an error or leak a request to another user.
        console.warn("[request-private-photo] pool insert failed", poolError instanceof Error ? poolError.message : poolError);
      }
    }
    return NextResponse.json({ ok: true, ready: true, reused: false, price: message.imagePrice });
  } catch (error) {
    console.error("[request-private-photo] failed", { messageId: id, error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: "private photo generation failed" }, { status: 500 });
  }
}
