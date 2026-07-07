/**
 * Text-to-image adapter for character portraits. Providers:
 *   - "grok" (xAI Grok image, OpenAI-compatible) — Bearer key, sync.
 *   - "modelslab" (ModelsLab, FLUX) — key in the JSON body, sync or async (poll).
 *   - "fal" (fal.ai, FLUX.1 [dev]) — key in the Authorization header, sync.
 * Select with IMAGE_PROVIDER; the rest of the app is unchanged.
 */
const grokKey = () => process.env.XAI_IMAGE_KEY || process.env.XAI_API_KEY;

// Map a stored gender value to the noun image models respond to best.
function genderWord(gender?: string): string {
  if (!gender) return "";
  const x = gender.trim().toLowerCase();
  if (x === "female" || x === "woman" || x === "f") return "woman";
  if (x === "male" || x === "man" || x === "m") return "man";
  return "person"; // non-binary / other -> neutral
}

// Shared portrait-prompt builder so the create route (auto default portrait) and
// the portrait route (manual regen) produce identical, tasteful SFW prompts.
export function buildPortraitPrompt(b: {
  name?: string;
  gender?: string;
  age?: number;
  outfit?: string;
  look?: string;
  persona?: string;
  tags?: string[];
}): string {
  const g = genderWord(b.gender);
  const who = b.name ? (g ? `${g} named ${b.name}` : b.name) : g || "person";
  const subject = b.age ? `${b.age}-year-old adult ${who}` : who;
  const bits = [b.look, b.persona].filter(Boolean).join(". ");
  const outfit = b.outfit ? ` Wearing ${b.outfit}.` : "";
  const tags = b.tags?.length ? ` ${b.tags.join(", ")}.` : "";
  return (
    `Character portrait of ${subject}` +
    (bits ? `, ${bits}` : "") +
    `.${outfit}${tags} Upper-body portrait, looking at the viewer, soft cinematic lighting, detailed, high quality, tasteful, safe for work.`
  );
}

// Ambient background prompt for a story: an empty, atmospheric ENVIRONMENT built
// from the story's setting/genre/tone. Deliberately no people or text — it sits
// behind the prose as mood lighting, dimmed and blurred at render time.
export function buildScenePrompt(e: { setting?: string | null; genre?: string | null; tone?: string | null; scenario?: string | null }): string {
  const place = e.setting?.trim() || e.scenario?.trim() || "a quiet, intimate room at dusk";
  const genre = e.genre?.trim() ? `${e.genre.trim()} atmosphere` : "cinematic atmosphere";
  const tone = e.tone?.trim() ? `${e.tone.trim()} mood` : "warm, romantic mood";
  return (
    `Atmospheric establishing shot of ${place}. ${genre}, ${tone}. ` +
    `Empty scenery with no people and no text, soft depth of field, moody cinematic lighting, ` +
    `painterly, evocative, wide environment shot.`
  );
}

export function imageConfigured(): boolean {
  const provider = process.env.IMAGE_PROVIDER || "grok";
  if (provider === "grok") return Boolean(grokKey());
  if (provider === "modelslab") return Boolean(process.env.MODELSLAB_API_KEY);
  if (provider === "fal") return Boolean(process.env.FAL_KEY);
  return false;
}

export async function generateImage(prompt: string): Promise<{ base64: string; mime: string }> {
  const provider = process.env.IMAGE_PROVIDER || "grok";
  if (provider === "grok") return generateGrok(prompt);
  if (provider === "modelslab") return generateModelsLab(prompt);
  if (provider === "fal") return generateFal(prompt);
  throw new Error(`unsupported IMAGE_PROVIDER: ${provider}`);
}

// ---- xAI Grok (OpenAI-compatible images endpoint) ----------------------------
async function generateGrok(prompt: string): Promise<{ base64: string; mime: string }> {
  const key = grokKey();
  if (!key) throw new Error("XAI_IMAGE_KEY (or XAI_API_KEY) is not set");
  const model = process.env.IMAGE_MODEL || "grok-2-image";
  const base = (process.env.XAI_IMAGE_BASE_URL || "https://api.x.ai/v1").replace(/\/$/, "");

  const res = await fetch(`${base}/images/generations`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    // xAI's image endpoint takes model/prompt/n/response_format (no size/quality).
    body: JSON.stringify({ model, prompt, n: 1, response_format: "b64_json" }),
  });
  if (!res.ok) throw new Error(`grok ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`);

  const data = (await res.json()) as { data?: { b64_json?: string; url?: string }[] };
  const item = data.data?.[0];
  if (item?.b64_json) return { base64: item.b64_json, mime: "image/jpeg" };
  if (item?.url) return urlToImage(item.url);
  throw new Error("grok: no image in response");
}

