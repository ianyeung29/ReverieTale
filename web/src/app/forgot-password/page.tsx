"use client";

import { useState } from "react";
import { MIN_AGE } from "@/lib/legal";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [devUrl, setDevUrl] = useState<string | null>(null);
  const [err, setErr] = useState("");

  async function submit() {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setErr("Enter a valid email.");
    setBusy(true); setErr("");
    try {
      const res = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const d = await res.json();
      if (res.ok) { setSent(true); setDevUrl(d.devResetUrl ?? null); } else setErr(d.error || "Something went wrong.");
    } catch { setErr("Network error."); } finally { setBusy(false); }
  }

  return (
    <div style={S.center}>
      <div style={S.card}>
        <p style={S.mk}>{MIN_AGE}+ only</p>
        {sent ? (
          <>
            <h2 style={S.h}>Check your email</h2>
            <p style={S.sub}>If an account exists for <b style={{ color: "#F4EAF0" }}>{email}</b>, we&apos;ve sent a link to reset the password.</p>
            {devUrl ? <p style={S.sub}>Email isn&apos;t configured in this environment — <a href={devUrl} style={{ color: "#E9A06B" }}>use this link</a> instead.</p> : null}
          </>
        ) : (
          <>
            <h2 style={S.h}>Reset your password</h2>
            <p style={S.sub}>Enter your account email and we&apos;ll send a reset link.</p>
            <input style={S.input} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" onKeyDown={(e) => { if (e.key === "Enter") submit(); }} />
            {err ? <p style={S.err}>{err}</p> : null}
            <button style={{ ...S.btn, opacity: busy ? 0.6 : 1 }} onClick={submit} disabled={busy}>{busy ? "…" : "Send reset link"}</button>
          </>
        )}
        <a href="/" style={S.back}>← Back to Reverie</a>
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  center: { minHeight: "calc(100dvh - 52px)", display: "grid", placeItems: "center", padding: 24 },
  card: { display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 360, background: "#231A2B", border: "1px solid #3A2E44", borderRadius: 18, padding: "30px 26px", textAlign: "center" },
  mk: { fontSize: 12, letterSpacing: ".2em", textTransform: "uppercase", color: "#E9A06B", fontWeight: 700, margin: 0 },
  h: { fontFamily: "Georgia, serif", fontSize: 26, margin: 0, color: "#F4EAF0" },
  sub: { color: "#AC9CB0", margin: "0 0 6px", fontSize: 14 },
  err: { color: "#E88", fontSize: 13, margin: 0 },
  input: { background: "#1A121F", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 12, padding: "13px 15px", fontSize: 15 },
  btn: { border: 0, cursor: "pointer", color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", borderRadius: 12, padding: "13px", fontWeight: 650, fontSize: 15 },
  back: { color: "#8A7A90", textDecoration: "none", fontSize: 13, marginTop: 8 },
};
