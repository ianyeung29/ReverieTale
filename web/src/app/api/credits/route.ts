import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureDailyDrip, grantPurchase, userBalance } from "@/lib/ledger";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

const DAILY_DRIP = Number(process.env.DAILY_DRIP || 20);

// GET /api/credits -> current balance for the logged-in user.
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  await ensureDailyDrip(userId, DAILY_DRIP);
  return NextResponse.json({ balance: await userBalance(userId) });
}

// POST /api/credits { credits } -> DEV-ONLY top-up (simulates a purchase).
// Replace with a real payment webhook (Stripe/Segpay) before launch.
const Body = z.object({ credits: z.number().int().positive().max(100000) });

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid body: { credits: number }" }, { status: 400 });
  }
  await grantPurchase(userId, body.credits, `devtopup:${userId}:${Date.now()}`);
  return NextResponse.json({ balance: await userBalance(userId) });
}
