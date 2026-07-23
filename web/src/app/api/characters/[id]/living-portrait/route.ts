import { NextResponse } from "next/server";
import { getActiveLivingPortrait, queueLivingPortrait, refreshLivingPortrait } from "@/lib/livingPortraits";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// GET /api/characters/:id/living-portrait?renderId=...
// The client polls the selected asynchronous Runware task. If no task is
// supplied, this is a compact active-version lookup for the profile surface.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: characterId } = await params;
  const renderId = new URL(request.url).searchParams.get("renderId");
  try {
    if (renderId) {
      const render = await refreshLivingPortrait(renderId);
      if (!render || render.characterId !== characterId) return NextResponse.json({ error: "not found" }, { status: 404 });
      return NextResponse.json({
        id: render.id,
        status: render.status,
        error: render.error,
        isActive: render.isActive,
        videoUrl: render.status === "ready" && render.videoKey ? `/api/living-portraits/${render.id}/video` : null,
      });
    }

    const active = await getActiveLivingPortrait(characterId);
    return NextResponse.json({
      active: active ? { id: active.id, videoUrl: `/api/living-portraits/${active.id}/video` } : null,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to check living portrait" }, { status: 500 });
  }
}

// POST /api/characters/:id/living-portrait
// The first completed user render automatically becomes this companion's live
// portrait. Later variants are intentionally reserved for admin curation.
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Sign in to bring a portrait to life" }, { status: 401 });
  const { id: characterId } = await params;

  try {
    const active = await getActiveLivingPortrait(characterId);
    if (active) return NextResponse.json({ error: "This companion already has a living portrait", activeId: active.id }, { status: 409 });
    const render = await queueLivingPortrait(characterId, userId);
    return NextResponse.json({ id: render.id, status: render.status, pollAfterMs: 3000 }, { status: 202 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to start living portrait" }, { status: 500 });
  }
}
