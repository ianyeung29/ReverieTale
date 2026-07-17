/**
 * Text-to-image adapter for character portraits. Providers:
 *   - "grok" (xAI Grok image, OpenAI-compatible) — Bearer key, sync.
 *   - "modelslab" (ModelsLab, FLUX) — key in the JSON body, sync or async (poll).
 *   - "fal" (fal.ai, FLUX.1 [dev]) — key in the Authorization header, sync.
 * Select with IMAGE_PROVIDER; the rest of the app is unchanged.
 */
const grokKey = () => process.env.XAI_IMAGE_KEY || process.env.XAI_API_KEY;

// Image providers occasionally keep a connection open without returning either
// a result or an error. Bound every request so a single stalled generation never
// freezes catalogue seeding or a reader-facing route indefinitely.
const IMAGE_REQUEST_TIMEOUT_MS = Number(process.env.IMAGE_REQUEST_TIMEOUT_MS || 90_000);
const MODELSLAB_POLL_INTERVAL_MS = Number(process.env.MODELSLAB_POLL_INTERVAL_MS || 4_000);
const MODELSLAB_POLL_MAX_MS = Number(process.env.MODELSLAB_POLL_MAX_MS || 240_000);
// A request timeout alone is not enough: ModelsLab may first queue a job and
// then continue returning "processing". Keep the complete submit-and-poll
// lifecycle bounded so a seed run can move on to the next portrait.
const MODELSLAB_GENERATION_MAX_MS = Number(process.env.MODELSLAB_GENERATION_MAX_MS || 180_000);
function imageFetch(input: RequestInfo | URL, init?: RequestInit, timeoutMs = IMAGE_REQUEST_TIMEOUT_MS): Promise<Response> {
  return fetch(input, { ...init, signal: AbortSignal.timeout(timeoutMs) });
}

// Map a stored gender value to the noun image models respond to best.
function genderWord(gender?: string): string {
  if (!gender) return "";
  const x = gender.trim().toLowerCase();
  if (x === "female" || x === "woman" || x === "f") return "woman";
  if (x === "male" || x === "man" || x === "m") return "man";
  return "person"; // non-binary / other -> neutral
}

// A character is drawn in one consistent art style, and BOTH the portrait and
// every scene/chapter image for that character must use it - otherwise a
// cartoon-looking character ends up with photorealistic chapter images (or vice
// versa). Default is realistic; "anime" characters stay illustrated everywhere.
export type ArtStyle = "realistic" | "anime";
export function normalizeStyle(s?: string | null): ArtStyle {
  const x = (s || "").trim().toLowerCase();
  return x === "anime" || x === "cartoon" || x === "illustrated" ? "anime" : "realistic";
}
// Trailing style tags for a *portrait* (upper-body headshot).
function portraitStyleTag(style: ArtStyle): string {
  return style === "anime"
    ? "anime illustration, cel-shaded, clean linework, vibrant colors, soft anime shading, high quality"
    : "photorealistic, soft cinematic lighting, detailed, high quality";
}
// The leading frame + trailing tags for a wide *scene* image, per style.
function sceneStyle(style: ArtStyle): { lead: string; tail: string } {
  return style === "anime"
    ? { lead: "Anime-style illustration, cinematic anime key visual", tail: "cel-shaded, clean linework, vibrant colors, soft anime shading, evocative mood, tasteful, safe for work." }
    : { lead: "Photorealistic cinematic film still", tail: "realistic photography, sharp focus, natural cinematic lighting, evocative mood, tasteful, safe for work." };
}

// This is a companion app - portraits are meant to read as conventionally
// attractive, per gender, while staying inside the "tasteful, safe for work"
// line the trailing style tags enforce below.
function attractivenessPhrase(gender?: string): string {
  const g = genderWord(gender);
  if (g === "woman") return "expressive, approachable features";
  if (g === "man") return "expressive, approachable features";
  return "expressive, approachable features";
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
  style?: string;
}): string {
  const g = genderWord(b.gender);
  const who = b.name ? (g ? `${g} named ${b.name}` : b.name) : g || "person";
  const subject = b.age ? `${b.age}-year-old ${who}` : who;
  const bits = [b.look, b.persona].filter(Boolean).join(". ");
  const outfit = b.outfit ? ` Wearing ${b.outfit}.` : "";
  const tags = b.tags?.length ? ` ${b.tags.join(", ")}.` : "";
  return (
    `Character portrait of ${subject}, ${attractivenessPhrase(b.gender)}` +
    (bits ? `, ${bits}` : "") +
    `.${outfit}${tags} Upper-body portrait, looking at the viewer, ${portraitStyleTag(normalizeStyle(b.style))}, tasteful, safe for work.`
  );
}

