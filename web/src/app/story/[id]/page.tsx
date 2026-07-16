"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { ChatDock } from "@/components/ChatDock";
import { SceneRecapCard } from "@/components/SceneRecapCard";
import { RatingBar } from "@/components/RatingBar";
import { ReportLink } from "@/components/TrustControls";
import { pickExpression } from "@/lib/expression";
import { pickStatusLine } from "@/lib/status";
import { intensityColor, intensityScore } from "@/lib/intensity";

type Story = {
  id: string; title: string; content: string; characterId: string; characterName: string; characterTagline: string; characterTags: string[]; tone: string;
  isOwner: boolean; isPublic: boolean; hasBackup: boolean; hasBackground: boolean;
  reads: number; rating: number; ratingCount: number; myRating: number | null; canRate: boolean;
  isSaved: boolean; canSave: boolean;
  isCharacterHidden: boolean; canManageImages: boolean;
  createdAt: string; chapterDates: string[]; chapterImages: number[];
};

function formatChapterDate(story: Story, chapterIdx: number): string {
  const iso = story.chapterDates[chapterIdx] ?? story.createdAt;
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

const MOODS = ["sweet", "playful", "curious", "tender", "tense", "mysterious", "dramatic"];
const TWISTS = ["a confession", "an interruption", "a secret revealed", "they almost kiss", "a misunderstanding", "a bold move", "someone arrives"];
const WHAT_HAPPENS = ["she says how she really feels", "the moment nearly breaks", "you're left alone together", "a memory resurfaces", "the tension finally snaps", "an unexpected visitor arrives"];

type FontSize = "sm" | "md" | "lg";
type ReaderTheme = "dark" | "sepia" | "paper";
const FONT_SIZES: Record<FontSize, number> = { sm: 16.5, md: 18.5, lg: 21.5 };
const READER_THEMES: Record<ReaderTheme, { label: string; bg: string; text: string; swatch: string }> = {
  dark: { label: "Dark", bg: "transparent", text: "#ECE3E8", swatch: "#241B2D" },
  sepia: { label: "Sepia", bg: "#F3E7D0", text: "#3B2A1A", swatch: "#F3E7D0" },
  paper: { label: "Paper", bg: "#FAF7F2", text: "#221E1A", swatch: "#FAF7F2" },
};

function rand<T>(a: T[]): T { return a[Math.floor(Math.random() * a.length)]; }
function splitChapters(content: string): string[] {
  const parts = content.split(/\n{2,}·\s·\s·\n{2,}/).map((s) => s.trim()).filter(Boolean);
  return parts.length ? parts : [content.trim()];
}

export default function StoryReadPage() {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);
  const [busy, setBusy] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [whatHappens, setWhatHappens] = useState("");
  const [mood, setMood] = useState("");
  const [twist, setTwist] = useState("");
  const [setting, setSetting] = useState("");
  const [backupText, setBackupText] = useState<string | null>(null);
  const [showBackup, setShowBackup] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [chapterPrice, setChapterPrice] = useState(10);
  const [showToc, setShowToc] = useState(false);
  const [zoomChapter, setZoomChapter] = useState<number | null>(null); // chapter image shown enlarged
  const [renderingImg, setRenderingImg] = useState<number | null>(null); // chapter whose image is (re)rendering
  const [imgVersion, setImgVersion] = useState<Record<number, number>>({}); // cache-buster per chapter image
  const [renderingBg, setRenderingBg] = useState(false);
  const [bgVersion, setBgVersion] = useState(0);
  const [bgOn, setBgOn] = useState(true);
  const [fontSize, setFontSize] = useState<FontSize>("sm"); // small by default; a saved preference overrides below
  const [theme, setTheme] = useState<ReaderTheme>("dark");
  const [showReaderMenu, setShowReaderMenu] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    setBgOn(localStorage.getItem("rv_story_bg") !== "off");
    const fs = localStorage.getItem("rv_reader_fontsize");
    if (fs === "sm" || fs === "md" || fs === "lg") setFontSize(fs);
    const th = localStorage.getItem("rv_reader_theme");
    if (th === "dark" || th === "sepia" || th === "paper") setTheme(th);
  }, []);
  function toggleBg() {
    setBgOn((v) => { localStorage.setItem("rv_story_bg", v ? "off" : "on"); return !v; });
  }
  function pickFontSize(v: FontSize) { setFontSize(v); localStorage.setItem("rv_reader_fontsize", v); }
  function pickTheme(v: ReaderTheme) { setTheme(v); localStorage.setItem("rv_reader_theme", v); }

  async function toggleSave() {
    if (saveBusy || !story?.canSave) return;
    setSaveBusy(true);
    const next = !saved;
    setSaved(next); // optimistic
    try {
      const res = await fetch(`/api/stories/${id}/bookmark`, { method: "POST" });
      const d = await res.json().catch(() => ({}));
      if (res.ok && typeof d.bookmarked === "boolean") setSaved(d.bookmarked);
      else setSaved(!next);
    } catch {
      setSaved(!next);
    } finally {
      setSaveBusy(false);
    }
  }

  useEffect(() => {
    fetch(`/api/stories/${id}`).then((r) => (r.ok ? r.json() : Promise.reject())).then((s: Story) => {
      const ch = splitChapters(s.content);
      setStory(s); setChapters(ch); setSaved(s.isSaved);
      // Resume where the reader left off (powers the profile's Continue state).
      const raw = localStorage.getItem(`rv_progress_${id}`);
      const resume = raw != null ? Number(raw) : 0;
      if (resume > 0 && resume < ch.length) setIdx(resume);
    }).catch(() => setNotFound(true));
    fetch("/api/config").then((r) => r.json()).then((d) => { if (d.pricing?.chapter) setChapterPrice(d.pricing.chapter); }).catch(() => {});
  }, [id]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [idx]);

  // Persist the furthest chapter reached so the library/profile can offer
  // "Continue chapter N" and the reader resumes here next visit.
  useEffect(() => {
    if (!story) return;
    const prev = Number(localStorage.getItem(`rv_progress_${id}`) ?? "0");
    if (idx > prev) localStorage.setItem(`rv_progress_${id}`, String(idx));
  }, [idx, story, id]);

  // Keyboard paging (ignored while typing in the next-chapter form).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { setZoomChapter(null); return; }
      const el = document.activeElement;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;
      if (e.key === "ArrowRight") { setShowForm(false); setIdx((i) => Math.min(i + 1, chapters.length - 1)); }
      else if (e.key === "ArrowLeft") { setShowForm(false); setIdx((i) => Math.max(i - 1, 0)); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chapters.length]);

  function resetForm() { setWhatHappens(""); setMood(""); setTwist(""); setSetting(""); setShowForm(false); }
  function surprise() { setWhatHappens(rand(WHAT_HAPPENS)); setTwist(rand(TWISTS)); setMood(rand(MOODS)); setSetting(""); }

  async function writeNext() {
    if (busy) return;
    setBusy(true); setNotice(null);
    try {
      const res = await fetch(`/api/stories/${id}/continue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatHappens: whatHappens.trim() || undefined, mood: mood || undefined, twist: twist || undefined, setting: setting.trim() || undefined }),
      });
      const d = await res.json();
      if (res.status === 402) { setNotice(`You need ${d.price ?? 10} credits to write a chapter — you have ${d.balance?.total ?? 0}. Add credits to keep going.`); return; }
      if (res.ok && d.chapter) { setChapters((c) => [...c, d.chapter.trim()]); setIdx((i) => i + 1); resetForm(); }
    } catch {} finally { setBusy(false); }
  }

  async function rewrite() {
    if (busy) return;
    const after = chapters.length - idx - 1;
    if (after > 0 && !confirm(`Rewriting this chapter will remove the ${after} chapter${after === 1 ? "" : "s"} after it, because they were written to follow the old version. Continue?`)) return;
    setBusy(true); setNotice(null);
    try {
      const res = await fetch(`/api/stories/${id}/rewrite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterIndex: idx }),
      });
      const d = await res.json();
      if (res.status === 402) { setNotice(`You need ${d.price ?? 10} credits to rewrite a chapter — you have ${d.balance?.total ?? 0}. Add credits to keep going.`); return; }
      // Rewrite truncates downstream chapters (branch point) - mirror that locally.
      if (res.ok && d.chapter) {
        setChapters((c) => [...c.slice(0, idx), d.chapter.trim()]);
        setStory((s) => (s ? { ...s, hasBackup: true } : s)); // a backup now exists
      }
    } catch {} finally { setBusy(false); }
  }

  async function readBackup() {
    try {
      const d = await fetch(`/api/stories/${id}/backup`).then((r) => r.json());
      if (d.content) { setBackupText(d.content); setShowBackup(true); }
    } catch {}
  }

  async function toggleHide() {
    if (!story) return;
    const nextPublic = story.isPublic === false; // hidden -> unhide (make public)
    setStory((s) => (s ? { ...s, isPublic: nextPublic } : s));
    await fetch(`/api/stories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublic: nextPublic }),
    }).catch(() => {});
  }

  async function deleteStory() {
    if (!story) return;
    if (!confirm(`Delete “${story.title}”? This can't be undone.`)) return;
    try {
      const res = await fetch(`/api/stories/${id}`, { method: "DELETE" });
      if (res.ok) window.location.href = "/library";
    } catch {}
  }

  async function reRenderImage(chapterIdx: number) {
    if (renderingImg !== null) return;
    setRenderingImg(chapterIdx);
    setNotice(null);
    try {
      const res = await fetch(`/api/stories/${id}/chapter-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapter: chapterIdx }),
      });
      if (res.ok) {
        setStory((s) => (s && !s.chapterImages.includes(chapterIdx) ? { ...s, chapterImages: [...s.chapterImages, chapterIdx].sort((a, b) => a - b) } : s));
        setImgVersion((v) => ({ ...v, [chapterIdx]: (v[chapterIdx] || 0) + 1 }));
      } else {
        const d = await res.json().catch(() => ({}));
        setNotice(d.reason === "safety" ? "That chapter's image was blocked by the safety filter." : "Image render failed — try again in a moment.");
      }
    } catch {
      setNotice("Image render failed — try again in a moment.");
    } finally {
      setRenderingImg(null);
    }
  }

  async function reRenderBackground() {
    if (renderingBg) return;
    setRenderingBg(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/stories/${id}/background`, { method: "POST" });
      if (res.ok) {
        setStory((s) => (s ? { ...s, hasBackground: true } : s));
        setBgOn(true);
        setBgVersion((v) => v + 1);
      } else {
        const data = await res.json().catch(() => ({}));
        setNotice(data.reason === "safety" ? "The background was blocked by the safety filter." : "Background render failed - try again in a moment.");
      }
    } catch {
      setNotice("Background render failed - try again in a moment.");
    } finally {
      setRenderingBg(false);
    }
  }

  async function restore() {
    if (!confirm("Restore the previous version? This replaces the current story with your saved backup.")) return;
    try {
      const res = await fetch(`/api/stories/${id}/backup`, { method: "POST" }); // POST = restore
      const d = await res.json();
      if (res.ok && d.content) {
        const ch = splitChapters(d.content);
        setChapters(ch); setIdx(ch.length - 1);
        setStory((s) => (s ? { ...s, hasBackup: false } : s));
        setShowBackup(false);
      }
    } catch {}
  }

  if (notFound) return <main style={S.wrap}><p style={{ color: "#AC9CB0" }}>Story not found. <a href="/" style={S.link}>Home</a></p></main>;
  if (!story) return <main style={S.wrap}><p style={{ color: "#AC9CB0" }}>Loading…</p></main>;

  const last = idx === chapters.length - 1;
  const progress = chapters.length ? ((idx + 1) / chapters.length) * 100 : 0;
  const words = (chapters[idx] ?? "").trim().split(/\s+/).filter(Boolean).length;
  const readMin = Math.max(1, Math.round(words / 200));
  // Story-wide mood cue for the companion's portrait (falls back to the
  // canonical portrait for characters without variants, or a neutral tone).
  const expr = pickExpression(story.tone);
  const sceneState = pickStatusLine({ tags: story.characterTags, expr, isReturning: idx > 0 });

  return (
    <main style={S.wrap}>
      <style>{"@keyframes rvFade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}@keyframes rvBgIn{from{opacity:0}to{opacity:1}}"}</style>
      {story.hasBackground && bgOn ? (
        <div aria-hidden style={S.bgLayer}>
          <div style={{ ...S.bgImage, backgroundImage: `url(/api/stories/${id}/background?v=${bgVersion})` }} />
          <div style={S.bgScrim} />
        </div>
      ) : null}
      <div style={S.progressTrack}><div style={{ ...S.progressFill, width: `${progress}%` }} /></div>

      {!chatOpen ? (
        <div className="rv-reader-rail" style={S.rail}>
          <div style={S.railPortrait}>
            <CharacterAvatar characterId={story.characterId} name={story.characterName} shape="rect" variant={expr} />
          </div>
          <p style={S.railName}>{story.characterName}</p>
          <p style={S.railState}>{sceneState}</p>
          {story.characterTagline ? <p style={S.railLine}>{story.characterTagline}</p> : null}
          <button style={S.railBtn} onClick={() => setChatOpen(true)}>Talk to {story.characterName}</button>
        </div>
      ) : null}

      <div style={S.topRow}>
        <a href="/" style={S.back}>← ReverieTale</a>
        <div style={S.topTools}>
          {story.canSave ? (
            <button style={S.iconToggle} onClick={toggleSave} title={saved ? "Remove from your library" : "Save to your library"} aria-pressed={saved}>
              {saved ? "🔖 Saved" : "🔖 Save"}
            </button>
          ) : null}
          <div style={S.readerMenuWrap}>
            <button style={S.iconToggle} onClick={() => setShowReaderMenu((v) => !v)} title="Reading settings" aria-expanded={showReaderMenu}>Aa</button>
            {showReaderMenu ? (
              <>
                <div style={S.readerMenuBackdrop} onClick={() => setShowReaderMenu(false)} />
                <div style={S.readerMenu}>
                  <p style={S.readerMenuLabel}>Text size</p>
                  <div style={S.readerMenuRow}>
                    {(Object.keys(FONT_SIZES) as FontSize[]).map((k) => (
                      <button key={k} className="rv-chip" style={{ ...S.readerChip, ...(fontSize === k ? S.readerChipOn : {}) }} onClick={() => pickFontSize(k)}>
                        {k === "sm" ? "S" : k === "md" ? "M" : "L"}
                      </button>
                    ))}
                  </div>
                  <p style={S.readerMenuLabel}>Reading theme</p>
                  <div style={S.readerMenuRow}>
                    {(Object.keys(READER_THEMES) as ReaderTheme[]).map((k) => (
                      <button key={k} className="rv-chip" style={{ ...S.readerSwatch, background: READER_THEMES[k].swatch, ...(theme === k ? S.readerSwatchOn : {}) }} onClick={() => pickTheme(k)} title={READER_THEMES[k].label} aria-label={READER_THEMES[k].label} />
                    ))}
                  </div>
                  {story.hasBackground ? (
                    <>
                      <p style={S.readerMenuLabel}>Ambient background</p>
                      <button className="rv-chip" style={{ ...S.readerChip, width: "100%" }} onClick={toggleBg}>{bgOn ? "On" : "Off"}</button>
                    </>
                  ) : null}
                  {story.canManageImages ? (
                    <>
                      <p style={S.readerMenuLabel}>Image controls</p>
                      <button className="rv-chip" style={{ ...S.readerChip, width: "100%" }} onClick={reRenderBackground} disabled={renderingBg}>
                        {renderingBg ? "Generating background..." : story.hasBackground ? "Regenerate background" : "Generate background"}
                      </button>
                    </>
                  ) : null}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
      <div style={S.head}>
        <CharacterAvatar characterId={story.characterId} name={story.characterName} size={46} variant={expr} />
        <div>
          <h1 style={S.title}>{story.title}</h1>
          <p style={S.by}>with <a href={`/c/${story.characterId}`} style={S.byLink}>{story.characterName}</a> · chapter {idx + 1} of {chapters.length} · {formatChapterDate(story, idx)} · ~{readMin} min · {story.reads} view{story.reads === 1 ? "" : "s"}</p>
        </div>
      </div>

      {story.isOwner && story.hasBackup ? (
        <div style={S.backupBanner}>
          <span>A previous version is saved.</span>
          <button style={S.bkBtn} onClick={readBackup}>Read it</button>
          <button style={S.bkBtn} onClick={restore}>Restore</button>
        </div>
      ) : null}

      {story.chapterImages.includes(idx) ? (
        <div style={S.chapterScene} key={`scene-${idx}`}>
          <img
            src={`/api/stories/${id}/chapter-image?chapter=${idx}${imgVersion[idx] ? `&v=${imgVersion[idx]}` : ""}`}
            alt=""
            style={{ ...S.chapterSceneImg, cursor: "zoom-in" }}
            onClick={() => setZoomChapter(idx)}
          />
          {idx === 0 ? <div style={S.chapterSceneScrim} /> : null}
          {idx === 0 ? <div style={S.chapterSceneCaption}>Chapter 1 of {chapters.length}</div> : null}
          <button style={S.chapterZoomHint} onClick={() => setZoomChapter(idx)} aria-label="Enlarge image">⤢</button>
          {story.canManageImages ? (
            <button style={S.reRenderBtn} onClick={() => reRenderImage(idx)} disabled={renderingImg === idx}>
              {renderingImg === idx ? "Rendering..." : "Regenerate scene"}
            </button>
          ) : null}
        </div>
      ) : story.canManageImages ? (
        <button style={S.genImgBtn} onClick={() => reRenderImage(idx)} disabled={renderingImg === idx} key={`genimg-${idx}`}>
          {renderingImg === idx ? "Rendering..." : "Generate scene for this chapter"}
        </button>
      ) : null}

      <article
        key={idx + ":" + (chapters[idx] ?? "").length}
        style={{
          ...S.article,
          ...(theme !== "dark"
            ? { background: READER_THEMES[theme].bg, borderRadius: 16, padding: "28px 26px", boxShadow: "0 20px 50px rgba(0,0,0,.35)" }
            // Dark theme: a translucent panel keeps the prose readable while the
            // (now brighter) ambient scene shows through and around it. Only when
            // there's actually a background to see; otherwise stay flush.
            : story.hasBackground && bgOn
              ? { background: "rgba(18,12,22,.62)", borderRadius: 16, padding: "26px 24px", boxShadow: "0 20px 50px rgba(0,0,0,.4)", backdropFilter: "blur(3px)" }
              : {}),
        }}
      >
        {(chapters[idx] ?? "").split(/\n{2,}/).map((p, i) => (
          // Dark theme: warm the font toward orange/red as the passage heats up.
          // Light themes keep their fixed ink for contrast.
          <p key={i} style={{ ...S.para, fontSize: FONT_SIZES[fontSize], color: theme === "dark" ? intensityColor(intensityScore(p)) : READER_THEMES[theme].text, transition: "color .4s ease" }}>{p}</p>
        ))}
      </article>

      {last ? (
        <section style={S.nextMove} aria-labelledby="next-move-title">
          <div style={S.nextMoveCopy}>
            <p style={S.nextMoveEyebrow}>The opening is only the beginning</p>
            <h2 id="next-move-title" style={S.nextMoveTitle}>Your move</h2>
            <p style={S.nextMoveBody}>Stay in this moment with {story.characterName}, or choose the first turn in a version of the story that is yours.</p>
          </div>
          <div style={S.nextMoveActions}>
            {story.isOwner ? (
              <button
                className="rv-btn rv-btn-primary"
                style={S.nextMovePrimary}
                onClick={() => {
                  setShowForm(true);
                  window.setTimeout(() => document.getElementById("next-chapter")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
                }}
              >
                Shape the next chapter
              </button>
            ) : (
              <a className="rv-btn rv-btn-primary" style={S.nextMovePrimary} href={`/story?characterId=${story.characterId}`}>
                Start your own path
              </a>
            )}
            <a className="rv-btn" style={S.nextMoveSecondary} href={`/chat?characterId=${story.characterId}&fromStory=${story.id}&chapter=${idx + 1}`}>
              Talk to {story.characterName}
            </a>
          </div>
        </section>
      ) : null}

      {last ? (
        <SceneRecapCard
          storyId={story.id}
          title={story.title}
          characterId={story.characterId}
          characterName={story.characterName}
          chapterCount={chapters.length}
          excerpt={(chapters[idx] ?? "").replace(/\s+/g, " ").trim()}
          hasBackground={story.hasBackground}
        />
      ) : null}

      {story.isOwner ? (
        <div style={S.ownerControls}>
          <button style={{ ...S.rewrite, opacity: busy ? 0.6 : 1 }} onClick={rewrite} disabled={busy}>↻ {busy ? "Rewriting…" : `Rewrite this chapter · ${chapterPrice} credits`}</button>
          <button style={S.ownerCtl} onClick={toggleHide}>{story.isPublic === false ? "Unhide from feed" : "Hide from feed"}</button>
          <button style={{ ...S.ownerCtl, ...S.ownerCtlDelete }} onClick={deleteStory}>Delete story</button>
        </div>
      ) : null}
      {story.isOwner && story.isPublic === false ? (
        <p style={S.hiddenNote}>This story is hidden — only you can see it. It won&apos;t appear in the public feed.</p>
      ) : null}

      <div style={S.nav}>
        <button style={{ ...S.navBtn, visibility: idx > 0 ? "visible" : "hidden" }} onClick={() => { setShowForm(false); setIdx(idx - 1); }}>← Previous</button>
        <div style={S.tocWrap}>
          <button style={S.count} onClick={() => setShowToc((v) => !v)} title="Jump to a chapter">{idx + 1} / {chapters.length} ▾</button>
          {showToc ? (
            <>
              <div style={S.tocBackdrop} onClick={() => setShowToc(false)} />
              <div style={S.toc}>
                {chapters.map((c, i) => (
                  <button key={i} style={{ ...S.tocItem, ...(i === idx ? S.tocItemOn : {}) }} onClick={() => { setIdx(i); setShowForm(false); setShowToc(false); }}>
                    <span style={S.tocNum}>{i + 1}</span>
                    <span style={S.tocText}>{c.replace(/\s+/g, " ").slice(0, 46)}…</span>
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </div>
        {!last ? (
          <button style={{ ...S.navBtn, ...S.navPrimary }} onClick={() => setIdx(idx + 1)}>Next →</button>
        ) : story.isOwner ? (
          <button style={{ ...S.navBtn, ...S.navPrimary }} onClick={() => setShowForm((v) => !v)}>Next chapter +</button>
        ) : (
          <span style={{ ...S.navBtn, visibility: "hidden" }} aria-hidden />
        )}
      </div>

      {notice ? <p style={S.notice}>{notice} <a href="/credits" style={S.noticeLink}>Get credits →</a></p> : null}

      {last && showForm ? (
        <div id="next-chapter" style={S.form}>
          <div style={S.formTop}>
            <p style={S.formTitle}>Shape the next chapter</p>
            <button style={S.surprise} onClick={surprise} type="button">🎲 Surprise me</button>
          </div>

          <label style={S.label}>What happens next?</label>
          <textarea value={whatHappens} onChange={(e) => setWhatHappens(e.target.value)} placeholder="e.g. she finally says how she feels… we get caught in the rain…" style={S.textarea} maxLength={400} />

          <label style={S.label}>Add a twist</label>
          <Chips options={TWISTS} value={twist} onPick={setTwist} custom maxLength={80} />

          <label style={S.label}>Mood</label>
          <Chips options={MOODS} value={mood} onPick={setMood} custom maxLength={60} />

          <label style={S.label}>Move to a new setting (optional)</label>
          <input value={setting} onChange={(e) => setSetting(e.target.value)} placeholder="e.g. a quiet balcony, the last train home…" style={S.input} />

          <div style={S.formActions}>
            <button style={{ ...S.write, opacity: busy ? 0.6 : 1 }} onClick={writeNext} disabled={busy}>{busy ? "Writing…" : `Write this chapter · ${chapterPrice} credits`}</button>
            <button style={S.cancel} onClick={resetForm} disabled={busy}>Cancel</button>
          </div>
        </div>
      ) : null}

      <div style={S.ratingRow}>
        <span style={S.ratingLabel}>{story.isOwner ? "Reader ratings" : "How was this story?"}</span>
        <RatingBar
          targetType="story"
          targetId={story.id}
          average={story.rating}
          count={story.ratingCount}
          mine={story.myRating}
          canRate={story.canRate}
          label="Rate this story"
        />
        {story.canRate ? (
          <ReportLink
            targetType="story"
            targetId={story.id}
            hideCharacterId={story.characterId}
            hideAlreadyHidden={story.isCharacterHidden}
            hideLabel={story.characterName}
          />
        ) : null}
      </div>

      {!last ? (
      <a
        className="rv-card"
        style={S.chatBridge}
        href={`/chat?characterId=${story.characterId}&fromStory=${story.id}&chapter=${idx + 1}`}
      >
        <CharacterAvatar characterId={story.characterId} name={story.characterName} size={42} variant={expr} />
        <div style={S.chatBridgeText}>
          <p style={S.chatBridgeTitle}>{last ? "Still thinking about that?" : "Want to talk about it?"}</p>
          <p style={S.chatBridgeBody}>Keep the conversation going with {story.characterName} — they remember everything you&apos;ve shared so far.</p>
        </div>
        <span style={S.chatBridgeArrow}>→</span>
      </a>
      ) : null}

      {idx > 0 ? (
        <button
          style={S.toTop}
          onClick={() => { setShowForm(false); setIdx(0); window.scrollTo({ top: 0, behavior: "smooth" }); }}
        >
          ↑ Back to the beginning
        </button>
      ) : null}

      {showBackup && backupText ? (
        <div style={S.overlay} onClick={() => setShowBackup(false)}>
          <div style={S.overlayCard} onClick={(e) => e.stopPropagation()}>
            <div style={S.overlayHead}>
              <span style={S.overlayTitle}>Previous version</span>
              <button style={S.overlayClose} onClick={() => setShowBackup(false)}>×</button>
            </div>
            <div style={S.overlayBody}>
              {backupText.split(/\n{2,}/).map((p, i) => (p.trim() === "· · ·" ? <p key={i} style={S.divider}>· · ·</p> : <p key={i} style={S.para}>{p}</p>))}
            </div>
            <div style={S.overlayActions}>
              <button style={S.write} onClick={restore}>Restore this version</button>
              <button style={S.cancel} onClick={() => setShowBackup(false)}>Close</button>
            </div>
          </div>
        </div>
      ) : null}

      {zoomChapter !== null ? (
        <div style={S.zoomOverlay} onClick={() => setZoomChapter(null)}>
          <button style={S.zoomClose} onClick={() => setZoomChapter(null)} aria-label="Close">×</button>
          <img src={`/api/stories/${id}/chapter-image?chapter=${zoomChapter}`} alt="" style={S.zoomImg} onClick={(e) => e.stopPropagation()} />
        </div>
      ) : null}

      <ChatDock characterId={story.characterId} characterName={story.characterName} characterTags={story.characterTags} storyId={story.id} chapter={idx + 1} open={chatOpen} onOpenChange={setChatOpen} />
    </main>
  );
}

function Chips({
  options,
  value,
  onPick,
  custom,
  maxLength = 80,
}: {
  options: string[];
  value: string;
  onPick: (v: string) => void;
  custom?: boolean; // adds a "+ your own" chip that reveals a free-text input
  maxLength?: number;
}) {
  // A non-empty value that isn't one of the presets is a custom entry.
  const isCustom = Boolean(value) && !options.includes(value);
  const [open, setOpen] = useState(isCustom);
  return (
    <div>
      <div style={S.chips}>
        {options.map((o) => (
          <button key={o} type="button" className="rv-chip" style={{ ...S.chip, ...(o === value ? S.chipOn : {}) }} onClick={() => { setOpen(false); onPick(o === value ? "" : o); }}>{o}</button>
        ))}
        {custom ? (
          <button
            type="button"
            className="rv-chip"
            style={{ ...S.chip, ...(isCustom || open ? S.chipOn : {}) }}
            onClick={() => { if (!isCustom) onPick(""); setOpen(true); }}
          >
            + your own
          </button>
        ) : null}
      </div>
      {custom && open ? (
        <input
          autoFocus
          value={isCustom ? value : ""}
          onChange={(e) => onPick(e.target.value)}
          placeholder="Type your own…"
          style={{ ...S.input, marginTop: 8 }}
          maxLength={maxLength}
        />
      ) : null}
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 660, margin: "0 auto", padding: "36px 24px 120px", lineHeight: 1.7, position: "relative" },
  bgLayer: { position: "fixed", inset: 0, zIndex: -1, overflow: "hidden", pointerEvents: "none", animation: "rvBgIn 1.2s ease" },
  bgImage: { position: "absolute", inset: -24, backgroundSize: "cover", backgroundPosition: "center", filter: "blur(6px) brightness(.72) saturate(1.2)", transform: "scale(1.06)" },
  bgScrim: { position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 50% 0%, rgba(21,15,26,.2), rgba(21,15,26,.5) 70%, rgba(21,15,26,.72)), linear-gradient(180deg, rgba(21,15,26,.1), rgba(21,15,26,.6))" },
  topRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  back: { color: "#8A7A90", textDecoration: "none", fontSize: 14, letterSpacing: ".04em" },
  bgToggle: { background: "rgba(35,26,43,.6)", color: "#AC9CB0", border: "1px solid #3A2E44", borderRadius: 999, padding: "5px 12px", cursor: "pointer", fontSize: 12.5, fontWeight: 600, backdropFilter: "blur(6px)" },
  link: { color: "#E9A06B" },
  progressTrack: { position: "fixed", top: 52, left: 0, right: 0, height: 3, background: "#241a2b", zIndex: 20 },
  progressFill: { height: "100%", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", transition: "width .3s ease" },
  rail: { position: "fixed", top: 90, left: "calc(50% + 348px)", width: 200, flexDirection: "column", gap: 6, alignItems: "flex-start", zIndex: 5 },
  railPortrait: { width: "100%", borderRadius: 14, overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,.4)" },
  railName: { fontFamily: "Georgia, serif", fontSize: 17, margin: "10px 0 0", color: "#F4EAF0" },
  railState: { color: "#E9A06B", fontSize: 12, margin: "1px 0 0", fontWeight: 600 },
  railLine: { color: "#8A7A90", fontSize: 12.5, margin: "3px 0 0", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  railBtn: { marginTop: 8, width: "100%", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", color: "#1A1220", border: 0, borderRadius: 10, padding: "9px 0", fontWeight: 650, fontSize: 13, cursor: "pointer" },
  chapterScene: { position: "relative", display: "block", width: "100%", padding: 0, margin: "0 0 22px", borderRadius: 16, overflow: "hidden", border: "1px solid #3A2E44", boxShadow: "0 16px 40px rgba(0,0,0,.4)", cursor: "zoom-in", background: "none" },
  chapterSceneImg: { display: "block", width: "100%", aspectRatio: "16 / 9", objectFit: "cover" },
  chapterZoomHint: { position: "absolute", top: 10, right: 10, width: 30, height: 30, display: "grid", placeItems: "center", borderRadius: 8, background: "rgba(15,10,19,.55)", color: "#F4EAF0", fontSize: 15, border: "1px solid rgba(255,255,255,.15)", backdropFilter: "blur(4px)", cursor: "pointer", padding: 0 },
  reRenderBtn: { position: "absolute", bottom: 10, right: 10, background: "rgba(15,10,19,.65)", color: "#F4EAF0", fontSize: 12, fontWeight: 600, border: "1px solid rgba(255,255,255,.18)", borderRadius: 8, padding: "5px 10px", cursor: "pointer", backdropFilter: "blur(4px)" },
  genImgBtn: { display: "block", width: "100%", margin: "0 0 22px", background: "#1A1420", color: "#AC9CB0", border: "1px dashed #3A2E44", borderRadius: 14, padding: "14px", fontSize: 13.5, fontWeight: 600, cursor: "pointer" },
  zoomOverlay: { position: "fixed", inset: 0, zIndex: 60, background: "rgba(8,5,11,.92)", display: "grid", placeItems: "center", padding: 20, cursor: "zoom-out", animation: "rvBgIn .2s ease" },
  zoomImg: { maxWidth: "min(1100px, 96vw)", maxHeight: "92vh", width: "auto", height: "auto", objectFit: "contain", borderRadius: 12, boxShadow: "0 30px 80px rgba(0,0,0,.6)", cursor: "default" },
  zoomClose: { position: "fixed", top: 16, right: 18, zIndex: 61, background: "rgba(35,26,43,.7)", color: "#F4EAF0", border: "1px solid #4a3a50", borderRadius: 999, width: 40, height: 40, fontSize: 24, lineHeight: 1, cursor: "pointer" },
  chapterSceneScrim: { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(15,10,19,0) 55%, rgba(15,10,19,.8) 100%)", pointerEvents: "none" },
  chapterSceneCaption: { position: "absolute", left: 16, bottom: 12, color: "#F4EAF0", fontSize: 12.5, letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 700, textShadow: "0 1px 4px rgba(0,0,0,.6)" },
  head: { display: "flex", alignItems: "center", gap: 14, margin: "24px 0 28px" },
  title: { fontFamily: "Georgia, serif", fontSize: 32, margin: 0, lineHeight: 1.15 },
  by: { color: "#AC9CB0", margin: "4px 0 0", fontSize: 14 },
  byLink: { color: "#E9A06B", textDecoration: "none" },
  article: { minHeight: 200, animation: "rvFade .35s ease" },
  para: { margin: "0 0 20px", color: "#ECE3E8", fontSize: 18.5, lineHeight: 1.82, fontFamily: 'Georgia, "Times New Roman", serif' },
  divider: { textAlign: "center", color: "#6f6276", letterSpacing: ".5em", margin: "24px 0" },
  backupBanner: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", background: "#241B2D", border: "1px solid #3A2E44", borderRadius: 12, padding: "10px 14px", margin: "18px 0", color: "#AC9CB0", fontSize: 14 },
  bkBtn: { background: "transparent", color: "#E9A06B", border: "1px solid #4a3a50", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 13 },
  overlay: { position: "fixed", inset: 0, zIndex: 50, background: "rgba(10,7,13,.7)", display: "grid", placeItems: "center", padding: 20 },
  overlayCard: { width: "min(620px, 100%)", maxHeight: "85vh", display: "flex", flexDirection: "column", background: "#150F1A", border: "1px solid #3A2E44", borderRadius: 16, overflow: "hidden" },
  overlayHead: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid #3A2E44" },
  overlayTitle: { fontFamily: "Georgia, serif", fontSize: 18, color: "#F4EAF0" },
  overlayClose: { background: "transparent", border: 0, color: "#AC9CB0", fontSize: 22, cursor: "pointer", lineHeight: 1 },
  overlayBody: { overflowY: "auto", padding: "18px 22px" },
  overlayActions: { display: "flex", gap: 10, padding: "14px 18px", borderTop: "1px solid #3A2E44" },
  rewrite: { background: "transparent", color: "#8A7A90", border: "1px solid #3A2E44", borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 13.5 },
  ownerControls: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 18, alignItems: "center" },
  ownerCtl: { background: "transparent", color: "#8A7A90", border: "1px solid #3A2E44", borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 13.5 },
  ownerCtlDelete: { color: "#E08A8A", borderColor: "#5a3540" },
  hiddenNote: { margin: "10px 0 0", color: "#C9A98A", fontSize: 13, fontStyle: "italic" },
  nav: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 22, borderTop: "1px solid #241a2b", paddingTop: 22 },
  navBtn: { background: "#231A2B", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 10, padding: "11px 16px", cursor: "pointer", fontSize: 14, fontWeight: 600 },
  navPrimary: { color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", border: "1px solid transparent" },
  count: { position: "relative", zIndex: 47, color: "#AC9CB0", fontSize: 13, fontVariantNumeric: "tabular-nums", background: "transparent", border: "1px solid #3A2E44", borderRadius: 8, padding: "7px 11px", cursor: "pointer", whiteSpace: "nowrap" },
  tocWrap: { position: "relative", display: "flex", justifyContent: "center" },
  tocBackdrop: { position: "fixed", inset: 0, zIndex: 45 },
  toc: { position: "absolute", bottom: "130%", left: "50%", transform: "translateX(-50%)", width: "min(340px, 82vw)", maxHeight: 300, overflowY: "auto", background: "#150F1A", border: "1px solid #3A2E44", borderRadius: 12, zIndex: 46, boxShadow: "0 16px 40px rgba(0,0,0,.5)", padding: 6 },
  tocItem: { display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", background: "transparent", border: 0, borderRadius: 8, padding: "9px 10px", cursor: "pointer", color: "#CBBBD0" },
  tocItemOn: { background: "#231A2B", color: "#F4EAF0" },
  tocNum: { color: "#E9A06B", fontWeight: 700, fontSize: 13, minWidth: 18, fontVariantNumeric: "tabular-nums" },
  tocText: { fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  form: { marginTop: 20, background: "#241B2D", border: "1px solid #3A2E44", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 8 },
  nextMove: { marginTop: 28, padding: 20, background: "linear-gradient(115deg, rgba(233,160,107,.14), rgba(212,106,139,.12))", border: "1px solid #4a3a50", borderRadius: 16, display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px 24px" },
  nextMoveCopy: { flex: "1 1 300px", minWidth: 0 },
  nextMoveEyebrow: { color: "#E9A06B", fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", margin: 0 },
  nextMoveTitle: { fontFamily: "Georgia, serif", color: "#F4EAF0", fontSize: 26, lineHeight: 1.15, margin: "4px 0 6px" },
  nextMoveBody: { color: "#CBBBD0", fontSize: 14, lineHeight: 1.5, margin: 0, maxWidth: 460 },
  nextMoveActions: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 },
  nextMovePrimary: { border: 0, cursor: "pointer", color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", borderRadius: 10, padding: "11px 15px", fontWeight: 650, fontSize: 14, textDecoration: "none" },
  nextMoveSecondary: { color: "#F4EAF0", background: "#231A2B", border: "1px solid #4a3a50", borderRadius: 10, padding: "10px 14px", fontWeight: 600, fontSize: 14, textDecoration: "none" },
  formTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 },
  formTitle: { fontFamily: "Georgia, serif", fontSize: 20, margin: 0 },
  surprise: { background: "#231A2B", color: "#E9A06B", border: "1px solid #4a3a50", borderRadius: 999, padding: "7px 13px", cursor: "pointer", fontSize: 13, fontWeight: 600 },
  label: { fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase", color: "#8A7A90", fontWeight: 700, marginTop: 10 },
  textarea: { width: "100%", minHeight: 64, resize: "vertical", background: "#1A121F", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 10, padding: "11px 13px", fontSize: 15, boxSizing: "border-box", fontFamily: "inherit" },
  input: { width: "100%", background: "#1A121F", color: "#F4EAF0", border: "1px solid #3A2E44", borderRadius: 10, padding: "11px 13px", fontSize: 15, boxSizing: "border-box" },
  chips: { display: "flex", flexWrap: "wrap", gap: 8 },
  chip: { background: "#231A2B", color: "#CBBBD0", border: "1px solid #3A2E44", borderRadius: 999, padding: "8px 13px", cursor: "pointer", fontSize: 13.5 },
  chipOn: { background: "linear-gradient(100deg,#E9A06B,#D46A8B)", color: "#1A1220", border: "1px solid transparent", fontWeight: 600 },
  formActions: { display: "flex", gap: 10, marginTop: 16, alignItems: "center" },
  write: { border: 0, cursor: "pointer", color: "#1A1220", background: "linear-gradient(100deg,#E9A06B,#D46A8B)", borderRadius: 10, padding: "12px 20px", fontWeight: 650, fontSize: 15 },
  cancel: { background: "transparent", border: 0, color: "#8A7A90", cursor: "pointer", fontSize: 14 },
  notice: { marginTop: 14, background: "#2A1A1E", border: "1px solid #6b3a44", borderRadius: 10, padding: "10px 14px", color: "#F0C9B0", fontSize: 14 },
  noticeLink: { color: "#E9A06B", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" },
  ratingRow: { marginTop: 26, paddingTop: 22, borderTop: "1px solid #241a2b", display: "flex", flexDirection: "column", gap: 10 },
  ratingLabel: { fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "#8A7A90", fontWeight: 700 },
  chatBridge: { marginTop: 22, display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", textDecoration: "none", color: "#F4EAF0", background: "linear-gradient(100deg, rgba(233,160,107,.12), rgba(212,106,139,.12))", border: "1px solid #4a3a50", borderRadius: 16 },
  toTop: { display: "block", margin: "22px auto 0", background: "transparent", color: "#AC9CB0", border: "1px solid #3A2E44", borderRadius: 999, padding: "9px 18px", fontSize: 13.5, fontWeight: 600, cursor: "pointer" },
  chatBridgeText: { flex: 1, minWidth: 0 },
  chatBridgeTitle: { fontFamily: "Georgia, serif", fontSize: 17, margin: 0, color: "#F4EAF0" },
  chatBridgeBody: { color: "#C6B7CC", fontSize: 13.5, margin: "3px 0 0" },
  chatBridgeArrow: { color: "#E9A06B", fontSize: 20, fontWeight: 700, flexShrink: 0 },
  topTools: { display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" },
  iconToggle: { position: "relative", zIndex: 47, background: "rgba(35,26,43,.6)", color: "#AC9CB0", border: "1px solid #3A2E44", borderRadius: 999, padding: "5px 12px", cursor: "pointer", fontSize: 12.5, fontWeight: 600, backdropFilter: "blur(6px)" },
  readerMenuWrap: { position: "relative" },
  readerMenuBackdrop: { position: "fixed", inset: 0, zIndex: 45 },
  readerMenu: { position: "absolute", top: "130%", right: 0, zIndex: 46, width: 220, background: "#150F1A", border: "1px solid #3A2E44", borderRadius: 14, boxShadow: "0 16px 40px rgba(0,0,0,.5)", padding: 14 },
  readerMenuLabel: { fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "#8A7A90", fontWeight: 700, margin: "10px 0 8px" },
  readerMenuRow: { display: "flex", gap: 8 },
  readerChip: { flex: 1, background: "#231A2B", color: "#CBBBD0", border: "1px solid #3A2E44", borderRadius: 8, padding: "7px 0", cursor: "pointer", fontSize: 13, fontWeight: 600, textAlign: "center" },
  readerChipOn: { background: "linear-gradient(100deg,#E9A06B,#D46A8B)", color: "#1A1220", border: "1px solid transparent" },
  readerSwatch: { flex: 1, height: 30, borderRadius: 8, border: "1px solid #3A2E44", cursor: "pointer" },
  readerSwatchOn: { border: "2px solid #E9A06B" },
};
