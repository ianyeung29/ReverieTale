import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { screen } from "@/lib/moderation";
import { getCurrentUserId } from "@/lib/session";
import { COMPANION_GENDER_OPTIONS, PROFILE_GENDER_OPTIONS, type CompanionGender } from "@/lib/gender";

export const dynamic = "force-dynamic";

const CompanionGenderSchema = z.enum(COMPANION_GENDER_OPTIONS.map((option) => option.value) as [string, ...string[]]);
const ProfileGenderSchema = z.enum(PROFILE_GENDER_OPTIONS.map((option) => option.value) as [string, ...string[]]);
const Body = z.object({
  displayName: z.string().trim().max(40).optional(),
  profileGender: ProfileGenderSchema.nullable().optional(),
  companionGenderPreferences: z.array(CompanionGenderSchema).min(1).max(COMPANION_GENDER_OPTIONS.length).optional(),
});

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const [user] = await db.select({ displayName: users.displayName, profileGender: users.profileGender, companionGenderPreferences: users.companionGenderPreferences }).from(users).where(eq(users.id, userId)).limit(1);
  return NextResponse.json({
    displayName: user?.displayName ?? "",
    profileGender: user?.profileGender ?? null,
    companionGenderPreferences: Array.isArray(user?.companionGenderPreferences) ? user.companionGenderPreferences : null,
  });
}

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid request body" }, { status: 400 });
  }

  if (body.displayName && screen(body.displayName).blocked) {
    return NextResponse.json({ error: "blocked", reason: "safety_minor" }, { status: 422 });
  }

  await db.update(users).set({
    ...(body.displayName !== undefined ? { displayName: body.displayName || null } : {}),
    ...(body.profileGender !== undefined ? { profileGender: body.profileGender } : {}),
    ...(body.companionGenderPreferences !== undefined ? { companionGenderPreferences: body.companionGenderPreferences as CompanionGender[] } : {}),
  }).where(eq(users.id, userId));
  return NextResponse.json({ displayName: body.displayName ?? null, profileGender: body.profileGender ?? null, companionGenderPreferences: body.companionGenderPreferences ?? null });
}
