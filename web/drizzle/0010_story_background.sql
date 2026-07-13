-- Ambient story backgrounds (run once in the Neon SQL Editor).
-- A generated scene image (base64 + mime) shown behind the prose while reading.
ALTER TABLE stories ADD COLUMN IF NOT EXISTS image text;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS image_mime text;
