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
  size = 40,
  version,
  enlargeable = false,
  shape = "circle",
}: {
  characterId?: string;
  name: string;
  // Only meaningful in "circle" mode; "rect" always fills its container width.
  size?: number;
  version?: string | number;
  enlargeable?: boolean;
  // "rect" renders a portrait-aspect (4:5) card-filling image instead of a small
  // circle - same load/fail handling, just a different frame for a bigger, more
  // "this is a real character" presentation on cards and profile heroes.
  shape?: "circle" | "rect";
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
  const rect = shape === "rect";

  // Same hash-based gradient as Avatar, reshaped into a rect fallback panel
  // (Avatar itself is fixed to a circle, so rect mode needs its own fallback).
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360;
  const h2 = (h + 40) % 360;

  return (
    <>
      <div
        style={
          rect
            ? { position: "relative", width: "100%", aspectRatio: "4 / 5", flexShrink: 0, overflow: "hidden", borderRadius: 14, cursor: clickable ? "zoom-in" : undefined }
            : { position: "relative", width: size, height: size, flexShrink: 0, display: "inline-block", lineHeight: 0, cursor: clickable ? "zoom-in" : undefined }
        }
        onClick={clickable ? () => setOpen(true) : undefined}
        role={clickable ? "button" : undefined}
        aria-label={clickable ? `View ${name}'s portrait full-size` : undefined}
      >
        {rect ? (
          <div aria-hidden style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: `linear-gradient(135deg, hsl(${h} 70% 64%), hsl(${h2} 62% 54%))`, color: "#1A1220", fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 56 }}>
            {name.charAt(0).toUpperCase()}
          </div>
        ) : (
          <Avatar name={name} size={size} />
        )}
        {showImg ? (
          <img
            ref={ref}
            src={src}
            alt=""
            {...(rect ? {} : { width: size, height: size })}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              borderRadius: rect ? 14 : "50%",
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
