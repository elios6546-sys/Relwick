"use client";

import { useEffect } from "react";

const EASE = "cubic-bezier(.16,1,.3,1)";

/**
 * Révélation au scroll des éléments `[data-rv]` (fondu + montée de 28 px).
 * La valeur de l'attribut est le décalage en millisecondes.
 * Sans JavaScript ou avec « réduire les animations », tout reste visible.
 */
export function RevealOnScroll() {
  useEffect(() => {
    if (
      !("IntersectionObserver" in window) ||
      !Element.prototype.animate ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const pending = new Map<Element, Animation>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          pending.get(entry.target)?.play();
          pending.delete(entry.target);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    document.querySelectorAll<HTMLElement>("[data-rv]").forEach((el) => {
      const anim = el.animate(
        [
          { opacity: 0, transform: "translateY(28px)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 900, easing: EASE, delay: Number(el.dataset.rv) || 0, fill: "backwards" },
      );
      anim.pause();
      pending.set(el, anim);
      io.observe(el);
    });
    return () => {
      io.disconnect();
      pending.forEach((anim) => anim.cancel());
    };
  }, []);

  return null;
}
