import { NextResponse } from "next/server";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { characters, users } from "@/db/schema";
import { buildPortraitPrompt, generateImage, imageConfigured } from "@/lib/image";
import { screenImagePrompt } from "@/lib/moderation";
import { spend, userBalance } from "@/lib/ledger";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";
export const maxDuration = 120; // ModelsLab async generation can take a while

// Anti-spam pool for pre-save (new-character) generations; a saved character's
// first portrait is free and regens cost PORTRAIT_PRICE (metered per character).
const FREE_PORTRAITS = Number(process.env.FREE_PORTRAITS || 2);
const PORTRAIT_PRICE = Number(process.env.PORTRAIT_PRICE || 5);

const Body = z.object({
  characterId: z.string().uuid().optional(), // present when regenerating a saved character
  name: z.string().max(60).optional(),
  gender: z.string().max(30).optional(),
  age: z.number().int().min(18).max(120).optional(),
  outfit: z.string().max(200).optional(),
  look: z.string().max(400).optional(),
  persona: z.string().max(600).optional(),
  tags: z.array(z.string().max(30)).max(8).optional(),
  style: z.enum(["realistic", "anime"]).optional(),
});

// POST /api/characters/portrait -> a generated portrait (base64) for the current
// draft. The client holds it and submits it with create/edit. SFW; our own image
// gate (screenImagePrompt) rejects disallowed prompts before we spend a provider
// credit, and the provider's safety checker still applies as a backstop.
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

  // Our own gatekeeper: reject disallowed prompts up front, before any metering
  // or a (paid) provider call, so we don't burn image credits on a generation the
  // provider would only black out. Screens the full prompt, not just raw inputs.
  const prompt = buildPortraitPrompt(body);
  const gate = screenImagePrompt(prompt);
  if (gate.blocked) return NextResponse.json({ error: "blocked", reason: gate.reason }, { status: 422 });

  // Metering. Regenerating a SAVED character (characterId): its first portrait is
  // free, then PORTRAIT_PRICE each. Creating a NEW character (no id): drawn from a
  // small per-user free pool so pre-save previews can't be spammed for free.
  let isFree: boolean;
  let userUsed = 0;
  if (body.characterId) {
    const [c] = await db.select({ creatorId: characters.creatorId, gens: characters.portraitGens }).from(characters).where(eq(characters.id, body.characterId)).limit(1);
    if (!c) return NextResponse.json({ error: "not found" }, { status: 404 });
    if (c.creatorId !== userId) return NextResponse.json({ error: "forbidden" }, { status: 403 });
    isFree = (c.gens ?? 0) < 1;
  } else {
    const [u] = await db.select({ gens: users.portraitGens }).from(users).where(eq(users.id, userId)).limit(1);
    userUsed = u?.gens ?? 0;
    isFree = userUsed < FREE_PORTRAITS;
  }

  if (!isFree) {
    const bal = await userBalance(userId);
    if (bal.total < PORTRAIT_PRICE) {
      return NextResponse.json({ error: "insufficient_credits", price: PORTRAIT_PRICE, balance: bal }, { status: 402 });
    }
  }

  let base64: string, mime: string;
  try {
    ({ base64, mime } = await generateImage(prompt));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "generation failed";
    console.error("[portrait] generation failed:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  // Charge only after a successful generation.
  let balance;
  if (!isFree) {
    const charge = await spend(userId, PORTRAIT_PRICE, { kind: "portrait", characterId: body.characterId });
    if (!charge.ok) return NextResponse.json({ error: "insufficient_credits", price: PORTRAIT_PRICE, balance: charge.balance }, { status: 402 });
    balance = charge.balance;
  }

  if (body.characterId) {
    await db.update(characters).set({ portraitGens: sql`${characters.portraitGens} + 1` }).where(eq(characters.id, body.characterId));
  } else {
    await db.update(users).set({ portraitGens: sql`${users.portraitGens} + 1` }).where(eq(users.id, userId));
  }

  const freeRemaining = body.characterId ? 0 : Math.max(0, FREE_PORTRAITS - (userUsed + 1));
  return NextResponse.json({ image: base64, mime, charged: isFree ? 0 : PORTRAIT_PRICE, freeRemaining, price: PORTRAIT_PRICE, balance });
}
