// Some models wrap a parenthetical action in Markdown italics: `*(looks up)*`.
// Capture that whole wrapper so stray asterisks never become their own bubbles.
const ACTION_PART = /(\*?\s*\([^()\n]{1,320}\)\s*\*?)/g;
const ACTION_ONLY = /^\*?\s*\([^()\n]{1,320}\)\s*\*?$/;
const MESSAGE_BREAK = /\n\s*---\s*\n/g;

function cleanSpeechFragment(part: string): string {
  return part
    .trim()
    .replace(/^\*+\s*|\s*\*+$/g, "")
    // If a model has doubled or misplaced the wrapper around an action, do not
    // surface its orphan punctuation as a separate chat bubble.
    .replace(/^[*)"“”‘’\s]+/, "")
    .replace(/[*("“”‘’\s]+$/, "")
    .trim();
}

export type ChatMessagePart = {
  kind: "narrative" | "speech";
  content: string;
};

/** Splits a deliberate multi-text companion turn into at most three message beats. */
export function splitChatBubbles(content: string): string[] {
  return content
    .split(MESSAGE_BREAK)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 3);
}

/** Separates brief parenthetical action beats from a companion's spoken dialogue. */
export function splitChatMessage(content: string): ChatMessagePart[] {
  return content
    .split(ACTION_PART)
    .map((part) => {
      const trimmed = part.trim();
      const isNarrative = ACTION_ONLY.test(trimmed);
      return {
        kind: isNarrative ? "narrative" as const : "speech" as const,
        content: isNarrative
          ? trimmed.replace(/^\*+|\*+$/g, "").trim()
          : cleanSpeechFragment(trimmed),
      };
    })
    .filter((part) => part.content.length > 0 && !/^[*()"“”‘’\s]+$/.test(part.content));
}
