import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { characters, stories } from "@/db/schema";
import { generateStory } from "@/lib/story";
import { screen } from "@/lib/moderation";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const Body = z.object({
  characterId: z.string().uuid(),
  setting: z.string().max(200).optional(),
  tone: z.string().max(60).optional(),
  scenario: z.string().max(120).optional(),
});

export async function POST(req: Request) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid request body" }, { status: 400 });
  }

  // Input safety gate on user-supplied elements.
  if (screen(`${body.setting ?? ""} ${body.tone ?? ""} ${body.scenario ?? ""}`).blocked) {
    return NextResponse.json({ error: "blocked", reason: "safety_minor" }, { status: 422 });
  }

  try {
    const [char] = await db.select().from(characters).where(eq(characters.id, body.characterId)).limit(1);
    if (!char) return NextResponse.json({ error: "character not found" }, { status: 404 });

    const def = (char.definition ?? {}) as Record<string, string>;
    const { title, content } = await generateStory(def, { setting: body.setting, tone: body.tone, scenario: body.scenario });

    // Output safety gate.
    if (screen(`${title} ${content}`).blocked) {
      return NextResponse.json({ error: "blocked", reason: "safety_minor" }, { status: 422 });
    }

    const [story] = await db
      .insert(stories)
      .values({
        characterId: char.id,
        userId: await getCurrentUserId(), // nullable - story is a public front-door
        title,
        content,
        elements: { setting: body.setting ?? null, tone: body.tone ?? null, scenario: body.scenario ?? null },
      })
      .returning({ id: stories.id });

    return NextResponse.json({ storyId: story.id, title, content });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "story generation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
