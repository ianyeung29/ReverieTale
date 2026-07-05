"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "character" | "system"; content: string };
type Char = { id: string; name: string; tagline: string };
type Convo = { id: string; characterId: string; name: string; lastActiveAt: string };

export default function ChatPage() {
  const [chars, setChars] = useState<Char[]>([]);
  const [charId, setCharId] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [threadId, setThreadId] = useState<string | undefined>();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [broke, setBroke] = useState(false);
  const [storyId, setStoryId] = useState<string | null>(null);
  const [convos, setConvos] = useState<Convo[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  function loadConvos() {
    fetch("/api/threads").then((r) => r.json()).then((c: Convo[]) => setConvos(Array.isArray(c) ? c : [])).catch(() => {});
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlChar = params.get("characterId");
    const fromStory = params.get("fromStory");
    if (fromStory) setStoryId(fromStory);

    fetch("/api/characters").then((r) => r.json()).then((c: Char[]) => {
      setChars(c);
      const preferred = urlChar && c.some((x) => x.id === urlChar) ? urlChar : c[0]?.id;
      if (preferred) setCharId(preferred);
    }).catch(() => {});
    fetch("/api/credits").then((r) => r.json()).then((d) => setCredits(d.balance?.total ?? 0)).catch(() => {});
    loadConvos();
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy]);

  function newChat() {
    setThreadId(undefined);
    setMessages([]);
    setBroke(false);
    setStoryId(null);
    setShowHistory(false);
  }

  function switchCharacter(id: string) {
    setCharId(id);
    newChat();
  }

  async function openConvo(c: Convo) {
    setShowHistory(false);
    setCharId(c.characterId);
    setStoryId(null);
    setBroke(false);
    try {
      const rows: Msg[] = await fetch(`/api/messages?threadId=${c.id}`).then((r) => r.json());
      setMessages(Array.isArray(rows) ? rows : []);
      setThreadId(c.id);
    } catch {
      setMessages([]);
    }
  }

  async function topUp() {
    try {
      const d = await fetch("/api/credits", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ credits: 100 }) }).then((r) => r.json());
      if (d.balance) { setCredits(d.balance.total); setBroke(false); }
    } catch {}
  }

  async function send() {
    const text = input.trim();
    if (!text || !charId || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId: charId, threadId, message: text, storyId: threadId ? undefined : storyId ?? undefined }),
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        const isNew = !threadId;
        setThreadId(data.threadId);
        setStoryId(null);
        setMessages((m) => [...m, { role: "character", content: data.reply }]);
        if (data.balance) setCredits(data.balance.total);
        if (isNew) loadConvos();
      } else if (res.status === 402) {
        setBroke(true);
        if (data.balance) setCredits(data.balance.total);
        setMessages((m) => [...m, { role: "system", content: "You're out of credits. Top up to keep chatting." }]);
      } else {
        setMessages((m) => [...m, { role: "system", content: `[${data.error || "error"}${data.reason ? ": " + data.reason : ""}]` }]);
      }
    } catch {
      setMessages((m) => [...m, { role: "system", content: "[network error]" }]);
    } finally {
      setBusy(false);
    }
  }

  const active = chars.find((c) => c.id === charId);

  return (
    <div style={S.wrap}>
      <div style={S.head}>
        <div style={S.headLeft}>
          <button style={S.iconBtn} onClick={newChat} title="New conversation">＋ New</button>
          <button style={S.iconBtn} onClick={() => { setShowHistory((v) => !v); loadConvos(); }} title="Past conversations">History ▾</button>
        </div>
        <div>
          <div style={S.name}>{active?.name ?? "Loading…"}</div>
        </div>
        <div style={S.headRight}>
          <span style={S.credits} title="credit balance">◈ {credits ?? "…"}</span>
          {chars.length > 1 ? (
            <select value={charId} onChange={(e) => switchCharacter(e.target.value)} style={S.select}>
              {chars.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          ) : null}
        </div>
      </div>

      {showHistory ? (
        <div style={S.history}>
          {convos.length === 0 ? <div style={S.histEmpty}>No past conversations yet.</div> : null}
          {convos.map((c) => (
            <button key={c.id} style={{ ...S.histItem, ...(c.id === threadId ? S.histActive : {}) }} onClick={() => openConvo(c)}>
              <span>{c.name}</span>
              <span style={S.histDate}>{new Date(c.lastActiveAt).toLocaleDateString()}</span>
            </button>
          ))}
        </div>
      ) : null}

      <div style={S.feed}>
        {messages.length === 0 && !busy ? <div style={S.empty}>Say hello to {active?.name ?? "your companion"}.</div> : null}
        {messages.map((m, i) =>
          m.role === "system" ? (
            <div key={i} style={S.sys}>{m.content}</div>
          ) : (
            <div key={i} style={{ ...S.row, justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{ ...S.bubble, ...(m.role === "user" ? S.user : S.bot) }}>{m.content}</div>
            </div>
          ),
        )}
        {busy ? (
          <div style={{ ...S.row, justifyContent: "flex-start" }}>
            <div style={{ ...S.bubble, ...S.bot, color: "#8A7A90" }}>typing…</div>
          </div>
        ) : null}
        <div ref={endRef} />
      </div>

      <div style={S.barWrap}>
        {broke ? <button style={S.topup} onClick={topUp}>Top up 100 credits (dev)</button> : null}
        <div style={S.bar}>
          <input
            style={S.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={`Message ${active?.name ?? "…"}`}
            disabled={busy || !charId}
          />
          <button style={{ ...S.send, opacity: busy || !input.trim() ? 0.5 : 1 }} onClick={send} disabled={busy || !input.trim()}>Send</button>
        </div>
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 720, margin: "0 auto", height: "100vh", display: "flex", flexDirection: "column" },
  head: { display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid #3A2E44", gap: 10 },
  headLeft: { display: "flex", gap: 8, justifySelf: "start" },
  headRight: { display: "flex", alignItems: "center", gap: 10, justifySelf: "end" },
  iconBtn: { background: "#231A2B", color: "#AC9CB0", border: "1px solid #3A2E44", borderRadius: 8, padding: "7px 11px", fontSize: 13, cursor: "pointer" },
  name: { fontFamily: "Georgia, serif", fontSize: 20, textAlign: "center", whiteSpace: "nowrap" },
  credits: { color: "#E9A06B", fontWeight: 650, fontSize: 14, fontVariantNumeric: "tabular-nums" },
  select: { background: "#231A2B", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 8, padding: "7px 9px" },
  history: { borderBottom: "1px solid #3A2E44", maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column" },
  histEmpty: { color: "#8A7A90", fontSize: 14, padding: "14px 18px" },
  histItem: { display: "flex", justifyContent: "space-between", background: "transparent", color: "#F4EAF0", border: 0, borderBottom: "1px solid #241a2b", padding: "12px 18px", cursor: "pointer", fontSize: 14, textAlign: "left" },
  histActive: { background: "#231A2B" },
  histDate: { color: "#8A7A90", fontSize: 12 },
  feed: { flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 12 },
  empty: { color: "#8A7A90", textAlign: "center", marginTop: 40 },
  sys: { alignSelf: "center", color: "#8A7A90", fontSize: 13, textAlign: "center" },
  row: { display: "flex" },
  bubble: { maxWidth: "78%", padding: "11px 15px", borderRadius: 16, lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word" },
  user: { background: "linear-gradient(100deg,#E9A06B,#D46A8B)", color: "#1A1220", borderBottomRightRadius: 4 },
  bot: { background: "#231A2B", border: "1px solid #3A2E44", color: "#F4EAF0", borderBottomLeftRadius: 4 },
  barWrap: { padding: "14px 20px 22px", borderTop: "1px solid #3A2E44", display: "flex", flexDirection: "column", gap: 10 },
  topup: { alignSelf: "center", border: "1px solid #E9A06B", color: "#E9A06B", background: "transparent", borderRadius: 10, padding: "8px 16px", cursor: "pointer", fontSize: 14 },
  bar: { display: "flex", gap: 10 },
  input: { flex: 1, background: "#231A2B", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 12, padding: "13px 15px", fontSize: 15 },
  send: { border: 0, cursor: "pointer", color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", borderRadius: 12, padding: "0 22px", fontWeight: 650, fontSize: 15 },
};
