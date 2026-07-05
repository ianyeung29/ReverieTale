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
  const words = elements.length === "medium" ? "500-800 words" : "300-500 words";
  const maxTokens = elements.length === "medium" ? 1100 : 700;

  // Standard (non-explicit) system prompt - the only one authored here.
  const standardSystem =
    `You are a skilled fiction writer. Write an immersive 'first chapter' - a short story (${words}) that ` +
    "introduces the reader to the character and pulls them into a scene together. Write in second person, present " +
    "tense ('you'), so the reader feels present with the character. Keep it tasteful and non-explicit.";

  // Explicit tier uses an OPERATOR-SUPPLIED prompt from env (never authored here).
  // Falls back to the standard, non-explicit prompt if not provided.
  const explicitSystem = process.env.EXPLICIT_SYSTEM_PROMPT_STORY || "";
  const useExplicit = tier === "explicit" && explicitSystem.length > 0;
  const baseSystem = useExplicit ? explicitSystem : standardSystem;

  const system = `${baseSystem}\nBegin with a title on the first line as 'Title: <the title>', then a blank line, then the story.`;

  const user = [
    `Character: ${def.name}. ${def.persona}. Backstory: ${def.backstory}. Voice: ${def.voice}.`,
    elements.genre ? `Genre: ${elements.genre}.` : "",
    elements.relationship ? `Your relationship: ${elements.relationship}.` : "",
    elements.scenario ? `How you meet: ${elements.scenario}.` : "",
    elements.tone ? `Mood: ${elements.tone}.` : "",
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

/** Continue an ongoing story - the next chapter, given what's happened so far. */
export async function generateNextChapter(def: Record<string, string>, storySoFar: string) {
  const system =
    "You are a skilled fiction writer continuing an ongoing story. Write the NEXT chapter (300-500 words) that " +
    "moves the scene forward with new events - do not repeat what already happened. Second person, present tense. " +
    "Tasteful and non-explicit. Do NOT include a title; write only the prose.";
  const user = `Character: ${def.name}. ${def.persona}. Voice: ${def.voice}.\n\nStory so far:\n${storySoFar.slice(-4000)}\n\nWrite the next chapter.`;
  const res = await chat(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { temperature: 0.95, maxTokens: 800 },
  );
  return res.text.trim();
}
