"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar } from "./Avatar";
import { ImageLightbox } from "./ImageLightbox";

/**
 * Shows a character's generated portrait over the deterministic gradient Avatar.
 * The gradient always renders underneath; the image is layered on top and only
 * revealed once it actually loads. If there's no portrait (404), the image stays
 * hidden and the gradient shows through - so a missing image never flashes a
 * broken-image icon, even when the 404 happens before React hydrates.
 *
 * Pass `enlargeable` to let a click open the portrait full-size in a lightbox -
 * only where that's wanted (a profile header), not on small list/card avatars
 * that are already navigation links.
 */
export function CharacterAvatar({
  characterId,
  name,
  size,
  version,
  enlargeable = false,
}: {
  characterId?: string;
  name: string;
  size: number;
  version?: string | number;
  enlargeable?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
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
  const clickable = enlargeable && showImg && loaded;
  const src = `/api/characters/${characterId}/image${version != null ? `?v=${version}` : ""}`;

  return (
    <>
      <div
        style={{ position: "relative", width: size, height: size, flexShrink: 0, display: "inline-block", lineHeight: 0, cursor: clickable ? "zoom-in" : undefined }}
        onClick={clickable ? () => setOpen(true) : undefined}
        role={clickable ? "button" : undefined}
        aria-label={clickable ? `View ${name}'s portrait full-size` : undefined}
      >
        <Avatar name={name} size={size} />
        {showImg ? (
          <img
            ref={ref}
            src={src}
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
      {open ? <ImageLightbox src={src} alt={name} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
