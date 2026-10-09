import { EventType } from "@relwick/shared";
import { enqueue, flush } from "./queue";
import { getCurrentPageViewId } from "./ids";

interface SectionState {
  visibleSince: number | null;
  accumulatedMs: number;
}

const states = new Map<string, SectionState>();

function emitSectionView(section: string, ms: number): void {
  if (ms < 1000) return;
  enqueue({
    type: EventType.SECTION_VIEW,
    pageViewId: getCurrentPageViewId(),
    section,
    value: ms,
    ts: Date.now(),
  });
}

export function startSectionTracking(): () => void {
  const nodes = document.querySelectorAll("[data-section]");
  const observer = new IntersectionObserver(
    (entries) => {
      const now = Date.now();
      for (const entry of entries) {
        const section = entry.target.getAttribute("data-section");
        if (!section) continue;
        let st = states.get(section);
        if (!st) {
          st = { visibleSince: null, accumulatedMs: 0 };
          states.set(section, st);
        }
        const ratio = entry.intersectionRatio;
        const visible = ratio >= 0.5;
        if (visible && st.visibleSince == null) {
          st.visibleSince = now;
        } else if (!visible && st.visibleSince != null) {
          st.accumulatedMs += now - st.visibleSince;
          st.visibleSince = null;
          if (st.accumulatedMs >= 1000) {
            emitSectionView(section, st.accumulatedMs);
            st.accumulatedMs = 0;
          }
        }
      }
    },
    { threshold: [0, 0.5, 1] },
  );

  nodes.forEach((n) => observer.observe(n));

  const onHide = () => {
    const now = Date.now();
    states.forEach((st, section) => {
      if (st.visibleSince != null) {
        st.accumulatedMs += now - st.visibleSince;
        st.visibleSince = null;
      }
      if (st.accumulatedMs >= 1000) {
        emitSectionView(section, st.accumulatedMs);
        st.accumulatedMs = 0;
      }
    });
    flush();
  };

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") onHide();
  });
  window.addEventListener("pagehide", onHide);

  return () => {
    observer.disconnect();
    onHide();
  };
}
