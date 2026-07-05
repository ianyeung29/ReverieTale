import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { ensureDailyDrip, grantPurchase, userBalance } from "@/lib/ledger";

const DAILY_DRIP = Number(process.env.DAILY_DRIP || 50);

export const dynamic = "force-dynamic";

// Resolves the same dev user the chat route uses (no auth yet in Phase 0).
async function devUserId(): Promise<string | null> {
  const [u] = await db.select({ id: users.id }).from(users).where(eq(users.email, "dev@local.test")).limit(1);
  return u?.id ?? null;
}

// GET /api/credits -> current balance for the dev user.
export async function GET() {
  const userId = await devUserId();
  if (!userId) return NextResponse.json({ balance: { purchased: 0, earned: 0, total: 0 } });
  await ensureDailyDrip(userId, DAILY_DRIP); // reflect today's free drip in the shown balance
  return NextResponse.json({ balance: await userBalance(userId) });
}

// POST /api/credits { credits } -> DEV-ONLY top-up (simulates a purchase).
// Replace with a real payment webhook (Stripe/Segpay) before launch.
const Body = z.object({ credits: z.number().int().positive().max(100000) });

export async function POST(req: Request) {
  const userId = await devUserId();
  if (!userId) return NextResponse.json({ error: "no dev user - send a chat message first" }, { status: 400 });
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid body: { credits: number }" }, { status: 400 });
  }
  await grantPurchase(userId, body.credits, `devtopup:${Date.now()}`);
  return NextResponse.json({ balance: await userBalance(userId) });
}
