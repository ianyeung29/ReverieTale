import { db } from "@/db";
import { characters, messages, stories, threads } from "@/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { chat as modelChat, type ChatMessage } from "./model";
import { screen } from "./moderation";
import { extractAndStoreMemory, maybeUpdateSummary, retrieveMemory } from "./memory";
import { rewardCreatorShare, spend, userBalance, type Balance, type SpendResult } from "./ledger";

const CHAT_PRICE = Number(process.env.CHAT_PRICE || 1);
// First N messages a reader sends to any one companion are free, across all of
// their threads with that companion (a fresh story thread doesn't reset it).
const FREE_CHAT_MESSAGES = Number(process.env.FREE_CHAT_MESSAGES || 5);

async function freeMessagesUsed(userId: string, characterId: string): Promise<number> {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(messages)
    .innerJoin(threads, eq(messages.threadId, threads.id))
    .where(and(eq(threads.userId, userId), eq(threads.characterId, characterId), eq(messages.role, "user")));
  return row?.n ?? 0;
}

type Params = { userId: string; characterId: string; threadId?: string; message: string; storyId?: string; chapter?: number };
type CharRow = typeof characters.$inferSelect;
type OkSpend = Extract<SpendResult, { ok: true }>;

const CHAPTER_SEP = /\n{2,}·\s·\s·\n{2,}/;
function splitChapters(content: string): string[] {
  const parts = content.split(CHAPTER_SEP).map((s) => s.trim()).filter(Boolean);
  return parts.length ? parts : [content.trim()];
}

/** Compress the story-so-far into a companion's memory of it (spoiler-free beyond the text given). */
async function summarizeStory(title: string, text: string): Promise<string> {
  try {
    const res = await modelChat(
      [
        {
          role: "system",
          content:
            "You are compressing a story into a companion's memory of it. In 3-6 sentences, summarize ONLY what is written below - the events, the emotional beats, and where things stand at the end of this excerpt. Write it as a shared memory between you and the reader (\"you and them\"). Never invent anything beyond the text, and never hint at events that haven't happened yet.",
        },
        { role: "user", content: `Title: ${title}\n\n${text}` },
      ],
      { temperature: 0.3, maxTokens: 300 },
    );
    return res.text?.trim() || `You and them shared a story titled "${title}".`;
  } catch {
    return `You and them shared a story titled "${title}".`;
  }
}

/**
 * Seed or refresh a thread's durable "story we shared" memory, bounded to the
 * chapters the reader has actually read (no spoilers). Only regenerates when the
 * reading position advances past what's already stored, so it's cheap to call
 * on every message. Best-effort: failures never block the chat.
 */
async function ensureStoryContext(threadId: string, storyId: string, chapter?: number) {
  const [t] = await db
    .select({ sId: threads.storyId, chap: threads.storyContextChapter })
    .from(threads)
    .where(eq(threads.id, threadId))
    .limit(1);
  const sameStory = t?.sId === storyId;
  const have = sameStory ? t?.chap ?? 0 : 0;

  const [story] = await db.select({ title: stories.title, content: stories.content }).from(stories).where(eq(stories.id, storyId)).limit(1);
  if (!story) return;
  const chapters = splitChapters(story.content);
  // `chapter` = how many chapters the reader has read; default to all that exist.
  const want = chapter && chapter > 0 ? Math.min(chapter, chapters.length) : chapters.length;
  if (sameStory && want <= have) return; // already covered up to here

  const synopsis = await summarizeStory(story.title, chapters.slice(0, want).join("\n\n"));
  await db.update(threads).set({ storyId, storyContext: synopsis, storyContextChapter: want }).where(eq(threads.id, threadId));
}

export type Prep =
  | { status: "blocked"; reason?: string }
  | { status: "paywall"; balance: Balance }
  | { status: "ready"; threadId: string; msgs: ChatMessage[]; char: CharRow; charge: OkSpend };

export type ChatResult =
  | { status: "blocked"; reason?: string }
  | { status: "paywall"; balance: Balance }
  | { status: "ok"; threadId: string; reply: string; messageId: string; balance: Balance };

