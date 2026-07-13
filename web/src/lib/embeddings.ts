import OpenAI from "openai";

/**
 * Embeddings adapter (pluggable, OpenAI-compatible). Default target is a cheap
 * hosted model (OpenAI text-embedding-3-small, 1536 dims). Point EMBEDDINGS_BASE_URL
 * at Voyage/Jina/a local server to swap. Keep the dimension in sync with schema EMBED_DIM.
 */
export const EMBEDDING_DIM = Number(process.env.EMBEDDINGS_DIM || 1536);

function client() {
  const apiKey = process.env.EMBEDDINGS_API_KEY;
  const baseURL = process.env.EMBEDDINGS_BASE_URL || "https://api.openai.com/v1";
  if (!apiKey) throw new Error("EMBEDDINGS_API_KEY is not set.");
  return new OpenAI({ apiKey, baseURL });
}

export async function embed(input: string | string[]): Promise<number[][]> {
  const model = process.env.EMBEDDINGS_MODEL || "text-embedding-3-small";
  const res = await client().embeddings.create({ model, input });
  return res.data.map((d) => d.embedding as number[]);
}

export async function embedOne(text: string): Promise<number[]> {
  return (await embed(text))[0];
}
