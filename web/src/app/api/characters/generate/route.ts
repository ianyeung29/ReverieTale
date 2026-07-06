import { NextResponse } from "next/server";
import { z } from "zod";
import { chat } from "@/lib/model";
import { screen } from "@/lib/moderation";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";
export const maxDuration = 45;

const TARGETS = ["look", "voice", "persona", "backstory"] as const;
type Target = (typeof TARGETS)[number];

const Body = z.object({
  name: z.string().max(60).optional(),
  look: z.string().max(400).optional(),
  persona: z.string().max(600).optional(),
  backstory: z.string().max(600).optional(),
  voice: z.string().max(300).optional(),
  tags: z.array(z.string().max(30)).max(8).optional(),
  targets: z.array(z.enum(TARGETS)).min(1).max(4),
});

const SPEC: Record<Target, string> = {
  look: "look = 1-2 sentences on their appearance (hair, eyes, style, the way they carry themselves)",
  voice: "voice = 1 sentence on how they speak (tone, rhythm, verbal habits)",
  persona: "persona = 2-3 sentences on their personality (temperament, quirks, how they treat people)",
  backstory: "backstory = 2-3 sentences of history (where they're from, what they want, what weighs on them)",
};

// POST /api/characters/generate -> AI suggestions for character fields. Tasteful,
// non-explicit; the on-save moderation gate still applies when they publish.
export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid request body" }, { status: 400 });
  }

  const context = [
    body.name ? `Name: ${body.name}` : "",
    body.tags?.length ? `Tags: ${body.tags.join(", ")}` : "",
    body.look ? `Look: ${body.look}` : "",
    body.persona ? `Personality: ${body.persona}` : "",
    body.backstory ? `Backstory: ${body.backstory}` : "",
    body.voice ? `Voice: ${body.voice}` : "",
  ].filter(Boolean).join("\n") || "(no details yet - invent a coherent, appealing character)";

  const wanted = body.targets.map((t) => SPEC[t]).join("\n");
  const system =
    "You design fictional adult (18+) companion characters for a romantic storytelling app. " +
    "Given the details so far, write ONLY the requested fields, staying consistent with what's provided. " +
    "Keep everything vivid but tasteful and strictly NON-EXPLICIT - no sexual or graphic content. " +
    "Return STRICT JSON containing only the requested keys, each a plain string. No markdown, no labels.\n" +
    `Requested fields:\n${wanted}`;

  try {
    const res = await chat(
      [
        { role: "system", content: system },
        { role: "user", content: `Character so far:\n${context}\n\nGenerate: ${body.targets.join(", ")}` },
      ],
      { temperature: 0.9, maxTokens: 500 },
    );
    const json = res.text.match(/\{[\s\S]*\}/)?.[0];
    const parsed = json ? (JSON.parse(json) as Record<string, unknown>) : {};

    const fields: Partial<Record<Target, string>> = {};
    for (const t of body.targets) {
      const v = parsed[t];
      if (typeof v === "string" && v.trim() && !screen(v).blocked) fields[t] = v.trim();
    }
    if (Object.keys(fields).length === 0) return NextResponse.json({ error: "generation failed" }, { status: 502 });
    return NextResponse.json({ fields });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "generation failed" }, { status: 500 });
  }
}
