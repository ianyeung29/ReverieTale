import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { characters } from "@/db/schema";
import { screen } from "@/lib/moderation";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db
    .select({ id: characters.id, definition: characters.definition })
    .from(characters)
    .where(eq(characters.status, "published"));

  const list = rows.map((r) => {
    const def = (r.definition ?? {}) as Record<string, unknown>;
    return {
      id: r.id,
      name: (def.name as string) ?? "Unknown",
      tagline: (def.backstory as string) ?? "",
      persona: (def.persona as string) ?? "",
      tags: Array.isArray(def.tags) ? (def.tags as string[]) : [],
    };
  });
  return NextResponse.json(list);
}

// POST /api/characters -> a signed-in user publishes their own companion. The
// creatorId is what makes reader chats with this character earn the creator their
// revenue share, so it's set from the session (never trusted from the body).
const Body = z.object({
  name: z.string().trim().min(1).max(60),
  persona: z.string().trim().max(600).optional(),
  look: z.string().trim().max(400).optional(),
  backstory: z.string().trim().max(600).optional(),
  voice: z.string().trim().max(300).optional(),
  tags: z.array(z.string().trim().min(1).max(30)).max(8).optional(),
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

  // Safety gate on every free-text field the creator supplied.
  const blob = [body.name, body.persona, body.look, body.backstory, body.voice, ...(body.tags ?? [])].filter(Boolean).join(" ");
  if (screen(blob).blocked) {
    return NextResponse.json({ error: "blocked", reason: "safety_minor" }, { status: 422 });
  }

  const definition = {
    name: body.name,
    persona: body.persona ?? "",
    look: body.look ?? "",
    backstory: body.backstory ?? "",
    voice: body.voice ?? "",
    tags: body.tags ?? [],
  };

  const [char] = await db
    .insert(characters)
    .values({ creatorId: userId, status: "published", definition })
    .returning({ id: characters.id });

  return NextResponse.json({ id: char.id, name: body.name });
}
