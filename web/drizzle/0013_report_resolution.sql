-- Admin report queue overhaul: an accountability trail for how each report
-- was resolved, so "Mark resolved" isn't the only trace of a moderation call.
-- Run once in the Neon SQL Editor.
ALTER TABLE reports ADD COLUMN IF NOT EXISTS internal_note text;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS resolution text; -- 'unpublished' | 'dismissed'
ALTER TABLE reports ADD COLUMN IF NOT EXISTS resolved_at timestamptz;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS resolved_by uuid REFERENCES users(id);
