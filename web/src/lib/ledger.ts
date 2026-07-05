import { randomUUID } from "crypto";
import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { ledgerAccounts, ledgerEntries, ledgerTransactions } from "@/db/schema";

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
export const creatorAccount = (creatorId: string) => accountFor("creator", creatorId);
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

/** Reader buys credits (purchased class). */
export async function grantPurchase(userId: string, n: number, idempotencyKey = randomUUID()) {
  const [u, p] = [await userAccount(userId), await platformAccount()];
  return db.transaction((tx) =>
    post(tx, "purchase", idempotencyKey, [
      { accountId: u, creditClass: "purchased", amount: n },
      { accountId: p, creditClass: "purchased", amount: -n },
    ]),
  );
}

/** Daily free drip / welcome bonus (earned class - spend-only, never generates rewards). */
export async function grantDrip(userId: string, n: number, idempotencyKey = randomUUID()) {
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
    const err = e as { code?: string; message?: string };
    if (err?.code === "23505" || /duplicate|unique/i.test(String(err?.message))) return false; // already dripped today
    throw e;
  }
}

/**
 * Creator reward (+n earned credits). Dormant in Phase 0 (first-party characters
 * have no creator). Only fires for real creator characters, on purchased-credit spend.
 */
export async function rewardCreator(creatorId: string, n = 1, idempotencyKey = randomUUID()) {
  const [c, p] = [await creatorAccount(creatorId), await platformAccount()];
  return db.transaction((tx) =>
    post(tx, "reward", idempotencyKey, [
      { accountId: c, creditClass: "earned", amount: n },
      { accountId: p, creditClass: "earned", amount: -n },
    ]),
  );
}
