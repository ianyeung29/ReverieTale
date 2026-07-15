"use client";

import { useEffect, useState } from "react";

const CONSENT_KEY = "rv_analytics_consent";

export function CookieConsent() {
  const [choiceMade, setChoiceMade] = useState(true);

  useEffect(() => setChoiceMade(localStorage.getItem(CONSENT_KEY) !== null), []);

  function choose(value: "granted" | "denied") {
    localStorage.setItem(CONSENT_KEY, value);
    window.dispatchEvent(new Event("rv-analytics-consent"));
    setChoiceMade(true);
  }

  if (choiceMade) return null;
  return (
    <aside className="rv-cookie-consent" style={S.wrap} role="dialog" aria-label="Cookie preferences">
      <p style={S.copy}>We use optional analytics cookies to understand how public pages are used. You can choose either option.</p>
      <div style={S.actions}>
        <button type="button" onClick={() => choose("denied")} style={S.decline}>Decline</button>
        <button type="button" onClick={() => choose("granted")} style={S.accept}>Accept analytics</button>
      </div>
    </aside>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { position: "fixed", left: 16, right: 16, bottom: 16, zIndex: 90, maxWidth: 620, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", padding: "14px 16px", background: "#241B2D", border: "1px solid #4A3A50", borderRadius: 8, boxShadow: "0 18px 48px rgba(0,0,0,.48)" },
  copy: { margin: 0, color: "#D9CBDE", fontSize: 13, lineHeight: 1.45, flex: "1 1 280px" },
  actions: { display: "flex", gap: 8, flexWrap: "wrap" },
  decline: { border: "1px solid #4A3A50", background: "transparent", color: "#F4EAF0", borderRadius: 7, padding: "8px 11px", cursor: "pointer", fontWeight: 650, fontSize: 13 },
  accept: { border: 0, background: "linear-gradient(100deg,#E9A06B,#D46A8B)", color: "#1A1220", borderRadius: 7, padding: "9px 12px", cursor: "pointer", fontWeight: 750, fontSize: 13 },
};
