import { NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { characters, threads, users } from "@/db/schema";

export const dynamic = "force-dynamic";

async function devUserId(): Promise<string | null> {
  const [u] = await db.select({ id: users.id }).from(users).where(eq(users.email, "dev@local.test")).limit(1);
  return u?.id ?? null;
}

// GET /api/threads -> the dev user's recent conversations (for the resume list).
export async function GET() {
  const userId = await devUserId();
  if (!userId) return NextResponse.json([]);

  const rows = await db
    .select({
      id: threads.id,
      characterId: threads.characterId,
      name: sql<string>`${characters.definition}->>'name'`,
      lastActiveAt: threads.lastActiveAt,
    })
    .from(threads)
    .innerJoin(characters, eq(threads.characterId, characters.id))
    .where(eq(threads.userId, userId))
    .orderBy(desc(threads.lastActiveAt))
    .limit(30);

  return NextResponse.json(rows);
}
