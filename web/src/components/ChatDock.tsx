"use client";

import { useEffect, useRef, useState } from "react";
import { CharacterAvatar } from "./CharacterAvatar";
import { ChatMessageText } from "./ChatMessageText";
import { getChatWelcome } from "@/lib/chatWelcome";
import { pickExpression } from "@/lib/expression";
import { pickStatusLine } from "@/lib/status";
import { speakReply, stopSpeaking } from "@/lib/speech";

type Msg = { role: "user" | "character" | "system"; content: string; id?: string; hasImage?: boolean };

/**
 * Floating chat bubble (bottom-right on desktop, a full-width sticky bar on
 * mobile) to talk to a character in place. Open state can be controlled
 * externally (e.g. a "Talk to X" button elsewhere on the page) by passing
 * `open`/`onOpenChange`; otherwise it manages its own.
 */
export function ChatDock({
  characterId,
  characterName,
  characterTags,
  characterTagline,
  storyId,
  storyTitle,
  chapter,
  open: openProp,
  onOpenChange,
}: {
  characterId: string;
  characterName: string;
  characterTags?: string[];
  characterTagline?: string;
  storyId?: string;
  storyTitle?: string;
  chapter?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [messages, setMessages] = useState<Msg[]>([]);
  const [threadId, setThreadId] = useState<string | undefined>();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [needAuth, setNeedAuth] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [broke, setBroke] = useState(false);
  const [resumedHistory, setResumedHistory] = useState(false);
  const [visualizing, setVisualizing] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [sceneImagePrice, setSceneImagePrice] = useState(8);
  const [welcomeVisit, setWelcomeVisit] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);
  const followUpBuckets = useRef(new Set<string>());

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy, open]);
  useEffect(() => () => stopSpeaking(), []);

  useEffect(() => {
    if (!open || !threadId || !authChecked || needAuth || busy) return;
    const readerMessages = messages.filter((message) => message.role === "user").length;
    if (readerMessages < 5 || readerMessages % 5 !== 0 || messages.at(-1)?.role !== "character") return;
    const key = `${threadId}:${readerMessages / 5}`;
    if (followUpBuckets.current.has(key)) return;

    const timer = window.setTimeout(async () => {
      followUpBuckets.current.add(key);
      try {
        const response = await fetch(`/api/threads/${threadId}/follow-up`, { method: "POST" });
        const data = await response.json().catch(() => ({}));
        if (response.ok && data.ok && data.message) {
          setMessages((current) => current.some((message) => message.id === data.message.id)
            ? current
            : [...current, { role: "character", content: data.message.content, id: data.message.id }]);
        }
      } catch {
        // A temporary network error should not interrupt the reader's chat.
      }
    }, 20_000);
    return () => window.clearTimeout(timer);
  }, [open, threadId, authChecked, needAuth, busy, messages]);

  useEffect(() => {
    if (!open) return;
    setWelcomeVisit((visit) => visit + 1);
    setShowWelcome(true);
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) => { if (d.pricing?.sceneImage) setSceneImagePrice(d.pricing.sceneImage); })
      .catch(() => {});
  }, [open]);

  // Check sign-in status as soon as the panel opens, so an anonymous visitor
  // sees the "sign in to talk" prompt right away instead of only after typing
  // a message and having the request come back 401.
  useEffect(() => {
    if (!open || authChecked) return;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setNeedAuth(!d.user))
      .catch(() => {})
      .finally(() => setAuthChecked(true));
  }, [open, authChecked]);

  // The dock is remounted fresh every time you navigate to a new page, so its
  // local `messages`/`threadId` state starts empty even mid-conversation.
  // Once we know you're signed in, resume the existing thread with this
  // character (if any) instead of looking like the history was lost.
  useEffect(() => {
    if (!open || !authChecked || needAuth || threadId) return;
    (async () => {
      try {
        const convos: { id: string; characterId: string }[] = await fetch("/api/threads").then((r) => r.json());
        const latest = Array.isArray(convos) ? convos.find((c) => c.characterId === characterId) : null;
        if (!latest) return;
        const rows: Msg[] = await fetch(`/api/messages?threadId=${latest.id}`).then((r) => r.json());
        if (!Array.isArray(rows) || !rows.length) return;
        // Guard against a race where the user already started a fresh
        // conversation (sending a message sets threadId) while this was in
        // flight - don't clobber it with older history.
        setThreadId((cur) => cur ?? latest.id);
        setMessages((cur) => (cur.length ? cur : rows));
        setResumedHistory(true);
      } catch {
        /* resuming history is best-effort; a fresh conversation still works */
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, authChecked, needAuth]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setShowWelcome(false);
    // The server persists this same free opener when it creates the thread.
    setMessages((m) => [
      ...m,
      ...(!threadId && m.length === 0 ? [{ role: "character" as const, content: welcome.text }] : []),
      { role: "user" as const, content: text },
    ]);
    setBusy(true); setBroke(false);
    try {
      const body: Record<string, unknown> = { characterId, threadId, message: text };
      // Send the story + current chapter every turn so her memory refreshes (and
      // stays spoiler-bounded) as the reader advances through the story.
      if (storyId) { body.storyId = storyId; if (storyTitle) body.storyTitle = storyTitle; if (chapter) body.chapter = chapter; }
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (res.ok && data.reply) {
        setThreadId(data.threadId);
        setMessages((m) => [...m, { role: "character", content: data.reply, id: data.messageId }]);
      } else if (res.status === 401) {
        setNeedAuth(true);
      } else if (res.status === 402) {
        setBroke(true);
        setMessages((m) => [...m, { role: "system", content: "You're out of credits." }]);
      } else {
        setMessages((m) => [...m, { role: "system", content: `[${data.error || "error"}]` }]);
      }
    } catch {
      setMessages((m) => [...m, { role: "system", content: "[network error]" }]);
    } finally {
      setBusy(false);
    }
  }

  async function visualize(id: string) {
    if (visualizing.has(id)) return;
    setVisualizing((s) => new Set(s).add(id));
    try {
      const res = await fetch(`/api/messages/${id}/visualize`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.ok) {
        setMessages((m) => m.map((mm) => (mm.id === id ? { ...mm, hasImage: true } : mm)));
      } else if (res.status === 402) {
        setBroke(true);
      }
    } catch {
      /* best-effort - the reply still reads fine without an illustration */
    } finally {
      setVisualizing((s) => { const n = new Set(s); n.delete(id); return n; });
    }
  }

  async function saveMoment(id: string) {
    if (saved.has(id)) return;
    try {
      const res = await fetch("/api/moments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messageId: id }) });
      if (res.ok) setSaved((s) => new Set(s).add(id));
    } catch {
      /* saving is best-effort */
    }
  }

  async function listen(id: string, content: string) {
    if (speaking === id) {
      stopSpeaking();
      setSpeaking(null);
      return;
    }
    setSpeaking(id);
    const started = await speakReply(id, content, () => setSpeaking((current) => (current === id ? null : current)));
    if (!started) setSpeaking((current) => (current === id ? null : current));
  }

  const lastReply = [...messages].reverse().find((m) => m.role === "character");
  const expr = pickExpression(lastReply?.content);
  const status = pickStatusLine({ tags: characterTags, expr, isReturning: resumedHistory && messages.length > 0 });
  const welcome = getChatWelcome({ name: characterName, tags: characterTags, backstory: characterTagline, storyTitle, storyChapter: chapter, isReturning: resumedHistory && messages.length > 0, visit: welcomeVisit });

  if (!open) {
    return (
      <button className="rv-chatdock-fab" onClick={() => setOpen(true)} aria-label={`Chat with ${characterName}`}>
        <CharacterAvatar characterId={characterId} name={characterName} size={34} variant={expr} />
        <span style={D.fabLabel}>Chat with {characterName}</span>
      </button>
    );
  }

  return (
    <div className="rv-chatdock-panel" style={D.panel}>
      <div style={D.head}>
        <div style={D.headL}>
          <CharacterAvatar characterId={characterId} name={characterName} size={28} variant={expr} />
          <div>
            <div style={D.name}>{characterName}</div>
            <div style={D.status}>{status}</div>
          </div>
        </div>
        <button style={D.close} onClick={() => setOpen(false)} aria-label="Close">×</button>
      </div>
      <div style={D.feed}>
        {authChecked && messages.length === 0 && !needAuth ? <div style={D.hint}>A first hello from {characterName} is always free.</div> : null}
        {authChecked ? messages.map((m, i) =>
          m.role === "system" ? (
            <div key={i} style={D.sys}>{m.content}</div>
          ) : (
            <div key={i} style={{ ...D.row, flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{ ...D.bubble, ...(m.role === "user" ? D.user : D.bot) }}>
                {m.role === "character" ? <ChatMessageText content={m.content} /> : m.content}
              </div>
              {m.role === "character" && m.id ? (
                <div style={D.actions}>
                  <button style={D.actionBtn} onClick={() => listen(m.id!, m.content)}>
                    {speaking === m.id ? "Stop" : "Listen"}
                  </button>
                  {m.hasImage ? (
                    <button style={D.actionBtn} onClick={() => setLightbox(`/api/messages/${m.id}/image`)}>🖼 View</button>
                  ) : (
                    <button style={D.actionBtn} onClick={() => visualize(m.id!)} disabled={visualizing.has(m.id)}>
                      {visualizing.has(m.id) ? "Visualizing…" : `✨ Visualize · ${sceneImagePrice} credits`}
                    </button>
                  )}
                  <button style={D.actionBtn} onClick={() => saveMoment(m.id!)} disabled={saved.has(m.id)}>
                    {saved.has(m.id) ? "★ Saved" : "☆ Save"}
                  </button>
                </div>
              ) : null}
              {m.hasImage && m.id ? (
                <img src={`/api/messages/${m.id}/image`} alt="" style={D.thumb} onClick={() => setLightbox(`/api/messages/${m.id}/image`)} />
              ) : null}
            </div>
          ),
        ) : null}
        {busy ? <div style={{ ...D.row, justifyContent: "flex-start" }}><div style={{ ...D.bubble, ...D.bot, color: "#8A7A90" }}>…</div></div> : null}
        {authChecked && needAuth ? <a href={`/chat?characterId=${characterId}${storyId ? `&fromStory=${storyId}` : ""}`} style={D.signin}>Sign in to talk to {characterName} →</a> : null}
        {broke ? <a href="/credits" style={D.signin}>Get more credits →</a> : null}
        {authChecked && showWelcome ? (
          <div style={{ ...D.row, flexDirection: "column", alignItems: "flex-start" }}>
            <p style={D.welcomeLabel}>{characterName} started the conversation - free</p>
            <div style={{ ...D.bubble, ...D.bot }}><ChatMessageText content={welcome.text} /></div>
            {!needAuth ? (
              <div style={D.welcomeReplies}>
                {welcome.suggestions.map((suggestion) => <button key={suggestion} style={D.welcomeReply} onClick={() => setInput(suggestion)}>{suggestion}</button>)}
              </div>
            ) : null}
          </div>
        ) : null}
        <div ref={endRef} />
      </div>
      {authChecked && !needAuth ? (
        <div style={D.bar}>
          <input style={D.input} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); send(); } }} placeholder={`Message ${characterName}`} disabled={busy} />
          <button style={{ ...D.send, opacity: busy || !input.trim() ? 0.5 : 1 }} onClick={send} disabled={busy || !input.trim()}>↑</button>
        </div>
      ) : null}
      {lightbox ? (
        <div style={D.lightboxWrap} onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" style={D.lightboxImg} />
        </div>
      ) : null}
    </div>
  );
}

