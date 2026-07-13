// A rough "heat" score for a passage of prose, used to tint the reader's font
// color: mild text reads near-white, a charged passage warms to orange, and an
// intense one glows soft red. This is a keyword heuristic (same spirit as
// lib/expression), not real sentiment analysis - it just needs to trend the
// right way as a scene heats up.
const HEAT =
  /\b(kiss\w*|lips?|mouth|breath\w*|breathless|skin|bare|heat|heated|hot|pulse|ache\w*|aching|desire\w*|trembl\w*|shiver\w*|touch\w*|caress\w*|flush\w*|warmth|tension|want\w*|crave\w*|craving|sultry|seduc\w*|teas\w*|moan\w*|gasp\w*|press\w*|thigh\w*|neck|collarbone|whisper\w*|smoulder\w*|smolder\w*|hunger\w*|melt\w*|arch\w*|hips?|pulse|closer|undress\w*|naked|bite|graze\w*|shudder\w*|yearn\w*|electric)\b/gi;

/** 0 (mild) .. 1 (intense) heat score for a passage. */
export function intensityScore(text?: string | null): number {
  if (!text) return 0;
  const hits = (text.match(HEAT) || []).length;
  // Soft, saturating curve so a single charged word only warms the text a
  // little and it takes a genuinely heated passage to approach red - keeps a
  // visible spread even though flirty stories sprinkle heat words throughout.
  // hits: 1 -> .25, 2 -> .4, 4 -> .57, 6 -> .67, 10 -> .77.
  return hits / (hits + 3);
}

// Soft, readable stops on a dark background: near-white -> warm orange -> soft red.
const STOPS: [number, number, number][] = [
  [236, 227, 232], // mild - the default reading white
  [233, 160, 107], // mid  - brand orange
  [226, 112, 112], // intense - soft red
];

/** Interpolate the reading color for a given 0..1 heat score. */
export function intensityColor(score: number): string {
  const s = Math.max(0, Math.min(1, score));
  const seg = s < 0.5 ? 0 : 1;
  const t = s < 0.5 ? s / 0.5 : (s - 0.5) / 0.5;
  const a = STOPS[seg];
  const b = STOPS[seg + 1];
  const mix = a.map((c, i) => Math.round(c + (b[i] - c) * t));
  return `rgb(${mix[0]}, ${mix[1]}, ${mix[2]})`;
}
