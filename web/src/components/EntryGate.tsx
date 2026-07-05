"use client";

import { useState } from "react";

/** Email + 18-and-over gate used wherever an account is required. */
export function EntryGate({ onDone, subtitle = "Continue with your email. 18+ only." }: { onDone: (email: string) => void; subtitle?: string }) {
  const [email, setEmail] = useState("");
  const [over18, setOver18] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit() {
    if (!over18) return setErr("You must be 18 or older to enter.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setErr("Enter a valid email.");
    setBusy(true); setErr("");
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, over18 }) });
      const d = await res.json();
      if (res.ok) onDone(d.email); else setErr(d.error || "Something went wrong.");
    } catch { setErr("Network error."); } finally { setBusy(false); }
  }

  return (
    <div style={G.center}>
      <div style={G.gate}>
        <p style={G.mk}>Adults only</p>
        <h2 style={G.h}>Enter Reverie</h2>
        <p style={G.sub}>{subtitle}</p>
        <input style={G.input} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" onKeyDown={(e) => { if (e.key === "Enter") submit(); }} />
        <label style={G.chk}><input type="checkbox" checked={over18} onChange={(e) => setOver18(e.target.checked)} /> I am 18 or older</label>
        {err ? <p style={G.err}>{err}</p> : null}
        <button style={{ ...G.btn, opacity: busy ? 0.6 : 1 }} onClick={submit} disabled={busy}>{busy ? "…" : "Continue"}</button>
      </div>
    </div>
  );
}

const G: Record<string, React.CSSProperties> = {
  center: { minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 },
  gate: { display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 360, background: "#231A2B", border: "1px solid #3A2E44", borderRadius: 18, padding: "30px 26px", textAlign: "center" },
  mk: { fontSize: 12, letterSpacing: ".2em", textTransform: "uppercase", color: "#E9A06B", fontWeight: 700, margin: 0 },
  h: { fontFamily: "Georgia, serif", fontSize: 26, margin: 0, color: "#F4EAF0" },
  sub: { color: "#AC9CB0", margin: "0 0 6px", fontSize: 14 },
  chk: { display: "flex", alignItems: "center", gap: 8, color: "#AC9CB0", fontSize: 14, justifyContent: "center" },
  err: { color: "#E88", fontSize: 13, margin: 0 },
  input: { background: "#1A121F", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 12, padding: "13px 15px", fontSize: 15 },
  btn: { border: 0, cursor: "pointer", color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", borderRadius: 12, padding: "13px", fontWeight: 650, fontSize: 15 },
};