// Ambient background prompt for a story: an empty, atmospheric ENVIRONMENT built
// from the story's setting/genre/tone. Deliberately no people or text — it sits
// behind the prose as mood lighting, dimmed and blurred at render time.
export function buildScenePrompt(e: { setting?: string | null; genre?: string | null; tone?: string | null; scenario?: string | null }): string {
  const place = e.setting?.trim() || e.scenario?.trim() || "a quiet, intimate room at dusk";
  const genre = e.genre?.trim() ? `${e.genre.trim()} atmosphere` : "cinematic atmosphere";
  const tone = e.tone?.trim() ? `${e.tone.trim()} mood` : "warm, inviting mood";
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

// Scene-image generation (character scene art + per-chapter scenes) is a real
// per-image cost with the provider, and generating one behind EVERY chapter
// adds up fast. Gate it so the operator opts in at the volume they want:
//   unset               -> character scenes + the opening chapter scene
//   "off"               -> no scene images (zero extra spend)
//   "opening" / "on"   -> character scenes + only chapter 1's opening scene
//   "all"             -> a scene for every chapter (the expensive mode)
// Portraits and the story ambient background are separate and unaffected.
export type SceneMode = "off" | "opening" | "all";
export function sceneImageMode(): SceneMode {
  const v = (process.env.SCENE_IMAGES || "opening").trim().toLowerCase();
  if (v === "all") return "all";
  if (v === "opening" || v === "on" || v === "true" || v === "1") return "opening";
  return "off";
}

/** Should a scene be generated for chapter `index` (0-based) under the current mode? */
export function shouldGenerateChapterScene(index: number): boolean {
  const mode = sceneImageMode();
  if (!imageConfigured()) return false;
  if (mode === "all") return true;
  if (mode === "opening") return index === 0;
  return false;
}

/** Should character scene art be generated under the current mode? */
export function shouldGenerateCharacterScene(): boolean {
  return sceneImageMode() !== "off" && imageConfigured();
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

  const res = await imageFetch(`${base}/images/generations`, {
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

async function urlToImage(url: string, timeoutMs = IMAGE_REQUEST_TIMEOUT_MS): Promise<{ base64: string; mime: string }> {
  const bin = await imageFetch(url, undefined, timeoutMs);
  if (!bin.ok) throw new Error(`failed to fetch generated image (${bin.status})`);
  // ModelsLab's base64 mode (img2img / face_swap / ip-adapter) returns a URL to a
  // ".base64" TEXT file whose CONTENTS are the image's base64. Fetch it as text
  // and use that directly - re-encoding its bytes would double-encode into
  // garbage (a broken image).
  if (/\.base64($|\?)/i.test(url)) {
    const txt = (await bin.text()).trim();
    const m = txt.match(/^data:([^;]+);base64,(.+)$/s);
    const b64 = m ? m[2] : txt;
    return { base64: b64, mime: m && /^image\//.test(m[1]) ? m[1] : mimeFromBase64(b64) };
  }
  const buf = Buffer.from(await bin.arrayBuffer());
  const responseMime = bin.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  const mime = responseMime?.startsWith("image/")
    ? responseMime
    : /\.jpe?g($|\?)/i.test(url) ? "image/jpeg" : "image/png";
  return { base64: buf.toString("base64"), mime };
}

// Detect an image mime from the first decoded bytes of a base64 payload.
function mimeFromBase64(base64: string): string {
  try {
    const b = Buffer.from(base64, "base64");
    if (b[0] === 0xff && b[1] === 0xd8) return "image/jpeg";
    if (b[0] === 0x89 && b[1] === 0x50) return "image/png";
    if (b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") return "image/webp";
    if (b.toString("ascii", 0, 3) === "GIF") return "image/gif";
  } catch {
    /* fall through */
  }
  return "image/png";
}

// ModelsLab's `output` entries are normally URLs, but img2img with base64:"yes"
// can hand back a data URI or a bare base64 string instead - handle both.
async function outputToImage(value: string, timeoutMs = IMAGE_REQUEST_TIMEOUT_MS): Promise<{ base64: string; mime: string }> {
  // Strip any base64 data-URI prefix (not just image/* ones) so we always store
  // raw base64, never "data:...;base64,..." which decodes to garbage.
  const dataUri = value.match(/^data:([^;]+);base64,(.+)$/s);
  if (dataUri) return { base64: dataUri[2], mime: /^image\//.test(dataUri[1]) ? dataUri[1] : "image/png" };
  if (/^https?:\/\//i.test(value)) return urlToImage(value, timeoutMs);
  return { base64: value, mime: "image/png" };
}

// Sanity-check that a base64 payload actually decodes to a real image (magic
// bytes), so a provider handing back an error page / JSON / empty body where we
// expected an image never gets stored as a broken picture.
function looksLikeImage(base64: string): boolean {
  try {
    const b = Buffer.from(base64, "base64");
    if (b.length < 100) return false;
    return (
      (b[0] === 0xff && b[1] === 0xd8) || // JPEG
      (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) || // PNG
      (b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") || // WEBP
      b.toString("ascii", 0, 3) === "GIF" // GIF
    );
  } catch {
    return false;
  }
}

// ---- ModelsLab (FLUX) --------------------------------------------------------
type MlResp = {
  status?: string;
  output?: string[];
  proxy_links?: string[];
  fetch_result?: string;
  id?: number | string;
  message?: string;
  messege?: string; // ModelsLab's (misspelled) field
  eta?: number;
};

async function generateModelsLab(prompt: string, ref?: { image: string }): Promise<{ base64: string; mime: string }> {
  const key = process.env.MODELSLAB_API_KEY;
  if (!key) throw new Error("MODELSLAB_API_KEY is not set");
  const model = process.env.IMAGE_MODEL || "z-image-base";
  const url = process.env.MODELSLAB_URL || "https://modelslab.com/api/v6/images/text2img";
  const safetyChecker = process.env.IMAGE_SAFETY_CHECKER || "yes";
  const payload: Record<string, string | number | null> = model === "z-image-base"
    ? {
        key,
        model_id: model,
        prompt,
        negative_prompt: null,
        width: 768,
        height: 1024,
        samples: 1,
        guidance_scale: Number(process.env.MODELSLAB_GUIDANCE_SCALE || 5),
        safety_checker: safetyChecker,
        safety_checker_type: process.env.IMAGE_SAFETY_CHECKER_TYPE || "black",
        num_inference_steps: Number(process.env.MODELSLAB_STEPS || 30),
        seed: null,
        webhook: null,
        track_id: null,
        base64: "no",
        highres_fix: null,
        watermark: "no",
        temp: "no",
      }
    : {
        key,
        model_id: model,
        prompt,
        negative_prompt: "",
        width: "768",
        height: "1024",
        samples: "1",
        num_inference_steps: "25",
        safety_checker: safetyChecker,
        enhance_prompt: "no",
        base64: "no",
      };

  // IP-Adapter: condition this text2img generation on a reference face (the
  // character's portrait) so the scene renders as the SAME person, not a
  // text-described lookalike. The adapter id must match the base model family;
  // it and the strength are env-overridable because the right values depend on
  // IMAGE_MODEL and need tuning against the live account.
  if (ref?.image) {
    payload.ip_adapter_id = process.env.IP_ADAPTER_ID || "ip-adapter-plus-face_sd15";
    payload.ip_adapter_image = ref.image;
    payload.ip_adapter_scale = process.env.IP_ADAPTER_SCALE || "0.6";
    // ip_adapter_image is base64 data, not a URL.
    payload.base64 = "yes";
  }

  // "Try Again" = the model is warming up; ModelsLab wants a resubmit. Retry the
  // whole request a few times, polling fetch_result when it returns "processing".
  const deadline = Date.now() + MODELSLAB_GENERATION_MAX_MS;
  const takeOutput = (value: string) => outputToImage(value, Math.max(1, deadline - Date.now()));
  let lastMsg = "";
  for (let attempt = 0; attempt < 4; attempt++) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) {
      throw new Error(`modelslab generation timed out after ${Math.round(MODELSLAB_GENERATION_MAX_MS / 1000)} seconds`);
    }
    const res = await imageFetch(
      url,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) },
      Math.min(IMAGE_REQUEST_TIMEOUT_MS, remaining),
    );
    if (!res.ok) throw new Error(`modelslab ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`);

    let data = (await res.json()) as MlResp;
    if (data.output?.[0]) return takeOutput(data.output[0]); // synchronous (e.g. realtime endpoint)

    // The v6 text-to-image contract documents result retrieval at
    // /api/v6/images/fetch/:id. Prefer that stable endpoint over the optional
    // fetch_result field, while retaining it as a fallback for older responses.
    const fetchUrl = data.id != null
      ? `https://modelslab.com/api/v6/images/fetch/${encodeURIComponent(String(data.id))}`
      : data.fetch_result;
    if (data.status === "processing" && fetchUrl) {
      const jobId = data.id ?? "unknown";
      console.log(`[image] ModelsLab job ${jobId} queued; polling for its result`);
      data = await pollModelsLab(fetchUrl, key, deadline);
      if (data.output?.[0]) return takeOutput(data.output[0]);
      const message = String(data.message || data.messege || data.status || "no result").trim();
      throw new Error(`modelslab job ${jobId} did not complete: ${message}`);
    }

    lastMsg = String(data.message || data.messege || data.status || "").trim();
    // Warm-up: wait and resubmit. Anything else is a real error.
    if (/try again|loading|warming/i.test(lastMsg)) {
      const remaining = deadline - Date.now();
      if (remaining <= 0) break;
      await new Promise((r) => setTimeout(r, Math.min(5000, remaining)));
      continue;
    }
    throw new Error(`modelslab: ${lastMsg || "no image in response"}`);
  }
  throw new Error(`modelslab: the model kept warming up (${lastMsg || "Try Again"}) — wait a moment and retry`);
}

async function pollModelsLab(
  fetchUrl: string,
  key: string,
  deadline = Date.now() + MODELSLAB_POLL_MAX_MS,
): Promise<MlResp> {
  let last: MlResp = { status: "processing" };
  // A queued job can briefly return "Try Again" while it continues on the
  // provider. Keep polling the same job instead of submitting duplicates.
  const interval = Math.max(1_000, MODELSLAB_POLL_INTERVAL_MS);
  const pollDeadline = Math.min(deadline, Date.now() + MODELSLAB_POLL_MAX_MS);
  let attempt = 0;
  while (Date.now() < pollDeadline) {
    attempt += 1;
    const remainingBeforeWait = pollDeadline - Date.now();
    await new Promise((r) => setTimeout(r, Math.min(interval, remainingBeforeWait)));
    const remaining = pollDeadline - Date.now();
    if (remaining <= 0) break;
    let res: Response;
    try {
      res = await imageFetch(fetchUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      }, Math.min(12_000, remaining));
    } catch {
      if (attempt % 5 === 0) console.log(`[image] ModelsLab poll ${attempt} is still timing out`);
      continue;
    }
    if (!res.ok) continue;
    last = (await res.json()) as MlResp;
    if (last.output?.[0] || last.proxy_links?.[0]) return last; // ready (regardless of exact status string)
    if (last.status === "error" || last.status === "failed") return last;
    const message = String(last.message || last.messege || "").trim();
    if (/try again|rate limit|queue.*full/i.test(message)) {
      if (attempt % 5 === 0) console.log(`[image] ModelsLab job is still queued (${attempt})`);
      continue;
    }
    if (attempt % 5 === 0) console.log(`[image] ModelsLab job is still processing (${attempt})`);
  }
  return last; // still processing; caller throws with context
}

// ---- Expression variants (ModelsLab img2img only) ----------------------------
// Same face/identity as an existing portrait, nudged toward a different
// expression via img2img (init_image + a low-ish strength so it stays close to
// the source instead of drifting into a different-looking person). Pilot
// feature - only wired up for a handful of characters so far, and only
// available on ModelsLab; grok/fal here are text-to-image only.
export type Expression = "warm" | "flirty";

const EXPRESSION_PROMPTS: Record<Expression, string> = {
  warm: "same person, warm genuine smile, soft happy expression, gentle eyes, relaxed and affectionate, upper-body portrait, soft cinematic lighting, tasteful, safe for work",
  flirty: "same person, playful curious expression, raised eyebrow, friendly inviting gaze, upper-body portrait, soft cinematic lighting, tasteful, safe for work",
};

export function expressionVariantsConfigured(): boolean {
  return (process.env.IMAGE_PROVIDER || "grok") === "modelslab" && Boolean(process.env.MODELSLAB_API_KEY);
}

// Shared img2img caller (ModelsLab only) - same face/identity as an init image,
// nudged by a prompt at a given strength. Used for both expression variants and
// "visualize this moment" scene images.
async function modelsLabImg2Img(initImageBase64: string, prompt: string, opts: { negativePrompt?: string; strength?: number } = {}): Promise<{ base64: string; mime: string }> {
  const key = process.env.MODELSLAB_API_KEY;
  if (!key) throw new Error("MODELSLAB_API_KEY is not set");
  const model = process.env.IMAGE_MODEL || "flux";
  const url = process.env.MODELSLAB_IMG2IMG_URL || "https://modelslab.com/api/v6/images/img2img";
  const payload = {
    key,
    model_id: model,
    init_image: initImageBase64,
    prompt,
    negative_prompt: opts.negativePrompt ?? "different person, different face, different identity, deformed",
    strength: opts.strength ?? 0.4,
    width: "768",
    height: "1024",
    samples: "1",
    num_inference_steps: "25",
    safety_checker: process.env.IMAGE_SAFETY_CHECKER || "yes",
    enhance_prompt: "no",
    // Unlike text2img, img2img reads this as "is init_image base64 data (yes)
    // or a URL (no)?" - "no" here made ModelsLab reject our base64 init_image
    // with "init image must be a valid url when base64 is a representation of
    // false". We always pass base64 image data, so this must be "yes".
    base64: "yes",
  };

  let lastMsg = "";
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await imageFetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error(`modelslab img2img ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`);

    let data = (await res.json()) as MlResp;
    if (data.output?.[0]) return outputToImage(data.output[0]);

    if (data.status === "processing" && data.fetch_result) {
      data = await pollModelsLab(data.fetch_result, key);
      if (data.output?.[0]) return outputToImage(data.output[0]);
    }

    lastMsg = String(data.message || data.messege || data.status || "").trim();
    if (/try again|loading|warming/i.test(lastMsg)) {
      await new Promise((r) => setTimeout(r, 5000));
      continue;
    }
    throw new Error(`modelslab img2img: ${lastMsg || "no image in response"}`);
  }
  throw new Error(`modelslab img2img: the model kept warming up (${lastMsg || "Try Again"}) — wait a moment and retry`);
}

export async function generateExpressionVariant(baseImageBase64: string, expression: Expression): Promise<{ base64: string; mime: string }> {
  return modelsLabImg2Img(baseImageBase64, EXPRESSION_PROMPTS[expression]);
}

// ---- Face swap (ModelsLab) --------------------------------------------------
// The only way to make a scene image show the SAME person as the portrait
// (text2img just reinvents a lookalike from the description). We generate the
// scene normally, then paste the portrait's face onto it. Opt-in and gated:
// experiment on the character hero scene first before spending credits on every
// chapter. Only meaningful on ModelsLab with a key.
export function faceSwapEnabled(): boolean {
  return /^(1|true|yes|on)$/i.test((process.env.FACE_SWAP || "").trim())
    && (process.env.IMAGE_PROVIDER || "grok") === "modelslab"
    && Boolean(process.env.MODELSLAB_API_KEY);
}

// Swap the face from `portraitBase64` onto `sceneBase64`. Both are raw base64
// (the format outputToImage/generateImage already return). ModelsLab's face_swap
// fields aren't consistently documented as to which image is the face source vs.
// the target, so the mapping is overridable: set FACE_SWAP_INVERT=1 if the result
// comes out reversed.
async function modelsLabFaceSwap(portraitBase64: string, sceneBase64: string): Promise<{ base64: string; mime: string }> {
  const key = process.env.MODELSLAB_API_KEY;
  if (!key) throw new Error("MODELSLAB_API_KEY is not set");
  const url = process.env.MODELSLAB_FACESWAP_URL || "https://modelslab.com/api/v6/deepfake/single_face_swap";
  const invert = /^(1|true|yes|on)$/i.test((process.env.FACE_SWAP_INVERT || "").trim());
  const payload: Record<string, string> = {
    key,
    // ModelsLab returns init_image as the base with target_image's face placed
    // onto it. So the SCENE is init_image (the composition we keep) and the
    // PORTRAIT is target_image (the face we swap in). Passing the portrait as
    // init_image gave back the portrait on every chapter. Flip with
    // FACE_SWAP_INVERT if a given account's semantics are reversed.
    init_image: invert ? portraitBase64 : sceneBase64,
    target_image: invert ? sceneBase64 : portraitBase64,
    safety_checker: process.env.IMAGE_SAFETY_CHECKER || "yes",
    base64: "yes",
  };

  // Resolve an output entry to an image, but only if it's really image bytes.
  // If the endpoint hands back something else (URL to an error, JSON, empty),
  // throw with a snippet so withFaceSwap logs what actually came back and falls
  // back to the plain scene instead of storing a broken picture.
  const faceSwapResult = async (value: string) => {
    const img = await outputToImage(value);
    if (!looksLikeImage(img.base64)) {
      throw new Error(`face_swap returned non-image output: ${String(value).slice(0, 160)}`);
    }
    return img;
  };

  let lastMsg = "";
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await imageFetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error(`modelslab face_swap ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`);

    let data = (await res.json()) as MlResp;
    if (data.output?.[0]) return faceSwapResult(data.output[0]);

    if (data.status === "processing" && data.fetch_result) {
      data = await pollModelsLab(data.fetch_result, key);
      if (data.output?.[0]) return faceSwapResult(data.output[0]);
    }

    lastMsg = String(data.message || data.messege || data.status || "").trim();
    if (/try again|loading|warming/i.test(lastMsg)) {
      await new Promise((r) => setTimeout(r, 5000));
      continue;
    }
    throw new Error(`modelslab face_swap: ${lastMsg || "no image in response"}`);
  }
  throw new Error(`modelslab face_swap: the model kept warming up (${lastMsg || "Try Again"}) — wait a moment and retry`);
}

// Generate a scene, then (when face-swap is on and we have a portrait) place the
// character's real face onto it. Falls back to the plain scene if the swap fails
// - a wide establishing shot may have no clear face for the swapper to target,
// and a missing swap should never break image generation.
async function withFaceSwap(
  scene: { base64: string; mime: string },
  portraitBase64: string | null | undefined,
): Promise<{ base64: string; mime: string }> {
  if (!portraitBase64 || !faceSwapEnabled()) return scene;
  try {
    return await modelsLabFaceSwap(portraitBase64, scene.base64);
  } catch (e) {
    console.error("[image] face-swap failed, using plain scene:", e instanceof Error ? e.message : e);
    return scene;
  }
}

// ---- Identity-conditioned scenes (IP-Adapter) -------------------------------
// The long-term "same person, not a lookalike" path: generate the scene while
// conditioning on the character's portrait as a face reference (IP-Adapter), so
// the identity is baked into a single generation - cheaper and more natural than
// a face-swap-on-top, and it works even on wide shots. ModelsLab only; opt-in.
export function identityScenesEnabled(): boolean {
  return /^(1|true|yes|on)$/i.test((process.env.SCENE_IDENTITY || "").trim())
    && (process.env.IMAGE_PROVIDER || "grok") === "modelslab"
    && Boolean(process.env.MODELSLAB_API_KEY);
}

// ---- FLUX headshot (ModelsLab) ----------------------------------------------
// A ModelsLab model that takes the character's portrait + a text description and
// generates a fresh 1024x1024 image with that person's face baked in - far
// better quality than a face-swap paste, and it stays on the ModelsLab key.
// Opt-in via FLUX_HEADSHOT. Model/endpoint/param name are env-overridable so we
// can match ModelsLab's exact API without a code change.
export function fluxHeadshotEnabled(): boolean {
  return /^(1|true|yes|on)$/i.test((process.env.FLUX_HEADSHOT || "").trim())
    && (process.env.IMAGE_PROVIDER || "grok") === "modelslab"
    && Boolean(process.env.MODELSLAB_API_KEY);
}

// Public URL of a character's portrait, which flux-headshot fetches as face_image.
// Must be a host ModelsLab can reach - so seed/generate against a public deploy
// (APP_URL), not localhost. Returns null if no public base is configured.
export function characterImageUrl(characterId: string): string | null {
  const configuredBase = (process.env.PUBLIC_IMAGE_BASE || process.env.APP_URL || "").trim().replace(/\/$/, "");
  const vercelBase = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "";
  const base = /^https?:\/\/(?!localhost(?:[:/]|$)|127\.0\.0\.1(?:[:/]|$))/i.test(configuredBase)
    ? configuredBase
    : vercelBase;
  if (!base) return null;
  return `${base}/api/characters/${characterId}/image`;
}

const HEADSHOT_NEGATIVE_REALISTIC =
  "anime, cartoon, drawing, big nose, long nose, fat, ugly, big lips, big mouth, face proportion mismatch, unrealistic, monochrome, lowres, bad anatomy, worst quality, low quality, blurry";

const HEADSHOT_NEGATIVE_ANIME =
  "photorealistic, realistic photography, live action, real person, 3d render, big nose, long nose, bad anatomy, worst quality, low quality, blurry, monochrome";

// FLUX Headshot is designed for headshots, not setting-led chapter art. Kontext
// uses the whole source image as a reference while the prompt changes the
// composition and setting, so it works for both photo-real and illustrated art.
const KONTEXT_NEGATIVE =
  "different character, different face, different hairstyle, different outfit, portrait, headshot, character sheet, collage, text, watermark, logo, bad anatomy, low quality, blurry";

async function generateModelsLabKontextScene(
  initImageUrl: string,
  prompt: string,
  composition: "scene" | "pose" = "scene",
): Promise<{ base64: string; mime: string }> {
  const key = process.env.MODELSLAB_API_KEY;
  if (!key) throw new Error("MODELSLAB_API_KEY is not set");
  const url = process.env.MODELSLAB_KONTEXT_URL || "https://modelslab.com/api/v6/images/img2img";
  const isPose = composition === "pose";
  const compositionInstruction = isPose
    ? "Create a tall, full- or upper-body companion cutout. Preserve the supplied portrait's exact face, hairstyle, outfit, proportions, skin tone, artwork or photo rendering, and lighting treatment. Do not invent a different character or a different visual style. Keep a simple plain studio backdrop and a clean silhouette for background removal."
    : "Compose a cinematic 16:9 story moment with a clear environment and action drawn from the chapter. Keep the character in the scene, but do not create a portrait, character sheet, collage, or isolated full-body pose.";
  const negative = isPose
    ? "different character, different face, different hairstyle, different outfit, different art style, scenery, furniture, props, text, watermark, logo, collage, cropped head, cropped hands, bad anatomy, low quality, blurry"
    : KONTEXT_NEGATIVE;
  const payload: Record<string, string | number | null> = {
    key,
    model_id: process.env.MODELSLAB_KONTEXT_MODEL || "flux-kontext-dev",
    init_image: initImageUrl,
    prompt: `Use the supplied portrait as the exact visual reference. ${compositionInstruction} ${prompt}`,
    negative_prompt: negative,
    strength: Number(isPose ? (process.env.MODELSLAB_KONTEXT_POSE_STRENGTH || 0.28) : (process.env.MODELSLAB_KONTEXT_STRENGTH || 0.45)),
    guidance: Number(process.env.MODELSLAB_KONTEXT_GUIDANCE || 2.5),
    width: isPose ? 768 : 1024,
    height: isPose ? 1024 : 576,
    samples: 1,
    num_inference_steps: Number(process.env.MODELSLAB_KONTEXT_STEPS || 28),
    safety_checker: process.env.IMAGE_SAFETY_CHECKER || "yes",
    enhance_prompt: "no",
    base64: "no",
    webhook: null,
    track_id: null,
    temp: "no",
  };

  const deadline = Date.now() + MODELSLAB_GENERATION_MAX_MS;
  const take = async (value: string) => {
    const image = await outputToImage(value, Math.max(1, deadline - Date.now()));
    if (!looksLikeImage(image.base64)) throw new Error(`kontext returned non-image output: ${String(value).slice(0, 160)}`);
    return image;
  };

  const res = await imageFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }, Math.min(IMAGE_REQUEST_TIMEOUT_MS, deadline - Date.now()));
  if (!res.ok) throw new Error(`modelslab kontext ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`);

  let data = (await res.json()) as MlResp;
  if (data.output?.[0] || data.proxy_links?.[0]) return take(data.output?.[0] || data.proxy_links![0]);
  const fetchUrl = data.id != null
    ? `https://modelslab.com/api/v6/images/fetch/${encodeURIComponent(String(data.id))}`
    : data.fetch_result;
  if (data.status === "processing" && fetchUrl) {
    console.log(`[image] ModelsLab Kontext job ${data.id ?? "unknown"} queued; polling for its result`);
    data = await pollModelsLab(fetchUrl, key, deadline);
    if (data.output?.[0] || data.proxy_links?.[0]) return take(data.output?.[0] || data.proxy_links![0]);
  }
  throw new Error(`modelslab kontext: ${String(data.message || data.messege || data.status || "no image in response").trim()}`);
}

