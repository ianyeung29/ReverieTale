import { createHash, randomBytes } from "crypto";

/** A random token for an emailed link, plus the hash of it we store server-side. */
export function newVerificationToken(): { raw: string; hash: string } {
  const raw = randomBytes(32).toString("hex");
  return { raw, hash: hashVerificationToken(raw) };
}

export function hashVerificationToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}
