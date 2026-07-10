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
  // Null until email ownership is proven via emailVerifications - a Google-only
  // account (no password ever set) has no password login at all.
  passwordHash: text("password_hash"),
  emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// One-time tokens proving email ownership - both new-account signup and
// password resets go through here before users.passwordHash is ever set or
// changed. Only the tokenHash (sha256 of the raw token) is stored; the raw
// token exists only in the emailed link, briefly.
export const emailVerifications = pgTable(
  "email_verifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id),
    tokenHash: text("token_hash").notNull(),
    purpose: text("purpose").notNull(), // "signup" | "reset"
    // Captured at signup time (before verification); reset flows fill this in
    // only once the new password is actually submitted, alongside the token.
    pendingPasswordHash: text("pending_password_hash"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ byToken: index("email_verifications_token_idx").on(t.tokenHash) }),
);

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
  // Optional expression variants (img2img off the canonical portrait above, same
  // face/identity, different expression) - pilot feature, most characters won't
  // have these set. Served via /api/characters/:id/image?variant=warm|flirty.
  imageWarm: text("image_warm"),
  imageWarmMime: text("image_warm_mime"),
  imageFlirty: text("image_flirty"),
  imageFlirtyMime: text("image_flirty_mime"),
  // Portrait generations for this character: first is free, regens cost credits.
  portraitGens: integer("portrait_gens").notNull().default(0),
  // { name, persona, look, backstory, voice, greeting, tags }
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
    // One ISO timestamp per chapter, in order (chapterDates[0] = chapter 1's
    // creation date, etc). Null/missing/short for older stories written before
    // this was tracked - the reader falls back to createdAt for those.
    chapterDates: jsonb("chapter_dates").$type<string[]>(),
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
// Bookmarks. A reader saves a story to their library to pick back up later -
// distinct from stories.userId (who WROTE it). One bookmark per (user, story).
// ---------------------------------------------------------------------------
export const bookmarks = pgTable(
  "bookmarks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id),
    storyId: uuid("story_id").notNull().references(() => stories.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userStoryUniq: uniqueIndex("bookmarks_user_story_uniq").on(t.userId, t.storyId),
    byUser: index("bookmarks_user_idx").on(t.userId),
  }),
);

// ---------------------------------------------------------------------------
// Reports. A reader flags a character or story for a human to check - distinct
// from the automated pre-publish gate, which only ever sees the content once
// at submit time. Open until an admin resolves it (see /admin/review).
// ---------------------------------------------------------------------------
export const reports = pgTable(
  "reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reporterId: uuid("reporter_id").notNull().references(() => users.id),
    targetType: text("target_type").notNull(), // character | story
    targetId: uuid("target_id").notNull(),
    reason: text("reason").notNull(), // short category code, e.g. "minor_safety"
    note: text("note"), // optional free text from the reporter
    status: text("status").notNull().default("open"), // open | resolved
    // Moderator-only accountability trail, set when a report is resolved.
    internalNote: text("internal_note"), // why this action (or no action) was taken
    resolution: text("resolution"), // "unpublished" | "dismissed"
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    resolvedBy: uuid("resolved_by").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ byStatus: index("reports_status_idx").on(t.status) }),
);

// ---------------------------------------------------------------------------
// Character blocks. A reader hides a specific companion from their own
// discovery surfaces (browse/home/tags) - a personal preference, not a
// takedown. Separate from admin disable, which removes it for everyone.
// ---------------------------------------------------------------------------
export const characterBlocks = pgTable(
  "character_blocks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id),
    characterId: uuid("character_id").notNull().references(() => characters.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userCharUniq: uniqueIndex("character_blocks_user_char_uniq").on(t.userId, t.characterId),
    byUser: index("character_blocks_user_idx").on(t.userId),
  }),
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
    // "Visualize this moment" - an on-demand illustration of a character reply,
    // generated once and cached here (never automatic, costs credits). Only
    // ever set on role="character" rows.
    imageBase64: text("image_base64"),
    imageMime: text("image_mime"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ byThread: index("messages_thread_idx").on(t.threadId, t.createdAt) }),
);

// A reader's saved "shared moment" - a character reply (plus its visualized
// image, if generated) captured into a private gallery. Independent of the
// live thread so it survives even if the underlying conversation is deleted.
export const moments = pgTable(
  "moments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id),
    characterId: uuid("character_id").notNull().references(() => characters.id),
    threadId: uuid("thread_id"),
    messageId: uuid("message_id"),
    dialogue: text("dialogue").notNull(),
    setting: text("setting"),
    image: text("image"),
    imageMime: text("image_mime"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ byUser: index("moments_user_idx").on(t.userId, t.createdAt) }),
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
