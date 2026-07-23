CREATE TABLE IF NOT EXISTS "character_likes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id"),
  "character_id" uuid NOT NULL REFERENCES "characters"("id"),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "character_likes_user_character_uniq"
  ON "character_likes" USING btree ("user_id", "character_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "character_likes_character_idx"
  ON "character_likes" USING btree ("character_id", "created_at");
