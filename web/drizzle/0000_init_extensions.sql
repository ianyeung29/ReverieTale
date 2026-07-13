-- Enable pgvector before pushing the schema.
-- On Supabase you can also enable "vector" from Dashboard -> Database -> Extensions.
CREATE EXTENSION IF NOT EXISTS vector;