const D: Record<string, React.CSSProperties> = {
  fabLabel: { whiteSpace: "nowrap" },
  panel: { position: "fixed", right: 20, zIndex: 40, width: "min(370px, calc(100vw - 32px))", height: "min(540px, 72vh)", display: "flex", flexDirection: "column", background: "#150F1A", border: "1px solid #3A2E44", borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,.5)" },
  head: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderBottom: "1px solid #3A2E44" },
  headL: { display: "flex", alignItems: "center", gap: 9 },
  name: { fontFamily: "Georgia, serif", fontSize: 17, color: "#F4EAF0", lineHeight: 1.2 },
  status: { fontSize: 11.5, color: "#8A7A90", marginTop: 1 },
  close: { background: "transparent", border: 0, color: "#AC9CB0", fontSize: 22, cursor: "pointer", lineHeight: 1 },
  feed: { flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 9 },
  hint: { color: "#8A7A90", fontSize: 13, textAlign: "center", marginTop: 20 },
  welcomeLabel: { color: "#8A7A90", fontSize: 10.5, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", margin: "2px 0 4px 2px" },
  welcomeReplies: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 },
  welcomeReply: { background: "transparent", color: "#E9A06B", border: "1px solid #5A3A53", borderRadius: 999, padding: "5px 8px", cursor: "pointer", fontSize: 11.5 },
  sys: { color: "#8A7A90", fontSize: 12.5, textAlign: "center" },
  row: { display: "flex" },
  bubble: { maxWidth: "82%", padding: "9px 12px", borderRadius: 14, fontSize: 14, lineHeight: 1.45, whiteSpace: "pre-wrap", wordBreak: "break-word" },
  user: { background: "linear-gradient(100deg,#E9A06B,#D46A8B)", color: "#1A1220", borderBottomRightRadius: 3 },
  bot: { background: "#231A2B", border: "1px solid #3A2E44", color: "#F4EAF0", borderBottomLeftRadius: 3 },
  signin: { color: "#E9A06B", textAlign: "center", textDecoration: "none", fontSize: 14, marginTop: 10 },
  bar: { display: "flex", gap: 8, padding: 12, borderTop: "1px solid #3A2E44" },
  input: { flex: 1, background: "#1A121F", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 10, padding: "10px 12px", fontSize: 14 },
  send: { border: 0, cursor: "pointer", color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", borderRadius: 10, padding: "0 14px", fontWeight: 700, fontSize: 16 },
  actions: { display: "flex", gap: 6, marginTop: 4 },
  actionBtn: { background: "transparent", border: "1px solid #3A2E44", color: "#AC9CB0", borderRadius: 8, padding: "3px 8px", fontSize: 11.5, cursor: "pointer" },
  thumb: { maxWidth: "70%", borderRadius: 10, marginTop: 6, cursor: "zoom-in", border: "1px solid #3A2E44" },
  lightboxWrap: { position: "absolute", inset: 0, background: "rgba(0,0,0,.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, cursor: "zoom-out" },
  lightboxImg: { maxWidth: "92%", maxHeight: "92%", borderRadius: 10 },
};
