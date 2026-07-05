import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { grantDrip } from "@/lib/ledger";
import { SESSION_COOKIE, signToken } from "@/lib/session";

export const dynamic = "force-dynamic";

const WELCOME_CREDITS = Number(process.env.WELCOME_CREDITS || 50);
const Body = z.object({ email: z.string().email(), over18: z.boolean().optional() });

// POST /api/auth/login { email } -> find/create the user, grant a welcome
// balance on first login, and set the signed session cookie.
export async function POST(req: Request) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "a valid email is required" }, { status: 400 });
  }
  const email = body.email.toLowerCase().trim();

  let [u] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (!u) {
    [u] = await db.insert(users).values({ email, ageVerified: true }).returning({ id: users.id });
    await grantDrip(u.id, WELCOME_CREDITS, `welcome:${u.id}`);
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
