import { desc, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { characters, companionFollowUps, messages, threads } from "@/db/schema";
import { getConversationFollowUp } from "@/lib/chatWelcome";
import { getCurrentUserId } from "@/lib/session";

const FOLLOW_UP_EVERY_READER_MESSAGES = Math.max(1, Number(process.env.FOLLOW_UP_EVERY_READER_MESSAGES ?? 5));

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
      storyContext: threads.storyContext,
      storyContextChapter: threads.storyContextChapter,
      definition: characters.definition,
    })
    .from(threads)
    .innerJoin(characters, eq(threads.characterId, characters.id))
    .where(sql`${threads.id} = ${id} and ${threads.userId} = ${userId}`)
    .limit(1);

  if (!thread) return NextResponse.json({ error: "not found" }, { status: 404 });

  const [count] = await db
    .select({ readerMessages: sql<number>`count(*) filter (where ${messages.role} = 'user')::int` })
    .from(messages)
    .where(eq(messages.threadId, id));
  const readerMessages = count?.readerMessages ?? 0;
  if (readerMessages < FOLLOW_UP_EVERY_READER_MESSAGES || readerMessages % FOLLOW_UP_EVERY_READER_MESSAGES !== 0) {
    return NextResponse.json({ ok: false, reason: "not_due" });
  }

  const [lastMessage] = await db
    .select({ role: messages.role })
    .from(messages)
    .where(eq(messages.threadId, id))
    .orderBy(desc(messages.createdAt))
    .limit(1);
  if (lastMessage?.role !== "character") return NextResponse.json({ ok: false, reason: "conversation_active" });

  const bucket = Math.floor(readerMessages / FOLLOW_UP_EVERY_READER_MESSAGES);
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
  const [message] = await db.insert(messages).values({ threadId: id, role: "character", content, tokenCount: 0 }).returning({ id: messages.id, content: messages.content });
  await db.update(threads).set({ lastActiveAt: new Date() }).where(eq(threads.id, id));

  return NextResponse.json({ ok: true, message });
}
