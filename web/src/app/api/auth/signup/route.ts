import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { emailVerifications, users } from "@/db/schema";
import { hashPassword } from "@/lib/password";
import { newVerificationToken } from "@/lib/verification";
import { rateLimit } from "@/lib/ratelimit";
import { escapeHtml, sendEmail } from "@/lib/email";
import { createReferral } from "@/lib/referrals";
import { COMPANION_GENDER_OPTIONS, type CompanionGender } from "@/lib/gender";

export const dynamic = "force-dynamic";

const Body = z.object({
  email: z.string().email(), password: z.string().min(8).max(200), ageConfirmed: z.boolean(),
  referralCode: z.string().trim().toLowerCase().regex(/^[a-z0-9]{16}$/).optional(),
  companionGenderPreferences: z.array(z.enum(COMPANION_GENDER_OPTIONS.map((option) => option.value) as [string, ...string[]])).min(1).max(COMPANION_GENDER_OPTIONS.length).optional(),
});

// POST /api/auth/signup { email, password } -> starts account creation. Nothing
// is granted and no session is issued yet: the password is held (hashed) against
// a one-time emailed link, and only lands on the account once that link is
// clicked - proving the requester actually owns the mailbox. This also covers
// "claiming" a pre-existing Google-only account (passwordHash still null) with
// a password, the same way.
export async function POST(req: Request) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "a valid email and a password of at least 8 characters are required" }, { status: 400 });
  }
  const email = body.email.toLowerCase().trim();

  if (!body.ageConfirmed) {
    return NextResponse.json({ error: "You must confirm that you meet the minimum age to create an account." }, { status: 403 });
  }

  const allowed = await rateLimit(`signup:${email}`, 5, 60 * 60);
  if (!allowed) return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });

  const [existing] = await db.select({ id: users.id, passwordHash: users.passwordHash }).from(users).where(eq(users.email, email)).limit(1);
  if (existing?.passwordHash) {
    return NextResponse.json({ error: "That email is already registered - log in instead." }, { status: 409 });
  }

  let userId = existing?.id;
  let createdAccount = false;
  if (!userId) {
    const [u] = await db.insert(users).values({ email, ageVerified: body.ageConfirmed, companionGenderPreferences: body.companionGenderPreferences as CompanionGender[] | undefined }).returning({ id: users.id });
    userId = u.id;
    createdAccount = true;
  }
  if (createdAccount && body.referralCode) await createReferral(userId, body.referralCode);

  const { raw, hash } = newVerificationToken();
  await db.insert(emailVerifications).values({
    userId,
    tokenHash: hash,
    purpose: "signup",
    pendingPasswordHash: hashPassword(body.password),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  });

  const appUrl = (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
  const link = `${appUrl}/verify-email?token=${raw}`;
  const result = await sendEmail({
    to: [email],
    subject: "Confirm your ReverieTale account",
    html: `<p>Welcome to ReverieTale - confirm your email to finish creating your account:</p><p><a href="${escapeHtml(link)}">${escapeHtml(link)}</a></p><p>This link expires in an hour. If you didn't request this, you can ignore it.</p>`,
  });

  // Keep the local flow testable without email, but never claim that a
  // production confirmation email was sent unless Resend accepted it.
  if (!result.ok && result.skipped && process.env.NODE_ENV !== "production") {
    return NextResponse.json({ ok: true, devVerifyUrl: link });
  }

  if (!result.ok) {
    console.error("Signup confirmation email was not accepted", {
      skipped: result.skipped ?? false,
      error: result.error ?? "Resend is not configured",
    });
    return NextResponse.json(
      { error: "We couldn't send your confirmation email right now. Please try again in a moment." },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true });
}
