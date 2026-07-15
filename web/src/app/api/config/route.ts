import { NextResponse } from "next/server";
import { imageConfigured } from "@/lib/image";
import { googleConfigured } from "@/lib/google";
import { REWARD_RATE } from "@/lib/ledger";
import { mediaStorageConfigured } from "@/lib/media";

export const dynamic = "force-dynamic";

// Public feature flags and pricing for the 13+ experience.
export async function GET() {
  return NextResponse.json({
    imageEnabled: imageConfigured() && mediaStorageConfigured(),
    googleEnabled: googleConfigured(),
    welcomeCredits: Number(process.env.WELCOME_CREDITS || 20),
    pricing: {
      chat: Number(process.env.CHAT_PRICE || 1),
      chapter: Number(process.env.CHAPTER_PRICE || 10),
      portrait: Number(process.env.PORTRAIT_PRICE || 5),
      portraitFree: Number(process.env.FREE_PORTRAITS || 2),
      chatFree: Number(process.env.FREE_CHAT_MESSAGES || 5),
      dailyDrip: Number(process.env.DAILY_DRIP || 20),
      creatorRewardRate: REWARD_RATE,
    },
  });
}