// `faceImage` is the character's portrait. Per the flux-headshot API, this is a
// public image URL; we also accept raw base64 (sent with base64:"yes") as a
// fallback in case the account supports it.
async function generateModelsLabHeadshot(faceImage: string, prompt: string, style: ArtStyle): Promise<{ base64: string; mime: string }> {
  const key = process.env.MODELSLAB_API_KEY;
  if (!key) throw new Error("MODELSLAB_API_KEY is not set");
  const url = process.env.MODELSLAB_HEADSHOT_URL || "https://modelslab.com/api/v6/image_editing/flux_headshot";
  const imageField = process.env.MODELSLAB_HEADSHOT_IMAGE_FIELD || "face_image";
  const isUrl = /^https?:\/\//i.test(faceImage);
  const styleLock = style === "anime"
    ? "MANDATORY RENDER STYLE: a polished 2D anime illustration with cel shading and clean linework. Keep the referenced character's anime visual identity. Do not render this as photography or live action."
    : "MANDATORY RENDER STYLE: photorealistic cinematic photography. Keep the referenced character's realistic visual identity.";
  const payload: Record<string, string | number | null> = {
    key,
    prompt: `${styleLock}\n\n${prompt}`,
    negative_prompt: style === "anime" ? HEADSHOT_NEGATIVE_ANIME : HEADSHOT_NEGATIVE_REALISTIC,
    [imageField]: faceImage,
    width: 1024,
    height: 1024,
    num_inference_steps: Number(process.env.MODELSLAB_HEADSHOT_STEPS || 21),
    guidance_scale: Number(process.env.MODELSLAB_HEADSHOT_GUIDANCE || 7.5),
    safety_checker: process.env.IMAGE_SAFETY_CHECKER || "yes",
    seed: null,
    webhook: null,
    track_id: null,
    // Only relevant when the face image is base64 (not a URL).
    ...(isUrl ? {} : { base64: "yes" }),
  };

  let lastMsg = "";
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await imageFetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error(`modelslab headshot ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`);

    let data = (await res.json()) as MlResp;
    const take = async (v: string) => {
      const img = await outputToImage(v);
      if (!looksLikeImage(img.base64)) throw new Error(`headshot returned non-image output: ${String(v).slice(0, 160)}`);
      return img;
    };
    if (data.output?.[0] || data.proxy_links?.[0]) return take(data.output?.[0] || data.proxy_links![0]);
    const fetchUrl = data.id != null
      ? `https://modelslab.com/api/v6/images/fetch/${encodeURIComponent(String(data.id))}`
      : data.fetch_result;
    if (data.status === "processing" && fetchUrl) {
      const jobId = data.id ?? "unknown";
      console.log(`[image] ModelsLab headshot job ${jobId} queued; polling for its result`);
      data = await pollModelsLab(fetchUrl, key);
      if (data.output?.[0] || data.proxy_links?.[0]) return take(data.output?.[0] || data.proxy_links![0]);
      const message = String(data.message || data.messege || data.status || "no result").trim();
      throw new Error(`modelslab headshot job ${jobId} did not complete: ${message}`);
    }

    lastMsg = String(data.message || data.messege || data.status || "").trim();
    if (/try again|loading|warming/i.test(lastMsg)) {
      await new Promise((r) => setTimeout(r, 5000));
      continue;
    }
    throw new Error(`modelslab headshot: ${lastMsg || "no image in response"}`);
  }
  throw new Error(`modelslab headshot: the model kept warming up (${lastMsg || "Try Again"}) — wait a moment and retry`);
}

