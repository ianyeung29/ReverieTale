import { chat } from "./model";

/**
 * Story generation - the free front-door. Produces a short "first chapter"
 * that introduces the reader to a character and can spin off into chat.
 * Kept tasteful / non-explicit (matches the current non-explicit build).
 */
export type StoryElements = {
  setting?: string;
  tone?: string;
  scenario?: string;
  relationship?: string;
  genre?: string;
  details?: string;
  length?: "short" | "medium";
};

export async function generateStory(def: Record<string, string>, elements: StoryElements = {}) {
  const words = elements.length === "medium" ? "800-1200 words" : "350-650 words";
  const maxTokens = elements.length === "medium" ? 1800 : 950;

  const baseSystem =
    `You are a skilled writer for a 13+ interactive-fiction app. Write a vivid opening scene (${words}) that introduces the reader to a fictional character and their world. ` +
    "Use second person, present tense ('you'). Make the setting specific, the character memorable, and the ending feel like a natural moment for the reader to reply in chat. " +
    "Prioritize wonder, friendship, adventure, mystery, gentle humor, and age-appropriate emotional connection. A small, school-safe crush is fine, but do not write sexual content, sensual framing, adult relationship dynamics, nudity, graphic violence, drugs, or mature themes.";

  // The reader's own instructions (how they meet, the setting, and any specific
  // idea they typed) are REQUIREMENTS, not suggestions - the story must be built
  // around them exactly. Flirtatious tone is the flavour brought to the reader's
  // scenario, never a reason to override or ignore what they asked for.
  const system =
    `${baseSystem}\n\nStrictly follow the reader's instructions below: honor how they meet, the setting, and any specific idea they give ` +
    "exactly and completely, as the backbone of the story. Do not substitute your own premise for theirs.\n" +
    "Begin with a title on the first line as 'Title: <the title>', then a blank line, then the story.";

  const user = [
    `Character: ${def.name}${def.gender ? ` (${def.gender})` : ""}. ${def.persona}. Backstory: ${def.backstory}. Voice: ${def.voice}.`,
    elements.genre ? `Genre: ${elements.genre}.` : "",
    elements.relationship ? `Your relationship: ${elements.relationship}.` : "",
    elements.scenario ? `How you meet (this must happen as written): ${elements.scenario}.` : "",
    elements.setting ? `Setting (place the story here): ${elements.setting}.` : "",
    elements.tone ? `Mood: ${elements.tone}.` : "Mood: curious, cinematic, and welcoming.",
    // The freeform "idea" field is the reader's strongest steer - make it central.
    elements.details ? `The reader specifically wants this in the story (make it central, not a passing mention): ${elements.details}.` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const res = await chat(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { temperature: 0.9, maxTokens },
  );

  const text = res.text.trim();
  const m = text.match(/^\s*title:\s*(.+)$/im);
  const title = m ? m[1].trim().replace(/^["']|["']$/g, "") : `${def.name}: A Beginning`;
  const content = m ? text.replace(m[0], "").trim() : text;
  return { title, content, usage: res.usage };
}

export type ChapterDirection = { whatHappens?: string; mood?: string; twist?: string; setting?: string };

/** Continue an ongoing story - the next chapter, steered by the reader's direction. */
export async function generateNextChapter(
  def: Record<string, string>,
  storySoFar: string,
  direction: ChapterDirection = {},
) {
  const standardSystem =
    "You are a skilled writer continuing a 13+ interactive story. Write the NEXT chapter (450-750 words). " +
    "CRUCIAL: when the reader tells you what happens next, that request is the required spine of the chapter - make those exact events " +
    "actually happen on the page, as the central thread of the chapter. Never ignore, water down, postpone to 'later', or merely hint at " +
    "them; if the reader's request would resolve quickly, build the whole chapter around leading into it and playing it out. Move the scene forward, preserve the character's voice, and keep everything age-appropriate. " +
    "Do not include sexual content, sensual framing, adult relationship dynamics, nudity, graphic violence, drugs, or mature themes. Do not repeat what already happened. Second person, present tense.";

  const system = `${standardSystem}\nDo NOT include a title; write only the prose.`;

  const dir = [
    direction.whatHappens ? `- What the reader wants to happen (MUST occur in this chapter): ${direction.whatHappens}` : "",
    direction.twist ? `- Work in this beat: ${direction.twist}` : "",
    direction.mood ? `- Mood: ${direction.mood}` : "- Mood: curious and cinematic",
    direction.setting ? `- Move the scene to: ${direction.setting}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  // Put the reader's direction LAST, right before the write instruction - recency
  // meaningfully improves how closely the model follows it, and separating it from
  // the story-so-far stops it being read as just more narration.
  const closer = direction.whatHappens
    ? "Write the next chapter now, and make sure the reader's requested events above genuinely play out on the page."
    : "Write the next chapter now.";
  const user = `Character: ${def.name}. ${def.persona}. Voice: ${def.voice}.\n\nStory so far:\n${storySoFar.slice(-4000)}\n\nReader's direction for THIS chapter:\n${dir}\n\n${closer}`;

  const res = await chat(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { temperature: 0.9, maxTokens: 1200 },
  );
  return res.text.trim();
}

/**
 * Distill ONE chapter into a single vivid, concrete visual sentence for image
 * generation - the specific location, time of day, what is physically
 * happening, the lighting/mood, and what the character is wearing or doing in
 * THIS chapter. This makes each chapter's image distinct instead of every image
 * looking alike (the old approach fed the generator the same generic opening
 * lines). Throws if the model is unavailable; callers fall back to the raw text.
 */
export async function describeChapterForImage(chapterText: string, name?: string): Promise<string> {
  const who = name || "the character";
  const system =
    "You write a single-sentence visual prompt for an image generator. Given a chapter of prose, output ONE vivid, concrete sentence describing THIS chapter's specific scene: the location, the time of day, what is physically happening, the lighting and mood, and what the character is wearing or doing. Visual and specific only - no character names, no plot summary, no dialogue, no abstract emotions. Max 40 words.";
  const user = `Character: ${who}.\n\nChapter:\n${chapterText.slice(0, 2000)}\n\nOne vivid visual sentence describing this specific chapter's scene:`;
  const res = await chat(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { temperature: 0.7, maxTokens: 120 },
  );
  return res.text.trim().replace(/^["']|["']$/g, "").replace(/\s+/g, " ").slice(0, 320);
}
