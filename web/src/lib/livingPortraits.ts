import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { characterLivingPortraits, characters } from "@/db/schema";
import { characterImageUrl } from "@/lib/image";
import { storeMedia } from "@/lib/media";

const RUNWARE_URL = (process.env.RUNWARE_API_URL || "https://api.runware.ai/v1").replace(/\/$/, "");
const MODEL = "prunaai:p-video@0";

type RunwareVideoResult = {
  taskUUID?: string;
  status?: string;
  progress?: number;
  videoURL?: string;
  videoDataURI?: string;
  videoBase64Data?: string;
  message?: string;
};

type RunwareResponse = {
  data?: RunwareVideoResult[];
  errors?: unknown;
  error?: unknown;
};

export type LivingPortrait = typeof characterLivingPortraits.$inferSelect;

function runwareError(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "message" in value && typeof value.message === "string") return value.message;
  try { return JSON.stringify(value); } catch { return "Runware did not return a usable response"; }
}

async function runware(tasks: Record<string, unknown>[]): Promise<RunwareResponse> {
  const key = process.env.RUNWARE_API_KEY?.trim();
  if (!key) throw new Error("RUNWARE_API_KEY is not set");

  const response = await fetch(RUNWARE_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(tasks),
  });
  if (!response.ok) throw new Error(`Runware ${response.status}: ${(await response.text().catch(() => "")).slice(0, 300)}`);
  return response.json() as Promise<RunwareResponse>;
}

function motionPrompt(): string {
  return [
    "A silent, natural five-second living portrait.",
    "Keep the supplied companion exactly the same person, art style, outfit, framing, and background.",
    "Use only subtle believable movement: a soft blink, a small breath, a gentle shift of posture, and a faint warm expression.",
    "No speech, no lip-sync, no new props, no camera movement, no cut, no scene change, no text or watermark.",
  ].join(" ");
}

export async function listLivingPortraits(characterId: string): Promise<LivingPortrait[]> {
  return db.select().from(characterLivingPortraits)
    .where(eq(characterLivingPortraits.characterId, characterId))
    .orderBy(desc(characterLivingPortraits.createdAt));
}

export async function getActiveLivingPortrait(characterId: string): Promise<LivingPortrait | null> {
  const [row] = await db.select().from(characterLivingPortraits)
    .where(and(eq(characterLivingPortraits.characterId, characterId), eq(characterLivingPortraits.isActive, true), eq(characterLivingPortraits.status, "ready")))
    .limit(1);
  return row ?? null;
}

export async function queueLivingPortrait(characterId: string, createdByUserId: string | null): Promise<LivingPortrait> {
  const [character] = await db.select({ id: characters.id, imageKey: characters.imageKey, status: characters.status })
    .from(characters).where(eq(characters.id, characterId)).limit(1);
  if (!character) throw new Error("Companion not found");
  if (character.status !== "published") throw new Error("This companion is not available yet");
  if (!character.imageKey) throw new Error("Generate the companion portrait first");

  const [inFlight] = await db.select({ id: characterLivingPortraits.id }).from(characterLivingPortraits)
    .where(and(eq(characterLivingPortraits.characterId, characterId), eq(characterLivingPortraits.status, "processing")))
    .orderBy(desc(characterLivingPortraits.createdAt)).limit(1);
  if (inFlight) throw new Error("A living portrait is already being prepared. Check back in a moment.");

  const sourceUrl = characterImageUrl(characterId);
  if (!sourceUrl) throw new Error("Set APP_URL or PUBLIC_IMAGE_BASE to the public site URL before creating living portraits");

  const taskUUID = crypto.randomUUID();
  const [render] = await db.insert(characterLivingPortraits).values({
    characterId,
    sourceImageKey: character.imageKey,
    providerTaskUuid: taskUUID,
    createdByUserId,
  }).returning();

  try {
    await runware([{
      taskType: "videoInference",
      taskUUID,
      model: MODEL,
      positivePrompt: motionPrompt(),
      inputs: { frameImages: [{ image: sourceUrl, frame: "first" }] },
      resolution: "720p",
      duration: 5,
      fps: 24,
      numberResults: 1,
      outputType: "URL",
      outputFormat: "MP4",
      deliveryMethod: "async",
      settings: { audio: false, draft: true, promptUpsampling: true },
      safety: { checkContent: true, mode: "fast" },
    }]);
    return render;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to start Runware video render";
    await db.update(characterLivingPortraits).set({ status: "failed", error: message }).where(eq(characterLivingPortraits.id, render.id));
    throw error;
  }
}