// The chat stage needs a different asset from a portrait: a tall, readable
// figure that can sit alongside messages without bringing its own background.
// We first use the portrait as a face reference, then remove the generated
// studio background in a second ModelsLab pass.
async function generateModelsLabChatPose(faceImage: string, prompt: string, style: ArtStyle): Promise<{ base64: string; mime: string }> {
  const key = process.env.MODELSLAB_API_KEY;
  if (!key) throw new Error("MODELSLAB_API_KEY is not set");
  const url = process.env.MODELSLAB_HEADSHOT_URL || "https://modelslab.com/api/v6/image_editing/flux_headshot";
  const imageField = process.env.MODELSLAB_HEADSHOT_IMAGE_FIELD || "face_image";
  const styleLock = style === "anime"
    ? "REFERENCE LOCK: The supplied face_image is the definitive character sheet. Preserve the exact same character and the exact same anime treatment: facial proportions, eye shape and color, hair cut and color, body proportions, outfit design and palette, line quality, cel shading, and lighting language. Do not redesign the character or substitute a different anime style."
    : "REFERENCE LOCK: The supplied face_image is the definitive character sheet. Preserve the exact same person and photographic treatment: facial proportions, eye color, hair cut and color, skin tone, body proportions, outfit design and palette, lens feel, and lighting language. Do not redesign the character or turn this into illustration, cartoon, or anime.";
  const payload: Record<string, string | number | null> = {
    key,
    prompt: `${styleLock}\n\n${prompt}`,
    negative_prompt: style === "anime" ? HEADSHOT_NEGATIVE_ANIME : HEADSHOT_NEGATIVE_REALISTIC,
    [imageField]: faceImage,
    width: 768,
    height: 1024,
    num_inference_steps: Number(process.env.MODELSLAB_HEADSHOT_STEPS || 21),
    guidance_scale: Number(process.env.MODELSLAB_HEADSHOT_GUIDANCE || 7.5),
    safety_checker: process.env.IMAGE_SAFETY_CHECKER || "yes",
    seed: null,
    webhook: null,
    track_id: null,
  };

  const res = await imageFetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(`modelslab chat pose ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`);

  let data = (await res.json()) as MlResp;
  const fetchUrl = data.id != null
    ? `https://modelslab.com/api/v6/images/fetch/${encodeURIComponent(String(data.id))}`
    : data.fetch_result;
  if (data.status === "processing" && fetchUrl) data = await pollModelsLab(fetchUrl, key);
  const output = data.output?.[0] || data.proxy_links?.[0];
  if (!output) throw new Error(`modelslab chat pose: ${String(data.message || data.messege || data.status || "no image in response").trim()}`);
  const image = await outputToImage(output);
  if (!looksLikeImage(image.base64)) throw new Error("modelslab chat pose returned non-image output");
  return image;
}

