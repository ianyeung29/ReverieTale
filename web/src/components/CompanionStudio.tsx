"use client";

import { useEffect, useState } from "react";
import { DEEPGRAM_VOICES, TTS_LANGUAGES, TTS_STYLES } from "@/lib/tts";

type Companion = {
  id: string;
  status: string;
  hasImage: boolean;
  name: string;
  gender: string;
  age: number | null;
  style: "realistic" | "anime";
  outfit: string;
  look: string;
  persona: string;
  backstory: string;
  voice: string;
  ttsVoice: string;
  ttsLanguage: string;
  ttsStyle: string;
  greeting: string;
  tags: string[];
};

type Living = {
  id: string;
  status: "processing" | "ready" | "failed";
  isActive: boolean;
  error: string | null;
  createdAt: string;
  videoUrl: string | null;
};

type Media = {
  canUseMedia: boolean;
  isAdmin: boolean;
  hasPortrait: boolean;
  hasScene: boolean;
  hasChatPose: boolean;
  photoCount: number;
  stories: { id: string; title: string; hasBackground: boolean; hasOpeningScene: boolean }[];
  living: Living[];
};

type Notice = { kind: "error" | "success"; text: string } | null;

const emptyMedia: Media = {
  canUseMedia: false,
  isAdmin: false,
  hasPortrait: false,
  hasScene: false,
  hasChatPose: false,
  photoCount: 0,
  stories: [],
  living: [],
};

function messageFrom(response: Response, body: Record<string, unknown>, fallback: string) {
  return typeof body.error === "string" ? body.error : `${fallback} (${response.status})`;
}

