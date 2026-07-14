import { eq } from "drizzle-orm";
import { db } from "@/db";
import { characters } from "@/db/schema";
import { imageResponse } from "@/lib/media";

export const dynamic = "force-dynamic";

// GET /api/characters/:id/image[?variant=warm|flirty] -> the stored portrait
// bytes (or 404 if none). Falls back to the canonical portrait when a variant
// is requested but that character doesn't have one generated yet.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const variant = new URL(req.url).searchParams.get("variant");

  let row: { imageKey: string | null; mime: string | null; warmKey: string | null; warmMime: string | null; flirtyKey: string | null; flirtyMime: string | null } | undefined;
  try {
    [row] = await db
      .select({
        imageKey: characters.imageKey,
        mime: characters.imageMime,
        warmKey: characters.imageWarmKey,
        warmMime: characters.imageWarmMime,
        flirtyKey: characters.imageFlirtyKey,
        flirtyMime: characters.imageFlirtyMime,
      })
      .from(characters)
      .where(eq(characters.id, id))
      .limit(1);
  } catch {
    return new Response("error", { status: 500 });
  }
  if (!row) return new Response("not found", { status: 404 });

  let imageKey = row.imageKey;
  let mime = row.mime;
  if (variant === "warm" && row.warmKey) { imageKey = row.warmKey; mime = row.warmMime; }
  else if (variant === "flirty" && row.flirtyKey) { imageKey = row.flirtyKey; mime = row.flirtyMime; }

  if (!imageKey) return new Response("not found", { status: 404 });
  return imageResponse(imageKey, mime, "public, max-age=300");
}
