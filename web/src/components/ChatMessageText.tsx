const ACTION_PART = /(\([^()\n]{1,320}\))/g;

export type ChatMessagePart = {
  kind: "narrative" | "speech";
  content: string;
};

/** Separates brief parenthetical action beats from a companion's spoken dialogue. */
export function splitChatMessage(content: string): ChatMessagePart[] {
  return content
    .split(ACTION_PART)
    .map((part) => ({
      kind: part.startsWith("(") && part.endsWith(")") ? "narrative" as const : "speech" as const,
      content: part.trim(),
    }))
    .filter((part) => part.content.length > 0);
}
