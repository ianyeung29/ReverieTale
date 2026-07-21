import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { googleAuthUrl, googleConfigured } from "@/lib/google";
import { COMPANION_GENDER_OPTIONS, type CompanionGender } from "@/lib/gender";

export const dynamic = "force-dynamic";

const STATE_COOKIE = "rv_oauth_state";

// Only allow same-site relative returnTo values - never let a query param send
// the post-login redirect off our domain.
function safeReturnTo(v: string | null): string {
  if (!v || !v.startsWith("/") || v.startsWith("//")) return "/";
  return v;
}

function safeReferralCode(v: string | null): string | undefined {
  const code = v?.trim().toLowerCase();
  return code && /^[a-z0-9]{16}$/.test(code) ? code : undefined;
}

function safePreferences(v: string | null): CompanionGender[] | undefined {
  if (!v) return undefined;
  const allowed = new Set(COMPANION_GENDER_OPTIONS.map((option) => option.value));
  const values = [...new Set(v.split(",").map((value) => value.trim()).filter((value): value is CompanionGender => allowed.has(value as CompanionGender)))];
  return values.length ? values : undefined;
}

// GET /api/auth/google?returnTo=/path&signup=1&ageConfirmed=1 -> redirect to
// Google's consent screen. Existing accounts can log in normally; new accounts
// need the same explicit minimum-age confirmation as email signup.
export async function GET(req: Request) {
  if (!googleConfigured()) return NextResponse.json({ error: "google sign-in not configured" }, { status: 501 });

  const url = new URL(req.url);
  const returnTo = safeReturnTo(url.searchParams.get("returnTo"));
  const isSignup = url.searchParams.get("signup") === "1";
  const ageConfirmed = isSignup && url.searchParams.get("ageConfirmed") === "1";
  const referralCode = isSignup ? safeReferralCode(url.searchParams.get("referralCode")) : undefined;
  const companionGenderPreferences = isSignup ? safePreferences(url.searchParams.get("companionGenderPreferences")) : undefined;
  // Strip any trailing slash so a stray slash in APP_URL doesn't produce a
  // double-slash redirect_uri that fails Google's exact-match check.
  const origin = (process.env.APP_URL || url.origin).replace(/\/$/, "");
  const redirectUri = `${origin}/api/auth/google/callback`;

  const state = randomBytes(16).toString("hex");
  const res = NextResponse.redirect(googleAuthUrl(redirectUri, state));
  res.cookies.set(STATE_COOKIE, JSON.stringify({ state, returnTo, ageConfirmed, referralCode, companionGenderPreferences }), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
