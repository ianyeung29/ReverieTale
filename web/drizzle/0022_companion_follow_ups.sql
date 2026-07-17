-- One durable rate-limit record per thread and five-reader-message interval.
CREATE TABLE IF NOT EXISTS companion_follow_ups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES threads(id),
  message_bucket integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS companion_follow_ups_thread_bucket_uniq
  ON companion_follow_ups(thread_id, message_bucket);
