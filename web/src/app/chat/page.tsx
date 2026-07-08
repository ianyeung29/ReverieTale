"use client";

import { useEffect, useRef, useState } from "react";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { EntryGate } from "@/components/EntryGate";

type Msg = { role: "user" | "character" | "system"; content: string };
type Char = { id: string; name: string; tagline: string };
type Convo = { id: string; characterId: string; name: string; lastActiveAt: string };

const OPENERS = [
  "Hey — I've been thinking about you.",
  "Tell me something about yourself.",
  "What have you been up to?",
  "I had the strangest day…",
];

export default function ChatPage() {
  const [authEmail, setAuthEmail] = useState<string | null | undefined>(undefined); // undefined = loading
  const [chars, setChars] = useState<Char[]>([]);
  const [charId, setCharId] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [threadId, setThreadId] = useState<string | undefined>();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [earned, setEarned] = useState(0);
  const [chatPrice, setChatPrice] = useState(1);
  const [broke, setBroke] = useState(false);
  const [storyId, setStoryId] = useState<string | null>(null);
  const [storyChapter, setStoryChapter] = useState<number | undefined>();
  const [convos, setConvos] = useState<Convo[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  function loadConvos() {
    fetch("/api/threads").then((r) => r.json()).then((c: Convo[]) => setConvos(Array.isArray(c) ? c : [])).catch(() => {});
  }

  // Auth check on mount.
  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setAuthEmail(d.user?.email ?? null)).catch(() => setAuthEmail(null));
  }, []);

  // Load data once logged in, and auto-resume the latest conversation so a
  // refresh keeps you in the same chat (she keeps the context) rather than
  // silently starting a new one.
  useEffect(() => {
    if (!authEmail) return;
    const params = new URLSearchParams(window.location.search);
    const urlChar = params.get("characterId");
    const fromStory = params.get("fromStory");
    if (fromStory) setStoryId(fromStory);
    const ch = Number(params.get("chapter"));
    if (ch > 0) setStoryChapter(ch);

    (async () => {
      const cs: Char[] = await fetch("/api/characters").then((r) => r.json()).catch(() => []);
      setChars(Array.isArray(cs) ? cs : []);
      const preferred = urlChar && cs.some((x) => x.id === urlChar) ? urlChar : cs[0]?.id;
      if (preferred) setCharId(preferred);

      fetch("/api/credits").then((r) => r.json()).then((d) => { setCredits(d.balance?.total ?? 0); setEarned(d.earnedFromReaders ?? 0); }).catch(() => {});
      fetch("/api/config").then((r) => r.json()).then((d) => { if (d.pricing?.chat) setChatPrice(d.pricing.chat); }).catch(() => {});

      const cv: Convo[] = await fetch("/api/threads").then((r) => r.json()).catch(() => []);
      const list = Array.isArray(cv) ? cv : [];
      setConvos(list);

      // Resume the most recent conversation for the preferred character
      // (unless we just arrived from a story, which starts a fresh thread).
      if (!fromStory && preferred) {
        const latest = list.find((c) => c.characterId === preferred);
        if (latest) {
          const rows: Msg[] = await fetch(`/api/messages?threadId=${latest.id}`).then((r) => r.json()).catch(() => []);
          if (Array.isArray(rows)) { setMessages(rows); setThreadId(latest.id); }
        }
      }
    })();
  }, [authEmail]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy]);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setAuthEmail(null);
    setMessages([]); setThreadId(undefined); setConvos([]); setCredits(null);
  }

  function newChat() { setThreadId(undefined); setMessages([]); setBroke(false); setStoryId(null); setStoryChapter(undefined); setShowHistory(false); }

  async function switchCharacter(id: string) {
    setCharId(id); setStoryId(null); setBroke(false); setShowHistory(false);
    const latest = convos.find((c) => c.characterId === id);
    if (latest) {
      const rows: Msg[] = await fetch(`/api/messages?threadId=${latest.id}`).then((r) => r.json()).catch(() => []);
      setMessages(Array.isArray(rows) ? rows : []); setThreadId(latest.id);
    } else {
      setMessages([]); setThreadId(undefined);
    }
  }

  async function openConvo(c: Convo) {
    setShowHistory(false); setCharId(c.characterId); setStoryId(null); setBroke(false);
    try {
      const rows: Msg[] = await fetch(`/api/messages?threadId=${c.id}`).then((r) => r.json());
      setMessages(Array.isArray(rows) ? rows : []); setThreadId(c.id);
    } catch { setMessages([]); }
  }

  function setLast(content: string, role: Msg["role"] = "character") {
    setMessages((m) => { const c = m.slice(); c[c.length - 1] = { role, content }; return c; });
  }

  async function send() {
    const text = input.trim();
    if (!text || !charId || busy) return;
    setInput("");
    const wasNew = !threadId;
    setMessages((m) => [...m, { role: "user", content: text }]);
    setBusy(true);
    try {
      const res = await fetch("/api/chat/stream", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId: charId, threadId, message: text, storyId: threadId ? undefined : storyId ?? undefined, chapter: threadId || !storyId ? undefined : storyChapter }),
      });

      const ct = res.headers.get("content-type") || "";
      // JSON = a non-streamed outcome (401 / 402 / blocked / error).
      if (!res.ok || ct.includes("application/json") || !res.body) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 401) { setAuthEmail(null); return; }
        if (res.status === 402) {
          setBroke(true); if (data.balance) setCredits(data.balance.total);
          setMessages((m) => [...m, { role: "system", content: "You're out of credits. Top up to keep chatting." }]);
        } else {
          setMessages((m) => [...m, { role: "system", content: `[${data.error || "error"}${data.reason ? ": " + data.reason : ""}]` }]);
        }
        return;
      }

      setStoryId(null);
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      let acc = "";
      let started = false;
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const parts = buf.split("\n\n");
        buf = parts.pop() || "";
        for (const part of parts) {
          const line = part.replace(/^data:\s?/, "").trim();
          if (!line) continue;
          let ev: { delta?: string; done?: boolean; threadId?: string; balance?: { total: number }; replace?: string; error?: string };
          try { ev = JSON.parse(line); } catch { continue; }
          if (ev.delta) {
            acc += ev.delta;
            if (!started) { started = true; setMessages((m) => [...m, { role: "character", content: acc }]); }
            else setLast(acc);
          } else if (ev.done) {
            if (!started) setMessages((m) => [...m, { role: "character", content: ev.replace || "…" }]);
            else if (ev.replace) setLast(ev.replace);
            if (ev.threadId) setThreadId(ev.threadId);
            if (ev.balance) setCredits(ev.balance.total);
            if (wasNew) loadConvos();
          } else if (ev.error) {
            if (started) setLast("[chat failed]", "system"); else setMessages((m) => [...m, { role: "system", content: "[chat failed]" }]);
          }
        }
      }
    } catch {
      setMessages((m) => [...m, { role: "system", content: "[network error]" }]);
    } finally { setBusy(false); }
  }

  if (authEmail === undefined) return <div style={S.center}>Loading…</div>;
  if (authEmail === null) return <EntryGate onDone={(email) => setAuthEmail(email)} />;

  const active = chars.find((c) => c.id === charId);

  return (
    <div style={S.wrap}>
      <div style={S.head}>
        <div style={S.headLeft}>
          <button style={S.iconBtn} onClick={newChat} title="New conversation">＋ New</button>
          <button style={S.iconBtn} onClick={() => { setShowHistory((v) => !v); loadConvos(); }} title="Past conversations">History ▾</button>
        </div>
        <div style={S.nameWrap}>
          {active ? <CharacterAvatar characterId={active.id} name={active.name} size={30} /> : null}
          <span style={S.name}>{active?.name ?? "Loading…"}</span>
        </div>
        <div style={S.headRight}>
          <span style={S.credits} title={`Credit balance · ${chatPrice} credit${chatPrice === 1 ? "" : "s"} per message`}>◈ {credits ?? "…"} <span style={S.perMsg}>· {chatPrice}/msg</span></span>
          {earned > 0 ? <span style={S.earned} title="credits earned from readers chatting with your characters">★ {earned}</span> : null}
          {chars.length > 1 ? (
            <select value={charId} onChange={(e) => switchCharacter(e.target.value)} style={S.select}>
              {chars.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          ) : null}
          <button style={S.iconBtn} onClick={signOut} title={authEmail}>Sign out</button>
        </div>
      </div>

      {showHistory ? (
        <div style={S.history}>
          {convos.length === 0 ? <div style={S.histEmpty}>No past conversations yet.</div> : null}
          {convos.map((c) => (
            <button key={c.id} style={{ ...S.histItem, ...(c.id === threadId ? S.histActive : {}) }} onClick={() => openConvo(c)}>
              <span>{c.name}</span><span style={S.histDate}>{new Date(c.lastActiveAt).toLocaleDateString()}</span>
            </button>
          ))}
        </div>
      ) : null}

      <div style={S.feed}>
        {messages.length === 0 && !busy ? (
          <div style={S.empty}>
            {active ? <CharacterAvatar characterId={active.id} name={active.name} size={60} /> : null}
            <p style={S.emptyName}>{active?.name ?? "your companion"}</p>
            <p style={S.emptyHint}>Say hello — they&apos;ll remember what you share.</p>
            <div style={S.openers}>
              {OPENERS.map((o) => (
                <button key={o} style={S.opener} onClick={() => setInput(o)}>{o}</button>
              ))}
            </div>
          </div>
        ) : null}
        {messages.map((m, i) =>
          m.role === "system" ? (
            <div key={i} style={S.sys}>{m.content}</div>
          ) : (
            <div key={i} style={{ ...S.row, justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{ ...S.bubble, ...(m.role === "user" ? S.user : S.bot) }}>{m.content}</div>
            </div>
          ),
        )}
        {busy && (messages.length === 0 || messages[messages.length - 1].role !== "character") ? (
          <div style={{ ...S.row, justifyContent: "flex-start" }}><div style={{ ...S.bubble, ...S.bot, color: "#8A7A90" }}>typing…</div></div>
        ) : null}
        <div ref={endRef} />
      </div>

      <div style={S.barWrap}>
        {broke ? <a href="/credits" style={S.topup}>Out of credits — get more →</a> : null}
        <div style={S.bar}>
          <input style={S.input} value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={`Message ${active?.name ?? "…"}`} disabled={busy || !charId} />
          <button style={{ ...S.send, opacity: busy || !input.trim() ? 0.5 : 1 }} onClick={send} disabled={busy || !input.trim()}>Send</button>
        </div>
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 720, margin: "0 auto", height: "calc(100dvh - 52px)", display: "flex", flexDirection: "column" },
  center: { minHeight: "calc(100dvh - 52px)", display: "grid", placeItems: "center", padding: 24, color: "#AC9CB0" },
  gate: { display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 360, background: "#231A2B", border: "1px solid #3A2E44", borderRadius: 18, padding: "30px 26px", textAlign: "center" },
  gateMk: { fontSize: 12, letterSpacing: ".2em", textTransform: "uppercase", color: "#E9A06B", fontWeight: 700, margin: 0 },
  gateH: { fontFamily: "Georgia, serif", fontSize: 26, margin: 0, color: "#F4EAF0" },
  gateSub: { color: "#AC9CB0", margin: "0 0 6px", fontSize: 14 },
  gateChk: { display: "flex", alignItems: "center", gap: 8, color: "#AC9CB0", fontSize: 14, justifyContent: "center" },
  gateErr: { color: "#E88", fontSize: 13, margin: 0 },
  head: { display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid #3A2E44", gap: 10 },
  headLeft: { display: "flex", gap: 8 },
  headRight: { display: "flex", alignItems: "center", gap: 10 },
  iconBtn: { background: "#231A2B", color: "#AC9CB0", border: "1px solid #3A2E44", borderRadius: 8, padding: "7px 11px", fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" },
  nameWrap: { display: "flex", alignItems: "center", gap: 9, justifyContent: "center", overflow: "hidden" },
  name: { fontFamily: "Georgia, serif", fontSize: 20, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  credits: { color: "#E9A06B", fontWeight: 650, fontSize: 14, fontVariantNumeric: "tabular-nums" },
  perMsg: { color: "#8A7A90", fontWeight: 500, fontSize: 12 },
  earned: { color: "#D46A8B", fontWeight: 650, fontSize: 13, fontVariantNumeric: "tabular-nums" },
  select: { background: "#231A2B", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 8, padding: "7px 9px" },
  history: { borderBottom: "1px solid #3A2E44", maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column" },
  histEmpty: { color: "#8A7A90", fontSize: 14, padding: "14px 18px" },
  histItem: { display: "flex", justifyContent: "space-between", background: "transparent", color: "#F4EAF0", border: 0, borderBottom: "1px solid #241a2b", padding: "12px 18px", cursor: "pointer", fontSize: 14, textAlign: "left" },
  histActive: { background: "#231A2B" },
  histDate: { color: "#8A7A90", fontSize: 12 },
  feed: { flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 12 },
  empty: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", margin: "auto", padding: 20, gap: 4 },
  emptyName: { fontFamily: "Georgia, serif", fontSize: 22, color: "#F4EAF0", margin: "12px 0 0" },
  emptyHint: { color: "#8A7A90", fontSize: 14, margin: "2px 0 16px" },
  openers: { display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 340 },
  opener: { background: "#241B2D", color: "#CBBBD0", border: "1px solid #3A2E44", borderRadius: 12, padding: "11px 14px", cursor: "pointer", fontSize: 14, textAlign: "left" },
  sys: { alignSelf: "center", color: "#8A7A90", fontSize: 13, textAlign: "center" },
  row: { display: "flex" },
  bubble: { maxWidth: "78%", padding: "11px 15px", borderRadius: 16, lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word" },
  user: { background: "linear-gradient(100deg,#E9A06B,#D46A8B)", color: "#1A1220", borderBottomRightRadius: 4 },
  bot: { background: "#231A2B", border: "1px solid #3A2E44", color: "#F4EAF0", borderBottomLeftRadius: 4 },
  barWrap: { padding: "14px 20px 22px", borderTop: "1px solid #3A2E44", display: "flex", flexDirection: "column", gap: 10 },
  topup: { alignSelf: "center", border: "1px solid #E9A06B", color: "#E9A06B", background: "transparent", borderRadius: 10, padding: "8px 16px", cursor: "pointer", fontSize: 14, textDecoration: "none" },
  bar: { display: "flex", gap: 10 },
  input: { flex: 1, background: "#1A121F", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 12, padding: "13px 15px", fontSize: 15 },
  send: { border: 0, cursor: "pointer", color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", borderRadius: 12, padding: "0 22px", fontWeight: 650, fontSize: 15 },
};
