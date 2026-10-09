import {
  EventType,
  SHARE_LINK_PARAM,
  type CollectContext,
  type CollectEvent,
} from "@relwick/shared";
import { startActivity, resetPageMetrics } from "./activity";
import { startClickTracking } from "./clicks";
import {
  getCurrentPageViewId,
  getSessionState,
  getTrackingIds,
  getVisitorId,
  newPageViewId,
  touchSessionActivity,
} from "./ids";
import { configureQueue, enqueue, flush, startQueue, stopQueue } from "./queue";
import { startSectionTracking } from "./sections";

let initialized = false;
const cleanups: Array<() => void> = [];

function readUtm(): CollectContext["utm"] {
  const params = new URLSearchParams(window.location.search);
  const pick = (k: string) => params.get(k) || null;
  return {
    source: pick("utm_source"),
    medium: pick("utm_medium"),
    campaign: pick("utm_campaign"),
    term: pick("utm_term"),
    content: pick("utm_content"),
  };
}

function readShareLink(): string | null {
  const v = new URLSearchParams(window.location.search).get(SHARE_LINK_PARAM);
  if (!v) return null;
  return /^[A-Za-z0-9_-]{4,16}$/.test(v) ? v : null;
}

function buildContext(isNewSession: boolean): CollectContext {
  return {
    isNewSession,
    landingPath: window.location.pathname,
    referrer: document.referrer || "",
    utm: readUtm(),
    shareLink: readShareLink(),
    screen: { w: window.screen.width, h: window.screen.height },
    viewport: { w: window.innerWidth, h: window.innerHeight },
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

function shouldDisable(): boolean {
  if (typeof window === "undefined") return true;
  if (window.location.pathname.startsWith("/admin")) return true;
  if (navigator.webdriver) return true;
  try {
    if (document.cookie.includes("rw_ignore=1")) return true;
  } catch {
    return true;
  }
  return false;
}

export function initTracker(): void {
  if (initialized || shouldDisable()) return;
  initialized = true;

  const visitorId = getVisitorId();
  const { sessionId, isNewSession } = getSessionState();
  configureQueue({
    visitorId,
    sessionId,
    context: buildContext(isNewSession),
  });

  startQueue();
  cleanups.push(startActivity());
  cleanups.push(startClickTracking());
  cleanups.push(startSectionTracking());
}

export function destroyTracker(): void {
  cleanups.splice(0).forEach((fn) => fn());
  stopQueue();
  initialized = false;
}

export function trackPageView(path: string, title: string): void {
  if (shouldDisable()) return;
  if (!initialized) initTracker();
  newPageViewId();
  resetPageMetrics();
  touchSessionActivity();
  enqueue({
    type: EventType.PAGEVIEW,
    pageViewId: getCurrentPageViewId(),
    path,
    title,
    ts: Date.now(),
  });
}

export function track(
  type: EventType | keyof typeof EventType,
  data: Partial<CollectEvent> = {},
): void {
  if (shouldDisable()) return;
  if (!initialized) initTracker();
  enqueue({
    type,
    pageViewId: getCurrentPageViewId(),
    ts: Date.now(),
    ...data,
  });
}

export { getTrackingIds, flush };
