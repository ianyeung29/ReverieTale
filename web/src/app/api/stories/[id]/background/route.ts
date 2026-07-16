import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { stories } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { buildScenePrompt, generateImage } from "@/lib/image";
import { imageResponse, mediaStorageConfigured, storeImage } from "@/lib/media";
import { screenImagePrompt } from "@/lib/moderation";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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

// POST /api/stories/:id/background -> regenerate ambient reader art. Story
// owners and admins can do this from the reader; the asset is replaced only
// after ModelsLab succeeds and R2 accepts the new image.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!mediaStorageConfigured()) return NextResponse.json({ error: "Cloudflare R2 storage is not configured" }, { status: 503 });

  const [row] = await db
    .select({ id: stories.id, ownerId: stories.userId, title: stories.title, content: stories.content, elements: stories.elements })
    .from(stories)
    .where(eq(stories.id, id))
    .limit(1);
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (row.ownerId !== userId && !(await isAdmin(userId))) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const elements = (row.elements ?? {}) as Record<string, string>;
  const prompt = buildScenePrompt({
    setting: elements.setting || elements.scenario || `an atmospheric environment inspired by ${row.title}: ${row.content.slice(0, 500)}`,
    genre: elements.genre,
    tone: elements.tone,
    scenario: elements.scenario,
  });
  if (screenImagePrompt(prompt).blocked) return NextResponse.json({ error: "blocked", reason: "safety" }, { status: 422 });

  try {
    const image = await generateImage(prompt);
    const imageKey = await storeImage({ scope: "stories", ownerId: row.id, base64: image.base64, mime: image.mime });
    await db.update(stories).set({ imageKey, imageMime: image.mime }).where(eq(stories.id, row.id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "generation failed" }, { status: 500 });
  }
}
