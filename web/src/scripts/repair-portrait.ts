import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

type ModelsLabResponse = {
  status?: string;
  id?: string | number;
  eta?: number;
  fetch_result?: string;
  output?: string[];
  message?: string;
  messege?: string;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function messageOf(data: ModelsLabResponse): string {
  return String(data.message || data.messege || data.status || "no result").trim();
}

async function readJson(url: string, body: Record<string, unknown>): Promise<ModelsLabResponse> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(45_000),
  });
  if (!response.ok) throw new Error(`ModelsLab request failed (${response.status})`);
  return response.json() as Promise<ModelsLabResponse>;
}

async function main() {
  const key = process.env.MODELSLAB_API_KEY;
  const characterId = process.env.REPAIR_CHARACTER_ID?.trim();
  const prompt = process.env.REPAIR_PROMPT?.trim();
  const existingJobId = process.env.REPAIR_JOB_ID?.trim();
  if (!key) throw new Error("MODELSLAB_API_KEY is not set");
  if (!characterId) throw new Error("REPAIR_CHARACTER_ID is required");
  if (!prompt && !existingJobId) throw new Error("REPAIR_PROMPT is required when REPAIR_JOB_ID is not set");

  let job: ModelsLabResponse;
  let jobUrl: string;
  let initialWaitMs = Number(process.env.REPAIR_INITIAL_WAIT_MS || 0);

  if (existingJobId) {
    jobUrl = `https://modelslab.com/api/v6/images/fetch/${encodeURIComponent(existingJobId)}`;
    job = { id: existingJobId, status: "processing" };
    console.log(`[portrait-repair] recovering job ${existingJobId}`);
  } else {
    const payload = {
      key,
      model_id: process.env.IMAGE_MODEL || "z-image-base",
      prompt,
      negative_prompt: null,
      width: 768,
      height: 1024,
      samples: 1,
      guidance_scale: 5,
      safety_checker: "yes",
      safety_checker_type: "black",
      num_inference_steps: 30,
      seed: null,
      webhook: null,
      track_id: null,
      base64: "no",
      watermark: "no",
      temp: "no",
    };
    console.log("[portrait-repair] submitting ModelsLab job");
    job = await readJson(process.env.MODELSLAB_URL || "https://modelslab.com/api/v6/images/text2img", payload);
    if (job.output?.[0]) {
      console.log("[portrait-repair] ModelsLab returned an image immediately");
    } else if (!job.id && !job.fetch_result) {
      throw new Error(`ModelsLab did not return a job: ${messageOf(job)}`);
    }
    jobUrl = job.fetch_result || `https://modelslab.com/api/v6/images/fetch/${encodeURIComponent(String(job.id))}`;
    // ModelsLab explicitly asks clients to wait until its ETA. Polling too
    // early can transiently return "Request not found" for a valid queued job.
    initialWaitMs = Math.max(initialWaitMs, Math.min(90_000, Math.max(6_000, Number(job.eta || 0) * 1_000)));
    console.log(`[portrait-repair] queued job ${job.id}; waiting ${Math.round(initialWaitMs / 1000)} seconds before polling`);
  }

  if (!job.output?.[0] && initialWaitMs > 0) await sleep(initialWaitMs);

  for (let attempt = 1; !job.output?.[0] && attempt <= 20; attempt += 1) {
    job = await readJson(jobUrl, { key });
    if (job.output?.[0]) break;
    const message = messageOf(job);
    console.log(`[portrait-repair] poll ${attempt}: ${message}`);
    // ModelsLab sometimes loses a queued request briefly during early polling.
    // Preserve the job until the bounded retry window is exhausted.
    if ((job.status === "failed" || job.status === "error") && !/request not found/i.test(message)) {
      throw new Error(`ModelsLab job failed: ${message}`);
    }
    await sleep(8_000);
  }

  const output = job.output?.[0];
  if (!output) throw new Error(`ModelsLab job did not finish: ${messageOf(job)}`);

  console.log("[portrait-repair] downloading image");
  const imageResponse = await fetch(output, { signal: AbortSignal.timeout(60_000) });
  if (!imageResponse.ok) throw new Error(`generated image download failed (${imageResponse.status})`);
  const base64 = Buffer.from(await imageResponse.arrayBuffer()).toString("base64");
  const mime = imageResponse.headers.get("content-type")?.split(";")[0] || "image/jpeg";

  console.log("[portrait-repair] uploading to R2");
  const { storeImage } = await import("../lib/media");
  const imageKey = await storeImage({ scope: "characters", ownerId: characterId, base64, mime });

  const { db } = await import("../db/index");
  const { characters } = await import("../db/schema");
  const { eq } = await import("drizzle-orm");
  await db.update(characters).set({ imageKey, imageMime: mime, portraitGens: 1 }).where(eq(characters.id, characterId));
  console.log(`[portrait-repair] saved ${imageKey}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(`[portrait-repair] failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  });
