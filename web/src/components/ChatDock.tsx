"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { CharacterAvatar } from "./CharacterAvatar";
import { splitChatBubbles, splitChatMessage } from "./ChatMessageText";
import { getChatWelcome } from "@/lib/chatWelcome";
import { pickExpression } from "@/lib/expression";
import { pickStatusLine } from "@/lib/status";
import { speakReply, stopSpeaking } from "@/lib/speech";

type Msg = { role: "user" | "character" | "system"; content: string; id?: string; hasImage?: boolean; sequence?: boolean };
const REPLY_TYPING_DELAY_MS = 2_000;
const REPLY_QUIET_DELAY_MS = 2_500;
const NEXT_MESSAGE_QUIET_MS = 2_000;
const NEXT_MESSAGE_TYPING_MS = 3_000;

function waitForReplyBeat() {
  return new Promise<void>((resolve) => window.setTimeout(resolve, REPLY_TYPING_DELAY_MS));
}

function waitBeforeTyping() {
  return new Promise<void>((resolve) => window.setTimeout(resolve, REPLY_QUIET_DELAY_MS));
}

function CharacterMessage({ content, sequence = false }: { content: string; sequence?: boolean }) {
  const bubbles = splitChatBubbles(content);
  const [visibleBubbles, setVisibleBubbles] = useState(sequence ? 1 : bubbles.length);
  const [showTyping, setShowTyping] = useState(false);

  useEffect(() => {
    if (!sequence || bubbles.length < 2) {
      setVisibleBubbles(bubbles.length);
      setShowTyping(false);
      return;
    }

    setVisibleBubbles(1);
    setShowTyping(false);
    const timers: number[] = [];
    for (let index = 1; index < bubbles.length; index += 1) {
      const offset = (index - 1) * (NEXT_MESSAGE_QUIET_MS + NEXT_MESSAGE_TYPING_MS);
      timers.push(window.setTimeout(() => setShowTyping(true), offset + NEXT_MESSAGE_QUIET_MS));
      timers.push(window.setTimeout(() => {
        setVisibleBubbles(index + 1);
        setShowTyping(false);
      }, offset + NEXT_MESSAGE_QUIET_MS + NEXT_MESSAGE_TYPING_MS));
    }
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [content, sequence, bubbles.length]);

  return (
    <div style={D.characterMessage}>
      {bubbles.slice(0, visibleBubbles).map((bubble, bubbleIndex) => (
        <Fragment key={`${bubbleIndex}-${bubble}`}>
          {splitChatMessage(bubble).map((part, partIndex) =>
            part.kind === "narrative" ? (
              <p key={`${bubbleIndex}-${partIndex}-${part.content}`} style={D.narrative}>{part.content}</p>
            ) : (
              <div key={`${bubbleIndex}-${partIndex}-${part.content}`} style={{ ...D.bubble, ...D.bot, ...D.characterSpeech }}>{part.content}</div>
            ),
          )}
          {showTyping && bubbleIndex === visibleBubbles - 1 && visibleBubbles < bubbles.length ? (
            <div className="rv-typing-indicator" style={{ ...D.bubble, ...D.bot, ...D.typing }}>typing...</div>
          ) : null}
        </Fragment>
      ))}
    </div>
  );
}

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
  characterPersona,
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
  characterPersona?: string;
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
  const [showInitialTyping, setShowInitialTyping] = useState(false);
  const [needAuth, setNeedAuth] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [broke, setBroke] = useState(false);
  const [resumedHistory, setResumedHistory] = useState(false);
  const [sharingSelfies, setSharingSelfies] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [welcomeVisit, setWelcomeVisit] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy, open]);
  useEffect(() => () => stopSpeaking(), []);

  useEffect(() => {
    if (!open) return;
    setWelcomeVisit((visit) => visit + 1);
    if (messages.length > 0) setShowWelcome(false);
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
        setShowWelcome(false);
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
    setShowInitialTyping(false);
    try {
      await waitBeforeTyping();
      setShowInitialTyping(true);
      await waitForReplyBeat();
      const body: Record<string, unknown> = { characterId, threadId, message: text };
      // Send the story + current chapter every turn so her memory refreshes (and
      // stays spoiler-bounded) as the reader advances through the story.
      if (storyId) { body.storyId = storyId; if (storyTitle) body.storyTitle = storyTitle; if (chapter) body.chapter = chapter; }
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (res.ok && data.reply) {
        setThreadId(data.threadId);
        setMessages((m) => [...m, { role: "character", content: data.reply, id: data.messageId, sequence: true }]);
        void shareSelfie(data.messageId);
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
      setShowInitialTyping(false);
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

  async function shareSelfie(id: string) {
    setSharingSelfies((current) => new Set(current).add(id));
    try {
      const response = await fetch(`/api/messages/${id}/share-selfie`, { method: "POST" });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.shared) {
        setMessages((current) => current.map((message) => message.id === id ? { ...message, hasImage: true } : message));
      }
    } catch {
      // Keep the conversation moving if a non-essential photo share fails.
    } finally {
      setSharingSelfies((current) => { const next = new Set(current); next.delete(id); return next; });
    }
  }

  const lastReply = [...messages].reverse().find((m) => m.role === "character");
  const expr = pickExpression(lastReply?.content);
  const status = pickStatusLine({ tags: characterTags, expr, isReturning: resumedHistory && messages.length > 0 });
  const welcome = getChatWelcome({ name: characterName, tags: characterTags, persona: characterPersona, backstory: characterTagline, storyTitle, storyChapter: chapter, isReturning: resumedHistory && messages.length > 0, visit: welcomeVisit });

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
              {m.role === "character" ? (
                <CharacterMessage content={m.content} sequence={m.sequence} />
              ) : (
                <div style={{ ...D.bubble, ...D.user }}>{m.content}</div>
              )}
              {m.role === "character" && m.id ? (
                <div style={D.actions}>
                  <button style={D.actionBtn} onClick={() => listen(m.id!, m.content)}>
                    {speaking === m.id ? "Stop" : "Listen"}
                  </button>
                  {m.hasImage ? (
                    <button style={D.actionBtn} onClick={() => setLightbox(`/api/messages/${m.id}/image`)}>🖼 View</button>
                  ) : sharingSelfies.has(m.id) ? (
                    <span style={D.sharingSelfie}>sharing a selfie...</span>
                  ) : null}
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
        {busy && showInitialTyping ? <div style={{ ...D.row, justifyContent: "flex-start" }}><div className="rv-typing-indicator" style={{ ...D.bubble, ...D.bot, ...D.typing }}>typing...</div></div> : null}
        {authChecked && needAuth ? <a href={`/chat?characterId=${characterId}${storyId ? `&fromStory=${storyId}` : ""}`} style={D.signin}>Sign in to talk to {characterName} →</a> : null}
        {broke ? <a href="/credits" style={D.signin}>Get more credits →</a> : null}
        {authChecked && showWelcome && messages.length === 0 ? (
          <div style={{ ...D.row, flexDirection: "column", alignItems: "flex-start" }}>
            <p style={D.welcomeLabel}>{characterName} started the conversation - free</p>
            <CharacterMessage content={welcome.text} />
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
  bubble: { maxWidth: "76%", padding: "8px 11px", borderRadius: 13, fontSize: 14, lineHeight: 1.45, whiteSpace: "pre-wrap", wordBreak: "break-word" },
  user: { background: "linear-gradient(100deg,#E9A06B,#D46A8B)", color: "#1A1220", borderBottomRightRadius: 3 },
  bot: { background: "#231A2B", border: "1px solid #3A2E44", color: "#F4EAF0", borderBottomLeftRadius: 3 },
  characterMessage: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6, maxWidth: "76%" },
  narrative: { maxWidth: "100%", margin: "0 1px", padding: "1px 0 1px 8px", borderLeft: "2px solid rgba(216,142,173,.62)", color: "#D88EAD", fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif', fontSize: 12.5, fontStyle: "italic", lineHeight: 1.42, whiteSpace: "pre-wrap" },
  characterSpeech: { maxWidth: "100%", fontFamily: 'ui-rounded, "Avenir Next Rounded", "Avenir Next", "Trebuchet MS", system-ui, sans-serif', fontSize: 14, lineHeight: 1.5, letterSpacing: ".005em" },
  signin: { color: "#E9A06B", textAlign: "center", textDecoration: "none", fontSize: 14, marginTop: 10 },
  bar: { display: "flex", gap: 8, padding: 12, borderTop: "1px solid #3A2E44" },
  input: { flex: 1, background: "#1A121F", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 10, padding: "10px 12px", fontSize: 14 },
  send: { border: 0, cursor: "pointer", color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", borderRadius: 10, padding: "0 14px", fontWeight: 700, fontSize: 16 },
  actions: { display: "flex", gap: 6, marginTop: 4 },
  actionBtn: { background: "transparent", border: "1px solid #3A2E44", color: "#AC9CB0", borderRadius: 8, padding: "3px 8px", fontSize: 11.5, cursor: "pointer" },
  sharingSelfie: { color: "#D88EAD", fontFamily: '"Palatino Linotype", Georgia, serif', fontSize: 11.5, fontStyle: "italic", padding: "3px 1px" },
  typing: { color: "#AC9CB0", fontStyle: "italic" },
  thumb: { maxWidth: "70%", borderRadius: 10, marginTop: 6, cursor: "zoom-in", border: "1px solid #3A2E44" },
  lightboxWrap: { position: "absolute", inset: 0, background: "rgba(0,0,0,.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, cursor: "zoom-out" },
  lightboxImg: { maxWidth: "92%", maxHeight: "92%", borderRadius: 10 },
};
