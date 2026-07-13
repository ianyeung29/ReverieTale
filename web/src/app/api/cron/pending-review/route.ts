import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { characters, users } from "@/db/schema";
import { escapeHtml, sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

// Protects the endpoint so only your scheduler can trigger it. Accepts either
// ?key=<CRON_SECRET> (external cron services) or an Authorization: Bearer header
// (Vercel Cron sets this automatically from CRON_SECRET).
function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const url = new URL(req.url);
  if (url.searchParams.get("key") === secret) return true;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

// GET /api/cron/pending-review -> emails the admins a digest IF anything is
// waiting in the review queue. Runs hourly (see README / your scheduler).
export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const rows = await db
    .select({
      definition: characters.definition,
      reviewNote: characters.reviewNote,
      creatorEmail: users.email,
      creatorName: users.displayName,
    })
    .from(characters)
    .leftJoin(users, eq(characters.creatorId, users.id))
    .where(eq(characters.status, "in_review"))
    .orderBy(desc(characters.updatedAt))
    .limit(50);

  if (rows.length === 0) return NextResponse.json({ sent: false, pending: 0 });

  const admins = (process.env.ADMIN_EMAILS || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!admins.length) return NextResponse.json({ sent: false, pending: rows.length, reason: "no admin recipients" });

  const appUrl = (process.env.APP_URL || "").replace(/\/$/, "");
  const items = rows
    .map((r) => {
      const def = (r.definition ?? {}) as Record<string, unknown>;
      const name = escapeHtml((def.name as string) || "Unknown");
      const by = escapeHtml(r.creatorName?.trim() || r.creatorEmail || "Unknown");
      const note = r.reviewNote ? ` <span style="color:#999">— ${escapeHtml(r.reviewNote)}</span>` : "";
      return `<li style="margin:4px 0"><b>${name}</b> <span style="color:#777">by ${by}</span>${note}</li>`;
    })
    .join("");

  const link = appUrl ? `<p><a href="${appUrl}/admin/review" style="color:#D46A8B">Open the review queue →</a></p>` : "";
  const html =
    `<div style="font-family:system-ui,sans-serif;color:#1a1220">` +
    `<h2 style="margin:0 0 8px">${rows.length} character${rows.length === 1 ? "" : "s"} awaiting review</h2>` +
    `<ul style="padding-left:18px">${items}</ul>${link}` +
    `<p style="color:#999;font-size:12px">You're receiving this because your email is in ADMIN_EMAILS for Reverie.</p></div>`;

  const result = await sendEmail({ to: admins, subject: `Reverie: ${rows.length} pending review${rows.length === 1 ? "" : "s"}`, html });
  return NextResponse.json({ sent: result.ok, pending: rows.length, skipped: result.skipped, error: result.error });
}
