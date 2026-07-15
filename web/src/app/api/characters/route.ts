import { NextResponse, after } from "next/server";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { characters, stories } from "@/db/schema";
import { blockedCharacterIds } from "@/lib/blocks";
import { logUnlessMissingRelation } from "@/lib/db-errors";
import { buildPortraitPrompt, generateImage, imageConfigured } from "@/lib/image";
import { moderateContent, screenImagePrompt } from "@/lib/moderation";
import { ratingAggregates } from "@/lib/ratings";
import { getCurrentUserId } from "@/lib/session";
import { mediaStorageConfigured, storeImage } from "@/lib/media";
import { isTtsSpeed, isTtsVoice } from "@/lib/tts";

export const dynamic = "force-dynamic";
export const maxDuration = 120; // may auto-generate a default portrait on create

export async function GET() {
  const rows = await db
    .select({ id: characters.id, definition: characters.definition, createdAt: characters.createdAt })
    .from(characters)
    .where(eq(characters.status, "published"));

  // Per-character engagement from public stories: total reads + story count.
  const agg = await db
    .select({
      cid: stories.characterId,
      reads: sql<number>`coalesce(sum(${stories.reads}), 0)::int`,
      stories: sql<number>`count(*)::int`,
    })
    .from(stories)
    .where(eq(stories.isPublic, true))
    .groupBy(stories.characterId);
  const byChar = new Map(agg.map((a) => [a.cid, a]));
  const ratingByChar = await ratingAggregates("character", rows.map((r) => r.id));

  // Personal blocks are optional (migration 0012) and only apply when signed in;
  // never let a missing table or anonymous browsing break this list.
  let blocked = new Set<string>();
  const viewerId = await getCurrentUserId();
  if (viewerId) {
    try {
      blocked = new Set(await blockedCharacterIds(viewerId));
    } catch (e) {
      logUnlessMissingRelation("characters GET (browse)", e);
    }
  }

  const list = rows.filter((r) => !blocked.has(r.id)).map((r) => {
    const def = (r.definition ?? {}) as Record<string, unknown>;
    const a = byChar.get(r.id);
    const rating = ratingByChar.get(r.id) ?? { average: 0, count: 0 };
    return {
      id: r.id,
      name: (def.name as string) ?? "Unknown",
      tagline: (def.backstory as string) ?? "",
      persona: (def.persona as string) ?? "",
      tags: Array.isArray(def.tags) ? (def.tags as string[]) : [],
      greeting: (def.greeting as string) ?? "",
      reads: a?.reads ?? 0,
      stories: a?.stories ?? 0,
      rating: rating.average,
      ratingCount: rating.count,
      createdAt: r.createdAt,
    };
  });
  return NextResponse.json(list);
}

// POST /api/characters -> a signed-in user publishes their own companion. The
// creatorId is what makes reader chats with this character earn the creator their
// revenue share, so it's set from the session (never trusted from the body).
const Body = z.object({
  name: z.string().trim().min(1).max(60),
  gender: z.string().trim().min(1).max(30), // required: female | male | non-binary | …
  age: z.number().int().min(18).max(120), // characters must be adults
  persona: z.string().trim().max(600).optional(),
  look: z.string().trim().max(400).optional(),
  backstory: z.string().trim().max(600).optional(),
  voice: z.string().trim().max(300).optional(),
  ttsVoice: z.string().trim().max(80).optional(),
  ttsSpeed: z.number().nullable().optional(),
  greeting: z.string().trim().max(300).optional(), // their first line, shown on cards/profile/chat
  tags: z.array(z.string().trim().min(1).max(30)).max(8).optional(),
  style: z.enum(["realistic", "anime"]).optional(), // art style for portrait + all scene images
  image: z.string().max(12_000_000).optional(), // base64 portrait
  imageMime: z.string().max(60).optional(),
});

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid request body" }, { status: 400 });
  }
  if (body.ttsVoice && !isTtsVoice(body.ttsVoice)) return NextResponse.json({ error: "invalid narration voice" }, { status: 400 });
  if (body.ttsSpeed !== undefined && body.ttsSpeed !== null && !isTtsSpeed(body.ttsSpeed)) return NextResponse.json({ error: "invalid narration delivery" }, { status: 400 });

  // Hybrid pre-publish gate: hard filter -> classifier -> auto-approve / hold /
  // reject. Creators never publish directly; only auto-approve or an admin does.
  const blob = [body.name, body.persona, body.look, body.backstory, body.voice, body.greeting, ...(body.tags ?? [])].filter(Boolean).join(" ");
  const mod = await moderateContent(blob);
  if (mod.decision === "reject") {
    return NextResponse.json({ error: "blocked", reason: mod.reason }, { status: 422 });
  }
  const status = mod.decision === "approve" ? "published" : "in_review";

  const definition = {
    name: body.name,
    gender: body.gender,
    age: body.age,
    persona: body.persona ?? "",
    look: body.look ?? "",
    backstory: body.backstory ?? "",
    voice: body.voice ?? "",
    ttsVoice: body.ttsVoice ?? "",
    ttsSpeed: body.ttsSpeed ?? null,
    greeting: body.greeting ?? "",
    tags: body.tags ?? [],
    style: body.style ?? "realistic",
  };

  const [char] = await db
    .insert(characters)
    .values({
      creatorId: userId,
      status,
      reviewNote: mod.reason,
      definition,
      portraitGens: body.image ? 1 : 0,
    })
    .returning({ id: characters.id });

  // A client preview is uploaded first. Generated defaults run in the background
  // the user can proceed. after() keeps the request alive past the response; the
  // row is updated when the image lands (best-effort — the character exists either
  // way, and the user can regenerate from the edit page if it never arrives).
  if (body.image && mediaStorageConfigured()) {
    try {
      const imageKey = await storeImage({ scope: "characters", ownerId: char.id, base64: body.image, mime: body.imageMime ?? "image/jpeg" });
      await db.update(characters).set({ imageKey, imageMime: body.imageMime ?? "image/jpeg" }).where(eq(characters.id, char.id));
    } catch (e) {
      console.error("[characters] portrait upload failed:", e instanceof Error ? e.message : e);
    }
  }

  if (!body.image && imageConfigured() && mediaStorageConfigured()) {
    const prompt = buildPortraitPrompt({ name: body.name, gender: body.gender, age: body.age, look: body.look, persona: body.persona, tags: body.tags, style: body.style });
    if (!screenImagePrompt(prompt).blocked) {
      after(async () => {
        try {
          const gen = await generateImage(prompt);
          const imageKey = await storeImage({ scope: "characters", ownerId: char.id, base64: gen.base64, mime: gen.mime });
          await db.update(characters).set({ imageKey, imageMime: gen.mime, portraitGens: 1 }).where(eq(characters.id, char.id));
        } catch (e) {
          console.error("[characters] background portrait failed:", e instanceof Error ? e.message : e);
        }
      });
    }
  }

  return NextResponse.json({ id: char.id, name: body.name, status });
}
