export const COMPANION_GENDER_OPTIONS = [
  { value: "female", label: "Women" },
  { value: "male", label: "Men" },
  { value: "non-binary", label: "Non-binary people" },
] as const;

export type CompanionGender = (typeof COMPANION_GENDER_OPTIONS)[number]["value"];

export const PROFILE_GENDER_OPTIONS = [
  { value: "woman", label: "Woman" },
  { value: "man", label: "Man" },
  { value: "non-binary", label: "Non-binary" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
] as const;

export type ProfileGender = (typeof PROFILE_GENDER_OPTIONS)[number]["value"];

export function normalizeCompanionGender(value: unknown): CompanionGender | null {
  const normalized = String(value ?? "").trim().toLowerCase().replace(/[ _]/g, "-");
  if (["female", "woman", "girl"].includes(normalized)) return "female";
  if (["male", "man", "boy"].includes(normalized)) return "male";
  if (["non-binary", "nonbinary", "nb"].includes(normalized)) return "non-binary";
  return null;
}
