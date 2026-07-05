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
  const words = elements.length === "medium" ? "500-800 words" : "300-500 words";
  const maxTokens = elements.length === "medium" ? 1100 : 700;

  const system =
    `You are a skilled fiction writer. Write an immersive 'first chapter' - a short story (${words}) that ` +
    "introduces the reader to the character and pulls them into a scene together. Write in second person, present " +
    "tense ('you'), so the reader feels present with the character. Keep it tasteful and non-explicit. " +
    "Begin with a title on the first line as 'Title: <the title>', then a blank line, then the story.";

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
    { temperature: 0.95, maxTokens },
  );

  const text = res.text.trim();
  const m = text.match(/^\s*title:\s*(.+)$/im);
  const title = m ? m[1].trim().replace(/^["']|["']$/g, "") : `${def.name}: A Beginning`;
  const content = m ? text.replace(m[0], "").trim() : text;
  return { title, content, usage: res.usage };
}
