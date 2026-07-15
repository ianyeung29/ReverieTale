import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { grantDrip } from "@/lib/ledger";
import { exchangeGoogleCode } from "@/lib/google";
import { SESSION_COOKIE, signToken } from "@/lib/session";

export const dynamic = "force-dynamic";

const STATE_COOKIE = "rv_oauth_state";
const WELCOME_CREDITS = Number(process.env.WELCOME_CREDITS || 20);

function fail(origin: string, returnTo: string) {
  const sep = returnTo.includes("?") ? "&" : "?";
  const res = NextResponse.redirect(`${origin}${returnTo}${sep}authError=google`);
  res.cookies.delete(STATE_COOKIE);
  return res;
}

// GET /api/auth/google/callback -> exchange the code, find/create the user by
// verified email, set the session cookie, and require age confirmation before
// creating a new account. It shares the email signup's welcome grant semantics.
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  // Must match the redirect_uri sent in the auth step exactly (see the auth
  // route) - strip a trailing slash from APP_URL to avoid a double slash.
  const origin = (process.env.APP_URL || url.origin).replace(/\/$/, "");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  let expected: { state: string; returnTo: string; ageConfirmed?: boolean } | null = null;
  try {
    const raw = req.cookies.get(STATE_COOKIE)?.value;
    expected = raw ? JSON.parse(raw) : null;
  } catch {
    expected = null;
  }
  const returnTo = expected?.returnTo || "/";

  if (!code || !state || !expected || expected.state !== state) {
    return fail(origin, returnTo);
  }

  try {
    const redirectUri = `${origin}/api/auth/google/callback`;
    const { email: rawEmail, emailVerified } = await exchangeGoogleCode(code, redirectUri);
    if (!emailVerified) return fail(origin, returnTo);
    const email = rawEmail.toLowerCase().trim();

    let [u] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (!u) {
      if (!expected.ageConfirmed) return fail(origin, returnTo);
      [u] = await db.insert(users).values({ email, ageVerified: true }).returning({ id: users.id });
      await grantDrip(u.id, WELCOME_CREDITS, `welcome:${u.id}`);
    }

    const res = NextResponse.redirect(`${origin}${returnTo}`);
    res.cookies.set(SESSION_COOKIE, signToken(u.id), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      secure: process.env.NODE_ENV === "production",
    });
    res.cookies.delete(STATE_COOKIE);
    return res;
  } catch (e) {
    console.error("[auth/google] failed:", e instanceof Error ? e.message : e);
    return fail(origin, returnTo);
  }
}
