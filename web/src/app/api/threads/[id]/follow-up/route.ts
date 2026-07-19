import { desc, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { characters, companionFollowUps, messages, threads } from "@/db/schema";
import { getConversationFollowUp } from "@/lib/chatWelcome";
import { characterImageUrl, generateCompanionSelfie, imageConfigured } from "@/lib/image";
import { mediaStorageConfigured, readImageBase64, storeImage } from "@/lib/media";
import { screenImagePrompt } from "@/lib/moderation";
import {
  addCompanionSnapshotToPool,
  findUndeliveredCompanionSnapshot,
  noteRequestedImagePoolUse,
  recordCompanionSnapshotDelivery,
} from "@/lib/requestedImagePool";
import { getCurrentUserId } from "@/lib/session";

const FOLLOW_UP_EVERY_READER_MESSAGES = Math.max(1, Number(process.env.FOLLOW_UP_EVERY_READER_MESSAGES ?? 5));
const FOLLOW_UP_IDLE_MINUTES = Math.max(5, Number(process.env.FOLLOW_UP_IDLE_MINUTES ?? 120));
const FOLLOW_UP_FREE_PHOTO = process.env.FOLLOW_UP_FREE_PHOTO_ENABLED !== "false";

// POST /api/threads/:id/follow-up
// Claims one durable follow-up slot, then appends a free companion nudge. The
// unique slot means duplicate timers, reloads, and multiple tabs stay harmless.
export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const [thread] = await db
    .select({
      id: threads.id,
      characterId: characters.id,
      storyContext: threads.storyContext,
      storyContextChapter: threads.storyContextChapter,
      lastActiveAt: threads.lastActiveAt,
      portraitKey: characters.imageKey,
      definition: characters.definition,
    })
    .from(threads)
    .innerJoin(characters, eq(threads.characterId, characters.id))
    .where(sql`${threads.id} = ${id} and ${threads.userId} = ${userId}`)
    .limit(1);

  if (!thread) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (Date.now() - thread.lastActiveAt.getTime() < FOLLOW_UP_IDLE_MINUTES * 60_000) {
    return NextResponse.json({ ok: false, reason: "conversation_active" });
  }

  const [count] = await db
    .select({ readerMessages: sql<number>`count(*) filter (where ${messages.role} = 'user')::int` })
    .from(messages)
    .where(eq(messages.threadId, id));
  const readerMessages = count?.readerMessages ?? 0;
  if (readerMessages < 1 || (readerMessages - 1) % FOLLOW_UP_EVERY_READER_MESSAGES !== 0) {
    return NextResponse.json({ ok: false, reason: "not_due" });
  }

  const [lastMessage] = await db
    .select({ role: messages.role })
    .from(messages)
    .where(eq(messages.threadId, id))
    .orderBy(desc(messages.createdAt))
    .limit(1);
  if (lastMessage?.role !== "character") return NextResponse.json({ ok: false, reason: "conversation_active" });

  const bucket = Math.floor((readerMessages - 1) / FOLLOW_UP_EVERY_READER_MESSAGES) + 1;
  const claimed = await db
    .insert(companionFollowUps)
    .values({ threadId: id, messageBucket: bucket })
    .onConflictDoNothing()
    .returning({ id: companionFollowUps.id });
  if (!claimed.length) return NextResponse.json({ ok: false, reason: "already_sent" });

  const definition = (thread.definition ?? {}) as {
    name?: string;
    tags?: string[];
    greeting?: string;
    backstory?: string;
    gender?: string;
    look?: string;
    outfit?: string;
    style?: string;
  };
  const content = getConversationFollowUp({
    name: definition.name,
    tags: definition.tags,
    greeting: definition.greeting,
    backstory: definition.backstory,
    storyContext: thread.storyContext,
    storyChapter: thread.storyContextChapter ?? undefined,
    bucket,
  });

  let cachedSnapshot: Awaited<ReturnType<typeof findUndeliveredCompanionSnapshot>> = null;
  if (FOLLOW_UP_FREE_PHOTO) {
    try {
      cachedSnapshot = await findUndeliveredCompanionSnapshot(thread.characterId, userId);
    } catch (error) {
      // A cache miss or a not-yet-applied migration must not prevent the free
      // return message from being delivered.
      console.warn("[follow-up] snapshot pool unavailable:", error instanceof Error ? error.message : error);
    }
  }

  const [message] = await db
    .insert(messages)
    .values({ threadId: id, role: "character", content, tokenCount: 0 })
    .returning({ id: messages.id, content: messages.content, createdAt: messages.createdAt });

  let hasImage = false;
  if (cachedSnapshot) {
    try {
      const delivered = await recordCompanionSnapshotDelivery({ poolImageId: cachedSnapshot.id, userId, messageId: message.id });
      if (delivered) {
        await db.update(messages).set({ imageKey: cachedSnapshot.imageKey, imageMime: cachedSnapshot.imageMime }).where(eq(messages.id, message.id));
        await noteRequestedImagePoolUse(thread.characterId, cachedSnapshot.imageKey);
        hasImage = true;
      }
    } catch (error) {
      console.warn("[follow-up] pooled snapshot unavailable:", error instanceof Error ? error.message : error);
    }
  }

  if (!hasImage && FOLLOW_UP_FREE_PHOTO && thread.portraitKey && imageConfigured() && mediaStorageConfigured() && !screenImagePrompt(content).blocked) {
    try {
      const portrait = await readImageBase64(thread.portraitKey);
      if (portrait) {
        const image = await generateCompanionSelfie(definition, content, portrait, characterImageUrl(thread.characterId));
        if (image.base64.length >= 500) {
          const imageKey = await storeImage({ scope: "requested-pool", ownerId: thread.characterId, base64: image.base64, mime: image.mime });
          await db.update(messages).set({ imageKey, imageMime: image.mime }).where(eq(messages.id, message.id));
          hasImage = true;
          try {
            const snapshot = await addCompanionSnapshotToPool({ characterId: thread.characterId, imageKey, imageMime: image.mime });
            await recordCompanionSnapshotDelivery({ poolImageId: snapshot.id, userId, messageId: message.id });
          } catch (poolError) {
            // The free snapshot is still visible to this reader even if its
            // optional shared-pool bookkeeping is temporarily unavailable.
            console.warn("[follow-up] snapshot pool write failed:", poolError instanceof Error ? poolError.message : poolError);
          }
        }
      }
    } catch (error) {
      console.warn("[follow-up] free snapshot unavailable:", error instanceof Error ? error.message : error);
    }
  }
  await db.update(threads).set({ lastActiveAt: new Date() }).where(eq(threads.id, id));

  return NextResponse.json({ ok: true, message: { ...message, hasImage } });
}
