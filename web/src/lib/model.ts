import OpenAI from "openai";

/**
 * The single, 13+ model gateway for Reverie-Tale. Content safety belongs in
 * the prompts and moderation layer; there is intentionally no alternate
 * mature-content provider or route to accidentally enable.
 */
type Provider = "deepseek" | "grok";
const PROVIDERS: Record<Provider, { baseURL: string; keyEnv: string; defaultModel: string }> = {
  deepseek: { baseURL: "https://api.deepseek.com", keyEnv: "DEEPSEEK_API_KEY", defaultModel: "deepseek-chat" },
  grok: { baseURL: "https://api.x.ai/v1", keyEnv: "XAI_API_KEY", defaultModel: "grok-2-latest" },
};

function resolveModel() {
  const provider = (process.env.MODEL_PROVIDER || "deepseek") as Provider;
  const cfg = PROVIDERS[provider];
  if (!cfg) throw new Error(`Unknown MODEL_PROVIDER "${provider}" (use "deepseek" or "grok").`);
  const apiKey = process.env[cfg.keyEnv];
  if (!apiKey) throw new Error(`${cfg.keyEnv} is not set for MODEL_PROVIDER="${provider}".`);
  return { client: new OpenAI({ apiKey, baseURL: cfg.baseURL }), model: process.env.MODEL_NAME || cfg.defaultModel };
}

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };
type ChatOpts = { temperature?: number; maxTokens?: number };

export async function chat(messages: ChatMessage[], opts: ChatOpts = {}) {
  const { client, model } = resolveModel();
  const res = await client.chat.completions.create({
    model,
    messages,
    temperature: opts.temperature ?? 0.9,
    max_tokens: opts.maxTokens ?? 700,
  });
  return {
    text: res.choices[0]?.message?.content ?? "",
    usage: { inputTokens: res.usage?.prompt_tokens ?? 0, outputTokens: res.usage?.completion_tokens ?? 0 },
    model,
  };
}

/** Streaming variant: yields content deltas as they arrive. */
export async function* chatStream(messages: ChatMessage[], opts: ChatOpts = {}) {
  const { client, model } = resolveModel();
  const stream = await client.chat.completions.create({
    model,
    messages,
    temperature: opts.temperature ?? 0.9,
    max_tokens: opts.maxTokens ?? 600,
    stream: true,
  });
  for await (const chunk of stream) {
    const delta = chunk.choices?.[0]?.delta?.content;
    if (delta) yield delta as string;
  }
}
