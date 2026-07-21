"use client";

import { useEffect, useState } from "react";

type Referral = { code: string; credits: number; invited: number; rewarded: number };

export function ReferralNudge({ compact = false }: { compact?: boolean }) {
  const [data, setData] = useState<Referral | null>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    fetch("/api/referrals").then((res) => res.ok ? res.json() : null).then(setData).catch(() => {});
  }, []);
  if (!data?.code) return null;
  const inviteUrl = `${window.location.origin}/?ref=${data.code}`;
  async function copy() {
    try { await navigator.clipboard.writeText(inviteUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch {}
  }
  return (
    <aside style={{ ...S.wrap, ...(compact ? S.compact : {}) }} aria-label="Invite a friend for credits">
      <div><strong style={S.title}>Invite a friend, unlock {data.credits} credits each</strong><p style={S.copy}>Share your link. Their account confirmation gives you both a bonus.</p></div>
      <button className="rv-btn" type="button" style={S.button} onClick={copy}>{copied ? "Invite link copied" : "Copy invite link"}</button>
    </aside>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, margin: "18px 0", padding: "16px 18px", border: "1px solid #604257", borderRadius: 12, background: "linear-gradient(110deg, rgba(233,160,107,.12), rgba(212,106,139,.12))" },
  compact: { margin: "10px 0", padding: "13px 15px" },
  title: { display: "block", color: "#F4EAF0", fontSize: 14 },
  copy: { margin: "4px 0 0", color: "#AC9CB0", fontSize: 12.5, lineHeight: 1.45 },
  button: { flex: "0 0 auto", background: "transparent", color: "#E9A06B", border: "1px solid #8B5B74", borderRadius: 9, padding: "9px 12px", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" },
};