async function removeModelsLabBackground(imageBase64: string): Promise<{ base64: string; mime: string }> {
  const key = process.env.MODELSLAB_API_KEY;
  if (!key) throw new Error("MODELSLAB_API_KEY is not set");
  const url = process.env.MODELSLAB_REMOVEBG_URL || "https://modelslab.com/api/v6/image_editing/removebg_mask";
  const payload = {
    key,
    image: imageBase64,
    base64: "no",
    alpha_matting: true,
    post_process_mask: true,
    only_mask: false,
    inverse_mask: false,
    alpha_matting_foreground_threshold: 240,
    alpha_matting_background_threshold: 20,
    alpha_matting_erode_size: 5,
    seed: null,
    webhook: null,
    track_id: null,
  };
  const res = await imageFetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(`modelslab remove background ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`);

  let data = (await res.json()) as MlResp;
  const fetchUrl = data.id != null
    ? `https://modelslab.com/api/v6/images/fetch/${encodeURIComponent(String(data.id))}`
    : data.fetch_result;
  if (data.status === "processing" && fetchUrl) data = await pollModelsLab(fetchUrl, key);
  const output = data.output?.[0] || data.proxy_links?.[0];
  if (!output) throw new Error(`modelslab remove background: ${String(data.message || data.messege || data.status || "no image in response").trim()}`);
  const result = await outputToImage(output);
  if (!looksLikeImage(result.base64)) throw new Error("modelslab remove background returned non-image output");
  return result;
}

