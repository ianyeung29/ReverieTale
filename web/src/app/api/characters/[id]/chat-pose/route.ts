import { eq } from "drizzle-orm";
import { db } from "@/db";
import { characters } from "@/db/schema";
import { imageResponse } from "@/lib/media";

export const dynamic = "force-dynamic";

// GET /api/characters/:id/chat-pose -> transparent full/upper-body chat art.
// There is intentionally no portrait fallback: this asset has a different job.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let row: { imageKey: string | null; mime: string | null } | undefined;
  try {
    [row] = await db
      .select({ imageKey: characters.chatPoseImageKey, mime: characters.chatPoseImageMime })
      .from(characters)
      .where(eq(characters.id, id))
      .limit(1);
  } catch {
    return new Response("not found", { status: 404 });
  }
  if (!row?.imageKey) return new Response("not found", { status: 404 });
  return imageResponse(row.imageKey, row.mime, "public, max-age=300");
}
