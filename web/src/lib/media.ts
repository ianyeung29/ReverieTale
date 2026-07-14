import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

type MediaScope = "characters" | "stories" | "chapters" | "messages" | "moments";

const R2_REQUIRED = ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET"] as const;

export function mediaStorageConfigured(): boolean {
  return R2_REQUIRED.every((key) => Boolean(process.env[key]?.trim()));
}

function r2(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  if (!accountId || !accessKeyId || !secretAccessKey) throw new Error("Cloudflare R2 is not configured");

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

function bucket(): string {
  const value = process.env.R2_BUCKET?.trim();
  if (!value) throw new Error("R2_BUCKET is not set");
  return value;
}

function extension(mime: string): string {
  if (mime === "image/webp") return "webp";
  if (mime === "image/png") return "png";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

export async function storeImage(input: { scope: MediaScope; ownerId: string; base64: string; mime: string }): Promise<string> {
  if (!mediaStorageConfigured()) throw new Error("Cloudflare R2 media storage is not configured");
  const bytes = Buffer.from(input.base64, "base64");
  if (bytes.length < 100) throw new Error("Refusing to store an empty image");

  const key = `${input.scope}/${input.ownerId}/${randomUUID()}.${extension(input.mime)}`;
  await r2().send(
    new PutObjectCommand({
      Bucket: bucket(),
      Key: key,
      Body: bytes,
      ContentType: input.mime,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  return key;
}

export async function readImage(key: string): Promise<Uint8Array> {
  if (!mediaStorageConfigured()) throw new Error("Cloudflare R2 media storage is not configured");
  const result = await r2().send(new GetObjectCommand({ Bucket: bucket(), Key: key }));
  if (!result.Body) throw new Error("Image object has no body");
  return result.Body.transformToByteArray();
}

export async function readImageBase64(key?: string | null): Promise<string | null> {
  if (!key) return null;
  return Buffer.from(await readImage(key)).toString("base64");
}

export async function imageResponse(key: string, mime: string | null, cacheControl: string): Promise<Response> {
  try {
    const body = await readImage(key);
    return new Response(Buffer.from(body), {
      headers: {
        "Content-Type": mime || "image/jpeg",
        "Cache-Control": cacheControl,
      },
    });
  } catch (error) {
    console.error("[media] read failed:", error instanceof Error ? error.message : error);
    return new Response("not found", { status: 404 });
  }
}
