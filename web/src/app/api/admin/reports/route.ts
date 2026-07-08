import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { characters, stories } from "@/db/schema";
import { listOpenReports, listResolvedReports } from "@/lib/reports";
import { getCurrentUserId } from "@/lib/session";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

async function targetInfo(targetType: "character" | "story", targetId: string): Promise<{ title: string; live: boolean }> {
  if (targetType === "character") {
    const [c] = await db.select({ definition: characters.definition, status: characters.status }).from(characters).where(eq(characters.id, targetId)).limit(1);
    if (!c) return { title: "(deleted)", live: false };
    const name = (((c.definition ?? {}) as Record<string, unknown>).name as string) ?? "Unknown";
    return { title: name, live: c.status === "published" };
  }
  const [s] = await db.select({ title: stories.title, isPublic: stories.isPublic }).from(stories).where(eq(stories.id, targetId)).limit(1);
  if (!s) return { title: "(deleted)", live: false };
  return { title: s.title, live: s.isPublic };
}

// GET /api/admin/reports[?status=resolved] -> open reports (default) or
// recent resolution history, with enough context to act on them (admin
// only). Reporter identity is intentionally not exposed here.
export async function GET(req: Request) {
  const userId = await getCurrentUserId();
  if (!(await isAdmin(userId))) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const wantResolved = new URL(req.url).searchParams.get("status") === "resolved";

  if (wantResolved) {
    const rows = await listResolvedReports();
    const list = await Promise.all(
      rows.map(async (r) => {
        const { title } = await targetInfo(r.targetType as "character" | "story", r.targetId);
        return {
          id: r.id,
          targetType: r.targetType,
          targetId: r.targetId,
          targetTitle: title,
          reason: r.reason,
          note: r.note ?? "",
          internalNote: r.internalNote ?? "",
          resolution: r.resolution,
          resolvedAt: r.resolvedAt,
          createdAt: r.createdAt,
        };
      }),
    );
    return NextResponse.json(list);
  }

  const rows = await listOpenReports();
  const list = await Promise.all(
    rows.map(async (r) => {
      const { title, live } = await targetInfo(r.targetType as "character" | "story", r.targetId);
      return {
        id: r.id,
        targetType: r.targetType,
        targetId: r.targetId,
        targetTitle: title,
        targetLive: live,
        reason: r.reason,
        note: r.note ?? "",
        createdAt: r.createdAt,
      };
    }),
  );
  return NextResponse.json(list);
}
