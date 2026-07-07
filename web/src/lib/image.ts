/**
 * Text-to-image adapter for character portraits. Providers:
 *   - "modelslab" (ModelsLab, FLUX) — key in the JSON body, sync or async (poll).
 *   - "fal" (fal.ai, FLUX.1 [dev]) — key in the Authorization header, sync.
 * Select with IMAGE_PROVIDER; the rest of the app is unchanged.
 */
export function imageConfigured(): boolean {
  const provider = process.env.IMAGE_PROVIDER || "fal";
  if (provider === "modelslab") return Boolean(process.env.MODELSLAB_API_KEY);
  if (provider === "fal") return Boolean(process.env.FAL_KEY);
  return false;
}

export async function generateImage(prompt: string): Promise<{ base64: string; mime: string }> {
  const provider = process.env.IMAGE_PROVIDER || "fal";
  if (provider === "modelslab") return generateModelsLab(prompt);
  if (provider === "fal") return generateFal(prompt);
  throw new Error(`unsupported IMAGE_PROVIDER: ${provider}`);
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

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      key,
      model_id: model,
      prompt,
      negative_prompt: "",
      width: "768",
      height: "1024",
      samples: "1",
      num_inference_steps: "25",
      safety_checker: "yes",
      enhance_prompt: "no",
      base64: "no",
    }),
  });
  if (!res.ok) throw new Error(`modelslab ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`);

  let data = (await res.json()) as MlResp;
  // Async: the model is still rendering; poll the fetch_result URL until it's ready.
  if (data.status === "processing" && data.fetch_result) {
    data = await pollModelsLab(data.fetch_result, key);
  }
  if (data.status !== "success") {
    throw new Error(`modelslab: ${data.message || data.messege || data.status || "generation failed"}`);
  }
  const imgUrl = data.output?.[0];
  if (!imgUrl) throw new Error("modelslab: no image in response");
  return urlToImage(imgUrl);
}

async function pollModelsLab(fetchUrl: string, key: string): Promise<MlResp> {
  for (let i = 0; i < 12; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const res = await fetch(fetchUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    if (!res.ok) continue;
    const data = (await res.json()) as MlResp;
    if (data.status === "success" && data.output?.[0]) return data;
    if (data.status === "error" || data.status === "failed") return data;
  }
  throw new Error("modelslab: timed out waiting for the image");
}

// ---- fal.ai (FLUX.1 [dev]) ---------------------------------------------------
async function generateFal(prompt: string): Promise<{ base64: string; mime: string }> {
  const key = process.env.FAL_KEY;
  if (!key) throw new Error("FAL_KEY is not set");
  const model = process.env.IMAGE_MODEL || "fal-ai/flux/dev";

  const res = await fetch(`https://fal.run/${model}`, {
    method: "POST",
    headers: { Authorization: `Key ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, image_size: "portrait_4_3", num_images: 1, output_format: "jpeg", enable_safety_checker: true }),
  });
  if (!res.ok) throw new Error(`fal ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`);

  const data = (await res.json()) as { images?: { url?: string; content_type?: string }[] };
  const img = data.images?.[0];
  if (!img?.url) throw new Error("no image returned");
  return urlToImage(img.url);
}
