CREATE TABLE IF NOT EXISTS "companion_relationships" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id"),
  "character_id" uuid NOT NULL REFERENCES "characters"("id"),
  "trust" integer DEFAULT 10 NOT NULL,
  "familiarity" integer DEFAULT 0 NOT NULL,
  "last_emotion" text,
  "last_topic" text,
  "last_jealousy_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "companion_relationships_user_character_uniq"
  ON "companion_relationships" USING btree ("user_id", "character_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "companion_relationships_user_idx"
  ON "companion_relationships" USING btree ("user_id", "updated_at");
