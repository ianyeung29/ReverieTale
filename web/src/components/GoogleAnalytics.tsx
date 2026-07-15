"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const CONSENT_KEY = "rv_analytics_consent";
const PUBLIC_PATHS = ["/", "/browse", "/stories", "/guidelines", "/legal"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.includes(pathname) || ["/c/", "/story/", "/tag/", "/creator/"].some((prefix) => pathname.startsWith(prefix));
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function GoogleAnalytics({ measurementId }: { measurementId?: string }) {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const sync = () => setEnabled(localStorage.getItem(CONSENT_KEY) === "granted");
    sync();
    window.addEventListener("rv-analytics-consent", sync);
    return () => window.removeEventListener("rv-analytics-consent", sync);
  }, []);

  useEffect(() => {
    if (!measurementId || !enabled || document.querySelector(`script[data-rv-ga="${measurementId}"]`)) return;

    window.dataLayer = window.dataLayer ?? [];
    window.gtag = (...args: unknown[]) => { window.dataLayer?.push(args); };
    window.gtag("js", new Date());
    window.gtag("config", measurementId, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    script.dataset.rvGa = measurementId;
    document.head.appendChild(script);
  }, [enabled, measurementId]);

  useEffect(() => {
    if (!measurementId || !enabled || !isPublicPath(pathname)) return;
    window.gtag?.("event", "page_view", { page_path: pathname, page_location: `${window.location.origin}${pathname}` });
  }, [enabled, measurementId, pathname]);

  return null;
}
