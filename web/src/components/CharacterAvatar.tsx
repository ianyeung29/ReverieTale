"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar } from "./Avatar";

/**
 * Shows a character's generated portrait over the deterministic gradient Avatar.
 * The gradient always renders underneath; the image is layered on top and only
 * revealed once it actually loads. If there's no portrait (404), the image stays
 * hidden and the gradient shows through - so a missing image never flashes a
 * broken-image icon, even when the 404 happens before React hydrates.
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
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // Catch loads/errors that resolved before hydration (onLoad/onError would miss them).
  useEffect(() => {
    setLoaded(false);
    setFailed(false);
    const img = ref.current;
    if (img && img.complete) {
      if (img.naturalWidth > 0) setLoaded(true);
      else setFailed(true);
    }
  }, [characterId, version]);

  const showImg = Boolean(characterId) && !failed;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0, display: "inline-block", lineHeight: 0 }}>
      <Avatar name={name} size={size} />
      {showImg ? (
        <img
          ref={ref}
          src={`/api/characters/${characterId}/image${version != null ? `?v=${version}` : ""}`}
          alt=""
          width={size}
          height={size}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          style={{
            position: "absolute",
            inset: 0,
            width: size,
            height: size,
            borderRadius: "50%",
            objectFit: "cover",
            opacity: loaded ? 1 : 0,
            transition: "opacity .15s ease",
          }}
        />
      ) : null}
    </div>
  );
}
