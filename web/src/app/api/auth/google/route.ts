import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { googleAuthUrl, googleConfigured } from "@/lib/google";

export const dynamic = "force-dynamic";

const STATE_COOKIE = "rv_oauth_state";

// Only allow same-site relative returnTo values - never let a query param send
// the post-login redirect off our domain.
function safeReturnTo(v: string | null): string {
  if (!v || !v.startsWith("/") || v.startsWith("//")) return "/";
  return v;
}

// GET /api/auth/google?returnTo=/path -> redirect to Google's consent screen.
// Convenience login only - does NOT verify age (see lib/session.ts + lib/google.ts).
export async function GET(req: Request) {
  if (!googleConfigured()) return NextResponse.json({ error: "google sign-in not configured" }, { status: 501 });

  const url = new URL(req.url);
  const returnTo = safeReturnTo(url.searchParams.get("returnTo"));
  // Strip any trailing slash so a stray slash in APP_URL doesn't produce a
  // double-slash redirect_uri that fails Google's exact-match check.
  const origin = (process.env.APP_URL || url.origin).replace(/\/$/, "");
  const redirectUri = `${origin}/api/auth/google/callback`;

  const state = randomBytes(16).toString("hex");
  const res = NextResponse.redirect(googleAuthUrl(redirectUri, state));
  res.cookies.set(STATE_COOKIE, JSON.stringify({ state, returnTo }), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
