import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { characters } from "@/db/schema";
import { screen } from "@/lib/moderation";
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

  const def = (row.definition ?? {}) as Record<string, unknown>;
  return NextResponse.json({
    id,
    status: row.status,
    name: (def.name as string) ?? "",
    look: (def.look as string) ?? "",
    persona: (def.persona as string) ?? "",
    backstory: (def.backstory as string) ?? "",
    voice: (def.voice as string) ?? "",
    tags: Array.isArray(def.tags) ? (def.tags as string[]) : [],
  });
}

// PATCH /api/characters/:id -> owner-only edit of the definition and/or status
// (published <-> disabled). creatorId is never editable.
const Patch = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  look: z.string().trim().max(400).optional(),
  persona: z.string().trim().max(600).optional(),
  backstory: z.string().trim().max(600).optional(),
  voice: z.string().trim().max(300).optional(),
  tags: z.array(z.string().trim().min(1).max(30)).max(8).optional(),
  status: z.enum(["published", "disabled"]).optional(),
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

  // Merge only the provided definition fields onto the existing definition.
  const def = { ...((row.definition ?? {}) as Record<string, unknown>) };
  for (const k of FIELDS) if (body[k] !== undefined) def[k] = body[k];

  const blob = [def.name, def.look, def.persona, def.backstory, def.voice, ...(Array.isArray(def.tags) ? def.tags : [])]
    .filter(Boolean)
    .join(" ");
  if (screen(String(blob)).blocked) {
    return NextResponse.json({ error: "blocked", reason: "safety_minor" }, { status: 422 });
  }

  const set: { definition: unknown; updatedAt: Date; status?: string } = { definition: def, updatedAt: new Date() };
  if (body.status) set.status = body.status;
  await db.update(characters).set(set).where(eq(characters.id, id));

  return NextResponse.json({ ok: true });
}
