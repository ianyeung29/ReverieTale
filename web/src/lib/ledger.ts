import { randomUUID } from "crypto";
import { and, desc, eq, gt, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { creatorRewards, ledgerAccounts, ledgerEntries, ledgerTransactions } from "@/db/schema";

// Creator revenue share: fraction of readers' PURCHASED chat spend paid back to
// the character's creator, as earned (non-cashable) credits. Default 15%.
export const REWARD_RATE = Math.max(0, Math.min(1, Number(process.env.REWARD_RATE || 0.15)));

/**
 * Double-entry credit ledger (exec-3 sec 4). Balances are DERIVED from immutable
 * entries; nothing mutates a balance column. Every transaction's entries sum to zero.
 * Two credit classes: "purchased" (earn-generating) and "earned" (spend-only).
 */
export type CreditClass = "purchased" | "earned";
export type Balance = { purchased: number; earned: number; total: number };

type Entry = { accountId: string; creditClass: CreditClass; amount: number };
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function accountFor(ownerType: string, ownerId: string | null): Promise<string> {
  const where = ownerId
    ? and(eq(ledgerAccounts.ownerType, ownerType), eq(ledgerAccounts.ownerId, ownerId))
    : and(eq(ledgerAccounts.ownerType, ownerType), isNull(ledgerAccounts.ownerId));
  const [ex] = await db.select({ id: ledgerAccounts.id }).from(ledgerAccounts).where(where).limit(1);
  if (ex) return ex.id;
  const [a] = await db
    .insert(ledgerAccounts)
    .values({ ownerType, ownerId: ownerId ?? undefined })
    .returning({ id: ledgerAccounts.id });
  return a.id;
}

export const userAccount = (userId: string) => accountFor("user", userId);
const platformAccount = () => accountFor("platform", null);

async function balanceOfTx(tx: Tx, accountId: string): Promise<Balance> {
  const rows = await tx
    .select({
      c: ledgerEntries.creditClass,
      s: sql<string>`coalesce(sum(${ledgerEntries.amountSigned}), 0)`,
    })
    .from(ledgerEntries)
    .where(eq(ledgerEntries.accountId, accountId))
    .groupBy(ledgerEntries.creditClass);
  let purchased = 0;
  let earned = 0;
  for (const r of rows) {
    if (r.c === "purchased") purchased = Number(r.s);
    else if (r.c === "earned") earned = Number(r.s);
  }
  return { purchased, earned, total: purchased + earned };
}

async function post(tx: Tx, type: string, idempotencyKey: string, entries: Entry[], metadata?: unknown) {
  if (entries.reduce((s, e) => s + e.amount, 0) !== 0) throw new Error("ledger entries must sum to zero");
  const [t] = await tx
    .insert(ledgerTransactions)
    .values({ type, idempotencyKey, metadata: metadata ?? null })
    .returning({ id: ledgerTransactions.id });
  await tx.insert(ledgerEntries).values(
    entries.map((e) => ({ txnId: t.id, accountId: e.accountId, creditClass: e.creditClass, amountSigned: e.amount })),
  );
  return t.id;
}

export async function userBalance(userId: string): Promise<Balance> {
  const acct = await userAccount(userId);
  return db.transaction((tx) => balanceOfTx(tx, acct));
}

export type LedgerEvent = { id: string; type: string; amount: number; createdAt: Date; metadata: unknown; key: string };

/** This user's ledger, newest first: net credit change per transaction with type + metadata. */
export async function ledgerHistory(userId: string, limit = 100): Promise<LedgerEvent[]> {
  const acct = await userAccount(userId);
  const rows = await db
    .select({
      id: ledgerTransactions.id,
      type: ledgerTransactions.type,
      createdAt: ledgerTransactions.createdAt,
      metadata: ledgerTransactions.metadata,
      key: ledgerTransactions.idempotencyKey,
      amount: sql<number>`sum(${ledgerEntries.amountSigned})::int`,
    })
    .from(ledgerEntries)
    .innerJoin(ledgerTransactions, eq(ledgerEntries.txnId, ledgerTransactions.id))
    .where(eq(ledgerEntries.accountId, acct))
    .groupBy(ledgerTransactions.id) // id is the PK; other txn columns are functionally dependent
    .orderBy(desc(ledgerTransactions.createdAt))
    .limit(limit);
  return rows.map((r) => ({ id: r.id, type: r.type, amount: Number(r.amount), createdAt: r.createdAt, metadata: r.metadata, key: r.key }));
}

/** Lifetime credits this user has earned as a creator (reward credits into their bank). */
export async function rewardsEarned(userId: string): Promise<number> {
  const acct = await userAccount(userId);
  const [row] = await db
    .select({ s: sql<string>`coalesce(sum(${ledgerEntries.amountSigned}), 0)` })
    .from(ledgerEntries)
    .innerJoin(ledgerTransactions, eq(ledgerEntries.txnId, ledgerTransactions.id))
    .where(and(eq(ledgerEntries.accountId, acct), eq(ledgerTransactions.type, "reward"), gt(ledgerEntries.amountSigned, 0)));
  return Number(row?.s ?? 0);
}

/** Reader buys credits (purchased class). */
export async function grantPurchase(userId: string, n: number, idempotencyKey: string = randomUUID()) {
  const [u, p] = [await userAccount(userId), await platformAccount()];
  return db.transaction((tx) =>
    post(tx, "purchase", idempotencyKey, [
      { accountId: u, creditClass: "purchased", amount: n },
      { accountId: p, creditClass: "purchased", amount: -n },
    ]),
  );
}

/** Daily free drip / welcome bonus (earned class - spend-only, never generates rewards). */
export async function grantDrip(userId: string, n: number, idempotencyKey: string = randomUUID()) {
  const [u, p] = [await userAccount(userId), await platformAccount()];
  return db.transaction((tx) =>
    post(tx, "drip", idempotencyKey, [
      { accountId: u, creditClass: "earned", amount: n },
      { accountId: p, creditClass: "earned", amount: -n },
    ]),
  );
}

export type SpendResult =
  | { ok: true; charged: number; fromPurchased: number; fromEarned: number; balance: Balance }
  | { ok: false; reason: "insufficient"; balance: Balance };

/** Charge a user n credits: earned first, then purchased. Atomic + balance-checked. */
export async function spend(userId: string, n: number, metadata?: unknown): Promise<SpendResult> {
  const [u, p] = [await userAccount(userId), await platformAccount()];
  return db.transaction(async (tx) => {
    const bal = await balanceOfTx(tx, u);
    if (bal.total < n) return { ok: false as const, reason: "insufficient" as const, balance: bal };

    const fromEarned = Math.min(bal.earned, n);
    const fromPurchased = n - fromEarned;
    const entries: Entry[] = [];
    if (fromEarned > 0) {
      entries.push({ accountId: u, creditClass: "earned", amount: -fromEarned });
      entries.push({ accountId: p, creditClass: "earned", amount: fromEarned });
    }
    if (fromPurchased > 0) {
      entries.push({ accountId: u, creditClass: "purchased", amount: -fromPurchased });
      entries.push({ accountId: p, creditClass: "purchased", amount: fromPurchased });
    }
    await post(tx, "spend", randomUUID(), entries, metadata);
    return {
      ok: true as const,
      charged: n,
      fromPurchased,
      fromEarned,
      balance: { purchased: bal.purchased - fromPurchased, earned: bal.earned - fromEarned, total: bal.total - n },
    };
  });
}

/**
 * Grant the daily free drip once per day per user. Idempotent via a dated key:
 * the unique constraint on idempotency_key blocks a second grant the same day,
 * so this is safe to call on every request. Returns true if it granted.
 */
export async function ensureDailyDrip(userId: string, amount: number): Promise<boolean> {
  if (amount <= 0) return false;
  const date = new Date().toISOString().slice(0, 10); // UTC day
  try {
    await grantDrip(userId, amount, `daily:${userId}:${date}`);
    return true;
  } catch (e) {
    // Postgres wraps the actual driver error under `.cause` - checking only
    // the top-level `.code` misses it, same class of bug as the missing-
    // relation check in lib/db-errors.ts.
    const err = e as { code?: string; message?: string; cause?: { code?: string } };
    const code = err?.cause?.code ?? err?.code;
    if (code === "23505" || /duplicate|unique/i.test(String(err?.message))) return false; // already dripped today
    throw e;
  }
}

/**
 * Creator reward (+n earned credits, flat). Low-level; prefer rewardCreatorShare
 * for the percentage revenue-share so fractional accrual is handled correctly.
 */
export async function rewardCreator(creatorId: string, n = 1, idempotencyKey: string = randomUUID()) {
  if (n <= 0) return;
  // Reward lands in the creator's own user bank (earned, spend-only).
  const [c, p] = [await userAccount(creatorId), await platformAccount()];
  return db.transaction((tx) =>
    post(tx, "reward", idempotencyKey, [
      { accountId: c, creditClass: "earned", amount: n },
      { accountId: p, creditClass: "earned", amount: -n },
    ]),
  );
}

/**
 * Accrue a creator's revenue share on `purchasedSpent` purchased credits and pay
 * out any whole earned credits that cross the threshold. Fractional shares (e.g.
 * 15% of a 1-credit message) accumulate in creator_rewards.basis until they add up
 * to a full credit, so nothing is lost to rounding. Returns the credits paid now.
 *
 * Dormant in Phase 0 (first-party characters have no creator) and skipped when the
 * chatter is the creator themselves (handled by the caller).
 */
export async function rewardCreatorShare(creatorId: string, purchasedSpent: number, rate = REWARD_RATE): Promise<number> {
  if (purchasedSpent <= 0 || rate <= 0) return 0;
  // Reward lands directly in the creator's own user bank (earned, spend-only).
  const [c, p] = [await userAccount(creatorId), await platformAccount()];
  return db.transaction(async (tx) => {
    // Atomically bump the accrual basis; the row lock serializes concurrent chats.
    const [row] = await tx
      .insert(creatorRewards)
      .values({ creatorId, basis: purchasedSpent })
      .onConflictDoUpdate({
        target: creatorRewards.creatorId,
        set: { basis: sql`${creatorRewards.basis} + ${purchasedSpent}`, updatedAt: new Date() },
      })
      .returning({ basis: creatorRewards.basis });

    const newBasis = row.basis;
    const oldBasis = newBasis - purchasedSpent;
    const payout = Math.floor(rate * newBasis) - Math.floor(rate * oldBasis);
    if (payout > 0) {
      await post(tx, "reward", randomUUID(), [
        { accountId: c, creditClass: "earned", amount: payout },
        { accountId: p, creditClass: "earned", amount: -payout },
      ], { kind: "revshare", creatorId, purchasedSpent, basis: newBasis, rate });
    }
    return payout;
  });
}
