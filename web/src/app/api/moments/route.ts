import { NextResponse } from "next/server";
import { z } from "zod";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { characters, messages, moments, threads } from "@/db/schema";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

const Body = z.object({ messageId: z.string().uuid() });

// POST /api/moments -> save a character reply (and its visualized image, if
// any) to the reader's private "shared moments" gallery.
export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid request body" }, { status: 400 });
  }

  const [row] = await db
    .select({
      role: messages.role,
      content: messages.content,
      image: messages.imageBase64,
      imageMime: messages.imageMime,
      threadId: messages.threadId,
      ownerId: threads.userId,
      characterId: threads.characterId,
      storyContext: threads.storyContext,
    })
    .from(messages)
    .innerJoin(threads, eq(messages.threadId, threads.id))
    .where(eq(messages.id, body.messageId))
    .limit(1);
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (row.ownerId !== userId) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (row.role !== "character") return NextResponse.json({ error: "can only save a character reply" }, { status: 400 });

  const [saved] = await db
    .insert(moments)
    .values({
      userId,
      characterId: row.characterId,
      threadId: row.threadId,
      messageId: body.messageId,
      dialogue: row.content,
      setting: row.storyContext ? row.storyContext.slice(0, 200) : null,
      image: row.image,
      imageMime: row.imageMime,
    })
    .returning({ id: moments.id });

  return NextResponse.json({ ok: true, id: saved.id });
}

// GET /api/moments -> the reader's saved moments, newest first.
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json([]);

  const rows = await db
    .select({
      id: moments.id,
      characterId: moments.characterId,
      name: sql<string>`${characters.definition}->>'name'`,
      dialogue: moments.dialogue,
      setting: moments.setting,
      hasImage: sql<boolean>`(${moments.image} is not null)`,
      createdAt: moments.createdAt,
    })
    .from(moments)
    .innerJoin(characters, eq(moments.characterId, characters.id))
    .where(eq(moments.userId, userId))
    .orderBy(desc(moments.createdAt))
    .limit(100);

  return NextResponse.json(rows);
}
