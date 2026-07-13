import { NextResponse } from "next/server";
import { z } from "zod";
import { chat } from "@/lib/model";
import { screen } from "@/lib/moderation";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";
export const maxDuration = 45;

// POST /api/characters/preview -> a one-off in-character reply from an UNSAVED
// character definition, so creators can hear the voice before publishing.
const Body = z.object({
  name: z.string().max(60).optional(),
  look: z.string().max(400).optional(),
  persona: z.string().max(600).optional(),
  backstory: z.string().max(600).optional(),
  voice: z.string().max(300).optional(),
  message: z.string().max(500).optional(),
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

  const message = (body.message?.trim() || "Hi — it's nice to finally meet you.").slice(0, 500);
  if (screen(message).blocked) return NextResponse.json({ error: "blocked", reason: "safety_minor" }, { status: 422 });

  // Same system-prompt shape as live chat, minus memory (this is a stateless preview).
  const system = [
    `You are ${body.name || "a companion"}, an AI character. Stay fully in character.`,
    body.persona ? `Personality: ${body.persona}` : "",
    body.look ? `Appearance: ${body.look}` : "",
    body.backstory ? `Backstory: ${body.backstory}` : "",
    body.voice ? `Voice and style: ${body.voice}` : "",
    "Keep it tasteful and non-explicit. You are an AI companion, not a real person; if asked directly, don't claim to be human.",
  ].filter(Boolean).join("\n");

  try {
    const res = await chat(
      [
        { role: "system", content: system },
        { role: "user", content: message },
      ],
      { temperature: 0.9, maxTokens: 220 },
    );
    let reply = res.text?.trim() || "…";
    if (screen(reply).blocked) reply = "(that reply was filtered — try adjusting the personality)";
    return NextResponse.json({ reply, message });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "preview failed" }, { status: 500 });
  }
}
