"use client";

import { FormEvent, useEffect, useState } from "react";
import { EntryGate } from "@/components/EntryGate";
import { MIN_AGE } from "@/lib/legal";

type Kind = "idea" | "issue" | "general";

export default function FeedbackPage() {
  const [authEmail, setAuthEmail] = useState<string | null | undefined>(undefined);
  const [kind, setKind] = useState<Kind>("idea");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setAuthEmail(d.user?.email ?? null)).catch(() => setAuthEmail(null));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || message.trim().length < 5) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, message: message.trim() }),
      });
      if (res.status === 401) { setAuthEmail(null); return; }
      if (!res.ok) throw new Error("submit failed");
      setSent(true);
      setMessage("");
    } catch {
      setError("Your note did not send. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (authEmail === undefined) return <main style={S.wrap}><p style={S.muted}>Loading...</p></main>;
  if (authEmail === null) return <EntryGate onDone={(email) => setAuthEmail(email)} subtitle={`Sign in to share feedback. ${MIN_AGE}+ only.`} />;

  return (
    <main style={S.wrap}>
      <a href="/profile" style={S.back}>Back to profile</a>
      <p style={S.eyebrow}>Your voice matters</p>
      <h1 style={S.h1}>Help shape ReverieTale</h1>
      <p style={S.sub}>Tell us what felt good, what got confusing, or what you want to find here next. Your feedback is private and goes directly to the team.</p>

      {sent ? (
        <section className="rv-card" style={S.thanks}>
          <h2 style={S.thanksTitle}>Thank you for sharing.</h2>
          <p style={S.thanksCopy}>We read every note while we are building the next chapter of ReverieTale.</p>
          <button type="button" className="rv-btn rv-btn-primary" style={S.primary} onClick={() => setSent(false)}>Send another note</button>
        </section>
      ) : (
        <form className="rv-card" style={S.form} onSubmit={submit}>
          <label style={S.label} htmlFor="feedback-kind">What kind of feedback is this?</label>
          <select id="feedback-kind" value={kind} onChange={(e) => setKind(e.target.value as Kind)} style={S.select}>
            <option value="idea">An idea or feature request</option>
            <option value="issue">Something is not working</option>
            <option value="general">General feedback</option>
          </select>

          <label style={S.label} htmlFor="feedback-message">Your note</label>
          <textarea id="feedback-message" value={message} onChange={(e) => setMessage(e.target.value)} style={S.textarea} maxLength={1200} minLength={5} required placeholder="What should we keep, change, or build next?" />
          <div style={S.formFoot}>
            <span style={S.count}>{message.length}/1200</span>
            <button type="submit" className="rv-btn rv-btn-primary" style={{ ...S.primary, opacity: busy || message.trim().length < 5 ? 0.55 : 1 }} disabled={busy || message.trim().length < 5}>{busy ? "Sending..." : "Send feedback"}</button>
          </div>
          {error ? <p role="alert" style={S.error}>{error}</p> : null}
        </form>
      )}
    </main>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 680, margin: "0 auto", padding: "44px 24px 90px", lineHeight: 1.6 },
  back: { color: "#8A7A90", textDecoration: "none", fontSize: 14 },
  eyebrow: { color: "#E9A06B", fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", fontWeight: 700, margin: "30px 0 4px" },
  h1: { fontFamily: "Georgia, serif", fontSize: 38, lineHeight: 1.1, margin: "0 0 10px" },
  sub: { color: "#AC9CB0", margin: "0 0 28px", maxWidth: 590, fontSize: 15 },
  form: { background: "#241B2D", border: "1px solid #3A2E44", borderRadius: 14, padding: 20, display: "flex", flexDirection: "column", gap: 10 },
  label: { color: "#B7A7BC", fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 700, marginTop: 4 },
  select: { width: "100%", background: "#1A121F", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 9, padding: "10px 12px", fontSize: 14, fontFamily: "inherit" },
  textarea: { width: "100%", minHeight: 160, resize: "vertical", background: "#1A121F", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 9, padding: "11px 12px", fontSize: 15, boxSizing: "border-box", fontFamily: "inherit", lineHeight: 1.55 },
  formFoot: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginTop: 4 },
  count: { color: "#6f6276", fontSize: 12 },
  primary: { border: 0, color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", borderRadius: 9, padding: "10px 16px", cursor: "pointer", fontWeight: 650, fontSize: 14 },
  error: { color: "#F0A9B0", fontSize: 13, margin: "2px 0 0" },
  thanks: { background: "#241B2D", border: "1px solid #3A2E44", borderRadius: 14, padding: 22 },
  thanksTitle: { fontFamily: "Georgia, serif", margin: "0 0 6px", fontSize: 26 },
  thanksCopy: { color: "#AC9CB0", margin: "0 0 18px", fontSize: 14.5 },
  muted: { color: "#AC9CB0" },
};
