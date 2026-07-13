import Stripe from "stripe";

export type Pack = { id: string; credits: number; price: number; label: string; blurb?: string };

// One-time credit packs only - no subscriptions. `price` is in USD cents. Tune
// freely; the webhook grants `credits` on successful payment. Keep ids stable
// (used in Stripe metadata). Ordered smallest to largest so the per-credit price
// steadily improves - the credits page computes and displays that discount, so
// it's fine to retune these amounts without touching any UI copy.
export const PACKS: Pack[] = [
  { id: "starter", credits: 100, price: 499, label: "100 credits", blurb: "~10 chapters or 100 messages" },
  { id: "popular", credits: 300, price: 1299, label: "300 credits" },
  { id: "plus", credits: 700, price: 2499, label: "700 credits" },
  { id: "mega", credits: 1500, price: 4499, label: "1,500 credits" },
];

export function paymentsEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

// A launch/promo banner for the credits page. DISPLAY ONLY - the actual
// discount is a Stripe Promotion Code with the same code string, applied at
// checkout (we enable the code box on the Checkout Session). Configure via env:
//   PROMO_CODE="LAUNCH50"   PROMO_PERCENT="50"   PROMO_TEXT="Launch offer"
// Leave PROMO_CODE blank to hide the banner entirely.
export type Promo = { code: string; percent: number | null; text: string };
export function promoBanner(): Promo | null {
  const code = (process.env.PROMO_CODE || "").trim();
  if (!code) return null;
  const n = Number(process.env.PROMO_PERCENT);
  return { code, percent: Number.isFinite(n) && n > 0 ? n : null, text: (process.env.PROMO_TEXT || "").trim() };
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
