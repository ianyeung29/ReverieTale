import { NextResponse } from "next/server";
import { ensureDailyDrip, ledgerHistory, rewardsEarned, userBalance } from "@/lib/ledger";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

const DAILY_DRIP = Number(process.env.DAILY_DRIP || 10);

// Turn a raw ledger transaction into a human label + icon for the credits page.
// Icons mirror the "how credits are spent" cards so the history reads at a glance.
function describe(type: string, metadata: unknown, key: string): { label: string; icon: string } {
  const m = (metadata ?? {}) as Record<string, unknown>;
  if (type === "purchase") return { label: "Credit purchase", icon: "💳" };
  if (type === "drip") return key.startsWith("welcome:") ? { label: "Welcome bonus", icon: "🎁" } : { label: "Daily free credits", icon: "☀︎" };
  if (type === "reward") return m.kind === "revshare" ? { label: "Earned from a reader", icon: "★" } : { label: "Creator reward", icon: "★" };
  if (type === "spend") {
    if (m.kind === "chapter") return { label: "Story chapter", icon: "📖" };
    if (m.kind === "rewrite") return { label: "Chapter rewrite", icon: "📖" };
    if (m.kind === "portrait") return { label: "Character portrait", icon: "🎨" };
    if (m.kind === "moment_image") return { label: "Scene image", icon: "✨" };
    if (m.threadId || m.characterId) return { label: "Chat message", icon: "💬" };
    return { label: "Spent", icon: "◈" };
  }
  return { label: type, icon: "◈" };
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

  const items = events.map((e) => {
    const d = describe(e.type, e.metadata, e.key);
    return { id: e.id, label: d.label, icon: d.icon, amount: e.amount, at: e.createdAt };
  });

  return NextResponse.json({ balance, earnedFromReaders, items });
}
