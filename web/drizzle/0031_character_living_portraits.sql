CREATE TABLE IF NOT EXISTS "character_living_portraits" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "character_id" uuid NOT NULL REFERENCES "characters"("id") ON DELETE CASCADE,
  "video_key" text,
  "video_mime" text,
  "source_image_key" text,
  "provider" text NOT NULL DEFAULT 'runware',
  "provider_task_uuid" uuid NOT NULL UNIQUE,
  "status" text NOT NULL DEFAULT 'processing',
  "error" text,
  "is_active" boolean NOT NULL DEFAULT false,
  "created_by_user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "character_living_portraits_character_idx"
  ON "character_living_portraits" USING btree ("character_id", "created_at");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "character_living_portraits_one_active_uniq"
  ON "character_living_portraits" USING btree ("character_id") WHERE "is_active";
