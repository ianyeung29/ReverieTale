import { NextResponse } from "next/server";
import { explicitConfigured } from "@/lib/model";

export const dynamic = "force-dynamic";

// Public feature flags for the client. Only exposes whether the explicit tier is
// switched on + configured - never any keys, endpoints, or prompts.
export async function GET() {
  return NextResponse.json({ explicitEnabled: explicitConfigured() });
}
