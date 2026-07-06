import { NextResponse } from "next/server";
import { ensureDailyDrip, ledgerHistory, rewardsEarned, userBalance } from "@/lib/ledger";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

const DAILY_DRIP = Number(process.env.DAILY_DRIP || 20);

// Turn a raw ledger transaction into a human label for the credits page.
function describe(type: string, metadata: unknown, key: string): string {
  const m = (metadata ?? {}) as Record<string, unknown>;
  if (type === "purchase") return "Credit purchase";
  if (type === "drip") return key.startsWith("welcome:") ? "Welcome bonus" : "Daily free credits";
  if (type === "reward") return m.kind === "revshare" ? "Earned from a reader" : "Creator reward";
  if (type === "spend") {
    if (m.kind === "chapter") return "Story chapter";
    if (m.kind === "rewrite") return "Chapter rewrite";
    if (m.threadId || m.characterId) return "Chat message";
    return "Spent";
  }
  return type;
}

// GET /api/credits/history -> balance + earnings + a dated ledger for the credits page.
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  await ensureDailyDrip(userId, DAILY_DRIP);
  const [balance, earnedFromReaders, events] = await Promise.all([
    userBalance(userId),
    rewardsEarned(userId),
    ledgerHistory(userId, 100),
  ]);

  const items = events.map((e) => ({
    id: e.id,
    label: describe(e.type, e.metadata, e.key),
    amount: e.amount,
    at: e.createdAt,
  }));

  return NextResponse.json({ balance, earnedFromReaders, items });
}
