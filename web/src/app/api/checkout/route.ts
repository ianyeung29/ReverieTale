import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe, packById, PACKS, paymentsEnabled } from "@/lib/payments";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

// GET /api/checkout -> whether payments are on + the public pack list (for the UI).
export async function GET() {
  return NextResponse.json({ enabled: paymentsEnabled(), packs: PACKS });
}

// POST /api/checkout { packId } -> a Stripe-hosted Checkout URL to redirect to.
const Body = z.object({ packId: z.string() });

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!paymentsEnabled()) return NextResponse.json({ error: "payments not configured" }, { status: 501 });

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid request body" }, { status: 400 });
  }
  const pack = packById(body.packId);
  if (!pack) return NextResponse.json({ error: "unknown pack" }, { status: 400 });

  const appUrl = (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `Reverie — ${pack.label}` },
            unit_amount: pack.price,
          },
          quantity: 1,
        },
      ],
      client_reference_id: userId,
      // The webhook is the source of truth; it reads these to grant credits.
      metadata: { userId, credits: String(pack.credits), packId: pack.id },
      success_url: `${appUrl}/credits?checkout=success`,
      cancel_url: `${appUrl}/credits?checkout=cancel`,
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "checkout failed" }, { status: 500 });
  }
}
