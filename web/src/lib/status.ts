import type { ExpressionPick } from "./expression";

// A sparse, single-line "presence" cue for the chat scene strip - never a
// stat sheet, just enough to make the companion feel like she's actually
// there. Deterministic (no randomness) so it doesn't flicker between renders.
const TAG_IDLE: Record<string, string> = {
  artsy: "Lost in her work",
  music: "Humming something new",
  wellness: "Breathing slow, present",
  mysterious: "Watching, unreadable",
  gamer: "Mid-match, glancing over",
  intellectual: "Absorbed in a thought",
  comfort: "Settled in, at ease",
  "slice-of-life": "Puttering about, unhurried",
};

export function pickStatusLine(opts: { tags?: string[]; expr: ExpressionPick; isReturning: boolean }): string {
  const { tags = [], expr, isReturning } = opts;
  if (isReturning) return "Remembers your last conversation";
  if (expr === "flirty") return "Watching you closely";
  if (expr === "warm") return "Relaxed, glad you're here";
  for (const t of tags) if (TAG_IDLE[t]) return TAG_IDLE[t];
  return "Present, listening";
}
