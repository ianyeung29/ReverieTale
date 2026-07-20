"use client";

import { useEffect } from "react";
import { type AnalyticsEventName, trackAnalyticsEvent, trackAnalyticsEventOncePerSession } from "@/lib/analytics";

export function AnalyticsEvent({ name, oncePerSession = false }: { name: AnalyticsEventName; oncePerSession?: boolean }) {
  useEffect(() => {
    if (oncePerSession) trackAnalyticsEventOncePerSession(name);
    else trackAnalyticsEvent(name);
  }, [name, oncePerSession]);

  return null;
}
