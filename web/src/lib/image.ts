/**
 * Text-to-image adapter for character portraits. Default provider is fal.ai running
 * FLUX.1 [dev] (best cost/value, commercially licensed via fal). Swap providers by
 * setting IMAGE_PROVIDER + the matching key; the rest of the app is unchanged.
 */
export function imageConfigured(): boolean {
  const provider = process.env.IMAGE_PROVIDER || "fal";
  if (provider === "fal") return Boolean(process.env.FAL_KEY);
  return false;
}

export async function generateImage(prompt: string): Promise<{ base64: string; mime: string }> {
  const provider = process.env.IMAGE_PROVIDER || "fal";
  if (provider === "fal") return generateFal(prompt);
  throw new Error(`unsupported IMAGE_PROVIDER: ${provider}`);
}

async function generateFal(prompt: string): Promise<{ base64: string; mime: string }> {
  const key = process.env.FAL_KEY;
  if (!key) throw new Error("FAL_KEY is not set");
  const model = process.env.IMAGE_MODEL || "fal-ai/flux/dev";

  const res = await fetch(`https://fal.run/${model}`, {
    method: "POST",
    headers: { Authorization: `Key ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      image_size: "portrait_4_3",
      num_images: 1,
      output_format: "jpeg",
      enable_safety_checker: true, // keep portraits SFW
    }),
  });
  if (!res.ok) throw new Error(`fal ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`);

  const data = (await res.json()) as { images?: { url?: string; content_type?: string }[] };
  const img = data.images?.[0];
  if (!img?.url) throw new Error("no image returned");

  const bin = await fetch(img.url);
  if (!bin.ok) throw new Error("failed to fetch generated image");
  const buf = Buffer.from(await bin.arrayBuffer());
  return { base64: buf.toString("base64"), mime: img.content_type || "image/jpeg" };
}
