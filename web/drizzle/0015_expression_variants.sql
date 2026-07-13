-- Optional expression variants per character (pilot on a handful of
-- companions first, not a backfill for everyone). Same face/identity as the
-- canonical portrait, generated via img2img - these columns are just extra
-- image slots alongside the existing image/image_mime.
-- Run once in the Neon SQL Editor.
ALTER TABLE characters ADD COLUMN IF NOT EXISTS image_warm text;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS image_warm_mime text;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS image_flirty text;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS image_flirty_mime text;
