import { NextResponse } from "next/server";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { generateImage, imageConfigured } from "@/lib/image";
import { screen } from "@/lib/moderation";
import { spend, userBalance } from "@/lib/ledger";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const FREE_PORTRAITS = Number(process.env.FREE_PORTRAITS || 2);
const PORTRAIT_PRICE = Number(process.env.PORTRAIT_PRICE || 5);

const Body = z.object({
  name: z.string().max(60).optional(),
  age: z.number().int().min(18).max(120).optional(),
  outfit: z.string().max(200).optional(),
  look: z.string().max(400).optional(),
  persona: z.string().max(600).optional(),
  tags: z.array(z.string().max(30)).max(8).optional(),
});

function buildPrompt(b: z.infer<typeof Body>): string {
  const subject = b.age ? `${b.age}-year-old adult ${b.name || "person"}` : b.name || "a person";
  const bits = [b.look, b.persona].filter(Boolean).join(". ");
  const outfit = b.outfit ? ` Wearing ${b.outfit}.` : "";
  const tags = b.tags?.length ? ` ${b.tags.join(", ")}.` : "";
  return (
    `Character portrait of ${subject}` +
    (bits ? `, ${bits}` : "") +
    `.${outfit}${tags} Upper-body portrait, looking at the viewer, soft cinematic lighting, detailed, high quality, tasteful, safe for work.`
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

  const blob = [body.name, body.outfit, body.look, body.persona, ...(body.tags ?? [])].filter(Boolean).join(" ");
  if (screen(blob).blocked) return NextResponse.json({ error: "blocked", reason: "safety_minor" }, { status: 422 });

  // Metering: the first FREE_PORTRAITS generations are free; then PORTRAIT_PRICE each.
  const [u] = await db.select({ gens: users.portraitGens }).from(users).where(eq(users.id, userId)).limit(1);
  const used = u?.gens ?? 0;
  const isFree = used < FREE_PORTRAITS;
  if (!isFree) {
    const bal = await userBalance(userId);
    if (bal.total < PORTRAIT_PRICE) {
      return NextResponse.json({ error: "insufficient_credits", price: PORTRAIT_PRICE, balance: bal }, { status: 402 });
    }
  }

  let base64: string, mime: string;
  try {
    ({ base64, mime } = await generateImage(buildPrompt(body)));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "generation failed";
    console.error("[portrait] generation failed:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  // Charge (if beyond the free allowance) only after a successful generation.
  let balance;
  if (!isFree) {
    const charge = await spend(userId, PORTRAIT_PRICE, { kind: "portrait" });
    if (!charge.ok) return NextResponse.json({ error: "insufficient_credits", price: PORTRAIT_PRICE, balance: charge.balance }, { status: 402 });
    balance = charge.balance;
  }
  await db.update(users).set({ portraitGens: sql`${users.portraitGens} + 1` }).where(eq(users.id, userId));

  const freeRemaining = Math.max(0, FREE_PORTRAITS - (used + 1));
  return NextResponse.json({ image: base64, mime, charged: isFree ? 0 : PORTRAIT_PRICE, freeRemaining, price: PORTRAIT_PRICE, balance });
}
