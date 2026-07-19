import { createHash, randomUUID } from "crypto";
import { and, cosineDistance, desc, eq, gt, isNotNull, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { companionSnapshotDeliveries, requestedImagePool } from "@/db/schema";
import { embedOne } from "@/lib/embeddings";

const MAX_AGE_DAYS = Math.max(1, Number(process.env.REQUESTED_IMAGE_POOL_MAX_AGE_DAYS || 30));
const SIMILARITY = Math.min(0.99, Math.max(0.8, Number(process.env.REQUESTED_IMAGE_POOL_SIMILARITY || 0.92)));

type PoolMatch = { imageKey: string; imageMime: string | null; kind: "exact" | "similar" };
export type CompanionSnapshot = { id: string; imageKey: string; imageMime: string | null };

// A shared prompt must describe a generic companion moment, not the reader,
// their home, their appearance, or a one-to-one relationship.
const PERSONAL_REQUEST = /\b(?:me|my|mine|our|ours|with\s+you|you\s+and\s+i|at\s+my|for\s+me|us)\b/i;

export function poolableRequestedMoment(request: string): string | null {
  const compact = request
    .toLowerCase()
    .replace(/\b(?:can|could|would|will|please|you|send|share|show|take|post|drop|give|photo|picture|pic|image|selfie|a|an|the|of|to|for)\b/g, " ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 220);

  if (PERSONAL_REQUEST.test(request) || compact.length < 4) return null;
  return compact;
}

function requestKey(moment: string): string {
  return createHash("sha256").update(moment).digest("hex");
}

export async function findRequestedImagePoolMatch(characterId: string, requestedMoment: string): Promise<PoolMatch | null> {
  const key = requestKey(requestedMoment);
  const [exact] = await db
    .select({ imageKey: requestedImagePool.imageKey, imageMime: requestedImagePool.imageMime })
    .from(requestedImagePool)
    .where(and(eq(requestedImagePool.characterId, characterId), eq(requestedImagePool.kind, "requested"), eq(requestedImagePool.requestKey, key)))
    .limit(1);
  if (exact) return { ...exact, kind: "exact" };

  if (!process.env.EMBEDDINGS_API_KEY) return null;
  try {
    const embedding = await embedOne(requestedMoment);
    const similarity = sql<number>`1 - (${cosineDistance(requestedImagePool.requestEmbedding, embedding)})`;
    const notOlderThan = new Date(Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000);
    const [similar] = await db
      .select({ imageKey: requestedImagePool.imageKey, imageMime: requestedImagePool.imageMime, similarity })
      .from(requestedImagePool)
      .where(
        and(
          eq(requestedImagePool.characterId, characterId),
          eq(requestedImagePool.kind, "requested"),
          isNotNull(requestedImagePool.requestEmbedding),
          gt(requestedImagePool.lastUsedAt, notOlderThan),
        ),
      )
      .orderBy(desc(similarity))
      .limit(1);
    if (similar && similar.similarity >= SIMILARITY) return { imageKey: similar.imageKey, imageMime: similar.imageMime, kind: "similar" };
  } catch {
    // Cache misses must never prevent a user from receiving a fresh image.
  }
  return null;
}

export async function noteRequestedImagePoolUse(characterId: string, imageKey: string): Promise<void> {
  await db
    .update(requestedImagePool)
    .set({ lastUsedAt: new Date(), useCount: sql`${requestedImagePool.useCount} + 1` })
    .where(and(eq(requestedImagePool.characterId, characterId), eq(requestedImagePool.imageKey, imageKey)));
}

export async function addRequestedImageToPool(input: {
  characterId: string;
  requestedMoment: string;
  imageKey: string;
  imageMime: string;
}): Promise<void> {
  let embedding: number[] | undefined;
  if (process.env.EMBEDDINGS_API_KEY) {
    try {
      embedding = await embedOne(input.requestedMoment);
    } catch {
      // Exact request reuse is still useful when optional embeddings fail.
    }
  }

  await db
    .insert(requestedImagePool)
    .values({
      characterId: input.characterId,
      kind: "requested",
      requestKey: requestKey(input.requestedMoment),
      requestEmbedding: embedding,
      imageKey: input.imageKey,
      imageMime: input.imageMime,
    })
    .onConflictDoNothing();
}

export async function findUndeliveredCompanionSnapshot(characterId: string, userId: string): Promise<CompanionSnapshot | null> {
  const [snapshot] = await db
    .select({ id: requestedImagePool.id, imageKey: requestedImagePool.imageKey, imageMime: requestedImagePool.imageMime })
    .from(requestedImagePool)
    .leftJoin(
      companionSnapshotDeliveries,
      and(
        eq(companionSnapshotDeliveries.poolImageId, requestedImagePool.id),
        eq(companionSnapshotDeliveries.userId, userId),
      ),
    )
    .where(
      and(
        eq(requestedImagePool.characterId, characterId),
        eq(requestedImagePool.kind, "return_snapshot"),
        isNull(companionSnapshotDeliveries.id),
      ),
    )
    .orderBy(desc(requestedImagePool.lastUsedAt))
    .limit(1);
  return snapshot ?? null;
}

export async function addCompanionSnapshotToPool(input: {
  characterId: string;
  imageKey: string;
  imageMime: string;
}): Promise<CompanionSnapshot> {
  const [snapshot] = await db
    .insert(requestedImagePool)
    .values({
      characterId: input.characterId,
      kind: "return_snapshot",
      requestKey: `return-snapshot:${randomUUID()}`,
      imageKey: input.imageKey,
      imageMime: input.imageMime,
    })
    .returning({ id: requestedImagePool.id, imageKey: requestedImagePool.imageKey, imageMime: requestedImagePool.imageMime });
  return snapshot;
}

export async function recordCompanionSnapshotDelivery(input: {
  poolImageId: string;
  userId: string;
  messageId: string;
}): Promise<boolean> {
  const rows = await db
    .insert(companionSnapshotDeliveries)
    .values(input)
    .onConflictDoNothing()
    .returning({ id: companionSnapshotDeliveries.id });
  return rows.length === 1;
}
