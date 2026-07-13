// Single source of truth for the facts referenced across every legal page.
// Reverie is currently operated by an individual (no separate registered
// company), so these are placeholders/facts to keep in sync by hand rather
// than pulled from a business registry - update here and every page picks
// it up.
export const OPERATOR_NAME = "Reverie";
export const SUPPORT_EMAIL = "asmrforall1999@gmail.com";
export const GOVERNING_LAW = "the State of New York, United States";
export const LAST_REVISED = "July 8, 2026";

// Minimum age to USE Reverie (App Store review, age gate, legal docs). This is
// deliberately separate from the minimum age a fictional COMPANION must be
// (always 18, enforced in the character schema/moderation prompts) - those
// are two different rules and changing this one must never touch that one.
// Bump back to 18 here (one line) if this ever becomes a distribution
// distinct from the App Store build.
export const MIN_AGE = 17;
