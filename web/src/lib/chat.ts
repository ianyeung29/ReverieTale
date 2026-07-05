import { db } from "@/db";
import { characters, memorySummaries, messages, stories, threads } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { chat as modelChat, type ChatMessage } from "./model";
import { screen } from "./moderation";
import { extractAndStoreMemory, maybeUpdateSummary, retrieveMemory } from "./memory";
import { rewardCreatorShare, spend, userBalance, type Balance, type SpendResult } from "./ledger";

const CHAT_PRICE = Number(process.env.CHAT_PRICE || 1);

type Params = { userId: string; characterId: string; threadId?: string; message: string; storyId?: string };
type CharRow = typeof characters.$inferSelect;
type OkSpend = Extract<SpendResult, { ok: true }>;

export type Prep =
  | { status: "blocked"; reason?: string }
  | { status: "paywall"; balance: Balance }
  | { status: "ready"; threadId: string; msgs: ChatMessage[]; char: CharRow; charge: OkSpend };

export type ChatResult =
  | { status: "blocked"; reason?: string }
  | { status: "paywall"; balance: Balance }
  | { status: "ok"; threadId: string; reply: string; balance: Balance };

/** Everything up to (and including) charging + prompt assembly, before generation. */
export async function prepareChat(params: Params): Promise<Prep> {
  const { userId, characterId, message } = params;

  if (screen(message).blocked) return { status: "blocked", reason: "safety_minor" };

  const [char] = await db.select().from(characters).where(eq(characters.id, characterId)).limit(1);
  if (!char) throw new Error("character not found");

  let threadId = params.threadId;
  if (!threadId) {
    const [t] = await db.insert(threads).values({ userId, characterId, characterVersion: char.version }).returning({ id: threads.id });
    threadId = t.id;
    if (params.storyId) {
      const [story] = await db.select().from(stories).where(eq(stories.id, params.storyId)).limit(1);
      if (story) {
        await db.insert(memorySummaries).values({
          threadId,
          summary: `Earlier, you and them shared a story together titled "${story.title}". ${story.content.slice(0, 600)}`,
        });
      }
    }
  }

  const charge = await spend(userId, CHAT_PRICE, { threadId, characterId });
  if (!charge.ok) return { status: "paywall", balance: charge.balance };

  await db.insert(messages).values({ threadId, role: "user", content: message });
  const mem = await retrieveMemory(threadId, userId, characterId, message);
  const recent = (
    await db
      .select({ role: messages.role, content: messages.content })
      .from(messages)
      .where(eq(messages.threadId, threadId))
      .orderBy(desc(messages.createdAt))
      .limit(12)
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
    ...recent.map((m): ChatMessage => ({ role: m.role === "user" ? "user" : "assistant", content: m.content })),
  ];

  return { status: "ready", threadId, msgs, char, charge };
}

/** Persist the reply, log cost, reward creator, run memory upkeep; returns new balance. */
export async function finalizeChat(args: {
  userId: string;
  char: CharRow;
  threadId: string;
  userMessage: string;
  reply: string;
  usage: { inputTokens: number; outputTokens: number };
  charge: OkSpend;
  recalled?: number;
}): Promise<Balance> {
  const { userId, char, threadId, userMessage, reply, usage, charge } = args;

  await db.insert(messages).values({ threadId, role: "character", content: reply, tokenCount: usage.outputTokens });

  console.log("[generation_turn]", {
    threadId,
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    recalled: args.recalled ?? 0,
    charged: charge.charged,
  });

  // Creator revenue share: a cut of the reader's PURCHASED spend (not free drip),
  // and only when someone OTHER than the creator is chatting.
  if (char.creatorId && char.creatorId !== userId && charge.fromPurchased > 0) {
    try {
      await rewardCreatorShare(char.creatorId, charge.fromPurchased);
    } catch {
      /* reward failure must not break chat */
    }
  }

  await extractAndStoreMemory(threadId, userMessage, reply);
  await maybeUpdateSummary(threadId);
  await db.update(threads).set({ lastActiveAt: new Date() }).where(eq(threads.id, threadId));

  return userBalance(userId);
}

/** Non-streaming path (kept as the fallback). */
export async function handleChat(params: Params): Promise<ChatResult> {
  const prep = await prepareChat(params);
  if (prep.status === "blocked") return { status: "blocked", reason: prep.reason };
  if (prep.status === "paywall") return { status: "paywall", balance: prep.balance };

  const res = await modelChat(prep.msgs, { temperature: 0.9, maxTokens: 600 });
  let reply = res.text || "...";
  if (screen(reply).blocked) reply = "I can't go there - let's talk about something else.";

  const balance = await finalizeChat({
    userId: params.userId,
    char: prep.char,
    threadId: prep.threadId,
    userMessage: params.message,
    reply,
    usage: res.usage,
    charge: prep.charge,
  });

  return { status: "ok", threadId: prep.threadId, reply, balance };
}
