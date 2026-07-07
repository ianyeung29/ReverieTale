import { NextResponse } from "next/server";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { characters } from "@/db/schema";
import { moderateContent } from "@/lib/moderation";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

const FIELDS = ["name", "look", "persona", "backstory", "voice", "tags"] as const;

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

  // Image columns are optional (migration 0006). Check separately so a missing
  // column never breaks loading the character for editing.
  let hasImage = false;
  try {
    const [img] = await db.select({ h: sql<boolean>`(${characters.image} is not null)` }).from(characters).where(eq(characters.id, id)).limit(1);
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
    look: (def.look as string) ?? "",
    persona: (def.persona as string) ?? "",
    backstory: (def.backstory as string) ?? "",
    voice: (def.voice as string) ?? "",
    tags: Array.isArray(def.tags) ? (def.tags as string[]) : [],
    age: typeof def.age === "number" ? def.age : null,
  });
}

// PATCH /api/characters/:id -> owner-only edit of the definition and/or status
// (published <-> disabled). creatorId is never editable.
const Patch = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  age: z.number().int().min(18).max(120).optional(),
  look: z.string().trim().max(400).optional(),
  persona: z.string().trim().max(600).optional(),
  backstory: z.string().trim().max(600).optional(),
  voice: z.string().trim().max(300).optional(),
  tags: z.array(z.string().trim().min(1).max(30)).max(8).optional(),
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

  const [row] = await db
    .select({ creatorId: characters.creatorId, definition: characters.definition })
    .from(characters)
    .where(eq(characters.id, id))
    .limit(1);
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (row.creatorId !== userId) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const editsDefinition = FIELDS.some((k) => body[k] !== undefined) || body.age !== undefined;
  const image = body.image !== undefined ? { image: body.image, imageMime: body.imageMime ?? null } : {};

  // Unpublish is the one status change a creator can make directly and freely.
  if (!editsDefinition && body.status === "disabled") {
    await db.update(characters).set({ status: "disabled", updatedAt: new Date(), ...image }).where(eq(characters.id, id));
    return NextResponse.json({ ok: true, status: "disabled" });
  }

  // A portrait-only change (no text edit) doesn't need re-moderation.
  if (!editsDefinition && body.status === undefined && body.image !== undefined) {
    await db.update(characters).set({ ...image, updatedAt: new Date() }).where(eq(characters.id, id));
    return NextResponse.json({ ok: true });
  }

  // Anything else that would make content public (an edit, or a resubmit via
  // status:"published") must pass the hybrid gate again. Creators can't self-publish.
  const def = { ...((row.definition ?? {}) as Record<string, unknown>) };
  for (const k of FIELDS) if (body[k] !== undefined) def[k] = body[k];
  if (body.age !== undefined) def.age = body.age;

  const blob = [def.name, def.look, def.persona, def.backstory, def.voice, ...(Array.isArray(def.tags) ? def.tags : [])]
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