async function activateIfFirst(render: LivingPortrait): Promise<boolean> {
  const active = await getActiveLivingPortrait(render.characterId);
  if (active) return false;
  try {
    await db.update(characterLivingPortraits).set({ isActive: true }).where(eq(characterLivingPortraits.id, render.id));
    return true;
  } catch {
    // The partial unique index resolves a rare race between two people who
    // render the same previously-static portrait at the same time.
    return false;
  }
}

export async function refreshLivingPortrait(renderId: string): Promise<LivingPortrait | null> {
  const [render] = await db.select().from(characterLivingPortraits).where(eq(characterLivingPortraits.id, renderId)).limit(1);
  if (!render || render.status !== "processing") return render ?? null;

  let response: RunwareResponse;
  try {
    response = await runware([{ taskType: "getResponse", taskUUID: render.providerTaskUuid }]);
  } catch (error) {
    // A temporary provider/network failure should not discard a queued render.
    console.error("[living-portrait] polling failed:", error instanceof Error ? error.message : error);
    return render;
  }

  const failure = Array.isArray(response.errors) ? response.errors[0] : response.error;
  if (failure) {
    const message = runwareError(failure).slice(0, 500);
    const [failed] = await db.update(characterLivingPortraits).set({ status: "failed", error: message, completedAt: new Date() })
      .where(eq(characterLivingPortraits.id, render.id)).returning();
    return failed ?? null;
  }

  const result = response.data?.find((item) => item.taskUUID === render.providerTaskUuid) ?? response.data?.[0];
  const url = result?.videoURL;
  if (!url || result?.status !== "success") return render;

  try {
    const videoResponse = await fetch(url);
    if (!videoResponse.ok) throw new Error(`Runware video download ${videoResponse.status}`);
    const bytes = new Uint8Array(await videoResponse.arrayBuffer());
    const mime = videoResponse.headers.get("content-type")?.split(";")[0]?.trim() || "video/mp4";
    const videoKey = await storeMedia({ scope: "living-portraits", ownerId: render.characterId, bytes, mime });
    const [ready] = await db.update(characterLivingPortraits).set({
      videoKey,
      videoMime: mime,
      status: "ready",
      error: null,
      completedAt: new Date(),
    }).where(eq(characterLivingPortraits.id, render.id)).returning();
    if (!ready) return null;
    const isActive = await activateIfFirst(ready);
    return isActive ? { ...ready, isActive: true } : ready;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to store living portrait";
    const [failed] = await db.update(characterLivingPortraits).set({ status: "failed", error: message, completedAt: new Date() })
      .where(eq(characterLivingPortraits.id, render.id)).returning();
    return failed ?? null;
  }
}

export async function activateLivingPortrait(characterId: string, renderId: string): Promise<LivingPortrait> {
  const [render] = await db.select().from(characterLivingPortraits)
    .where(and(eq(characterLivingPortraits.id, renderId), eq(characterLivingPortraits.characterId, characterId), eq(characterLivingPortraits.status, "ready")))
    .limit(1);
  if (!render) throw new Error("That living portrait is not ready");

  await db.transaction(async (tx) => {
    await tx.update(characterLivingPortraits).set({ isActive: false }).where(eq(characterLivingPortraits.characterId, characterId));
    await tx.update(characterLivingPortraits).set({ isActive: true }).where(eq(characterLivingPortraits.id, renderId));
  });
  return { ...render, isActive: true };
}
