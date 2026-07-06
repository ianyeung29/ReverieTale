import { NextResponse } from "next/server";
import { explicitConfigured } from "@/lib/model";
import { imageConfigured } from "@/lib/image";

export const dynamic = "force-dynamic";

// Public feature flags + pricing for the client. Only exposes whether the explicit
// tier is on - never any keys, endpoints, or prompts.
export async function GET() {
  return NextResponse.json({
    explicitEnabled: explicitConfigured(),
    imageEnabled: imageConfigured(),
    pricing: {
      chat: Number(process.env.CHAT_PRICE || 1),
      chapter: Number(process.env.CHAPTER_PRICE || 10),
    },
  });
}
