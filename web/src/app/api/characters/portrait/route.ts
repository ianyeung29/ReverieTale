import { NextResponse } from "next/server";
import { z } from "zod";
import { generateImage, imageConfigured } from "@/lib/image";
import { screen } from "@/lib/moderation";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const Body = z.object({
  name: z.string().max(60).optional(),
  look: z.string().max(400).optional(),
  persona: z.string().max(600).optional(),
  tags: z.array(z.string().max(30)).max(8).optional(),
});

function buildPrompt(b: z.infer<typeof Body>): string {
  const bits = [b.look, b.persona].filter(Boolean).join(". ");
  const tags = b.tags?.length ? b.tags.join(", ") : "";
  return (
    `Character portrait of ${b.name || "a person"}` +
    (bits ? `, ${bits}` : "") +
    (tags ? `. ${tags}` : "") +
    ". Upper-body portrait, looking at the viewer, soft cinematic lighting, detailed, high quality, tasteful, safe for work."
  );
}

// POST /api/characters/portrait -> a generated portrait (base64) for the current
// draft. The client holds it and submits it with create/edit. SFW; the provider's
// safety checker + the minor-safety screen apply.
export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!imageConfigured()) return NextResponse.json({ error: "image generation not configured" }, { status: 501 });

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid request body" }, { status: 400 });
  }

  const blob = [body.name, body.look, body.persona, ...(body.tags ?? [])].filter(Boolean).join(" ");
  if (screen(blob).blocked) return NextResponse.json({ error: "blocked", reason: "safety_minor" }, { status: 422 });

  try {
    const { base64, mime } = await generateImage(buildPrompt(body));
    return NextResponse.json({ image: base64, mime });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "generation failed" }, { status: 500 });
  }
}
