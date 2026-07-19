import type { CSSProperties } from "react";

// Small typography shifts give companions an authored feel without making the
// chat harder to read or relying on novelty fonts that might not be installed.
export function companionChatStyle(tags?: string[], persona?: string): CSSProperties {
  const text = `${(tags ?? []).join(" ")} ${persona ?? ""}`.toLowerCase();

  if (/mystery|detective|thriller|assassin|sci-fi/.test(text)) {
    return { fontFamily: 'ui-monospace, "SFMono-Regular", Consolas, monospace', letterSpacing: "0.01em" };
  }
  if (/fantasy|angel|mermaid|celestial|supernatural/.test(text)) {
    return { fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif', letterSpacing: "0.008em" };
  }
  if (/music|singer|podcast|artist|writer|comic|fashion/.test(text)) {
    return { fontFamily: '"Avenir Next", "Trebuchet MS", system-ui, sans-serif', letterSpacing: "0.012em" };
  }
  if (/sport|soccer|basketball|cheer|dance|gaming|athlete/.test(text)) {
    return { fontFamily: 'ui-rounded, "Avenir Next Rounded", "Trebuchet MS", system-ui, sans-serif', fontWeight: 550 };
  }
  return { fontFamily: 'ui-rounded, "Avenir Next Rounded", "Avenir Next", "Trebuchet MS", system-ui, sans-serif' };
}
