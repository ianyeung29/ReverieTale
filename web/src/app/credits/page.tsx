"use client";

import { useEffect, useState } from "react";
import { EntryGate } from "@/components/EntryGate";
import { MIN_AGE } from "@/lib/legal";

type Balance = { purchased: number; earned: number; total: number };
type Item = { id: string; label: string; icon?: string; amount: number; at: string };
type Data = { balance: Balance; earnedFromReaders: number; items: Item[] };
type Pack = { id: string; credits: number; price: number; label: string; blurb?: string };
type Pricing = { chat: number; chapter: number; portrait: number; portraitFree: number; chatFree: number; dailyDrip: number; creatorRewardRate: number };
type Promo = { code: string; percent: number | null; text: string };

function when(at: string): string {
  const d = new Date(at);
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
function usd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
function perCredit(pack: Pack): string {
  return `${((pack.price / 100) / pack.credits).toFixed(3)} /credit`;
}
// % cheaper per-credit than the entry-level pack (packs are ordered smallest to largest).
function discountPct(pack: Pack, packs: Pack[]): number {
  const base = packs[0];
  if (!base || pack.id === base.id) return 0;
  const baseRate = base.price / base.credits;
  const rate = pack.price / pack.credits;
  return Math.max(0, Math.round((1 - rate / baseRate) * 100));
}

export default function CreditsPage() {
  const [authed, setAuthed] = useState<boolean | undefined>(undefined);
  const [data, setData] = useState<Data | null>(null);
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [busy, setBusy] = useState(false);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [payEnabled, setPayEnabled] = useState(false);
  const [promo, setPromo] = useState<Promo | null>(null);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [checkout, setCheckout] = useState<"success" | "cancel" | null>(null);

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

  useEffect(() => {
    load();
    fetch("/api/checkout").then((r) => r.json()).then((d) => { setPayEnabled(!!d.enabled); setPacks(Array.isArray(d.packs) ? d.packs : []); setPromo(d.promo ?? null); }).catch(() => {});
    fetch("/api/config").then((r) => r.json()).then((d) => d?.pricing && setPricing(d.pricing)).catch(() => {});
    const status = new URLSearchParams(window.location.search).get("checkout");
    if (status === "success" || status === "cancel") {
      setCheckout(status);
      window.history.replaceState({}, "", "/credits");
      // Credits are granted by the webhook, which may land a beat after the redirect.
      if (status === "success") { [1500, 4000, 8000].forEach((ms) => setTimeout(load, ms)); }
    }
  }, []);

  async function topUp() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/credits", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ credits: 100 }) });
      if (res.ok) load();
    } catch {} finally { setBusy(false); }
  }

  async function buyPack(id: string) {
    if (buyingId) return;
    setBuyingId(id);
    try {
      const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ packId: id }) });
      const d = await res.json();
      if (res.ok && d.url) { window.location.href = d.url; return; }
    } catch {} finally { setBuyingId(null); }
  }

  if (authed === undefined) return <main style={S.wrap}><p style={{ color: "#AC9CB0" }}>Loading…</p></main>;
  if (authed === false) return <EntryGate onDone={() => load()} subtitle={`Sign in to see your credits. ${MIN_AGE}+ only.`} />;

  const b = data?.balance;
  const best = packs.reduce<Pack | null>((m, p) => (!m || p.credits / p.price > m.credits / m.price ? p : m), null);

  return (
    <main style={S.wrap}>
      <a href="/" style={S.back}>← Reverie</a>
      <h1 style={S.h1}>Credits</h1>
      <p style={S.sub}>One currency for every companion — chat, write chapters, and generate portraits. No subscriptions: buy what you need, and bigger packs cost less per credit. Nothing expires on purchased credits.</p>

      {checkout === "success" ? <div style={S.okBanner}>Payment received — your credits will appear here in a moment.</div> : null}
      {checkout === "cancel" ? <div style={S.cancelBanner}>Checkout canceled — no charge was made.</div> : null}

      <div className="rv-card" style={S.summary}>
        <div>
          <div style={S.total}>◈ {b?.total ?? "…"}</div>
          <div style={S.totalLabel}>available now</div>
        </div>
        <div style={S.breakdown}>
          <span><b style={S.bd}>{b?.earned ?? 0}</b> free &amp; earned</span>
        </div>
      </div>

      <div className="rv-card" style={S.earnCard}>
        <div style={S.earnIcon}>★</div>
        <div style={S.earnBody}>
          <p style={S.earnTitle}>
            Earn {pricing ? `${Math.round(pricing.creatorRewardRate * 100)}%` : "15%"} back on every chat
          </p>
          <p style={S.earnCopy}>
            Create a companion others love, and you earn {pricing ? `${Math.round(pricing.creatorRewardRate * 100)}%` : "15%"} of what readers spend chatting with them — paid to you automatically, as credits.
          </p>
          {data && data.earnedFromReaders > 0 ? <p style={S.earnTotal}>★ {data.earnedFromReaders} credits earned from readers so far</p> : null}
        </div>
      </div>

      <p style={S.section}>How credits are spent</p>
      <div style={S.usageGrid}>
        <div className="rv-card" style={S.usageCard}>
          <span style={S.usageIcon}>💬</span>
          <span style={S.usageAmt}>{pricing ? `${pricing.chat} credit` : "…"}</span>
          <span style={S.usageWhat}>{pricing ? `per chat message — first ${pricing.chatFree} to any companion are free` : "per chat message"}</span>
        </div>
        <div className="rv-card" style={S.usageCard}>
          <span style={S.usageIcon}>📖</span>
          <span style={S.usageAmt}>{pricing ? `${pricing.chapter} credits` : "…"}</span>
          <span style={S.usageWhat}>per chapter written — reading is always free</span>
        </div>
        <div className="rv-card" style={S.usageCard}>
          <span style={S.usageIcon}>🎨</span>
          <span style={S.usageAmt}>{pricing ? `${pricing.portrait} credits` : "…"}</span>
          <span style={S.usageWhat}>{pricing ? `per portrait — first ${pricing.portraitFree} on a companion are free` : "per portrait"}</span>
        </div>
        <div className="rv-card" style={S.usageCard}>
          <span style={S.usageIcon}>☀︎</span>
          <span style={S.usageAmt}>{pricing ? `+${pricing.dailyDrip}` : "…"}</span>
          <span style={S.usageWhat}>free credits every day, automatically</span>
        </div>
      </div>

      <p style={S.section}>Get more credits</p>
      {promo && payEnabled ? (
        <div style={S.promo}>
          <span style={S.promoTag}>🎉 {promo.text || (promo.percent ? `${promo.percent}% off launch offer` : "Launch offer")}</span>
          <span style={S.promoBody}>
            {promo.percent ? `${promo.percent}% off any credit pack. ` : ""}Use code <b style={S.promoCode}>{promo.code}</b> at checkout.
          </span>
        </div>
      ) : null}
      {payEnabled && packs.length ? (
        <>
          <div style={S.packs}>
            {packs.map((p) => {
              const isBest = best?.id === p.id;
              const pct = discountPct(p, packs);
              return (
                <button key={p.id} style={{ ...S.pack, ...(isBest ? S.packBest : {}), opacity: buyingId ? 0.6 : 1 }} onClick={() => buyPack(p.id)} disabled={!!buyingId}>
                  {isBest ? <span style={S.packRibbon}>Best value</span> : null}
                  <span style={S.packCredits}>◈ {p.credits}</span>
                  <span style={S.packPrice}>{buyingId === p.id ? "…" : usd(p.price)}</span>
                  <span style={S.packPer}>{perCredit(p)}</span>
                  {pct > 0 ? <span style={S.packDiscount}>{pct}% cheaper per credit</span> : null}
                  {p.blurb ? <span style={S.packBlurb}>{p.blurb}</span> : null}
                </button>
              );
            })}
          </div>
          <p style={S.secureNote}>Secure checkout by Stripe. Purchased credits never expire.</p>
        </>
      ) : (
        <button style={{ ...S.topup, opacity: busy ? 0.6 : 1 }} onClick={topUp} disabled={busy}>{busy ? "Adding…" : "+ Add 100 credits (dev)"}</button>
      )}

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
                {it.icon ? <span style={S.rowIcon} aria-hidden>{it.icon}</span> : null}
                <span style={S.label}>{it.label}</span>
                <span style={S.time}>· {when(it.at)}</span>
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
  wrap: { maxWidth: 720, margin: "0 auto", padding: "40px 24px 90px", lineHeight: 1.6 },
  back: { color: "#8A7A90", textDecoration: "none", fontSize: 14, letterSpacing: ".04em" },
  h1: { fontFamily: "Georgia, serif", fontSize: 38, margin: "22px 0 6px" },
  sub: { color: "#AC9CB0", margin: "0 0 22px", fontSize: 14.5 },
  summary: { display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "22px 24px" },
  total: { fontSize: 40, fontWeight: 700, color: "#E9A06B", fontVariantNumeric: "tabular-nums", lineHeight: 1 },
  totalLabel: { color: "#8A7A90", fontSize: 12.5, letterSpacing: ".04em", marginTop: 4 },
  breakdown: { display: "flex", flexDirection: "column", gap: 4, color: "#AC9CB0", fontSize: 14, textAlign: "right" },
  bd: { color: "#F4EAF0" },
  topup: { background: "transparent", color: "#E9A06B", border: "1px solid #4a3a50", borderRadius: 10, padding: "9px 16px", cursor: "pointer", fontSize: 13.5, fontWeight: 600 },
  earnCard: { display: "flex", gap: 14, alignItems: "flex-start", padding: "18px 20px", marginTop: 14, background: "linear-gradient(120deg,#2b1e2a,#241B2D)", border: "1px solid #4a3350" },
  earnIcon: { fontSize: 22, color: "#D46A8B", lineHeight: 1.3 },
  earnBody: { display: "flex", flexDirection: "column", gap: 4 },
  earnTitle: { color: "#F4EAF0", fontSize: 16, fontWeight: 700, margin: 0, fontFamily: "Georgia, serif" },
  earnCopy: { color: "#AC9CB0", fontSize: 13.5, margin: 0, lineHeight: 1.5 },
  earnTotal: { color: "#D46A8B", fontSize: 13.5, fontWeight: 650, margin: "4px 0 0" },
  okBanner: { background: "rgba(70,150,110,.16)", border: "1px solid #2f6b4c", color: "#8FE0B0", borderRadius: 10, padding: "10px 14px", margin: "0 0 16px", fontSize: 14 },
  cancelBanner: { background: "#241826", border: "1px solid #4a3350", color: "#C6B7CC", borderRadius: 10, padding: "10px 14px", margin: "0 0 16px", fontSize: 14 },
  usageGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 },
  usageCard: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 3, padding: "14px 16px" },
  usageIcon: { fontSize: 18 },
  usageAmt: { color: "#F4EAF0", fontSize: 17, fontWeight: 650, marginTop: 2 },
  usageWhat: { color: "#8A7A90", fontSize: 12.5, lineHeight: 1.4 },
  promo: { display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "4px 12px", background: "linear-gradient(100deg, rgba(233,160,107,.16), rgba(212,106,139,.16))", border: "1px solid #4a3350", borderRadius: 12, padding: "12px 16px", margin: "0 0 14px" },
  promoTag: { color: "#E9A06B", fontWeight: 700, fontSize: 14 },
  promoBody: { color: "#EadFe6", fontSize: 14 },
  promoCode: { color: "#F4EAF0", background: "#231A2B", border: "1px solid #4a3a50", borderRadius: 6, padding: "1px 8px", letterSpacing: ".06em", fontFamily: "ui-monospace, monospace" },
  packs: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 },
  pack: { position: "relative", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4, background: "#241B2D", border: "1px solid #3A2E44", borderRadius: 14, padding: "16px 18px", cursor: "pointer", textAlign: "left" },
  packBest: { border: "1px solid #E9A06B", background: "linear-gradient(160deg,#2b2032,#241B2D)" },
  packRibbon: { position: "absolute", top: -10, right: 12, background: "linear-gradient(100deg,#E9A06B,#D46A8B)", color: "#1A1220", fontSize: 10.5, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", borderRadius: 999, padding: "3px 9px" },
  packCredits: { color: "#E9A06B", fontSize: 20, fontWeight: 700 },
  packPrice: { color: "#F4EAF0", fontSize: 16, fontWeight: 650 },
  packPer: { color: "#6f6276", fontSize: 11.5 },
  packDiscount: { color: "#8FE0B0", fontSize: 12, fontWeight: 650 },
  packBlurb: { color: "#8A7A90", fontSize: 12.5 },
  secureNote: { color: "#6f6276", fontSize: 12.5, margin: "10px 0 0" },
  section: { fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "#8A7A90", fontWeight: 700, margin: "34px 0 12px" },
  muted: { color: "#AC9CB0" },
  list: { display: "flex", flexDirection: "column", border: "1px solid #2a2033", borderRadius: 12, overflow: "hidden" },
  row: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, padding: "8px 14px", borderBottom: "1px solid #241a2b", background: "#1A121F" },
  rowLeft: { display: "flex", flexDirection: "row", alignItems: "baseline", flexWrap: "wrap", gap: 7, minWidth: 0 },
  rowIcon: { fontSize: 13, width: 18, textAlign: "center", flexShrink: 0 },
  label: { color: "#F4EAF0", fontSize: 13 },
  time: { color: "#8A7A90", fontSize: 11.5 },
  amount: { fontWeight: 700, fontSize: 13, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" },
};
