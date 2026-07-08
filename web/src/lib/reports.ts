import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { reports } from "@/db/schema";

export type ReportTarget = "character" | "story";

export const REPORT_REASONS = [
  { value: "minor_safety", label: "Underage or age-ambiguous" },
  { value: "real_person", label: "Impersonates a real person" },
  { value: "illegal", label: "Illegal or non-consensual content" },
  { value: "hateful", label: "Hateful or abusive" },
  { value: "other", label: "Something else" },
] as const;
export type ReportReason = (typeof REPORT_REASONS)[number]["value"];

export async function createReport(
  reporterId: string,
  targetType: ReportTarget,
  targetId: string,
  reason: string,
  note?: string,
): Promise<void> {
  await db.insert(reports).values({ reporterId, targetType, targetId, reason, note: note?.trim() || null });
}

export async function listOpenReports() {
  return db
    .select({ id: reports.id, targetType: reports.targetType, targetId: reports.targetId, reason: reports.reason, note: reports.note, createdAt: reports.createdAt })
    .from(reports)
    .where(eq(reports.status, "open"))
    .orderBy(desc(reports.createdAt));
}

export async function resolveReport(id: string): Promise<void> {
  await db.update(reports).set({ status: "resolved" }).where(eq(reports.id, id));
}

// Prevent obvious report spam: has this user already reported this exact
// target recently? (best-effort, not a hard unique constraint - a reporter
// may legitimately want to add a second report later on).
export async function hasOpenReportFrom(reporterId: string, targetType: ReportTarget, targetId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: reports.id })
    .from(reports)
    .where(and(eq(reports.reporterId, reporterId), eq(reports.targetType, targetType), eq(reports.targetId, targetId), eq(reports.status, "open")))
    .limit(1);
  return Boolean(row);
}
