import { chat, type Tier } from "./model";

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

export async function generateStory(def: Record<string, string>, elements: StoryElements = {}, tier: Tier = "standard") {
  const words = elements.length === "medium" ? "1000-1600 words" : "550-1000 words";
  const maxTokens = elements.length === "medium" ? 2200 : 1400;

  // Standard (non-explicit) system prompt - the only one authored here. This is
  // the always-on lane (not age-gated), so it leans flirtatious and charged but
  // stays suggestive rather than graphic. Truly explicit content lives behind
  // the operator-supplied explicit prompt + age verification (see below).
  const standardSystem =
    `You are a skilled fiction writer specializing in flirtatious, romantically-charged fiction. Write an immersive 'first chapter' - a short story (${words}) that ` +
    "pulls the reader into a scene with the character that crackles with chemistry: charged glances, teasing banter, playful push-and-pull, " +
    "and a slow, deliberate build of attraction and physical awareness. Write in second person, present tense ('you'), so the reader feels the " +
    "tension firsthand. Lean into flirtation, longing, and a sensual atmosphere - keep it heated and suggestive, but tasteful: imply and " +
    "smoulder rather than depict, and fade to black before anything sexually explicit.";

  // Explicit tier uses an OPERATOR-SUPPLIED prompt from env (never authored here).
  // Falls back to the standard, non-explicit prompt if not provided.
  const explicitSystem = process.env.EXPLICIT_SYSTEM_PROMPT_STORY || "";
  const useExplicit = tier === "explicit" && explicitSystem.length > 0;
  const baseSystem = useExplicit ? explicitSystem : standardSystem;

  const system = `${baseSystem}\nBegin with a title on the first line as 'Title: <the title>', then a blank line, then the story.`;

  const user = [
    `Character: ${def.name}${def.gender ? ` (${def.gender})` : ""}. ${def.persona}. Backstory: ${def.backstory}. Voice: ${def.voice}.`,
    elements.genre ? `Genre: ${elements.genre}.` : "",
    elements.relationship ? `Your relationship: ${elements.relationship}.` : "",
    elements.scenario ? `How you meet: ${elements.scenario}.` : "",
    elements.tone ? `Mood: ${elements.tone}.` : "Mood: flirtatious and charged with romantic tension.",
    elements.setting ? `Setting: ${elements.setting}.` : "",
    elements.details ? `Also weave in this idea: ${elements.details}.` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const res = await chat(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { temperature: 0.95, maxTokens, tier: useExplicit ? "explicit" : "standard" },
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
  tier: Tier = "standard",
) {
  const standardSystem =
    "You are a skilled fiction writer continuing a flirtatious, romantically-charged story. Write the NEXT chapter (550-1000 words) that " +
    "moves the scene forward with new events and deepens the attraction between the reader and the character - more tension, teasing, and heat " +
    "than before. Do not repeat what already happened. Second person, present tense. Lean into flirtation, longing, and a sensual atmosphere - " +
    "keep it heated and suggestive but tasteful: imply and smoulder rather than depict, and fade to black before anything sexually explicit.";

  const explicitSystem = process.env.EXPLICIT_SYSTEM_PROMPT_STORY || "";
  const useExplicit = tier === "explicit" && explicitSystem.length > 0;
  const system = `${useExplicit ? explicitSystem : standardSystem}\nDo NOT include a title; write only the prose.`;

  const dir = [
    direction.whatHappens ? `What happens next: ${direction.whatHappens}.` : "",
    direction.twist ? `Include this beat: ${direction.twist}.` : "",
    direction.mood ? `Mood: ${direction.mood}.` : "Mood: flirtatious and charged with romantic tension.",
    direction.setting ? `Move the scene to: ${direction.setting}.` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const user = `Character: ${def.name}. ${def.persona}. Voice: ${def.voice}.\n\nStory so far:\n${storySoFar.slice(-4000)}\n\n${dir}\n\nWrite the next chapter.`;

  const res = await chat(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { temperature: 0.95, maxTokens: 1400, tier: useExplicit ? "explicit" : "standard" },
  );
  return res.text.trim();
}
