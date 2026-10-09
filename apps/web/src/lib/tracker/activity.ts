import { EventType } from "@relwick/shared";
import { enqueue } from "./queue";
import { getCurrentPageViewId, touchSessionActivity } from "./ids";

const HEARTBEAT_MS = 15000;
const INTERACTION_WINDOW_MS = 30000;

let tabVisible = true;
let lastInteraction = 0;
let maxScrollPct = 0;
const scrollMarks = new Set<number>();
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

function markInteraction(): void {
  lastInteraction = Date.now();
  touchSessionActivity();
}

function computeScrollPct(): number {
  const doc = document.documentElement;
  const scrollTop = window.scrollY || doc.scrollTop;
  const height = doc.scrollHeight - window.innerHeight;
  if (height <= 0) return 100;
  return Math.min(100, Math.round((scrollTop / height) * 100));
}

function onScroll(): void {
  markInteraction();
  const pct = computeScrollPct();
  if (pct > maxScrollPct) maxScrollPct = pct;
  for (const mark of [25, 50, 75, 90, 100]) {
    if (pct >= mark && !scrollMarks.has(mark)) {
      scrollMarks.add(mark);
      enqueue({
        type: EventType.SCROLL_DEPTH,
        pageViewId: getCurrentPageViewId(),
        value: mark,
        ts: Date.now(),
      });
    }
  }
}

function tickHeartbeat(): void {
  if (!tabVisible) return;
  const active =
    Date.now() - lastInteraction <= INTERACTION_WINDOW_MS && tabVisible;
  if (!active) return;
  enqueue({
    type: EventType.HEARTBEAT,
    pageViewId: getCurrentPageViewId(),
    activeSeconds: 15,
    maxScrollPct,
    ts: Date.now(),
  });
}

export function startActivity(): () => void {
  const onVis = () => {
    tabVisible = document.visibilityState === "visible";
    if (tabVisible) markInteraction();
  };
  document.addEventListener("visibilitychange", onVis);
  window.addEventListener("scroll", onScroll, { passive: true });
  ["mousemove", "keydown", "touchstart", "click"].forEach((ev) => {
    window.addEventListener(ev, markInteraction, { passive: true });
  });
  heartbeatTimer = setInterval(tickHeartbeat, HEARTBEAT_MS);
  onScroll();

  return () => {
    document.removeEventListener("visibilitychange", onVis);
    window.removeEventListener("scroll", onScroll);
    if (heartbeatTimer) clearInterval(heartbeatTimer);
  };
}

export function resetPageMetrics(): void {
  maxScrollPct = 0;
  scrollMarks.clear();
  markInteraction();
}

export function getMaxScrollPct(): number {
  return maxScrollPct;
}
