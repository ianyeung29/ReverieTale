import OpenAI from "openai";

/**
 * Model adapter. Grok (xAI) and DeepSeek both expose OpenAI-compatible APIs,
 * so one client abstracts them. Swap provider via MODEL_PROVIDER env; the
 * explicit-capable/self-hosted model slots in here later behind the same interface.
 */
type Provider = "deepseek" | "grok";

const PROVIDERS: Record<Provider, { baseURL: string; keyEnv: string; defaultModel: string }> = {
  deepseek: { baseURL: "https://api.deepseek.com", keyEnv: "DEEPSEEK_API_KEY", defaultModel: "deepseek-chat" },
  grok: { baseURL: "https://api.x.ai/v1", keyEnv: "XAI_API_KEY", defaultModel: "grok-2-latest" },
};

function resolve() {
  const provider = (process.env.MODEL_PROVIDER || "deepseek") as Provider;
  const cfg = PROVIDERS[provider];
  if (!cfg) throw new Error(`Unknown MODEL_PROVIDER "${provider}" (use "deepseek" or "grok").`);
  const apiKey = process.env[cfg.keyEnv];
  if (!apiKey) throw new Error(`${cfg.keyEnv} is not set for MODEL_PROVIDER="${provider}".`);
  const model = process.env.MODEL_NAME || cfg.defaultModel;
  return { client: new OpenAI({ apiKey, baseURL: cfg.baseURL }), model };
}

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function chat(messages: ChatMessage[], opts: { temperature?: number; maxTokens?: number } = {}) {
  const { client, model } = resolve();
  const res = await client.chat.completions.create({
    model,
    messages,
    temperature: opts.temperature ?? 0.9,
    max_tokens: opts.maxTokens ?? 700,
  });
  return {
    text: res.choices[0]?.message?.content ?? "",
    usage: {
      inputTokens: res.usage?.prompt_tokens ?? 0,
      outputTokens: res.usage?.completion_tokens ?? 0,
    },
    model,
  };
}

/** Streaming variant: yields content deltas as they arrive. */
export async function* chatStream(messages: ChatMessage[], opts: { temperature?: number; maxTokens?: number } = {}) {
  const { client } = resolve();
  const stream = await client.chat.completions.create({
    model: resolve().model,
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
