import { eq } from "drizzle-orm";
import { db } from "@/db";
import { characters } from "@/db/schema";

export const dynamic = "force-dynamic";

// GET /api/characters/:id/scene -> the character's wide scene-art bytes (the
// companion in their world), or 404 if none. Public, like the portrait.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let row: { image: string | null; mime: string | null } | undefined;
  try {
    [row] = await db
      .select({ image: characters.sceneImage, mime: characters.sceneImageMime })
      .from(characters)
      .where(eq(characters.id, id))
      .limit(1);
  } catch {
    // scene columns not migrated yet
    return new Response("not found", { status: 404 });
  }
  if (!row?.image) return new Response("not found", { status: 404 });

  const buf = Buffer.from(row.image, "base64");
  return new Response(buf, {
    headers: { "Content-Type": row.mime || "image/jpeg", "Cache-Control": "public, max-age=300" },
  });
}
