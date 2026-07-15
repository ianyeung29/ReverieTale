"use client";

import { useEffect, useState } from "react";
import { MIN_AGE } from "@/lib/legal";

/**
 * Email + minimum-age gate used wherever an account is required. Google is
 * offered as a CONVENIENCE login alongside it - not an age check. Google
 * exposes no birthdate/age claim to third-party apps, so the age attestation
 * still applies the same either way (see lib/session.ts, lib/google.ts).
 */
export function EntryGate({ onDone, subtitle = `Sign in or create an account. ${MIN_AGE}+ only.` }: { onDone: (email: string) => void; subtitle?: string }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [welcomeCredits, setWelcomeCredits] = useState<number | null>(null);
  const [checkEmail, setCheckEmail] = useState<string | null>(null);
  const [devUrl, setDevUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/config").then((r) => r.json()).then((d) => {
      setGoogleEnabled(!!d.googleEnabled);
      setWelcomeCredits(Number.isFinite(d.welcomeCredits) ? d.welcomeCredits : null);
    }).catch(() => {});
    if (new URLSearchParams(window.location.search).get("authError") === "google") {
      setErr("Google sign-in didn't go through — try again, or use email below.");
      const clean = new URL(window.location.href);
      clean.searchParams.delete("authError");
      window.history.replaceState({}, "", clean.pathname + clean.search);
    }
  }, []);

  async function submit() {
    if (mode === "signup" && !ageConfirmed) return setErr(`You must be ${MIN_AGE} or older to enter.`);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setErr("Enter a valid email.");
    if (mode === "signup" && password.length < 8) return setErr("Password must be at least 8 characters.");
    if (mode === "login" && !password) return setErr("Enter your password.");
    setBusy(true); setErr("");
    try {
      const url = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
      const body = mode === "signup" ? { email, password, ageConfirmed } : { email, password };
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await res.json();
      if (!res.ok) return setErr(d.error || "Something went wrong.");
      if (mode === "signup") { setCheckEmail(email); setDevUrl(d.devVerifyUrl ?? null); return; }
      onDone(d.email);
    } catch { setErr("Network error."); } finally { setBusy(false); }
  }

  function continueWithGoogle() {
    if (mode === "signup" && !ageConfirmed) {
      setErr(`Confirm that you are ${MIN_AGE} or older to create an account.`);
      return;
    }
    const returnTo = window.location.pathname + window.location.search;
    const signup = mode === "signup" ? "&signup=1&ageConfirmed=1" : "";
    window.location.href = `/api/auth/google?returnTo=${encodeURIComponent(returnTo)}${signup}`;
  }

  if (checkEmail) {
    return (
      <div style={G.center}>
        <div style={G.gate}>
          <p style={G.mk}>{MIN_AGE}+ only</p>
          <h2 style={G.h}>Check your email</h2>
          <p style={G.sub}>We sent a confirmation link to <b style={{ color: "#F4EAF0" }}>{checkEmail}</b>. Click it to finish creating your account.</p>
          {devUrl ? (
            <p style={G.sub}>
              Email isn&apos;t configured in this environment — <a href={devUrl} style={{ color: "#E9A06B" }}>use this link</a> instead.
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div style={G.center}>
      <div style={G.gate}>
        <p style={G.mk}>{MIN_AGE}+ only</p>
        <h2 style={G.h}>Enter Reverie</h2>
        <p style={G.sub}>{subtitle}</p>

        <div style={G.tabs}>
          <button type="button" style={{ ...G.tab, ...(mode === "login" ? G.tabOn : {}) }} onClick={() => { setMode("login"); setErr(""); }}>Log in</button>
          <button type="button" style={{ ...G.tab, ...(mode === "signup" ? G.tabOn : {}) }} onClick={() => { setMode("signup"); setErr(""); }}>Sign up</button>
        </div>

        {mode === "signup" && welcomeCredits !== null ? (
          <div style={G.bonus}>
            <span style={G.bonusLabel}>Welcome gift</span>
            <strong style={G.bonusValue}>◈ {welcomeCredits} credits</strong>
            <span style={G.bonusNote}>Added after you confirm your email.</span>
          </div>
        ) : null}

        {googleEnabled ? (
          <>
            <button type="button" style={G.google} onClick={continueWithGoogle}>
              <GoogleIcon /> {mode === "signup" ? "Sign up with Google" : "Continue with Google"}
            </button>
            <div style={G.divider}><span style={G.dividerLine} /><span style={G.dividerText}>or</span><span style={G.dividerLine} /></div>
          </>
        ) : null}

        <input style={G.input} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" onKeyDown={(e) => { if (e.key === "Enter") submit(); }} />
        <input
          style={G.input}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={mode === "signup" ? "Choose a password (8+ characters)" : "Password"}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
        />
        {mode === "signup" ? (
          <label style={G.chk}><input type="checkbox" checked={ageConfirmed} onChange={(e) => setAgeConfirmed(e.target.checked)} /> I am {MIN_AGE} or older</label>
        ) : (
          <a href="/forgot-password" style={G.forgot}>Forgot password?</a>
        )}
        {err ? <p style={G.err}>{err}</p> : null}
        <button style={{ ...G.btn, opacity: busy ? 0.6 : 1 }} onClick={submit} disabled={busy}>
          {busy ? "…" : mode === "signup" && welcomeCredits !== null ? `Create account and get ${welcomeCredits} credits` : mode === "signup" ? "Create account" : "Log in"}
        </button>
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
  bonus: { display: "grid", gap: 2, padding: "11px 13px", background: "#1A121F", border: "1px solid #4A3A50", borderRadius: 10, textAlign: "left" },
  bonusLabel: { color: "#E9A06B", fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" },
  bonusValue: { color: "#F4EAF0", fontSize: 18, lineHeight: 1.2 },
  bonusNote: { color: "#8A7A90", fontSize: 12.5 },
  chk: { display: "flex", alignItems: "center", gap: 8, color: "#AC9CB0", fontSize: 14, justifyContent: "center" },
  err: { color: "#E88", fontSize: 13, margin: 0 },
  input: { background: "#1A121F", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 12, padding: "13px 15px", fontSize: 15 },
  btn: { border: 0, cursor: "pointer", color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", borderRadius: 12, padding: "13px", fontWeight: 650, fontSize: 15 },
  google: { display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: "#F4EAF0", color: "#1A1220", border: 0, borderRadius: 12, padding: "12px", fontWeight: 650, fontSize: 14.5, cursor: "pointer" },
  divider: { display: "flex", alignItems: "center", gap: 10, margin: "2px 0" },
  dividerLine: { flex: 1, height: 1, background: "#3A2E44" },
  dividerText: { color: "#6f6276", fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase" },
  tabs: { display: "flex", gap: 6, background: "#1A121F", border: "1px solid #3A2E44", borderRadius: 12, padding: 4 },
  tab: { flex: 1, background: "transparent", color: "#AC9CB0", border: 0, borderRadius: 9, padding: "8px 0", fontSize: 13.5, fontWeight: 600, cursor: "pointer" },
  tabOn: { background: "#3A2E44", color: "#F4EAF0" },
  forgot: { color: "#8A7A90", fontSize: 13, textDecoration: "none", alignSelf: "flex-end" },
};