// Generate a scene from `prompt`, conditioned on the character's portrait when
// identity scenes are enabled and a portrait is available. Falls back to a plain
// text2img scene if conditioning is off or the reference generation fails, so an
// image is always produced.
export async function generateSceneWithIdentity(
  prompt: string,
  portraitBase64?: string | null,
  portraitUrl?: string | null,
  style: ArtStyle = "realistic",
): Promise<{ base64: string; mime: string }> {
  // Use an image-to-image editor rather than a headshot generator whenever a
  // public canonical portrait is available. This preserves visual identity
  // while still allowing a wide chapter composition.
  if (portraitUrl && (process.env.IMAGE_PROVIDER || "grok") === "modelslab") {
    return generateModelsLabKontextScene(portraitUrl, prompt);
  }
  // Flux Headshot is the identity-preserving path. It needs a public portrait
  // URL; never silently replace it with a generic scene, which would depict a
  // different character.
  if (fluxHeadshotEnabled()) {
    if (!portraitUrl) {
      throw new Error("Flux Headshot requires a public portrait URL. Set APP_URL or PUBLIC_IMAGE_BASE to the deployed site URL.");
    }
    return generateModelsLabHeadshot(portraitUrl, prompt, style);
  }
  if (portraitBase64 && identityScenesEnabled()) {
    try {
      return await generateModelsLab(prompt, { image: portraitBase64 });
    } catch (e) {
      console.error("[image] identity-conditioned scene failed, using plain scene:", e instanceof Error ? e.message : e);
    }
  }
  return generateImage(prompt);
}

