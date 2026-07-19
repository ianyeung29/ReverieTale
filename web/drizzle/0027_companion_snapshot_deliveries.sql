ALTER TABLE "requested_image_pool" ADD COLUMN IF NOT EXISTS "kind" text NOT NULL DEFAULT 'requested';
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "requested_image_pool_character_kind_idx" ON "requested_image_pool" USING btree ("character_id", "kind", "last_used_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "companion_snapshot_deliveries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "pool_image_id" uuid NOT NULL REFERENCES "requested_image_pool"("id"),
  "user_id" uuid NOT NULL REFERENCES "users"("id"),
  "message_id" uuid NOT NULL REFERENCES "messages"("id"),
  "delivered_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "companion_snapshot_deliveries_pool_user_uniq" ON "companion_snapshot_deliveries" USING btree ("pool_image_id", "user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "companion_snapshot_deliveries_user_idx" ON "companion_snapshot_deliveries" USING btree ("user_id", "delivered_at");
