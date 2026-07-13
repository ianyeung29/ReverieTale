import { eq } from "drizzle-orm";
import { db } from "@/db";
import { messages, threads } from "@/db/schema";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

// GET /api/messages/:id/image -> the "visualized" scene image cached on a
// character reply, if one was generated. Owner only (chat history is private).
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) return new Response("unauthorized", { status: 401 });

  const [row] = await db
    .select({ image: messages.imageBase64, mime: messages.imageMime, ownerId: threads.userId })
    .from(messages)
    .innerJoin(threads, eq(messages.threadId, threads.id))
    .where(eq(messages.id, id))
    .limit(1);
  if (!row || row.ownerId !== userId) return new Response("not found", { status: 404 });
  if (!row.image) return new Response("not found", { status: 404 });

  const buf = Buffer.from(row.image, "base64");
  return new Response(buf, {
    headers: { "Content-Type": row.mime || "image/jpeg", "Cache-Control": "private, max-age=300" },
  });
}