/** Everything up to (and including) charging + prompt assembly, before generation. */
export async function prepareChat(params: Params): Promise<Prep> {
  const { userId, characterId, message } = params;

  if (screen(message).blocked) return { status: "blocked", reason: "safety_minor" };

  const [char] = await db.select().from(characters).where(eq(characters.id, characterId)).limit(1);
  if (!char) throw new Error("character not found");
  const def = (char.definition ?? {}) as Record<string, string>;

  let threadId = params.threadId;
  if (!threadId) {
    const [t] = await db.insert(threads).values({ userId, characterId, characterVersion: char.version }).returning({ id: threads.id });
    threadId = t.id;
    // The character opens the conversation, for real: persisted as message #1
    // (not just a decorative empty-state bubble), so it survives a reload and
    // the model sees its own opening line as context on the very first reply.
    if (def.greeting?.trim()) {
      await db.insert(messages).values({ threadId, role: "character", content: def.greeting.trim() });
    }
  }

  // Seed / refresh the durable story memory, bounded to the chapters read so far.
  if (params.storyId) {
    try {
      await ensureStoryContext(threadId, params.storyId, params.chapter);
    } catch {
      /* story memory is best-effort; never block the chat */
    }
  }

  const used = await freeMessagesUsed(userId, characterId);
  const isFreeMessage = used < FREE_CHAT_MESSAGES;
  const spendResult: SpendResult = isFreeMessage
    ? { ok: true, charged: 0, fromPurchased: 0, fromEarned: 0, balance: await userBalance(userId) }
    : await spend(userId, CHAT_PRICE, { threadId, characterId });
  if (!spendResult.ok) return { status: "paywall", balance: spendResult.balance };
  const charge = spendResult;

  await db.insert(messages).values({ threadId, role: "user", content: message });
  const [tRow] = await db.select({ sc: threads.storyContext }).from(threads).where(eq(threads.id, threadId)).limit(1);
  const mem = await retrieveMemory(threadId, userId, characterId, message);
  const recent = (
    await db
      .select({ role: messages.role, content: messages.content })
      .from(messages)
      .where(eq(messages.threadId, threadId))
      .orderBy(desc(messages.createdAt))
      .limit(12)
  ).reverse();

  const system = [
    `You are ${def.name || "a companion"}, an AI character. Stay fully in character.`,
    def.gender ? `Gender: ${def.gender}.` : "",
    def.age ? `Age: ${def.age} (an adult).` : "",
    def.persona ? `Personality: ${def.persona}` : "",
    def.look ? `Appearance: ${def.look}` : "",
    def.backstory ? `Backstory: ${def.backstory}` : "",
    def.voice ? `Voice and style: ${def.voice}` : "",
    "You are an AI companion, not a real person. If asked directly, do not claim to be human or sentient.",
    tRow?.sc ? `A story you and them lived through together, as you remember it up to where they've read (do not reference anything beyond this): ${tRow.sc}` : "",
    mem.summary ? `What you remember from talking together: ${mem.summary}` : "",
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
}): Promise<Balance & { messageId: string }> {
  const { userId, char, threadId, userMessage, reply, usage, charge } = args;

  const [inserted] = await db
    .insert(messages)
    .values({ threadId, role: "character", content: reply, tokenCount: usage.outputTokens })
    .returning({ id: messages.id });

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

  const balance = await userBalance(userId);
  return { ...balance, messageId: inserted.id };
}

/** Non-streaming path (kept as the fallback). */
export async function handleChat(params: Params): Promise<ChatResult> {
  const prep = await prepareChat(params);
  if (prep.status === "blocked") return { status: "blocked", reason: prep.reason };
  if (prep.status === "paywall") return { status: "paywall", balance: prep.balance };

  const res = await modelChat(prep.msgs, { temperature: 0.9, maxTokens: 600 });
  let reply = res.text || "...";
  if (screen(reply).blocked) reply = "I can't go there - let's talk about something else.";

  const { messageId, ...balance } = await finalizeChat({
    userId: params.userId,
    char: prep.char,
    threadId: prep.threadId,
    userMessage: params.message,
    reply,
    usage: res.usage,
    charge: prep.charge,
  });

  return { status: "ok", threadId: prep.threadId, reply, messageId, balance };
}
