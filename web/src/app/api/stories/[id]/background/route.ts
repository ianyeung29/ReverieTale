import { eq } from "drizzle-orm";
import { db } from "@/db";
import { stories } from "@/db/schema";
import { imageResponse } from "@/lib/media";

export const dynamic = "force-dynamic";

// GET /api/stories/:id/background -> the stored ambient scene bytes (or 404 if none).
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let row: { imageKey: string | null; mime: string | null } | undefined;
  try {
    [row] = await db
      .select({ imageKey: stories.imageKey, mime: stories.imageMime })
      .from(stories)
      .where(eq(stories.id, id))
      .limit(1);
  } catch {
    return new Response("error", { status: 500 });
  }
  if (!row?.imageKey) return new Response("not found", { status: 404 });
  return imageResponse(row.imageKey, row.mime, "public, max-age=300");
}
