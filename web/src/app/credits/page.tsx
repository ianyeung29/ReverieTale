"use client";

import { useEffect, useState } from "react";
import { EntryGate } from "@/components/EntryGate";

type Balance = { purchased: number; earned: number; total: number };
type Item = { id: string; label: string; amount: number; at: string };
type Data = { balance: Balance; earnedFromReaders: number; items: Item[] };

function when(at: string): string {
  const d = new Date(at);
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function CreditsPage() {
  const [authed, setAuthed] = useState<boolean | undefined>(undefined);
  const [data, setData] = useState<Data | null>(null);
  const [busy, setBusy] = useState(false);

  function load() {
    fetch("/api/credits/history")
      .then((r) => {
        if (r.status === 401) { setAuthed(false); return null; }
        setAuthed(true);
        return r.ok ? r.json() : null;
      })
      .then((d: Data | null) => d && setData(d))
      .catch(() => {});
  }
  useEffect(() => { load(); }, []);

  async function topUp() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/credits", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ credits: 100 }) });
      if (res.ok) load();
    } catch {} finally { setBusy(false); }
  }

  if (authed === undefined) return <main style={S.wrap}><p style={{ color: "#AC9CB0" }}>Loading…</p></main>;
  if (authed === false) return <EntryGate onDone={() => load()} subtitle="Sign in to see your credits. 18+ only." />;

  const b = data?.balance;

  return (
    <main style={S.wrap}>
      <a href="/" style={S.back}>← Reverie</a>
      <h1 style={S.h1}>Your credits</h1>

      <div style={S.summary}>
        <div style={S.total}>◈ {b?.total ?? "…"}</div>
        <div style={S.breakdown}>
          <span><b style={S.bd}>{b?.earned ?? 0}</b> free</span>
          <span><b style={S.bd}>{b?.purchased ?? 0}</b> purchased</span>
          {data && data.earnedFromReaders > 0 ? <span><b style={S.bdPink}>★ {data.earnedFromReaders}</b> earned from readers</span> : null}
        </div>
      </div>

      <p style={S.note}>Chapters cost credits to write; reading is free. Chatting spends a credit per message. You get free credits daily, and creators earn a share when readers chat with their companions.</p>

      <button style={{ ...S.topup, opacity: busy ? 0.6 : 1 }} onClick={topUp} disabled={busy}>{busy ? "Adding…" : "+ Add 100 credits (dev)"}</button>

      <p style={S.section}>History</p>
      {!data ? (
        <p style={S.muted}>Loading…</p>
      ) : data.items.length === 0 ? (
        <p style={S.muted}>No activity yet.</p>
      ) : (
        <div style={S.list}>
          {data.items.map((it) => (
            <div key={it.id} style={S.row}>
              <div style={S.rowLeft}>
                <span style={S.label}>{it.label}</span>
                <span style={S.time}>{when(it.at)}</span>
              </div>
              <span style={{ ...S.amount, color: it.amount >= 0 ? "#8FE0B0" : "#C99" }}>{it.amount >= 0 ? "+" : ""}{it.amount}</span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 620, margin: "0 auto", padding: "40px 24px 90px", lineHeight: 1.6 },
  back: { color: "#8A7A90", textDecoration: "none", fontSize: 14, letterSpacing: ".04em" },
  h1: { fontFamily: "Georgia, serif", fontSize: 38, margin: "22px 0 18px" },
  summary: { background: "#1C1422", border: "1px solid #3A2E44", borderRadius: 16, padding: "22px 24px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 14 },
  total: { fontSize: 40, fontWeight: 700, color: "#E9A06B", fontVariantNumeric: "tabular-nums" },
  breakdown: { display: "flex", flexDirection: "column", gap: 4, color: "#AC9CB0", fontSize: 14, textAlign: "right" },
  bd: { color: "#F4EAF0" },
  bdPink: { color: "#D46A8B" },
  note: { color: "#8A7A90", fontSize: 13.5, margin: "16px 0 18px" },
  topup: { background: "transparent", color: "#E9A06B", border: "1px solid #4a3a50", borderRadius: 10, padding: "9px 16px", cursor: "pointer", fontSize: 13.5, fontWeight: 600 },
  section: { fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "#8A7A90", fontWeight: 700, margin: "34px 0 12px" },
  muted: { color: "#AC9CB0" },
  list: { display: "flex", flexDirection: "column", border: "1px solid #2a2033", borderRadius: 12, overflow: "hidden" },
  row: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 16px", borderBottom: "1px solid #241a2b", background: "#1A121F" },
  rowLeft: { display: "flex", flexDirection: "column", gap: 2 },
  label: { color: "#F4EAF0", fontSize: 14.5 },
  time: { color: "#8A7A90", fontSize: 12.5 },
  amount: { fontWeight: 700, fontSize: 15, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" },
};
