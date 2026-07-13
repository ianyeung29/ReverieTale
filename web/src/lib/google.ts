import { createRemoteJWKSet, jwtVerify } from "jose";

/**
 * "Sign in with Google" - a CONVENIENCE login only. It verifies the user
 * controls that Gmail/Google account; it does NOT verify age (Google exposes
 * no birthdate/age claim to third-party apps, and minors can hold accounts).
 * ageVerified stays the same stub as the email-only login in lib/session.ts.
 */

const JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export function googleConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function googleAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

// Exchanges an auth code for tokens, then verifies the ID token's signature and
// claims against Google's own JWKS (not the client-supplied token alone).
export async function exchangeGoogleCode(code: string, redirectUri: string): Promise<{ email: string; emailVerified: boolean }> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`google token exchange ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`);

  const data = (await res.json()) as { id_token?: string };
  if (!data.id_token) throw new Error("google: no id_token in response");

  const { payload } = await jwtVerify(data.id_token, JWKS, {
    issuer: ["https://accounts.google.com", "accounts.google.com"],
    audience: process.env.GOOGLE_CLIENT_ID || "",
  });

  const email = typeof payload.email === "string" ? payload.email : "";
  if (!email) throw new Error("google: no email claim");
  return { email, emailVerified: payload.email_verified === true };
}
