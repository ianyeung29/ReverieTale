"use client";

import { useEffect, useState } from "react";

/**
 * Email + 18-and-over gate used wherever an account is required. Google is
 * offered as a CONVENIENCE login alongside it - not an age check. Google
 * exposes no birthdate/age claim to third-party apps, so the 18+ attestation
 * still applies the same either way (see lib/session.ts, lib/google.ts).
 */
export function EntryGate({ onDone, subtitle = "Continue with your email. 18+ only." }: { onDone: (email: string) => void; subtitle?: string }) {
  const [email, setEmail] = useState("");
  const [over18, setOver18] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [googleEnabled, setGoogleEnabled] = useState(false);

  useEffect(() => {
    fetch("/api/config").then((r) => r.json()).then((d) => setGoogleEnabled(!!d.googleEnabled)).catch(() => {});
    if (new URLSearchParams(window.location.search).get("authError") === "google") {
      setErr("Google sign-in didn't go through — try again, or use email below.");
      const clean = new URL(window.location.href);
      clean.searchParams.delete("authError");
      window.history.replaceState({}, "", clean.pathname + clean.search);
    }
  }, []);

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

  function continueWithGoogle() {
    const returnTo = window.location.pathname + window.location.search;
    window.location.href = `/api/auth/google?returnTo=${encodeURIComponent(returnTo)}`;
  }

  return (
    <div style={G.center}>
      <div style={G.gate}>
        <p style={G.mk}>Adults only</p>
        <h2 style={G.h}>Enter Reverie</h2>
        <p style={G.sub}>{subtitle}</p>

        {googleEnabled ? (
          <>
            <button type="button" style={G.google} onClick={continueWithGoogle}>
              <GoogleIcon /> Continue with Google
            </button>
            <div style={G.divider}><span style={G.dividerLine} /><span style={G.dividerText}>or</span><span style={G.dividerLine} /></div>
          </>
        ) : null}

        <input style={G.input} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" onKeyDown={(e) => { if (e.key === "Enter") submit(); }} />
        <label style={G.chk}><input type="checkbox" checked={over18} onChange={(e) => setOver18(e.target.checked)} /> I am 18 or older</label>
        {err ? <p style={G.err}>{err}</p> : null}
        <button style={{ ...G.btn, opacity: busy ? 0.6 : 1 }} onClick={submit} disabled={busy}>{busy ? "…" : "Continue"}</button>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20.4H24v7.2h11.3C33.7 32 29.3 35.2 24 35.2c-6.7 0-12.2-5.5-12.2-12.2S17.3 10.8 24 10.8c3.1 0 5.9 1.2 8.1 3.1l5.1-5.1C33.8 5.5 29.2 3.6 24 3.6 12.7 3.6 3.6 12.7 3.6 24S12.7 44.4 24 44.4c11 0 21-8 21-20.4 0-1.2-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 5.9 4.3C13.8 15.6 18.5 12.8 24 12.8c3.1 0 5.9 1.2 8.1 3.1l5.1-5.1C33.8 7.5 29.2 5.6 24 5.6c-7.6 0-14.2 4.3-17.7 10.6z" />
      <path fill="#4CAF50" d="M24 44.4c5.1 0 9.7-1.9 13.2-5.1l-6.1-5.2c-2 1.4-4.5 2.3-7.1 2.3-5.2 0-9.6-3.5-11.2-8.3l-6.1 4.7C9.8 39.8 16.3 44.4 24 44.4z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20.4H24v7.2h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.1 5.2C40.8 35.4 44.8 30 44.8 24c0-1.2-.1-2.4-.4-3.5z" />
    </svg>
  );
}

const G: Record<string, React.CSSProperties> = {
  center: { minHeight: "calc(100dvh - 52px)", display: "grid", placeItems: "center", padding: 24 },
  gate: { display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 360, background: "#231A2B", border: "1px solid #3A2E44", borderRadius: 18, padding: "30px 26px", textAlign: "center" },
  mk: { fontSize: 12, letterSpacing: ".2em", textTransform: "uppercase", color: "#E9A06B", fontWeight: 700, margin: 0 },
  h: { fontFamily: "Georgia, serif", fontSize: 26, margin: 0, color: "#F4EAF0" },
  sub: { color: "#AC9CB0", margin: "0 0 6px", fontSize: 14 },
  chk: { display: "flex", alignItems: "center", gap: 8, color: "#AC9CB0", fontSize: 14, justifyContent: "center" },
  err: { color: "#E88", fontSize: 13, margin: 0 },
  input: { background: "#1A121F", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 12, padding: "13px 15px", fontSize: 15 },
  btn: { border: 0, cursor: "pointer", color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", borderRadius: 12, padding: "13px", fontWeight: 650, fontSize: 15 },
  google: { display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: "#F4EAF0", color: "#1A1220", border: 0, borderRadius: 12, padding: "12px", fontWeight: 650, fontSize: 14.5, cursor: "pointer" },
  divider: { display: "flex", alignItems: "center", gap: 10, margin: "2px 0" },
  dividerLine: { flex: 1, height: 1, background: "#3A2E44" },
  dividerText: { color: "#6f6276", fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase" },
};
