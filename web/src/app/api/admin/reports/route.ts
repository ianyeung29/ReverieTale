import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { characters, stories } from "@/db/schema";
import { listOpenReports } from "@/lib/reports";
import { getCurrentUserId } from "@/lib/session";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

// GET /api/admin/reports -> open reports, with enough context to act on them
// (admin only). Reporter identity is intentionally not exposed here.
export async function GET() {
  const userId = await getCurrentUserId();
  if (!(await isAdmin(userId))) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const rows = await listOpenReports();
  const list = await Promise.all(
    rows.map(async (r) => {
      let title = "Unknown";
      if (r.targetType === "character") {
        const [c] = await db.select({ definition: characters.definition }).from(characters).where(eq(characters.id, r.targetId)).limit(1);
        title = c ? (((c.definition ?? {}) as Record<string, unknown>).name as string) ?? "Unknown" : "(deleted)";
      } else {
        const [s] = await db.select({ title: stories.title }).from(stories).where(eq(stories.id, r.targetId)).limit(1);
        title = s ? s.title : "(deleted)";
      }
      return {
        id: r.id,
        targetType: r.targetType,
        targetId: r.targetId,
        targetTitle: title,
        reason: r.reason,
        note: r.note ?? "",
        createdAt: r.createdAt,
      };
    }),
  );
  return NextResponse.json(list);
}
