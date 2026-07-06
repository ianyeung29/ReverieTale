-- Discovery polish (run once in the Neon SQL Editor).
-- display_name: optional public creator handle shown on character profiles (never the email).
-- reads: per-story view counter (non-owner reads) that powers the "most read" sort.
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS reads integer NOT NULL DEFAULT 0;