export function CompanionStudio({ characterId }: { characterId: string }) {
  const [companion, setCompanion] = useState<Companion | null>(null);
  const [media, setMedia] = useState<Media>(emptyMedia);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [portraitBusy, setPortraitBusy] = useState(false);
  const [mediaBusy, setMediaBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [tagDraft, setTagDraft] = useState("");
  const [revision, setRevision] = useState(0);

  async function load() {
    setLoading(true);
    try {
      const [companionResponse, mediaResponse] = await Promise.all([
        fetch(`/api/characters/${characterId}`, { cache: "no-store" }),
        fetch(`/api/characters/${characterId}/studio/media`, { cache: "no-store" }),
      ]);
      const companionData = (await companionResponse.json().catch(() => ({}))) as Companion & Record<string, unknown>;
      const mediaData = (await mediaResponse.json().catch(() => ({}))) as Media & Record<string, unknown>;
      if (!companionResponse.ok) throw new Error(messageFrom(companionResponse, companionData, "Unable to load this companion"));
      if (!mediaResponse.ok) throw new Error(messageFrom(mediaResponse, mediaData, "Unable to load media"));
      setCompanion({ ...companionData, tags: Array.isArray(companionData.tags) ? companionData.tags : [], style: companionData.style === "anime" ? "anime" : "realistic" });
      setMedia({ ...emptyMedia, ...mediaData, living: Array.isArray(mediaData.living) ? mediaData.living : [] });
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Unable to open the companion studio." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [characterId]);

  function update<K extends keyof Companion>(key: K, value: Companion[K]) {
    setCompanion((current) => current ? { ...current, [key]: value } : current);
  }

  async function saveDetails() {
    if (!companion || saving) return;
    const age = Number(companion.age);
    if (!Number.isFinite(age) || age < 18) {
      setNotice({ kind: "error", text: "A companion must have an age of 18 or older." });
      return;
    }
    setSaving(true);
    setNotice(null);
    try {
      const response = await fetch(`/api/characters/${characterId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: companion.name.trim(), gender: companion.gender, age, outfit: companion.outfit.trim(), look: companion.look.trim(), persona: companion.persona.trim(),
          backstory: companion.backstory.trim(), voice: companion.voice.trim(), ttsVoice: companion.ttsVoice.trim(),
          ttsLanguage: companion.ttsLanguage, ttsStyle: companion.ttsStyle, greeting: companion.greeting.trim(), tags: companion.tags,
          style: companion.style,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
      if (!response.ok) throw new Error(messageFrom(response, data, "Changes could not be saved"));
      setCompanion((current) => current ? { ...current, status: typeof data.status === "string" ? data.status : current.status } : current);
      setNotice({ kind: "success", text: data.status === "in_review" ? "Saved. The updated companion is in review." : "Companion details saved." });
      setRevision((current) => current + 1);
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Changes could not be saved." });
    } finally {
      setSaving(false);
    }
  }

  async function regeneratePortrait() {
    if (!companion || portraitBusy) return;
    setPortraitBusy(true);
    setNotice(null);
    try {
      const response = await fetch("/api/characters/portrait", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId, name: companion.name, gender: companion.gender, age: Number(companion.age), outfit: companion.outfit,
          look: companion.look, persona: companion.persona, tags: companion.tags, style: companion.style,
        }),
      });
      const portrait = (await response.json().catch(() => ({}))) as { image?: string; mime?: string } & Record<string, unknown>;
      if (!response.ok || !portrait.image) throw new Error(messageFrom(response, portrait, "Portrait generation failed"));
      const save = await fetch(`/api/characters/${characterId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: portrait.image, imageMime: portrait.mime || "image/jpeg" }),
      });
      const saved = (await save.json().catch(() => ({}))) as Record<string, unknown>;
      if (!save.ok) throw new Error(messageFrom(save, saved, "The new portrait was not saved"));
      setMedia((current) => ({ ...current, hasPortrait: true }));
      update("hasImage", true);
      setRevision((current) => current + 1);
      setNotice({ kind: "success", text: "New portrait saved. Generate the scene and chat portrait again when you want them to match this look." });
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Portrait generation failed." });
    } finally {
      setPortraitBusy(false);
    }
  }

  async function pollLiving(renderId: string) {
    const response = await fetch(`/api/characters/${characterId}/living-portrait?renderId=${renderId}`, { cache: "no-store" });
    const state = (await response.json().catch(() => ({}))) as { status?: string; error?: string };
    if (!response.ok || state.status === "failed") {
      setNotice({ kind: "error", text: state.error || "The living portrait could not be completed." });
      await load();
      return;
    }
    if (state.status === "ready") {
      setNotice({ kind: "success", text: "Living portrait ready. Choose it below to make it live." });
      await load();
      return;
    }
    window.setTimeout(() => { void pollLiving(renderId); }, 3500);
  }

  async function runMedia(action: "scene" | "chat_pose" | "living_portrait" | "select_living_portrait" | "photo" | "story_background" | "chapter_scene", targetId?: string) {
    if (mediaBusy) return;
    setMediaBusy(action);
    setNotice(null);
    try {
      const response = await fetch(`/api/characters/${characterId}/studio/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action === "story_background" || action === "chapter_scene" ? { action, storyId: targetId } : { action, renderId: targetId }),
      });
      const data = (await response.json().catch(() => ({}))) as { renderId?: string } & Record<string, unknown>;
      if (!response.ok) throw new Error(messageFrom(response, data, "Media generation failed"));
      if (action === "living_portrait" && data.renderId) {
        setNotice({ kind: "success", text: "Living portrait is rendering. It can take about a minute." });
        window.setTimeout(() => { void pollLiving(data.renderId as string); }, 3000);
      } else {
        await load();
        setRevision((current) => current + 1);
        setNotice({ kind: "success", text: action === "photo" ? "New photo diary post published." : action === "select_living_portrait" ? "Live portrait updated." : action === "story_background" ? "Story background updated." : action === "chapter_scene" ? "Opening scene updated." : "Media updated." });
      }
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Media generation failed." });
    } finally {
      setMediaBusy(null);
    }
  }

  function addTag() {
    const tag = tagDraft.trim().toLowerCase();
    if (!tag || !companion || companion.tags.includes(tag) || companion.tags.length >= 8) return;
    update("tags", [...companion.tags, tag]);
    setTagDraft("");
  }

  if (loading) return <main className="companion-studio"><p className="studio-muted">Opening companion studio...</p></main>;
  if (!companion) return <main className="companion-studio"><a className="studio-back" href="/characters">Back to your companions</a><p className="studio-error">This companion could not be opened.</p></main>;

  const activeLiving = media.living.find((render) => render.isActive);
  const portraitUrl = `/api/characters/${characterId}/image?rev=${revision}`;
  const sceneUrl = `/api/characters/${characterId}/scene?rev=${revision}`;
  const chatPoseUrl = `/api/characters/${characterId}/chat-pose?rev=${revision}`;

  return (
    <main className="companion-studio">
      <a className="studio-back" href={`/c/${characterId}`}>Back to {companion.name || "companion"}</a>

      <header className="studio-head">
        <img className="studio-avatar" src={portraitUrl} alt="" />
        <div>
          <p className="studio-kicker">Companion studio</p>
          <h1>{companion.name || "Untitled companion"}</h1>
          <p className="studio-summary">Edit their voice and world, then keep every public visual in one place.</p>
        </div>
        <div className={`studio-status status-${companion.status}`}>{companion.status.replace("_", " ")}</div>
      </header>

      {notice ? <p className={notice.kind === "error" ? "studio-notice studio-notice-error" : "studio-notice"} role="status">{notice.text}</p> : null}

      <div className="studio-layout">
        <form className="studio-form" onSubmit={(event) => { event.preventDefault(); void saveDetails(); }}>
          <section className="studio-section">
            <div className="studio-section-head"><h2>Identity</h2><span>What readers see first</span></div>
            <div className="studio-fields two-up">
              <label>Name<input value={companion.name} onChange={(event) => update("name", event.target.value)} maxLength={60} required /></label>
              <label>Age<input value={companion.age ?? ""} onChange={(event) => update("age", Number(event.target.value.replace(/[^0-9]/g, "")) || null)} inputMode="numeric" /></label>
              <label>Gender<select value={companion.gender} onChange={(event) => update("gender", event.target.value)}><option value="female">Female</option><option value="male">Male</option><option value="non-binary">Non-binary</option></select></label>
              <label>Art direction<select value={companion.style} onChange={(event) => update("style", event.target.value as Companion["style"])}><option value="realistic">Realistic</option><option value="anime">Anime / illustrated</option></select></label>
            </div>
          </section>

          <section className="studio-section">
            <div className="studio-section-head"><h2>Character</h2><span>The details that steer each reply and scene</span></div>
            <div className="studio-fields">
              <label>Look<textarea value={companion.look} onChange={(event) => update("look", event.target.value)} maxLength={400} rows={3} /></label>
              <label>Outfit and styling<input value={companion.outfit} onChange={(event) => update("outfit", event.target.value)} maxLength={200} /></label>
              <label>Personality<textarea value={companion.persona} onChange={(event) => update("persona", event.target.value)} maxLength={600} rows={4} /></label>
              <label>Backstory<textarea value={companion.backstory} onChange={(event) => update("backstory", event.target.value)} maxLength={600} rows={4} /></label>
              <label>Opening message<textarea value={companion.greeting} onChange={(event) => update("greeting", event.target.value)} maxLength={300} rows={3} /></label>
            </div>
            <div className="studio-tags" aria-label="Character tags">
              {companion.tags.map((tag) => <button type="button" key={tag} onClick={() => update("tags", companion.tags.filter((item) => item !== tag))}>{tag}<span aria-hidden> x</span></button>)}
              {companion.tags.length < 8 ? <div className="tag-adder"><input value={tagDraft} onChange={(event) => setTagDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addTag(); } }} placeholder="Add a tag" maxLength={30} /><button type="button" onClick={addTag}>Add</button></div> : null}
            </div>
          </section>

          <section className="studio-section">
            <div className="studio-section-head"><h2>Voice</h2><span>How their narration feels</span></div>
            <div className="studio-fields">
              <label>Writing voice<textarea value={companion.voice} onChange={(event) => update("voice", event.target.value)} maxLength={300} rows={3} /></label>
              <div className="studio-fields three-up">
                <label>Language<select value={companion.ttsLanguage || "en"} onChange={(event) => update("ttsLanguage", event.target.value)}>{TTS_LANGUAGES.map((language) => <option key={language.id} value={language.id}>{language.label}</option>)}</select></label>
                <label>Delivery<select value={companion.ttsStyle || "warm"} onChange={(event) => update("ttsStyle", event.target.value)}>{TTS_STYLES.map((style) => <option key={style.id} value={style.id}>{style.label}</option>)}</select></label>
                <label>Narration voice<input list="studio-voices" value={companion.ttsVoice} onChange={(event) => update("ttsVoice", event.target.value)} placeholder="Auto-select" /></label>
                <datalist id="studio-voices">{DEEPGRAM_VOICES.map((voice) => <option key={voice.id} value={voice.id}>{voice.label}</option>)}</datalist>
              </div>
            </div>
          </section>

          <div className="studio-save-row"><button className="studio-primary" type="submit" disabled={saving}>{saving ? "Saving..." : "Save companion details"}</button><a href={`/c/${characterId}`}>View public profile</a></div>
        </form>

        <aside className="studio-media" aria-label="Media controls">
          <div className="media-heading"><div><p className="studio-kicker">Media bench</p><h2>Visual world</h2></div>{media.isAdmin ? <span>Admin</span> : <span>Creator</span>}</div>
          {!media.canUseMedia ? <p className="studio-media-note">Image storage is not configured in this environment.</p> : null}

          <section className="media-tool">
            <div className="media-preview portrait-preview">{media.hasPortrait ? <img src={portraitUrl} alt={`${companion.name} portrait`} /> : <div>No portrait</div>}</div>
            <div><h3>Main portrait</h3><p>The source of truth for their identity and art style.</p><button type="button" className="studio-action" disabled={portraitBusy || !media.canUseMedia} onClick={() => void regeneratePortrait()}>{portraitBusy ? "Generating..." : media.hasPortrait ? "Regenerate portrait" : "Generate portrait"}</button></div>
          </section>

          <section className="media-tool">
            <div className="media-preview wide-preview">{media.hasScene ? <img src={sceneUrl} alt={`${companion.name} scene`} /> : <div>World scene</div>}</div>
            <div><h3>Scene backdrop</h3><p>A wide image of the companion inside their own world.</p><button type="button" className="studio-action" disabled={mediaBusy === "scene" || !media.hasPortrait || !media.canUseMedia} onClick={() => void runMedia("scene")}>{mediaBusy === "scene" ? "Generating..." : media.hasScene ? "Regenerate backdrop" : "Generate backdrop"}</button></div>
          </section>

          <section className="media-tool">
            <div className="media-preview pose-preview">{media.hasChatPose ? <img src={chatPoseUrl} alt={`${companion.name} chat portrait`} /> : <div>Chat cutout</div>}</div>
            <div><h3>Chat portrait</h3><p>A transparent cutout used to make the conversation feel present.</p><button type="button" className="studio-action" disabled={mediaBusy === "chat_pose" || !media.hasPortrait || !media.canUseMedia} onClick={() => void runMedia("chat_pose")}>{mediaBusy === "chat_pose" ? "Creating..." : media.hasChatPose ? "Recreate chat portrait" : "Create chat portrait"}</button></div>
          </section>

          <section className="media-tool">
            <div className="media-preview living-preview">{activeLiving?.videoUrl ? <video src={activeLiving.videoUrl} autoPlay muted loop playsInline /> : <div>Living portrait</div>}</div>
            <div><h3>Living portrait</h3><p>A quiet five-second motion loop from the main portrait.</p><button type="button" className="studio-action" disabled={mediaBusy === "living_portrait" || !media.hasPortrait || !media.canUseMedia} onClick={() => void runMedia("living_portrait")}>{mediaBusy === "living_portrait" ? "Starting..." : "Generate living portrait"}</button></div>
          </section>

          {media.living.length ? <div className="living-list">{media.living.map((render) => <div key={render.id} className="living-item">{render.videoUrl ? <video src={render.videoUrl} muted loop playsInline onMouseEnter={(event) => { void event.currentTarget.play(); }} /> : <span>{render.status === "processing" ? "Rendering..." : "Failed"}</span>}<div><strong>{render.isActive ? "Live version" : render.status === "ready" ? "Ready version" : render.status}</strong><small>{new Date(render.createdAt).toLocaleDateString()}</small>{render.error ? <small className="studio-error">{render.error}</small> : null}{render.status === "ready" && !render.isActive ? <button type="button" onClick={() => void runMedia("select_living_portrait", render.id)} disabled={mediaBusy === "select_living_portrait"}>Use as live</button> : null}</div></div>)}</div> : null}

          <section className="media-tool media-tool-last">
            <div className="media-preview photo-preview"><span>{media.photoCount}</span><small>photo diary posts</small></div>
            <div><h3>Photo diary</h3><p>Publish a new in-character moment for their profile gallery.</p><button type="button" className="studio-action" disabled={mediaBusy === "photo" || !media.hasPortrait || !media.canUseMedia} onClick={() => void runMedia("photo")}>{mediaBusy === "photo" ? "Publishing..." : "Generate photo post"}</button></div>
          </section>

          {media.stories.length ? <section className="story-media"><h3>Story artwork</h3><p>These controls appear for stories you wrote with this companion.</p>{media.stories.map((story) => <div key={story.id} className="story-media-item"><strong>{story.title}</strong><div><button type="button" disabled={mediaBusy === "story_background" || !media.canUseMedia} onClick={() => void runMedia("story_background", story.id)}>{mediaBusy === "story_background" ? "Generating..." : story.hasBackground ? "Regenerate background" : "Generate background"}</button><button type="button" disabled={mediaBusy === "chapter_scene" || !media.hasPortrait || !media.canUseMedia} onClick={() => void runMedia("chapter_scene", story.id)}>{mediaBusy === "chapter_scene" ? "Generating..." : story.hasOpeningScene ? "Regenerate opening scene" : "Generate opening scene"}</button></div></div>)}</section> : null}
        </aside>
      </div>

      <style jsx>{`
        .companion-studio{max-width:1200px;margin:0 auto;padding:34px 24px 96px;color:#f4eaf0;line-height:1.5}.studio-back{display:inline-block;color:#ac9cb0;text-decoration:none;font-size:14px;margin-bottom:22px}.studio-back:hover{color:#f5b277}.studio-head{display:grid;grid-template-columns:70px minmax(0,1fr) auto;gap:16px;align-items:center;padding-bottom:26px;border-bottom:1px solid #33263d}.studio-avatar{width:70px;height:70px;border-radius:14px;object-fit:cover;background:#241b2d}.studio-kicker{margin:0 0 4px;color:#f5b277;font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.studio-head h1,.studio-media h2{margin:0;font-family:Georgia,serif;letter-spacing:0;font-weight:600}.studio-head h1{font-size:36px;line-height:1.05}.studio-summary{margin:7px 0 0;color:#ac9cb0;font-size:15px}.studio-status{border:1px solid #4a3a50;border-radius:999px;padding:6px 10px;color:#cbbbd0;font-size:12px;font-weight:700;text-transform:capitalize}.status-published{color:#8fe0b0;border-color:#2f6b4c}.status-in_review{color:#f0c99a;border-color:#6b5330}.studio-notice{margin:20px 0 0;padding:11px 13px;border:1px solid #3f654c;border-radius:10px;color:#b8ebca;background:rgba(50,100,72,.13);font-size:14px}.studio-notice-error,.studio-error{color:#f2b0b8}.studio-notice-error{border-color:#6a3844;background:rgba(130,55,70,.13)}.studio-layout{display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:48px;margin-top:32px}.studio-form{min-width:0}.studio-section{padding:0 0 30px;margin-bottom:30px;border-bottom:1px solid #33263d}.studio-section-head{display:flex;align-items:baseline;justify-content:space-between;gap:16px;margin-bottom:18px}.studio-section-head h2{font-family:Georgia,serif;font-size:23px;margin:0;font-weight:600}.studio-section-head span{color:#8f8196;font-size:13px;text-align:right}.studio-fields{display:grid;gap:14px}.studio-fields.two-up{grid-template-columns:repeat(2,minmax(0,1fr))}.studio-fields.three-up{grid-template-columns:repeat(3,minmax(0,1fr));margin-top:14px}label{display:grid;gap:6px;color:#cbbbd0;font-size:12px;font-weight:750;letter-spacing:.06em;text-transform:uppercase}input,textarea,select{box-sizing:border-box;width:100%;border:1px solid #473650;border-radius:8px;background:#17111d;color:#f4eaf0;padding:10px 11px;font:inherit;font-size:14px;font-weight:400;letter-spacing:0;text-transform:none;outline:none}textarea{resize:vertical;line-height:1.45}input:focus,textarea:focus,select:focus{border-color:#e9a06b;box-shadow:0 0 0 2px rgba(233,160,107,.18)}.studio-locked{min-height:41px;box-sizing:border-box;border:1px dashed #4a3a50;border-radius:8px;padding:10px 11px;color:#8f8196;font-size:14px;font-weight:400;letter-spacing:0;text-transform:none}.studio-tags{display:flex;gap:7px;flex-wrap:wrap;margin-top:16px}.studio-tags>button{border:1px solid #67435b;background:#241b2d;color:#eeb6c8;border-radius:999px;padding:6px 9px;font-size:12px;cursor:pointer}.studio-tags>button span{margin-left:5px}.tag-adder{display:flex;gap:6px;min-width:200px}.tag-adder input{padding:6px 9px}.tag-adder button,.living-item button,.story-media-item button{border:1px solid #4a3a50;background:#241b2d;color:#f5b277;border-radius:8px;padding:6px 9px;cursor:pointer;font-size:12px}.studio-save-row{display:flex;align-items:center;gap:18px}.studio-primary,.studio-action{border:0;border-radius:9px;background:linear-gradient(100deg,#e9a06b,#d46a8b);color:#1a1220;font-size:14px;font-weight:800;cursor:pointer;padding:11px 14px}.studio-primary:disabled,.studio-action:disabled,.story-media-item button:disabled{opacity:.5;cursor:not-allowed}.studio-save-row a{color:#e9a06b;font-size:14px;text-decoration:none}.studio-media{min-width:0;border-left:1px solid #33263d;padding-left:28px}.media-heading{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:20px;border-bottom:1px solid #33263d}.media-heading h2{font-size:26px}.media-heading>span{color:#ac9cb0;font-size:11px;border:1px solid #4a3a50;border-radius:999px;padding:5px 8px;text-transform:uppercase;letter-spacing:.08em}.studio-media-note{color:#f0c99a;font-size:13px;margin:15px 0}.media-tool{display:grid;grid-template-columns:104px minmax(0,1fr);gap:13px;padding:20px 0;border-bottom:1px solid #33263d}.media-tool-last{border-bottom:0}.media-preview{overflow:hidden;border-radius:10px;background:#241b2d;display:flex;align-items:center;justify-content:center;color:#8f8196;font-size:12px;text-align:center}.media-preview img,.media-preview video{display:block;width:100%;height:100%;object-fit:cover}.portrait-preview,.pose-preview,.living-preview{height:132px}.wide-preview{height:88px}.photo-preview{height:80px;flex-direction:column}.photo-preview span{color:#f5b277;font-family:Georgia,serif;font-size:24px;line-height:1}.photo-preview small{font-size:10px;margin-top:4px}.media-tool h3,.story-media h3{margin:0 0 4px;font-family:Georgia,serif;font-size:17px;font-weight:600}.media-tool p,.story-media>p{margin:0 0 10px;color:#ac9cb0;font-size:12.5px;line-height:1.4}.studio-action{padding:8px 10px;font-size:12px}.living-list{display:grid;gap:9px;padding:16px 0;border-bottom:1px solid #33263d}.living-item{display:grid;grid-template-columns:78px minmax(0,1fr);gap:10px;align-items:center}.living-item video,.living-item>span{width:78px;height:48px;object-fit:cover;border-radius:7px;background:#241b2d}.living-item>span{display:grid;place-items:center;color:#ac9cb0;font-size:10px}.living-item strong,.living-item small{display:block}.living-item strong{font-size:12px}.living-item small{color:#8f8196;font-size:10.5px;margin-top:1px}.living-item button{margin-top:5px}.story-media{padding:20px 0;border-top:1px solid #33263d}.story-media-item{padding:12px 0;border-bottom:1px solid #33263d}.story-media-item strong{display:block;font-family:Georgia,serif;font-size:15px;margin-bottom:8px}.story-media-item div{display:flex;flex-wrap:wrap;gap:7px}.studio-muted{color:#ac9cb0}@media(max-width:900px){.studio-layout{grid-template-columns:1fr;gap:34px}.studio-media{border-left:0;border-top:1px solid #33263d;padding:28px 0 0}.studio-head{grid-template-columns:58px minmax(0,1fr)}.studio-avatar{width:58px;height:58px}.studio-status{grid-column:2}.studio-head h1{font-size:30px}}@media(max-width:600px){.companion-studio{padding:24px 16px 76px}.studio-head{gap:12px}.studio-section-head{display:block}.studio-section-head span{display:block;text-align:left;margin-top:4px}.studio-fields.two-up,.studio-fields.three-up{grid-template-columns:1fr}.studio-save-row{align-items:flex-start;flex-direction:column;gap:10px}.media-tool{grid-template-columns:92px minmax(0,1fr)}.portrait-preview,.pose-preview,.living-preview{height:116px}.wide-preview{height:78px}.studio-head h1{font-size:27px}.studio-summary{font-size:14px}}
      `}</style>
    </main>
  );
}
