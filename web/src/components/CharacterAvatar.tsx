"use client";

import { useState } from "react";
import { Avatar } from "./Avatar";

/**
 * Shows a character's generated portrait, falling back to the deterministic
 * gradient Avatar when there's no image (the <img> 404s and onError swaps in).
 */
export function CharacterAvatar({
  characterId,
  name,
  size,
  version,
}: {
  characterId?: string;
  name: string;
  size: number;
  version?: string | number;
}) {
  const [failed, setFailed] = useState(false);
  if (!characterId || failed) return <Avatar name={name} size={size} />;

  const src = `/api/characters/${characterId}/image${version != null ? `?v=${version}` : ""}`;
  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", display: "block", background: "#231A2B", flexShrink: 0 }}
      onError={() => setFailed(true)}
    />
  );
}
