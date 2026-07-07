"use client";

import { useState } from "react";

const STAR = "★";

// Star rating. Two modes:
//   - display (no onRate): fractional fill for an average, optional "(count)".
//   - interactive (onRate given): clickable 1-5 with hover preview.
export function StarRating({
  value,
  count,
  onRate,
  size = 16,
  showNumber = true,
}: {
  value: number;
  count?: number;
  onRate?: (v: number) => void;
  size?: number;
  showNumber?: boolean;
}) {
  const [hover, setHover] = useState(0);

  if (onRate) {
    const shown = hover || value || 0;
    return (
      <span style={{ display: "inline-flex" }} onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHover(i)}
            onClick={() => onRate(i)}
            aria-label={`${i} star${i === 1 ? "" : "s"}`}
            style={{
              background: "transparent",
              border: 0,
              cursor: "pointer",
              padding: "0 1px",
              fontSize: size,
              lineHeight: 1,
              color: i <= shown ? "#E9A06B" : "#4a3a50",
              transition: "color .12s ease",
            }}
          >
            {STAR}
          </button>
        ))}
      </span>
    );
  }

  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
      <span style={{ position: "relative", display: "inline-block", fontSize: size, lineHeight: 1, letterSpacing: 1 }}>
        <span style={{ color: "#4a3a50" }}>{STAR + STAR + STAR + STAR + STAR}</span>
        <span style={{ position: "absolute", left: 0, top: 0, overflow: "hidden", width: `${pct}%`, color: "#E9A06B" }}>
          {STAR + STAR + STAR + STAR + STAR}
        </span>
      </span>
      {showNumber ? (
        <span style={{ color: "#AC9CB0", fontSize: Math.max(11, size - 4), fontVariantNumeric: "tabular-nums" }}>
          {count ? `${value.toFixed(1)} (${count})` : "no ratings yet"}
        </span>
      ) : null}
    </span>
  );
}
