import { eq } from "drizzle-orm";
import { db } from "@/db";
import { characterLivingPortraits } from "@/db/schema";
import { imageResponse } from "@/lib/media";

export const dynamic = "force-dynamic";

// Video bytes remain private to R2. The browser receives the selected MP4 via
// the same cache-friendly media proxy used for portraits and scene art.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [render] = await db.select({ key: characterLivingPortraits.videoKey, mime: characterLivingPortraits.videoMime, status: characterLivingPortraits.status })
    .from(characterLivingPortraits).where(eq(characterLivingPortraits.id, id)).limit(1);
  if (!render?.key || render.status !== "ready") return new Response("not found", { status: 404 });
  return imageResponse(render.key, render.mime || "video/mp4", "public, max-age=31536000, immutable");
}
