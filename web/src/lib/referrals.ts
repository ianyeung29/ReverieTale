import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { referrals, users } from "@/db/schema";
import { grantDrip } from "@/lib/ledger";

export const REFERRAL_CREDITS = Math.max(0, Number(process.env.REFERRAL_CREDITS || 50));

function validCode(value: string | null | undefined): value is string {
  return Boolean(value && /^[a-z0-9]{16}$/.test(value));
}

function isDuplicate(error: unknown): boolean {
  const err = error as { code?: string; message?: string; cause?: { code?: string } };
  return (err.cause?.code ?? err.code) === "23505" || /duplicate|unique/i.test(String(err.message));
}

/** Attribution is accepted only while an account is first being created. */
export async function createReferral(referredId: string, code: string): Promise<boolean> {
  const normalized = code.trim().toLowerCase();
  if (!validCode(normalized)) return false;
  const [referrer] = await db.select({ id: users.id }).from(users).where(eq(users.referralCode, normalized)).limit(1);
  if (!referrer || referrer.id === referredId) return false;
  try {
    const inserted = await db.insert(referrals).values({ referrerId: referrer.id, referredId }).onConflictDoNothing({ target: referrals.referredId }).returning({ id: referrals.id });
    return inserted.length > 0;
  } catch (error) {
    if (isDuplicate(error)) return false;
    throw error;
  }
}

/** Both members receive their invite reward when the new account is verified. */
export async function applyReferralVerification(referredId: string): Promise<number> {
  if (REFERRAL_CREDITS <= 0) return 0;
  const [referral] = await db
    .select()
    .from(referrals)
    .where(and(eq(referrals.referredId, referredId), isNull(referrals.newUserRewardedAt)))
    .limit(1);
  if (!referral) return 0;
  try {
    await grantDrip(referredId, REFERRAL_CREDITS, `referral:new:${referral.id}`);
  } catch (error) {
    if (!isDuplicate(error)) throw error;
  }
  try {
    await grantDrip(referral.referrerId, REFERRAL_CREDITS, `referral:referrer:${referral.id}`);
  } catch (error) {
    if (!isDuplicate(error)) throw error;
  }
  await db.update(referrals).set({ status: "credited", newUserRewardedAt: new Date(), referrerRewardedAt: new Date() }).where(eq(referrals.id, referral.id));
  return REFERRAL_CREDITS;
}

export type ReferralOverview = { code: string; invited: number; rewarded: number };

export async function referralOverview(userId: string): Promise<ReferralOverview> {
  const [user] = await db.select({ code: users.referralCode }).from(users).where(eq(users.id, userId)).limit(1);
  const rows = await db.select({ rewardedAt: referrals.referrerRewardedAt }).from(referrals).where(eq(referrals.referrerId, userId));
  return { code: user?.code ?? "", invited: rows.length, rewarded: rows.filter((row) => Boolean(row.rewardedAt)).length };
}
