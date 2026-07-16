import { NextResponse } from "next/server";
import { z } from "zod";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { characters, moments, stories, threads } from "@/db/schema";
import { moderateContent } from "@/lib/moderation";
import { logUnlessMissingRelation } from "@/lib/db-errors";
import { getCurrentUserId } from "@/lib/session";
import { storeImage } from "@/lib/media";
import { isTtsLanguage, isTtsStyle, isTtsVoice } from "@/lib/tts";

export const dynamic = "force-dynamic";

// Gender is intentionally NOT here: it's set at creation and immutable thereafter.
const FIELDS = ["name", "look", "persona", "backstory", "voice", "ttsVoice", "ttsLanguage", "ttsStyle", "greeting", "tags"] as const;

// GET /api/characters/:id -> owner-only detail for editing.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const [row] = await db
    .select({ creatorId: characters.creatorId, definition: characters.definition, status: characters.status })
    .from(characters)
    .where(eq(characters.id, id))
    .limit(1);
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (row.creatorId !== userId) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  // Image keys are optional while a new portrait is still generating.
  let hasImage = false;
  try {
    const [img] = await db.select({ h: sql<boolean>`(${characters.imageKey} is not null)` }).from(characters).where(eq(characters.id, id)).limit(1);
    hasImage = Boolean(img?.h);
  } catch {
    /* image column not migrated yet */
  }

  const def = (row.definition ?? {}) as Record<string, unknown>;
  return NextResponse.json({
    id,
    status: row.status,
    hasImage,
    name: (def.name as string) ?? "",
    gender: (def.gender as string) ?? "",
    look: (def.look as string) ?? "",
    persona: (def.persona as string) ?? "",
    backstory: (def.backstory as string) ?? "",
    voice: (def.voice as string) ?? "",
    ttsVoice: (def.ttsVoice as string) ?? "",
    ttsLanguage: (def.ttsLanguage as string) ?? "en",
    ttsStyle: (def.ttsStyle as string) ?? "",
    greeting: (def.greeting as string) ?? "",
    tags: Array.isArray(def.tags) ? (def.tags as string[]) : [],
    age: typeof def.age === "number" ? def.age : null,
    style: def.style === "anime" ? "anime" : "realistic",
  });
}

