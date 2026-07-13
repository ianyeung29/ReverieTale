import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { characters } from "@/db/schema";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

// GET /api/characters/mine -> the signed-in user's own characters (any status),
// for the creator management page.
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const rows = await db
    .select({ id: characters.id, definition: characters.definition, status: characters.status })
    .from(characters)
    .where(eq(characters.creatorId, userId))
    .orderBy(desc(characters.updatedAt));

  const list = rows.map((r) => {
    const def = (r.definition ?? {}) as Record<string, unknown>;
    return {
      id: r.id,
      name: (def.name as string) ?? "Unknown",
      persona: (def.persona as string) ?? "",
      greeting: (def.greeting as string) ?? "",
      tags: Array.isArray(def.tags) ? (def.tags as string[]) : [],
      status: r.status,
    };
  });
  return NextResponse.json(list);
}
