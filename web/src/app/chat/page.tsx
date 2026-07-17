"use client";

import { useEffect, useRef, useState } from "react";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { ChatMessageText } from "@/components/ChatMessageText";
import { EntryGate } from "@/components/EntryGate";
import { StoryMemoryCard, type StoryMemory } from "@/components/StoryMemoryCard";
import { getChatWelcome } from "@/lib/chatWelcome";
import { pickExpression } from "@/lib/expression";
import { pickStatusLine } from "@/lib/status";
import { speakReply, stopSpeaking } from "@/lib/speech";

type Msg = { role: "user" | "character" | "system"; content: string; id?: string; hasImage?: boolean };
type Char = { id: string; name: string; tagline: string; persona?: string; greeting?: string; tags?: string[] };
type Convo = {
  id: string; characterId: string; name: string; lastActiveAt: string;
  storyId?: string | null; storyContext?: string | null; storyContextChapter?: number; storyTitle?: string | null; preview?: string | null;
};

const OPENERS = [
  "Hey — I've been thinking about you.",
  "Tell me something about yourself.",
  "What have you been up to?",
  "I had the strangest day…",
];

function memoryFromConvo(convo?: Convo): StoryMemory | null {
  if (!convo?.storyId) return null;
  return {
    storyId: convo.storyId,
    title: convo.storyTitle || "Your story",
    summary: convo.storyContext || "The scene you entered is part of this conversation now.",
    chapter: convo.storyContextChapter || 1,
  };
}

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
  const [sceneImagePrice, setSceneImagePrice] = useState(8);
  const [broke, setBroke] = useState(false);
  const [storyId, setStoryId] = useState<string | null>(null);
  const [storyChapter, setStoryChapter] = useState<number | undefined>();
  const [storyMemory, setStoryMemory] = useState<StoryMemory | null>(null);
  const [convos, setConvos] = useState<Convo[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [resumedHistory, setResumedHistory] = useState(false);
  const [visualizing, setVisualizing] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [welcomeVisit, setWelcomeVisit] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);
  const [conversationQuery, setConversationQuery] = useState("");
  const [chatPoseUnavailable, setChatPoseUnavailable] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const followUpBuckets = useRef(new Set<string>());

  async function loadConvos(): Promise<Convo[]> {
    try {
      const result = await fetch("/api/threads").then((r) => r.json());
      const list = Array.isArray(result) ? result : [];
      setConvos(list);
      return list;
    } catch {
      return [];
    }
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
    const prefill = params.get("prefill")?.trim();
    if (prefill) setInput(prefill.slice(0, 320));
    const fromStory = params.get("fromStory");
    if (fromStory) {
      setStoryId(fromStory);
      setStoryMemory({
        storyId: fromStory,
        title: "Your story",
        summary: "The moment you just read is ready to continue here. Your companion keeps that scene in mind.",
        chapter: Number(params.get("chapter")) || 1,
      });
    }
    const ch = Number(params.get("chapter"));
    if (ch > 0) setStoryChapter(ch);

    (async () => {
      const cs: Char[] = await fetch("/api/characters").then((r) => r.json()).catch(() => []);
      setChars(Array.isArray(cs) ? cs : []);
      const preferred = urlChar && cs.some((x) => x.id === urlChar) ? urlChar : cs[0]?.id;
      if (preferred) { setCharId(preferred); setWelcomeVisit((visit) => visit + 1); setShowWelcome(true); }

      fetch("/api/credits").then((r) => r.json()).then((d) => { setCredits(d.balance?.total ?? 0); setEarned(d.earnedFromReaders ?? 0); }).catch(() => {});
      fetch("/api/config").then((r) => r.json()).then((d) => {
        if (d.pricing?.chat) setChatPrice(d.pricing.chat);
        if (d.pricing?.sceneImage) setSceneImagePrice(d.pricing.sceneImage);
      }).catch(() => {});

      const cv: Convo[] = await fetch("/api/threads").then((r) => r.json()).catch(() => []);
      const list = Array.isArray(cv) ? cv : [];
      setConvos(list);

      // Resume the most recent conversation for the preferred character
      // (unless we just arrived from a story, which starts a fresh thread).
      if (!fromStory && preferred) {
        const latest = list.find((c) => c.characterId === preferred);
        if (latest) {
          const rows: Msg[] = await fetch(`/api/messages?threadId=${latest.id}`).then((r) => r.json()).catch(() => []);
          if (Array.isArray(rows)) {
            setMessages(rows); setThreadId(latest.id); setResumedHistory(rows.length > 0);
            setStoryMemory(memoryFromConvo(latest));
          }
        }
      }
    })();
  }, [authEmail]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy]);
  useEffect(() => () => stopSpeaking(), []);
  useEffect(() => { setChatPoseUnavailable(false); }, [charId]);

  // A companion checks in after a quiet, established exchange. The server
  // owns the durable rate limit; this ref only prevents needless repeat calls
  // while this tab remains open.
  useEffect(() => {
    if (!threadId || busy) return;
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
        // The next qualifying exchange remains unaffected if a follow-up call fails.
      }
    }, 20_000);
    return () => window.clearTimeout(timer);
  }, [threadId, messages, busy]);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setAuthEmail(null);
    setMessages([]); setThreadId(undefined); setConvos([]); setCredits(null); setStoryMemory(null);
  }

  function newChat() { setThreadId(undefined); setMessages([]); setBroke(false); setStoryId(null); setStoryChapter(undefined); setStoryMemory(null); setShowHistory(false); setResumedHistory(false); setWelcomeVisit((visit) => visit + 1); setShowWelcome(true); }

  async function switchCharacter(id: string) {
    setCharId(id); setStoryId(null); setStoryMemory(null); setBroke(false); setShowHistory(false); setWelcomeVisit((visit) => visit + 1); setShowWelcome(true);
    const latest = convos.find((c) => c.characterId === id);
    if (latest) {
      const rows: Msg[] = await fetch(`/api/messages?threadId=${latest.id}`).then((r) => r.json()).catch(() => []);
      setMessages(Array.isArray(rows) ? rows : []); setThreadId(latest.id); setStoryMemory(memoryFromConvo(latest)); setResumedHistory(Array.isArray(rows) && rows.length > 0);
    } else {
      setMessages([]); setThreadId(undefined); setResumedHistory(false);
    }
  }

  async function openConvo(c: Convo) {
    setShowHistory(false); setCharId(c.characterId); setStoryId(null); setStoryMemory(memoryFromConvo(c)); setBroke(false); setWelcomeVisit((visit) => visit + 1); setShowWelcome(true);
    try {
      const rows: Msg[] = await fetch(`/api/messages?threadId=${c.id}`).then((r) => r.json());
      setMessages(Array.isArray(rows) ? rows : []); setThreadId(c.id); setResumedHistory(Array.isArray(rows) && rows.length > 0);
    } catch { setMessages([]); }
  }

  function setLast(content: string, role: Msg["role"] = "character") {
    setMessages((m) => { const c = m.slice(); c[c.length - 1] = { ...c[c.length - 1], role, content }; return c; });
  }
  function setLastId(id: string) {
    setMessages((m) => { const c = m.slice(); const last = c[c.length - 1]; if (last) c[c.length - 1] = { ...last, id }; return c; });
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

  async function send() {
    const text = input.trim();
    if (!text || !charId || busy) return;
    setInput("");
    setShowWelcome(false);
    const wasNew = !threadId;
    // Mirror the free persisted opener immediately, so it remains part of the
    // visible transcript after the reader sends their first reply.
    setMessages((m) => [
      ...m,
      ...(wasNew && m.length === 0 && welcome ? [{ role: "character" as const, content: welcome.text }] : []),
      { role: "user" as const, content: text },
    ]);
    setBusy(true);
    try {
      const res = await fetch("/api/chat/stream", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId: charId, threadId, message: text, storyId: threadId ? undefined : storyId ?? undefined, storyTitle: threadId ? undefined : storyMemory?.title, chapter: threadId || !storyId ? undefined : storyChapter }),
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
          let ev: { delta?: string; done?: boolean; threadId?: string; messageId?: string; balance?: { total: number }; replace?: string; error?: string };
          try { ev = JSON.parse(line); } catch { continue; }
          if (ev.delta) {
            acc += ev.delta;
            if (!started) { started = true; setMessages((m) => [...m, { role: "character", content: acc }]); }
            else setLast(acc);
          } else if (ev.done) {
            if (!started) setMessages((m) => [...m, { role: "character", content: ev.replace || "…", id: ev.messageId }]);
            else { if (ev.replace) setLast(ev.replace); if (ev.messageId) setLastId(ev.messageId); }
            if (ev.threadId) setThreadId(ev.threadId);
            if (ev.balance) setCredits(ev.balance.total);
            void loadConvos().then((list) => {
              if (wasNew) {
                const convo = list.find((item) => item.id === ev.threadId);
                const memory = memoryFromConvo(convo);
                if (memory) setStoryMemory(memory);
              }
            });
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
  // The portrait reacts to the conversation: pick the expression variant that
  // best matches the companion's most recent reply (see lib/expression.ts).
  // Falls back to the canonical portrait for characters without variants.
  const lastReply = [...messages].reverse().find((m) => m.role === "character");
  const expr = pickExpression(lastReply?.content);
  const status = pickStatusLine({ tags: active?.tags, expr, isReturning: resumedHistory && messages.length > 0 });
  const welcome = active ? getChatWelcome({ name: active.name, tags: active.tags, greeting: active.greeting, persona: active.persona, backstory: active.tagline, storyTitle: storyMemory?.title, storyContext: storyMemory?.summary, storyChapter: storyMemory?.chapter, isReturning: resumedHistory && messages.length > 0, visit: welcomeVisit }) : null;
  const filteredConvos = convos.filter((convo) => {
    const needle = conversationQuery.trim().toLowerCase();
    return !needle || convo.name.toLowerCase().includes(needle) || convo.preview?.toLowerCase().includes(needle);
  });

  return (
    <div className="rv-chat-shell" style={S.wrap}>
      <aside className="rv-chat-rail" aria-label="Recent conversations">
        <a href="/browse" style={S.railBrowse}>Discover companions</a>
        <button style={S.railNew} onClick={newChat}>+ New conversation</button>
        <label style={S.railSearchWrap}>
          <span>Search chats</span>
          <input value={conversationQuery} onChange={(event) => setConversationQuery(event.target.value)} placeholder="Name or message" style={S.railSearch} />
        </label>
        <div style={S.railList}>
          <p style={S.railLabel}>Recent chats</p>
          {filteredConvos.length === 0 ? <p style={S.railEmpty}>Your conversations will appear here.</p> : null}
          {filteredConvos.map((convo) => (
            <button key={convo.id} className="rv-chat-rail-item" style={{ ...S.railItem, ...(convo.id === threadId ? S.railItemActive : {}) }} onClick={() => openConvo(convo)}>
              <CharacterAvatar characterId={convo.characterId} name={convo.name} size={42} />
              <span style={S.railCopy}>
                <strong style={S.railName}>{convo.name}</strong>
                <span style={S.railPreview}>{convo.preview || "Open the conversation"}</span>
              </span>
            </button>
          ))}
        </div>
      </aside>
      <main className="rv-chat-main" style={S.main}>
        {active && !chatPoseUnavailable ? (
          <div className="rv-chat-stage-art" aria-hidden>
            <img
              src={`/api/characters/${active.id}/chat-pose`}
              alt=""
              onError={() => setChatPoseUnavailable(true)}
            />
          </div>
        ) : null}
      <div className="rv-chat-head" style={S.head}>
        <div style={S.headLeft}>
          <button style={S.iconBtn} onClick={newChat} title="New conversation">＋ New</button>
          <button style={S.iconBtn} onClick={() => { setShowHistory((v) => !v); loadConvos(); }} title="Past conversations">History ▾</button>
        </div>
        <div style={S.nameWrap}>
          {active ? <CharacterAvatar characterId={active.id} name={active.name} size={30} variant={expr} /> : null}
          <div>
            <div style={S.name}>{active?.name ?? "Loading…"}</div>
            {active ? <div style={S.status}>{status}</div> : null}
          </div>
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
        <div className="rv-chat-history" style={S.history}>
          {convos.length === 0 ? <div style={S.histEmpty}>No past conversations yet.</div> : null}
          {convos.map((c) => (
            <button key={c.id} style={{ ...S.histItem, ...(c.id === threadId ? S.histActive : {}) }} onClick={() => openConvo(c)}>
              <span>{c.name}</span><span style={S.histDate}>{new Date(c.lastActiveAt).toLocaleDateString()}</span>
            </button>
          ))}
        </div>
      ) : null}

      <div className="rv-chat-feed" style={S.feed}>
        {storyMemory && active ? <StoryMemoryCard memory={storyMemory} characterId={active.id} characterName={active.name} /> : null}
        {messages.length === 0 && !busy ? (
          <div style={S.empty}>
            {active ? <CharacterAvatar characterId={active.id} name={active.name} size={60} variant={expr} /> : null}
            <p style={S.emptyName}>{active?.name ?? "your companion"}</p>
            {welcome ? (
              <div style={{ ...S.row, justifyContent: "flex-start" }}>
                <div>
                  <p style={S.welcomeLabel}>{active?.name} started the conversation - free</p>
                  <div style={{ ...S.bubble, ...S.bot }}><ChatMessageText content={welcome.text} /></div>
                </div>
              </div>
            ) : (
              <p style={S.emptyHint}>Say hello — they&apos;ll remember what you share.</p>
            )}
            <div style={S.openers}>
              {(welcome?.suggestions ?? OPENERS).map((o) => (
                <button key={o} style={S.opener} onClick={() => setInput(o)}>{o}</button>
              ))}
            </div>
          </div>
        ) : null}
        {messages.map((m, i) =>
          m.role === "system" ? (
            <div key={i} style={S.sys}>{m.content}</div>
          ) : (
            <div key={i} style={{ ...S.row, flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{ ...S.bubble, ...(m.role === "user" ? S.user : S.bot) }}>
                {m.role === "character" ? <ChatMessageText content={m.content} /> : m.content}
              </div>
              {m.role === "character" && m.id ? (
                <div style={S.actions}>
                  <button style={S.actionBtn} onClick={() => listen(m.id!, m.content)}>
                    {speaking === m.id ? "Stop" : "Listen"}
                  </button>
                  {m.hasImage ? (
                    <button style={S.actionBtn} onClick={() => setLightbox(`/api/messages/${m.id}/image`)}>🖼 View</button>
                  ) : (
                    <button style={S.actionBtn} onClick={() => visualize(m.id!)} disabled={visualizing.has(m.id)}>
                      {visualizing.has(m.id) ? "Visualizing…" : `✨ Visualize · ${sceneImagePrice} credits`}
                    </button>
                  )}
                  <button style={S.actionBtn} onClick={() => saveMoment(m.id!)} disabled={saved.has(m.id)}>
                    {saved.has(m.id) ? "★ Saved" : "☆ Save"}
                  </button>
                </div>
              ) : null}
              {m.hasImage && m.id ? (
                <img src={`/api/messages/${m.id}/image`} alt="" style={S.thumb} onClick={() => setLightbox(`/api/messages/${m.id}/image`)} />
              ) : null}
            </div>
          ),
        )}
        {welcome && showWelcome && !(messages.length === 0 && !busy) ? (
          <div style={{ ...S.row, flexDirection: "column", alignItems: "flex-start" }}>
            <p style={S.welcomeLabel}>{active?.name} started the conversation - free</p>
            <div style={{ ...S.bubble, ...S.bot }}><ChatMessageText content={welcome.text} /></div>
            <div style={S.welcomeReplies}>
              {welcome.suggestions.map((suggestion) => <button key={suggestion} style={S.welcomeReply} onClick={() => setInput(suggestion)}>{suggestion}</button>)}
            </div>
          </div>
        ) : null}
        {busy && (messages.length === 0 || messages[messages.length - 1].role !== "character") ? (
          <div style={{ ...S.row, justifyContent: "flex-start" }}><div style={{ ...S.bubble, ...S.bot, color: "#8A7A90" }}>typing…</div></div>
        ) : null}
        <div ref={endRef} />
      </div>
      {lightbox ? (
        <div style={S.lightboxWrap} onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" style={S.lightboxImg} />
        </div>
      ) : null}

      <div className="rv-chat-bar-wrap" style={S.barWrap}>
        {broke ? <a href="/credits" style={S.topup}>Out of credits — get more →</a> : null}
        <div style={S.bar}>
          <input style={S.input} value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={`Message ${active?.name ?? "…"}`} disabled={busy || !charId} />
          <button style={{ ...S.send, opacity: busy || !input.trim() ? 0.5 : 1 }} onClick={send} disabled={busy || !input.trim()}>Send</button>
        </div>
      </div>
      </main>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { width: "100%", minHeight: "calc(100dvh - 52px)", display: "flex", flexDirection: "column" },
  main: { position: "relative", minWidth: 0, flex: 1, display: "flex", flexDirection: "column", overflow: "visible" },
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
  status: { fontSize: 11.5, color: "#8A7A90", marginTop: -2 },
  credits: { color: "#E9A06B", fontWeight: 650, fontSize: 14, fontVariantNumeric: "tabular-nums" },
  perMsg: { color: "#8A7A90", fontWeight: 500, fontSize: 12 },
  earned: { color: "#D46A8B", fontWeight: 650, fontSize: 13, fontVariantNumeric: "tabular-nums" },
  select: { background: "#231A2B", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 8, padding: "7px 9px" },
  railBrowse: { color: "#E9A06B", fontSize: 13, fontWeight: 700, textDecoration: "none", padding: "6px 3px 0" },
  railNew: { width: "100%", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", color: "#1A1220", border: 0, borderRadius: 10, padding: "11px 12px", fontWeight: 750, fontSize: 13, cursor: "pointer", textAlign: "left" },
  railSearchWrap: { display: "flex", flexDirection: "column", gap: 6, color: "#8A7A90", fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" },
  railSearch: { width: "100%", boxSizing: "border-box", background: "#1A121F", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 9, padding: "9px 11px", fontSize: 13, letterSpacing: 0, textTransform: "none" },
  railList: { display: "flex", flexDirection: "column", gap: 5, overflowY: "auto", minHeight: 0 },
  railLabel: { color: "#8A7A90", fontSize: 11, fontWeight: 750, letterSpacing: ".09em", textTransform: "uppercase", margin: "8px 2px 4px" },
  railEmpty: { color: "#8A7A90", fontSize: 13, lineHeight: 1.5, margin: "8px 2px" },
  railItem: { display: "flex", alignItems: "center", gap: 10, width: "100%", background: "transparent", color: "#F4EAF0", border: "1px solid transparent", borderRadius: 10, padding: 8, cursor: "pointer", textAlign: "left" },
  railItemActive: { background: "#2A2033", borderColor: "#4A3A50" },
  railCopy: { minWidth: 0, display: "flex", flexDirection: "column", gap: 2 },
  railName: { fontSize: 14, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  railPreview: { color: "#9B8D9F", fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  history: { borderBottom: "1px solid #3A2E44", maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column" },
  histEmpty: { color: "#8A7A90", fontSize: 14, padding: "14px 18px" },
  histItem: { display: "flex", justifyContent: "space-between", background: "transparent", color: "#F4EAF0", border: 0, borderBottom: "1px solid #241a2b", padding: "12px 18px", cursor: "pointer", fontSize: 14, textAlign: "left" },
  histActive: { background: "#231A2B" },
  histDate: { color: "#8A7A90", fontSize: 12 },
  feed: { flex: "0 0 auto", overflowY: "visible", padding: "20px", display: "flex", flexDirection: "column", gap: 12 },
  empty: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", margin: "auto", padding: 20, gap: 4 },
  emptyName: { fontFamily: "Georgia, serif", fontSize: 22, color: "#F4EAF0", margin: "12px 0 0" },
  emptyHint: { color: "#8A7A90", fontSize: 14, margin: "2px 0 16px" },
  openers: { display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 340 },
  opener: { background: "#241B2D", color: "#CBBBD0", border: "1px solid #3A2E44", borderRadius: 12, padding: "11px 14px", cursor: "pointer", fontSize: 14, textAlign: "left" },
  welcomeLabel: { color: "#8A7A90", fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", margin: "0 0 5px 2px" },
  welcomeReplies: { display: "flex", flexWrap: "wrap", gap: 7, marginTop: 7 },
  welcomeReply: { background: "transparent", color: "#E9A06B", border: "1px solid #5A3A53", borderRadius: 999, padding: "6px 10px", cursor: "pointer", fontSize: 12.5 },
  sys: { alignSelf: "center", color: "#8A7A90", fontSize: 13, textAlign: "center" },
  row: { display: "flex" },
  bubble: { maxWidth: "78%", padding: "11px 15px", borderRadius: 16, lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word" },
  user: { background: "linear-gradient(100deg,#E9A06B,#D46A8B)", color: "#1A1220", borderBottomRightRadius: 4 },
  bot: { background: "#231A2B", border: "1px solid #3A2E44", color: "#F4EAF0", borderBottomLeftRadius: 4 },
  actions: { display: "flex", gap: 6, marginTop: 5 },
  actionBtn: { background: "transparent", border: "1px solid #3A2E44", color: "#AC9CB0", borderRadius: 8, padding: "3px 9px", fontSize: 12, cursor: "pointer" },
  thumb: { maxWidth: 260, borderRadius: 12, marginTop: 8, cursor: "zoom-in", border: "1px solid #3A2E44" },
  lightboxWrap: { position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, cursor: "zoom-out" },
  lightboxImg: { maxWidth: "92vw", maxHeight: "92vh", borderRadius: 12 },
  barWrap: { padding: "14px 20px 22px", borderTop: "1px solid #3A2E44", display: "flex", flexDirection: "column", gap: 10 },
  topup: { alignSelf: "center", border: "1px solid #E9A06B", color: "#E9A06B", background: "transparent", borderRadius: 10, padding: "8px 16px", cursor: "pointer", fontSize: 14, textDecoration: "none" },
  bar: { display: "flex", gap: 10 },
  input: { flex: 1, background: "#1A121F", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 12, padding: "13px 15px", fontSize: 15 },
  send: { border: 0, cursor: "pointer", color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", borderRadius: 12, padding: "0 22px", fontWeight: 650, fontSize: 15 },
};
