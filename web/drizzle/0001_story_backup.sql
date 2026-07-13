-- Adds one-level rewrite backup to stories. Run in Neon SQL Editor.
ALTER TABLE stories ADD COLUMN IF NOT EXISTS backup text;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS backup_at timestamptz;
