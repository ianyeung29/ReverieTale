import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { verifyPassword } from "@/lib/password";
import { rateLimit } from "@/lib/ratelimit";
import { SESSION_COOKIE, signToken } from "@/lib/session";

export const dynamic = "force-dynamic";

const Body = z.object({ email: z.string().email(), password: z.string().min(1).max(200) });

// POST /api/auth/login { email, password } -> verify the password hash and set
// the signed session cookie. A generic error covers both "no such account" and
// "wrong password" so this can't be used to enumerate registered emails.
export async function POST(req: Request) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "email and password are required" }, { status: 400 });
  }
  const email = body.email.toLowerCase().trim();

  const allowed = await rateLimit(`login:${email}`, 10, 15 * 60);
  if (!allowed) return NextResponse.json({ error: "Too many attempts. Try again in a few minutes." }, { status: 429 });

  const [u] = await db.select({ id: users.id, passwordHash: users.passwordHash }).from(users).where(eq(users.email, email)).limit(1);
  if (!u?.passwordHash || !verifyPassword(body.password, u.passwordHash)) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const res = NextResponse.json({ email });
  res.cookies.set(SESSION_COOKIE, signToken(u.id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
