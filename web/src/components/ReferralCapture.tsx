"use client";

import { useEffect } from "react";

/** Saves a valid invite code once, so a visitor can explore before signing up. */
export function ReferralCapture() {
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("ref")?.trim().toLowerCase();
    if (code && /^[a-z0-9]{16}$/.test(code)) localStorage.setItem("rv_referral_code", code);
  }, []);
  return null;
}
