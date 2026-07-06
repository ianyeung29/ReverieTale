-- Pre-publish safety gate (run once in the Neon SQL Editor).
-- review_note stores the latest moderation decision reason for a character,
-- shown in the admin review queue. Characters now enter "in_review" instead of
-- publishing instantly unless the automated classifier auto-approves them.
ALTER TABLE characters ADD COLUMN IF NOT EXISTS review_note text;
