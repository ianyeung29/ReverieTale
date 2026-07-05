import { chat } from "./model";

/**
 * Story generation - the free front-door. Produces a short "first chapter"
 * that introduces the reader to a character and can spin off into chat.
 * Kept tasteful / non-explicit (matches the current non-explicit build).
 */
export async function generateStory(
  def: Record<string, string>,
  elements: { setting?: string; tone?: string; scenario?: string; relationship?: string } = {},
) {
  const system =
    "You are a skilled fiction writer. Write an immersive 'first chapter' - a short story (300-500 words) that " +
    "introduces the reader to the character and pulls them into a scene together. Write in second person, present " +
    "tense ('you'), so the reader feels present with the character. Keep it tasteful and non-explicit. " +
    "Begin with a title on the first line as 'Title: <the title>', then a blank line, then the story.";

  const user = [
    `Character: ${def.name}. ${def.persona}. Backstory: ${def.backstory}. Voice: ${def.voice}.`,
    elements.relationship ? `Your relationship: ${elements.relationship}.` : "",
    elements.scenario ? `How you meet: ${elements.scenario}.` : "",
    elements.setting ? `Setting: ${elements.setting}.` : "",
    elements.tone ? `Mood: ${elements.tone}.` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const res = await chat(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { temperature: 0.95, maxTokens: 900 },
  );

  const text = res.text.trim();
  const m = text.match(/^\s*title:\s*(.+)$/im);
  const title = m ? m[1].trim().replace(/^["']|["']$/g, "") : `${def.name}: A Beginning`;
  const content = m ? text.replace(m[0], "").trim() : text;
  return { title, content, usage: res.usage };
}
