import { NextResponse } from "next/server";
import { z } from "zod";
import { reportById, resolveReport, unpublishTarget } from "@/lib/reports";
import { getCurrentUserId } from "@/lib/session";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const Body = z.object({
  action: z.enum(["unpublish", "dismiss"]),
  note: z.string().trim().max(1000).optional(),
});

// POST /api/admin/reports/:id -> resolve a report (admin only), optionally
// taking down its target in the same step. "dismiss" leaves the content
// live (reviewed, nothing wrong with it); "unpublish" also removes it from
// discovery. Either way the report closes with an internal note attached -
// this is the one place that accountability trail is recorded.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!(await isAdmin(userId))) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid request body" }, { status: 400 });
  }

  const report = await reportById(id);
  if (!report) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (report.status !== "open") return NextResponse.json({ error: "already resolved" }, { status: 409 });

  if (body.action === "unpublish") {
    await unpublishTarget(report.targetType as "character" | "story", report.targetId);
  }
  await resolveReport(id, userId as string, body.action === "unpublish" ? "unpublished" : "dismissed", body.note);
  return NextResponse.json({ ok: true });
}
