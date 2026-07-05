"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "character"; content: string };
type Char = { id: string; name: string; tagline: string };

export default function ChatPage() {
  const [chars, setChars] = useState<Char[]>([]);
  const [charId, setCharId] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [threadId, setThreadId] = useState<string | undefined>();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/characters")
      .then((r) => r.json())
      .then((c: Char[]) => {
        setChars(c);
        if (c[0]) setCharId(c[0].id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  function pick(id: string) {
    setCharId(id);
    setThreadId(undefined);
    setMessages([]);
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
        body: JSON.stringify({ characterId: charId, threadId, message: text }),
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        setThreadId(data.threadId);
        setMessages((m) => [...m, { role: "character", content: data.reply }]);
      } else {
        setMessages((m) => [...m, { role: "character", content: `[${data.error || "error"}${data.reason ? ": " + data.reason : ""}]` }]);
      }
    } catch {
      setMessages((m) => [...m, { role: "character", content: "[network error]" }]);
    } finally {
      setBusy(false);
    }
  }

  const active = chars.find((c) => c.id === charId);

  return (
    <div style={S.wrap}>
      <div style={S.head}>
        <div>
          <div style={S.name}>{active?.name ?? "Loading..."}</div>
          {active?.tagline ? <div style={S.tag}>{active.tagline}</div> : null}
        </div>
        {chars.length > 1 ? (
          <select value={charId} onChange={(e) => pick(e.target.value)} style={S.select}>
            {chars.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        ) : null}
      </div>

      <div style={S.feed}>
        {messages.length === 0 && !busy ? (
          <div style={S.empty}>Say hello to {active?.name ?? "your companion"}.</div>
        ) : null}
        {messages.map((m, i) => (
          <div key={i} style={{ ...S.row, justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ ...S.bubble, ...(m.role === "user" ? S.user : S.bot) }}>{m.content}</div>
          </div>
        ))}
        {busy ? (
          <div style={{ ...S.row, justifyContent: "flex-start" }}>
            <div style={{ ...S.bubble, ...S.bot, color: "#8A7A90" }}>typing…</div>
          </div>
        ) : null}
        <div ref={endRef} />
      </div>

      <div style={S.barWrap}>
        <div style={S.bar}>
          <input
            style={S.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={`Message ${active?.name ?? "..."}`}
            disabled={busy || !charId}
          />
          <button style={{ ...S.send, opacity: busy || !input.trim() ? 0.5 : 1 }} onClick={send} disabled={busy || !input.trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 720, margin: "0 auto", height: "100vh", display: "flex", flexDirection: "column" },
  head: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: "1px solid #3A2E44" },
  name: { fontFamily: "Georgia, serif", fontSize: 22 },
  tag: { color: "#AC9CB0", fontSize: 13, marginTop: 2 },
  select: { background: "#231A2B", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 8, padding: "8px 10px" },
  feed: { flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 12 },
  empty: { color: "#8A7A90", textAlign: "center", marginTop: 40 },
  row: { display: "flex" },
  bubble: { maxWidth: "78%", padding: "11px 15px", borderRadius: 16, lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word" },
  user: { background: "linear-gradient(100deg,#E9A06B,#D46A8B)", color: "#1A1220", borderBottomRightRadius: 4 },
  bot: { background: "#231A2B", border: "1px solid #3A2E44", color: "#F4EAF0", borderBottomLeftRadius: 4 },
  barWrap: { padding: "14px 20px 22px", borderTop: "1px solid #3A2E44" },
  bar: { display: "flex", gap: 10 },
  input: { flex: 1, background: "#231A2B", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 12, padding: "13px 15px", fontSize: 15 },
  send: { border: 0, cursor: "pointer", color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", borderRadius: 12, padding: "0 22px", fontWeight: 650, fontSize: 15 },
};