// PATCH /api/characters/:id -> owner-only edit of the definition and/or status
// (published <-> disabled). creatorId is never editable.
const Patch = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  // gender is immutable after creation; any value sent here is ignored (stripped).
  age: z.number().int().min(18).max(120).optional(),
  look: z.string().trim().max(400).optional(),
  persona: z.string().trim().max(600).optional(),
  backstory: z.string().trim().max(600).optional(),
  voice: z.string().trim().max(300).optional(),
  ttsVoice: z.string().trim().max(80).optional(),
  ttsLanguage: z.string().trim().max(8).optional(),
  ttsStyle: z.string().trim().max(30).optional(),
  greeting: z.string().trim().max(300).optional(),
  tags: z.array(z.string().trim().min(1).max(30)).max(8).optional(),
  style: z.enum(["realistic", "anime"]).optional(),
  status: z.enum(["published", "disabled"]).optional(),
  image: z.string().max(12_000_000).optional(),
  imageMime: z.string().max(60).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: z.infer<typeof Patch>;
  try {
    body = Patch.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid request body" }, { status: 400 });
  }
  if (body.ttsVoice && !isTtsVoice(body.ttsVoice)) return NextResponse.json({ error: "invalid narration voice" }, { status: 400 });
  if (body.ttsLanguage && !isTtsLanguage(body.ttsLanguage)) return NextResponse.json({ error: "invalid companion language" }, { status: 400 });
  if (body.ttsStyle && !isTtsStyle(body.ttsStyle)) return NextResponse.json({ error: "invalid narration style" }, { status: 400 });

  const [row] = await db
    .select({ creatorId: characters.creatorId, definition: characters.definition })
    .from(characters)
    .where(eq(characters.id, id))
    .limit(1);
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (row.creatorId !== userId) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const editsDefinition = FIELDS.some((k) => body[k] !== undefined) || body.age !== undefined;
  const image = body.image !== undefined
    ? { imageKey: await storeImage({ scope: "characters", ownerId: id, base64: body.image, mime: body.imageMime ?? "image/jpeg" }), imageMime: body.imageMime ?? "image/jpeg" }
    : {};

  // Unpublish is the one status change a creator can make directly and freely.
  if (!editsDefinition && body.status === "disabled") {
    await db.update(characters).set({ status: "disabled", updatedAt: new Date(), ...image }).where(eq(characters.id, id));
    return NextResponse.json({ ok: true, status: "disabled" });
  }

  // A portrait-only and/or style change (no text edit) doesn't need re-moderation
  // - style is a benign rendering attribute, not publishable content.
  if (!editsDefinition && body.status === undefined && (body.image !== undefined || body.style !== undefined)) {
    const set: Record<string, unknown> = { ...image, updatedAt: new Date() };
    if (body.style !== undefined) {
      const def2 = { ...((row.definition ?? {}) as Record<string, unknown>), style: body.style };
      set.definition = def2;
    }
    await db.update(characters).set(set).where(eq(characters.id, id));
    return NextResponse.json({ ok: true });
  }

  // Anything else that would make content public (an edit, or a resubmit via
  // status:"published") must pass the hybrid gate again. Creators can't self-publish.
  const def = { ...((row.definition ?? {}) as Record<string, unknown>) };
  for (const k of FIELDS) if (body[k] !== undefined) def[k] = body[k];
  if (body.age !== undefined) def.age = body.age;
  if (body.style !== undefined) def.style = body.style;

  const blob = [def.name, def.look, def.persona, def.backstory, def.voice, def.greeting, ...(Array.isArray(def.tags) ? def.tags : [])]
    .filter(Boolean)
    .join(" ");
  const mod = await moderateContent(String(blob));
  if (mod.decision === "reject") {
    return NextResponse.json({ error: "blocked", reason: mod.reason }, { status: 422 });
  }
  const status = mod.decision === "approve" ? "published" : "in_review";

  await db.update(characters).set({ definition: def, status, reviewNote: mod.reason, updatedAt: new Date(), ...image }).where(eq(characters.id, id));
  return NextResponse.json({ ok: true, status });
}

// DELETE /api/characters/:id -> owner-only. A true removal, but guarded: if the
// character has been USED (has stories, chats, or saved moments - possibly by
// other readers), a hard delete would orphan or destroy their content, so we
// hide it instead (status "disabled") and report deleted:false. Only a
// never-used character is actually removed from the table.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const [row] = await db.select({ creatorId: characters.creatorId }).from(characters).where(eq(characters.id, id)).limit(1);
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (row.creatorId !== userId) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  // Any dependent activity means we hide instead of delete. Each probe is
  // wrapped so a not-yet-migrated table (e.g. moments) never blocks removal.
  const used = async (fn: () => Promise<boolean>) => { try { return await fn(); } catch (e) { logUnlessMissingRelation("characters/:id delete usage probe", e); return false; } };
  const hasStory = await used(async () => Boolean((await db.select({ id: stories.id }).from(stories).where(eq(stories.characterId, id)).limit(1))[0]));
  const hasThread = await used(async () => Boolean((await db.select({ id: threads.id }).from(threads).where(eq(threads.characterId, id)).limit(1))[0]));
  const hasMoment = await used(async () => Boolean((await db.select({ id: moments.id }).from(moments).where(eq(moments.characterId, id)).limit(1))[0]));

  if (hasStory || hasThread || hasMoment) {
    await db.update(characters).set({ status: "disabled", updatedAt: new Date() }).where(and(eq(characters.id, id), eq(characters.creatorId, userId)));
    return NextResponse.json({ ok: true, deleted: false, hidden: true });
  }

  await db.delete(characters).where(and(eq(characters.id, id), eq(characters.creatorId, userId)));
  return NextResponse.json({ ok: true, deleted: true });
}
