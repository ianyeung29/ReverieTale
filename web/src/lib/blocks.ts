import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { characterBlocks, characters } from "@/db/schema";

export async function isCharacterBlocked(userId: string, characterId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: characterBlocks.id })
    .from(characterBlocks)
    .where(and(eq(characterBlocks.userId, userId), eq(characterBlocks.characterId, characterId)))
    .limit(1);
  return Boolean(row);
}

// Toggle: blocks it if not already blocked, unblocks it if it is. Returns the new state.
export async function toggleCharacterBlock(userId: string, characterId: string): Promise<boolean> {
  const already = await isCharacterBlocked(userId, characterId);
  if (already) {
    await db.delete(characterBlocks).where(and(eq(characterBlocks.userId, userId), eq(characterBlocks.characterId, characterId)));
    return false;
  }
  await db.insert(characterBlocks).values({ userId, characterId }).onConflictDoNothing();
  return true;
}

export async function blockedCharacterIds(userId: string): Promise<string[]> {
  const rows = await db.select({ characterId: characterBlocks.characterId }).from(characterBlocks).where(eq(characterBlocks.userId, userId));
  return rows.map((r) => r.characterId);
}

export async function blockedCharacters(userId: string) {
  const rows = await db
    .select({ id: characters.id, definition: characters.definition })
    .from(characterBlocks)
    .innerJoin(characters, eq(characterBlocks.characterId, characters.id))
    .where(eq(characterBlocks.userId, userId))
    .orderBy(desc(characterBlocks.createdAt));
  return rows.map((r) => ({ id: r.id, name: ((r.definition ?? {}) as Record<string, unknown>).name as string ?? "Unknown" }));
}
