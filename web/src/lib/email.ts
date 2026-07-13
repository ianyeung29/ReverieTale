/**
 * Minimal email sender via Resend's HTTP API (no SDK needed). Configure with
 * RESEND_API_KEY and RESEND_FROM. If no key is set, sending is a no-op (skipped),
 * so the app runs fine without email configured.
 */
export async function sendEmail(opts: { to: string[]; subject: string; html: string }): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  // Resend's shared sandbox sender works without domain verification for testing.
  const from = process.env.RESEND_FROM || "Reverie <onboarding@resend.dev>";
  if (!key) return { ok: false, skipped: true };
  if (!opts.to.length) return { ok: false, skipped: true };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: opts.to, subject: opts.subject, html: opts.html }),
    });
    if (!res.ok) return { ok: false, error: `resend ${res.status}: ${await res.text().catch(() => "")}`.slice(0, 300) };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "send failed" };
  }
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}
