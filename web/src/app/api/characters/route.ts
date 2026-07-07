import { NextResponse } from "next/server";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { characters, stories } from "@/db/schema";
import { moderateContent } from "@/lib/moderation";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

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

  const list = rows.map((r) => {
    const def = (r.definition ?? {}) as Record<string, unknown>;
    const a = byChar.get(r.id);
    return {
      id: r.id,
      name: (def.name as string) ?? "Unknown",
      tagline: (def.backstory as string) ?? "",
      persona: (def.persona as string) ?? "",
      tags: Array.isArray(def.tags) ? (def.tags as string[]) : [],
      reads: a?.reads ?? 0,
      stories: a?.stories ?? 0,
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
  age: z.number().int().min(18).max(120), // characters must be adults
  persona: z.string().trim().max(600).optional(),
  look: z.string().trim().max(400).optional(),
  backstory: z.string().trim().max(600).optional(),
  voice: z.string().trim().max(300).optional(),
  tags: z.array(z.string().trim().min(1).max(30)).max(8).optional(),
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

  // Hybrid pre-publish gate: hard filter -> classifier -> auto-approve / hold /
  // reject. Creators never publish directly; only auto-approve or an admin does.
  const blob = [body.name, body.persona, body.look, body.backstory, body.voice, ...(body.tags ?? [])].filter(Boolean).join(" ");
  const mod = await moderateContent(blob);
  if (mod.decision === "reject") {
    return NextResponse.json({ error: "blocked", reason: mod.reason }, { status: 422 });
  }
  const status = mod.decision === "approve" ? "published" : "in_review";

  const definition = {
    name: body.name,
    age: body.age,
    persona: body.persona ?? "",
    look: body.look ?? "",
    backstory: body.backstory ?? "",
    voice: body.voice ?? "",
    tags: body.tags ?? [],
  };

  const [char] = await db
    .insert(characters)
    .values({
      creatorId: userId,
      status,
      reviewNote: mod.reason,
      definition,
      // Only touch image columns when a portrait was actually attached, so the
      // core create flow works even if migration 0006 hasn't been applied.
      // portraitGens=1 marks the free default as used, so edit-page regens are paid.
      ...(body.image ? { image: body.image, imageMime: body.imageMime ?? null, portraitGens: 1 } : {}),
    })
    .returning({ id: characters.id });

  return NextResponse.json({ id: char.id, name: body.name, status });
}
