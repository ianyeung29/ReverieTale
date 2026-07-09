import { eq } from "drizzle-orm";
import { db } from "@/db";
import { characters } from "@/db/schema";

export const dynamic = "force-dynamic";

// GET /api/characters/:id/image[?variant=warm|flirty] -> the stored portrait
// bytes (or 404 if none). Falls back to the canonical portrait when a variant
// is requested but that character doesn't have one generated yet.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const variant = new URL(req.url).searchParams.get("variant");

  let row: { image: string | null; mime: string | null; warm: string | null; warmMime: string | null; flirty: string | null; flirtyMime: string | null } | undefined;
  try {
    [row] = await db
      .select({
        image: characters.image,
        mime: characters.imageMime,
        warm: characters.imageWarm,
        warmMime: characters.imageWarmMime,
        flirty: characters.imageFlirty,
        flirtyMime: characters.imageFlirtyMime,
      })
      .from(characters)
      .where(eq(characters.id, id))
      .limit(1);
  } catch {
    return new Response("error", { status: 500 });
  }
  if (!row) return new Response("not found", { status: 404 });

  let image = row.image;
  let mime = row.mime;
  if (variant === "warm" && row.warm) { image = row.warm; mime = row.warmMime; }
  else if (variant === "flirty" && row.flirty) { image = row.flirty; mime = row.flirtyMime; }

  if (!image) return new Response("not found", { status: 404 });

  const buf = Buffer.from(image, "base64");
  return new Response(buf, {
    headers: {
      "Content-Type": mime || "image/jpeg",
      "Cache-Control": "public, max-age=300",
    },
  });
}
