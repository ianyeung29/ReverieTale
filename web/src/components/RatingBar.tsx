"use client";

import { useState } from "react";
import { StarRating } from "./StarRating";

// Average rating + (when allowed) an interactive row to submit/update your own.
// Optimistic: reflects your click immediately, then reconciles with the server.
export function RatingBar({
  targetType,
  targetId,
  average,
  count,
  mine,
  canRate,
  label = "Rate this",
  showAverage = true,
}: {
  targetType: "character" | "story";
  targetId: string;
  average: number;
  count: number;
  mine: number | null;
  canRate: boolean;
  label?: string;
  showAverage?: boolean;
}) {
  const [avg, setAvg] = useState(average);
  const [cnt, setCnt] = useState(count);
  const [my, setMy] = useState<number | null>(mine);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function rate(v: number) {
    if (busy) return;
    setBusy(true);
    setErr("");
    const prev = my;
    setMy(v); // optimistic
    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId, rating: v }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) {
        setAvg(d.average ?? avg);
        setCnt(d.count ?? cnt);
        setMy(d.mine ?? v);
      } else {
        setMy(prev);
        setErr(res.status === 403 ? "You can't rate your own work." : res.status === 401 ? "Sign in to rate." : "Couldn't save your rating.");
      }
    } catch {
      setMy(prev);
      setErr("Network error while saving your rating.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {showAverage ? <StarRating value={avg} count={cnt} size={17} /> : null}
      {canRate ? (
        <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
          <span style={{ color: "#8A7A90", fontSize: 12.5, letterSpacing: ".02em" }}>{my ? "Your rating" : label}</span>
          <StarRating value={my ?? 0} onRate={rate} size={22} />
          {err ? <span style={{ color: "#E88", fontSize: 12.5 }}>{err}</span> : null}
        </div>
      ) : null}
    </div>
  );
}
