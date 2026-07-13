"use client";

import { useEffect } from "react";

/** Full-screen preview overlay for a portrait/scene image. Esc or click-away closes it. */
export function ImageLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div style={S.overlay} onClick={onClose}>
      <button type="button" style={S.close} onClick={onClose} aria-label="Close">×</button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} style={S.img} onClick={(e) => e.stopPropagation()} />
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  overlay: { position: "fixed", inset: 0, zIndex: 100, background: "rgba(10,7,13,.88)", display: "grid", placeItems: "center", padding: 24, cursor: "zoom-out" },
  img: { maxWidth: "min(560px, 92vw)", maxHeight: "86vh", borderRadius: 16, boxShadow: "0 30px 80px rgba(0,0,0,.6)", cursor: "default", display: "block" },
  close: {
    position: "fixed", top: 18, right: 22, zIndex: 101, background: "rgba(35,26,43,.7)", color: "#F4EAF0",
    border: "1px solid #4a3a50", borderRadius: "50%", width: 38, height: 38, fontSize: 20, cursor: "pointer",
    lineHeight: 1, backdropFilter: "blur(6px)",
  },
};
