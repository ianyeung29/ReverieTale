"use client";

import { useEffect, useState } from "react";
import { EntryGate } from "@/components/EntryGate";
import { MIN_AGE } from "@/lib/legal";

type Me = { email: string; displayName: string; isAdmin: boolean; pendingReviews: number };
type Char = { id: string; status: string };
type Blocked = { id: string; name: string };
type Balance = { purchased: number; earned: number; total: number };

export default function ProfilePage() {
  const [authEmail, setAuthEmail] = useState<string | null | undefined>(undefined);
  const [me, setMe] = useState<Me | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [savedName, setSavedName] = useState("");
  const [savingName, setSavingName] = useState(false);

  const [chars, setChars] = useState<Char[] | null>(null);
  const [blocked, setBlocked] = useState<Blocked[]>([]);
  const [unblockBusy, setUnblockBusy] = useState<string | null>(null);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [earnedFromReaders, setEarnedFromReaders] = useState(0);
  const [savedStories, setSavedStories] = useState<number | null>(null);
  const [myStories, setMyStories] = useState<number | null>(null);

  function load() {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (!d.user) return;
      const u: Me = { email: d.user.email, displayName: d.user.displayName ?? "", isAdmin: Boolean(d.user.isAdmin), pendingReviews: d.user.pendingReviews ?? 0 };
      setMe(u);
      setDisplayName(u.displayName);
      setSavedName(u.displayName);
    }).catch(() => {});
    fetch("/api/characters/mine").then((r) => (r.ok ? r.json() : [])).then((d: Char[]) => setChars(Array.isArray(d) ? d : [])).catch(() => setChars([]));
    fetch("/api/characters/blocked").then((r) => (r.ok ? r.json() : [])).then((d: Blocked[]) => setBlocked(Array.isArray(d) ? d : [])).catch(() => {});
    fetch("/api/credits").then((r) => (r.ok ? r.json() : null)).then((d) => { if (d) { setBalance(d.balance ?? null); setEarnedFromReaders(d.earnedFromReaders ?? 0); } }).catch(() => {});
    fetch("/api/stories/saved").then((r) => (r.ok ? r.json() : [])).then((d) => setSavedStories(Array.isArray(d) ? d.length : 0)).catch(() => setSavedStories(0));
    fetch("/api/stories/mine").then((r) => (r.ok ? r.json() : [])).then((d) => setMyStories(Array.isArray(d) ? d.length : 0)).catch(() => setMyStories(0));
  }

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setAuthEmail(d.user?.email ?? null)).catch(() => setAuthEmail(null));
  }, []);
  useEffect(() => { if (authEmail) load(); }, [authEmail]);

  async function saveName() {
    if (savingName || displayName.trim() === savedName.trim()) return;
    setSavingName(true);
    try {
      const res = await fetch("/api/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ displayName: displayName.trim() }) });
      if (res.ok) setSavedName(displayName.trim());
    } catch {} finally { setSavingName(false); }
  }

  async function unblock(id: string) {
    if (unblockBusy) return;
    setUnblockBusy(id);
    try {
      const res = await fetch(`/api/characters/${id}/block`, { method: "POST" });
      if (res.ok) setBlocked((cur) => cur.filter((b) => b.id !== id));
    } catch {} finally { setUnblockBusy(null); }
  }

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    window.location.href = "/";
  }

  if (authEmail === undefined) return <main style={S.wrap}><p style={{ color: "#AC9CB0" }}>Loading…</p></main>;
  if (authEmail === null) return <EntryGate onDone={(e) => setAuthEmail(e)} subtitle={`Sign in to see your profile. ${MIN_AGE}+ only.`} />;

  const published = chars?.filter((c) => c.status === "published").length ?? 0;
  const inReview = chars?.filter((c) => c.status === "in_review").length ?? 0;

  return (
    <main style={S.wrap}>
      <a href="/" style={S.back}>← Reverie</a>
      <h1 style={S.h1}>Your profile</h1>
      <p style={S.sub}>Everything about your account, your world, and your companions — in one place.</p>

      <div style={S.grid}>
        <div className="rv-card" style={S.card}>
          <p style={S.cardTitle}>Account</p>
          <div style={S.field}>
            <span style={S.fieldLabel}>Email</span>
            <span style={S.fieldValue}>{me?.email}</span>
          </div>
          <div style={S.field}>
            <span style={S.fieldLabel}>Displayed as</span>
            <div style={S.nameRow}>
              <input style={S.nameInput} value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="a public creator name (optional)" maxLength={40} />
              <button style={{ ...S.nameSave, opacity: savingName || displayName.trim() === savedName.trim() ? 0.5 : 1 }} onClick={saveName} disabled={savingName || displayName.trim() === savedName.trim()}>
                {savingName ? "Saving…" : displayName.trim() === savedName.trim() ? "Saved" : "Save"}
              </button>
            </div>
            <span style={S.fieldHint}>Shown as the creator on your companions&apos; profiles. Blank = &quot;Anonymous creator.&quot; Your email is never shown.</span>
          </div>
          <div style={S.field}>
            <span style={S.fieldLabel}>Age</span>
            <span style={S.fieldValue}>Confirmed {MIN_AGE}+ <span style={S.fieldHint}>(self-attestation — see our <a href="/legal/underage" style={S.link}>Underage Policy</a>)</span></span>
          </div>
          <button type="button" style={S.signOut} onClick={signOut}>Sign out</button>
        </div>

        <div className="rv-card" style={S.card}>
          <p style={S.cardTitle}>Credits</p>
          <p style={S.bigNumber}>◈ {balance?.total ?? "—"}</p>
          <p style={S.cardSub}>{balance ? `${balance.purchased} purchased · ${balance.earned} earned` : "Loading…"}</p>
          {earnedFromReaders > 0 ? <p style={S.earnLine}>★ {earnedFromReaders} earned from readers chatting with your companions</p> : null}
          <a href="/credits" style={S.cardLink}>View credits &amp; purchase history →</a>
        </div>

        <div className="rv-card" style={S.card}>
          <p style={S.cardTitle}>Your companions</p>
          <p style={S.bigNumber}>{chars === null ? "—" : chars.length}</p>
          <p style={S.cardSub}>{published} published{inReview ? ` · ${inReview} in review` : ""}</p>
          <a href="/characters" style={S.cardLink}>Manage your companions →</a>
          {me?.isAdmin ? (
            <a href="/admin/review" style={S.cardLink}>
              Review queue{me.pendingReviews ? ` (${me.pendingReviews})` : ""} →
            </a>
          ) : null}
        </div>

        <div className="rv-card" style={S.card}>
          <p style={S.cardTitle}>Your library</p>
          <p style={S.bigNumber}>{myStories === null || savedStories === null ? "—" : myStories + savedStories}</p>
          <p style={S.cardSub}>{myStories ?? 0} written by you{savedStories ? ` · ${savedStories} saved` : ""}</p>
          <a href="/library" style={S.cardLink}>Go to your library →</a>
        </div>
      </div>

      <p style={S.section}>Trust &amp; safety</p>
      {blocked.length === 0 ? (
        <p style={S.muted}>No hidden companions. Hide any companion from its profile page — it only affects your own Browse/Home/tags.</p>
      ) : (
        <>
          <p style={S.blockedSub}>Hidden companions · {blocked.length} — hidden from your Browse, Home, and tag pages. This doesn&apos;t affect anyone else.</p>
          <div style={S.blockedList}>
            {blocked.map((b) => (
              <div key={b.id} style={S.blockedRow}>
                <a href={`/c/${b.id}`} style={S.blockedName}>{b.name}</a>
                <button style={{ ...S.action, opacity: unblockBusy === b.id ? 0.5 : 1 }} onClick={() => unblock(b.id)} disabled={unblockBusy === b.id}>Show again</button>
              </div>
            ))}
          </div>
        </>
      )}

      <p style={S.section}>More</p>
      <div style={S.linkRow}>
        <a href="/guidelines" style={S.footLink}>Community guidelines</a>
        <a href="/legal" style={S.footLink}>Legal information</a>
      </div>
    </main>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 900, margin: "0 auto", padding: "40px 24px 90px", lineHeight: 1.6 },
  back: { color: "#8A7A90", textDecoration: "none", fontSize: 14, letterSpacing: ".04em" },
  h1: { fontFamily: "Georgia, serif", fontSize: 38, margin: "22px 0 6px" },
  sub: { color: "#AC9CB0", margin: "0 0 26px", fontSize: 14.5 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16, marginBottom: 8 },
  card: { display: "flex", flexDirection: "column", gap: 8, background: "#241B2D", border: "1px solid #3A2E44", borderRadius: 14, padding: 18 },
  cardTitle: { fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", color: "#8A7A90", fontWeight: 700, margin: "0 0 4px" },
  cardSub: { color: "#8A7A90", fontSize: 13, margin: 0 },
  cardLink: { color: "#E9A06B", fontSize: 13.5, fontWeight: 600, textDecoration: "none", marginTop: 4 },
  bigNumber: { fontFamily: "Georgia, serif", fontSize: 30, color: "#F4EAF0", margin: 0, fontVariantNumeric: "tabular-nums" },
  earnLine: { color: "#D46A8B", fontSize: 13, margin: 0 },
  field: { display: "flex", flexDirection: "column", gap: 4, paddingTop: 4 },
  fieldLabel: { fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "#8A7A90", fontWeight: 700 },
  fieldValue: { color: "#F4EAF0", fontSize: 14.5 },
  fieldHint: { color: "#6f6276", fontSize: 12 },
  nameRow: { display: "flex", gap: 8 },
  nameInput: { flex: 1, background: "#1A121F", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 9, padding: "9px 12px", fontSize: 14 },
  nameSave: { color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", border: 0, borderRadius: 9, padding: "9px 14px", cursor: "pointer", fontWeight: 650, fontSize: 13.5, whiteSpace: "nowrap" },
  signOut: { alignSelf: "flex-start", marginTop: 8, background: "transparent", color: "#8A7A90", border: "1px solid #3A2E44", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontSize: 13, fontWeight: 500 },
  link: { color: "#E9A06B" },
  section: { fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "#9A8AA0", fontWeight: 700, margin: "36px 0 10px" },
  muted: { color: "#AC9CB0", fontSize: 14 },
  blockedSub: { color: "#6f6276", fontSize: 13, margin: "0 0 14px" },
  blockedList: { display: "flex", flexDirection: "column", gap: 8 },
  blockedRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: "#1A1420", border: "1px solid #2f2438", borderRadius: 10, padding: "10px 14px" },
  blockedName: { color: "#F4EAF0", textDecoration: "none", fontSize: 14.5 },
  action: { fontSize: 13, color: "#E9A06B", background: "transparent", border: "1px solid #4a3a50", borderRadius: 8, padding: "7px 12px", cursor: "pointer" },
  linkRow: { display: "flex", flexWrap: "wrap", gap: 16 },
  footLink: { color: "#E9A06B", textDecoration: "none", fontSize: 14, fontWeight: 600 },
};
