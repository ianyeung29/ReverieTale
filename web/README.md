# Reverie - Phase 0 MVP (web)

The application foundation for the AI-companion product. **Content-agnostic**: the
risky/expensive choices (payment processor, age-verification vendor, and the
explicit-capable model) sit behind adapters, so this same codebase serves the
cheap dev build now and the funded adult launch later without a rewrite.

Stack (all free/near-free to start):
- **Next.js** (App Router, TypeScript) - one app, no separate service
- **Postgres + pgvector** via **Supabase** (or Neon) - data + per-reader memory
- **Upstash Redis** - rate limits / counters
- **LLM** via **DeepSeek** or **Grok** (OpenAI-compatible adapter)
- **Embeddings** via a pluggable OpenAI-compatible endpoint

## Milestone status
- [x] M1 - scaffold, DB schema (characters, per-reader memory, double-entry credit ledger), model/embeddings/redis adapters, health check
- [ ] M2 - chat endpoint + memory retrieval (rolling summary + pgvector recall)
- [ ] M3 - credit ledger operations (purchase/drip/spend, balances derived)
- [ ] M4 - age gate + moderation hooks (bright-line blocks) + event instrumentation
- [ ] M5 - chat UI
- [ ] Later (funded) - real payment (Segpay), age-verification vendor, self-hosted explicit model, encryption at rest

## Setup
```bash
cd web
npm install
cp .env.example .env.local   # fill in DATABASE_URL, model key, embeddings key
```

### Database (free): Supabase or Neon
1. Create a free project; copy the Postgres connection string into `DATABASE_URL`.
2. Enable pgvector - run `drizzle/0000_init_extensions.sql`, or on Supabase enable the `vector` extension in the dashboard.
3. Push the schema:
```bash
npm run db:push
```

### Model (cheap, pay-per-use)
- DeepSeek: set `MODEL_PROVIDER=deepseek` + `DEEPSEEK_API_KEY`.
- Grok/xAI: set `MODEL_PROVIDER=grok` + `XAI_API_KEY`.
- Embeddings: set `EMBEDDINGS_API_KEY` (default target: OpenAI text-embedding-3-small; swap the base URL for Voyage/Jina/local).

### Run
```bash
npm run dev       # http://localhost:3000
```
Check `http://localhost:3000/api/health` - it reports which integrations are configured and whether the DB is reachable.

## Deploying (Vercel + Neon)

The repo root is one level above this folder, so **set the Vercel project's Root
Directory to `web`** - otherwise it won't find `package.json`.

1. **Database**: create a Neon project, then copy the **pooled** connection string
   (the one with `-pooler` in the hostname, "Transaction" mode) into `DATABASE_URL`.
   The `postgres` client is already created with `prepare: false` for pooler
   compatibility - don't remove that. Run the SQL files in `drizzle/*.sql`
   against it in order (Neon's SQL editor, or `psql "$DATABASE_URL" -f drizzle/000X_*.sql`).
2. **Vercel project**: import the repo, set Root Directory to `web`, framework
   preset Next.js. Add every env var your enabled features need (see
   `.env.example`) - at minimum `DATABASE_URL`, `SESSION_SECRET`, and a model key
   (`DEEPSEEK_API_KEY` or `XAI_API_KEY`). Anything left blank just disables that
   feature gracefully (image gen, Redis, email, Stripe, Google login all no-op
   without their keys - nothing crashes).
3. **Stripe** (if enabling purchases): switch to live keys, add a webhook
   endpoint at `https://<your-domain>/api/webhooks/stripe` for the
   `checkout.session.completed` event, and set `STRIPE_WEBHOOK_SECRET` to the
   value Stripe gives that endpoint (different from the CLI's `stripe listen`
   secret used locally).
4. **Google Sign-In** (if enabling): add
   `https://<your-domain>/api/auth/google/callback` as an additional
   "Authorized redirect URI" on the OAuth client - the localhost one you set up
   for dev stays too, you're adding to the list, not replacing it.
5. **Cron**: `vercel.json` already schedules `/api/cron/pending-review` hourly;
   just set `CRON_SECRET` (Vercel Cron sends it automatically as a Bearer token).
6. **Function duration**: a few routes set `maxDuration` up to 120s (background
   portrait/story-background generation, chat) - confirm your Vercel plan's
   function timeout covers that, or the background image generation started via
   `after()` gets killed mid-request on a shorter-limit plan.
7. Set `APP_URL` to your real deployed URL (used in the review-digest email link
   and as a redirect-URI fallback).

After deploying, hit `/api/health` first - it reports which integrations it can
see without exposing secrets, and confirms the DB is reachable.

## Notes / guardrails carried from the specs
- Credits are a **double-entry ledger** (`exec-3` sec 4): balances are derived from immutable entries, transactions carry an idempotency key, entries sum to zero.
- Memory is per **(character x reader)** (`exec-3` sec 6); raw chat is meant to be transient, distilled memory durable.
- Production requires **encryption at rest** for messages/memory and a real **moderation gate** + **age verification** before any launch (`exec-2`, `exec-3` sec 9). Those are stubbed here for the cheap build and must be real before go-live.
- Hosting: free mainstream hosts are fine for building/non-explicit, but the live **explicit** product needs an **adult-permitting host** and a **GPU** for a self-hosted model.
