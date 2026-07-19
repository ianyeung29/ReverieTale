CREATE TABLE IF NOT EXISTS "requested_image_pool" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "character_id" uuid NOT NULL REFERENCES "characters"("id"),
  "request_key" text NOT NULL,
  "request_embedding" vector(1536),
  "image_key" text NOT NULL,
  "image_mime" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "last_used_at" timestamp with time zone DEFAULT now() NOT NULL,
  "use_count" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "requested_image_pool_character_request_uniq" ON "requested_image_pool" USING btree ("character_id", "request_key");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "requested_image_pool_character_used_idx" ON "requested_image_pool" USING btree ("character_id", "last_used_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "requested_image_pool_embedding_idx" ON "requested_image_pool" USING hnsw ("request_embedding" vector_cosine_ops);
