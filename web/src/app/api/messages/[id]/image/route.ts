import { eq } from "drizzle-orm";
import { db } from "@/db";
import { messages, threads } from "@/db/schema";
import { getCurrentUserId } from "@/lib/session";
import { imageResponse } from "@/lib/media";

export const dynamic = "force-dynamic";

// GET /api/messages/:id/image -> the "visualized" scene image cached on a
// character reply, if one was generated. Owner only (chat history is private).
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) return new Response("unauthorized", { status: 401 });

  const [row] = await db
    .select({ imageKey: messages.imageKey, mime: messages.imageMime, imageLocked: messages.imageLocked, ownerId: threads.userId })
    .from(messages)
    .innerJoin(threads, eq(messages.threadId, threads.id))
    .where(eq(messages.id, id))
    .limit(1);
  if (!row || row.ownerId !== userId) return new Response("not found", { status: 404 });
  if (row.imageLocked) return Response.json({ error: "photo_locked" }, { status: 423 });
  if (!row.imageKey) return new Response("not found", { status: 404 });
  return imageResponse(row.imageKey, row.mime, "private, max-age=300");
}
