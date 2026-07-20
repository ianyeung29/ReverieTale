"use client";

const CONSENT_KEY = "rv_analytics_consent";
const PENDING_EVENTS_KEY = "rv_analytics_pending_events";

export type AnalyticsEventName =
  | "landing_view"
  | "character_view"
  | "scene_started"
  | "chat_started"
  | "first_user_message"
  | "signup_completed"
  | "checkout_started"
  | "credit_purchase"
  | "returned_next_day";

type AnalyticsEvent = { name: AnalyticsEventName; params?: Record<string, string | number | boolean> };

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __rvAnalyticsReady?: boolean;
  }
}

function analyticsAllowed(): boolean {
  return typeof window !== "undefined" && window.localStorage.getItem(CONSENT_KEY) === "granted";
}

function pendingEvents(): AnalyticsEvent[] {
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(PENDING_EVENTS_KEY) || "[]") as unknown;
    return Array.isArray(parsed) ? parsed.filter((event): event is AnalyticsEvent => Boolean(event && typeof event === "object" && "name" in event)) : [];
  } catch {
    return [];
  }
}

function queue(event: AnalyticsEvent) {
  try {
    const events = pendingEvents();
    events.push(event);
    window.sessionStorage.setItem(PENDING_EVENTS_KEY, JSON.stringify(events.slice(-20)));
  } catch {
    // Analytics must never affect the product flow if storage is unavailable.
  }
}

function send(event: AnalyticsEvent) {
  window.gtag?.("event", event.name, event.params);
}

/**
 * Sends only aggregate product-flow events after the visitor has opted in.
 * Never put user text, account data, payment data, or query strings in params.
 */
export function trackAnalyticsEvent(name: AnalyticsEventName, params?: AnalyticsEvent["params"]) {
  if (!analyticsAllowed()) return;
  const event = { name, ...(params ? { params } : {}) };
  if (window.__rvAnalyticsReady && window.gtag) send(event);
  else queue(event);
}

export function trackAnalyticsEventOncePerSession(name: AnalyticsEventName, params?: AnalyticsEvent["params"]) {
  if (!analyticsAllowed()) return;
  const key = `rv_analytics_once:${name}`;
  try {
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, "1");
  } catch {
    // Continue without deduplication if session storage is blocked.
  }
  trackAnalyticsEvent(name, params);
}

export function flushAnalyticsEvents() {
  if (!analyticsAllowed() || !window.__rvAnalyticsReady || !window.gtag) return;
  const events = pendingEvents();
  try {
    window.sessionStorage.removeItem(PENDING_EVENTS_KEY);
  } catch {
    // A duplicate analytics event is preferable to blocking the app.
  }
  events.forEach(send);
}

export function trackReturnVisit() {
  if (!analyticsAllowed()) return;
  const key = "rv_analytics_visit_day";
  const today = new Date().toISOString().slice(0, 10);
  try {
    const previous = window.localStorage.getItem(key);
    if (previous) {
      const elapsedDays = Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${previous}T00:00:00Z`)) / 86_400_000);
      if (elapsedDays === 1) trackAnalyticsEventOncePerSession("returned_next_day");
    }
    window.localStorage.setItem(key, today);
  } catch {
    // Return tracking is optional and must not disturb normal browsing.
  }
}
