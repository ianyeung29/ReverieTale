"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MIN_AGE } from "@/lib/legal";

function VerifyEmailInner() {
  const params = useSearchParams();
  const [status, setStatus] = useState<"working" | "ok" | "error">("working");
  const [err, setErr] = useState("");
  const [welcomeCredits, setWelcomeCredits] = useState(0);

  useEffect(() => {
    const token = params.get("token");
    if (!token) { setStatus("error"); setErr("Missing verification link."); return; }
    fetch("/api/auth/verify-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) })
      .then(async (res) => {
        const d = await res.json().catch(() => ({}));
        if (res.ok) {
          setWelcomeCredits(Number.isFinite(d.welcomeCredits) ? d.welcomeCredits : 0);
          setStatus("ok");
          setTimeout(() => { window.location.href = "/"; }, 3200);
        }
        else { setStatus("error"); setErr(d.error || "This link is invalid or has expired."); }
      })
      .catch(() => { setStatus("error"); setErr("Network error."); });
  }, [params]);

  return (
    <div style={S.center}>
      <div style={S.card}>
        <p style={S.mk}>{MIN_AGE}+ only</p>
        {status === "working" ? (
          <>
            <h2 style={S.h}>Confirming…</h2>
            <p style={S.sub}>One moment.</p>
          </>
        ) : status === "ok" ? (
          <>
            <h2 style={S.h}>You&apos;re in</h2>
            {welcomeCredits > 0 ? <p style={S.bonus}>◈ {welcomeCredits} welcome credits added</p> : null}
            <p style={S.sub}>Your account is confirmed — taking you to ReverieTale.</p>
          </>
        ) : (
          <>
            <h2 style={S.h}>Link didn&apos;t work</h2>
            <p style={S.sub}>{err}</p>
            <a href="/" style={S.btn}>Back to ReverieTale</a>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailInner />
    </Suspense>
  );
}

const S: Record<string, React.CSSProperties> = {
  center: { minHeight: "calc(100dvh - 52px)", display: "grid", placeItems: "center", padding: 24 },
  card: { display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 360, background: "#231A2B", border: "1px solid #3A2E44", borderRadius: 18, padding: "30px 26px", textAlign: "center" },
  mk: { fontSize: 12, letterSpacing: ".2em", textTransform: "uppercase", color: "#E9A06B", fontWeight: 700, margin: 0 },
  h: { fontFamily: "Georgia, serif", fontSize: 26, margin: 0, color: "#F4EAF0" },
  sub: { color: "#AC9CB0", margin: 0, fontSize: 14 },
  bonus: { color: "#E9A06B", background: "#1A121F", border: "1px solid #4A3A50", borderRadius: 10, padding: "10px 12px", margin: "4px 0", fontSize: 15, fontWeight: 700 },
  btn: { border: 0, cursor: "pointer", color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", borderRadius: 12, padding: "13px", fontWeight: 650, fontSize: 15, textDecoration: "none", marginTop: 8 },
};
