import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { chapterScenes } from "@/db/schema";

export const dynamic = "force-dynamic";

// GET /api/stories/:id/chapter-image?chapter=N -> the generated scene image for
// chapter N (0-based) of this story, or 404 if none. Public (stories are a
// public front door).
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const chapter = Number(new URL(req.url).searchParams.get("chapter") ?? "0");
  if (!Number.isInteger(chapter) || chapter < 0) return new Response("bad request", { status: 400 });

  let row: { image: string; mime: string | null } | undefined;
  try {
    [row] = await db
      .select({ image: chapterScenes.image, mime: chapterScenes.imageMime })
      .from(chapterScenes)
      .where(and(eq(chapterScenes.storyId, id), eq(chapterScenes.chapterIndex, chapter)))
      .limit(1);
  } catch {
    return new Response("not found", { status: 404 });
  }
  if (!row?.image) return new Response("not found", { status: 404 });

  const buf = Buffer.from(row.image, "base64");
  return new Response(buf, {
    headers: { "Content-Type": row.mime || "image/jpeg", "Cache-Control": "public, max-age=300" },
  });
}
