/**
 * Minimal safety gate - the categorical bright line only (no minors / CSAM signals).
 * This is a STUB, not the exec-2 pipeline: it must be replaced by a real classifier
 * before any launch. It deliberately errs toward blocking. Applied to user input,
 * model output, and memory-extraction candidates.
 */
const MINOR_SIGNALS: RegExp[] = [
  /\b(child|children|kid|kids|minor|minors|underage|under[\s-]?18|preteen|pre[\s-]?teen|toddler|infant|loli|shota)\b/i,
  /\b(1[0-7]|[1-9])\s*(years?\s*old|yo|y\/o)\b/i,
  /\b(school\s?girl|schoolgirl|elementary|kindergarten|middle\s?school|grade\s?school)\b/i,
];

export function screen(text: string): { blocked: boolean; reason?: string } {
  for (const re of MINOR_SIGNALS) {
    if (re.test(text)) return { blocked: true, reason: "safety_minor" };
  }
  return { blocked: false };
}
