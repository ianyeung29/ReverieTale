import {
  pgTable,
  uuid,
  text,
  integer,
  bigint,
  boolean,
  timestamp,
  jsonb,
  real,
  vector,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// Embedding dimension must match EMBEDDINGS_DIM in the env (default: OpenAI text-embedding-3-small = 1536).
const EMBED_DIM = 1536;

// ---------------------------------------------------------------------------
// Accounts / identity (minimal for MVP; Supabase Auth can back this later)
// ---------------------------------------------------------------------------
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  // Public creator handle (optional). Shown as attribution on character profiles;
  // never the email, which stays private.
  displayName: text("display_name"),
  // Lifetime count of portrait generations; the first FREE_PORTRAITS are free,
  // then each costs PORTRAIT_PRICE credits.
  portraitGens: integer("portrait_gens").notNull().default(0),
  // Age gate: attestation now, verification-vendor token later (see exec-3 sec 3).
  ageVerified: boolean("age_verified").notNull().default(false),
  verifiedJurisdiction: text("verified_jurisdiction"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Immutable acceptance records, by version (exec-3 sec 10 / consent_record).
export const consentRecords = pgTable("consent_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  docType: text("doc_type").notNull(), // terms | privacy | adult_ack | bot_disclosure | data_processing
  docVersion: text("doc_version").notNull(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Characters (shared definition, versioned - exec-3 sec 5)
// ---------------------------------------------------------------------------
export const characters = pgTable("characters", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id"), // null/platform for first-party Phase 0 seed characters
  version: integer("version").notNull().default(1),
  status: text("status").notNull().default("draft"), // draft | in_review | published | disabled
  // Latest moderation note (why it was held/rejected), shown in the admin queue.
  reviewNote: text("review_note"),
  // Optional generated portrait, stored base64 + mime, served via
  // /api/characters/:id/image. (Object storage is the scale-path later.)
  image: text("image"),
  imageMime: text("image_mime"),
  // Portrait generations for this character: first is free, regens cost credits.
  portraitGens: integer("portrait_gens").notNull().default(0),
  // { name, persona, look, backstory, voice, tags }
  definition: jsonb("definition").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Stories - the free front-door (acquisition). A guided first chapter starring
// a character; a story can spin off into chat with that same character.
// ---------------------------------------------------------------------------
export const stories = pgTable(
  "stories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    characterId: uuid("character_id").notNull().references(() => characters.id),
    userId: uuid("user_id").references(() => users.id), // null = platform/anon
    title: text("title").notNull(),
    content: text("content").notNull(),
    elements: jsonb("elements"), // { setting, tone, ... }
    // Optional ambient background, generated from the story's setting and stored
    // base64 + mime, served via /api/stories/:id/background. Sets mood while reading.
    image: text("image"),
    imageMime: text("image_mime"),
    isPublic: boolean("is_public").notNull().default(true),
    // Read counter (page views by non-owners) - powers the "most read" sort.
    reads: integer("reads").notNull().default(0),
    // One-level undo: the full content from before the most recent rewrite.
    backup: text("backup"),
    backupAt: timestamp("backup_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ byChar: index("stories_char_idx").on(t.characterId) }),
);

// ---------------------------------------------------------------------------
// Ratings. A reader gives a 1-5 star rating to a character or a story. One rating
// per (user, target); re-rating overwrites. Averages power social proof + sorting.
// ---------------------------------------------------------------------------
export const ratings = pgTable(
  "ratings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id),
    targetType: text("target_type").notNull(), // character | story
    targetId: uuid("target_id").notNull(),
    rating: integer("rating").notNull(), // 1..5
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userTarget: uniqueIndex("ratings_user_target_uniq").on(t.userId, t.targetType, t.targetId),
    byTarget: index("ratings_target_idx").on(t.targetType, t.targetId),
  }),
);

// ---------------------------------------------------------------------------
// Per-(character x reader) memory (exec-3 sec 6). Raw chat is transient (sec 8.1),
// distilled memory is durable.
// ---------------------------------------------------------------------------
export const threads = pgTable(
  "threads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id),
    characterId: uuid("character_id").notNull().references(() => characters.id),
    characterVersion: integer("character_version").notNull().default(1),
    // Durable "story we shared" memory, seeded when chat starts from a story and
    // refreshed as the reader advances. Kept separate from the rolling conversation
    // summary so it is never overwritten, and capped to the chapters read (no spoilers).
    storyId: uuid("story_id"),
    storyContext: text("story_context"),
    storyContextChapter: integer("story_context_chapter").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    lastActiveAt: timestamp("last_active_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ byUserChar: index("threads_user_char_idx").on(t.userId, t.characterId) }),
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    threadId: uuid("thread_id").notNull().references(() => threads.id),
    role: text("role").notNull(), // user | character
    // NOTE: exec-3 sec 9 requires encryption at rest for this column in production.
    content: text("content").notNull(),
    tokenCount: integer("token_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ byThread: index("messages_thread_idx").on(t.threadId, t.createdAt) }),
);

export const memorySummaries = pgTable("memory_summaries", {
  id: uuid("id").primaryKey().defaultRandom(),
  threadId: uuid("thread_id").notNull().references(() => threads.id),
  summary: text("summary").notNull(),
  version: integer("version").notNull().default(1),
  tokenCount: integer("token_count").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const memoryItems = pgTable(
  "memory_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    threadId: uuid("thread_id").notNull().references(() => threads.id),
    itemType: text("item_type").notNull(), // fact | preference | event
    // Sensitive: owner-scoped, deleted with source, never exported (exec-3 sec 6/7).
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: EMBED_DIM }),
    salience: real("salience").notNull().default(0.5),
    confidence: real("confidence").notNull().default(0.5),
    sourceMessageId: uuid("source_message_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    byThread: index("memory_items_thread_idx").on(t.threadId),
    // HNSW index for cosine similarity retrieval (requires pgvector).
    embIdx: index("memory_items_embedding_idx").using("hnsw", t.embedding.op("vector_cosine_ops")),
  }),
);

// ---------------------------------------------------------------------------
// Credit ledger (double-entry, authoritative - exec-3 sec 4). Balances are
// DERIVED from immutable entries; never mutate a balance column.
// ---------------------------------------------------------------------------
export const ledgerAccounts = pgTable("ledger_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerType: text("owner_type").notNull(), // user | creator | platform | promo | reserve
  ownerId: uuid("owner_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const ledgerTransactions = pgTable(
  "ledger_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: text("type").notNull(), // purchase | drip | spend | reward | clawback | expiry | refund | adjustment
    idempotencyKey: text("idempotency_key").notNull(),
    actor: text("actor"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ idemUniq: uniqueIndex("ledger_txn_idem_uniq").on(t.idempotencyKey) }),
);

export const ledgerEntries = pgTable(
  "ledger_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    txnId: uuid("txn_id").notNull().references(() => ledgerTransactions.id),
    accountId: uuid("account_id").notNull().references(() => ledgerAccounts.id),
    creditClass: text("credit_class").notNull(), // purchased | earned
    // Signed; entries of a transaction MUST sum to zero (double-entry invariant).
    amountSigned: bigint("amount_signed", { mode: "number" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ byAccount: index("ledger_entries_account_idx").on(t.accountId, t.creditClass) }),
);

// ---------------------------------------------------------------------------
// Creator revenue-share accrual. The reward is a percentage (REWARD_RATE) of the
// PURCHASED credits readers spend chatting with a creator's characters. At a low
// per-message price that percentage is fractional, so we accumulate the exact
// purchased "basis" here and pay out whole earned credits as it crosses each
// threshold. basis is monotonic; rewardsPaid == floor(rate * basis) is the invariant.
// ---------------------------------------------------------------------------
export const creatorRewards = pgTable("creator_rewards", {
  creatorId: uuid("creator_id").primaryKey(),
  basis: bigint("basis", { mode: "number" }).notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
