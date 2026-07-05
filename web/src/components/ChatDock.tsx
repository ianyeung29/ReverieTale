"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar } from "./Avatar";

type Msg = { role: "user" | "character" | "system"; content: string };

/** Floating chat bubble (bottom-right) to talk to a character in place. */
export function ChatDock({ characterId, characterName, storyId }: { characterId: string; characterName: string; storyId?: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [threadId, setThreadId] = useState<string | undefined>();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [needAuth, setNeedAuth] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy, open]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setBusy(true);
    try {
      const body: Record<string, unknown> = { characterId, threadId, message: text };
      if (!threadId && storyId) body.storyId = storyId; // seed story context on the first turn
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (res.ok && data.reply) {
        setThreadId(data.threadId);
        setMessages((m) => [...m, { role: "character", content: data.reply }]);
      } else if (res.status === 401) {
        setNeedAuth(true);
      } else if (res.status === 402) {
        setMessages((m) => [...m, { role: "system", content: "You're out of credits - open full chat to top up." }]);
      } else {
        setMessages((m) => [...m, { role: "system", content: `[${data.error || "error"}]` }]);
      }
    } catch {
      setMessages((m) => [...m, { role: "system", content: "[network error]" }]);
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button style={D.fab} onClick={() => setOpen(true)} aria-label={`Chat with ${characterName}`}>
        <Avatar name={characterName} size={34} />
        <span style={D.fabLabel}>Chat with {characterName}</span>
      </button>
    );
  }

  return (
    <div style={D.panel}>
      <div style={D.head}>
        <div style={D.headL}><Avatar name={characterName} size={28} /><span style={D.name}>{characterName}</span></div>
        <button style={D.close} onClick={() => setOpen(false)} aria-label="Close">×</button>
      </div>
      <div style={D.feed}>
        {messages.length === 0 && !needAuth ? <div style={D.hint}>Say hi to {characterName}.</div> : null}
        {messages.map((m, i) =>
          m.role === "system" ? (
            <div key={i} style={D.sys}>{m.content}</div>
          ) : (
            <div key={i} style={{ ...D.row, justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{ ...D.bubble, ...(m.role === "user" ? D.user : D.bot) }}>{m.content}</div>
            </div>
          ),
        )}
        {busy ? <div style={{ ...D.row, justifyContent: "flex-start" }}><div style={{ ...D.bubble, ...D.bot, color: "#8A7A90" }}>…</div></div> : null}
        {needAuth ? <a href={`/chat?characterId=${characterId}${storyId ? `&fromStory=${storyId}` : ""}`} style={D.signin}>Sign in to talk to {characterName} →</a> : null}
        <div ref={endRef} />
      </div>
      {!needAuth ? (
        <div style={D.bar}>
          <input style={D.input} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); send(); } }} placeholder={`Message ${characterName}`} disabled={busy} />
          <button style={{ ...D.send, opacity: busy || !input.trim() ? 0.5 : 1 }} onClick={send} disabled={busy || !input.trim()}>↑</button>
        </div>
      ) : null}
    </div>
  );
}

const D: Record<string, React.CSSProperties> = {
  fab: { position: "fixed", right: 20, bottom: 20, zIndex: 40, display: "flex", alignItems: "center", gap: 10, background: "#231A2B", color: "#F4EAF0", border: "1px solid #4a3a50", borderRadius: 999, padding: "8px 16px 8px 8px", cursor: "pointer", boxShadow: "0 10px 30px rgba(0,0,0,.4)", fontSize: 14, fontWeight: 600 },
  fabLabel: { whiteSpace: "nowrap" },
  panel: { position: "fixed", right: 20, bottom: 20, zIndex: 40, width: "min(370px, calc(100vw - 32px))", height: "min(540px, 72vh)", display: "flex", flexDirection: "column", background: "#150F1A", border: "1px solid #3A2E44", borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,.5)" },
  head: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderBottom: "1px solid #3A2E44" },
  headL: { display: "flex", alignItems: "center", gap: 9 },
  name: { fontFamily: "Georgia, serif", fontSize: 17, color: "#F4EAF0" },
  close: { background: "transparent", border: 0, color: "#AC9CB0", fontSize: 22, cursor: "pointer", lineHeight: 1 },
  feed: { flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 9 },
  hint: { color: "#8A7A90", fontSize: 13, textAlign: "center", marginTop: 20 },
  sys: { color: "#8A7A90", fontSize: 12.5, textAlign: "center" },
  row: { display: "flex" },
  bubble: { maxWidth: "82%", padding: "9px 12px", borderRadius: 14, fontSize: 14, lineHeight: 1.45, whiteSpace: "pre-wrap", wordBreak: "break-word" },
  user: { background: "linear-gradient(100deg,#E9A06B,#D46A8B)", color: "#1A1220", borderBottomRightRadius: 3 },
  bot: { background: "#231A2B", border: "1px solid #3A2E44", color: "#F4EAF0", borderBottomLeftRadius: 3 },
  signin: { color: "#E9A06B", textAlign: "center", textDecoration: "none", fontSize: 14, marginTop: 10 },
  bar: { display: "flex", gap: 8, padding: 12, borderTop: "1px solid #3A2E44" },
  input: { flex: 1, background: "#1A121F", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 10, padding: "10px 12px", fontSize: 14 },
  send: { border: 0, cursor: "pointer", color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", borderRadius: 10, padding: "0 14px", fontWeight: 700, fontSize: 16 },
};
