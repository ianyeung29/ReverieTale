import { db } from "@/db";
import { companionRelationships } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export type RelationshipState = {
  trust: number;
  familiarity: number;
  lastEmotion?: string | null;
  lastTopic?: string | null;
  lastJealousyAt?: Date | null;
};

const STARTING_STATE: RelationshipState = { trust: 10, familiarity: 0 };

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Relationship state is best-effort while databases roll out the migration.
 * Chat should remain available even if a deployment briefly runs newer code
 * against an older schema.
 */
export async function getRelationshipState(userId: string, characterId: string): Promise<RelationshipState> {
  try {
    const [state] = await db
      .select({
        trust: companionRelationships.trust,
        familiarity: companionRelationships.familiarity,
        lastEmotion: companionRelationships.lastEmotion,
        lastTopic: companionRelationships.lastTopic,
        lastJealousyAt: companionRelationships.lastJealousyAt,
      })
      .from(companionRelationships)
      .where(and(eq(companionRelationships.userId, userId), eq(companionRelationships.characterId, characterId)))
      .limit(1);
    return state ?? STARTING_STATE;
  } catch {
    return STARTING_STATE;
  }
}

function topicFrom(message: string) {
  const cleaned = message.replace(/[^a-zA-Z0-9\s'-]/g, " ").replace(/\s+/g, " ").trim();
  return cleaned ? cleaned.slice(0, 120) : null;
}

function emotionFor(message: string) {
  if (/\b(sad|upset|stressed|anxious|worried|rough|bad day|hurt|lonely|angry)\b/i.test(message)) return "caring";
  if (/\b(excited|won|passed|great|awesome|happy|celebrat|proud)\b/i.test(message)) return "happy";
  if (/\b(sorry|no thanks|stop|not comfortable|leave me|boundary)\b/i.test(message)) return "respectful";
  if (/\b(other (girl|guy|character|companion)|someone else|my ex|their ex|date|crush)\b/i.test(message)) return "playfully-jealous";
  return "curious";
}

function trustGain(message: string) {
  let gain = 0;
  if (/\b(i feel|i've been|i have been|i'm|i am|my day|my family|school|work|friend|worried|excited|proud|sorry)\b/i.test(message)) gain += 1;
  if (/\b(thank you|thanks|i appreciate|that helped|i trust|i'm glad|i like)\b/i.test(message)) gain += 1;
  return Math.min(gain, 2);
}

export function relationshipGuidance(state: RelationshipState, userMessage: string) {
  const tier = state.trust >= 55 ? "trusted" : state.trust >= 28 ? "warming" : "new";
  const mentionsAnotherPerson = /\b(other (girl|guy|character|companion)|someone else|my ex|their ex|date|crush)\b/i.test(userMessage);
  const jealousyIsFresh = !state.lastJealousyAt || Date.now() - new Date(state.lastJealousyAt).getTime() > 1000 * 60 * 60 * 24;
  const allowPlayfulJealousy = tier !== "new" && mentionsAnotherPerson && jealousyIsFresh;

  const stage =
    tier === "trusted"
      ? "You know this reader fairly well. Be warmly candid, remember details only when relevant, and let shared jokes or small rituals surface naturally."
      : tier === "warming"
        ? "You are getting comfortable with this reader. Show small, earned warmth and curiosity, but keep learning rather than assuming intimacy."
        : "You are still getting to know this reader. Be inviting and present, but do not act overly familiar, possessive, or like they owe you attention.";

  return [
    `Relationship tone: ${tier}. ${stage}`,
    "Have an emotional point of view in the moment: react with delight, concern, uncertainty, relief, amusement, or a calm boundary when it fits. Let that feeling shape your wording, but do not narrate a diagnosis of the reader.",
    "Let trust grow through consistency, mutual choices, and remembered details, never through pressure. Do not say the reader is all you need, demand priority, guilt them for leaving, discourage real relationships, or imply that you are a real person with needs outside this chat.",
    allowPlayfulJealousy
      ? "A different person or companion came up. You may make one brief, playful, self-aware jealousy joke if it suits your personality, then move on with curiosity. It must never be possessive, competitive, or a request for reassurance."
      : "Do not introduce jealousy on your own. If another person comes up, be curious and supportive rather than competitive.",
  ].join("\n");
}

export async function updateRelationshipState(args: {
  userId: string;
  characterId: string;
  userMessage: string;
}) {
  try {
    const current = await getRelationshipState(args.userId, args.characterId);
    const emotion = emotionFor(args.userMessage);
    const lastJealousyAt = emotion === "playfully-jealous" && current.trust >= 28 ? new Date() : current.lastJealousyAt ?? null;

    await db
      .insert(companionRelationships)
      .values({
        userId: args.userId,
        characterId: args.characterId,
        trust: clamp(current.trust + trustGain(args.userMessage), 0, 100),
        familiarity: clamp(current.familiarity + 1, 0, 100),
        lastEmotion: emotion,
        lastTopic: topicFrom(args.userMessage),
        lastJealousyAt,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [companionRelationships.userId, companionRelationships.characterId],
        set: {
          trust: clamp(current.trust + trustGain(args.userMessage), 0, 100),
          familiarity: clamp(current.familiarity + 1, 0, 100),
          lastEmotion: emotion,
          lastTopic: topicFrom(args.userMessage),
          lastJealousyAt,
          updatedAt: new Date(),
        },
      });
  } catch {
    // Relationship continuity should never make a normal chat turn fail.
  }
}
