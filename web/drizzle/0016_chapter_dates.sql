-- One ISO timestamp per chapter (chapter_dates[0] = chapter 1's creation date,
-- etc), so the reader can show when each chapter was actually written. Older
-- stories predate this column and stay null - the app falls back to the
-- story's overall created_at for those.
-- Run once in the Neon SQL Editor.
ALTER TABLE stories ADD COLUMN IF NOT EXISTS chapter_dates jsonb;
