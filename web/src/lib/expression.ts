/**
 * Picks which portrait expression variant (see lib/image.ts's img2img pilot)
 * best matches a piece of text - a character's chat reply, or a story's tone.
 * A keyword heuristic, not real sentiment analysis; good enough to make a
 * companion's portrait visibly react without calling a model for it. Falls
 * back to "neutral" (the canonical portrait) whenever nothing matches, which
 * is also what happens for every character that doesn't have variants yet.
 */
export type ExpressionPick = "neutral" | "warm" | "flirty";

const FLIRTY = /\b(smirk\w*|wink\w*|teas\w*|grin\w*|mischiev\w*|curious|playful)\b/i;
const WARM = /\b(smil\w*|laugh\w*|warm\w*|gentle|sweet|happy|comfort\w*|cozy|tender|soft(ly)?|affection\w*)\b/i;

export function pickExpression(text: string | null | undefined): ExpressionPick {
  if (!text) return "neutral";
  if (FLIRTY.test(text)) return "flirty";
  if (WARM.test(text)) return "warm";
  return "neutral";
}
