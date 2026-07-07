import { NextResponse } from "next/server";
import { explicitConfigured } from "@/lib/model";
import { imageConfigured } from "@/lib/image";
import { googleConfigured } from "@/lib/google";

export const dynamic = "force-dynamic";

// Public feature flags + pricing for the client. Only exposes whether the explicit
// tier is on - never any keys, endpoints, or prompts.
export async function GET() {
  return NextResponse.json({
    explicitEnabled: explicitConfigured(),
    imageEnabled: imageConfigured(),
    googleEnabled: googleConfigured(),
    pricing: {
      chat: Number(process.env.CHAT_PRICE || 1),
      chapter: Number(process.env.CHAPTER_PRICE || 10),
      portrait: Number(process.env.PORTRAIT_PRICE || 5),
      portraitFree: Number(process.env.FREE_PORTRAITS || 2),
    },
  });
}
