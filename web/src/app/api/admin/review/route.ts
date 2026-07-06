import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { characters, users } from "@/db/schema";
import { getCurrentUserId } from "@/lib/session";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

// GET /api/admin/review -> characters awaiting manual review (admin only).
export async function GET() {
  const userId = await getCurrentUserId();
  if (!(await isAdmin(userId))) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const rows = await db
    .select({
      id: characters.id,
      definition: characters.definition,
      reviewNote: characters.reviewNote,
      createdAt: characters.createdAt,
      creatorEmail: users.email,
      creatorName: users.displayName,
    })
    .from(characters)
    .leftJoin(users, eq(characters.creatorId, users.id))
    .where(eq(characters.status, "in_review"))
    .orderBy(desc(characters.updatedAt));

  const list = rows.map((r) => {
    const def = (r.definition ?? {}) as Record<string, unknown>;
    return {
      id: r.id,
      name: (def.name as string) ?? "Unknown",
      look: (def.look as string) ?? "",
      persona: (def.persona as string) ?? "",
      backstory: (def.backstory as string) ?? "",
      voice: (def.voice as string) ?? "",
      tags: Array.isArray(def.tags) ? (def.tags as string[]) : [],
      reviewNote: r.reviewNote ?? "",
      creator: r.creatorName?.trim() || r.creatorEmail || "Unknown",
    };
  });
  return NextResponse.json(list);
}
