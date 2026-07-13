import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

/**
 * Admin gate for the moderation queue. Admins are configured by email in the
 * ADMIN_EMAILS env (comma-separated). No env set -> nobody is an admin.
 */
export async function isAdmin(userId: string | null): Promise<boolean> {
  if (!userId) return false;
  const admins = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (!admins.length) return false;
  const [u] = await db.select({ email: users.email }).from(users).where(eq(users.id, userId)).limit(1);
  return Boolean(u && admins.includes(u.email.toLowerCase()));
}
