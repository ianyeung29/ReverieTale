const PHOTO_REQUEST = /\b(?:send|share|show|take|post|drop)\b[^.!?]{0,72}\b(?:photo|picture|pic|selfie|snapshot)\b|\b(?:can|could)\s+(?:i|we)\s+(?:see|have)\b[^.!?]{0,44}\b(?:photo|picture|pic|selfie|snapshot)\b|\b(?:send|share|show)\s+me\s+(?:you|urself|yourself)\b/i;

/** A direct, ordinary request for a companion photo. Mature requests are
 * screened by the chat moderation layer before this is ever used. */
export function isPrivatePhotoRequest(text: string): boolean {
  return PHOTO_REQUEST.test(text.trim());
}

export function privatePhotoPrice(): number {
  const configured = Number(process.env.PRIVATE_PHOTO_PRICE || 10);
  return Number.isFinite(configured) ? Math.max(1, Math.floor(configured)) : 10;
}
