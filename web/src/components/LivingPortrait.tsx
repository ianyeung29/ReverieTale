"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  characterId: string;
  name: string;
  activeVideoId: string | null;
  canRender: boolean;
};

type RenderState = "idle" | "starting" | "waiting" | "ready" | "failed";

export function LivingPortrait({ characterId, name, activeVideoId, canRender }: Props) {
  const router = useRouter();
  const pollRef = useRef<number | null>(null);
  const [state, setState] = useState<RenderState>(activeVideoId ? "ready" : "idle");
  const [videoId, setVideoId] = useState(activeVideoId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => { if (pollRef.current) window.clearTimeout(pollRef.current); }, []);

  async function poll(renderId: string) {
    try {
      const response = await fetch(`/api/characters/${characterId}/living-portrait?renderId=${renderId}`, { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to check portrait motion");
      if (data.status === "ready") {
        setVideoId(renderId);
        setState("ready");
        router.refresh();
        return;
      }
      if (data.status === "failed") throw new Error(data.error || "The portrait motion could not be completed");
      pollRef.current = window.setTimeout(() => { void poll(renderId); }, 3500);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The portrait motion could not be completed");
      setState("failed");
    }
  }

  async function bringToLife() {
    if (!canRender || state === "starting" || state === "waiting") return;
    setError(null);
    setState("starting");
    try {
      const response = await fetch(`/api/characters/${characterId}/living-portrait`, { method: "POST" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to start portrait motion");
      setState("waiting");
      pollRef.current = window.setTimeout(() => { void poll(data.id); }, Number(data.pollAfterMs) || 3000);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to start portrait motion");
      setState("failed");
    }
  }

  const videoUrl = videoId ? `/api/living-portraits/${videoId}/video` : null;
  return (
    <div style={S.wrap}>
      {videoUrl ? (
        <video style={S.video} src={videoUrl} autoPlay loop muted playsInline poster={`/api/characters/${characterId}/image`} aria-label={`${name}'s living portrait`} />
      ) : (
        <img style={S.image} src={`/api/characters/${characterId}/image`} alt={name} />
      )}
      {videoUrl ? <span style={S.live}>Living portrait</span> : null}
      {!videoUrl && canRender ? <button type="button" onClick={bringToLife} disabled={state === "starting" || state === "waiting"} style={{ ...S.button, opacity: state === "starting" || state === "waiting" ? 0.7 : 1 }}>
        {state === "starting" ? "Starting..." : state === "waiting" ? "Bringing to life..." : "Bring to life"}
      </button> : null}
      {!videoUrl && !canRender ? <a href="/login" style={S.signIn}>Sign in to bring to life</a> : null}
      {state === "waiting" ? <span style={S.note}>This may take a minute.</span> : null}
      {error ? <span role="status" style={S.error}>{error}</span> : null}
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { position: "relative", width: "100%", display: "flex", flexDirection: "column", alignItems: "stretch", gap: 7 },
  image: { display: "block", width: "100%", aspectRatio: "3 / 4", objectFit: "cover", borderRadius: 14, border: "1px solid rgba(255,255,255,.16)", background: "#241B2D" },
  video: { display: "block", width: "100%", aspectRatio: "3 / 4", objectFit: "cover", borderRadius: 14, border: "1px solid rgba(233,160,107,.52)", background: "#241B2D" },
  live: { position: "absolute", top: 9, left: 9, borderRadius: 999, background: "rgba(20,14,25,.76)", color: "#F4EAF0", fontSize: 10.5, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", padding: "5px 8px" },
  button: { border: "1px solid #E9A06B", background: "rgba(36,27,45,.88)", color: "#F5B277", borderRadius: 8, padding: "8px 9px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" },
  signIn: { color: "#E9A06B", fontSize: 12, textAlign: "center", textDecoration: "none" },
  note: { color: "#AC9CB0", fontSize: 11.5, textAlign: "center" },
  error: { color: "#F0A9B0", fontSize: 11.5, textAlign: "center", lineHeight: 1.35 },
};
