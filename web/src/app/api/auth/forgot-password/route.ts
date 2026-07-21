import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { emailVerifications, users } from "@/db/schema";
import { newVerificationToken } from "@/lib/verification";
import { rateLimit } from "@/lib/ratelimit";
import { escapeHtml, sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const Body = z.object({ email: z.string().email() });

// POST /api/auth/forgot-password { email } -> always responds { ok: true }
// whether or not the email is registered, so this can't be used to enumerate
// accounts. Only actually sends a reset link when the account exists.
export async function POST(req: Request) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "a valid email is required" }, { status: 400 });
  }
  const email = body.email.toLowerCase().trim();

  const allowed = await rateLimit(`forgot:${email}`, 5, 60 * 60);
  if (!allowed) return NextResponse.json({ ok: true });

  const [u] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  let devResetUrl: string | undefined;
  if (u) {
    const { raw, hash } = newVerificationToken();
    await db.insert(emailVerifications).values({
      userId: u.id,
      tokenHash: hash,
      purpose: "reset",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });
    const appUrl = (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
    const link = `${appUrl}/reset-password?token=${raw}`;
    const result = await sendEmail({
      to: [email],
      subject: "Reset your ReverieTale password",
      html: `<p>Someone requested a password reset for this account. Choose a new password:</p><p><a href="${escapeHtml(link)}">${escapeHtml(link)}</a></p><p>This link expires in an hour. If you didn't request this, you can ignore it.</p>`,
    });
    if (!result.ok) {
      // Preserve the identical public response to prevent account enumeration,
      // while leaving a useful diagnostic entry in Vercel's server logs.
      console.error("Password reset email was not accepted", {
        skipped: result.skipped ?? false,
        error: result.error ?? "Resend is not configured",
      });
    }
    if (result.skipped && process.env.NODE_ENV !== "production") devResetUrl = link;
  }

  return NextResponse.json({ ok: true, devResetUrl });
}
