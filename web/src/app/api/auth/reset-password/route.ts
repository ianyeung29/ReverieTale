import { NextResponse } from "next/server";
import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { emailVerifications, users } from "@/db/schema";
import { hashPassword } from "@/lib/password";
import { hashVerificationToken } from "@/lib/verification";
import { SESSION_COOKIE, signToken } from "@/lib/session";

export const dynamic = "force-dynamic";

const Body = z.object({ token: z.string().min(10), password: z.string().min(8).max(200) });

// POST /api/auth/reset-password { token, password } -> consumes a reset link
// and sets the new password. Clicking a link mailed to the account's address
// proves ownership just as much as the signup flow does, so this also counts
// as email verification for an account that never had one (e.g. Google-only).
export async function POST(req: Request) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "a token and a password of at least 8 characters are required" }, { status: 400 });
  }

  const hash = hashVerificationToken(body.token);
  const [row] = await db
    .select()
    .from(emailVerifications)
    .where(and(eq(emailVerifications.tokenHash, hash), eq(emailVerifications.purpose, "reset"), isNull(emailVerifications.consumedAt)))
    .limit(1);

  if (!row || row.expiresAt < new Date()) {
    return NextResponse.json({ error: "This link is invalid or has expired." }, { status: 400 });
  }

  const passwordHash = hashPassword(body.password);
  await db.transaction(async (tx) => {
    const [u] = await tx.select({ emailVerifiedAt: users.emailVerifiedAt }).from(users).where(eq(users.id, row.userId)).limit(1);
    await tx
      .update(users)
      .set({ passwordHash, emailVerifiedAt: u?.emailVerifiedAt ?? new Date() })
      .where(eq(users.id, row.userId));
    await tx.update(emailVerifications).set({ consumedAt: new Date() }).where(eq(emailVerifications.id, row.id));
  });

  const [u] = await db.select({ email: users.email }).from(users).where(eq(users.id, row.userId)).limit(1);
  const res = NextResponse.json({ email: u?.email });
  res.cookies.set(SESSION_COOKIE, signToken(row.userId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
