ALTER TABLE "companion_posts" ADD COLUMN IF NOT EXISTS "is_locked" boolean NOT NULL DEFAULT true;
ALTER TABLE "companion_posts" ADD COLUMN IF NOT EXISTS "reveal_price" integer NOT NULL DEFAULT 5;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "companion_photo_reveals" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "post_id" uuid NOT NULL REFERENCES "companion_posts"("id"),
  "user_id" uuid NOT NULL REFERENCES "users"("id"),
  "revealed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "companion_photo_reveals_post_user_uniq" ON "companion_photo_reveals" USING btree ("post_id", "user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "companion_photo_reveals_user_idx" ON "companion_photo_reveals" USING btree ("user_id", "revealed_at");
