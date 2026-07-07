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

// The model sometimes returns a synonym key (e.g. "personality" for persona);
// accept those so a field isn't silently dropped.
const ALIASES: Record<Target, string[]> = {
  look: ["look", "appearance", "looks"],
  voice: ["voice", "voice_and_style", "voice & style", "voicestyle", "style"],
  persona: ["persona", "personality", "personality_traits"],
  backstory: ["backstory", "background", "history", "back_story"],
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
    `Use exactly these JSON keys: ${body.targets.join(", ")}.\n` +
    `Requested fields:\n${wanted}`;

  try {
    const res = await chat(
      [
        { role: "system", content: system },
        { role: "user", content: `Character so far:\n${context}\n\nGenerate: ${body.targets.join(", ")}` },
      ],
      { temperature: 0.9, maxTokens: 500 },
    );
    let parsed: Record<string, unknown> = {};
    try {
      const json = res.text.match(/\{[\s\S]*\}/)?.[0];
      if (json) parsed = JSON.parse(json) as Record<string, unknown>;
    } catch {
      /* fall through - handled below via the single-field fallback */
    }

    // Case-insensitive lookup so key casing/synonyms don't drop a field.
    const lower: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(parsed)) lower[k.toLowerCase()] = v;
    const stringValues = Object.values(lower).filter((v): v is string => typeof v === "string" && v.trim().length > 0);

    const fields: Partial<Record<Target, string>> = {};
    for (const t of body.targets) {
      const key = ALIASES[t].find((a) => typeof lower[a] === "string" && (lower[a] as string).trim());
      let v = key ? (lower[key] as string) : undefined;
      // Single-field request with an unexpected key -> take the only value present,
      // or, if JSON didn't parse, the raw text itself. Keeps one-field Suggest robust.
      if (!v && body.targets.length === 1) v = stringValues.length === 1 ? stringValues[0] : res.text.trim() || undefined;
      if (v && !screen(v).blocked) fields[t] = v.trim().slice(0, 600);
    }
    if (Object.keys(fields).length === 0) {
      console.error("[generate] no usable fields for", body.targets, "raw:", res.text.slice(0, 300));
      return NextResponse.json({ error: "generation failed" }, { status: 502 });
    }
    return NextResponse.json({ fields });
  } catch (e) {
    console.error("[generate] failed:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "generation failed" }, { status: 500 });
  }
}
