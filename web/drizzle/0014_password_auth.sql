-- Real password auth: closes the hole where /api/auth/login would log anyone
-- in as any email with zero proof of ownership. Account creation now requires
-- clicking an emailed confirmation link before a password takes effect.
-- Run once in the Neon SQL Editor.
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at timestamptz;

CREATE TABLE IF NOT EXISTS email_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  token_hash text NOT NULL,        -- sha256 of the raw token; raw token only ever in the emailed link
  purpose text NOT NULL,           -- 'signup' | 'reset'
  pending_password_hash text,      -- set at signup time; applied to users.password_hash on verify
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS email_verifications_token_idx ON email_verifications (token_hash);
