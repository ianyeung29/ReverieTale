import { NextResponse } from "next/server";
import { resolveReport } from "@/lib/reports";
import { getCurrentUserId } from "@/lib/session";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

// POST /api/admin/reports/:id -> mark a report resolved (admin only). Doesn't
// itself change the reported content - pair with the review queue or the
// character's own unpublish action to act on it.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!(await isAdmin(userId))) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  await resolveReport(id);
  return NextResponse.json({ ok: true });
}
