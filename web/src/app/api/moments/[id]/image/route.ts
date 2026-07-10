import { eq } from "drizzle-orm";
import { db } from "@/db";
import { moments } from "@/db/schema";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

// GET /api/moments/:id/image -> the saved moment's image bytes. Owner only.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) return new Response("unauthorized", { status: 401 });

  const [row] = await db.select({ image: moments.image, mime: moments.imageMime, userId: moments.userId }).from(moments).where(eq(moments.id, id)).limit(1);
  if (!row || row.userId !== userId || !row.image) return new Response("not found", { status: 404 });

  const buf = Buffer.from(row.image, "base64");
  return new Response(buf, {
    headers: { "Content-Type": row.mime || "image/jpeg", "Cache-Control": "private, max-age=300" },
  });
}
