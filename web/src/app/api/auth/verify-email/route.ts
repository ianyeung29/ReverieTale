import { NextResponse } from "next/server";
import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { emailVerifications, users } from "@/db/schema";
import { hashVerificationToken } from "@/lib/verification";
import { grantDrip } from "@/lib/ledger";
import { SESSION_COOKIE, signToken } from "@/lib/session";
import { applyReferralVerification } from "@/lib/referrals";

export const dynamic = "force-dynamic";

const WELCOME_CREDITS = Number(process.env.WELCOME_CREDITS || 20);
const Body = z.object({ token: z.string().min(10) });

// POST /api/auth/verify-email { token } -> consumes a signup verification link:
// applies the password that was captured at signup time, marks the email
// verified, grants the welcome bonus (first time only), and logs the user in.
export async function POST(req: Request) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid token" }, { status: 400 });
  }

  const hash = hashVerificationToken(body.token);
  const [row] = await db
    .select()
    .from(emailVerifications)
    .where(and(eq(emailVerifications.tokenHash, hash), eq(emailVerifications.purpose, "signup"), isNull(emailVerifications.consumedAt)))
    .limit(1);

  if (!row || row.expiresAt < new Date() || !row.pendingPasswordHash) {
    return NextResponse.json({ error: "This link is invalid or has expired." }, { status: 400 });
  }

  await db.transaction(async (tx) => {
    await tx.update(users).set({ passwordHash: row.pendingPasswordHash, emailVerifiedAt: new Date() }).where(eq(users.id, row.userId));
    await tx.update(emailVerifications).set({ consumedAt: new Date() }).where(eq(emailVerifications.id, row.id));
  });

  try {
    await grantDrip(row.userId, WELCOME_CREDITS, `welcome:${row.userId}`);
  } catch (e) {
    // A legacy (pre-password) account may already have its welcome grant from
    // when it was first created - same duplicate-key class as ensureDailyDrip.
    const err = e as { code?: string; message?: string; cause?: { code?: string } };
    const code = err?.cause?.code ?? err?.code;
    if (!(code === "23505" || /duplicate|unique/i.test(String(err?.message)))) throw e;
  }

  try {
    await applyReferralVerification(row.userId);
  } catch (e) {
    console.error("[referrals] verification reward failed:", e instanceof Error ? e.message : e);
  }

  const [u] = await db.select({ email: users.email }).from(users).where(eq(users.id, row.userId)).limit(1);
  const res = NextResponse.json({ email: u?.email, welcomeCredits: WELCOME_CREDITS });
  res.cookies.set(SESSION_COOKIE, signToken(row.userId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
