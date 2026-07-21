ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "profile_gender" text;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "companion_gender_preferences" jsonb;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "referral_code" text;
--> statement-breakpoint
UPDATE "users"
SET "referral_code" = lower(substring(md5("id"::text) from 1 for 16))
WHERE "referral_code" IS NULL;
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "referral_code" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "referral_code"
  SET DEFAULT substring(replace(gen_random_uuid()::text, '-', '') from 1 for 16);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_referral_code_unique" ON "users" USING btree ("referral_code");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "referrals" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "referrer_id" uuid NOT NULL REFERENCES "users"("id"),
  "referred_id" uuid NOT NULL REFERENCES "users"("id"),
  "status" text NOT NULL DEFAULT 'pending',
  "new_user_rewarded_at" timestamp with time zone,
  "referrer_rewarded_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "referrals_referred_uniq" ON "referrals" USING btree ("referred_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "referrals_referrer_idx" ON "referrals" USING btree ("referrer_id", "referrer_rewarded_at");