// ---- "Visualize this moment" (a chat reply, illustrated) --------------------
// A fresh text-to-image SCENE built from the reply, with the character's
// appearance woven into the prompt so it still reads as them. Deliberately
// on-demand only - never generated automatically per reply.
//
// (We do NOT use img2img off the canonical head-and-shoulders portrait here:
// at the strengths that keep identity, it reproduces the portrait rather than
// the scene, and morphing an attractive close-up is far more likely to trip
// the provider's safety filter - which returns a fully blacked-out image that
// shows up as a blank screen. A described scene is both truer to "visualize
// this moment" and much more reliable.)
export function buildMomentPrompt(def: { name?: string; gender?: string; look?: string; outfit?: string; style?: string }, sceneText: string): string {
  const g = genderWord(def.gender);
  const who = def.name ? (g ? `${g} named ${def.name}` : def.name) : g || "person";
  const look = def.look ? `, ${def.look}` : "";
  const outfit = def.outfit ? ` Wearing ${def.outfit}.` : "";
  const scene = sceneText.trim().replace(/\s+/g, " ").slice(0, 300);
  const { lead, tail } = sceneStyle(normalizeStyle(def.style));
  return (
    `${lead} featuring ${who}${look}.${outfit} The moment: ${scene} ` +
    `Full scene with environment, ${tail}`
  );
}

export async function generateMomentImage(
  def: { name?: string; gender?: string; look?: string; outfit?: string; style?: string },
  sceneText: string,
  portraitBase64?: string | null,
  portraitUrl?: string | null,
): Promise<{ base64: string; mime: string }> {
  const scene = await generateSceneWithIdentity(buildMomentPrompt(def, sceneText), portraitBase64, portraitUrl, normalizeStyle(def.style));
  return withFaceSwap(scene, portraitBase64);
}

