import Stripe from "stripe";

export type Pack = { id: string; credits: number; price: number; label: string; blurb?: string };

// One-time credit packs. `price` is in USD cents. Tune freely; the webhook grants
// `credits` on successful payment. Keep ids stable (used in Stripe metadata).
export const PACKS: Pack[] = [
  { id: "starter", credits: 100, price: 499, label: "100 credits", blurb: "~10 chapters or 100 messages" },
  { id: "plus", credits: 550, price: 1999, label: "550 credits", blurb: "10% bonus" },
  { id: "pro", credits: 1200, price: 3999, label: "1,200 credits", blurb: "best value" },
];

export function paymentsEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function packById(id: string): Pack | undefined {
  return PACKS.find((p) => p.id === id);
}

let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  if (!_stripe) _stripe = new Stripe(key);
  return _stripe;
}
