-- R2-only media storage. The application keeps object keys and MIME metadata in
-- Postgres; all image bytes live in the configured Cloudflare R2 bucket.
-- This migration deliberately removes legacy Base64 payload columns.

ALTER TABLE "characters" ADD COLUMN IF NOT EXISTS "image_key" text;
ALTER TABLE "characters" ADD COLUMN IF NOT EXISTS "image_warm_key" text;
ALTER TABLE "characters" ADD COLUMN IF NOT EXISTS "image_flirty_key" text;
ALTER TABLE "characters" ADD COLUMN IF NOT EXISTS "scene_image_key" text;
ALTER TABLE "stories" ADD COLUMN IF NOT EXISTS "image_key" text;
ALTER TABLE "chapter_scenes" ADD COLUMN IF NOT EXISTS "image_key" text;
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "image_key" text;
ALTER TABLE "moments" ADD COLUMN IF NOT EXISTS "image_key" text;

ALTER TABLE "characters" DROP COLUMN IF EXISTS "image";
ALTER TABLE "characters" DROP COLUMN IF EXISTS "image_warm";
ALTER TABLE "characters" DROP COLUMN IF EXISTS "image_flirty";
ALTER TABLE "characters" DROP COLUMN IF EXISTS "scene_image";
ALTER TABLE "stories" DROP COLUMN IF EXISTS "image";
ALTER TABLE "chapter_scenes" DROP COLUMN IF EXISTS "image";
ALTER TABLE "messages" DROP COLUMN IF EXISTS "image_base64";
ALTER TABLE "moments" DROP COLUMN IF EXISTS "image";

-- Existing images are intentionally discarded. Regenerate the catalogue after
-- configuring R2, then enforce the generated-scene invariant.
DELETE FROM "chapter_scenes" WHERE "image_key" IS NULL;
ALTER TABLE "chapter_scenes" ALTER COLUMN "image_key" SET NOT NULL;
