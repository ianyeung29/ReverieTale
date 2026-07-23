"use client";

import { useEffect, useMemo, useState } from "react";

type LivingPortrait = { id: string; status: string; isActive: boolean; createdAt: string; videoKey: string | null };
type Companion = { id: string; name: string; hasScene: boolean; hasChatPose: boolean; postCount: number; livingPortraits: LivingPortrait[] };
type Story = { id: string; title: string; characterName: string; chapters: number; hasBackground: boolean };
type Catalogue = { characters: Companion[]; stories: Story[] };
type Job = "companion_post" | "character_scene" | "chat_pose" | "living_portrait" | "select_living_portrait" | "chapter_scene" | "story_background";

export default function AdminMediaPage() {
  const [catalogue, setCatalogue] = useState<Catalogue | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [characterId, setCharacterId] = useState("");
  const [storyId, setStoryId] = useState("");
  const [chapter, setChapter] = useState(0);
  const [busy, setBusy] = useState<Job | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetch("/api/admin/media")
      .then(async (response) => {
        if (response.status === 403) { setForbidden(true); return null; }
        return response.ok ? response.json() as Promise<Catalogue> : null;
      })
      .then((data) => {
        if (!data) return;
        setCatalogue(data);
        setCharacterId((current) => current || data.characters[0]?.id || "");
        setStoryId((current) => current || data.stories[0]?.id || "");
      })
      .catch(() => setCatalogue({ characters: [], stories: [] }));
  }
  useEffect(() => { load(); }, []);

  const selectedStory = useMemo(() => catalogue?.stories.find((story) => story.id === storyId) ?? null, [catalogue, storyId]);
  const selectedCharacter = useMemo(() => catalogue?.characters.find((character) => character.id === characterId) ?? null, [catalogue, characterId]);

  async function run(action: Job, renderId?: string) {
    if (busy) return;
    setBusy(action);
    setNotice(null);
    setError(null);
    try {
      const response = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, characterId, renderId, storyId, chapter }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Generation failed");
      setNotice(action === "living_portrait" ? "Portrait motion started. It will appear here after Runware finishes it; refresh in a minute." : action === "select_living_portrait" ? "The selected version is now this companion's live portrait." : "Image generated and saved to R2. Reload the linked page to see it.");
      load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Generation failed");
    } finally {
      setBusy(null);
    }
  }

  if (forbidden) return <main style={S.wrap}><a href="/" style={S.back}>Back to ReverieTale</a><p style={S.muted}>This page is for administrators only.</p></main>;

  return (
    <main style={S.wrap}>
      <a href="/admin/review" style={S.back}>Back to review</a>
      <p style={S.eyebrow}>Admin tools</p>
      <h1 style={S.title}>Media studio</h1>
      <p style={S.sub}>Regenerate one asset at a time. A successful job replaces the existing R2 image; reader credits are never used.</p>

      {catalogue === null ? <p style={S.muted}>Loading catalogue...</p> : <>
        <section className="rv-card" style={S.card}>
          <h2 style={S.h2}>Companion moments</h2>
          <p style={S.cardSub}>Publish one safe, day-in-the-life profile update. It uses the portrait as a visual reference and creates a new entry in the public Moments feed.</p>
          <label style={S.label}>Companion</label>
          <select value={characterId} onChange={(event) => setCharacterId(event.target.value)} style={S.select}>
            {catalogue.characters.map((character) => <option key={character.id} value={character.id}>{character.name} - {character.postCount} moment{character.postCount === 1 ? "" : "s"}</option>)}
          </select>
          <button onClick={() => run("companion_post")} disabled={!characterId || Boolean(busy)} style={{ ...S.primary, opacity: busy ? 0.55 : 1 }}>
            {busy === "companion_post" ? "Publishing a new moment..." : "Generate and publish a moment"}
          </button>

          <h2 style={{ ...S.h2, marginTop: 12 }}>Companion scene</h2>
          <p style={S.cardSub}>A wide, setting-led image used behind the companion profile header.</p>
          <button onClick={() => run("character_scene")} disabled={!characterId || Boolean(busy)} style={{ ...S.primary, opacity: busy ? 0.55 : 1 }}>
            {busy === "character_scene" ? "Generating companion scene..." : "Generate companion scene"}
          </button>

          <h2 style={{ ...S.h2, marginTop: 12 }}>Chat stage portrait</h2>
          <p style={S.cardSub}>Remove the existing portrait&apos;s background for use beside desktop chat. This preserves the companion&apos;s exact face, clothes, and artwork.</p>
          <button onClick={() => run("chat_pose")} disabled={!characterId || Boolean(busy)} style={{ ...S.primary, opacity: busy ? 0.55 : 1 }}>
            {busy === "chat_pose" ? "Removing background..." : "Create transparent chat portrait"}
          </button>

          <h2 style={{ ...S.h2, marginTop: 12 }}>Living portrait</h2>
          <p style={S.cardSub}>Make a silent five-second motion version of the canonical portrait. The first reader-created version becomes live automatically; here you can generate alternatives and choose what appears on the profile.</p>
          <button onClick={() => run("living_portrait")} disabled={!characterId || Boolean(busy)} style={{ ...S.primary, opacity: busy ? 0.55 : 1 }}>
            {busy === "living_portrait" ? "Starting portrait motion..." : "Generate living portrait"}
          </button>
          {selectedCharacter?.livingPortraits.length ? <div style={S.livingList}>
            {selectedCharacter.livingPortraits.map((render) => <div key={render.id} style={S.livingItem}>
              <div>
                <strong style={S.livingStatus}>{render.isActive ? "Live now" : render.status}</strong>
                <span style={S.livingDate}> {new Date(render.createdAt).toLocaleString()}</span>
              </div>
              <div style={S.livingActions}>
                {render.videoKey ? <a href={`/api/living-portraits/${render.id}/video`} target="_blank" style={S.link}>Preview</a> : null}
                {render.status === "ready" && !render.isActive ? <button onClick={() => run("select_living_portrait", render.id)} disabled={Boolean(busy)} style={S.smallBtn}>Use as live</button> : null}
              </div>
            </div>)}
          </div> : null}
        </section>

        <section className="rv-card" style={S.card}>
          <h2 style={S.h2}>Story media</h2>
          <p style={S.cardSub}>Create the setting-led chapter visual or the quiet ambient background behind the reader.</p>
          <label style={S.label}>Story</label>
          <select value={storyId} onChange={(event) => { setStoryId(event.target.value); setChapter(0); }} style={S.select}>
            {catalogue.stories.map((story) => <option key={story.id} value={story.id}>{story.title} - {story.characterName}</option>)}
          </select>
          <label style={S.label}>Chapter</label>
          <select value={chapter} onChange={(event) => setChapter(Number(event.target.value))} style={S.select}>
            {Array.from({ length: selectedStory?.chapters ?? 1 }, (_, index) => <option key={index} value={index}>Chapter {index + 1}</option>)}
          </select>
          <div style={S.actions}>
            <button onClick={() => run("chapter_scene")} disabled={!storyId || Boolean(busy)} style={{ ...S.primary, opacity: busy ? 0.55 : 1 }}>
              {busy === "chapter_scene" ? "Generating chapter scene..." : "Generate chapter scene"}
            </button>
            <button onClick={() => run("story_background")} disabled={!storyId || Boolean(busy)} style={{ ...S.secondary, opacity: busy ? 0.55 : 1 }}>
              {busy === "story_background" ? "Generating background..." : "Generate ambient background"}
            </button>
          </div>
          {selectedStory ? <a href={`/story/${selectedStory.id}`} style={S.link}>Open {selectedStory.title}</a> : null}
        </section>
      </>}

      {notice ? <p style={S.notice}>{notice}</p> : null}
      {error ? <p style={S.error}>{error}</p> : null}
    </main>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 720, margin: "0 auto", padding: "40px 24px 100px", lineHeight: 1.5 },
  back: { color: "#8A7A90", textDecoration: "none", fontSize: 14, letterSpacing: ".04em" },
  eyebrow: { margin: "24px 0 4px", color: "#E9A06B", textTransform: "uppercase", letterSpacing: ".14em", fontSize: 11, fontWeight: 700 },
  title: { margin: "0 0 7px", color: "#F4EAF0", fontFamily: "Georgia, serif", fontSize: 36 },
  sub: { color: "#AC9CB0", fontSize: 14.5, margin: "0 0 26px", maxWidth: 600 },
  muted: { color: "#AC9CB0", marginTop: 24 },
  card: { background: "#241B2D", border: "1px solid #3A2E44", borderRadius: 14, padding: 20, display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 },
  h2: { color: "#F4EAF0", fontFamily: "Georgia, serif", fontSize: 22, margin: 0 },
  cardSub: { color: "#AC9CB0", fontSize: 13.5, margin: "-4px 0 6px" },
  label: { color: "#8A7A90", textTransform: "uppercase", letterSpacing: ".1em", fontSize: 11, fontWeight: 700, marginTop: 4 },
  select: { width: "100%", boxSizing: "border-box", background: "#1A121F", border: "1px solid #3A2E44", borderRadius: 9, color: "#F4EAF0", padding: "10px 12px", fontSize: 14 },
  actions: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 },
  primary: { border: 0, background: "linear-gradient(100deg,#E9A06B,#D46A8B)", color: "#1A1220", borderRadius: 10, padding: "11px 15px", fontSize: 14, fontWeight: 700, cursor: "pointer", alignSelf: "flex-start" },
  secondary: { border: "1px solid #4A3A50", background: "#1A121F", color: "#F4EAF0", borderRadius: 10, padding: "10px 14px", fontSize: 14, fontWeight: 650, cursor: "pointer" },
  link: { color: "#E9A06B", fontSize: 13.5, fontWeight: 650, textDecoration: "none", marginTop: 3 },
  notice: { color: "#9CE2B7", background: "rgba(70,150,110,.14)", border: "1px solid #2f6b4c", borderRadius: 10, padding: "10px 13px", fontSize: 14 },
  error: { color: "#F0A9B0", background: "#2A1A1E", border: "1px solid #6b3a44", borderRadius: 10, padding: "10px 13px", fontSize: 14 },
  livingList: { display: "flex", flexDirection: "column", gap: 7, marginTop: 3 },
  livingItem: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, border: "1px solid #3A2E44", borderRadius: 8, padding: "8px 10px", fontSize: 12.5 },
  livingStatus: { color: "#F4EAF0", textTransform: "capitalize" },
  livingDate: { color: "#8A7A90" },
  livingActions: { display: "flex", alignItems: "center", gap: 9 },
  smallBtn: { border: "1px solid #4A3A50", background: "#1A121F", color: "#E9A06B", borderRadius: 7, padding: "5px 8px", fontSize: 12, cursor: "pointer" },
};