// ---- Character scene art (the companion in their world) ---------------------
// A wide establishing image - the character within their backstory setting
// (e.g. Sable at the piano in a closed club) - used behind the profile hero.
// Wide/landscape, unlike the portrait, so it reads as a place, not a headshot.
export function buildCharacterScenePrompt(def: { name?: string; gender?: string; look?: string; outfit?: string; backstory?: string; tags?: string[]; style?: string }): string {
  const g = genderWord(def.gender);
  const who = def.name ? (g ? `${g} named ${def.name}` : def.name) : g || "person";
  const look = def.look ? `, ${def.look}` : "";
  const outfit = def.outfit ? ` Wearing ${def.outfit}.` : "";
  const place = def.backstory ? def.backstory.trim().replace(/\s+/g, " ").slice(0, 200) : "an intimate, atmospheric setting";
  const genre = def.tags?.length ? ` ${def.tags.join(", ")} mood.` : "";
  const { lead, tail } = sceneStyle(normalizeStyle(def.style));
  return (
    `Wide ${lead} of ${who}${look}.${outfit} Within their world: ${place} ` +
    `The character is present in the scene, environmental and atmospheric.${genre} ` +
    `${tail} Depth of field, moody lighting.`
  );
}

export function buildChatPosePrompt(def: { name?: string; gender?: string; look?: string; outfit?: string; style?: string }): string {
  const g = genderWord(def.gender);
  const who = def.name ? (g ? `${g} named ${def.name}` : def.name) : g || "person";
  const look = def.look ? `, ${def.look}` : "";
  const outfit = def.outfit ? ` Wearing ${def.outfit}.` : "";
  const { lead, tail } = sceneStyle(normalizeStyle(def.style));
  return (
    `${lead} of the exact same ${who}${look}.${outfit} ` +
    "Create a tall companion cutout for a chat stage: show the complete head, torso, arms, and at least to the knees when the reference permits. Keep the original outfit, hairstyle, and styling rather than inventing a new look. " +
    "Use a three-quarter standing pose facing slightly left with relaxed, natural hands. Plain flat studio backdrop only; no scenery, furniture, props, text, logo, frame, or collage. Leave a clean, unoccluded silhouette edge for background removal. " +
    `${tail}`
  );
}

export async function cutOutPortraitForChat(portraitBase64: string): Promise<{ base64: string; mime: string }> {
  if ((process.env.IMAGE_PROVIDER || "grok") !== "modelslab") {
    throw new Error("Portrait cutouts require IMAGE_PROVIDER=modelslab");
  }
  if (!portraitBase64) {
    throw new Error("A portrait is required before its background can be removed");
  }
  // Preserve the exact canonical portrait. Background removal is the only
  // transformation, so the chat-stage figure cannot drift in identity, outfit,
  // or visual style the way a newly generated pose can.
  return removeModelsLabBackground(portraitBase64);
}

export async function generateCharacterScene(
  def: { name?: string; gender?: string; look?: string; outfit?: string; backstory?: string; tags?: string[]; style?: string },
  portraitBase64?: string | null,
  portraitUrl?: string | null,
): Promise<{ base64: string; mime: string }> {
  // Identity: flux-headshot (from the portrait URL) if enabled, else IP-Adapter,
  // else plain text2img. FACE_SWAP, if separately enabled, pastes the portrait
  // face on top as an extra pass. All default off.
  const scene = await generateSceneWithIdentity(buildCharacterScenePrompt(def), portraitBase64, portraitUrl, normalizeStyle(def.style));
  return withFaceSwap(scene, portraitBase64);
}

// ---- Per-chapter scene art --------------------------------------------------
// One illustration per chapter, from that chapter's own prose, placed at a
// turning point in the reader.
export function buildChapterScenePrompt(def: { name?: string; gender?: string; look?: string; outfit?: string; style?: string }, chapterText: string): string {
  const g = genderWord(def.gender);
  const who = def.name ? (g ? `${g} named ${def.name}` : def.name) : g || "person";
  const look = def.look ? `, ${def.look}` : "";
  const outfit = def.outfit ? ` Wearing ${def.outfit}.` : "";
  // Lead with the opening of the chapter - it usually sets the scene.
  const scene = chapterText.trim().replace(/\s+/g, " ").slice(0, 320);
  const { lead, tail } = sceneStyle(normalizeStyle(def.style));
  return (
    `${lead} featuring ${who}${look}.${outfit} Scene: ${scene} ` +
    `Full environment, ${tail}`
  );
}

export async function generateChapterScene(
  def: { name?: string; gender?: string; look?: string; outfit?: string; style?: string },
  chapterText: string,
  portraitBase64?: string | null,
  portraitUrl?: string | null,
): Promise<{ base64: string; mime: string }> {
  // Distill the chapter into a distinct visual description so each chapter's
  // image differs, instead of every image being built from the same generic
  // opening lines. Falls back to the raw chapter text if the model is
  // unavailable (buildChapterScenePrompt still trims it).
  let sceneText = chapterText;
  try {
    const { describeChapterForImage } = await import("./story");
    const desc = await describeChapterForImage(chapterText, def.name);
    if (desc) sceneText = desc;
  } catch (e) {
    console.error("[image] chapter scene description failed, using raw text:", e instanceof Error ? e.message : e);
  }
  const scene = await generateSceneWithIdentity(buildChapterScenePrompt(def, sceneText), portraitBase64, portraitUrl, normalizeStyle(def.style));
  return withFaceSwap(scene, portraitBase64);
}

// ---- fal.ai (FLUX.1 [dev]) ---------------------------------------------------
async function generateFal(prompt: string): Promise<{ base64: string; mime: string }> {
  const key = process.env.FAL_KEY;
  if (!key) throw new Error("FAL_KEY is not set");
  const model = process.env.IMAGE_MODEL || "fal-ai/flux/dev";

  const res = await imageFetch(`https://fal.run/${model}`, {
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
