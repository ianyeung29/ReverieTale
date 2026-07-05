import OpenAI from "openai";

/**
 * Model gateway with content tiers.
 *
 *  - "standard": the default, non-explicit lane (DeepSeek/Grok via MODEL_PROVIDER).
 *  - "explicit": a SEPARATE, operator-configured lane. OFF by default. The operator
 *    supplies the endpoint (EXPLICIT_MODEL_*) AND the system prompt (loaded from env,
 *    never authored here). It only activates when EXPLICIT_ENABLED=true AND the lane
 *    is fully configured AND the caller has passed the age/compliance gate.
 *
 * IMPORTANT: enabling the explicit lane is NOT sufficient to run explicit content
 * to real users - age verification, the CSAM/illegal-content moderation pipeline,
 * an adult-permitting payment processor + host, and counsel must be in place first.
 */
export type Tier = "standard" | "explicit";

type Provider = "deepseek" | "grok";
const PROVIDERS: Record<Provider, { baseURL: string; keyEnv: string; defaultModel: string }> = {
  deepseek: { baseURL: "https://api.deepseek.com", keyEnv: "DEEPSEEK_API_KEY", defaultModel: "deepseek-chat" },
  grok: { baseURL: "https://api.x.ai/v1", keyEnv: "XAI_API_KEY", defaultModel: "grok-2-latest" },
};

function resolveStandard() {
  const provider = (process.env.MODEL_PROVIDER || "deepseek") as Provider;
  const cfg = PROVIDERS[provider];
  if (!cfg) throw new Error(`Unknown MODEL_PROVIDER "${provider}" (use "deepseek" or "grok").`);
  const apiKey = process.env[cfg.keyEnv];
  if (!apiKey) throw new Error(`${cfg.keyEnv} is not set for MODEL_PROVIDER="${provider}".`);
  return { client: new OpenAI({ apiKey, baseURL: cfg.baseURL }), model: process.env.MODEL_NAME || cfg.defaultModel };
}

/** True only if the explicit lane is switched on AND fully configured by the operator. */
export function explicitConfigured(): boolean {
  return (
    process.env.EXPLICIT_ENABLED === "true" &&
    Boolean(process.env.EXPLICIT_MODEL_BASE_URL && process.env.EXPLICIT_MODEL_KEY && process.env.EXPLICIT_MODEL_NAME)
  );
}

/** Decide the effective tier: explicit only if requested AND configured AND age-gated. */
export function resolveTier(requested: Tier | undefined, opts: { ageVerified: boolean }): Tier {
  if (requested === "explicit" && explicitConfigured() && opts.ageVerified) return "explicit";
  return "standard";
}

function resolveLane(tier: Tier) {
  if (tier === "explicit") {
    const baseURL = process.env.EXPLICIT_MODEL_BASE_URL;
    const apiKey = process.env.EXPLICIT_MODEL_KEY;
    const model = process.env.EXPLICIT_MODEL_NAME;
    if (!baseURL || !apiKey || !model) throw new Error("explicit lane not configured");
    return { client: new OpenAI({ apiKey, baseURL }), model };
  }
  return resolveStandard();
}

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };
type ChatOpts = { temperature?: number; maxTokens?: number; tier?: Tier };

export async function chat(messages: ChatMessage[], opts: ChatOpts = {}) {
  const { client, model } = resolveLane(opts.tier ?? "standard");
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
  const { client, model } = resolveLane(opts.tier ?? "standard");
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
