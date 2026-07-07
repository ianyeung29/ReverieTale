import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

/**
 * Lightweight session: a signed cookie holding the userId, HMAC'd with
 * SESSION_SECRET. Primary path is "email to continue" with no external
 * provider, since OAuth vendors can suspend client credentials for apps in
 * adult/mature categories. Google Sign-In (lib/google.ts, /api/auth/google) is
 * offered as an added convenience login on top of this - same account model,
 * same ageVerified stub - accepted knowingly despite that suspension risk.
 * Add passwords / real verification before a real launch either way.
 */
export const SESSION_COOKIE = "rv_session";

function secret(): string {
  return process.env.SESSION_SECRET || "dev-insecure-secret-change-me";
}

export function signToken(userId: string): string {
  const sig = createHmac("sha256", secret()).update(userId).digest("base64url");
  return `${userId}.${sig}`;
}

export function verifyToken(token: string | undefined | null): string | null {
  if (!token) return null;
  const i = token.lastIndexOf(".");
  if (i <= 0) return null;
  const userId = token.slice(0, i);
  const sig = token.slice(i + 1);
  const expected = createHmac("sha256", secret()).update(userId).digest("base64url");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  return userId;
}

export async function getCurrentUserId(): Promise<string | null> {
  const store = await cookies();
  return verifyToken(store.get(SESSION_COOKIE)?.value);
}
