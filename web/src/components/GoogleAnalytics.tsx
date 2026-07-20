"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { flushAnalyticsEvents, trackAnalyticsEvent, trackAnalyticsEventOncePerSession, trackReturnVisit } from "@/lib/analytics";

const CONSENT_KEY = "rv_analytics_consent";
const PUBLIC_PATHS = ["/", "/browse", "/stories", "/story", "/guidelines", "/legal"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.includes(pathname) || ["/c/", "/story/", "/tag/", "/creator/"].some((prefix) => pathname.startsWith(prefix));
}

export function GoogleAnalytics({ measurementId }: { measurementId?: string }) {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      const granted = localStorage.getItem(CONSENT_KEY) === "granted";
      setEnabled(granted);
      if (!granted) window.__rvAnalyticsReady = false;
    };
    sync();
    window.addEventListener("rv-analytics-consent", sync);
    return () => window.removeEventListener("rv-analytics-consent", sync);
  }, []);

  useEffect(() => {
    if (!measurementId || !enabled) return;

    window.dataLayer = window.dataLayer ?? [];
    // Google reads the Arguments objects created by its documented gtag shim.
    window.gtag = function gtag() { window.dataLayer?.push(arguments); };
    const selector = `script[data-rv-ga="${measurementId}"]`;
    let script = document.querySelector<HTMLScriptElement>(selector);

    const markReady = () => {
      window.__rvAnalyticsReady = true;
      setScriptReady(true);
      flushAnalyticsEvents();
    };

    if (script?.dataset.rvGaLoaded === "true") {
      markReady();
      return;
    }

    if (script) {
      script.addEventListener("load", markReady, { once: true });
      return () => script?.removeEventListener("load", markReady);
    }

    window.gtag("js", new Date());
    window.gtag("config", measurementId, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });

    script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    script.dataset.rvGa = measurementId;
    script.addEventListener("load", () => {
      if (script) script.dataset.rvGaLoaded = "true";
      markReady();
    }, { once: true });
    document.head.appendChild(script);
  }, [enabled, measurementId]);

  useEffect(() => {
    if (!measurementId || !enabled || !scriptReady || !isPublicPath(pathname)) return;
    window.gtag?.("event", "page_view", { page_path: pathname, page_location: `${window.location.origin}${pathname}` });
    if (pathname === "/") {
      trackAnalyticsEvent("landing_view");
    }
    trackReturnVisit();
  }, [enabled, measurementId, pathname, scriptReady]);

  useEffect(() => {
    if (!measurementId || !enabled || !scriptReady) return;
    const query = new URLSearchParams(window.location.search);
    if (query.get("signup") !== "complete") return;
    trackAnalyticsEventOncePerSession("signup_completed");
    query.delete("signup");
    const suffix = query.toString();
    window.history.replaceState({}, "", `${window.location.pathname}${suffix ? `?${suffix}` : ""}`);
  }, [enabled, measurementId, scriptReady]);

  return null;
}
