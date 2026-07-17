ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "image_locked" boolean NOT NULL DEFAULT false;
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "image_price" integer;
