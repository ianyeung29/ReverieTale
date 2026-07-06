-- Character portraits (run once in the Neon SQL Editor).
-- Generated image stored base64 in `image` with its `image_mime`, served via
-- /api/characters/:id/image. Kept out of list queries so it never bloats payloads.
-- Object storage (R2 / Supabase Storage) is the scale-path once volume grows.
ALTER TABLE characters ADD COLUMN IF NOT EXISTS image text;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS image_mime text;