async function urlToImage(url: string): Promise<{ base64: string; mime: string }> {
  const bin = await fetch(url);
  if (!bin.ok) throw new Error(`failed to fetch generated image (${bin.status})`);
  const buf = Buffer.from(await bin.arrayBuffer());
  const mime = /\.jpe?g($|\?)/i.test(url) ? "image/jpeg" : "image/png";
  return { base64: buf.toString("base64"), mime };
}

// ---- ModelsLab (FLUX) --------------------------------------------------------
type MlResp = {
  status?: string;
  output?: string[];
  fetch_result?: string;
  id?: number | string;
  message?: string;
  messege?: string; // ModelsLab's (misspelled) field
  eta?: number;
};

async function generateModelsLab(prompt: string): Promise<{ base64: string; mime: string }> {
  const key = process.env.MODELSLAB_API_KEY;
  if (!key) throw new Error("MODELSLAB_API_KEY is not set");
  const model = process.env.IMAGE_MODEL || "flux";
  const url = process.env.MODELSLAB_URL || "https://modelslab.com/api/v6/images/text2img";
  const payload = {
    key,
    model_id: model,
    prompt,
    negative_prompt: "",
    width: "768",
    height: "1024",
    samples: "1",
    num_inference_steps: "25",
    // "yes" blacks out images the provider flags as NSFW. Operator-configurable;
    // default safe. See IMAGE_SAFETY_CHECKER in .env for the compliance caveat.
    safety_checker: process.env.IMAGE_SAFETY_CHECKER || "yes",
    enhance_prompt: "no",
    base64: "no",
  };

  // "Try Again" = the model is warming up; ModelsLab wants a resubmit. Retry the
  // whole request a few times, polling fetch_result when it returns "processing".
  let lastMsg = "";
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error(`modelslab ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`);

    let data = (await res.json()) as MlResp;
    if (data.output?.[0]) return urlToImage(data.output[0]); // synchronous (e.g. realtime endpoint)

    if (data.status === "processing" && data.fetch_result) {
      data = await pollModelsLab(data.fetch_result, key);
      if (data.output?.[0]) return urlToImage(data.output[0]);
    }

    lastMsg = String(data.message || data.messege || data.status || "").trim();
    // Warm-up: wait and resubmit. Anything else is a real error.
    if (/try again|loading|warming/i.test(lastMsg)) {
      await new Promise((r) => setTimeout(r, 5000));
      continue;
    }
    throw new Error(`modelslab: ${lastMsg || "no image in response"}`);
  }
  throw new Error(`modelslab: the model kept warming up (${lastMsg || "Try Again"}) — wait a moment and retry`);
}

async function pollModelsLab(fetchUrl: string, key: string): Promise<MlResp> {
  let last: MlResp = { status: "processing" };
  // ~90s total; ModelsLab queue + generation can take a while on first use.
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const res = await fetch(fetchUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    if (!res.ok) continue;
    last = (await res.json()) as MlResp;
    if (last.output?.[0]) return last; // ready (regardless of exact status string)
    if (last.status === "error" || last.status === "failed") return last;
  }
  return last; // still processing; caller throws with context
}

// ---- fal.ai (FLUX.1 [dev]) ---------------------------------------------------
async function generateFal(prompt: string): Promise<{ base64: string; mime: string }> {
  const key = process.env.FAL_KEY;
  if (!key) throw new Error("FAL_KEY is not set");
  const model = process.env.IMAGE_MODEL || "fal-ai/flux/dev";

  const res = await fetch(`https://fal.run/${model}`, {
    method: "POST",
    headers: { Authorization: `Key ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, image_size: "portrait_4_3", num_images: 1, output_format: "jpeg", enable_safety_checker: (process.env.IMAGE_SAFETY_CHECKER || "yes") !== "no" }),
  });
  if (!res.ok) throw new Error(`fal ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`);

  const data = (await res.json()) as { images?: { url?: string; content_type?: string }[] };
  const img = data.images?.[0];
  if (!img?.url) throw new Error("no image returned");
  return urlToImage(img.url);
}
