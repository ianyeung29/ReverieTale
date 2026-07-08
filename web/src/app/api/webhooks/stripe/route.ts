import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/payments";
import { grantPurchase } from "@/lib/ledger";

export const dynamic = "force-dynamic";

// POST /api/webhooks/stripe -> the ONLY place credits are granted for a purchase.
// Verifies the Stripe signature, then grants idempotently (keyed on the session id,
// so a redelivered event can't double-credit). Configure the endpoint in Stripe and
// set STRIPE_WEBHOOK_SECRET.
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "webhook not configured" }, { status: 501 });

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "missing signature" }, { status: 400 });

  const raw = await req.text(); // raw body required for signature verification
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(raw, sig, secret);
  } catch {
    return NextResponse.json({ error: "signature verification failed" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id || session.metadata?.userId;
    const credits = Number(session.metadata?.credits || 0);

    if (userId && credits > 0 && session.payment_status === "paid") {
      try {
        await grantPurchase(userId, credits, `stripe:${session.id}`);
      } catch (e) {
        // Postgres wraps the actual driver error under `.cause` - checking only
        // the top-level `.code` misses it (same bug class as lib/db-errors.ts).
        const err = e as { code?: string; message?: string; cause?: { code?: string } };
        const code = err?.cause?.code ?? err?.code;
        // Duplicate idempotency key => already granted for this session; that's fine.
        if (!(code === "23505" || /duplicate|unique/i.test(String(err?.message)))) {
          return NextResponse.json({ error: "grant failed" }, { status: 500 });
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
