import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { REFERRAL_CREDITS, referralOverview } from "@/lib/referrals";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ ...(await referralOverview(userId)), credits: REFERRAL_CREDITS });
}
