import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { characters, reports, stories } from "@/db/schema";

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

export async function reportById(id: string) {
  const [row] = await db
    .select({ id: reports.id, targetType: reports.targetType, targetId: reports.targetId, status: reports.status })
    .from(reports)
    .where(eq(reports.id, id))
    .limit(1);
  return row ?? null;
}

export async function listOpenReports() {
  return db
    .select({ id: reports.id, targetType: reports.targetType, targetId: reports.targetId, reason: reports.reason, note: reports.note, createdAt: reports.createdAt })
    .from(reports)
    .where(eq(reports.status, "open"))
    .orderBy(desc(reports.createdAt));
}

// Recent history, for accountability - what got resolved, how, and by whom.
export async function listResolvedReports(limit = 30) {
  return db
    .select({
      id: reports.id,
      targetType: reports.targetType,
      targetId: reports.targetId,
      reason: reports.reason,
      note: reports.note,
      internalNote: reports.internalNote,
      resolution: reports.resolution,
      resolvedAt: reports.resolvedAt,
      createdAt: reports.createdAt,
    })
    .from(reports)
    .where(eq(reports.status, "resolved"))
    .orderBy(desc(reports.resolvedAt))
    .limit(limit);
}

export type Resolution = "unpublished" | "dismissed";

export async function resolveReport(id: string, resolvedBy: string, resolution: Resolution, internalNote?: string): Promise<void> {
  await db
    .update(reports)
    .set({ status: "resolved", resolution, internalNote: internalNote?.trim() || null, resolvedAt: new Date(), resolvedBy })
    .where(eq(reports.id, id));
}

// The actual takedown action behind an "unpublish" resolution - a moderator
// acting on someone else's content, so this runs server-side with no
// ownership check (unlike the creator-facing PATCH routes).
export async function unpublishTarget(targetType: ReportTarget, targetId: string): Promise<void> {
  if (targetType === "character") {
    await db.update(characters).set({ status: "disabled", updatedAt: new Date() }).where(eq(characters.id, targetId));
  } else {
    await db.update(stories).set({ isPublic: false }).where(eq(stories.id, targetId));
  }
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
