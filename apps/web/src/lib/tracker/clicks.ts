import { EventType } from "@relwick/shared";
import { enqueue } from "./queue";
import { getCurrentPageViewId } from "./ids";

const TRACKABLE = "a,button,[role=button],[data-track]";

function slug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 40);
}

function nearestSection(el: Element | null): string | undefined {
  let node: Element | null = el;
  while (node) {
    const section = node.getAttribute("data-section");
    if (section) return section;
    node = node.parentElement;
  }
  return undefined;
}

function visibleLabel(el: HTMLElement): string {
  const aria = el.getAttribute("aria-label");
  if (aria) return aria.slice(0, 80);
  const text = (el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();
  return text.slice(0, 80);
}

function trackName(el: HTMLElement): string {
  const dt = el.getAttribute("data-track");
  if (dt) return dt;
  const id = el.id;
  if (id) return id;
  return `${el.tagName.toLowerCase()}_${slug(visibleLabel(el) || "element")}`;
}

function contactChannel(href: string): string | undefined {
  if (href.startsWith("tel:")) return "tel";
  if (href.startsWith("mailto:")) return "email";
  if (href.includes("wa.me") || href.includes("whatsapp")) return "whatsapp";
  return undefined;
}

export function startClickTracking(): () => void {
  const handler = (e: MouseEvent) => {
    const target = e.target as Element | null;
    if (!target) return;
    const el = target.closest(TRACKABLE) as HTMLElement | null;
    if (!el) return;

    const name = trackName(el);
    const label =
      el.getAttribute("data-track-label") || visibleLabel(el) || name;
    const section = nearestSection(el);
    const href =
      el instanceof HTMLAnchorElement
        ? el.href
        : el.getAttribute("href") || undefined;
    const rect = document.documentElement.getBoundingClientRect();
    const xPct = e.clientX / window.innerWidth;
    const yPx = Math.round(window.scrollY + e.clientY);

    let type: EventType = EventType.CLICK;
    if (el.hasAttribute("data-track-cta")) {
      type = EventType.CTA_CLICK;
    } else if (href) {
      const channel = contactChannel(href);
      if (channel) {
        type = EventType.CONTACT_CLICK;
        enqueue({
          type,
          pageViewId: getCurrentPageViewId(),
          name,
          label,
          section,
          href,
          xPct,
          yPx,
          meta: { channel },
          ts: Date.now(),
        });
        return;
      }
      try {
        const url = new URL(href, window.location.origin);
        if (url.hostname && url.hostname !== window.location.hostname) {
          type = EventType.OUTBOUND_CLICK;
        }
      } catch {
        /* ignore */
      }
    }

    enqueue({
      type,
      pageViewId: getCurrentPageViewId(),
      name,
      label,
      section,
      href,
      xPct,
      yPx,
      ts: Date.now(),
    });
  };

  document.addEventListener("click", handler, true);
  return () => document.removeEventListener("click", handler, true);
}
