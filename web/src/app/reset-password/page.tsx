"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MIN_AGE } from "@/lib/legal";

function ResetPasswordInner() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  async function submit() {
    if (!token) return setErr("Missing reset link.");
    if (password.length < 8) return setErr("Password must be at least 8 characters.");
    setBusy(true); setErr("");
    try {
      const res = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
      const d = await res.json();
      if (res.ok) { setDone(true); setTimeout(() => { window.location.href = "/"; }, 1200); }
      else setErr(d.error || "This link is invalid or has expired.");
    } catch { setErr("Network error."); } finally { setBusy(false); }
  }

  return (
    <div style={S.center}>
      <div style={S.card}>
        <p style={S.mk}>{MIN_AGE}+ only</p>
        {done ? (
          <>
            <h2 style={S.h}>Password updated</h2>
            <p style={S.sub}>Taking you to ReverieTale.</p>
          </>
        ) : (
          <>
            <h2 style={S.h}>Choose a new password</h2>
            <input style={S.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password (8+ characters)" autoComplete="new-password" onKeyDown={(e) => { if (e.key === "Enter") submit(); }} />
            {err ? <p style={S.err}>{err}</p> : null}
            <button style={{ ...S.btn, opacity: busy ? 0.6 : 1 }} onClick={submit} disabled={busy}>{busy ? "…" : "Set new password"}</button>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordInner />
    </Suspense>
  );
}

const S: Record<string, React.CSSProperties> = {
  center: { minHeight: "calc(100dvh - 52px)", display: "grid", placeItems: "center", padding: 24 },
  card: { display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 360, background: "#231A2B", border: "1px solid #3A2E44", borderRadius: 18, padding: "30px 26px", textAlign: "center" },
  mk: { fontSize: 12, letterSpacing: ".2em", textTransform: "uppercase", color: "#E9A06B", fontWeight: 700, margin: 0 },
  h: { fontFamily: "Georgia, serif", fontSize: 26, margin: 0, color: "#F4EAF0" },
  sub: { color: "#AC9CB0", margin: 0, fontSize: 14 },
  err: { color: "#E88", fontSize: 13, margin: 0 },
  input: { background: "#1A121F", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 12, padding: "13px 15px", fontSize: 15 },
  btn: { border: 0, cursor: "pointer", color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", borderRadius: 12, padding: "13px", fontWeight: 650, fontSize: 15 },
};
