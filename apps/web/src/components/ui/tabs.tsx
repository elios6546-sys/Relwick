"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export function Tabs({
  items,
  value,
  onChange,
  variant = "pill",
  getTrackName,
  label,
}: {
  items: Array<{ value: string; label: string }>;
  value: string;
  onChange: (v: string) => void;
  variant?: "pill" | "line";
  getTrackName?: (value: string) => string | undefined;
  label?: string;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const [ink, setInk] = useState<{ left: number; width: number } | null>(null);

  // L'indicateur glisse sous l'onglet actif ; on le remesure si la largeur change
  // (chargement de la police, redimensionnement).
  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const measure = () => {
      const btn = el.querySelector<HTMLButtonElement>('[role="tab"][aria-selected="true"]');
      if (btn) setInk({ left: btn.offsetLeft, width: btn.offsetWidth });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [value]);

  return (
    <div
      ref={listRef}
      className={cn("rw-tabs", variant === "pill" && "rw-tabs--pill")}
      role="tablist"
      aria-label={label}
    >
      {ink ? (
        <span className="rw-tabs__ink" aria-hidden="true" style={{ left: ink.left, width: ink.width }} />
      ) : null}
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          aria-selected={value === item.value}
          className="rw-tab"
          data-track={getTrackName?.(item.value)}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
