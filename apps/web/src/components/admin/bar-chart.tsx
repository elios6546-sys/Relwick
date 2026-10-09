"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";

export interface BarPoint {
  key: string;
  label: string;
  /** Libellé complet affiché au survol (« lun. 6 oct. » / « 14 h »). */
  title: string;
  value: number;
}

export function BarChart({
  points,
  gap,
  onHover,
  unit = "visites",
}: {
  points: BarPoint[];
  gap: number;
  onHover?: (p: BarPoint | null) => void;
  unit?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...points.map((p) => p.value));
  const half = Math.round(max / 2);
  const lastIdx = points.length - 1;

  const set = (i: number | null) => {
    setHover(i);
    onHover?.(i == null ? null : (points[i] ?? null));
  };

  return (
    <div className="dash-chart" role="img" aria-label={`${unit} par période`}>
      <div className="dash-chart__grid" style={{ top: 0 }}>
        <span className="dash-chart__gridlabel">{formatNumber(max)}</span>
      </div>
      <div className="dash-chart__grid" style={{ top: "calc((100% - 22px) / 2)" }}>
        <span className="dash-chart__gridlabel">{formatNumber(half)}</span>
      </div>
      <div className="dash-chart__grid" style={{ top: "calc(100% - 22px)" }}>
        <span className="dash-chart__gridlabel">0</span>
      </div>

      <div className="dash-chart__bars" style={{ gap }} onMouseLeave={() => set(null)}>
        {points.map((p, i) => (
          <div
            key={p.key}
            className="dash-chart__bar"
            onMouseEnter={() => set(i)}
            onFocus={() => set(i)}
            onBlur={() => set(null)}
            tabIndex={0}
            aria-label={`${p.title} : ${formatNumber(p.value)} ${unit}`}
          >
            <div
              className={cn(
                "dash-chart__fill",
                (hover == null ? i === lastIdx : hover === i) && "dash-chart__fill--hi",
              )}
              style={{
                height: `${Math.max(1, (p.value / max) * 100)}%`,
                animationDelay: `${i * 30}ms`,
              }}
            />
          </div>
        ))}
      </div>

      <div className="dash-chart__labels" style={{ gap }}>
        {points.map((p) => (
          <span key={p.key} className="dash-chart__xlabel">
            {p.label}
          </span>
        ))}
      </div>
    </div>
  );
}
