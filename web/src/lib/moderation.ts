/**
 * Minimal safety gate for the 13+ build. It blocks minor exploitation signals
 * and explicit sexual content before either can enter chat, stories, memory, or
 * image generation.
 * This is a STUB, not the exec-2 pipeline: it must be replaced by a real classifier
 * before any launch. It deliberately errs toward blocking. Applied to user input,
 * model output, and memory-extraction candidates.
 */
const MINOR_SIGNALS: RegExp[] = [
  /\b(child|children|kid|kids|minor|minors|underage|under[\s-]?18|preteen|pre[\s-]?teen|toddler|infant|loli|shota)\b/i,
  /\b(1[0-7]|[1-9])\s*(years?\s*old|yo|y\/o)\b/i,
  /\b(school\s?girl|schoolgirl|elementary|kindergarten|middle\s?school|grade\s?school)\b/i,
];

const EXPLICIT_CONTENT_SIGNALS: RegExp[] = [
  /\b(nude|nudes|naked|nudity|topless|bottomless|undress(?:ed|ing)?|unclothed)\b/i,
  /\b(nsfw|porn|porno|pornographic|hardcore|xxx|hentai)\b/i,
  /\b(genital|genitalia|penis|vagina|vulva|pussy|cock|dick|clit|labia|scrotum|testicles?)\b/i,
  /\b(cum|cumshot|semen|ejaculat\w*|creampie)\b/i,
  /\b(sex act|sexual intercourse|penetrat\w*|blowjob|handjob|fellatio|cunnilingus|masturbat\w*|orgasm)\b/i,
];

export function screen(text: string): { blocked: boolean; reason?: string } {
  for (const re of MINOR_SIGNALS) {
    if (re.test(text)) return { blocked: true, reason: "safety_minor" };
  }
  for (const re of EXPLICIT_CONTENT_SIGNALS) {
    if (re.test(text)) return { blocked: true, reason: "safety_mature" };
  }
  return { blocked: false };
}

// ---------------------------------------------------------------------------
// Image-prompt gate. Run this BEFORE calling the paid image provider so we
// reject generations that the provider would only black out (or that we simply
// don't allow) — saving API credits and giving the user a clear message instead
// of a censored image. Covers the minor-safety bright line plus explicit
// nudity/sex-act requests. Tasteful, suggestive-but-clothed adult prompts pass.
// ---------------------------------------------------------------------------
const EXPLICIT_IMAGE_SIGNALS: RegExp[] = [
  /\b(nude|nudes|naked|nudity|topless|bottomless|undress(?:ed|ing)?|unclothed)\b/i,
  /\b(nsfw|porn|porno|pornographic|hardcore|xxx|hentai)\b/i,
  /\b(genital|genitalia|penis|vagina|vulva|pussy|cock|dick|clit|labia|scrotum|testicles?)\b/i,
  /\b(nipples?|areola|breasts? (?:out|exposed|bare)|bare breasts?|exposed breasts?)\b/i,
  /\b(cum|cumshot|semen|ejaculat\w*|creampie)\b/i,
  /\b(sex act|sexual intercourse|penetrat\w*|blowjob|handjob|fellatio|cunnilingus|masturbat\w*|orgasm)\b/i,
  /\b(spread (?:legs|pussy)|bent over exposed|full frontal)\b/i,
];

// Returns { blocked, reason } for a would-be image prompt. reason is a short,
// user-facing string safe to surface in the UI.
export function screenImagePrompt(text: string): { blocked: boolean; reason?: string } {
  const result = screen(text);
  if (result.blocked && result.reason === "safety_minor") {
    return { blocked: true, reason: "Portraits can't depict or imply minors." };
  }
  if (result.blocked) return { blocked: true, reason: "Keep portraits tasteful - no explicit nudity or sexual content." };
  for (const re of EXPLICIT_IMAGE_SIGNALS) {
    if (re.test(text)) {
      return { blocked: true, reason: "Keep portraits tasteful — no explicit nudity or sexual content." };
    }
  }
  return { blocked: false };
}

// ---------------------------------------------------------------------------
// Hybrid pre-publish moderation for user-created characters.
// Layer 1 (hard filter): the screen() regex above -> instant reject.
// Layer 2 (classifier): an LLM safety pass that auto-approves clearly-fine
// characters, rejects clear violations, and holds anything borderline for a
// human. Fails SAFE: on any error/ambiguity it returns "review", never "approve".
// ---------------------------------------------------------------------------
export type ModDecision = "approve" | "review" | "reject";

const CLASSIFIER_SYSTEM =
  "You are a content-safety reviewer for a 13+ FICTIONAL character and interactive-story platform. " +
  "You are reviewing a user-submitted character description (name, appearance, personality, backstory). " +
  "Friendship, adventure, mystery, fantasy, school-safe romance, and age-appropriate emotional themes are allowed. Explicit sexual content, sexualized characters, and mature sexual framing are not allowed. " +
  "Choose exactly one decision:\n" +
  '- "reject": the character is sexualized or described for explicit sexual roleplay; OR exploits or endangers a minor; OR impersonates a real, identifiable person (celebrity or private individual); OR centers on illegal activity, real-world non-consensual harm, or hateful dehumanization of a protected group.\n' +
  '- "review": anything uncertain or borderline a human should double-check (ambiguous age, a possible real-person reference, edgy-but-unclear content).\n' +
  '- "approve": clearly an adult, fictional, non-violating character.\n' +
  'When in doubt, prefer "review" over "approve". Respond with STRICT JSON only: {"decision":"approve|review|reject","reason":"one short sentence"}.';

export async function moderateContent(text: string): Promise<{ decision: ModDecision; reason: string }> {
  // Layer 1: hard bright-line filter.
  if (screen(text).blocked) {
    return { decision: "reject", reason: "Blocked by the 13+ safety filter." };
  }

  // Layer 2: LLM classifier. Imported lazily to avoid any import-cycle surprises.
  try {
    const { chat } = await import("./model");
    const res = await chat(
      [
        { role: "system", content: CLASSIFIER_SYSTEM },
        { role: "user", content: text.slice(0, 4000) },
      ],
      { temperature: 0, maxTokens: 200 },
    );
    const json = res.text.match(/\{[\s\S]*\}/)?.[0];
    if (!json) return { decision: "review", reason: "Automated review was inconclusive; held for a human." };
    const parsed = JSON.parse(json) as { decision?: string; reason?: string };
    const decision: ModDecision =
      parsed.decision === "approve" || parsed.decision === "reject" ? parsed.decision : "review";
    const reason = typeof parsed.reason === "string" && parsed.reason.trim() ? parsed.reason.trim() : "No reason given.";
    return { decision, reason };
  } catch {
    // Fail safe: never auto-publish on an error - hold for manual review.
    return { decision: "review", reason: "Automated review unavailable; held for a human." };
  }
}
