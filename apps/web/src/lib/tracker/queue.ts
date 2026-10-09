import type { CollectContext, CollectEvent, CollectPayload } from "@relwick/shared";
import { getApiUrl } from "../api";

const FLUSH_MS = 5000;
const MAX_BATCH = 20;

let visitorId = "";
let sessionId = "";
let context: CollectContext | undefined;
let contextSent = false;
const queue: CollectEvent[] = [];
let timer: ReturnType<typeof setInterval> | null = null;

function sendPayload(payload: CollectPayload): void {
  const url = `${getApiUrl()}/v1/collect`;
  const json = JSON.stringify(payload);
  try {
    if (navigator.sendBeacon) {
      const ok = navigator.sendBeacon(url, new Blob([json], { type: "text/plain" }));
      if (ok) return;
    }
  } catch {
    /* fallback */
  }
  void fetch(url, {
    method: "POST",
    body: json,
    keepalive: true,
    headers: { "Content-Type": "text/plain" },
  }).catch(() => undefined);
}

export function configureQueue(ids: {
  visitorId: string;
  sessionId: string;
  context?: CollectContext;
}): void {
  visitorId = ids.visitorId;
  sessionId = ids.sessionId;
  if (ids.context) {
    context = ids.context;
    contextSent = false;
  }
}

export function enqueue(event: CollectEvent): void {
  queue.push(event);
  if (queue.length >= MAX_BATCH) flush();
}

export function flush(): void {
  if (!visitorId || !sessionId || queue.length === 0) return;
  const events = queue.splice(0, MAX_BATCH);
  const payload: CollectPayload = {
    v: 1,
    visitorId,
    sessionId,
    events,
  };
  if (!contextSent && context) {
    payload.context = context;
    contextSent = true;
  }
  sendPayload(payload);
  if (queue.length > 0) flush();
}

export function startQueue(): void {
  if (timer) return;
  timer = setInterval(flush, FLUSH_MS);
  const onHide = () => flush();
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") onHide();
  });
  window.addEventListener("pagehide", onHide);
}

export function stopQueue(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  flush();
}
