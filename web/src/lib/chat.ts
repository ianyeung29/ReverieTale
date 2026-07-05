import { db } from "@/db";
import { characters, messages, threads } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { chat as modelChat, type ChatMessage } from "./model";
import { screen } from "./moderation";
import { extractAndStoreMemory, maybeUpdateSummary, retrieveMemory } from "./memory";

type Params = { userId: string; characterId: string; threadId?: string; message: string };
type Result =
  | { blocked: true; reason?: string }
  | { blocked: false; threadId: string; reply: string };

export async function handleChat(params: Params): Promise<Result> {
  const { userId, characterId, message } = params;

  // Input moderation - bright-line safety gate (stub; replace with exec-2 classifier).
  const inCheck = screen(message);
  if (inCheck.blocked) return { blocked: true, reason: inCheck.reason };

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

  // Persist the user turn, then assemble context (summary + recall + recent turns).
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

  // Output moderation.
  if (screen(reply).blocked) reply = "I can't go there - let's talk about something else.";

  await db.insert(messages).values({ threadId, role: "character", content: reply, tokenCount: res.usage.outputTokens });

  // Content-free cost telemetry (exec-1 generation_turn).
  console.log("[generation_turn]", {
    threadId,
    model: res.model,
    inputTokens: res.usage.inputTokens,
    outputTokens: res.usage.outputTokens,
    recalled: mem.items.length,
  });

  // Memory upkeep. Awaited for MVP simplicity; move to a background task later.
  await extractAndStoreMemory(threadId, message, reply);
  await maybeUpdateSummary(threadId);
  await db.update(threads).set({ lastActiveAt: new Date() }).where(eq(threads.id, threadId));

  return { blocked: false, threadId, reply };
}
