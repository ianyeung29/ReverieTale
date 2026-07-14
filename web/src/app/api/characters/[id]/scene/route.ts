import { eq } from "drizzle-orm";
import { db } from "@/db";
import { characters } from "@/db/schema";
import { imageResponse } from "@/lib/media";

export const dynamic = "force-dynamic";

// GET /api/characters/:id/scene -> the character's wide scene-art bytes (the
// companion in their world), or 404 if none. Public, like the portrait.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let row: { imageKey: string | null; mime: string | null } | undefined;
  try {
    [row] = await db
      .select({ imageKey: characters.sceneImageKey, mime: characters.sceneImageMime })
      .from(characters)
      .where(eq(characters.id, id))
      .limit(1);
  } catch {
    // scene columns not migrated yet
    return new Response("not found", { status: 404 });
  }
  if (!row?.imageKey) return new Response("not found", { status: 404 });
  return imageResponse(row.imageKey, row.mime, "public, max-age=300");
}
