import type { CSSProperties } from "react";

const ACTION_PART = /(\([^()\n]{1,320}\))/g;

/** Keeps dialogue readable while giving parenthetical stage directions their own voice. */
export function ChatMessageText({ content, actionStyle }: { content: string; actionStyle?: CSSProperties }) {
  const parts = content.split(ACTION_PART);
  return (
    <>
      {parts.map((part, index) =>
        part.startsWith("(") && part.endsWith(")") ? (
          <span key={index} style={{ color: "#D88EAD", fontStyle: "italic", ...actionStyle }}>{part}</span>
        ) : part,
      )}
    </>
  );
}
