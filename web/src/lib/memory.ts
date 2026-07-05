import { db } from "@/db";
import { memoryItems, memorySummaries, messages } from "@/db/schema";
import { cosineDistance, desc, eq, sql } from "drizzle-orm";
import { embed, embedOne } from "./embeddings";
import { chat } from "./model";
import { screen } from "./moderation";

const embeddingsOn = () => Boolean(process.env.EMBEDDINGS_API_KEY);

export type Recall = { summary?: string; items: string[] };

/** Load rolling summary + top-k semantically-recalled memory for this thread. */
export async function retrieveMemory(threadId: string, queryText: string, k = 6): Promise<Recall> {
  const out: Recall = { items: [] };

  const [summ] = await db
    .select({ summary: memorySummaries.summary })
    .from(memorySummaries)
    .where(eq(memorySummaries.threadId, threadId))
    .limit(1);
  if (summ) out.summary = summ.summary;

  if (!embeddingsOn()) return out; // memory recall is optional until an embeddings key is set
  try {
    const q = await embedOne(queryText);
    const sim = sql<number>`1 - (${cosineDistance(memoryItems.embedding, q)})`;
    const rows = await db
      .select({ content: memoryItems.content, sim })
      .from(memoryItems)
      .where(eq(memoryItems.threadId, threadId))
      .orderBy(desc(sim))
      .limit(k);
    out.items = rows.map((r) => r.content);
  } catch {
    /* recall failure must not break chat */
  }
  return out;
}

/** After a turn, extract durable memories about the user, gate them, embed + store. */
export async function extractAndStoreMemory(threadId: string, userMsg: string, assistantMsg: string) {
  if (!embeddingsOn()) return;

  let items: { type: string; content: string }[] = [];
  try {
    const res = await chat(
      [
        {
          role: "system",
          content:
            'Extract 0-3 durable facts or preferences about the USER from this exchange. ' +
            'Respond with strict JSON only: {"items":[{"type":"fact|preference|event","content":"..."}]}. ' +
            "Only lasting personal details worth remembering. If none, return {\"items\":[]}.",
        },
        { role: "user", content: `User: ${userMsg}\nCharacter: ${assistantMsg}` },
      ],
      { temperature: 0, maxTokens: 300 },
    );
    const json = res.text.match(/\{[\s\S]*\}/)?.[0] ?? '{"items":[]}';
    const parsed = JSON.parse(json);
    items = Array.isArray(parsed.items) ? parsed.items.slice(0, 3) : [];
  } catch {
    return;
  }

  // Extraction safety gate (exec-2): drop never-store / minor-coded candidates.
  const safe = items.filter((it) => it?.content && !screen(it.content).blocked);
  if (!safe.length) return;

  try {
    const embs = await embed(safe.map((s) => s.content));
    await db.insert(memoryItems).values(
      safe.map((s, i) => ({
        threadId,
        itemType: s.type || "fact",
        content: s.content,
        embedding: embs[i],
      })),
    );
  } catch {
    /* ignore storage failure */
  }
}

/** Every ~6 messages, regenerate a rolling summary from recent turns. */
export async function maybeUpdateSummary(threadId: string) {
  const [{ n }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(messages)
    .where(eq(messages.threadId, threadId));
  if (n < 6 || n % 6 !== 0) return;

  const recent = (
    await db
      .select({ role: messages.role, content: messages.content })
      .from(messages)
      .where(eq(messages.threadId, threadId))
      .orderBy(desc(messages.createdAt))
      .limit(12)
  ).reverse();
  const convo = recent.map((m) => `${m.role}: ${m.content}`).join("\n");

  try {
    const res = await chat(
      [
        {
          role: "system",
          content:
            "Summarize this conversation into a concise running memory (3-5 sentences) capturing what matters for continuity - notes about the user and the relationship.",
        },
        { role: "user", content: convo },
      ],
      { temperature: 0.3, maxTokens: 250 },
    );
    const [existing] = await db
      .select({ id: memorySummaries.id })
      .from(memorySummaries)
      .where(eq(memorySummaries.threadId, threadId))
      .limit(1);
    if (existing) {
      await db
        .update(memorySummaries)
        .set({ summary: res.text, updatedAt: new Date() })
        .where(eq(memorySummaries.id, existing.id));
    } else {
      await db.insert(memorySummaries).values({ threadId, summary: res.text });
    }
  } catch {
    /* ignore */
  }
}
