const VISITOR_COOKIE = "rw_vid";
const SESSION_KEY = "rw_sid";
const SESSION_ACTIVITY_KEY = "rw_sid_ts";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

function safeGetCookie(name: string): string | null {
  try {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

function safeSetCookie(name: string, value: string, maxAgeSec: number): void {
  try {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAgeSec}; Path=/; SameSite=Lax${secure}`;
  } catch {
    /* ignore */
  }
}

function uuidV4(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function lubumbashiDayKey(d = new Date()): string {
  return new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Africa/Lubumbashi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export function getVisitorId(): string {
  let id = safeGetCookie(VISITOR_COOKIE);
  if (!id) {
    id = uuidV4();
    safeSetCookie(VISITOR_COOKIE, id, 60 * 60 * 24 * 395);
  }
  return id;
}

export function getSessionState(): { sessionId: string; isNewSession: boolean } {
  let isNewSession = false;
  let sessionId: string | null = null;
  let lastTs = 0;
  let dayKey = "";

  try {
    sessionId = sessionStorage.getItem(SESSION_KEY);
    lastTs = Number(sessionStorage.getItem(SESSION_ACTIVITY_KEY) ?? "0");
    dayKey = sessionStorage.getItem("rw_sid_day") ?? "";
  } catch {
    sessionId = null;
  }

  const now = Date.now();
  const today = lubumbashiDayKey();

  if (
    !sessionId ||
    !lastTs ||
    now - lastTs > SESSION_TIMEOUT_MS ||
    dayKey !== today
  ) {
    sessionId = uuidV4();
    isNewSession = true;
    try {
      sessionStorage.setItem(SESSION_KEY, sessionId);
      sessionStorage.setItem("rw_sid_day", today);
    } catch {
      /* ignore */
    }
  }

  touchSessionActivity();
  return { sessionId, isNewSession };
}

export function touchSessionActivity(): void {
  try {
    sessionStorage.setItem(SESSION_ACTIVITY_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

let currentPageViewId = "";

export function newPageViewId(): string {
  currentPageViewId = uuidV4();
  return currentPageViewId;
}

export function getCurrentPageViewId(): string {
  if (!currentPageViewId) currentPageViewId = uuidV4();
  return currentPageViewId;
}

export function getTrackingIds(): { visitorId: string; sessionId: string } | null {
  if (typeof document === "undefined") return null;
  if (safeGetCookie("rw_ignore") === "1") return null;
  const { sessionId } = getSessionState();
  return { visitorId: getVisitorId(), sessionId };
}
