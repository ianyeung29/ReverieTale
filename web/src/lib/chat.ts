import { db } from "@/db";
import { characters, messages, threads } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { chat as modelChat, type ChatMessage } from "./model";
import { screen } from "./moderation";
import { extractAndStoreMemory, maybeUpdateSummary, retrieveMemory } from "./memory";
import { rewardCreator, spend, userBalance, type Balance } from "./ledger";

const CHAT_PRICE = Number(process.env.CHAT_PRICE || 5);

type Params = { userId: string; characterId: string; threadId?: string; message: string };
export type ChatResult =
  | { status: "blocked"; reason?: string }
  | { status: "paywall"; balance: Balance }
  | { status: "ok"; threadId: string; reply: string; balance: Balance };

export async function handleChat(params: Params): Promise<ChatResult> {
  const { userId, characterId, message } = params;

  // Input moderation - bright-line safety gate (stub; replace with exec-2 classifier).
  if (screen(message).blocked) return { status: "blocked", reason: "safety_minor" };

  const [char] = await db.select().from(characters).where(eq(characters.id, characterId)).limit(1);
  if (!char) throw new Error("character not found");

  // Get or create the (user x character) thread.
  let threadId = params.threadId;
  if (!threadId) {
    const [t] = await db
      .insert(threads)
      .values({ userId, characterId, characterVersion: char.version })
      .returning({ id: threads.id });
    threadId = t.id;
  }

  // Charge for the turn BEFORE generating. Out of credits -> paywall.
  const charge = await spend(userId, CHAT_PRICE, { threadId, characterId });
  if (!charge.ok) return { status: "paywall", balance: charge.balance };

  // Persist the user turn, then assemble context.
  await db.insert(messages).values({ threadId, role: "user", content: message });
  const mem = await retrieveMemory(threadId, message);
  const recent = (
    await db
      .select({ role: messages.role, content: messages.content })
      .from(messages)
      .where(eq(messages.threadId, threadId))
      .orderBy(desc(messages.createdAt))
      .limit(8)
  ).reverse();

  const def = (char.definition ?? {}) as Record<string, string>;
  const system = [
    `You are ${def.name || "a companion"}, an AI character. Stay fully in character.`,
    def.persona ? `Personality: ${def.persona}` : "",
    def.backstory ? `Backstory: ${def.backstory}` : "",
    def.voice ? `Voice and style: ${def.voice}` : "",
    "You are an AI companion, not a real person. If asked directly, do not claim to be human or sentient.",
    mem.summary ? `What you remember so far: ${mem.summary}` : "",
    mem.items.length ? `Relevant memories:\n- ${mem.items.join("\n- ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const msgs: ChatMessage[] = [
    { role: "system", content: system },
    ...recent.map((m) => ({ role: (m.role === "user" ? "user" : "assistant") as const, content: m.content })),
  ];

  const res = await modelChat(msgs, { temperature: 0.9, maxTokens: 600 });
  let reply = res.text || "...";
  if (screen(reply).blocked) reply = "I can't go there - let's talk about something else.";

  await db.insert(messages).values({ threadId, role: "character", content: reply, tokenCount: res.usage.outputTokens });

  console.log("[generation_turn]", {
    threadId,
    model: res.model,
    inputTokens: res.usage.inputTokens,
    outputTokens: res.usage.outputTokens,
    recalled: mem.items.length,
    charged: charge.charged,
  });

  // Creator reward: dormant in Phase 0 (first-party creatorId is null). Only real
  // creator characters earn, and only on purchased-credit spend (exec-3 sec 7).
  if (char.creatorId && charge.fromPurchased > 0) {
    try {
      await rewardCreator(char.creatorId, 1);
    } catch {
      /* reward failure must not break chat */
    }
  }

  await extractAndStoreMemory(threadId, message, reply);
  await maybeUpdateSummary(threadId);
  await db.update(threads).set({ lastActiveAt: new Date() }).where(eq(threads.id, threadId));

  const balance = await userBalance(userId);
  return { status: "ok", threadId, reply, balance };
}
